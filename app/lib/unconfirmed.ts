import { db, sql } from '@vercel/postgres';
import { isSuperAdmin } from '@/app/lib/admin';
import { checkUserDeletable } from '@/app/lib/subscriptions';
import { moveUserToTrash, runInTransaction } from '@/app/lib/trash-core';
import { PURGE_BATCH_LIMIT, UNCONFIRMED_AFTER_DAYS, UNCONFIRMED_RECENT_DAYS } from '@/app/lib/retention';

// Accounts that never confirmed their email and never published a page, long
// after signing up: the admin Cleanup screen moves them (with their drafts)
// to the trash, where they can still be restored.

export type UnconfirmedAccount = {
  id: string;
  email: string;
  signed_up: Date | string;
  last_dashboard_at: Date | string | null;
  pages: { heading: string | null; slug: string }[];
  guest_count: number;
  photo_count: number;
};

// An account qualifies only when ALL of these hold:
//  - its email was never confirmed (email_verified_at IS NULL)
//  - it signed up more than $1 days ago (users.date, or its first page)
//  - it has no page other than drafts (unconfirmed accounts can't publish)
//  - nothing on it says 'paid' and no Stripe customer is on file
//  - its owner hasn't opened the dashboard in the last $2 days
const WHERE = `
  u.email_verified_at IS NULL
  AND COALESCE(u.date::date, (SELECT min(created_at)::date FROM user_page WHERE user_id = u.id)) < CURRENT_DATE - $1::int
  AND NOT EXISTS (SELECT 1 FROM user_page WHERE user_id = u.id AND COALESCE(status, 'active') <> 'draft')
  AND NOT EXISTS (SELECT 1 FROM user_page WHERE user_id = u.id AND (COALESCE(plan_type, 'free') = 'paid' OR stripe_customer_id IS NOT NULL))
  AND NOT EXISTS (SELECT 1 FROM user_plans WHERE user_id = u.id::text AND (COALESCE(plan_type, 'free') = 'paid' OR stripe_customer_id IS NOT NULL))
  AND (u.last_dashboard_at IS NULL OR u.last_dashboard_at < NOW() - ($2::int * INTERVAL '1 day'))
`;

const LIST_SQL = `
  SELECT u.id::text AS id, u.email,
         COALESCE(u.date::date, (SELECT min(created_at)::date FROM user_page WHERE user_id = u.id)) AS signed_up,
         u.last_dashboard_at,
         COALESCE((SELECT json_agg(json_build_object('heading', heading, 'slug', slug) ORDER BY id)
                   FROM user_page WHERE user_id = u.id), '[]'::json) AS pages,
         (SELECT count(*)::int FROM event_guests  WHERE user_page_id IN (SELECT id FROM user_page WHERE user_id = u.id)) AS guest_count,
         (SELECT count(*)::int FROM event_gallery WHERE user_page_id IN (SELECT id FROM user_page WHERE user_id = u.id)) AS photo_count
  FROM users u
  WHERE ${WHERE}
    AND ($3::uuid[] IS NULL OR u.id = ANY($3::uuid[]))
  ORDER BY signed_up ASC, u.email
  LIMIT $4
`;

const COUNT_SQL = `SELECT count(*)::int AS n FROM users u WHERE ${WHERE}`;

const notAdmin = (rows: UnconfirmedAccount[]) => rows.filter((r) => !isSuperAdmin(r.email));

export async function previewUnconfirmed(): Promise<{ accounts: UnconfirmedAccount[]; total: number; error: string | null }> {
  try {
    const [list, count] = await Promise.all([
      sql.query<UnconfirmedAccount>(LIST_SQL, [UNCONFIRMED_AFTER_DAYS, UNCONFIRMED_RECENT_DAYS, null, PURGE_BATCH_LIMIT]),
      sql.query<{ n: number }>(COUNT_SQL, [UNCONFIRMED_AFTER_DAYS, UNCONFIRMED_RECENT_DAYS]),
    ]);
    return { accounts: notAdmin(list.rows), total: count.rows[0]?.n ?? 0, error: null };
  } catch (error) {
    console.error('Unconfirmed accounts preview failed:', error);
    return { accounts: [], total: 0, error: error instanceof Error ? error.message : 'Query failed' };
  }
}

export type TrashOutcome = { userId: string; email: string | null; trashed: boolean; reason?: string };

// Moves the requested accounts to the trash — but only those that STILL
// qualify right now (one that confirmed its email, published, paid or came
// back since the admin looked is left alone). Each account is handled on its
// own; one failure never stops the rest.
export async function trashUnconfirmed(userIds: string[], adminEmail: string): Promise<TrashOutcome[]> {
  const still = await sql.query<UnconfirmedAccount>(LIST_SQL, [UNCONFIRMED_AFTER_DAYS, UNCONFIRMED_RECENT_DAYS, userIds, PURGE_BATCH_LIMIT]);
  const byId = new Map(notAdmin(still.rows).map((a) => [a.id, a]));
  const outcomes: TrashOutcome[] = [];
  const client = await db.connect();
  try {
    for (const userId of userIds) {
      const a = byId.get(userId);
      if (!a) {
        outcomes.push({ userId, email: null, trashed: false, reason: 'No longer qualifies (confirmed, published, paid, active or already removed).' });
        continue;
      }
      const check = await checkUserDeletable(userId);
      if (!check.ok) {
        outcomes.push({ userId, email: a.email, trashed: false, reason: check.reason });
        continue;
      }
      try {
        await runInTransaction(client, () => moveUserToTrash(client, userId, adminEmail));
        outcomes.push({ userId, email: a.email, trashed: true });
      } catch (error) {
        console.error('Moving unconfirmed account to trash failed:', userId, error);
        outcomes.push({ userId, email: a.email, trashed: false, reason: `Unexpected error (${error instanceof Error ? error.message : 'unknown'}); nothing was changed.` });
      }
    }
  } finally {
    client.release();
  }
  return outcomes;
}
