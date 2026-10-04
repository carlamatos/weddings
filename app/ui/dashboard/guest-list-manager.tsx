'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeGuest } from '@/app/lib/actions';
import { INVITATION_NOTE_MAX } from '@/app/lib/invitation';
import type { Guest } from '@/app/lib/definitions';
import {
  MAX_IMPORT,
  MAX_PARTY_SIZE,
  SAMPLE_CSV,
  canPickContacts,
  csvBlob,
  guestsFromCsv,
  guestsFromVCard,
  partySize,
  pickContacts,
  type ImportedGuest,
} from '@/app/lib/guest-import';
import { STATUS, btn, card, cell, headCell, input, primary, statusPill } from './guest-ui';

// Guests → Guest List (every plan): build the list from a spreadsheet, a
// contacts file, the phone's contacts or by hand, and remove guests. Sending
// invitations to them is on the Invitations screen (Plus).
export function GuestListManager({ pageId, guests, isPaid, invitationsHref }: { pageId: number; guests: Guest[]; isPaid: boolean; invitationsHref: string }) {
  const router = useRouter();
  const csvRef = useRef<HTMLInputElement>(null);
  const vcfRef = useRef<HTMLInputElement>(null);
  const [phonePicker, setPhonePicker] = useState(false);
  const [pending, setPending] = useState<{ source: string; guests: ImportedGuest[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', guests: '1', phone: '', note: '' });
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability, only known after mount
    setPhonePicker(canPickContacts());
  }, []);

  async function send(list: ImportedGuest[]): Promise<boolean> {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/invitees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, contacts: list }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ kind: 'error', text: data.error ?? 'Could not add guests. Please try again.' });
        return false;
      }
      const skipped = data.skipped ? ` ${data.skipped} already on your list or missing a name were skipped.` : '';
      setNotice({ kind: 'ok', text: `Added ${data.imported} guest${data.imported === 1 ? '' : 's'}.${skipped}` });
      router.refresh();
      return true;
    } catch {
      setNotice({ kind: 'error', text: 'Could not add guests. Please check your connection.' });
      return false;
    } finally {
      setBusy(false);
    }
  }

  function review(source: string, list: ImportedGuest[]) {
    setNotice(null);
    if (!list.length) {
      setNotice({ kind: 'error', text: `No guests found in that ${source}. Check that it has a name column.` });
      return;
    }
    if (list.length > MAX_IMPORT) {
      setNotice({ kind: 'error', text: `That ${source} has ${list.length} guests — please add up to ${MAX_IMPORT} at a time.` });
      return;
    }
    setPending({ source, guests: list });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>, kind: 'csv' | 'vcf') {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    review(kind === 'csv' ? 'CSV file' : 'contacts file', kind === 'csv' ? guestsFromCsv(text) : guestsFromVCard(text));
  }

  async function fromPhone() {
    try {
      review('selection', await pickContacts());
    } catch {
      // Picker closed without choosing anyone.
    }
  }

  function downloadSample() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(csvBlob(SAMPLE_CSV));
    a.download = 'guest-list-sample.csv';
    a.click();
  }

  async function addOne(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const note = isPaid ? form.note.trim() || undefined : undefined;
    const ok = await send([{ name: form.name, email: form.email || undefined, phone: form.phone || undefined, guests: partySize(form.guests), note }]);
    if (ok) setForm({ name: '', email: '', guests: '1', phone: '', note: '' });
  }

  async function remove(g: Guest) {
    if (!window.confirm(`Remove ${g.name} from your guest list? Their RSVP, if any, is removed too.`)) return;
    setRemoving(g.id);
    let ok = false;
    try {
      ok = (await removeGuest(pageId, g.id)).ok;
    } catch {
      ok = false;
    }
    setRemoving(null);
    if (ok) router.refresh();
    else setNotice({ kind: 'error', text: 'Could not remove that guest.' });
  }

  const totalPeople = guests.reduce((sum, g) => sum + (g.guests || 1), 0);

  return (
    <section style={card}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>Add guests</h2>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>
        Add the people you&rsquo;re inviting. They appear as <strong>Invited</strong> on your RSVP screen and switch to Attending or
        Declining when they reply on your page with the same email.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {phonePicker && <button type="button" style={primary} onClick={fromPhone} disabled={busy}>📱 Choose from my phone’s contacts</button>}
        <button type="button" style={phonePicker ? btn : primary} onClick={() => csvRef.current?.click()} disabled={busy}>⬆ Upload a CSV / spreadsheet</button>
        <button type="button" style={btn} onClick={() => vcfRef.current?.click()} disabled={busy}>⬆ Upload contacts (.vcf)</button>
        <button type="button" style={btn} onClick={downloadSample}>↓ Download sample CSV</button>
        <input ref={csvRef} type="file" accept=".csv,text/csv,.txt" style={{ display: 'none' }} onChange={(e) => onFile(e, 'csv')} />
        <input ref={vcfRef} type="file" accept=".vcf,text/vcard,text/x-vcard" style={{ display: 'none' }} onChange={(e) => onFile(e, 'vcf')} />
      </div>

      <details style={{ fontSize: 13, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>
        <summary style={{ cursor: 'pointer', color: '#241F2B', fontWeight: 600 }}>How do I bring in contacts from my phone?</summary>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li><strong>Android (Chrome):</strong> open this page on your phone and tap “Choose from my phone’s contacts”.</li>
          <li><strong>iPhone:</strong> in the Contacts app, tap <em>Lists</em>, touch and hold a list (for example one you made for this event) and choose <em>Export</em> → <em>Save to Files</em>. For one person, open the contact and tap <em>Share Contact</em>. Then tap “Upload contacts (.vcf)” here and pick the file.</li>
          <li><strong>Google Contacts:</strong> select people → <em>Export</em> → vCard or Google CSV, then upload the file.</li>
          <li><strong>Outlook / Excel:</strong> save as CSV with the columns Name, Email, Guests, Phone{isPaid ? ' and, optionally, Invitation Notes' : ''} (see the sample). Guests left blank count as 1.</li>
        </ul>
      </details>

      {pending && (
        <div style={{ border: '1px solid #E8D9A8', background: '#FFFBF0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: '#241F2B' }}>
            Found <strong>{pending.guests.length}</strong> guest{pending.guests.length === 1 ? '' : 's'} in your {pending.source}:
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20, fontSize: 13, color: '#6B6470' }}>
            {pending.guests.slice(0, 5).map((g, i) => (
              <li key={i}>{g.name}{g.email ? ` · ${g.email}` : ''}{g.guests > 1 ? ` · party of ${g.guests}` : ''}{g.phone ? ` · ${g.phone}` : ''}{isPaid && g.note ? ' · 📝 note' : ''}</li>
            ))}
            {pending.guests.length > 5 && <li>…and {pending.guests.length - 5} more</li>}
          </ul>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={primary} disabled={busy} onClick={async () => { if (await send(pending.guests)) setPending(null); }}>
              {busy ? 'Adding…' : `Add ${pending.guests.length} guest${pending.guests.length === 1 ? '' : 's'}`}
            </button>
            <button type="button" style={btn} disabled={busy} onClick={() => setPending(null)}>Cancel</button>
          </div>
        </div>
      )}

      {notice && <p role="status" style={{ fontSize: 14, margin: '0 0 14px', color: notice.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{notice.text}</p>}

      <form onSubmit={addOne} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 2fr) minmax(140px, 2fr) 80px minmax(110px, 1.5fr) auto', gap: 8, marginBottom: 22 }} className="guest-add-form">
        <input aria-label="Name" placeholder="Name" style={input} value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input aria-label="Email" placeholder="Email" type="email" style={input} value={form.email} maxLength={254} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input aria-label="Number of guests" title="Number of guests" type="number" min={1} max={MAX_PARTY_SIZE} style={input} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
        <input aria-label="Phone" placeholder="Phone" type="tel" style={input} value={form.phone} maxLength={40} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button type="submit" style={btn} disabled={busy || !form.name.trim()}>+ Add guest</button>
        {isPaid && (
          <textarea
            aria-label="Invitation notes"
            placeholder="Invitation notes (optional) — a personal message added to this guest's invitation"
            rows={2}
            maxLength={INVITATION_NOTE_MAX}
            style={{ ...input, gridColumn: '1 / -1', resize: 'vertical', lineHeight: 1.5 }}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        )}
      </form>
      <style>{`@media (max-width: 700px) { .guest-add-form { grid-template-columns: 1fr 1fr !important; } }`}</style>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: 0 }}>
          Your guests {guests.length > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: '#6B6470' }}>· {guests.length} {guests.length === 1 ? 'entry' : 'entries'}, {totalPeople} {totalPeople === 1 ? 'person' : 'people'}</span>}
        </h2>
        {guests.length > 0 && (
          <Link href={invitationsHref} style={{ fontSize: 14, fontWeight: 600, color: '#B6584A', textDecoration: 'none' }}>
            {isPaid ? 'Send invitations →' : 'Send invitations by email, text or WhatsApp with Plus →'}
          </Link>
        )}
      </div>

      {guests.length === 0 ? (
        <p style={{ fontSize: 14, color: '#9A8F8C', margin: 0 }}>Your guest list is empty.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Phone', 'Guests', 'Status', ''].map((h) => <th key={h} style={headCell}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => {
                const [text, style] = STATUS[g.status] ?? STATUS.invited;
                return (
                  <tr key={g.id}>
                    <td style={{ ...cell, fontWeight: 500 }}>{g.name}</td>
                    <td style={{ ...cell, color: '#6B6470', overflowWrap: 'anywhere' }}>{g.email || '—'}</td>
                    <td style={{ ...cell, color: '#6B6470', whiteSpace: 'nowrap' }}>{g.phone || '—'}</td>
                    <td style={{ ...cell, textAlign: 'center' }}>{g.guests || 1}</td>
                    <td style={cell}><span style={{ ...statusPill, ...style }}>{text}</span></td>
                    <td style={{ ...cell, textAlign: 'right' }}>
                      <button type="button" style={{ ...btn, padding: '6px 12px', fontSize: 13 }} disabled={removing === g.id} onClick={() => remove(g)}>
                        {removing === g.id ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
