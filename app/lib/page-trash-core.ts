// Trash/restore for single event pages: an owner deletes a page, it waits
// here for PAGE_TRASH_DAYS (restorable by an admin), then a daily job removes
// it and its files for good. Like trash-core, free of app imports so it can
// be exercised against scratch tables; callers own the transaction.

import { insertRows, tableExists, type DbClient, type Row } from './trash-core';

export const PAGE_TRASH_DAYS = 30;

// Everything hanging off a page, parents first: restore inserts in this
// order, deletion runs in reverse. Includes the tables that ON DELETE
// CASCADE would otherwise drop without a trace.
export const PAGE_TRASH_TABLES = [
  'user_page_settings',
  'event_gallery',
  'event_guests',
  'guests_photos',
  'guests_songs',
  'event_program',
  'page_custom_sections',
  'page_sponsors',
  'page_potluck',
  'page_gift_exchange',
  'page_gift_exclusions',
  'event_reminder_deliveries',
];

export type PageSnapshot = { version: 1; tables: Record<string, Row[]> };

export async function buildPageSnapshot(client: DbClient, pageId: number): Promise<PageSnapshot> {
  const tables: Record<string, Row[]> = {};
  const page = await client.query('SELECT to_jsonb(t) AS j FROM user_page t WHERE id = $1', [pageId]);
  tables.user_page = page.rows.map((r) => r.j as Row);
  for (const table of PAGE_TRASH_TABLES) {
    if (!(await tableExists(client, table))) {
      tables[table] = [];
      continue;
    }
    const r = await client.query(`SELECT to_jsonb(t) AS j FROM ${table} t WHERE user_page_id = $1`, [pageId]);
    tables[table] = r.rows.map((row) => row.j as Row);
  }
  return { version: 1, tables };
}

// Archive the page with everything on it and take it off the live tables.
// The owner's account and other pages are untouched; uploaded files stay in
// storage until the trash is emptied, so a restore has no broken images.
export async function movePageToTrash(
  client: DbClient,
  pageId: number,
  info: { userId: string; deletedBy: string },
): Promise<{ trashId: number; slug: string }> {
  const snapshot = await buildPageSnapshot(client, pageId);
  const page = snapshot.tables.user_page[0];
  if (!page) throw new Error('Page not found.');
  if (String(page.user_id) !== info.userId) throw new Error('Page not found.');

  const r = await client.query(
    `INSERT INTO deleted_pages
       (page_id, user_id, owner_email, slug, heading, custom_domain, plan_type, deleted_by, purge_after, snapshot)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() + ($9::int * INTERVAL '1 day'), $10::jsonb)
     RETURNING id`,
    [
      pageId, info.userId, page.user_email ?? null, page.slug, page.heading ?? null, page.custom_domain ?? null,
      page.plan_type ?? null, info.deletedBy, PAGE_TRASH_DAYS, JSON.stringify(snapshot),
    ],
  );

  for (const table of [...PAGE_TRASH_TABLES].reverse()) {
    if (!(await tableExists(client, table))) continue;
    await client.query(`DELETE FROM ${table} WHERE user_page_id = $1`, [pageId]);
  }
  const gone = await client.query('DELETE FROM user_page WHERE id = $1 RETURNING id', [pageId]);
  if (!gone.rows.length) throw new Error('Page could not be removed.');
  return { trashId: Number(r.rows[0].id), slug: String(page.slug) };
}

// Reasons a restore would collide with what exists now.
export async function findPageRestoreConflicts(client: DbClient, snapshot: PageSnapshot): Promise<string[]> {
  const page = snapshot.tables.user_page?.[0];
  if (!page) return ['The archive has no page in it.'];
  const conflicts: string[] = [];

  const owner = await client.query('SELECT 1 FROM users WHERE id = $1::uuid', [page.user_id]);
  if (!owner.rows.length) conflicts.push('The owner’s account no longer exists (restore the user from the trash first).');

  const taken = await client.query(
    'SELECT slug FROM user_page WHERE id = $1::int OR slug = $2 OR (custom_domain IS NOT NULL AND custom_domain = $3) LIMIT 1',
    [page.id, page.slug, page.custom_domain ?? null],
  );
  if (taken.rows.length) {
    conflicts.push(`The page address "${String(page.slug)}" (or its custom domain) is now used by another page.`);
  }
  return conflicts;
}

export type PageRestoreResult =
  | { ok: true; slug: string; ownerEmail: string }
  | { ok: false; notFound: true }
  | { ok: false; conflicts: string[] };

export async function restorePageFromTrash(client: DbClient, trashId: number): Promise<PageRestoreResult> {
  const r = await client.query(
    'SELECT slug, owner_email, snapshot FROM deleted_pages WHERE id = $1 AND restored_at IS NULL FOR UPDATE',
    [trashId],
  );
  const trashed = r.rows[0];
  if (!trashed) return { ok: false, notFound: true };

  const snapshot = trashed.snapshot as PageSnapshot;
  const conflicts = await findPageRestoreConflicts(client, snapshot);
  if (conflicts.length) return { ok: false, conflicts };

  await insertRows(client, 'user_page', snapshot.tables.user_page);
  for (const table of PAGE_TRASH_TABLES) {
    await insertRows(client, table, snapshot.tables[table] ?? []);
  }
  // Keep the record that it was restored, but not a second copy of the
  // page's guest data.
  await client.query(`UPDATE deleted_pages SET restored_at = NOW(), snapshot = '{}'::jsonb WHERE id = $1`, [trashId]);
  return { ok: true, slug: String(trashed.slug), ownerEmail: String(trashed.owner_email ?? '') };
}
