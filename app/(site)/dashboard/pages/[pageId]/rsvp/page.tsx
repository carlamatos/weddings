import { fetchGuests, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { RsvpActions } from './RsvpActions';
import { GuestStatusSelect } from './GuestStatusSelect';
import Link from 'next/link';
import { pagePath } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { RsvpNotifyOption } from '@/app/ui/dashboard/rsvp-notify-option';
import { isRsvpNotifyOn } from '@/app/lib/rsvp-notify';
import { isRsvpGuestListOnly } from '@/app/lib/rsvp-settings';
import { RsvpGuestListOption } from '@/app/ui/dashboard/rsvp-guest-list-option';
import { auth } from '@/auth';
import { LocalDate } from '@/app/ui/dashboard/local-date';
import { PlanningToolTip, rsvpCalculatorHref } from '@/app/ui/dashboard/planning-tool-tip';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import { RsvpMealsOption } from '@/app/ui/dashboard/rsvp-meals-option';
import { MealSummaryCard, type MealRow } from '@/app/ui/dashboard/meal-summary';
import { defaultMeals, MEAL_OPTIONS_SETTING, mealOptionsFromSettings, parseMealOptions, personName, readPartyMeals, summarizeMeals } from '@/app/lib/rsvp-meals';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
export const metadata: Metadata = { title: 'RSVP' };

export default async function RsvpPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);
  const [guests, settings, session] = await Promise.all([
    fetchGuests(pageId),
    fetchPageSettings(pageId),
    auth(),
  ]);

  const attending = guests.filter((g) => g.status === 'attending');
  const declining = guests.filter((g) => g.status === 'not_attending');
  const invited   = guests.filter((g) => g.status === 'invited');
  const totalGuests = attending.reduce((sum, g) => sum + (g.guests || 1), 0);

  // Meal choices (when the host asks for them, or anyone chose one before).
  const mealOptions = mealOptionsFromSettings(settings, page.language);
  const partyMeals = new Map(guests.map((g) => [g.id, readPartyMeals(g.meals)]));
  const anyMeals = [...partyMeals.values()].some((rows) => rows.some((r) => r.meal || r.diet));
  const showMeals = !!mealOptions || anyMeals;
  const mealGuests = guests.map((g) => ({ name: g.name, status: g.status, guests: g.guests, meals: partyMeals.get(g.id) ?? [], table: g.seating_table ?? '' }));
  const mealRows: MealRow[] = mealGuests.filter((g) => g.status === 'attending').flatMap((g) =>
    Array.from({ length: Math.max(1, g.guests || 1) }, (_, i) => ({
      guest: g.name, person: personName(g.name, g.meals, i), meal: g.meals[i]?.meal ?? '', diet: g.meals[i]?.diet ?? '', table: g.table,
    })),
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px', fontFamily: 'system-ui' }}>{d.rsvp.rsvp}</h1>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 20px', maxWidth: 680, lineHeight: 1.6, fontFamily: 'system-ui' }}>
        {d.rsvp.seeWhoSComingHow}
        {' '}<HelpLink guide="manage-rsvps" />
      </p>

      <SectionToggle
        pageId={pageId}
        settingName="show_rsvp"
        initialOn={isSectionOn(settings, 'show_rsvp')}
        label={d.rsvp.rsvpFormVisibleOnYour}
      />

      <RsvpNotifyOption pageId={pageId} initialOn={isRsvpNotifyOn(settings)} email={session?.user?.email ?? undefined} />

      <RsvpGuestListOption
        pageId={pageId}
        initialOn={isRsvpGuestListOnly(settings)}
        guestCount={guests.length}
        guestListHref={pagePath(pageId, '/guest-list')}
      />

      <RsvpMealsOption
        pageId={pageId}
        initialOn={!!mealOptions}
        initialOptions={parseMealOptions(settings[MEAL_OPTIONS_SETTING]) ?? defaultMeals(page.language)}
      />


      <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label={d.rsvp.attending}       value={attending.length} sub={fill(d.rsvp.totalGuest, { totalGuests, v1: totalGuests !== 1 ? 's' : '' })} accent="#5C6B61" />
        <StatCard label={d.rsvp.declining}       value={declining.length} accent="#9A8F8C" />
        <StatCard label={d.rsvp.invited}         value={invited.length}   accent="#4A5296" />
        <StatCard label={d.rsvp.totalResponses} value={attending.length + declining.length} accent="#3F4A45" />
      </div>

      {showMeals && (
        <MealSummaryCard summary={summarizeMeals(mealGuests, mealOptions ?? [])} rows={mealRows} heading={page.heading || ''} />
      )}

      <RsvpActions pageId={pageId} guests={guests} />

      {guests.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#9A8F8C', fontFamily: 'system-ui', fontSize: 15 }}>
          {rich(d.rsvp.noGuestsYetShareYour, { t0: (s) => <Link href={pagePath(pageId, '/guest-list')} style={{ color: '#B6584A' }}>{s}</Link> })}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #EDE8E3', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#FAF9F7', borderBottom: '1px solid #EDE8E3' }}>
                {[d.rsvp.name, d.rsvp.email, d.rsvp.phone, d.rsvp.status, d.rsvp.guests, ...(showMeals ? [d.rsvp.meals] : []), d.rsvp.updates, d.rsvp.note, d.rsvp.date].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, letterSpacing: 0.5, color: '#6B6470', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map((g, i) => (
                <tr key={g.id} style={{ borderBottom: i < guests.length - 1 ? '1px solid #F0ECE8' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: '#241F2B' }}>{g.name}</td>
                  <td style={{ padding: '14px 16px', color: '#6B6470' }}>{g.email || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#6B6470' }}>{g.phone || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <GuestStatusSelect pageId={pageId} guestId={g.id} guestName={g.name} initial={g.status} />
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: '#241F2B' }}>
                    {g.status === 'not_attending' ? '—' : g.guests || 1}
                  </td>
                  {showMeals && (
                    <td style={{ padding: '14px 16px', color: '#241F2B', fontSize: 13, minWidth: 180 }}>
                      <MealsCell guest={g.name} status={g.status} size={g.guests} rows={partyMeals.get(g.id) ?? []} />
                    </td>
                  )}
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: g.receive_updates ? '#3D6B46' : '#9A8F8C' }}>
                    {g.status !== 'invited' ? (g.receive_updates ? '✓' : '—') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9A8F8C', maxWidth: 260 }}>
                    {g.message || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9A8F8C', whiteSpace: 'nowrap', fontSize: 13 }}>
                    {/* When they replied; for guests yet to reply, when they were added. */}
                    <LocalDate iso={g.responded_at ?? g.created_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

// One guest's party in the RSVP table: each person's meal and allergies.
async function MealsCell({ guest, status, size, rows }: { guest: string; status: string; size: number; rows: ReturnType<typeof readPartyMeals> }) {
  const d = await getDashText();
  if (status !== 'attending') return <span style={{ color: '#9A8F8C' }}>—</span>;
  const people = Math.max(1, size || 1);
  if (!rows.some((r) => r.meal || r.diet)) return <span style={{ color: '#9A8F8C' }}>{d.rsvp.noChoiceYet}</span>;
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      {Array.from({ length: people }, (_, i) => (
        <div key={i}>
          {people > 1 && <span style={{ color: '#6B6470' }}>{personName(guest, rows, i)}: </span>}
          {rows[i]?.meal || <span style={{ color: '#9A8F8C' }}>{d.rsvp.noChoice}</span>}
          {rows[i]?.diet && <span style={{ display: 'block', color: '#8B3A2A', fontSize: 12 }}>{rows[i].diet}</span>}
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 24px', minWidth: 150 }}>
      <p style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#9A8F8C', margin: '0 0 6px', fontFamily: 'system-ui', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 700, color: accent, margin: 0, fontFamily: 'system-ui', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9A8F8C', margin: '4px 0 0', fontFamily: 'system-ui' }}>{sub}</p>}
    </div>
  );
}
