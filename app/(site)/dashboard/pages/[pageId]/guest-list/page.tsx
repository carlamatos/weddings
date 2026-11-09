import Link from 'next/link';
import { fetchGuests, fetchPageSettings } from '@/app/lib/data';
import { LINK_SHARED_SETTING } from '@/app/lib/setup-progress';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { GuestListManager } from '@/app/ui/dashboard/guest-list-manager';
import { PlanningToolTip } from '@/app/ui/dashboard/planning-tool-tip';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import { siteHref } from '@/app/lib/app-url';
import { readGuestPlan } from '@/app/lib/saved-plans';
import { fetchPlan } from '@/app/lib/saved-plans-data';
import { SavedPlanNotice } from '@/app/ui/dashboard/saved-plan-notice';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { fill } from '@/app/lib/dash-text/fill';
export const metadata: Metadata = { title: 'Guest List' };

// Guests → Guest List: on every plan. Sending invitations to the list is on
// the Invitations screen (Plus).
export default async function GuestListPage({ params, searchParams }: { params: Promise<{ pageId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const d = await getDashText();
  const [page, { saved }] = await Promise.all([requireOwnedPage(params), searchParams]);
  const pageId = Number(page.id);
  const [guests, settings, savedPlan] = await Promise.all([fetchGuests(pageId), fetchPageSettings(pageId), fetchPlan(pageId, 'guests')]);
  const guestPlan = readGuestPlan(savedPlan?.data);
  // Right after adding guests is when hosts are keenest to invite them.
  const invited = guests.filter((g) => g.invited_at || g.texted_at).length;
  const waiting = guests.length - invited;
  const linkShared = !!settings[LINK_SHARED_SETTING];
  const people = (n: number) => (n === 1 ? d.guestList.oneGuest : fill(d.guestList.nGuests, { n }));
  const prompt = guests.length === 0 || waiting === 0 ? null
    : invited === 0 ? (linkShared ? null : {
      title: fill(d.guestList.youHaveOnYourList, { v1: people(guests.length) }),
      text: d.guestList.emailItTextItOr,
    })
    : {
      title: fill(d.guestList.receivedYourInvitationYet, { v1: people(waiting), v2: waiting === 1 ? d.guestList.hasnT : d.guestList.havenT }),
      text: d.guestList.sendItToThemWhenever,
    };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <SavedPlanNotice saved={saved} />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.guestList.guestList}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          {d.guestList.keepEveryoneYouReInviting}
          {' '}<HelpLink guide="add-your-guests" />
        </p>
      </div>
      {prompt && (
        <div
          role="status"
          style={{
            background: '#FBF5F3', border: '1px solid #E6D3CD', borderRadius: 10, padding: '14px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1.6, color: '#241F2B' }}>
            <strong>{prompt.title}</strong> <span style={{ color: '#6B6470' }}>{prompt.text}</span>
          </span>
          <Link
            href={pagePath(pageId, '/invitations')}
            style={{ padding: '9px 18px', borderRadius: 8, background: '#B6584A', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            {d.guestList.sendInvitations}
          </Link>
        </div>
      )}
      <GuestListManager pageId={pageId} guests={guests} isPaid={page.plan_type === 'paid'} invitationsHref={pagePath(pageId, '/invitations')} />
      {guestPlan ? (
        <section style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '16px 20px', marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: 0 }}>{d.guestList.yourGuestCountPlan}</h2>
            <a href={siteHref(`/guest-count-planner${guestPlan.hash}`)} target="_blank" rel="noopener" style={{ fontSize: 13, fontWeight: 600, color: '#B6584A', textDecoration: 'none' }}>{d.guestList.changeItInThePlanner}</a>
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 12 }}>
            <PlanStat label={d.guestList.plannedInvitations} value={String(guestPlan.invited)} />
            <PlanStat label={d.guestList.expectedToCome} value={`about ${guestPlan.expected}`} sub={fill(d.guestList.likelyTo, { low: guestPlan.low, high: guestPlan.high })} />
            {guestPlan.capacity > 0 && <PlanStat label={d.guestList.venueHolds} value={String(guestPlan.capacity)} sub={guestPlan.high > guestPlan.capacity ? d.guestList.couldBeTight : d.guestList.everyoneFits} warn={guestPlan.high > guestPlan.capacity} />}
            <PlanStat label={d.guestList.onYourListNow} value={String(guests.reduce((n, g) => n + Math.max(1, g.guests || 1), 0))} sub={`${people(guests.length)}${guests.length ? d.guestList.withTheirParties : ''}`} />
          </div>
        </section>
      ) : (
        <PlanningToolTip
          href="/guest-count-planner"
          title={d.guestList.notEveryoneYouInviteWill}
          text={d.guestList.ourFreeGuestCountPlanner}
          cta={d.guestList.guestCountPlanner}
        />
      )}
    </div>
  );
}

function PlanStat({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#241F2B', margin: 0, lineHeight: 1.15 }}>{value}</p>
      {sub && <p style={{ fontSize: 12.5, color: warn ? '#A1361F' : '#9A8F8C', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  );
}
