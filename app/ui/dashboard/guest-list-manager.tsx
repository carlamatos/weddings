'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeGuest, updateGuest } from '@/app/lib/actions';
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
import { btn, card, cell, headCell, input, primary } from './guest-ui';
import { GuestStatusSelect } from './guest-status-select';
import { RsvpActions } from './rsvp-actions';
import { LocalDate } from './local-date';
import { personName, readPartyMeals } from '@/app/lib/rsvp-meals';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
// Guests → Guests & RSVPs (every plan): build the list from a spreadsheet, a
// contacts file, the phone's contacts or by hand, and see everyone's reply
// in the same table: change a reply, edit or remove a guest. Guests who
// RSVP on the page join the list by themselves. Sending invitations is on
// the Invite screen. showMeals: the RSVP form asks for meals (or someone
// chose one before), so the table has a Meals column.
export function GuestListManager({ pageId, guests, isPaid, invitationsHref, showMeals = false }: { pageId: number; guests: Guest[]; isPaid: boolean; invitationsHref: string; showMeals?: boolean }) {
  const d = useDashText();
  const router = useRouter();
  const csvRef = useRef<HTMLInputElement>(null);
  const vcfRef = useRef<HTMLInputElement>(null);
  const [phonePicker, setPhonePicker] = useState(false);
  const [pending, setPending] = useState<{ source: string; guests: ImportedGuest[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', guests: '1', phone: '', note: '' });
  const [removing, setRemoving] = useState<string | null>(null);
  // The guest being edited in place (one row at a time).
  const [editing, setEditing] = useState<{ id: string; name: string; email: string; phone: string; guests: string; status: Guest['status'] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

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
        setNotice({ kind: 'error', text: data.error ?? d.guestListManager.couldNotAddGuestsPlease });
        return false;
      }
      const skipped = data.skipped ? fill(d.guestListManager.alreadyOnYourListOr, { skipped: data.skipped }) : '';
      setNotice({ kind: 'ok', text: fill(d.guestListManager.addedGuest, { imported: data.imported, v1: data.imported === 1 ? '' : 's', skipped }) });
      router.refresh();
      return true;
    } catch {
      setNotice({ kind: 'error', text: d.guestListManager.couldNotAddGuestsPlease2 });
      return false;
    } finally {
      setBusy(false);
    }
  }

  function review(source: string, list: ImportedGuest[]) {
    setNotice(null);
    if (!list.length) {
      setNotice({ kind: 'error', text: fill(d.guestListManager.noGuestsFoundInThat, { source }) });
      return;
    }
    if (list.length > MAX_IMPORT) {
      setNotice({ kind: 'error', text: fill(d.guestListManager.thatHasGuestsPleaseAdd, { source, length: list.length, MAX_IMPORT }) });
      return;
    }
    setPending({ source, guests: list });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>, kind: 'csv' | 'vcf') {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    review(kind === 'csv' ? d.guestListManager.csvFile : d.guestListManager.contactsFile, kind === 'csv' ? guestsFromCsv(text) : guestsFromVCard(text));
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
    if (!window.confirm(fill(d.guestListManager.removeFromYourGuestList, { name: g.name }))) return;
    setRemoving(g.id);
    let ok = false;
    try {
      ok = (await removeGuest(pageId, g.id)).ok;
    } catch {
      ok = false;
    }
    setRemoving(null);
    if (ok) router.refresh();
    else setNotice({ kind: 'error', text: d.guestListManager.couldNotRemoveThatGuest });
  }

  function startEdit(g: Guest) {
    setEditError('');
    setEditing({ id: g.id, name: g.name, email: g.email ?? '', phone: g.phone ?? '', guests: String(g.guests || 1), status: g.status });
  }

  async function saveEdit() {
    if (!editing) return;
    if (!editing.name.trim()) { setEditError(d.guestListManager.pleaseEnterAName); return; }
    setSaving(true);
    setEditError('');
    try {
      const res = await updateGuest(pageId, editing.id, { name: editing.name, email: editing.email, phone: editing.phone, guests: editing.guests, status: editing.status });
      if (!res.ok) { setEditError(res.error); return; }
      setEditing(null);
      router.refresh();
    } catch {
      setEditError(d.guestListManager.couldNotSaveThatGuest);
    } finally {
      setSaving(false);
    }
  }

  const totalPeople = guests.reduce((sum, g) => sum + (g.guests || 1), 0);

  return (
    <section id="add-guests" style={{ ...card, scrollMarginTop: 80 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{d.guestListManager.addGuests}</h2>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>
        {rich(d.guestListManager.addThePeopleYouRe, { t0: (s) => <strong>{s}</strong> })}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {phonePicker && <button type="button" style={primary} onClick={fromPhone} disabled={busy}>{d.guestListManager.chooseFromMyPhoneS}</button>}
        <button type="button" style={phonePicker ? btn : primary} onClick={() => csvRef.current?.click()} disabled={busy}>{d.guestListManager.uploadACsvSpreadsheet}</button>
        <button type="button" style={btn} onClick={() => vcfRef.current?.click()} disabled={busy}>{d.guestListManager.uploadContactsVcf}</button>
        <button type="button" style={btn} onClick={downloadSample}>{d.guestListManager.downloadSampleCsv}</button>
        <input ref={csvRef} type="file" accept=".csv,text/csv,.txt" style={{ display: 'none' }} onChange={(e) => onFile(e, 'csv')} />
        <input ref={vcfRef} type="file" accept=".vcf,text/vcard,text/x-vcard" style={{ display: 'none' }} onChange={(e) => onFile(e, 'vcf')} />
      </div>

      <details style={{ fontSize: 13, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 }}>
        <summary style={{ cursor: 'pointer', color: '#241F2B', fontWeight: 600 }}>{d.guestListManager.howDoIBringIn}</summary>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li>{rich(d.guestListManager.androidChromeOpenThisPage, { t0: (s) => <strong>{s}</strong> })}</li>
          <li>{rich(d.guestListManager.iphoneInTheContactsApp, { t0: (s) => <strong>{s}</strong>, t1: (s) => <em>{s}</em>, t2: (s) => <em>{s}</em>, t3: (s) => <em>{s}</em>, t4: (s) => <em>{s}</em> })}</li>
          <li>{rich(d.guestListManager.googleContactsSelectPeopleExport, { t0: (s) => <strong>{s}</strong>, t1: (s) => <em>{s}</em> })}</li>
          <li>{rich(d.guestListManager.outlookExcelSaveAsCsv, { t0: (s) => <strong>{s}</strong> })}{isPaid ? d.guestListManager.andOptionallyInvitationNotes : ''} {d.guestListManager.seeTheSampleGuestsLeft}</li>
        </ul>
      </details>

      {pending && (
        <div style={{ border: '1px solid #E8D9A8', background: '#FFFBF0', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: '#241F2B' }}>
            {rich(fill(d.guestListManager.foundGuest, { length: pending.guests.length }), { t0: (s) => <strong>{s}</strong> })}{pending.guests.length === 1 ? '' : 's'} {fill(d.guestListManager.inYour, { source: pending.source })}
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20, fontSize: 13, color: '#6B6470' }}>
            {pending.guests.slice(0, 5).map((g, i) => (
              <li key={i}>{g.name}{g.email ? ` · ${g.email}` : ''}{g.guests > 1 ? fill(d.guestListManager.partyOf, { guests: g.guests }) : ''}{g.phone ? ` · ${g.phone}` : ''}{isPaid && g.note ? d.guestListManager.note : ''}</li>
            ))}
            {pending.guests.length > 5 && <li>{d.guestListManager.and} {pending.guests.length - 5} {d.guestListManager.more}</li>}
          </ul>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={primary} disabled={busy} onClick={async () => { if (await send(pending.guests)) setPending(null); }}>
              {busy ? d.guestListManager.adding : fill(d.guestListManager.addGuest, { length: pending.guests.length, v1: pending.guests.length === 1 ? '' : 's' })}
            </button>
            <button type="button" style={btn} disabled={busy} onClick={() => setPending(null)}>{d.guestListManager.cancel}</button>
          </div>
        </div>
      )}

      {notice && <p role="status" style={{ fontSize: 14, margin: '0 0 14px', color: notice.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{notice.text}</p>}

      <form onSubmit={addOne} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 2fr) minmax(140px, 2fr) 80px minmax(110px, 1.5fr) auto', gap: 8, marginBottom: 22 }} className="guest-add-form">
        <input aria-label={d.guestListManager.name} placeholder={d.guestListManager.name} style={input} value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input aria-label={d.guestListManager.email} placeholder={d.guestListManager.email} type="email" style={input} value={form.email} maxLength={254} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input aria-label={d.guestListManager.numberOfGuests} title={d.guestListManager.numberOfGuests} type="number" min={1} max={MAX_PARTY_SIZE} style={input} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
        <input aria-label={d.guestListManager.phone} placeholder={d.guestListManager.phone} type="tel" style={input} value={form.phone} maxLength={40} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button type="submit" style={btn} disabled={busy || !form.name.trim()}>{d.guestListManager.addGuest2}</button>
        {isPaid && (
          <textarea
            aria-label={d.guestListManager.invitationNotes}
            placeholder={d.guestListManager.invitationNotesOptionalAPersonal}
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
          {d.guestListManager.yourGuests} {guests.length > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: '#6B6470' }}>· {guests.length} {guests.length === 1 ? 'entry' : 'entries'}, {totalPeople} {totalPeople === 1 ? 'person' : 'people'}</span>}
        </h2>
        {guests.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <RsvpActions pageId={pageId} guests={guests} />
            <Link href={invitationsHref} style={{ fontSize: 14, fontWeight: 600, color: '#B6584A', textDecoration: 'none' }}>
              {d.guestListManager.sendInvitations}
            </Link>
          </div>
        )}
      </div>

      {guests.length === 0 ? (
        <p style={{ fontSize: 14, color: '#9A8F8C', margin: 0 }}>{d.guestListManager.yourGuestListIsEmpty}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: showMeals ? 940 : 760 }}>
            <thead>
              <tr>
                {[d.guestListManager.name, d.guestListManager.status, d.guestListManager.guests, ...(showMeals ? [d.rsvp.meals] : []), d.guestListManager.contact, d.rsvp.note, d.rsvp.date, ''].map((h, i) => <th key={i} style={headCell}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => {
                if (editing?.id === g.id) {
                  const set = (patch: Partial<typeof editing>) => setEditing({ ...editing, ...patch });
                  const onKey = (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
                    if (e.key === 'Escape') setEditing(null);
                  };
                  return (
                    <tr key={g.id} style={{ background: '#FBF8F5' }}>
                      <td style={cell}><input aria-label={d.guestListManager.name} style={{ ...input, width: '100%' }} value={editing.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} onKeyDown={onKey} autoFocus /></td>
                      <td style={cell}>
                        <select aria-label={d.guestListManager.status} style={input} value={editing.status} onChange={(e) => set({ status: e.target.value as Guest['status'] })} onKeyDown={onKey}>
                          <option value="invited">{d.guestListManager.invited}</option>
                          <option value="attending">{d.guestListManager.attending}</option>
                          <option value="not_attending">{d.guestListManager.declining}</option>
                        </select>
                      </td>
                      <td style={cell}><input aria-label={d.guestListManager.numberOfGuests} type="number" min={1} max={MAX_PARTY_SIZE} style={{ ...input, width: 64 }} value={editing.guests} onChange={(e) => set({ guests: e.target.value })} onKeyDown={onKey} /></td>
                      {showMeals && <td style={cell} />}
                      <td style={cell}><input aria-label={d.guestListManager.email} type="email" style={{ ...input, width: '100%', marginBottom: 6 }} value={editing.email} maxLength={254} onChange={(e) => set({ email: e.target.value })} onKeyDown={onKey} /><input aria-label={d.guestListManager.phone} type="tel" style={{ ...input, width: '100%' }} value={editing.phone} maxLength={40} onChange={(e) => set({ phone: e.target.value })} onKeyDown={onKey} /></td>
                      <td style={cell} />
                      <td style={cell} />
                      <td style={{ ...cell, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button type="button" style={{ ...primary, padding: '6px 12px', fontSize: 13 }} disabled={saving} onClick={saveEdit}>{saving ? d.guestListManager.saving : d.guestListManager.save}</button>
                          <button type="button" style={{ ...btn, padding: '6px 12px', fontSize: 13 }} disabled={saving} onClick={() => setEditing(null)}>{d.guestListManager.cancel}</button>
                        </div>
                        {editError && <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: '#B91C1C', textAlign: 'right', maxWidth: 240, marginLeft: 'auto' }}>{editError}</p>}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={g.id}>
                    <td style={{ ...cell, fontWeight: 500, minWidth: 120 }}>{g.name}</td>
                    <td style={{ ...cell, whiteSpace: 'nowrap' }}><GuestStatusSelect key={g.status} pageId={pageId} guestId={g.id} guestName={g.name} initial={g.status} /></td>
                    <td style={{ ...cell, textAlign: 'center' }}>{g.status === 'not_attending' ? '—' : g.guests || 1}</td>
                    {showMeals && <td style={{ ...cell, fontSize: 13, minWidth: 150 }}><MealsCell guest={g} /></td>}
                    <td style={{ ...cell, color: '#6B6470', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {g.email || g.phone ? <>{g.email && <span style={{ display: 'block' }}>{g.email}</span>}{g.phone && <span style={{ display: 'block' }}>{g.phone}</span>}</> : '—'}
                    </td>
                    <td style={{ ...cell, color: '#6B6470', maxWidth: 200, fontSize: 13 }}>{g.message || '—'}</td>
                    {/* When they replied; for guests yet to reply, when they were added. */}
                    <td style={{ ...cell, color: '#9A8F8C', whiteSpace: 'nowrap', fontSize: 13 }}><LocalDate iso={g.responded_at ?? g.created_at} options={{ month: 'short', day: 'numeric' }} /></td>
                    <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: 2 }}>
                        <button type="button" style={rowAction} disabled={removing === g.id} onClick={() => startEdit(g)}>
                          {d.guestListManager.edit}
                        </button>
                        <button type="button" style={{ ...rowAction, color: '#8B3A2A' }} disabled={removing === g.id} onClick={() => remove(g)}>
                          {removing === g.id ? d.guestListManager.removing : d.guestListManager.remove}
                        </button>
                      </div>
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

// One guest's party: each person's meal and allergies.
function MealsCell({ guest }: { guest: Guest }) {
  const d = useDashText();
  if (guest.status !== 'attending') return <span style={{ color: '#9A8F8C' }}>—</span>;
  const rows = readPartyMeals(guest.meals);
  const people = Math.max(1, guest.guests || 1);
  if (!rows.some((r) => r.meal || r.diet)) return <span style={{ color: '#9A8F8C' }}>{d.rsvp.noChoiceYet}</span>;
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      {Array.from({ length: people }, (_, i) => (
        <div key={i}>
          {people > 1 && <span style={{ color: '#6B6470' }}>{personName(guest.name, rows, i)}: </span>}
          {rows[i]?.meal || <span style={{ color: '#9A8F8C' }}>{d.rsvp.noChoice}</span>}
          {rows[i]?.diet && <span style={{ display: 'block', color: '#8B3A2A', fontSize: 12 }}>{rows[i].diet}</span>}
        </div>
      ))}
    </div>
  );
}

// Edit / Remove in each row: small text buttons, so the row's details get the room.
const rowAction: React.CSSProperties = { border: 'none', background: 'transparent', padding: '4px 8px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#241F2B', cursor: 'pointer', fontFamily: 'inherit' };
