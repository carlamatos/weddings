import { sql } from '@vercel/postgres';
import { ensurePageViewsTable } from './page-views';
import { ensureBreakdownTable, type BreakdownKind } from './visit-sources';

// Admin → Visits: guests' visits to event pages from MyGala's own counts
// (app/lib/page-views.ts, app/lib/visit-sources.ts), over the last N days
// (Pacific), in total and per page. Super admins' own pages are left out,
// like the other admin numbers. Server only.

export const VISIT_PERIODS = [7, 30, 90] as const;
export type VisitPeriod = (typeof VISIT_PERIODS)[number];

export type Breakdown = { value: string; visitors: number }[];
export type VisitTotals = { views: number; visitors: number; people: number; pages: number };
export type PageVisits = {
  id: number; heading: string; slug: string; email: string; status: string;
  views: number; visitors: number; people: number;
  sources: Breakdown; countries: Breakdown; devices: Breakdown;
};
export type VisitsReport = {
  totals: VisitTotals;
  sources: Breakdown; countries: Breakdown; devices: Breakdown;
  breakdownSince: string | null; // first day sources, countries and devices were counted
  pages: PageVisits[];
};

const adminEmails = () => (process.env.SUPER_ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
const PAGE_LIMIT = 60;

export async function fetchVisitsReport(days: VisitPeriod): Promise<VisitsReport> {
  await Promise.all([ensurePageViewsTable(), ensureBreakdownTable()]);
  const admins = adminEmails();
  // The pages counted: not a super admin's.
  const scope = `
    JOIN user_page p ON p.id = v.user_page_id
    JOIN users u ON u.id = p.user_id
    WHERE v.day > (NOW() AT TIME ZONE 'America/Vancouver')::date - $1::int
      AND NOT (lower(u.email) = ANY($2::text[]))`;
  const [totals, breakdown, since, pages] = await Promise.all([
    sql.query<VisitTotals>(`
      SELECT COALESCE(SUM(v.views), 0)::int AS views, COALESCE(SUM(v.visitors), 0)::int AS visitors,
             COALESCE(SUM(COALESCE(v.people, v.visitors)), 0)::int AS people, COUNT(DISTINCT v.user_page_id)::int AS pages
      FROM page_view_days v ${scope}`, [days, admins]),
    sql.query<{ kind: BreakdownKind; value: string; visitors: number }>(`
      SELECT v.kind, v.value, SUM(v.visitors)::int AS visitors
      FROM page_view_breakdown v ${scope}
      GROUP BY v.kind, v.value ORDER BY visitors DESC`, [days, admins]),
    sql`SELECT to_char(MIN(day), 'YYYY-MM-DD') AS d FROM page_view_breakdown`,
    sql.query<Omit<PageVisits, 'sources' | 'countries' | 'devices'>>(`
      SELECT p.id, p.heading, p.slug, u.email, COALESCE(p.status, 'active') AS status,
             SUM(v.views)::int AS views, SUM(v.visitors)::int AS visitors, SUM(COALESCE(v.people, v.visitors))::int AS people
      FROM page_view_days v ${scope}
      GROUP BY p.id, p.heading, p.slug, u.email, p.status
      ORDER BY visitors DESC, views DESC LIMIT ${PAGE_LIMIT}`, [days, admins]),
  ]);

  const ids = pages.rows.map((r) => r.id);
  const perPage = ids.length
    ? (await sql.query<{ id: number; kind: BreakdownKind; value: string; visitors: number }>(`
        SELECT user_page_id AS id, kind, value, SUM(visitors)::int AS visitors FROM page_view_breakdown
        WHERE user_page_id = ANY($1::int[]) AND day > (NOW() AT TIME ZONE 'America/Vancouver')::date - $2::int
        GROUP BY user_page_id, kind, value ORDER BY visitors DESC`, [ids, days])).rows
    : [];
  const pick = (rows: { kind: BreakdownKind; value: string; visitors: number }[], kind: BreakdownKind): Breakdown =>
    rows.filter((r) => r.kind === kind).map(({ value, visitors }) => ({ value, visitors }));

  return {
    totals: totals.rows[0] ?? { views: 0, visitors: 0, people: 0, pages: 0 },
    sources: pick(breakdown.rows, 'source'),
    countries: pick(breakdown.rows, 'country'),
    devices: pick(breakdown.rows, 'device'),
    breakdownSince: since.rows[0]?.d ?? null,
    pages: pages.rows.map((p) => {
      const mine = perPage.filter((r) => r.id === p.id);
      return { ...p, sources: pick(mine, 'source'), countries: pick(mine, 'country'), devices: pick(mine, 'device') };
    }),
  };
}
