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

const card: React.CSSProperties = { background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '22px 24px', maxWidth: 620, marginBottom: 18 };
const muted: React.CSSProperties = { fontSize: 14, color: '#6B6470', margin: 0, lineHeight: 1.6 };

// "Save to my MyGala" from a free planning tool lands here (signed in):
// what's being saved, and which event it's for. Saving is a button, never
// the link itself, so a link can't overwrite a saved plan.
export default async function SavePlanPage({ searchParams }: { searchParams: Promise<{ plan?: string; page?: string }> }) {
  const [params, session] = await Promise.all([searchParams, auth()]);
  const userId = session?.user?.id;
  if (!userId) redirect('/login');
  const link = parsePlanLink(params.plan);

  if (!link) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 8px' }}>Nothing to save</h1>
        <p style={muted}>This link doesn&rsquo;t hold a plan. Open one of our <a href={siteHref('/tools')} style={{ color: '#B6584A', fontWeight: 600 }}>free planning tools</a> and click <strong>Save to my MyGala</strong>.</p>
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
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Save your {tool.thing}</h1>
      <p style={{ ...muted, marginBottom: 20 }}>From the {tool.name.toLowerCase()}.</p>

      <section style={card}><PlanPreview link={link} /></section>

      {pages.length === 0 ? (
        <section style={card}>
          <KeepPendingPlan plan={link} />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>First, create your event page</h2>
          <p style={{ ...muted, marginBottom: 14 }}>Your {tool.thing} is saved to an event. Make yours in a minute, and we&rsquo;ll offer to save it as soon as you&rsquo;re in.</p>
          <Link href="/dashboard/setup" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 8, background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Create my event page
          </Link>
        </section>
      ) : (
        <form action={savePlanFromLink} style={card}>
          <input type="hidden" name="plan" value={link.hash.slice(1)} />
          {pages.length > 1 ? (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6 }}>Which event is it for?</span>
              <select name="pageId" defaultValue={chosen ? String(chosen.id) : undefined}
                style={{ width: '100%', maxWidth: 420, padding: '9px 10px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#241F2B', background: '#fff' }}>
                {pages.map((p) => (
                  <option key={p.id} value={String(p.id)}>{p.heading || 'Untitled event'}{withPlan.has(Number(p.id)) ? ` (replaces its saved ${tool.thing})` : ''}</option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <input type="hidden" name="pageId" value={String(pages[0].id)} />
              <p style={{ ...muted, marginBottom: 14 }}>For <strong style={{ color: '#241F2B' }}>{pages[0].heading || 'your event'}</strong>.</p>
            </>
          )}
          {withPlan.size > 0 && (
            <p style={{ ...muted, fontSize: 13, marginBottom: 14 }}>
              {link.tool === 'budget'
                ? 'Saving over a budget keeps what you’ve entered as spent, deposits and notes; the estimates change to this plan.'
                : `Saving over a ${tool.thing} replaces it with this one.`}
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Save to {pages.length > 1 ? 'this event' : 'my event'}
            </button>
            <a href={siteHref(`${tool.toolPath}${link.hash}`)} style={{ fontSize: 14, color: '#6B6470' }}>Back to the {tool.name.toLowerCase()}</a>
          </div>
        </form>
      )}
    </div>
  );
}

function PlanPreview({ link }: { link: PlanLink }) {
  const h2: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 8px' };
  if (link.tool === 'budget') {
    const b = budgetFromHash(link.hash)!;
    return (
      <>
        <h2 style={h2}>{formatMoney(b.total, b.currency)} for {b.guests} guests</h2>
        <ul style={{ ...muted, paddingLeft: 18 }}>
          {b.lines.slice(0, 5).map((l) => <li key={l.id}>{l.label}: {formatMoney(l.estimate, b.currency)}</li>)}
          {b.lines.length > 5 && <li>and {b.lines.length - 5} more</li>}
        </ul>
        <p style={{ ...muted, marginTop: 10 }}>In your dashboard it becomes a budget tracker: what you&rsquo;ve spent against each estimate, and deposits as they come due.</p>
      </>
    );
  }
  if (link.tool === 'rsvp') {
    const r = rsvpTimelineFromHash(link.hash)!;
    const plan = rsvpPlan(r.eventDate, r.type, r.finalCountDays, r.seating);
    return (
      <>
        <h2 style={h2}>RSVP deadline: {formatDay(plan.deadline)}</h2>
        <p style={muted}>For an event on {formatDay(r.eventDate)}, with {plan.steps.length} dates from {plan.steps[0].title.toLowerCase()} to the day itself.</p>
        <p style={{ ...muted, marginTop: 10 }}>In your dashboard it becomes your planning timeline, and we email you a reminder on each date.</p>
      </>
    );
  }
  const g = guestPlanFromHash(link.hash)!;
  return (
    <>
      <h2 style={h2}>About {g.expected} of {g.invited} invited guests coming</h2>
      <p style={muted}>Likely between {g.low} and {g.high}{g.capacity ? `, for a venue that holds ${g.capacity}` : ''}.</p>
      <p style={{ ...muted, marginTop: 10 }}>It shows on your Guest List, next to the guests you&rsquo;ve actually added.</p>
    </>
  );
}
