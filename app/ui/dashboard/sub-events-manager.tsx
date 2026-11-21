'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSubEvents } from '@/app/lib/actions';
import { SUB_EVENTS_MAX, SUB_EVENT_TEXT_MAX, newSubEventId, type SubEvent } from '@/app/lib/sub-events';
import { btn, card, input, primary } from './guest-ui';
import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';

// Guests & RSVPs → Events: the separate parts of the celebration (a
// rehearsal dinner, the wedding, a brunch), each guest invited to some or all
// of them in the guest list below (app/lib/sub-events.ts). Shows how many
// are invited to each and how many people are coming.
export type SubEventCounts = Record<string, { invited: number; coming: number; people: number; declined: number }>;

export function SubEventsManager({ pageId, initial, counts }: { pageId: number; initial: SubEvent[]; counts: SubEventCounts }) {
  const d = useDashText();
  const t = d.subEvents;
  const router = useRouter();
  const [list, setList] = useState<SubEvent[]>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [open, setOpen] = useState(initial.length > 0);
  const dirty = JSON.stringify(list) !== saved;

  const set = (i: number, patch: Partial<SubEvent>) => { setList((l) => l.map((e, j) => (j === i ? { ...e, ...patch } : e))); setMessage(null); };

  async function save() {
    setSaving(true);
    setMessage(null);
    let res: Awaited<ReturnType<typeof saveSubEvents>>;
    try {
      res = await saveSubEvents(pageId, list.filter((e) => e.name.trim()));
    } catch {
      res = { ok: false, error: t.couldNotSave };
    }
    setSaving(false);
    if (!res.ok) { setMessage({ kind: 'error', text: res.error }); return; }
    setList(res.value);
    setSaved(JSON.stringify(res.value));
    setMessage({ kind: 'ok', text: t.saved });
    router.refresh();
  }

  return (
    <section id="events" style={{ ...card, scrollMarginTop: 80 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{t.heading}</h2>
        {!open && <button type="button" style={btn} onClick={() => { setOpen(true); if (!list.length) setList([{ id: newSubEventId(), name: '', date: '', time: '', venue: '' }]); }}>{t.addEvents}</button>}
      </div>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6, maxWidth: 680 }}>{t.hint}</p>

      {open && (
        <>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
            {list.map((e, i) => {
              const c = counts[e.id];
              return (
                <li key={e.id} style={{ border: '1px solid #EDE8E3', borderRadius: 10, padding: 12, background: '#FBF9F7' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 2fr) minmax(130px, 1fr) minmax(100px, 0.8fr) minmax(160px, 2fr) auto', gap: 8, alignItems: 'center' }} className="sub-event-row">
                    <input aria-label={t.name} placeholder={t.namePlaceholder} style={input} value={e.name} maxLength={SUB_EVENT_TEXT_MAX.name} onChange={(x) => set(i, { name: x.target.value })} />
                    <input aria-label={t.date} type="date" style={input} value={e.date} onChange={(x) => set(i, { date: x.target.value })} />
                    <input aria-label={t.time} type="time" style={input} value={e.time} onChange={(x) => set(i, { time: x.target.value })} />
                    <input aria-label={t.place} placeholder={t.place} style={input} value={e.venue} maxLength={SUB_EVENT_TEXT_MAX.venue} onChange={(x) => set(i, { venue: x.target.value })} />
                    <button type="button" aria-label={fill(t.remove, { name: e.name || t.thisEvent })} title={t.removeTitle} onClick={() => { setList((l) => l.filter((_, j) => j !== i)); setMessage(null); }} style={{ ...btn, padding: '6px 10px' }}>✕</button>
                  </div>
                  {c && (
                    <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6B6470' }}>
                      {fill(t.counts, { invited: c.invited, coming: c.coming, people: c.people, declined: c.declined })}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          <style>{`@media (max-width: 760px) { .sub-event-row { grid-template-columns: 1fr 1fr !important; } }`}</style>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
            {list.length < SUB_EVENTS_MAX && (
              <button type="button" style={btn} onClick={() => { setList((l) => [...l, { id: newSubEventId(), name: '', date: '', time: '', venue: '' }]); setMessage(null); }}>{t.addAnother}</button>
            )}
            <button type="button" style={{ ...primary, opacity: dirty && !saving ? 1 : 0.55 }} disabled={!dirty || saving} onClick={save}>{saving ? t.saving : t.save}</button>
            {message && <span role="status" style={{ fontSize: 13, color: message.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{message.text}</span>}
          </div>
          {saved !== '[]' && <p style={{ fontSize: 13, color: '#6B6470', margin: '12px 0 0', lineHeight: 1.6 }}>{t.howToInvite}</p>}
        </>
      )}
    </section>
  );
}
