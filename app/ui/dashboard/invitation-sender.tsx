'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { markGuestTexted, saveInvitationNote, sendInvitations, sendTestInvitation } from '@/app/lib/actions';
import { INVITATION_NOTE_MAX, type InvitationDesign, type InvitationDetails } from '@/app/lib/invitation';
import { invitationText, smsHref, whatsappHref } from '@/app/lib/invitation-text';
import type { Guest } from '@/app/lib/definitions';
import { STATUS, btn, card, cell, headCell, input, primary, statusPill } from './guest-ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Guests the invitation can be emailed to.
const canEmail = (g: Guest) => !!g.email && EMAIL_RE.test(g.email.trim()) && !g.email_opt_out;
const sentOn = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const phoneBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 999, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 12, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' };

// Guests → Invitations (Plus): send the designed invitation to the guest
// list — by email to the ticked guests, or one by one as a pre-filled SMS /
// WhatsApp message from the host's own phone — with a personal note per
// guest. The list itself is managed on the Guest List screen.
export function InvitationSender({
  pageId,
  guests,
  design,
  details,
  language,
  hostName,
  guestListHref,
}: {
  pageId: number;
  guests: Guest[];
  design: InvitationDesign;
  details: InvitationDetails;
  language?: string | null;
  hostName?: string;
  guestListHref: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<'guests' | 'test' | null>(null);
  const [sendNotice, setSendNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const allBoxRef = useRef<HTMLInputElement>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null); // guest whose note is open
  const [noteDraft, setNoteDraft] = useState('');
  const [noteError, setNoteError] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  // Texts opened this session, shown before the server refresh comes back.
  const [textedNow, setTextedNow] = useState<Record<string, 'sms' | 'whatsapp'>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const messageFor = (g: Guest) => invitationText({ design, details, language, guestName: g.name, note: g.invitation_note, hostName });

  // Only guests still on the list and still emailable count as chosen.
  const emailable = guests.filter(canEmail);
  const chosen = emailable.filter((g) => selected.has(g.id));
  // Not yet emailed or texted.
  const notInvited = emailable.filter((g) => !g.invited_at && !g.texted_at && !textedNow[g.id]);
  const allChosen = emailable.length > 0 && chosen.length === emailable.length;

  useEffect(() => {
    if (allBoxRef.current) allBoxRef.current.indeterminate = chosen.length > 0 && !allChosen;
  }, [chosen.length, allChosen]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onTexted(g: Guest, via: 'sms' | 'whatsapp') {
    setTextedNow((prev) => ({ ...prev, [g.id]: via }));
    markGuestTexted(pageId, g.id, via).then((r) => { if (r.ok) router.refresh(); }).catch(() => {});
  }

  async function copyMessage(g: Guest) {
    try {
      await navigator.clipboard.writeText(messageFor(g));
      setCopied(g.id);
      setTimeout(() => setCopied((c) => (c === g.id ? null : c)), 2000);
    } catch {
      window.prompt('Copy this message:', messageFor(g));
    }
  }

  function openNote(g: Guest) {
    setNoteFor(noteFor === g.id ? null : g.id);
    setNoteDraft(g.invitation_note ?? '');
    setNoteError('');
  }

  async function saveNote(guestId: string, value: string) {
    setSavingNote(true);
    setNoteError('');
    let result: Awaited<ReturnType<typeof saveInvitationNote>>;
    try {
      result = await saveInvitationNote(pageId, guestId, value);
    } catch {
      result = { ok: false, error: 'Couldn’t save the note. Please check your connection.' };
    }
    setSavingNote(false);
    if (!result.ok) {
      setNoteError(result.error);
      return;
    }
    setNoteFor(null);
    router.refresh();
  }

  async function sendToChosen() {
    if (!chosen.length) return;
    const again = chosen.filter((g) => g.invited_at).length;
    const confirmText =
      `Email your invitation to ${chosen.length} guest${chosen.length === 1 ? '' : 's'}?` +
      (again ? `\n\n${again} of them already received it and will get it again.` : '');
    if (!window.confirm(confirmText)) return;
    setSending('guests');
    setSendNotice(null);
    let result: Awaited<ReturnType<typeof sendInvitations>>;
    try {
      result = await sendInvitations(pageId, chosen.map((g) => g.id));
    } catch {
      result = { ok: false, error: 'Couldn’t send the invitations. Please check your connection and try again.' };
    }
    setSending(null);
    if (!result.ok) {
      setSendNotice({ kind: 'error', text: result.error });
      router.refresh();
      return;
    }
    const skipped = result.skipped ? ` ${result.skipped} skipped (no email address, or the same email twice).` : '';
    setSendNotice({ kind: 'ok', text: `Invitation sent to ${result.sent} guest${result.sent === 1 ? '' : 's'}.${skipped}` });
    setSelected(new Set());
    router.refresh();
  }

  async function sendTest() {
    setSending('test');
    setSendNotice(null);
    let result: { ok: boolean; message: string };
    try {
      result = await sendTestInvitation(pageId);
    } catch {
      result = { ok: false, message: 'Couldn’t send the test. Please check your connection and try again.' };
    }
    setSending(null);
    setSendNotice({ kind: result.ok ? 'ok' : 'error', text: result.message });
  }

  return (
    <section style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: 0 }}>Send invitations</h2>
        <Link href={guestListHref} style={{ fontSize: 14, fontWeight: 600, color: '#B6584A', textDecoration: 'none' }}>+ Add or import guests in Guest List</Link>
      </div>

      {guests.length === 0 ? (
        <p style={{ fontSize: 14, color: '#6B6470', margin: '8px 0 0', lineHeight: 1.6 }}>
          Your guest list is empty. <Link href={guestListHref} style={{ color: '#B6584A', fontWeight: 600 }}>Add your guests</Link> — from a
          spreadsheet, your phone&rsquo;s contacts or by hand — then come back here to send them your invitation.
        </p>
      ) : (
        <>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B6470', lineHeight: 1.6 }}>
            <strong>By text:</strong> tap <strong>Text</strong> or <strong>WhatsApp</strong> next to a guest&rsquo;s phone number to open a
            ready-made invitation message on your phone — just press send. It comes from your own number, so guests know it&rsquo;s you.
            <strong> Copy</strong> puts the message on your clipboard for any other app.
            <br />
            <strong>By email:</strong> tick the guests to invite. Each one gets your invitation as designed above (your last <strong>saved</strong> design) with an
            RSVP button to your page. Replies to the email go to you. Guests without an email address can&rsquo;t be selected.
            <br />
            <strong>Invitation notes</strong> add a personal message for one guest, in both their email and their text.
          </p>

          <div style={{ border: '1px solid #EDE8E3', background: '#FBF9F7', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" style={{ ...btn, padding: '7px 12px', fontSize: 13 }} disabled={!emailable.length} onClick={() => setSelected(new Set(emailable.map((g) => g.id)))}>Select all ({emailable.length})</button>
              <button type="button" style={{ ...btn, padding: '7px 12px', fontSize: 13 }} disabled={!notInvited.length} onClick={() => setSelected(new Set(notInvited.map((g) => g.id)))}>Select not yet invited ({notInvited.length})</button>
              {chosen.length > 0 && <button type="button" style={{ ...btn, padding: '7px 12px', fontSize: 13 }} onClick={() => setSelected(new Set())}>Clear</button>}
              <span style={{ flex: '1 1 auto' }} />
              <button type="button" style={{ ...btn, padding: '9px 14px' }} disabled={sending !== null} onClick={sendTest}>{sending === 'test' ? 'Sending…' : 'Send me a test'}</button>
              <button type="button" style={{ ...primary, opacity: chosen.length ? 1 : 0.5 }} disabled={!chosen.length || sending !== null} onClick={sendToChosen}>
                {sending === 'guests' ? 'Sending…' : chosen.length ? `✉ Email ${chosen.length} guest${chosen.length === 1 ? '' : 's'}` : '✉ Email invitations'}
              </button>
            </div>
            {sendNotice && <p role="status" style={{ fontSize: 14, margin: '12px 0 0', color: sendNotice.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{sendNotice.text}</p>}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ ...cell, width: 36, paddingRight: 0 }}>
                    <input
                      ref={allBoxRef}
                      type="checkbox"
                      aria-label="Select all guests with an email"
                      checked={allChosen}
                      disabled={!emailable.length}
                      onChange={() => setSelected(allChosen ? new Set() : new Set(emailable.map((g) => g.id)))}
                      style={{ width: 16, height: 16, accentColor: '#B6584A', cursor: 'pointer' }}
                    />
                  </th>
                  {['Name', 'Email', 'Phone', 'Status', 'Invitation', 'Invitation notes'].map((h) => <th key={h} style={headCell}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => {
                  const [text, style] = STATUS[g.status] ?? STATUS.invited;
                  const emailOk = canEmail(g);
                  const texted = textedNow[g.id] ?? (g.texted_at ? g.texted_via : null);
                  return (
                    <Fragment key={g.id}>
                      <tr style={{ background: emailOk && selected.has(g.id) ? '#FBF3F1' : undefined }}>
                        <td style={{ ...cell, paddingRight: 0 }}>
                          <input
                            type="checkbox"
                            aria-label={`Select ${g.name}`}
                            checked={emailOk && selected.has(g.id)}
                            disabled={!emailOk}
                            onChange={() => toggle(g.id)}
                            style={{ width: 16, height: 16, accentColor: '#B6584A', cursor: emailOk ? 'pointer' : 'not-allowed' }}
                          />
                        </td>
                        <td style={{ ...cell, fontWeight: 500 }}>{g.name}{(g.guests || 1) > 1 && <span style={{ fontWeight: 400, color: '#9A8F8C' }}> · {g.guests}</span>}</td>
                        <td style={{ ...cell, color: '#6B6470', overflowWrap: 'anywhere' }}>{g.email || '—'}</td>
                        <td style={{ ...cell, color: '#6B6470', minWidth: 150 }}>
                          <div style={{ marginBottom: 6, whiteSpace: 'nowrap' }}>{g.phone || '—'}</div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {g.phone && (
                              <>
                                <a href={smsHref(g.phone, messageFor(g))} onClick={() => onTexted(g, 'sms')} style={phoneBtn} title={`Text the invitation to ${g.name} from your phone`}>Text</a>
                                <a href={whatsappHref(g.phone, messageFor(g))} target="_blank" rel="noopener noreferrer" onClick={() => onTexted(g, 'whatsapp')} style={phoneBtn} title={`Send the invitation to ${g.name} on WhatsApp`}>WhatsApp</a>
                              </>
                            )}
                            <button type="button" onClick={() => copyMessage(g)} style={phoneBtn} title="Copy the invitation message">{copied === g.id ? '✓ Copied' : 'Copy'}</button>
                          </div>
                        </td>
                        <td style={cell}><span style={{ ...statusPill, ...style }}>{text}</span></td>
                        <td style={{ ...cell, fontSize: 13, color: '#6B6470', whiteSpace: 'nowrap' }}>
                          {g.email_opt_out ? 'Unsubscribed'
                            : !g.email ? 'No email'
                            : !emailOk ? 'Invalid email'
                            : g.invited_at ? <span style={{ color: '#3D6B46', fontWeight: 600 }} suppressHydrationWarning>✓ Emailed {sentOn(g.invited_at)}</span>
                            : 'Not emailed'}
                          {texted && (
                            <div style={{ color: '#3D6B46', fontWeight: 600, marginTop: 4 }} suppressHydrationWarning>
                              ✓ {texted === 'whatsapp' ? 'WhatsApp' : 'Texted'} {sentOn(textedNow[g.id] || !g.texted_at ? new Date().toISOString() : g.texted_at)}
                            </div>
                          )}
                        </td>
                        <td style={{ ...cell, maxWidth: 240 }}>
                          {g.invitation_note && (
                            <p title={g.invitation_note} style={{ margin: '0 0 4px', fontSize: 13, color: '#6B6470', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.invitation_note}</p>
                          )}
                          <button type="button" onClick={() => openNote(g)} aria-expanded={noteFor === g.id} style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 600, color: '#B6584A', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {g.invitation_note ? '✎ Edit note' : '+ Add note'}
                          </button>
                        </td>
                      </tr>
                      {noteFor === g.id && (
                        <tr>
                          <td colSpan={7} style={{ ...cell, background: '#FBF9F7' }}>
                            <label htmlFor={`note-${g.id}`} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#241F2B', marginBottom: 6 }}>
                              Invitation notes for {g.name}
                            </label>
                            <textarea
                              id={`note-${g.id}`}
                              rows={3}
                              maxLength={INVITATION_NOTE_MAX}
                              autoFocus
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="e.g. Kids are very welcome — we'll have a play corner!"
                              style={{ ...input, width: '100%', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }}
                            />
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                              <button type="button" style={{ ...primary, padding: '7px 14px', fontSize: 13 }} disabled={savingNote} onClick={() => saveNote(g.id, noteDraft)}>
                                {savingNote ? 'Saving…' : 'Save note'}
                              </button>
                              <button type="button" style={{ ...btn, padding: '7px 14px', fontSize: 13 }} disabled={savingNote} onClick={() => setNoteFor(null)}>Cancel</button>
                              {g.invitation_note && (
                                <button type="button" style={{ ...btn, padding: '7px 14px', fontSize: 13 }} disabled={savingNote} onClick={() => saveNote(g.id, '')}>Remove note</button>
                              )}
                              <span style={{ fontSize: 12, color: '#9A8F8C', marginLeft: 'auto' }}>
                                Shown only in {g.name}&rsquo;s invitation · {noteDraft.length}/{INVITATION_NOTE_MAX}
                              </span>
                            </div>
                            {noteError && <p role="alert" style={{ margin: '8px 0 0', fontSize: 13, color: '#B91C1C' }}>{noteError}</p>}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
