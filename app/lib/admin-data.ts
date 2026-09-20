import { sql } from '@vercel/postgres';
import type { QueryResultRow } from '@vercel/postgres';

export const ADMIN_PAGE_SIZE = 25;

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  provider: string | null;
  date: Date | string | null;
  plan_type: string;
  stripe_customer_id: string | null;
  current_period_end: Date | string | null;
  cancel_at_period_end: boolean;
  page_id: number | null;
  page_slug: string | null;
  page_heading: string | null;
  page_status: string | null;
};

export type AdminPageRow = {
  id: number;
  slug: string;
  heading: string | null;
  user_id: string;
  user_email: string;
  created_at: Date | string | null;
  event_date: Date | string | null;
  custom_domain: string | null;
  plan_type: string;
  status: string;
  stripe_customer_id: string | null;
  current_period_end: Date | string | null;
  cancel_at_period_end: boolean;
};

export type TrashedUserRow = {
  id: number;
  user_id: string;
  email: string;
  name: string | null;
  deleted_at: Date | string;
  deleted_by: string | null;
  page_slug: string | null;
  photo_count: number;
  gallery_count: number;
  guest_count: number;
};

export type PlanFilter = 'all' | 'free' | 'paid';
export type StatusFilter = 'all' | 'active' | 'inactive';
export type SortOrder = 'newest' | 'oldest';

// SQL lives in plain strings so it can also be run directly in tests.
export const USERS_SQL = `
  SELECT u.id, u.name, u.email, u.provider, u.date,
         COALESCE(pl.plan_type, p.plan_type, 'free') AS plan_type,
         COALESCE(pl.stripe_customer_id, p.stripe_customer_id) AS stripe_customer_id,
         pl.current_period_end,
         COALESCE(pl.cancel_at_period_end, false) AS cancel_at_period_end,
         p.id AS page_id, p.slug AS page_slug, p.heading AS page_heading,
         COALESCE(p.status, 'active') AS page_status
  FROM users u
  LEFT JOIN user_plans pl ON pl.user_id = u.id::text
  LEFT JOIN LATERAL (
    SELECT id, slug, heading, status, plan_type, stripe_customer_id
    FROM user_page WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
  ) p ON true
  ORDER BY u.date DESC NULLS LAST, u.email
  LIMIT $1 OFFSET $2
`;

export const PAGES_SQL = `
  SELECT p.id, p.slug, p.heading, p.user_id, p.user_email, p.created_at, p.event_date, p.custom_domain,
         COALESCE(p.plan_type, 'free') AS plan_type,
         COALESCE(p.status, 'active') AS status,
         COALESCE(pl.stripe_customer_id, p.stripe_customer_id) AS stripe_customer_id,
         pl.current_period_end,
         COALESCE(pl.cancel_at_period_end, false) AS cancel_at_period_end
  FROM user_page p
  LEFT JOIN user_plans pl ON pl.user_id = p.user_id::text
  WHERE ($1 = 'all' OR COALESCE(p.plan_type, 'free') = $1)
    AND ($2 = 'all' OR COALESCE(p.status, 'active') = $2)
  ORDER BY (CASE WHEN $3 = 'oldest' THEN p.created_at END) ASC NULLS LAST, p.created_at DESC
  LIMIT $4 OFFSET $5
`;

export const TRASH_SQL = `
  SELECT id, user_id, email, name, deleted_at, deleted_by,
         snapshot #>> '{tables,user_page,0,slug}' AS page_slug,
         COALESCE(jsonb_array_length(snapshot #> '{tables,guests_photos}'), 0) AS photo_count,
         COALESCE(jsonb_array_length(snapshot #> '{tables,event_gallery}'), 0) AS gallery_count,
         COALESCE(jsonb_array_length(snapshot #> '{tables,event_guests}'), 0) AS guest_count
  FROM deleted_users
  WHERE restored_at IS NULL
  ORDER BY deleted_at DESC
  LIMIT $1 OFFSET $2
`;

export const USERS_COUNT_SQL = `SELECT count(*)::int AS n FROM users`;

export const PAGES_COUNT_SQL = `
  SELECT count(*)::int AS n FROM user_page p
  WHERE ($1 = 'all' OR COALESCE(p.plan_type, 'free') = $1)
    AND ($2 = 'all' OR COALESCE(p.status, 'active') = $2)
`;

export const TRASH_COUNT_SQL = `SELECT count(*)::int AS n FROM deleted_users WHERE restored_at IS NULL`;

type Listed<T> = { rows: T[]; hasMore: boolean; error: string | null };

// Fetch one extra row to learn whether there is another page.
async function list<T extends QueryResultRow>(text: string, params: unknown[], offset: number): Promise<Listed<T>> {
  try {
    const result = await sql.query<T>(text, [...params, ADMIN_PAGE_SIZE + 1, offset]);
    const hasMore = result.rows.length > ADMIN_PAGE_SIZE;
    return { rows: hasMore ? result.rows.slice(0, ADMIN_PAGE_SIZE) : result.rows, hasMore, error: null };
  } catch (error) {
    console.error('Admin list query failed:', error);
    return {
      rows: [],
      hasMore: false,
      error: error instanceof Error ? error.message : 'Query failed',
    };
  }
}

export async function fetchAllUsers(offset = 0) {
  return list<AdminUserRow>(USERS_SQL, [], offset);
}

export async function fetchAllUserPages(opts: {
  plan: PlanFilter;
  status: StatusFilter;
  sort: SortOrder;
  offset?: number;
}) {
  return list<AdminPageRow>(PAGES_SQL, [opts.plan, opts.status, opts.sort], opts.offset ?? 0);
}

export async function fetchTrashedUsers(offset = 0) {
  return list<TrashedUserRow>(TRASH_SQL, [], offset);
}

// Totals shown above each table. null means the count couldn't be read
// (e.g. schema setup not run yet) — the list itself reports the error.
async function count(text: string, params: unknown[] = []): Promise<number | null> {
  try {
    const result = await sql.query<{ n: number }>(text, params);
    return result.rows[0]?.n ?? 0;
  } catch {
    return null;
  }
}

export const countUsers = () => count(USERS_COUNT_SQL);
export const countTrashedUsers = () => count(TRASH_COUNT_SQL);
export const countUserPages = (plan: PlanFilter = 'all', status: StatusFilter = 'all') =>
  count(PAGES_COUNT_SQL, [plan, status]);
