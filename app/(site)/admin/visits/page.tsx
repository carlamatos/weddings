import type { Metadata } from 'next';
import Link from 'next/link';
import { getSuperAdmin } from '@/app/lib/admin';
import { fetchVisitsReport, VISIT_PERIODS, type Breakdown, type VisitPeriod, type VisitsReport } from '@/app/lib/admin-visits';
import { NO_REFERRER } from '@/app/lib/visit-sources';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';

export const metadata: Metadata = { title: 'Visits' };

// Live admin data: never run these queries at build time.
export const dynamic = 'force-dynamic';

// Guests' visits to event pages, from MyGala's own counts (no cookies, no
// Google): how many, where they came from, which country and on what device
// (app/lib/admin-visits.ts).

const countryName = (code: string) => {
  if (code === '??') return 'Unknown';
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code; } catch { return code; }
};
// Codes, not flag emoji: Windows doesn't draw flags.
const code = (c2: string) => (c2 === '??' ? 'Unknown' : c2);
const sum = (b: Breakdown) => b.reduce((n, r) => n + r.visitors, 0);
const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export default async function AdminVisitsPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  // Checked here as well as in the layout (see the other admin pages).
  if (!(await getSuperAdmin())) return null;
  const d = Number((await searchParams).d);
  const days: VisitPeriod = (VISIT_PERIODS as readonly number[]).includes(d) ? (d as VisitPeriod) : 30;

  let report: VisitsReport | null = null;
  let error: string | null = null;
  try {
    report = await fetchVisitsReport(days);
  } catch (e) {
    error = e instanceof Error ? e.message : 'unknown error';
  }

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Visits</h1>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: c.soft, lineHeight: 1.6, maxWidth: 860 }}>
        Guests opening hosts&rsquo; event pages, counted by MyGala itself: no cookies and no banner, so every guest counts.
        A <strong>visitor</strong> is one browser on one day; <strong>people</strong> are browsers opening the page for the first time.
        Hosts and anyone signed in to MyGala aren&rsquo;t counted, nor are your own pages. <strong>{NO_REFERRER}</strong> is
        what WhatsApp on iPhone, iMessage, most email apps and typed addresses look like: those apps don&rsquo;t say where the
        link was opened.
      </p>

      <nav style={{ display: 'flex', gap: 6, marginBottom: 18 }} aria-label="Period">
        {VISIT_PERIODS.map((p) => (
          <Link key={p} href={`/admin/visits?d=${p}`} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            border: `1px solid ${p === days ? c.accent : c.line}`, background: p === days ? c.accent : '#fff', color: p === days ? '#fff' : c.ink,
          }}>Last {p} days</Link>
        ))}
      </nav>

      {error && <div role="alert" style={{ ...alertError, marginBottom: 16 }}>Couldn&apos;t load visits: {error}</div>}

      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 18 }}>
            <Stat label="Visitors" value={report.totals.visitors} />
            <Stat label="People (first visit)" value={report.totals.people} />
            <Stat label="Views" value={report.totals.views} />
            <Stat label="Event pages visited" value={report.totals.pages} />
          </div>

          {report.breakdownSince && (
            <p style={{ margin: '0 0 12px', fontSize: 12, color: c.muted }}>
              Sources, countries and devices are counted since {longDay(report.breakdownSince)}; visits before then are in the totals only.
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 26 }}>
            <Panel title="Where guests come from" rows={report.sources.map((r) => ({ label: r.value, n: r.visitors }))} />
            <Panel title="Countries" rows={report.countries.map((r) => ({ label: r.value === '??' ? 'Unknown' : `${countryName(r.value)} (${r.value})`, n: r.visitors }))} />
            <Panel title="Devices" rows={report.devices.map((r) => ({ label: r.value, n: r.visitors }))} />
          </div>

          <h2 style={{ fontSize: 16, margin: '0 0 10px' }}>Event pages, most visited first</h2>
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Page</th>
                  <th style={{ ...th, textAlign: 'right' }}>Visitors</th>
                  <th style={{ ...th, textAlign: 'right' }}>People</th>
                  <th style={{ ...th, textAlign: 'right' }}>Views</th>
                  <th style={th}>Top sources</th>
                  <th style={th}>Countries</th>
                  <th style={{ ...th, textAlign: 'right' }}>On phones</th>
                </tr>
              </thead>
              <tbody>
                {report.pages.length === 0 && (
                  <tr><td style={{ ...td, color: c.muted }} colSpan={7}>No guest visits in the last {days} days.</td></tr>
                )}
                {report.pages.map((p) => {
                  const counted = sum(p.devices);
                  const phones = p.devices.find((x) => x.value === 'Phone')?.visitors ?? 0;
                  return (
                    <tr key={p.id}>
                      <td style={td}>
                        <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: c.ink, fontWeight: 600 }}>{p.heading || p.slug}</a>
                        {p.status !== 'active' && <span style={{ marginLeft: 6, fontSize: 11, color: c.amber }}>({p.status})</span>}
                        <div style={{ fontSize: 12, color: c.muted }}>#{p.id} · {p.email}</div>
                      </td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{p.visitors}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{p.people}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{p.views}</td>
                      <td style={{ ...td, fontSize: 12 }}>{p.sources.length ? p.sources.slice(0, 3).map((s) => `${s.value} ${s.visitors}`).join(' · ') : <span style={{ color: c.muted }}>—</span>}</td>
                      <td style={{ ...td, fontSize: 12 }}>{p.countries.length ? p.countries.slice(0, 3).map((s) => `${code(s.value)} ${s.visitors}`).join(' · ') : <span style={{ color: c.muted }}>—</span>}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{counted ? `${pct(phones, counted)}%` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${c.line}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value.toLocaleString('en-CA')}</div>
      <div style={{ fontSize: 12, color: c.soft }}>{label}</div>
    </div>
  );
}

function Panel({ title, rows }: { title: string; rows: { label: string; n: number }[] }) {
  const total = rows.reduce((n, r) => n + r.n, 0);
  return (
    <section style={{ background: '#fff', border: `1px solid ${c.line}`, borderRadius: 12, padding: '14px 16px' }}>
      <h2 style={{ fontSize: 14, margin: '0 0 10px' }}>{title}</h2>
      {rows.length === 0 && <p style={{ margin: 0, fontSize: 13, color: c.muted }}>Nothing yet.</p>}
      {rows.slice(0, 10).map((r) => (
        <div key={r.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
            <span>{r.label}</span>
            <span style={{ color: c.soft }}>{r.n} · {pct(r.n, total)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: c.greyBg }}>
            <div style={{ width: `${pct(r.n, total)}%`, height: 6, borderRadius: 3, background: c.accent }} />
          </div>
        </div>
      ))}
      {rows.length > 10 && <p style={{ margin: '6px 0 0', fontSize: 12, color: c.muted }}>And {rows.length - 10} more.</p>}
    </section>
  );
}
