'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveReminderSettings, sendTestReminder } from '@/app/lib/actions';
import { usePlus } from './plus-gate';
import {
  CUSTOM_REMINDER_MAX, DEFAULT_REMINDER_TIMEZONE, REMINDER_MESSAGE_MAX_LENGTH, REMINDER_OPTIONS, REMINDER_UNIT_LABELS, REMINDER_UNIT_MAX,
  customReminderKey, isHourReminder, isPresetReminderKey, isValidTimeZone, parseReminderSchedule, reminderLabel, reminderSendDate,
  reminderSendInstant, type ReminderKey, type ReminderUnit,
} from '@/app/lib/reminders';

type ReminderOptionStatus = {
  sendDate: string | null; // YYYY-MM-DD, null without an event date
  sendAt: Date | null; // hours-before reminders: the exact moment
  unavailable: string | null; // why it can't be scheduled
  passed: boolean; // send date/time is already behind us
  sentCount: number; // guests already emailed for the current event date
};

// The owner's time zone, from their browser: hours-before reminders read the
// event's start time in it.
function browserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(tz) ? tz : DEFAULT_REMINDER_TIMEZONE;
  } catch {
    return DEFAULT_REMINDER_TIMEZONE;
  }
}

const localIsoDay = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fmtDateTime = (d: Date, timeZone: string) =>
  d.toLocaleString('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const card: React.CSSProperties = { border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 20px', background: '#fff', marginBottom: 20 };
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' };
const sub: React.CSSProperties = { fontSize: 13, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 };
const rowStyle = (checked: boolean, unavailable: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, flexWrap: 'wrap',
  border: `1px solid ${checked ? '#B6584A' : '#EDE8E3'}`, background: checked ? '#FBF3F1' : '#fff',
  cursor: unavailable ? 'default' : 'pointer', opacity: unavailable ? 0.6 : 1,
});

