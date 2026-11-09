import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listOwnedPages } from '@/app/lib/data';
import { siteHref } from '@/app/lib/app-url';
import { savePlanFromLink } from '@/app/lib/plan-actions';
import { budgetFromHash, guestPlanFromHash, parsePlanLink, PLAN_TOOLS, rsvpTimelineFromHash, type PlanLink } from '@/app/lib/saved-plans';
import { fetchPlanTools } from '@/app/lib/saved-plans-data';
import { formatMoney } from '@/app/lib/marketing/tool-money';
import { formatDay, rsvpPlan } from '@/app/lib/marketing/rsvp-deadline';
import { KeepPendingPlan } from '@/app/ui/dashboard/pending-plan';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
export const metadata: Metadata = { title: 'Save your plan' };

const card: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '22px 24px', maxWidth: 620, marginBottom: 18 };
const muted: React.CSSProperties = { fontSize: 14, color: '#6B6470', margin: 0, lineHeight: 1.6 };

// "Save to my MyGala" from a free planning tool lands here (signed in):
// what's being saved, and which event it's for. Saving is a button, never
// the link itself, so a link can't overwrite a saved plan.
export default async function SavePlanPage({ searchParams }: { searchParams: Promise<{ plan?: string; page?: string }> }) {
  const d = await getDashText();
  const [params, session] = await Promise.all([searchParams, auth()]);
  const userId = session?.user?.id;
  if (!userId) redirect('/login');
  const link = parsePlanLink(params.plan);

  if (!link) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 8px' }}>{d.shellSavePlan.nothingToSave}</h1>
        <p style={muted}>{rich(d.shellSavePlan.thisLinkDoesnTHold, { t0: (s) => <a href={siteHref('/tools')} style={{ color: '#B6584A', fontWeight: 600 }}>{s}</a>, t1: (s) => <strong>{s}</strong> })}</p>
      </div>
    );
  }

  const tool = PLAN_TOOLS[link.tool];
  const pages = await listOwnedPages(userId);
  const chosen = pages.find((p) => String(p.id) === params.page) ?? pages.at(-1);
  const withPlan = new Set(
    (await Promise.all(pages.map(async (p) => ((await fetchPlanTools(Number(p.id))).includes(link.tool) ? Number(p.id) : null)))).filter((id) => id !== null),
  );

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{fill(d.shellSavePlan.saveYour, { thing: tool.thing })}</h1>
      <p style={{ ...muted, marginBottom: 20 }}>{d.shellSavePlan.fromThe} {tool.name.toLowerCase()}.</p>

      <section style={card}><PlanPreview link={link} /></section>

      {pages.length === 0 ? (
        <section style={card}>
          <KeepPendingPlan plan={link} />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.shellSavePlan.firstCreateYourEventPage}</h2>
          <p style={{ ...muted, marginBottom: 14 }}>{fill(d.shellSavePlan.yourIsSavedToAn, { thing: tool.thing })}</p>
          <Link href="/dashboard/setup" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 8, background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            {d.shellSavePlan.createMyEventPage}
          </Link>
        </section>
      ) : (
        <form action={savePlanFromLink} style={card}>
          <input type="hidden" name="plan" value={link.hash.slice(1)} />
          {pages.length > 1 ? (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6 }}>{d.shellSavePlan.whichEventIsItFor}</span>
              <select name="pageId" defaultValue={chosen ? String(chosen.id) : undefined}
                style={{ width: '100%', maxWidth: 420, padding: '9px 10px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#241F2B', background: '#fff' }}>
                {pages.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.heading || d.shellSavePlan.untitledEvent}{withPlan.has(Number(p.id)) ? fill(d.shellSavePlan.replacesItsSaved, { thing: tool.thing }) : ''}</option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <input type="hidden" name="pageId" value={String(pages[0].id)} />
              <p style={{ ...muted, marginBottom: 14 }}>{d.shellSavePlan.for} <strong style={{ color: '#241F2B' }}>{pages[0].heading || d.shellSavePlan.yourEvent}</strong>.</p>
            </>
          )}
          {withPlan.size > 0 && (
            <p style={{ ...muted, fontSize: 13, marginBottom: 14 }}>
              {link.tool === 'budget'
                ? d.shellSavePlan.savingOverABudgetKeeps
                : fill(d.shellSavePlan.savingOverAReplacesIt, { thing: tool.thing })}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {d.shellSavePlan.saveTo} {pages.length > 1 ? d.shellSavePlan.thisEvent : d.shellSavePlan.myEvent}
            </button>
            <a href={siteHref(`${tool.toolPath}${link.hash}`)} style={{ fontSize: 14, color: '#6B6470' }}>{d.shellSavePlan.backToThe} {tool.name.toLowerCase()}</a>
          </div>
        </form>
      )}
    </div>
  );
}

async function PlanPreview({ link }: { link: PlanLink }) {
  const d = await getDashText();
  const h2: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 8px' };
  if (link.tool === 'budget') {
    const b = budgetFromHash(link.hash)!;
    return (
      <>
        <h2 style={h2}>{formatMoney(b.total, b.currency)} {fill(d.shellSavePlan.forGuests, { guests: b.guests })}</h2>
        <ul style={{ ...muted, paddingLeft: 18 }}>
          {b.lines.slice(0, 5).map((l) => <li key={l.id}>{l.label}: {formatMoney(l.estimate, b.currency)}</li>)}
          {b.lines.length > 5 && <li>{d.shellSavePlan.and} {b.lines.length - 5} {d.shellSavePlan.more}</li>}
        </ul>
        <p style={{ ...muted, marginTop: 10 }}>{d.shellSavePlan.inYourDashboardItBecomes}</p>
      </>
    );
  }
  if (link.tool === 'rsvp') {
    const r = rsvpTimelineFromHash(link.hash)!;
    const plan = rsvpPlan(r.eventDate, r.type, r.finalCountDays, r.seating);
    return (
      <>
        <h2 style={h2}>{d.shellSavePlan.rsvpDeadline} {formatDay(plan.deadline)}</h2>
        <p style={muted}>{d.shellSavePlan.forAnEventOn} {formatDay(r.eventDate)}{fill(d.shellSavePlan.withDatesFrom, { length: plan.steps.length })} {plan.steps[0].title.toLowerCase()} {d.shellSavePlan.toTheDayItself}</p>
        <p style={{ ...muted, marginTop: 10 }}>{d.shellSavePlan.inYourDashboardItBecomes2}</p>
      </>
    );
  }
  const g = guestPlanFromHash(link.hash)!;
  return (
    <>
      <h2 style={h2}>{fill(d.shellSavePlan.aboutOfInvitedGuestsComing, { expected: g.expected, invited: g.invited })}</h2>
      <p style={muted}>{fill(d.shellSavePlan.likelyBetweenAnd, { low: g.low, high: g.high })}{g.capacity ? fill(d.shellSavePlan.forAVenueThatHolds, { capacity: g.capacity }) : ''}.</p>
      <p style={{ ...muted, marginTop: 10 }}>{d.shellSavePlan.itShowsOnYourGuest}</p>
    </>
  );
}
