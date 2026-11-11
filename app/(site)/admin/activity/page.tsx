import Link from 'next/link';
import { sql } from '@vercel/postgres';
import type { Metadata } from 'next';
import { getSuperAdmin, isSuperAdmin } from '@/app/lib/admin';
import { ensureVisitColumns } from '@/app/lib/dashboard-visits';
import { fetchCronRuns, type CronRunRow } from '@/app/lib/cron-log';
import { FOLLOW_UP_SETTING } from '@/app/lib/setup-reminder';
import { siteHref } from '@/app/lib/app-url';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';

export const metadata: Metadata = { title: 'Activity' };
export const dynamic = 'force-dynamic';

// Who comes back to their dashboard (app/lib/dashboard-visits.ts), which
// follow-up emails went out (app/lib/setup-reminder.ts), and whether the
// scheduled jobs in vercel.json actually run (app/lib/cron-log.ts).

const TZ = 'America/Vancouver';
const JOBS: { job: string; what: string; when: string }[] = [
  { job: 'setup-reminders', what: 'Follow-up emails to new hosts', when: 'Daily, 7–8 am Pacific' },
  { job: 'reminders', what: 'Guest reminder emails (Plus)', when: 'Every hour' },
  { job: 'plan-reminders', what: 'RSVP timeline and budget reminders to hosts', when: 'Daily, 6–7 am Pacific' },
  { job: 'purge-deleted-pages', what: 'Empties pages 30 days in the trash', when: 'Daily, 1–2 am Pacific' },
];
const OUTCOME: Record<string, { label: string; color: string; bg: string }> = {
  ok: { label: 'Ran', color: c.green, bg: c.greenBg },
  failed: { label: 'Failed', color: c.red, bg: c.redBg },
  refused_no_secret: { label: 'Refused: CRON_SECRET not set', color: c.red, bg: c.redBg },
  refused_wrong_secret: { label: 'Refused: wrong CRON_SECRET', color: c.red, bg: c.redBg },
};

type HostRow = {
  id: string; name: string | null; email: string; date: Date | null; verified: boolean;
  first_dashboard_at: Date | null; last_dashboard_at: Date | null; dashboard_visits: number;
  page_id: number | null; slug: string | null; heading: string | null; page_status: string | null;
  page_created: Date | null; guests: number; replies: number; follow_up: string | null;
};

function when(value: Date | string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  const sameDay = (a: Date, b: Date) => a.toLocaleDateString('en-CA', { timeZone: TZ }) === b.toLocaleDateString('en-CA', { timeZone: TZ });
  const time = d.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
  const now = new Date();
  if (sameDay(d, now)) return `Today ${time}`;
  if (sameDay(d, new Date(now.getTime() - 86_400_000))) return `Yesterday ${time}`;
  return `${d.toLocaleDateString('en-US', { timeZone: TZ, month: 'short', day: 'numeric' })} ${time}`;
}

const pill = (label: string, color: string, bg: string) => (
  <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, color, background: bg, whiteSpace: 'nowrap' }}>{label}</span>
);

const FOLLOW_UP_LABEL: Record<string, string> = { confirm: 'Confirm email', publish: 'Publish', share: 'Invite guests' };

