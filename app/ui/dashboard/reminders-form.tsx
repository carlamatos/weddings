'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveReminderSettings, sendTestReminder } from '@/app/lib/actions';
import { REMINDER_MESSAGE_MAX_LENGTH, REMINDER_OPTIONS, type ReminderKey } from '@/app/lib/reminders';

export type ReminderOptionStatus = {
  key: ReminderKey;
  sendDate: string | null; // YYYY-MM-DD, null without an event date
  passed: boolean; // send date is before today
  sentCount: number; // guests already emailed for the current event date
};

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const card: React.CSSProperties = { border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 20px', background: '#fff', marginBottom: 20 };
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' };
const sub: React.CSSProperties = { fontSize: 13, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6 };

export function RemindersForm({
  pageId,
  initialSchedule,
  initialMessage,
  options,
}: {
  pageId: number;
  initialSchedule: ReminderKey[];
  initialMessage: string;
  options: ReminderOptionStatus[];
}) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Set<ReminderKey>>(new Set(initialSchedule));
  const [message, setMessage] = useState(initialMessage);
  const [saved, setSaved] = useState({ schedule: [...initialSchedule].sort().join(','), message: initialMessage });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [testStatus, setTestStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  const dirty = [...schedule].sort().join(',') !== saved.schedule || message.trim() !== saved.message.trim();

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
      const result = await saveReminderSettings(pageId, { schedule: [...schedule], message });
      if (result.ok) {
        setSaved({ schedule: [...schedule].sort().join(','), message: message.trim() });
        setStatus({ ok: true, text: schedule.size ? 'Saved. Your reminders are scheduled.' : 'Saved. No reminders will be sent.' });
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
        <p style={sub}>Tick one or more. Each reminder goes out in the morning (around 9–10 AM Eastern) on the date shown.</p>
        <div style={{ display: 'grid', gap: 8 }}>
          {REMINDER_OPTIONS.map((opt) => {
            const st = options.find((o) => o.key === opt.key)!;
            const checked = schedule.has(opt.key);
            const unavailable = !st.sendDate || (st.passed && !st.sentCount);
            let note = '';
            if (!st.sendDate) note = 'Add an event date first';
            else if (st.sentCount) note = `Sent ${fmtDate(st.sendDate)} to ${st.sentCount} guest${st.sentCount === 1 ? '' : 's'}`;
            else if (st.passed) note = `Date passed (${fmtDate(st.sendDate)}) — won’t be sent`;
            else note = checked ? `Sends ${fmtDate(st.sendDate)}` : `Would send ${fmtDate(st.sendDate)}`;
            return (
              <label
                key={opt.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, flexWrap: 'wrap',
                  border: `1px solid ${checked ? '#B6584A' : '#EDE8E3'}`, background: checked ? '#FBF3F1' : '#fff',
                  cursor: unavailable ? 'default' : 'pointer', opacity: unavailable ? 0.6 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={unavailable && !checked}
                  onChange={() => toggle(opt.key)}
                  style={{ width: 16, height: 16, accentColor: '#B6584A', margin: 0 }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#241F2B', flex: '1 1 160px' }}>{opt.label}</span>
                <span style={{ fontSize: 13, color: st.sentCount ? '#2F7A4F' : '#6B6470' }}>{note}</span>
              </label>
            );
          })}
        </div>
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
