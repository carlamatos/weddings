'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { deletePlan, updateTimeline } from '@/app/lib/plan-actions';
import { daysBetween, formatDay } from '@/app/lib/marketing/rsvp-deadline';
import { STEP_SCREENS, timelineSteps } from '@/app/lib/plan-timeline';
import type { RsvpTimelinePlan } from '@/app/lib/saved-plans';
import { btn, card } from './guest-ui';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import type { DashText } from '@/app/lib/dash-text/en';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
function relative(days: number, t: DashText['planTimeline']): string {
  if (days === 0) return t.today;
  if (days === 1) return t.tomorrow;
  if (days === -1) return t.yesterday;
  if (days > 0) return days < 60 ? fill(t.inDays, { n: days }) : fill(t.inWeeks, { n: Math.round(days / 7) });
  return days > -60 ? fill(t.daysAgo, { n: -days }) : fill(t.weeksAgo, { n: Math.round(-days / 7) });
}

// Timeline (Planning): the RSVP plan from the free calculator, step by step,
// each with the screen where it's done. Steps get ticked off; reminder emails
// go to the host on each date (the plan reminders cron).
export function PlanTimeline({ pageId, initial, pageDate, base, today, email, calculatorHref }: {
  pageId: number; initial: RsvpTimelinePlan; pageDate: string | null; base: string; today: string; email?: string; calculatorHref: string;
}) {
  const d = useDashText();
  const [plan, setPlan] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [gone, setGone] = useState(false);
  const { deadline, steps } = timelineSteps(plan);

  const change = (next: RsvpTimelinePlan, c: Parameters<typeof updateTimeline>[1]) => {
    setPlan(next);
    startTransition(async () => { await updateTimeline(pageId, c); });
  };

  if (gone) return <p style={{ fontSize: 14, color: '#6B6470' }}>{rich(d.planTimeline.yourTimelineIsDeletedMake, { t0: (s) => <a href={calculatorHref} style={{ color: '#B6584A', fontWeight: 600 }}>{s}</a> })}</p>;

  const nextStep = steps.find((s) => s.date >= today && !plan.done.includes(s.id));

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 820 }}>
      <section style={{ ...card, padding: '18px 22px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', margin: '0 0 4px' }}>{d.planTimeline.rsvpDeadline}</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#241F2B', margin: 0 }}>{formatDay(deadline)}</p>
        </div>
        {nextStep && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', margin: '0 0 4px' }}>{d.planTimeline.nextUp}</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#241F2B', margin: 0 }}>{nextStep.title} · <span style={{ color: '#B6584A' }}>{relative(daysBetween(today, nextStep.date), d.planTimeline)}</span></p>
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginLeft: 'auto', maxWidth: 320, cursor: 'pointer', fontSize: 14, color: '#241F2B', lineHeight: 1.45 }}>
          <input type="checkbox" checked={plan.reminders} disabled={pending} onChange={(e) => change({ ...plan, reminders: e.target.checked }, { reminders: e.target.checked })} style={{ marginTop: 3, accentColor: '#B6584A' }} />
          <span>
            <strong>{d.planTimeline.emailMeOnEachDate}</strong>
            <span style={{ display: 'block', fontSize: 12.5, color: '#6B6470' }}>{d.planTimeline.aShortReminder}{email ? ` to ${email}` : ''} {d.planTimeline.theMorningOfEachStep}</span>
          </span>
        </label>
      </section>

      {pageDate && pageDate !== plan.eventDate && pageDate >= today && (
        <div role="status" style={{ ...card, padding: '12px 16px', background: '#FFF8E7', borderColor: '#E8D9A8', color: '#6B5200', fontSize: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>{d.planTimeline.thisTimelineIsFor} <strong>{formatDay(plan.eventDate)}</strong>{d.planTimeline.butYourPageSays} <strong>{formatDay(pageDate)}</strong>.</span>
          <button type="button" style={{ ...btn, padding: '6px 12px', fontSize: 13 }} disabled={pending}
            onClick={() => change({ ...plan, eventDate: pageDate, sent: [] }, { eventDate: pageDate })}>
            {d.planTimeline.moveItTo} {formatDay(pageDate, false)}
          </button>
        </div>
      )}

      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
        {steps.map((s) => {
          const done = plan.done.includes(s.id);
          const days = daysBetween(today, s.date);
          const late = days < 0 && !done && s.id !== 'event';
          const screen = STEP_SCREENS[s.id];
          return (
            <li key={s.id} style={{ ...card, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', opacity: done ? 0.65 : 1, borderColor: s.key ? '#E6C9C2' : '#EDE8E3' }}>
              {s.id === 'event' ? (
                <span aria-hidden="true" style={{ width: 20, textAlign: 'center', fontSize: 16 }}>🎉</span>
              ) : (
                <button type="button" aria-pressed={done} aria-label={done ? fill(d.planTimeline.markAsNotDone, { title: s.title }) : fill(d.planTimeline.markAsDone, { title: s.title })} disabled={pending}
                  onClick={() => change({ ...plan, done: done ? plan.done.filter((d) => d !== s.id) : [...plan.done, s.id] }, { done: { id: s.id, on: !done } })}
                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: done ? '#3D6B46' : '#C9C1BA', marginTop: 1 }}>
                  {done ? <CheckCircleIcon style={{ width: 22, height: 22 }} /> : <span style={{ display: 'block', width: 18, height: 18, margin: 2, borderRadius: '50%', border: '2px solid currentColor' }} />}
                </button>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, margin: '0 0 2px', color: late ? '#A1361F' : '#6B6470' }}>
                  <time dateTime={s.date}>{formatDay(s.date)}</time> · {relative(days, d.planTimeline)}{late && d.planTimeline.notDoneYet}
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#241F2B', margin: '0 0 4px', textDecoration: done ? 'line-through' : 'none' }}>{s.title}</p>
                <p style={{ fontSize: 13.5, color: '#6B6470', margin: 0, lineHeight: 1.55 }}>{s.text}</p>
              </div>
              {screen && !done && (
                <Link href={`${base}${screen.section}`} style={{ fontSize: 13, fontWeight: 600, color: '#B6584A', textDecoration: 'none', whiteSpace: 'nowrap', alignSelf: 'center' }}>{screen.label} →</Link>
              )}
            </li>
          );
        })}
      </ol>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href={calculatorHref} target="_blank" rel="noopener" style={{ ...btn, color: '#B6584A' }}>{d.planTimeline.changeItInTheCalculator}</a>
        <button type="button" style={{ ...btn, border: 'none', background: 'none', color: '#8B3A2A', marginLeft: 'auto' }}
          onClick={async () => { if (confirm('Delete this timeline? Its reminder emails stop too.')) { if (await deletePlan(pageId, 'rsvp')) setGone(true); } }}>
          {d.planTimeline.deleteThisTimeline}
        </button>
      </div>
    </div>
  );
}
