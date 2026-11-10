import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PlusIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { auth } from '@/auth';
import { fetchPageQuota, listOwnedPages } from '@/app/lib/data';
import { pagePath } from '@/app/lib/dashboard';
import { hasExpiredPlan, isPagePaidAndLive } from '@/app/lib/plans';
import { publicPageUrl } from '@/app/lib/share';
import type { UserPage } from '@/app/lib/definitions';
import { getTheme } from '@/app/ui/themes/registry';
import { formatDateRange } from '@/app/ui/themes/event-when';
import UpgradeButton from '@/app/ui/dashboard/upgrade-button';
import ExtendButton from '@/app/ui/dashboard/extend-button';
import { DeletePageButton } from '@/app/ui/dashboard/delete-page-dialog';
import PublishButton from '@/app/ui/dashboard/publish-button';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import type { DashText } from '@/app/lib/dash-text/en';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
export const metadata: Metadata = { title: 'Event pages' };

// Dashboard screens a "shortcut" link (/dashboard/livestream, …) can ask for
// when the user has several events and has to pick one first.
const SECTIONS: Record<string, keyof DashText['screens']> = {
  '/guest-list': 'guestList', '/rsvp': 'guestList', '/guest-photos': 'guestPhotos', '/livestream': 'liveStream', '/song-requests': 'songRequests',
  '/reminders': 'reminders', '/custom-sections': 'customSections', '/sponsors': 'sponsors', '/registry': 'registry',
  '/domain': 'domain', '/share': 'invitations', '/event-program': 'eventProgram', '/potluck': 'potluck', '/gift-exchange': 'giftExchange', '/seating': 'findYourTable', '/password': 'passwordProtection', '/invitations': 'invitations',
  '/slideshow': 'photoSlideshow', '/budget': 'budget', '/timeline': 'timeline',
};

const today = () => new Date().toISOString().slice(0, 10);

// Upcoming events first (soonest first), then past events (most recent first);
// pages without a date go last.
function sortEvents(pages: UserPage[]): UserPage[] {
  const now = today();
  const upcoming = pages.filter((p) => p.event_date && (p.event_end_date || p.event_date) >= now)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = pages.filter((p) => p.event_date && (p.event_end_date || p.event_date) < now)
    .sort((a, b) => b.event_date.localeCompare(a.event_date));
  const undated = pages.filter((p) => !p.event_date);
  return [...upcoming, ...past, ...undated];
}

const badge = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-block', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700,
  letterSpacing: 0.3, background: bg, color, whiteSpace: 'nowrap',
});

// /dashboard: the user's event pages. Each event is free or Plus on its own;
// "Create new event" runs the full setup again.
export default async function EventPages({ searchParams }: { searchParams: Promise<{ section?: string; deleted?: string }> }) {
  const d = await getDashText();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');

  const [pages, quota, query] = await Promise.all([listOwnedPages(userId), fetchPageQuota(userId), searchParams]);
  if (pages.length === 0) redirect('/dashboard/setup');

  const section = query.section && SECTIONS[query.section] ? query.section : '';
  const canCreate = quota.count < quota.limit;
  const now = today();

  return (
    // paddingTop: room under the top bar (the dashboard content starts flush with it).
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 880, paddingTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.overview.eventPages}</h1>
          <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
            {section
              ? fill(d.overview.chooseTheEventWhoseYou, { v1: d.screens[SECTIONS[section]] })
              : d.overview.allYourEventsInOne}
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/dashboard/setup"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, background: '#B6584A', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
          >
            <PlusIcon style={{ width: 18, height: 18 }} /> {d.overview.createNewEvent}
          </Link>
        ) : (
          <p style={{ fontSize: 13, color: '#6B6470', margin: 0 }}>{fill(d.overview.youVeReachedEventPages, { limit: quota.limit })}</p>
        )}
      </div>

      {query.deleted === '1' && (
        <div role="status" style={{ background: '#EEF6EF', border: '1px solid #C9E2CD', color: '#2F5A36', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
          {rich(d.overview.yourPageWasDeletedIf, { t0: (s) => <strong>{s}</strong> })}
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {sortEvents(pages).map((p) => {
          const paid = isPagePaidAndLive(p);
          const expired = hasExpiredPlan(p);
          const past = !!p.event_date && (p.event_end_date || p.event_date) < now;
          const when = p.event_date
            ? formatDateRange(p.event_date, p.event_end_date, 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : d.overview.noDateSet;
          const url = publicPageUrl(p);
          const plusUntil = paid && p.plan_expires_at
            ? new Date(p.plan_expires_at).toLocaleDateString(d.meta.locale, { month: 'short', day: 'numeric', year: 'numeric' })
            : null;

          return (
            <div
              key={p.id}
              style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', opacity: past ? 0.85 : 1 }}
            >
              <div style={{ minWidth: 0, flex: '1 1 320px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <Link href={pagePath(p.id, section)} style={{ fontSize: 17, fontWeight: 600, color: '#241F2B', textDecoration: 'none', overflowWrap: 'anywhere' }}>
                    {p.heading || d.overview.untitledEvent}
                  </Link>
                  {paid
                    ? <span style={badge('#F6E6E3', '#9A4738')} title={plusUntil ? fill(d.overview.plusUntil, { plusUntil }) : undefined}>PLUS</span>
                    : <span style={badge(expired ? '#FFF8E7' : '#F1EEEA', expired ? '#8A6800' : '#6B6470')}>{expired ? d.overview.plusEnded : d.overview.free}</span>}
                  {p.status === 'inactive' && <span style={badge('#FDECEC', '#B91C1C')}>{d.overview.deactivated}</span>}
                  {p.status === 'draft' && <span style={badge('#F3EFF9', '#3F2E63')} title={d.overview.onlyYouCanSeeIt}>{d.overview.draft}</span>}
                  {p.status === 'suspended' && <span style={badge('#FDECEC', '#8B1D1D')} title={d.overview.suspendedByMygalaContactUs}>{d.overview.suspended}</span>}
                  {past && <span style={badge('#F1EEEA', '#6B6470')}>{d.overview.past}</span>}
                </div>
                <div style={{ fontSize: 13, color: '#6B6470', lineHeight: 1.6 }}>
                  {when} · {getTheme(p.theme_slug).label}
                  {plusUntil && <> {fill(d.overview.plusUntil2, { plusUntil })}</>}
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#B6584A', textDecoration: 'none', overflowWrap: 'anywhere' }}>
                  {url.replace(/^https?:\/\//, '')}
                </a>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={fill(d.overview.viewPage, { v1: p.heading || d.overview.event })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #DDD5CE', color: '#241F2B', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  <ArrowTopRightOnSquareIcon style={{ width: 16, height: 16 }} /> {d.overview.view}
                </a>
                {p.status === 'draft' && session?.user?.verifiedEmail && <PublishButton pageId={Number(p.id)} />}
                {!paid && (expired ? <ExtendButton pageId={Number(p.id)} /> : <UpgradeButton pageId={Number(p.id)} />)}
                <Link
                  href={pagePath(p.id, section)}
                  style={{ padding: '8px 16px', borderRadius: 8, background: '#241F2B', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  {section ? fill(d.overview.open, { v1: d.screens[SECTIONS[section]] }) : d.overview.editPage}
                </Link>
                {!section && p.status !== 'suspended' && (
                  <DeletePageButton page={{ id: Number(p.id), slug: p.slug, heading: p.heading, isPaid: paid }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 13, color: '#6B6470', marginTop: 20, lineHeight: 1.6 }}>
        {d.overview.plusIsAOneTime}
      </p>
    </div>
  );
}
