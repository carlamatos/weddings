import { db, sql, type VercelPoolClient } from '@vercel/postgres';
import { del } from '@vercel/blob';
import { fetchLiveSubscription } from '@/app/lib/subscriptions';
import { collectBlobUrls, runInTransaction, type Snapshot } from '@/app/lib/trash-core';
import {
  CANDIDATES_SQL,
  CANDIDATE_COUNT_SQL,
  deletePageRows,
  findPurgeCandidates,
  loadPageContents,
  recordPurge,
  type PurgeCandidate,
} from '@/app/lib/purge-core';
import { OFFLINE_RETENTION_MONTHS, PURGE_BATCH_LIMIT } from '@/app/lib/retention';

export type PurgeOutcome = {
  pageId: number;
  slug: string | null;
  purged: boolean;
  reason?: string;
  files: number;
};

// What the admin sees before confirming. `error` is set when the schema setup
// hasn't been run yet (the status_changed_at column doesn't exist).
export async function previewPurge(): Promise<{
  candidates: PurgeCandidate[];
  total: number;
  error: string | null;
}> {
  try {
    const [list, count] = await Promise.all([
      sql.query<PurgeCandidate>(CANDIDATES_SQL, [OFFLINE_RETENTION_MONTHS, null, PURGE_BATCH_LIMIT]),
      sql.query<{ n: number }>(CANDIDATE_COUNT_SQL, [OFFLINE_RETENTION_MONTHS]),
    ]);
    return { candidates: list.rows, total: count.rows[0]?.n ?? 0, error: null };
  } catch (error) {
    console.error('Purge preview failed:', error);
    return { candidates: [], total: 0, error: error instanceof Error ? error.message : 'Query failed' };
  }
}

// Best effort: detach a purged page's custom domain from the Vercel project so
// it isn't left pointing at nothing. Never blocks the purge.
async function removeVercelDomain(domain: string): Promise<void> {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!projectId || !token) return;
  try {
    const qs = teamId ? `?teamId=${teamId}` : '';
    await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains/${domain}${qs}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Could not remove domain from Vercel:', domain, error);
  }
}

// Permanently deletes the requested pages — but only those that STILL qualify
// right now, so a page that was reactivated, upgraded or already purged since
// the admin looked at the preview is left alone. Each page is handled on its
// own; one failure never stops the rest and never leaves a page half-deleted.
export async function purgePages(pageIds: number[], adminEmail: string): Promise<PurgeOutcome[]> {
  const client = await db.connect();
  try {
    const candidates = await findPurgeCandidates(client, {
      months: OFFLINE_RETENTION_MONTHS,
      ids: pageIds,
      limit: PURGE_BATCH_LIMIT,
    });
    const byId = new Map(candidates.map((c) => [Number(c.id), c]));
    const outcomes: PurgeOutcome[] = [];

    for (const pageId of pageIds) {
      const c = byId.get(pageId);
      if (!c) {
        outcomes.push({
          pageId,
          slug: null,
          purged: false,
          files: 0,
          reason: 'No longer qualifies (reactivated, upgraded, or already deleted).',
        });
        continue;
      }
      outcomes.push(await purgeOne(client, c, adminEmail));
    }
    return outcomes;
  } finally {
    client.release();
  }
}

async function purgeOne(
  client: VercelPoolClient,
  c: PurgeCandidate,
  adminEmail: string,
): Promise<PurgeOutcome> {
  const skip = (reason: string): PurgeOutcome => ({ pageId: Number(c.id), slug: c.slug, purged: false, files: 0, reason });

  try {
    // Never delete for someone who may be paying: re-verify with Stripe itself.
    if (c.stripe_customer_id) {
      let live;
      try {
        live = await fetchLiveSubscription([c.stripe_customer_id]);
      } catch (error) {
        console.error('Stripe check before purge failed:', error);
        return skip('Could not verify the owner\'s subscription with Stripe, so it was skipped.');
      }
      if (live.hasLiveSubscription) return skip('The owner has an active Stripe subscription.');
    }

    // Storage files first: if any can't be removed the page stays, and can be retried.
    const contents = await loadPageContents(client, Number(c.id));
    const urls = collectBlobUrls({ version: 1, tables: contents } as Snapshot);
    try {
      for (let i = 0; i < urls.length; i += 50) await del(urls.slice(i, i + 50));
    } catch (error) {
      console.error('Blob deletion failed during purge:', error);
      return skip(`Could not delete its files from storage (${error instanceof Error ? error.message : 'unknown error'}).`);
    }

    await runInTransaction(client, async () => {
      await deletePageRows(client, Number(c.id));
      await recordPurge(client, c, { purgedBy: adminEmail, filesDeleted: urls.length });
    });

    if (c.custom_domain) await removeVercelDomain(c.custom_domain);
    return { pageId: Number(c.id), slug: c.slug, purged: true, files: urls.length };
  } catch (error) {
    console.error('Purge failed for page', c.id, error);
    return skip(`Unexpected error (${error instanceof Error ? error.message : 'unknown'}); nothing was deleted.`);
  }
}
