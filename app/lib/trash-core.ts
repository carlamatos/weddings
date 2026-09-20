// Trash/restore for whole users. Deliberately free of app imports so it can
// be exercised against scratch tables. Callers own the transaction (see
// runInTransaction) so several steps commit or roll back together.

export type Row = Record<string, unknown>;

export interface DbClient {
  query(text: string, params?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>;
}

type TableSpec = { table: string; where: string };

const PAGE_IDS = '(SELECT id FROM user_page WHERE user_id = $1::uuid)';

// Parents first: restore inserts in this order, deletion runs in reverse.
export const TRASH_TABLES: TableSpec[] = [
  { table: 'users', where: 'id = $1::uuid' },
  { table: 'user_plans', where: 'user_id = $1::text' },
  { table: 'user_cancellations', where: 'user_id = $1::text' },
  { table: 'user_page', where: 'user_id = $1::uuid' },
  { table: 'user_page_settings', where: `user_page_id IN ${PAGE_IDS}` },
  { table: 'event_gallery', where: `user_page_id IN ${PAGE_IDS}` },
  { table: 'event_guests', where: `user_page_id IN ${PAGE_IDS}` },
  { table: 'guests_photos', where: `user_page_id IN ${PAGE_IDS}` },
  { table: 'guests_songs', where: `user_page_id IN ${PAGE_IDS}` },
];

export type Snapshot = { version: 1; tables: Record<string, Row[]> };

export async function runInTransaction<T>(client: DbClient, fn: () => Promise<T>): Promise<T> {
  await client.query('BEGIN');
  try {
    const result = await fn();
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  }
}

async function tableExists(client: DbClient, table: string): Promise<boolean> {
  const r = await client.query('SELECT to_regclass($1::text) IS NOT NULL AS ok', [table]);
  return r.rows[0]?.ok === true;
}

async function tableColumns(client: DbClient, table: string): Promise<Set<string>> {
  const r = await client.query(
    'SELECT attname FROM pg_attribute WHERE attrelid = to_regclass($1::text) AND attnum > 0 AND NOT attisdropped',
    [table],
  );
  return new Set(r.rows.map((row) => String(row.attname)));
}

// Every row belonging to the user, as JSON. Tables that don't exist yet in
// this environment (e.g. user_cancellations before db-setup) are skipped.
export async function buildSnapshot(client: DbClient, userId: string): Promise<Snapshot> {
  const tables: Record<string, Row[]> = {};
  for (const { table, where } of TRASH_TABLES) {
    if (!(await tableExists(client, table))) {
      tables[table] = [];
      continue;
    }
    const r = await client.query(`SELECT to_jsonb(t) AS j FROM ${table} t WHERE ${where}`, [userId]);
    tables[table] = r.rows.map((row) => row.j as Row);
  }
  return { version: 1, tables };
}

export async function deleteLiveRows(client: DbClient, userId: string): Promise<void> {
  for (const { table, where } of [...TRASH_TABLES].reverse()) {
    if (!(await tableExists(client, table))) continue;
    await client.query(`DELETE FROM ${table} WHERE ${where}`, [userId]);
  }
}

// Archive the user's data and remove it from the live tables. Blob files are
// intentionally left alone so a restore doesn't come back with broken images.
export async function moveUserToTrash(client: DbClient, userId: string, deletedBy: string): Promise<Snapshot> {
  const snapshot = await buildSnapshot(client, userId);
  const user = snapshot.tables.users[0];
  if (!user) throw new Error('User not found.');

  await client.query(
    'INSERT INTO deleted_users (user_id, email, name, deleted_by, snapshot) VALUES ($1, $2, $3, $4, $5::jsonb)',
    [userId, user.email, user.name ?? null, deletedBy, JSON.stringify(snapshot)],
  );
  await deleteLiveRows(client, userId);

  const stillThere = await client.query('SELECT 1 FROM users WHERE id = $1::uuid', [userId]);
  if (stillThere.rows.length) throw new Error('User could not be removed.');
  return snapshot;
}

// Things that would make a restore collide with data created since deletion.
export async function findRestoreConflicts(client: DbClient, snapshot: Snapshot): Promise<string[]> {
  const conflicts: string[] = [];

  const user = snapshot.tables.users?.[0];
  if (user) {
    const r = await client.query('SELECT 1 FROM users WHERE id = $1::uuid OR lower(email) = lower($2) LIMIT 1', [
      user.id,
      user.email,
    ]);
    if (r.rows.length) {
      conflicts.push(
        `An account with the email ${String(user.email)} already exists (they may have signed up again after being deleted).`,
      );
    }
  }

  for (const page of snapshot.tables.user_page ?? []) {
    const r = await client.query(
      'SELECT 1 FROM user_page WHERE id = $1::int OR slug = $2 OR (custom_domain IS NOT NULL AND custom_domain = $3) LIMIT 1',
      [page.id, page.slug, page.custom_domain ?? null],
    );
    if (r.rows.length) {
      conflicts.push(`The page address "${String(page.slug)}" (or its custom domain) is now used by another page.`);
    }
  }

  return conflicts;
}

// Re-insert every archived row with its original id. Only columns that still
// exist are inserted, so columns added since deletion fall back to their
// defaults instead of failing on NOT NULL.
export async function restoreSnapshot(client: DbClient, snapshot: Snapshot): Promise<void> {
  for (const { table } of TRASH_TABLES) {
    const rows = snapshot.tables[table] ?? [];
    if (!rows.length) continue;
    if (!(await tableExists(client, table))) {
      throw new Error(`Cannot restore: table ${table} no longer exists.`);
    }
    const existing = await tableColumns(client, table);
    const keys = Object.keys(rows[0]).filter((k) => existing.has(k));
    if (!keys.length) continue;
    const list = keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(', ');
    await client.query(
      `INSERT INTO ${table} (${list}) SELECT ${list} FROM json_populate_recordset(NULL::${table}, $1::json)`,
      [JSON.stringify(rows)],
    );
  }
}

export type RestoreResult =
  | { ok: true; email: string }
  | { ok: false; notFound: true }
  | { ok: false; conflicts: string[] };

export async function restoreFromTrash(client: DbClient, trashId: number): Promise<RestoreResult> {
  const r = await client.query(
    'SELECT email, snapshot FROM deleted_users WHERE id = $1 AND restored_at IS NULL FOR UPDATE',
    [trashId],
  );
  const trashed = r.rows[0];
  if (!trashed) return { ok: false, notFound: true };

  const snapshot = trashed.snapshot as Snapshot;
  const conflicts = await findRestoreConflicts(client, snapshot);
  if (conflicts.length) return { ok: false, conflicts };

  await restoreSnapshot(client, snapshot);
  await client.query('UPDATE deleted_users SET restored_at = NOW() WHERE id = $1', [trashId]);
  return { ok: true, email: String(trashed.email) };
}

// Every Vercel Blob URL mentioned anywhere in the snapshot (guest photos,
// gallery images, banner, registry image, ...), so permanent deletion can
// remove the actual files.
const BLOB_URL_RE = /https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^"\\\s]+/gi;

export function collectBlobUrls(snapshot: Snapshot): string[] {
  return [...new Set(JSON.stringify(snapshot).match(BLOB_URL_RE) ?? [])];
}
