import { sql } from '@vercel/postgres';
import { del } from '@vercel/blob';
import { collectBlobUrls, type Snapshot } from '@/app/lib/trash-core';
import type { PageSnapshot } from '@/app/lib/page-trash-core';
import { removeVercelDomain } from '@/app/lib/purge';

// Emptying the page trash: the one irreversible step for a deleted page.
// Files go first; if any can't be deleted the record is kept, so the page
// can still be restored and this simply runs again next time.

export type PagePurgeResult =
  | { ok: true; slug: string; files: number }
  | { ok: false; error: string; notFound?: true };

export async function purgeDeletedPage(trashId: number, purgedBy: string): Promise<PagePurgeResult> {
  const found = await sql`
    SELECT page_id, user_id, owner_email, slug, custom_domain, deleted_at, snapshot
    FROM deleted_pages WHERE id = ${trashId} AND restored_at IS NULL
  `;
  const row = found.rows[0];
  if (!row) return { ok: false, error: 'This page is no longer in the trash.', notFound: true };

  const snapshot = row.snapshot as PageSnapshot;
  const urls = collectBlobUrls(snapshot as Snapshot);
  try {
    for (let i = 0; i < urls.length; i += 50) await del(urls.slice(i, i + 50));
  } catch (err) {
    console.error('Page trash: blob deletion failed', trashId, err);
    return { ok: false, error: `Could not delete its files from storage (${err instanceof Error ? err.message : 'unknown error'}). The page is still in the trash — try again.` };
  }

  // Detach the custom domain unless another live page uses it now.
  if (row.custom_domain) {
    const inUse = await sql`SELECT 1 FROM user_page WHERE custom_domain = ${row.custom_domain} LIMIT 1`;
    if (!inUse.rows.length) await removeVercelDomain(String(row.custom_domain));
  }

  const n = (t: string) => snapshot.tables?.[t]?.length ?? 0;
  try {
    // Audit trail (no guest data), shared with the offline-page purge.
    await sql`
      INSERT INTO page_purges (page_id, slug, owner_user_id, owner_email, status_at_purge, offline_since,
                               guests, photos, gallery_images, songs, files_deleted, purged_by)
      VALUES (${row.page_id}, ${row.slug}, ${row.user_id}, ${row.owner_email}, 'deleted by owner', ${row.deleted_at},
              ${n('event_guests')}, ${n('guests_photos')}, ${n('event_gallery')}, ${n('guests_songs')}, ${urls.length}, ${purgedBy})
    `.catch((err) => console.error('Page trash: audit row failed', trashId, err));
    await sql`DELETE FROM deleted_pages WHERE id = ${trashId}`;
  } catch (err) {
    console.error('Page trash: record deletion failed', trashId, err);
    return { ok: false, error: `Files were deleted but the trash record could not be removed (${err instanceof Error ? err.message : 'unknown error'}). Try again.` };
  }
  return { ok: true, slug: String(row.slug), files: urls.length };
}

// Daily job: everything whose 30 days are up.
export async function purgeExpiredPages(limit = 50): Promise<{ purged: string[]; failed: { id: number; error: string }[] }> {
  const due = await sql`
    SELECT id FROM deleted_pages
    WHERE restored_at IS NULL AND purge_after < NOW()
    ORDER BY purge_after ASC
    LIMIT ${limit}
  `;
  const purged: string[] = [];
  const failed: { id: number; error: string }[] = [];
  for (const { id } of due.rows) {
    const result = await purgeDeletedPage(Number(id), 'auto (30 days)');
    if (result.ok) purged.push(result.slug);
    else if (!result.notFound) failed.push({ id: Number(id), error: result.error });
  }
  return { purged, failed };
}
