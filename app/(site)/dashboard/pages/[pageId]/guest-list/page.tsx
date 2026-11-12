import Link from 'next/link';
import { fetchGuests, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { LINK_SHARED_SETTING } from '@/app/lib/setup-progress';
import { RSVP_GUEST_LIST_ONLY_SETTING, isRsvpGuestListOnly } from '@/app/lib/rsvp-settings';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { RsvpNotifyOption } from '@/app/ui/dashboard/rsvp-notify-option';
import { isRsvpNotifyOn } from '@/app/lib/rsvp-notify';
import { RsvpGuestListOption } from '@/app/ui/dashboard/rsvp-guest-list-option';
import { RsvpMealsOption } from '@/app/ui/dashboard/rsvp-meals-option';
import { RsvpSongOption } from '@/app/ui/dashboard/rsvp-song-option';
import { isRsvpSongOn } from '@/app/lib/rsvp-song';
import { MealSummaryCard, type MealRow } from '@/app/ui/dashboard/meal-summary';
import { defaultMeals, MEAL_OPTIONS_SETTING, mealOptionsFromSettings, parseMealOptions, personName, readPartyMeals, summarizeMeals } from '@/app/lib/rsvp-meals';
import { rsvpCalculatorHref } from '@/app/ui/dashboard/planning-tool-tip';
import { auth } from '@/auth';
import { publicPageUrl } from '@/app/lib/share';
import { GuestListStart } from '@/app/ui/dashboard/guest-list-start';
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
export const metadata: Metadata = { title: 'Guests & RSVPs' };

// Guests → Guests & RSVPs, on every plan: one screen for the guest list and
// everyone's replies (it used to be two, Guest List and RSVP; /rsvp now
// opens this one). The RSVP form's switch is at the top, its other settings
// below the list. Sending invitations is on the Invite screen.
export default async function GuestListPage({ params, searchParams }: { params: Promise<{ pageId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const d = await getDashText();
  const [page, { saved }] = await Promise.all([requireOwnedPage(params), searchParams]);
  const pageId = Number(page.id);
  const [guests, settings, savedPlan, session] = await Promise.all([fetchGuests(pageId), fetchPageSettings(pageId), fetchPlan(pageId, 'guests'), auth()]);

  const attending = guests.filter((g) => g.status === 'attending');
  const declining = guests.filter((g) => g.status === 'not_attending');
  const awaiting = guests.filter((g) => g.status === 'invited');
  const totalGuests = attending.reduce((sum, g) => sum + (g.guests || 1), 0);

  // Meal choices (when the host asks for them, or anyone chose one before).
  const mealOptions = mealOptionsFromSettings(settings, page.language);
  const mealGuests = guests.map((g) => ({ name: g.name, status: g.status, guests: g.guests, meals: readPartyMeals(g.meals), table: g.seating_table ?? '' }));
  const showMeals = !!mealOptions || mealGuests.some((g) => g.meals.some((r) => r.meal || r.diet));
  const mealRows: MealRow[] = mealGuests.filter((g) => g.status === 'attending').flatMap((g) =>
    Array.from({ length: Math.max(1, g.guests || 1) }, (_, i) => ({
      guest: g.name, person: personName(g.name, g.meals, i), meal: g.meals[i]?.meal ?? '', diet: g.meals[i]?.diet ?? '', table: g.table,
    })),
  );
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
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.guestList.guestsAndRsvps}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          {d.guestList.everyoneYouInvitedAnd}
          {' '}<HelpLink guide="manage-rsvps" />
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName="show_rsvp"
        initialOn={isSectionOn(settings, 'show_rsvp')}
        label={d.rsvp.rsvpFormVisibleOnYour}
      />
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
      {guests.length === 0 && (
        <GuestListStart
          pageId={pageId}
          url={publicPageUrl(page)}
          title={page.heading || d.invitations.ourEvent}
          draft={page.status === 'draft'}
          listOnly={settings[RSVP_GUEST_LIST_ONLY_SETTING] === 'true'}
        />
      )}
      {guests.length > 0 && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label={d.rsvp.attending} value={attending.length} sub={fill(d.rsvp.totalGuest, { totalGuests, v1: totalGuests !== 1 ? 's' : '' })} accent="#5C6B61" />
          <StatCard label={d.rsvp.declining} value={declining.length} accent="#9A8F8C" />
          <StatCard label={d.guestList.waitingForAReply} value={awaiting.length} accent="#4A5296" />
          <StatCard label={d.rsvp.totalResponses} value={attending.length + declining.length} accent="#3F4A45" />
        </div>
      )}

      {showMeals && guests.length > 0 && (
        <MealSummaryCard summary={summarizeMeals(mealGuests, mealOptions ?? [])} rows={mealRows} heading={page.heading || ''} />
      )}

      <GuestListManager pageId={pageId} guests={guests} isPaid={page.plan_type === 'paid'} invitationsHref={pagePath(pageId, '/invitations')} showMeals={showMeals} />

      <section id="rsvp-settings" style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 20px 6px', marginTop: 28, scrollMarginTop: 80 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{d.guestList.rsvpFormSettings}</h2>
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>{d.guestList.howGuestsReplyOnYour}</p>
        <RsvpNotifyOption pageId={pageId} initialOn={isRsvpNotifyOn(settings)} email={session?.user?.email ?? undefined} />
        <RsvpGuestListOption
          pageId={pageId}
          initialOn={isRsvpGuestListOnly(settings)}
          guestCount={guests.length}
          guestListHref={pagePath(pageId, '/guest-list')}
        />
        <RsvpSongOption pageId={pageId} initialOn={isRsvpSongOn(settings)} />
        <RsvpMealsOption
          pageId={pageId}
          initialOn={!!mealOptions}
          initialOptions={parseMealOptions(settings[MEAL_OPTIONS_SETTING]) ?? defaultMeals(page.language)}
        />
      </section>
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
      <PlanningToolTip
        href={rsvpCalculatorHref(page)}
        title={d.rsvp.whenShouldRepliesBeDue}
        text={d.rsvp.ourFreeCalculatorWorksOut}
        cta={d.rsvp.rsvpDeadlineCalculator}
      />
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

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '16px 22px', minWidth: 140, flex: '1 1 140px' }}>
      <p style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#9A8F8C', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: accent, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9A8F8C', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}
