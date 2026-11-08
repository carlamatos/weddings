'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  RSVP_EVENT_TYPES, addMonths, daysBetween, formatDay, isDate, rsvpCalendar, rsvpPlan, type RsvpEventType,
} from '@/app/lib/marketing/rsvp-deadline';
import { CopyLinkButton, NumberField } from './tool-fields';

// The RSVP deadline calculator in the RSVP guide: from the event date, the
// kind of event and when the caterer needs final numbers, it sets the RSVP
// deadline and the dates around it (see app/lib/marketing/rsvp-deadline.ts),
// ready to copy onto the invitation or add to a calendar. Shared with a link
// (#rsvp=2027-06-12.wedding.14.1).

const HASH = /^#rsvp=(\d{4}-\d{2}-\d{2})\.([a-z]+)\.(\d{1,2})\.([01])$/;

function relative(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 0) return days < 60 ? `In ${days} days` : `In ${Math.round(days / 30.4)} months`;
  return 'Already passed';
}

export default function RsvpTool() {
  const [today, setToday] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [type, setType] = useState<RsvpEventType>('wedding');
  const [finalDays, setFinalDays] = useState(14);
  const [seating, setSeating] = useState(true);
  const [copied, setCopied] = useState(false);

  // Today's date comes from the visitor's clock, so it's set after loading;
  // a shared link opens with its plan, otherwise a date nine months out.
  useEffect(() => {
    const now = new Date();
    const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const m = HASH.exec(window.location.hash);
    const sharedType = m && RSVP_EVENT_TYPES.find((t) => t.id === m[2]);
    /* eslint-disable react-hooks/set-state-in-effect -- read once from the clock and the URL after hydration */
    setToday(local);
    if (m && sharedType && isDate(m[1])) {
      setEventDate(m[1]);
      setType(sharedType.id);
      setFinalDays(Math.max(1, Math.min(60, Number(m[3]))));
      setSeating(m[4] === '1');
    } else {
      setEventDate(addMonths(local, 9));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const valid = isDate(eventDate);
  const plan = useMemo(() => (valid ? rsvpPlan(eventDate, type, finalDays, seating) : null), [valid, eventDate, type, finalDays, seating]);
  const wording = plan ? `Kindly reply by ${formatDay(plan.deadline, false)}` : '';

  function chooseType(id: RsvpEventType) {
    const t = RSVP_EVENT_TYPES.find((x) => x.id === id)!;
    setType(id);
    setFinalDays(t.finalCountDays);
    setSeating(t.seating);
  }

  async function copyWording() {
    try {
      await navigator.clipboard.writeText(wording);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the wording is on screen to copy by hand.
    }
  }

  function downloadCalendar() {
    if (!plan) return;
    const url = URL.createObjectURL(new Blob([rsvpCalendar(plan.steps)], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rsvp-timeline.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pt ft" id="rsvp-tool">
      <div className="pt-step">
        <h3 className="pt-step-title"><span>1</span> Your event</h3>
        <fieldset className="pt-question">
          <legend>Type of event</legend>
          <div className="pt-chips">
            {RSVP_EVENT_TYPES.map((t) => (
              <button key={t.id} type="button" className="pt-chip" aria-pressed={type === t.id} onClick={() => chooseType(t.id)}>{t.label}</button>
            ))}
          </div>
        </fieldset>
        <div className="ft-fields">
          <label className="ft-field">
            <span className="ft-label">Event date</span>
            <input className="ft-input" type="date" value={eventDate} min={today || undefined} onChange={(e) => setEventDate(e.target.value)} />
          </label>
          <NumberField label="Final count due" value={finalDays} onChange={setFinalDays} min={1} max={60} suffix="days before" hint="Ask your caterer or venue. Most need it 7 to 14 days before." />
        </div>
        <label className="ft-check">
          <input type="checkbox" checked={seating} onChange={(e) => setSeating(e.target.checked)} />
          <span>I’ll make a seating chart <small>(adds a few days to place everyone)</small></span>
        </label>
      </div>

      <div className="pt-step" aria-live="polite">
        <h3 className="pt-step-title"><span>2</span> Your RSVP deadline</h3>
        {!plan ? (
          <p className="pt-help">Pick your event date to see your deadline.</p>
        ) : (
          <>
            <div className="ft-answer">
              <p className="ft-answer-date">{formatDay(plan.deadline)}</p>
              <p className="ft-answer-note">
                {daysBetween(plan.deadline, eventDate)} days before your event
                {today && daysBetween(today, plan.deadline) < 14 && daysBetween(today, plan.deadline) >= 0 && ' · that’s soon, so send invitations right away'}
                {today && daysBetween(today, plan.deadline) < 0 && ' · this date has passed, so ask guests to reply as soon as they can'}
              </p>
              <div className="ft-wording">
                <span>“{wording}”</span>
                <button type="button" className="pt-btn" onClick={copyWording}>{copied ? 'Copied!' : 'Copy wording'}</button>
              </div>
            </div>
            <ol className="ft-timeline">
              {plan.steps.map((s) => {
                const days = today ? daysBetween(today, s.date) : null;
                return (
                  <li key={s.id} className={`${s.key ? 'ft-key' : ''}${days !== null && days < 0 ? ' ft-past' : ''}`}>
                    <p className="ft-when"><time dateTime={s.date}>{formatDay(s.date)}</time>{days !== null && <span>{relative(days)}</span>}</p>
                    <p className="ft-what">{s.title}</p>
                    <p className="ft-why">{s.text}{s.link && <> <Link href={s.link.href}>{s.link.label} →</Link></>}</p>
                  </li>
                );
              })}
            </ol>
            <div className="pt-actions">
              <button type="button" className="pt-btn pt-btn--main" onClick={downloadCalendar}>Add these dates to my calendar</button>
              <CopyLinkButton hash={`#rsvp=${eventDate}.${type}.${finalDays}.${seating ? 1 : 0}`} label="Copy link" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