export default async function AdminActivityPage() {
  await getSuperAdmin();
  let hosts: HostRow[] = [];
  let runs: CronRunRow[] = [];
  let error: string | null = null;
  try {
    await ensureVisitColumns();
    // user_page.created_at is a UTC time without a zone.
    const [h, r] = await Promise.all([
      sql.query<HostRow>(`
        SELECT u.id, u.name, u.email, u.date, (u.email_verified_at IS NOT NULL) AS verified,
               u.first_dashboard_at, u.last_dashboard_at, u.dashboard_visits,
               p.id AS page_id, p.slug, p.heading, COALESCE(p.status, 'active') AS page_status,
               (p.created_at AT TIME ZONE 'UTC') AS page_created,
               (SELECT count(*)::int FROM event_guests g WHERE g.user_page_id = p.id) AS guests,
               (SELECT count(*)::int FROM event_guests g WHERE g.user_page_id = p.id AND g.responded_at IS NOT NULL) AS replies,
               (SELECT setting_value FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = $1) AS follow_up
        FROM users u
        LEFT JOIN LATERAL (SELECT * FROM user_page WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) p ON true
        ORDER BY u.last_dashboard_at DESC NULLS LAST, u.date DESC NULLS LAST
        LIMIT 150
      `, [FOLLOW_UP_SETTING]),
      fetchCronRuns(),
    ]);
    hosts = h.rows.filter((u) => !isSuperAdmin(u.email));
    runs = r;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Query failed';
  }

  const now = Date.now();
  const within = (d: Date | null, days: number) => !!d && now - new Date(d).getTime() < days * 86_400_000;
  const tracked = hosts.filter((u) => u.first_dashboard_at);
  const cameBack = tracked.filter((u) => u.dashboard_visits >= 2);
  const cards = [
    { n: hosts.filter((u) => within(u.last_dashboard_at, 1)).length, label: 'In the dashboard, last 24 hours' },
    { n: hosts.filter((u) => within(u.last_dashboard_at, 7)).length, label: 'In the dashboard, last 7 days' },
    { n: `${cameBack.length} of ${tracked.length}`, label: 'Came back for a 2nd visit or more' },
    { n: hosts.filter((u) => u.follow_up).length, label: 'Follow-up emails sent' },
  ];
  const tracking = hosts.reduce<Date | null>((min, u) => (u.first_dashboard_at && (!min || new Date(u.first_dashboard_at) < min) ? new Date(u.first_dashboard_at) : min), null);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Activity</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        When hosts come back to their dashboard. A visit is a stretch of dashboard use; coming back 30 minutes or more later counts
        as a new visit. Times are Pacific. Super admins are left out.
        {tracking ? ` Tracking since ${when(tracking)}; visits before that weren’t recorded.` : ' Nothing recorded yet — visits are counted from now on.'}
      </p>

      {error && <div role="alert" style={{ ...alertError, marginBottom: 16 }}>Couldn&apos;t load activity: {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ background: '#fff', border: `1px solid ${c.line}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{card.n}</div>
            <div style={{ fontSize: 12, color: c.soft, marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16, margin: '0 0 10px' }}>Scheduled jobs</h2>
      <div style={{ ...tableWrap, marginBottom: 28 }}>
        <table style={table}>
          <thead>
            <tr><th style={th}>Job</th><th style={th}>Schedule</th><th style={th}>Last call</th><th style={th}>Details</th></tr>
          </thead>
          <tbody>
            {JOBS.map((j) => {
              const mine = runs.filter((r) => r.job === j.job);
              const last = mine[0];
              const o = last ? OUTCOME[last.outcome] ?? OUTCOME.failed : null;
              return (
                <tr key={j.job}>
                  <td style={td}><div style={{ fontWeight: 600 }}>{j.what}</div><div style={{ color: c.muted, fontSize: 11 }}>{j.job}</div></td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{j.when}</td>
                  <td style={td}>
                    {o && last ? <>{pill(o.label, o.color, o.bg)}<div style={{ color: c.soft, marginTop: 4 }}>{when(last.last_at)}</div></> : pill('Never called', c.amber, c.amberBg)}
                  </td>
                  <td style={{ ...td, color: c.soft, fontSize: 12 }}>
                    {mine.map((r) => (
                      <div key={r.outcome}>{(OUTCOME[r.outcome] ?? OUTCOME.failed).label}: {r.count}× {r.detail ? <code style={{ fontSize: 11 }}>{r.detail}</code> : null}</div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 16, margin: '0 0 10px' }}>Hosts</h2>
      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Host</th><th style={th}>Page</th><th style={th}>Page made</th>
              <th style={th}>Last visit</th><th style={th}>Visits</th><th style={th}>Follow-up email</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map((u) => (
              <tr key={u.id}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{u.name?.trim() || <span style={{ color: c.muted, fontWeight: 400 }}>No name yet</span>}</div>
                  <div style={{ color: c.soft }}>{u.email}</div>
                  {!u.verified && pill('Email not confirmed', c.amber, c.amberBg)}
                </td>
                <td style={td}>
                  {u.slug ? (
                    <>
                      <Link href={siteHref(`/${u.slug}`)} target="_blank" style={{ color: c.ink }}>{u.heading?.replace(/\s+/g, ' ') || `/${u.slug}`}</Link>
                      <div style={{ color: c.muted, fontSize: 11 }}>
                        {u.page_status === 'draft' ? 'Draft' : u.page_status === 'active' ? 'Published' : u.page_status} · {u.guests} guest{u.guests === 1 ? '' : 's'}
                        {u.replies ? `, ${u.replies} repl${u.replies === 1 ? 'y' : 'ies'}` : ''}
                      </div>
                    </>
                  ) : <span style={{ color: c.muted }}>No page yet</span>}
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{u.page_created ? when(u.page_created) : u.date ? new Date(u.date).toISOString().slice(0, 10) : '—'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{when(u.last_dashboard_at)}</td>
                <td style={td}>{u.dashboard_visits || '—'}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  {u.follow_up ? (
                    <>{FOLLOW_UP_LABEL[u.follow_up.split(' ')[0]] ?? u.follow_up.split(' ')[0]}<div style={{ color: c.muted, fontSize: 11 }}>{when(u.follow_up.split(' ')[1] ?? null)}</div></>
                  ) : '—'}
                </td>
              </tr>
            ))}
            {!hosts.length && !error && (
              <tr><td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={6}>No hosts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
