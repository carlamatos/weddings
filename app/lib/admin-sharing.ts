import { sql } from '@vercel/postgres';
import { isSuperAdmin } from './admin';
import { LINK_SHARED_SETTING } from './setup-progress';

// Admin → Activity's "Sharing rate": of the pages made each week, how many
// reached guests within their first 14 days. A page counts as shared when,
// in those 14 days, it had 3 or more guest visitors (people not signed in to
// MyGala, each browser once a day: app/lib/page-views.ts), or the host sent
// invitations or save-the-dates (email, text or WhatsApp), or a guest
// RSVPed. Clicking a share button alone doesn't count (it's shown on its own
// column: it says they meant to). Rates are out of the pages whose owner
// confirmed their email, as nobody else can share. Weeks start on Monday,
// Pacific time. Server only.

export const SHARE_WINDOW_DAYS = 14;
export const SHARE_MIN_VISITORS = 3;
export const SHARING_WEEKS = 12;
// Guest visits were first counted on this day (Pacific); for pages made
// earlier, the visits part of "shared" is incomplete.
export const VISITS_COUNTED_FROM = '2026-11-25';

export type SharingWeek = {
  week: string;        // Monday, YYYY-MM-DD
  complete: boolean;   // every page of the week has had its 14 days
  visitsCounted: boolean; // guest visits were counted that week (from Nov 25, a Wednesday)
  made: number;
  confirmed: number;
  clicked: number;     // clicked a share button
  sent: number;        // sent invitations or save-the-dates
  visited: number;     // 3+ guest visitors
  rsvp: number;        // at least one RSVP
  shared: number;
  rate: number | null; // shared / confirmed, as a percentage (1 decimal)
};

type PageRow = {
  week: string; email: string; confirmed: boolean; clicked: boolean; sent: boolean;
  visitors: number; rsvp: boolean; complete: boolean;
};

export async function fetchSharingWeeks(): Promise<SharingWeek[]> {
  // user_page.created_at and event_guests.responded_at are UTC times without
  // a zone; invited_at, texted_at and save_the_date_at have one.
  const { rows } = await sql.query<PageRow>(`
    WITH pages AS (
      SELECT p.id, u.email, (u.email_verified_at IS NOT NULL) AS confirmed,
             (p.created_at AT TIME ZONE 'UTC') AS made_at,
             ((p.created_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Vancouver')::date AS made_day
      FROM user_page p JOIN users u ON u.id = p.user_id
      WHERE p.created_at >= (NOW() AT TIME ZONE 'UTC') - make_interval(weeks => $1::int + 1)
    )
    SELECT to_char(date_trunc('week', pg.made_day), 'YYYY-MM-DD') AS week, pg.email, pg.confirmed,
           EXISTS (
             SELECT 1 FROM user_page_settings s
             WHERE s.user_page_id = pg.id AND s.setting_name = $2 AND s.setting_value ~ '^\\d{4}-'
               AND s.setting_value::timestamptz < pg.made_at + make_interval(days => $3::int)
           ) AS clicked,
           EXISTS (
             SELECT 1 FROM event_guests g
             WHERE g.user_page_id = pg.id
               AND LEAST(g.invited_at, g.texted_at, g.save_the_date_at) < pg.made_at + make_interval(days => $3::int)
           ) AS sent,
           COALESCE((
             SELECT sum(v.visitors)::int FROM page_view_days v
             WHERE v.user_page_id = pg.id AND v.day >= pg.made_day AND v.day < pg.made_day + $3::int
           ), 0) AS visitors,
           EXISTS (
             SELECT 1 FROM event_guests g
             WHERE g.user_page_id = pg.id AND g.responded_at IS NOT NULL
               AND (g.responded_at AT TIME ZONE 'UTC') < pg.made_at + make_interval(days => $3::int)
           ) AS rsvp,
           (date_trunc('week', pg.made_day) + make_interval(days => 6 + $3::int) <= (NOW() AT TIME ZONE 'America/Vancouver')::date) AS complete
    FROM pages pg
  `, [SHARING_WEEKS, LINK_SHARED_SETTING, SHARE_WINDOW_DAYS]);

  const weeks = new Map<string, SharingWeek>();
  for (const r of rows) {
    if (isSuperAdmin(r.email)) continue;
    const w = weeks.get(r.week) ?? {
      week: r.week, complete: r.complete, visitsCounted: r.week >= mondayOf(VISITS_COUNTED_FROM),
      made: 0, confirmed: 0, clicked: 0, sent: 0, visited: 0, rsvp: 0, shared: 0, rate: null,
    };
    w.made++;
    if (r.confirmed) {
      w.confirmed++;
      const visited = r.visitors >= SHARE_MIN_VISITORS;
      if (r.clicked) w.clicked++;
      if (r.sent) w.sent++;
      if (visited) w.visited++;
      if (r.rsvp) w.rsvp++;
      if (visited || r.sent || r.rsvp) w.shared++;
    }
    weeks.set(r.week, w);
  }
  return [...weeks.values()]
    .map((w) => ({ ...w, rate: w.confirmed ? Math.round((w.shared / w.confirmed) * 1000) / 10 : null }))
    .sort((a, b) => b.week.localeCompare(a.week))
    .slice(0, SHARING_WEEKS);
}

// The Monday of a YYYY-MM-DD day.
function mondayOf(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
