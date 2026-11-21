'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cancelScheduledSend, markGuestTexted, previewInvitationEmail, saveInvitationNote, sendInvitations, sendTestInvitation } from '@/app/lib/actions';
import type { ScheduledSend, SendKind } from '@/app/lib/invitation-send';
import { INVITATION_NOTE_MAX, type InvitationDesign, type InvitationDetails } from '@/app/lib/invitation';
import { invitationText, smsHref, whatsappHref } from '@/app/lib/invitation-text';
import type { Guest } from '@/app/lib/definitions';
import { STATUS, btn, card, cell, headCell, input, primary, statusPill } from './guest-ui';
import { LocalDate } from './local-date';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Guests the invitation can be emailed to.
const canEmail = (g: Guest) => !!g.email && EMAIL_RE.test(g.email.trim()) && !g.email_opt_out;
// Where a guest is with their invitation (app/lib/invite-tracking.ts).
const invitedOf = (g: Guest, textedNow: Record<string, unknown>) => !!(g.invited_at || g.texted_at || textedNow[g.id]);
const openedOf = (g: Guest) => !!(g.opened_at || g.viewed_at);
const repliedOf = (g: Guest) => g.status !== 'invited';
type Filter = 'all' | 'notOpened' | 'noReply' | 'replied' | 'notInvited';
const chip = (on: boolean): React.CSSProperties => ({ padding: '5px 11px', borderRadius: 999, border: `1px solid ${on ? '#B6584A' : '#DDD5CE'}`, background: on ? '#B6584A' : '#fff', color: on ? '#fff' : '#241F2B', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' });

// Opened → Viewed → Replied, each ticked when reached (its date on hover).
function Progress({ g, labels }: { g: Guest; labels: [string, string, string] }) {
  const steps: [string, boolean, string | null | undefined][] = [
    [labels[0], openedOf(g), g.opened_at ?? g.viewed_at],
    [labels[1], !!g.viewed_at, g.viewed_at],
    [labels[2], repliedOf(g), g.responded_at],
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, fontSize: 12, whiteSpace: 'nowrap' }}>
      {steps.map(([label, done, at], i) => (
        <Fragment key={label}>
          {i > 0 && <span aria-hidden="true" style={{ width: 8, height: 1, background: done ? '#3D6B46' : '#DDD5CE' }} />}
          <span title={done && at ? new Date(at).toLocaleString() : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: done ? '#3D6B46' : '#B3AAA6', fontWeight: done ? 600 : 500 }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: done ? '#3D6B46' : 'transparent', border: `1.5px solid ${done ? '#3D6B46' : '#CFC6C1'}`, boxSizing: 'border-box' }} />
            {label}<span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{done ? ' ✓' : ' —'}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}

const phoneBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 999, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 12, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' };

// Guests → Invite (every plan): send the designed invitation to the guest
// list — by email to the ticked guests, or one by one as a pre-filled SMS /
// WhatsApp message from the host's own phone — with a personal note per
// guest. The list itself is managed in Guests & RSVPs.
export function InvitationSender({
  pageId,
  guests,
  design,
  details,
  language,
  hostName,
  guestListHref,
  locked = false,
  inviteLinks = {},
  scheduled = [],
}: {
  pageId: number;
  guests: Guest[];
  design: InvitationDesign;
  details: InvitationDetails;
  language?: string | null;
  hostName?: string;
  guestListHref: string;
  // The account hasn't verified its email: nothing can be sent yet.
  locked?: boolean;
  // Each guest's own invitation link (/i/…), for their text message.
  inviteLinks?: Record<string, string>;
  // Sends the host scheduled (pending, and the last two weeks').
  scheduled?: ScheduledSend[];
}) {
  const d = useDashText();
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
  // The email preview: open, for which guest ('' = a generic guest), and its content.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewGuest, setPreviewGuest] = useState('');
  const [preview, setPreview] = useState<{ subject: string; html: string } | { error: string } | null>(null);

  const messageFor = (g: Guest) => invitationText({ design, details: { ...details, url: inviteLinks[g.id] ?? details.url }, language, guestName: g.name, note: g.invitation_note, hostName });
  const [filter, setFilter] = useState<Filter>('all');
  // What to send (the invitation or a save-the-date) and when.
  const [kind, setKind] = useState<SendKind>('invitation');
  const [later, setLater] = useState(false);
  const [laterAt, setLaterAt] = useState('');
  const [minLater, setMinLater] = useState('');
  const [cancelling, setCancelling] = useState<number | null>(null);

  // Only guests still on the list and still emailable count as chosen.
  const emailable = guests.filter(canEmail);
  const chosen = emailable.filter((g) => selected.has(g.id));
  // Not yet emailed or texted.
  const notInvited = emailable.filter((g) => !g.invited_at && !g.texted_at && !textedNow[g.id]);
  const allChosen = emailable.length > 0 && chosen.length === emailable.length;
  // Nobody invited yet: the preview and test come first.
  const firstTime = !guests.some((g) => g.invited_at || g.texted_at);

  // Who has seen it, and the list narrowed to one group.
  const inGroup: Record<Filter, (g: Guest) => boolean> = {
    all: () => true,
    notOpened: (g) => invitedOf(g, textedNow) && !openedOf(g) && !repliedOf(g),
    noReply: (g) => invitedOf(g, textedNow) && !repliedOf(g),
    replied: repliedOf,
    notInvited: (g) => !invitedOf(g, textedNow) && !repliedOf(g),
  };
  const count = (f: Filter) => guests.filter(inGroup[f]).length;
  const shownGuests = guests.filter(inGroup[filter]);
  const shownEmailable = shownGuests.filter(canEmail);
  const s = d.invitationSender;
  const filterLabel: Record<Filter, string> = { all: s.filterAll, notOpened: s.filterNotOpened, noReply: s.filterNoReply, replied: s.filterReplied, notInvited: s.filterNotInvited };

  useEffect(() => {
    if (!previewOpen) return;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(null);
    previewInvitationEmail(pageId, previewGuest || undefined, kind)
      .then((r) => { if (live) setPreview(r.ok ? { subject: r.subject, html: r.html } : { error: r.error }); })
      .catch(() => { if (live) setPreview({ error: d.invitationSender.couldnTLoadThePreview }); });
    return () => { live = false; };
  }, [previewOpen, previewGuest, pageId, kind, d.invitationSender.couldnTLoadThePreview]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewOpen]);

  function openPreview() {
    setPreviewGuest(chosen[0]?.id ?? '');
    setPreviewOpen(true);
  }

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
      window.prompt(d.invitationSender.copyThisMessage, messageFor(g));
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
      result = { ok: false, error: d.invitationSender.couldnTSaveTheNote };
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
    const s = d.invitationSender;
    const v1 = chosen.length === 1 ? '' : 's';
    let sendAt: string | undefined;
    if (later) {
      const when = laterAt ? new Date(laterAt) : null;
      if (!when || Number.isNaN(when.getTime())) { setSendNotice({ kind: 'error', text: s.pickATime }); return; }
      sendAt = when.toISOString();
    }
    const again = chosen.filter((g) => (kind === 'save_the_date' ? g.save_the_date_at : g.invited_at)).length;
    const confirmText = sendAt
      ? fill(s.confirmSchedule, { length: chosen.length, v1, when: new Date(sendAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) })
      : (kind === 'save_the_date'
        ? fill(s.confirmSaveTheDate, { length: chosen.length, v1 })
        : fill(s.emailYourInvitationToGuest, { length: chosen.length, v1 })) +
        (again ? fill(s.ofThemAlreadyReceivedIt, { again }) : '');
    if (!window.confirm(confirmText)) return;
    setSending('guests');
    setSendNotice(null);
    let result: Awaited<ReturnType<typeof sendInvitations>>;
    try {
      result = await sendInvitations(pageId, chosen.map((g) => g.id), kind, sendAt);
    } catch {
      result = { ok: false, error: d.invitationSender.couldnTSendTheInvitations };
    }
    setSending(null);
    if (!result.ok) {
      setSendNotice({ kind: 'error', text: result.error });
      router.refresh();
      return;
    }
    if (result.scheduled) {
      setSendNotice({ kind: 'ok', text: fill(d.invitationSender.scheduledNotice, { when: new Date(result.scheduled).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }) });
      setSelected(new Set());
      setLater(false);
      setLaterAt('');
      router.refresh();
      return;
    }
    const skipped = result.skipped ? fill(d.invitationSender.skippedNoEmailAddressOr, { skipped: result.skipped }) : '';
    setSendNotice({ kind: 'ok', text: fill(d.invitationSender.invitationSentToGuest, { sent: result.sent, v1: result.sent === 1 ? '' : 's', skipped }) });
    setSelected(new Set());
    router.refresh();
  }

  async function sendTest() {
    setSending('test');
    setSendNotice(null);
    let result: { ok: boolean; message: string };
    try {
      result = await sendTestInvitation(pageId, kind);
    } catch {
      result = { ok: false, message: d.invitationSender.couldnTSendTheTest };
    }
    setSending(null);
    setSendNotice({ kind: result.ok ? 'ok' : 'error', text: result.message });
  }

  async function cancelScheduled(id: number) {
    if (!window.confirm(d.invitationSender.confirmCancelScheduled)) return;
    setCancelling(id);
    try { await cancelScheduledSend(pageId, id); } catch { /* the list refreshes either way */ }
    setCancelling(null);
    router.refresh();
  }

  // The earliest time a scheduled send can be set for: ten minutes from now,
  // worked out when "Later" is chosen.
  function chooseLater() {
    const t = new Date(Date.now() + 10 * 60 * 1000);
    t.setSeconds(0, 0);
    setMinLater(new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setLater(true);
  }

  return (
    <section style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: 0 }}>{d.invitationSender.sendInvitations}</h2>
        <Link href={guestListHref} style={{ fontSize: 14, fontWeight: 600, color: '#B6584A', textDecoration: 'none' }}>{d.invitationSender.addOrImportGuestsIn}</Link>
      </div>

      {locked && (
        <p role="status" style={{ background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800', borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, margin: '10px 0 14px' }}>
          {rich(d.invitationSender.verifyYourEmailToSend, { t0: (s) => <strong>{s}</strong> })}
        </p>
      )}

      {guests.length === 0 ? (
        <p style={{ fontSize: 14, color: '#6B6470', margin: '8px 0 0', lineHeight: 1.6 }}>
          {rich(d.invitationSender.yourGuestListIsEmpty, { t0: (s) => <Link href={guestListHref} style={{ color: '#B6584A', fontWeight: 600 }}>{s}</Link> })}
        </p>
      ) : (
        <>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B6470', lineHeight: 1.6 }}>
            {rich(d.invitationSender.byTextTapTextOr, { t0: (s) => <strong>{s}</strong>, t1: (s) => <strong>{s}</strong>, t2: (s) => <strong>{s}</strong>, t3: (s) => <strong>{s}</strong> })}
            <br />
            {rich(d.invitationSender.byEmailTickTheGuests, { t0: (s) => <strong>{s}</strong>, t1: (s) => <strong>{s}</strong> })}
            <br />
            {rich(d.invitationSender.invitationNotesAddAPersonal, { t0: (s) => <strong>{s}</strong> })}
          </p>

          <div style={{ border: '1px solid #EDE8E3', background: '#FBF9F7', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #EDE8E3' }}>
              <div role="radiogroup" aria-label={d.invitationSender.whatToSend} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6B6470' }}>{d.invitationSender.whatToSend}</span>
                {(['invitation', 'save_the_date'] as const).map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} style={chip(kind === k)}>
                    {k === 'invitation' ? d.invitationSender.kindInvitation : d.invitationSender.kindSaveTheDate}
                  </button>
                ))}
              </div>
              <div role="radiogroup" aria-label={d.invitationSender.whenToSend} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#6B6470' }}>{d.invitationSender.whenToSend}</span>
                <button type="button" role="radio" aria-checked={!later} onClick={() => setLater(false)} style={chip(!later)}>{d.invitationSender.whenNow}</button>
                <button type="button" role="radio" aria-checked={later} onClick={chooseLater} style={chip(later)}>{d.invitationSender.whenLater}</button>
                {later && (
                  <input type="datetime-local" aria-label={d.invitationSender.sendAtLabel} value={laterAt} min={minLater} onChange={(e) => setLaterAt(e.target.value)} style={{ ...input, padding: '5px 8px', fontSize: 13 }} />
                )}
              </div>
              {(kind === 'save_the_date' || later) && (
                <p style={{ flexBasis: '100%', margin: 0, fontSize: 12, color: '#6B6470', lineHeight: 1.55 }}>
                  {kind === 'save_the_date' && d.invitationSender.saveTheDateHint}{kind === 'save_the_date' && later ? ' ' : ''}{later && d.invitationSender.laterHint}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" style={{ ...btn, padding: '7px 12px', fontSize: 13 }} disabled={!emailable.length} onClick={() => setSelected(new Set(emailable.map((g) => g.id)))}>{fill(d.invitationSender.selectAll, { length: emailable.length })}</button>
              <button type="button" style={{ ...btn, padding: '7px 12px', fontSize: 13 }} disabled={!notInvited.length} onClick={() => setSelected(new Set(notInvited.map((g) => g.id)))}>{fill(d.invitationSender.selectNotYetInvited, { length: notInvited.length })}</button>
              {chosen.length > 0 && <button type="button" style={{ ...btn, padding: '7px 12px', fontSize: 13 }} onClick={() => setSelected(new Set())}>{d.invitationSender.clear}</button>}
              <span style={{ flex: '1 1 auto' }} />
              <button type="button" style={{ ...btn, padding: '9px 14px', ...(firstTime ? { borderColor: '#B6584A', color: '#B6584A' } : {}) }} disabled={locked} onClick={openPreview}>{d.invitationSender.previewEmail}</button>
              <button type="button" style={{ ...btn, padding: '9px 14px', ...(firstTime ? { borderColor: '#B6584A', color: '#B6584A' } : {}) }} disabled={locked || sending !== null} onClick={sendTest}>{sending === 'test' ? d.invitationSender.sending : d.invitationSender.sendMeATest}</button>
              <button type="button" style={{ ...primary, opacity: chosen.length && !locked ? 1 : 0.5 }} disabled={locked || !chosen.length || sending !== null} onClick={sendToChosen}>
                {sending === 'guests' ? d.invitationSender.sending
                  : !chosen.length ? (later ? d.invitationSender.scheduleSend : kind === 'save_the_date' ? d.invitationSender.emailSaveTheDates : d.invitationSender.emailInvitations)
                  : fill(later ? d.invitationSender.scheduleForGuests : kind === 'save_the_date' ? d.invitationSender.emailSaveTheDateGuests : d.invitationSender.emailGuest, { length: chosen.length, v1: chosen.length === 1 ? '' : 's' })}
              </button>
            </div>
            {firstTime && !locked && (
              <p style={{ fontSize: 13, margin: '10px 0 0', color: '#6B6470', lineHeight: 1.5 }}>
                {rich(d.invitationSender.sendingForTheFirstTime, { t0: (s) => <strong>{s}</strong>, t1: (s) => <strong>{s}</strong> })}
              </p>
            )}
            {sendNotice && <p role="status" style={{ fontSize: 14, margin: '12px 0 0', color: sendNotice.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{sendNotice.text}</p>}
            {scheduled.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EDE8E3' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#241F2B' }}>{d.invitationSender.scheduledHeading}</h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                  {scheduled.map((x) => (
                    <li key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 13, color: '#241F2B' }}>
                      <span style={{ fontWeight: 600 }}><LocalDate iso={x.send_at} options={{ month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }} /></span>
                      <span>{fill(x.kind === 'save_the_date' ? d.invitationSender.scheduledSaveTheDate : d.invitationSender.scheduledInvitation, { n: x.guest_count })}</span>
                      <span style={{ color: x.status === 'failed' ? '#B91C1C' : x.status === 'sent' ? '#3D6B46' : '#6B6470' }}>
                        {x.status === 'pending' ? d.invitationSender.statusPending
                          : x.status === 'sending' ? d.invitationSender.sending
                          : x.status === 'sent' ? fill(d.invitationSender.statusSent, { n: x.sent_count ?? 0 })
                          : x.status === 'failed' ? d.invitationSender.statusFailed
                          : d.invitationSender.statusCancelled}
                      </span>
                      {x.status === 'pending' && (
                        <button type="button" onClick={() => cancelScheduled(x.id)} disabled={cancelling === x.id} style={{ background: 'none', border: 'none', padding: 0, color: '#B6584A', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {d.invitationSender.cancel}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {previewOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={d.invitationSender.invitationEmailPreview}
              onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}
              style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(36,31,43,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            >
              <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(36,31,43,0.25)' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #EDE8E3', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#9A8F8C' }}>{d.invitationSender.whatYourGuestsWillReceive}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600, color: '#241F2B', overflowWrap: 'anywhere' }}>
                      {preview && 'subject' in preview ? preview.subject : d.invitationSender.loading}
                    </p>
                  </div>
                  <select aria-label={d.invitationSender.previewAs} value={previewGuest} onChange={(e) => setPreviewGuest(e.target.value)} style={{ ...input, padding: '6px 8px', fontSize: 13, maxWidth: '100%' }}>
                    <option value="">{d.invitationSender.asAnyGuest}</option>
                    {emailable.map((g) => <option key={g.id} value={g.id}>{fill(d.invitationSender.as, { name: g.name })}</option>)}
                  </select>
                  <button type="button" onClick={() => setPreviewOpen(false)} aria-label={d.invitationSender.closeThePreview} style={{ ...btn, padding: '6px 12px' }}>{d.invitationSender.close}</button>
                </div>
                {preview && 'error' in preview ? (
                  <p role="alert" style={{ margin: 0, padding: 24, fontSize: 14, color: '#B91C1C' }}>{preview.error}</p>
                ) : (
                  <iframe title={d.invitationSender.invitationEmail} sandbox="" srcDoc={preview && 'html' in preview ? preview.html : ''} style={{ width: '100%', height: '70vh', border: 'none', background: '#F7F4F1' }} />
                )}
                <div style={{ padding: '12px 18px', borderTop: '1px solid #EDE8E3', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#9A8F8C', marginRight: 'auto' }}>{d.invitationSender.linksInThePreviewAre}</span>
                  <button type="button" style={{ ...btn, padding: '9px 14px' }} disabled={sending !== null} onClick={() => { setPreviewOpen(false); sendTest(); }}>{d.invitationSender.sendMeATest}</button>
                </div>
              </div>
            </div>
          )}

          {!firstTime && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#241F2B' }}>{s.whoHasSeenIt}</h3>
                <span style={{ fontSize: 13, color: '#6B6470' }}>
                  {fill(s.trackingCounts, { invited: guests.filter((g) => invitedOf(g, textedNow)).length, opened: guests.filter(openedOf).length, viewed: guests.filter((g) => !!g.viewed_at).length, replied: guests.filter(repliedOf).length })}
                </span>
              </div>
              <div role="group" aria-label={s.whoHasSeenIt} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {(['all', 'notOpened', 'noReply', 'replied', 'notInvited'] as const).map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} style={chip(filter === f)}>{fill(filterLabel[f], { n: count(f) })}</button>
                ))}
                {(filter === 'notOpened' || filter === 'noReply') && shownEmailable.length > 0 && !locked && (
                  <button type="button" onClick={() => setSelected(new Set(shownEmailable.map((g) => g.id)))} style={{ ...btn, padding: '5px 12px', fontSize: 13, borderColor: '#B6584A', color: '#B6584A' }}>
                    {fill(s.selectToEmailAgain, { n: shownEmailable.length })}
                  </button>
                )}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B6470', lineHeight: 1.55 }}>
                {rich(s.trackingHint, { t0: (x) => <strong>{x}</strong>, t1: (x) => <strong>{x}</strong> })}
              </p>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ ...cell, width: 36, paddingRight: 0 }}>
                    <input
                      ref={allBoxRef}
                      type="checkbox"
                      aria-label={d.invitationSender.selectAllGuestsWithAn}
                      checked={allChosen}
                      disabled={!emailable.length}
                      onChange={() => setSelected(allChosen ? new Set() : new Set(emailable.map((g) => g.id)))}
                      style={{ width: 16, height: 16, accentColor: '#B6584A', cursor: 'pointer' }}
                    />
                  </th>
                  {[d.invitationSender.name, d.invitationSender.email, d.invitationSender.phone, d.invitationSender.status, d.invitationSender.invitation, d.invitationSender.invitationNotes].map((h) => <th key={h} style={headCell}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {shownGuests.length === 0 && (
                  <tr><td colSpan={7} style={{ ...cell, color: '#6B6470', fontSize: 14 }}>{s.nobodyHere}</td></tr>
                )}
                {shownGuests.map((g) => {
                  const [text, style] = STATUS[g.status] ?? STATUS.invited;
                  const emailOk = canEmail(g);
                  const texted = textedNow[g.id] ?? (g.texted_at ? g.texted_via : null);
                  return (
                    <Fragment key={g.id}>
                      <tr style={{ background: emailOk && selected.has(g.id) ? '#FBF3F1' : undefined }}>
                        <td style={{ ...cell, paddingRight: 0 }}>
                          <input
                            type="checkbox"
                            aria-label={fill(d.invitationSender.select, { name: g.name })}
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
                            {g.phone && !locked && (
                              <>
                                <a href={smsHref(g.phone, messageFor(g))} onClick={() => onTexted(g, 'sms')} style={phoneBtn} title={fill(d.invitationSender.textTheInvitationToFrom, { name: g.name })}>{d.invitationSender.text}</a>
                                <a href={whatsappHref(g.phone, messageFor(g))} target="_blank" rel="noopener noreferrer" onClick={() => onTexted(g, 'whatsapp')} style={phoneBtn} title={fill(d.invitationSender.sendTheInvitationToOn, { name: g.name })}>{d.invitationSender.whatsapp}</a>
                              </>
                            )}
                            {!locked && <button type="button" onClick={() => copyMessage(g)} style={phoneBtn} title={d.invitationSender.copyTheInvitationMessage}>{copied === g.id ? d.invitationSender.copied : d.invitationSender.copy}</button>}
                          </div>
                        </td>
                        <td style={cell}><span style={{ ...statusPill, ...style }}>{text}</span></td>
                        <td style={{ ...cell, fontSize: 13, color: '#6B6470', whiteSpace: 'nowrap' }}>
                          {g.email_opt_out ? d.invitationSender.unsubscribed
                            : !g.email ? d.invitationSender.noEmail
                            : !emailOk ? d.invitationSender.invalidEmail
                            : g.invited_at ? <span style={{ color: '#3D6B46', fontWeight: 600 }}>{d.invitationSender.emailed} <LocalDate iso={g.invited_at} options={{ month: 'short', day: 'numeric' }} /></span>
                            : d.invitationSender.notEmailed}
                          {texted && (
                            <div style={{ color: '#3D6B46', fontWeight: 600, marginTop: 4 }}>
                              ✓ {texted === 'whatsapp' ? d.invitationSender.whatsapp : d.invitationSender.texted} <LocalDate iso={textedNow[g.id] || !g.texted_at ? new Date().toISOString() : g.texted_at} options={{ month: 'short', day: 'numeric' }} />
                            </div>
                          )}
                          {g.save_the_date_at && (
                            <div style={{ color: '#3D6B46', fontWeight: 600, marginTop: 4 }}>
                              {d.invitationSender.savedTheDate} <LocalDate iso={g.save_the_date_at} options={{ month: 'short', day: 'numeric' }} />
                            </div>
                          )}
                          {(invitedOf(g, textedNow) || g.viewed_at) && <Progress g={g} labels={[s.stepOpened, s.stepViewed, s.stepReplied]} />}
                        </td>
                        <td style={{ ...cell, maxWidth: 240 }}>
                          {g.invitation_note && (
                            <p title={g.invitation_note} style={{ margin: '0 0 4px', fontSize: 13, color: '#6B6470', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.invitation_note}</p>
                          )}
                          <button type="button" onClick={() => openNote(g)} aria-expanded={noteFor === g.id} style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 600, color: '#B6584A', cursor: 'pointer', fontFamily: 'inherit' }}>
                            {g.invitation_note ? d.invitationSender.editNote : d.invitationSender.addNote}
                          </button>
                        </td>
                      </tr>
                      {noteFor === g.id && (
                        <tr>
                          <td colSpan={7} style={{ ...cell, background: '#FBF9F7' }}>
                            <label htmlFor={`note-${g.id}`} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#241F2B', marginBottom: 6 }}>
                              {fill(d.invitationSender.invitationNotesFor, { name: g.name })}
                            </label>
                            <textarea
                              id={`note-${g.id}`}
                              rows={3}
                              maxLength={INVITATION_NOTE_MAX}
                              autoFocus
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder={d.invitationSender.eGKidsAreVery}
                              style={{ ...input, width: '100%', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.5 }}
                            />
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                              <button type="button" style={{ ...primary, padding: '7px 14px', fontSize: 13 }} disabled={savingNote} onClick={() => saveNote(g.id, noteDraft)}>
                                {savingNote ? d.invitationSender.saving : d.invitationSender.saveNote}
                              </button>
                              <button type="button" style={{ ...btn, padding: '7px 14px', fontSize: 13 }} disabled={savingNote} onClick={() => setNoteFor(null)}>{d.invitationSender.cancel}</button>
                              {g.invitation_note && (
                                <button type="button" style={{ ...btn, padding: '7px 14px', fontSize: 13 }} disabled={savingNote} onClick={() => saveNote(g.id, '')}>{d.invitationSender.removeNote}</button>
                              )}
                              <span style={{ fontSize: 12, color: '#9A8F8C', marginLeft: 'auto' }}>
                                {fill(d.invitationSender.shownOnlyInSInvitation, { name: g.name, length: noteDraft.length, INVITATION_NOTE_MAX })}
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
