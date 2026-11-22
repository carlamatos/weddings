'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAX_PARTY_SIZE, partySize } from '@/app/lib/guest-import';
import { btn, input } from './guest-ui';
import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';

// Invite → Send: add a guest without leaving the screen. Saved to the same
// guest list as Guests & RSVPs (POST /api/invitees, which skips anyone
// already on it); onAdded gets the new guest's id so the sender can tick
// them, ready to send. Importing a whole list stays in Guests & RSVPs.
export function QuickAddGuest({ pageId, onAdded }: { pageId: number; onAdded?: (ids: string[]) => void }) {
  const d = useDashText();
  const g = d.guestListManager;
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: '1' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/invitees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, contacts: [{ name: form.name, email: form.email || undefined, phone: form.phone || undefined, guests: partySize(form.guests) }] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ kind: 'error', text: data.error ?? g.couldNotAddGuestsPlease });
        return;
      }
      if (!data.imported) {
        setNotice({ kind: 'error', text: d.invitationSender.alreadyOnYourList });
        return;
      }
      setNotice({ kind: 'ok', text: fill(d.invitationSender.guestAdded, { name: form.name.trim() }) });
      setForm({ name: '', email: '', phone: '', guests: '1' });
      onAdded?.(Array.isArray(data.ids) ? data.ids.map(String) : []);
      router.refresh();
    } catch {
      setNotice({ kind: 'error', text: g.couldNotAddGuestsPlease2 });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ margin: '12px 0 16px', padding: '14px 16px', border: '1px solid #EDE8E3', borderRadius: 10, background: '#FBF9F7' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#241F2B' }}>{d.invitationSender.addAGuest}</h3>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6B6470', lineHeight: 1.5 }}>{d.invitationSender.addAGuestHint}</p>
      <form onSubmit={add} className="quick-add-guest" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 2fr) minmax(140px, 2fr) minmax(110px, 1.5fr) 72px auto', gap: 8 }}>
        <input aria-label={g.name} placeholder={g.name} style={input} value={form.name} maxLength={120} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input aria-label={g.email} placeholder={g.email} type="email" style={input} value={form.email} maxLength={254} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input aria-label={g.phone} placeholder={g.phone} type="tel" style={input} value={form.phone} maxLength={40} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input aria-label={g.numberOfGuests} title={g.numberOfGuests} type="number" min={1} max={MAX_PARTY_SIZE} style={input} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
        <button type="submit" style={btn} disabled={busy || !form.name.trim()}>{busy ? g.adding : g.addGuest2}</button>
      </form>
      <style>{`@media (max-width: 700px) { .quick-add-guest { grid-template-columns: 1fr 1fr !important; } }`}</style>
      {notice && <p role="status" style={{ fontSize: 13, margin: '10px 0 0', color: notice.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{notice.text}</p>}
    </div>
  );
}
