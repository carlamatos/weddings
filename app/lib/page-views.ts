import { sql } from '@vercel/postgres';

// How many people look at each event page: one row per page per day
// (Pacific), with views (every load) and visitors (each browser counted once
// a day, from a date the page keeps in that browser's localStorage; see
// app/ui/page-view-beacon.tsx). No cookies, IPs or anything about the
// person is stored. Anyone signed in to MyGala (the owner, admins opening a
// page from Admin, other hosts) isn't counted, nor are known bots. For Admin → Activity
// and the host's "opened by N people" (top bar and Share menu). Server only.
//
// people: browsers seeing the page for the first time ever, so a guest who
// comes back on another day isn't counted again. It came a few days after
// visitors; a day recorded before it has no people count (NULL), and that
// day's visitors stand in for it.

let tableReady: Promise<unknown> | null = null;
export function ensurePageViewsTable(): Promise<unknown> {
  tableReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS page_view_days (
        user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
        day DATE NOT NULL,
        views INTEGER NOT NULL DEFAULT 0,
        visitors INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_page_id, day)
      )
    `;
    // No default: rows from before this column stay NULL (see above).
    await sql`ALTER TABLE page_view_days ADD COLUMN IF NOT EXISTS people INTEGER`;
  })().catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

// Crawlers and monitoring tools that run the page's script. (Link previews,
// such as WhatsApp's, don't run scripts, so they never send a view; their
// names aren't listed, as in-app browsers can carry the same name.)
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|python|curl|wget|httpclient/i;
export const isBot = (userAgent: string | null) => !userAgent || BOT_RE.test(userAgent);

export async function recordPageView(pageId: number, newVisitor: boolean, newPerson = false): Promise<void> {
  await ensurePageViewsTable();
  const v = newVisitor ? 1 : 0;
  const n = newVisitor && newPerson ? 1 : 0;
  // Only published pages count (not drafts, deactivated or taken-down ones).
  // A day that started before people were counted keeps NULL, so its
  // visitors keep standing in for the whole day.
  await sql`
    INSERT INTO page_view_days (user_page_id, day, views, visitors, people)
    SELECT id, (NOW() AT TIME ZONE 'America/Vancouver')::date, 1, ${v}, ${n}
    FROM user_page WHERE id = ${pageId} AND COALESCE(status, 'active') = 'active'
    ON CONFLICT (user_page_id, day) DO UPDATE SET
      views = page_view_days.views + 1,
      visitors = page_view_days.visitors + ${v},
      people = CASE WHEN page_view_days.people IS NULL THEN NULL ELSE page_view_days.people + ${n} END
  `;
}

// Guest visits were first counted on this day (Pacific), from about noon
// (COUNTING_STARTED_AT). Pages made before then show "counted since" beside
// their number.
export const VISITS_COUNTED_FROM = '2026-11-25';
const COUNTING_STARTED_AT = Date.parse('2026-11-25T20:00:00Z');

export type PageOpens = { people: number; week: number; since: string | null };

// How many people have opened the page, in all and in the last 7 days (new
// people only). since: VISITS_COUNTED_FROM when the page is older than the
// counting. null when the count can't be read (the top bar then shows nothing).
export async function fetchPageOpens(pageId: number, createdAt?: string | Date | null): Promise<PageOpens | null> {
  try {
    await ensurePageViewsTable();
    const { rows } = await sql<{ people: number; week: number }>`
      SELECT COALESCE(SUM(COALESCE(people, visitors)), 0)::int AS people,
             COALESCE(SUM(COALESCE(people, visitors)) FILTER (
               WHERE day > (NOW() AT TIME ZONE 'America/Vancouver')::date - 7
             ), 0)::int AS week
      FROM page_view_days WHERE user_page_id = ${pageId}
    `;
    const made = createdAt ? new Date(createdAt) : null;
    const older = !!made && !Number.isNaN(made.getTime()) && made.getTime() < COUNTING_STARTED_AT;
    return { people: rows[0]?.people ?? 0, week: rows[0]?.week ?? 0, since: older ? VISITS_COUNTED_FROM : null };
  } catch (error) {
    console.error('Failed to read page opens:', error);
    return null;
  }
}