export function RemindersForm({
  pageId,
  initialSchedule,
  initialMessage,
  eventDate,
  eventTime,
  sentCounts,
}: {
  pageId: number;
  initialSchedule: ReminderKey[];
  initialMessage: string;
  eventDate: string | null;
  eventTime: string | null;
  sentCounts: Record<string, number>;
}) {
  const plus = usePlus();
  const router = useRouter();
  const [schedule, setSchedule] = useState<Set<ReminderKey>>(new Set(initialSchedule));
  const [message, setMessage] = useState(initialMessage);
  const [saved, setSaved] = useState({ schedule: [...initialSchedule].sort().join(','), message: initialMessage });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [testStatus, setTestStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  // Set after mount: the server doesn't know the browser's time zone.
  const [timeZone, setTimeZone] = useState(DEFAULT_REMINDER_TIMEZONE);
  useEffect(() => setTimeZone(browserTimeZone()), []);
  const [amount, setAmount] = useState('2');
  const [unit, setUnit] = useState<ReminderUnit>('d');
  const [addError, setAddError] = useState('');

  const dirty = [...schedule].sort().join(',') !== saved.schedule || message.trim() !== saved.message.trim();
  const customKeys = parseReminderSchedule([...schedule].join(',')).filter((k) => !isPresetReminderKey(k));

  function statusOf(key: ReminderKey): ReminderOptionStatus {
    const sentCount = sentCounts[key] ?? 0;
    if (!eventDate) return { sendDate: null, sendAt: null, unavailable: 'Add an event date first', passed: false, sentCount };
    if (isHourReminder(key)) {
      const sendAt = reminderSendInstant(eventDate, eventTime, key, timeZone);
      if (!sendAt) return { sendDate: null, sendAt: null, unavailable: 'Add an event start time first', passed: false, sentCount };
      return { sendDate: null, sendAt, unavailable: null, passed: sendAt.getTime() < Date.now(), sentCount };
    }
    const sendDate = reminderSendDate(eventDate, key);
    return { sendDate, sendAt: null, unavailable: null, passed: sendDate < localIsoDay(), sentCount };
  }

  function noteFor(st: ReminderOptionStatus, checked: boolean): string {
    if (st.unavailable) return st.unavailable;
    const when = st.sendAt ? fmtDateTime(st.sendAt, timeZone) : fmtDate(st.sendDate!);
    if (st.sentCount) return `Sent ${when} to ${st.sentCount} guest${st.sentCount === 1 ? '' : 's'}`;
    if (st.passed) return `Time passed (${when}) — won’t be sent`;
    return checked ? `Sends ${when}` : `Would send ${when}`;
  }

  function addCustom() {
    setStatus(null);
    const n = Number(amount);
    if (!Number.isInteger(n) || n < 1 || n > REMINDER_UNIT_MAX[unit]) {
      setAddError(`Enter a whole number from 1 to ${REMINDER_UNIT_MAX[unit]}.`);
      return;
    }
    // Same as a preset (e.g. 7 days = 1 week)? Tick that one instead.
    const days = unit === 'w' ? n * 7 : unit === 'd' ? n : null;
    const preset = days !== null ? REMINDER_OPTIONS.find((o) => !o.months && o.days === days) : undefined;
    const key = preset ? preset.key : customReminderKey(n, unit);
    if (!key) return;
    if (schedule.has(key)) {
      setAddError('That reminder is already on your list.');
      return;
    }
    if (!preset && customKeys.length >= CUSTOM_REMINDER_MAX) {
      setAddError(`You can add up to ${CUSTOM_REMINDER_MAX} custom reminders.`);
      return;
    }
    setAddError('');
    setSchedule((prev) => new Set(prev).add(key));
  }

  function toggle(key: ReminderKey) {
    setStatus(null);
    setSchedule((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    startSave(async () => {
      const result = await saveReminderSettings(pageId, { schedule: [...schedule], message, timeZone });
      if (result.ok) {
        setSaved({ schedule: [...schedule].sort().join(','), message: message.trim() });
        setStatus({
          ok: true,
          text: !schedule.size ? 'Saved. No reminders will be sent.'
            : plus.paid ? 'Saved. Your reminders are scheduled.'
            : 'Saved. Your reminders will start going out once this event is on Plus.',
        });
        router.refresh(); // re-render the email preview with the new note
      } else {
        setStatus({ ok: false, text: result.error ?? 'Couldn’t save.' });
      }
    });
  }

  function test() {
    startTest(async () => {
      const result = await sendTestReminder(pageId, message);
      setTestStatus({ ok: result.ok, text: result.message });
    });
  }

  return (
    <form onSubmit={save}>
      <section style={card}>
        <h2 style={h2}>When to send</h2>
        <p style={sub}>Tick one or more, or add your own below. Each of these goes out in the morning (around 9–10 AM Eastern) on the date shown.</p>
        <div style={{ display: 'grid', gap: 8 }}>
          {REMINDER_OPTIONS.map((opt) => {
            const st = statusOf(opt.key);
            const checked = schedule.has(opt.key);
            const unavailable = !!st.unavailable || (st.passed && !st.sentCount);
            return (
              <label key={opt.key} style={rowStyle(checked, unavailable)}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={unavailable && !checked}
                  onChange={() => toggle(opt.key)}
                  style={{ width: 16, height: 16, accentColor: '#B6584A', margin: 0 }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#241F2B', flex: '1 1 160px' }}>{opt.label}</span>
                <span style={{ fontSize: 13, color: st.sentCount ? '#2F7A4F' : '#6B6470' }}>{noteFor(st, checked)}</span>
              </label>
            );
          })}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#241F2B', margin: '22px 0 4px' }}>Custom reminders</h3>
        <p style={sub}>
          Choose your own timing in weeks, days or hours before the event. Week and day reminders go out in the morning; hour
          reminders go out that many hours before your event&rsquo;s start time ({timeZone.replace(/_/g, ' ')} time).
        </p>
        {customKeys.length > 0 && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            {customKeys.map((key) => {
              const st = statusOf(key);
              return (
                <div key={key} style={rowStyle(true, !!st.unavailable || (st.passed && !st.sentCount))}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#241F2B', flex: '1 1 160px' }}>{reminderLabel(key)}</span>
                  <span style={{ fontSize: 13, color: st.sentCount ? '#2F7A4F' : '#6B6470' }}>{noteFor(st, true)}</span>
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-label={`Remove the ${reminderLabel(key)} reminder`}
                    style={{ border: 'none', background: 'none', color: '#B6584A', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '2px 4px' }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <label htmlFor="custom-reminder-amount" className="sr-only">Amount</label>
          <input
            id="custom-reminder-amount"
            type="number"
            inputMode="numeric"
            min={1}
            max={REMINDER_UNIT_MAX[unit]}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setAddError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            style={{ width: 80, padding: '9px 10px', border: '1px solid #DDD5CE', borderRadius: 8, fontSize: 14, color: '#241F2B' }}
          />
          <label htmlFor="custom-reminder-unit" className="sr-only">Unit</label>
          <select
            id="custom-reminder-unit"
            value={unit}
            onChange={(e) => { setUnit(e.target.value as ReminderUnit); setAddError(''); }}
            style={{ padding: '9px 10px', border: '1px solid #DDD5CE', borderRadius: 8, fontSize: 14, color: '#241F2B', background: '#fff' }}
          >
            {(['w', 'd', 'h'] as const).map((u) => <option key={u} value={u}>{REMINDER_UNIT_LABELS[u].many}</option>)}
          </select>
          <span style={{ fontSize: 14, color: '#6B6470' }}>before the event</span>
          <button
            type="button"
            onClick={addCustom}
            style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #B6584A', background: '#fff', color: '#B6584A', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Add reminder
          </button>
        </div>
        {addError && <p role="alert" style={{ fontSize: 13, color: '#B91C1C', margin: '8px 0 0' }}>{addError}</p>}
      </section>

      <section style={card}>
        <label htmlFor="reminder-message" style={{ ...h2, display: 'block' }}>Personal message <span style={{ fontWeight: 400, color: '#6B6470', fontSize: 13 }}>(optional)</span></label>
        <p style={sub}>Added to every reminder under &ldquo;A note from your host&rdquo; — for example what to wear, parking tips, or just a warm hello.</p>
        <textarea
          id="reminder-message"
          value={message}
          onChange={(e) => { setMessage(e.target.value); setStatus(null); }}
          maxLength={REMINDER_MESSAGE_MAX_LENGTH}
          rows={5}
          placeholder="We can’t wait to celebrate with you! Parking is available behind the venue."
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #DDD5CE', borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: '#241F2B', fontFamily: 'inherit', resize: 'vertical' }}
        />
        <p style={{ fontSize: 12, color: '#9A8F8C', margin: '4px 0 0', textAlign: 'right' }}>{message.length}/{REMINDER_MESSAGE_MAX_LENGTH}</p>
      </section>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <button
          type="submit"
          disabled={isSaving || !dirty}
          style={{ padding: '11px 22px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isSaving || !dirty ? 'default' : 'pointer', opacity: isSaving || !dirty ? 0.6 : 1 }}
        >
          {isSaving ? 'Saving…' : 'Save reminders'}
        </button>
        <button
          type="button"
          onClick={test}
          disabled={isTesting}
          style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 14, fontWeight: 600, cursor: isTesting ? 'default' : 'pointer' }}
        >
          {isTesting ? 'Sending…' : 'Send a test to me'}
        </button>
      </div>
      {status && <p role="status" style={{ fontSize: 13, margin: '4px 0 0', color: status.ok ? '#2F7A4F' : '#B91C1C' }}>{status.text}</p>}
      {testStatus && <p role="status" style={{ fontSize: 13, margin: '4px 0 0', color: testStatus.ok ? '#2F7A4F' : '#B91C1C' }}>{testStatus.text}</p>}
    </form>
  );
}
