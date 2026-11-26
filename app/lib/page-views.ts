import { sql } from '@vercel/postgres';

// How many people look at each event page: one row per page per day
// (Pacific), with views (every load) and visitors (each browser counted once
// a day, from a date the page keeps in that browser's localStorage; see
// app/ui/page-view-beacon.tsx). No cookies, IPs or anything about the
// person is stored. Anyone signed in to MyGala (the owner, admins opening a
// page from Admin, other hosts) isn't counted, nor are known bots. For Admin → Activity. Server only.

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
  })().catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

// Crawlers and monitoring tools that run the page's script. (Link previews,
// such as WhatsApp's, don't run scripts, so they never send a view; their
// names aren't listed, as in-app browsers can carry the same name.)
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|python|curl|wget|httpclient/i;
export const isBot = (userAgent: string | null) => !userAgent || BOT_RE.test(userAgent);

export async function recordPageView(pageId: number, newVisitor: boolean): Promise<void> {
  await ensurePageViewsTable();
  const v = newVisitor ? 1 : 0;
  // Only published pages count (not drafts, deactivated or taken-down ones).
  await sql`
    INSERT INTO page_view_days (user_page_id, day, views, visitors)
    SELECT id, (NOW() AT TIME ZONE 'America/Vancouver')::date, 1, ${v}
    FROM user_page WHERE id = ${pageId} AND COALESCE(status, 'active') = 'active'
    ON CONFLICT (user_page_id, day) DO UPDATE SET views = page_view_days.views + 1, visitors = page_view_days.visitors + ${v}
  `;
}
