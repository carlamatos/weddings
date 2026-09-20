// Purging long-offline pages of free-plan owners. Deliberately free of runtime
// imports so it can be exercised against scratch tables. Callers own the
// transaction and the side effects (storage files, Stripe check, domains).

export type Row = Record<string, unknown>;

export interface DbClient {
  query(text: string, params?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>;
}

export type PurgeCandidate = {
  id: number;
  slug: string;
  heading: string | null;
  user_id: string;
  owner_email: string;
  status: string;
  offline_since: Date | string;
  stripe_customer_id: string | null;
  custom_domain: string | null;
  guest_count: number;
  photo_count: number;
  gallery_count: number;
  song_count: number;
};

// A page qualifies only when ALL of these hold:
//  - it is offline (any status other than 'active': inactive / paused / deleted)
//  - we know when it went offline (status_changed_at) and that was more than
//    N months ago. No timestamp = never eligible (fail safe).
//  - neither the owner's plan nor the page's copy of it says 'paid'
//    (either one being 'paid' protects it).
export const CANDIDATES_SQL = `
  SELECT p.id, p.slug, p.heading, p.user_id::text AS user_id, p.user_email AS owner_email,
         COALESCE(p.status, 'active') AS status,
         p.status_changed_at AS offline_since,
         COALESCE(pl.stripe_customer_id, p.stripe_customer_id) AS stripe_customer_id,
         p.custom_domain,
         (SELECT count(*)::int FROM event_guests   WHERE user_page_id = p.id) AS guest_count,
         (SELECT count(*)::int FROM guests_photos  WHERE user_page_id = p.id) AS photo_count,
         (SELECT count(*)::int FROM event_gallery  WHERE user_page_id = p.id) AS gallery_count,
         (SELECT count(*)::int FROM guests_songs   WHERE user_page_id = p.id) AS song_count
  FROM user_page p
  LEFT JOIN user_plans pl ON pl.user_id = p.user_id::text
  WHERE COALESCE(p.status, 'active') <> 'active'
    AND p.status_changed_at IS NOT NULL
    AND p.status_changed_at < NOW() - ($1::int * INTERVAL '1 month')
    AND COALESCE(pl.plan_type, 'free') <> 'paid'
    AND COALESCE(p.plan_type, 'free') <> 'paid'
    AND ($2::int[] IS NULL OR p.id = ANY($2::int[]))
  ORDER BY p.status_changed_at ASC, p.id ASC
  LIMIT $3
`;

export const CANDIDATE_COUNT_SQL = `
  SELECT count(*)::int AS n
  FROM user_page p
  LEFT JOIN user_plans pl ON pl.user_id = p.user_id::text
  WHERE COALESCE(p.status, 'active') <> 'active'
    AND p.status_changed_at IS NOT NULL
    AND p.status_changed_at < NOW() - ($1::int * INTERVAL '1 month')
    AND COALESCE(pl.plan_type, 'free') <> 'paid'
    AND COALESCE(p.plan_type, 'free') <> 'paid'
`;

// ids = restrict to these pages (they must STILL qualify); null = any qualifying page.
export async function findPurgeCandidates(
  client: DbClient,
  opts: { months: number; ids: number[] | null; limit: number },
): Promise<PurgeCandidate[]> {
  const r = await client.query(CANDIDATES_SQL, [opts.months, opts.ids, opts.limit]);
  return r.rows as unknown as PurgeCandidate[];
}

// Everything the page owns, as JSON — used to find its storage files and to
// record what was removed.
export async function loadPageContents(client: DbClient, pageId: number): Promise<Record<string, Row[]>> {
  const out: Record<string, Row[]> = {};
  const page = await client.query('SELECT to_jsonb(t) AS j FROM user_page t WHERE id = $1', [pageId]);
  out.user_page = page.rows.map((row) => row.j as Row);
  for (const table of ['user_page_settings', 'event_gallery', 'event_guests', 'guests_photos', 'guests_songs']) {
    const r = await client.query(`SELECT to_jsonb(t) AS j FROM ${table} t WHERE user_page_id = $1`, [pageId]);
    out[table] = r.rows.map((row) => row.j as Row);
  }
  return out;
}

// Removes the page and everything hanging off it. The user's account and any
// other pages they own are untouched.
export async function deletePageRows(client: DbClient, pageId: number): Promise<void> {
  for (const table of ['guests_photos', 'guests_songs', 'event_guests', 'event_gallery', 'user_page_settings']) {
    await client.query(`DELETE FROM ${table} WHERE user_page_id = $1`, [pageId]);
  }
  const gone = await client.query('DELETE FROM user_page WHERE id = $1 RETURNING id', [pageId]);
  if (!gone.rows.length) throw new Error('Page could not be removed.');
}

// Audit trail: what was purged, for whom, when and by whom. Contains no guest data.
export async function recordPurge(
  client: DbClient,
  c: PurgeCandidate,
  info: { purgedBy: string; filesDeleted: number },
): Promise<void> {
  await client.query(
    `INSERT INTO page_purges
       (page_id, slug, owner_user_id, owner_email, status_at_purge, offline_since,
        guests, photos, gallery_images, songs, files_deleted, purged_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [c.id, c.slug, c.user_id, c.owner_email, c.status, c.offline_since,
     c.guest_count, c.photo_count, c.gallery_count, c.song_count, info.filesDeleted, info.purgedBy],
  );
}
