'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addGiftExclusion,
  addGiftParticipant,
  addGiftParticipantsFromGuests,
  clearGiftDraw,
  drawGiftNames,
  markGiftTexted,
  removeGiftExclusion,
  removeGiftParticipant,
  saveGiftExchangeDetails,
  sendGiftExchangeEmails,
} from '@/app/lib/actions';
import {
  GIFT_BUDGET_MAX,
  GIFT_DATE_MAX,
  GIFT_MIN_TO_DRAW,
  GIFT_NAME_MAX,
  GIFT_NOTE_MAX,
  GIFT_WISHLIST_MAX,
  type GiftExchangeDetails,
} from '@/app/lib/gift-exchange';
import { GIFT_COPY, giftLang } from '@/app/lib/gift-exchange-copy';
import { smsHref, whatsappHref } from '@/app/lib/invitation-text';
import { isValidOptionalPhone, PHONE_INVALID_MESSAGE, PHONE_MAX_LENGTH } from '@/app/lib/phone';
import { btn, card, cell, headCell, input, primary } from './guest-ui';

export type GiftRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  wishlist: string | null;
  fromGuestList: boolean;
  gifteeName: string | null; // who they give to — shown only if the host asks
  revealUrl: string | null; // their private link, once names are drawn
  notifiedAt: string | null;
  notifiedVia: 'email' | 'sms' | 'whatsapp' | null;
};

type Notice = { kind: 'ok' | 'error'; text: string } | null;

const small: React.CSSProperties = { ...btn, padding: '6px 12px', fontSize: 13 };
const pill: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '4px 9px', borderRadius: 999, border: '1px solid #DDD5CE', background: '#fff', color: '#241F2B', fontSize: 12, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' };
const sentOn = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return <p role="status" style={{ fontSize: 14, margin: '12px 0 0', color: notice.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{notice.text}</p>;
}

// Gift Exchange (Secret Santa, Plus): the host's details, who's taking part,
// the draw, and telling everyone who they're buying for.
export function GiftExchangeManager({
  pageId,
  initialDetails,
  participants,
  guests,
  drawn,
  exclusions,
  eventName,
  language,
  hostName,
}: {
  pageId: number;
  initialDetails: GiftExchangeDetails;
  participants: GiftRow[];
  guests: { id: string; name: string; email: string | null; inExchange: boolean }[];
  drawn: boolean;
  exclusions: { id: number; a: number; b: number }[]; // pairs kept apart in the draw
  eventName: string;
  language?: string | null;
  hostName?: string;
}) {
  const router = useRouter();
  const copy = GIFT_COPY[giftLang(language)];

  // Details
  const [details, setDetails] = useState(initialDetails);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsNotice, setDetailsNotice] = useState<Notice>(null);

  // Participants
  const [form, setForm] = useState({ name: '', email: '', phone: '', wishlist: '' });
  const [pickGuests, setPickGuests] = useState(false);
  const [chosenGuests, setChosenGuests] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [listNotice, setListNotice] = useState<Notice>(null);

  // Pairs kept apart (couples, family)
  const [apart, setApart] = useState<{ a: string; b: string }>({ a: '', b: '' });
  const [apartNotice, setApartNotice] = useState<Notice>(null);
  const nameOf = (id: number) => participants.find((p) => p.id === id)?.name ?? 'Someone';

  async function keepApart(e: React.FormEvent) {
    e.preventDefault();
    const a = Number(apart.a), b = Number(apart.b);
    if (!a || !b || a === b) { setApartNotice({ kind: 'error', text: 'Choose two different people.' }); return; }
    setApartNotice(null);
    const result = await run('apart', () => addGiftExclusion(pageId, a, b));
    if (result?.ok) {
      setApart({ a: '', b: '' });
      setApartNotice(result.value.redrawNeeded
        ? { kind: 'error', text: `${nameOf(a)} and ${nameOf(b)} drew each other in the current draw — draw again so they’re kept apart.` }
        : { kind: 'ok', text: `${nameOf(a)} and ${nameOf(b)} won’t draw each other.${drawn ? ' The current draw already keeps them apart.' : ''}` });
      router.refresh();
    } else setApartNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t save. Please try again.' });
  }

  async function unpair(id: number) {
    setApartNotice(null);
    const result = await run(`unpair-${id}`, () => removeGiftExclusion(pageId, id));
    if (result?.ok) router.refresh();
    else setApartNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t remove. Please try again.' });
  }

  // Draw + sending
  const [drawNotice, setDrawNotice] = useState<Notice>(null);
  const [showPairs, setShowPairs] = useState(false);
  const [textedNow, setTextedNow] = useState<Record<number, 'sms' | 'whatsapp'>>({});
  const [copied, setCopied] = useState<number | null>(null);

  const availableGuests = guests.filter((g) => !g.inExchange);
  const withEmail = participants.filter((p) => p.email);

  async function run<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
    setBusy(key);
    try {
      return await fn();
    } catch {
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSavingDetails(true);
    setDetailsNotice(null);
    let result: Awaited<ReturnType<typeof saveGiftExchangeDetails>> | null = null;
    try { result = await saveGiftExchangeDetails(pageId, details); } catch { result = null; }
    setSavingDetails(false);
    if (result?.ok) { setDetails(result.value); setDetailsNotice({ kind: 'ok', text: 'Saved.' }); router.refresh(); }
    else setDetailsNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t save. Please try again.' });
  }

  async function addOne(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!isValidOptionalPhone(form.phone)) { setListNotice({ kind: 'error', text: PHONE_INVALID_MESSAGE }); return; }
    setListNotice(null);
    const result = await run('add', () => addGiftParticipant(pageId, form));
    if (result?.ok) { setForm({ name: '', email: '', phone: '', wishlist: '' }); setListNotice({ kind: 'ok', text: 'Added.' }); router.refresh(); }
    else setListNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t add. Please try again.' });
  }

  async function addGuests() {
    setListNotice(null);
    const result = await run('guests', () => addGiftParticipantsFromGuests(pageId, [...chosenGuests]));
    if (result?.ok) {
      const { added, skipped } = result.value;
      setListNotice({ kind: 'ok', text: `Added ${added} ${added === 1 ? 'person' : 'people'}.${skipped ? ` ${skipped} were already taking part.` : ''}` });
      setChosenGuests(new Set());
      setPickGuests(false);
      router.refresh();
    } else setListNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t add guests. Please try again.' });
  }

  async function remove(p: GiftRow) {
    if (!window.confirm(`Remove ${p.name} from the gift exchange?`)) return;
    const result = await run(`remove-${p.id}`, () => removeGiftParticipant(pageId, p.id));
    if (result?.ok) router.refresh();
    else setListNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t remove. Please try again.' });
  }

  async function draw() {
    const again = drawn
      ? '\n\nThis replaces the current draw: everyone will have a new person, so you’ll need to tell everyone again.'
      : '';
    if (!window.confirm(`Draw names for ${participants.length} people?${again}`)) return;
    setDrawNotice(null);
    const result = await run('draw', () => drawGiftNames(pageId));
    if (result?.ok) { setShowPairs(false); setTextedNow({}); setDrawNotice({ kind: 'ok', text: `Names drawn for ${result.value.count} people. Now let everyone know who they’re buying for.` }); router.refresh(); }
    else setDrawNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t draw names. Please try again.' });
  }

  async function clearDraw() {
    if (!window.confirm('Clear the draw? Sign-ups reopen and you can change who’s taking part. Links already sent will stop showing a name.')) return;
    setDrawNotice(null);
    const result = await run('clear', () => clearGiftDraw(pageId));
    if (result?.ok) { setShowPairs(false); setDrawNotice({ kind: 'ok', text: 'Draw cleared.' }); router.refresh(); }
    else setDrawNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t clear the draw. Please try again.' });
  }

  async function emailAll() {
    const again = withEmail.filter((p) => p.notifiedVia === 'email').length;
    if (!window.confirm(`Email ${withEmail.length} ${withEmail.length === 1 ? 'person' : 'people'} who they’re the Secret Santa for?${again ? `\n\n${again} already got theirs and will get it again.` : ''}`)) return;
    setDrawNotice(null);
    const result = await run('email', () => sendGiftExchangeEmails(pageId));
    if (result?.ok) {
      const { sent, skipped } = result.value;
      setDrawNotice({ kind: 'ok', text: `Emailed ${sent} ${sent === 1 ? 'person' : 'people'}.${skipped ? ` ${skipped} have no email — send them a text or copy their link.` : ''}` });
      router.refresh();
    } else setDrawNotice({ kind: 'error', text: result && !result.ok ? result.error : 'Couldn’t send the emails. Please try again.' });
  }

  const messageFor = (p: GiftRow) => copy.textMessage({ name: p.name.split(/\s+/)[0] || p.name, event: eventName, link: p.revealUrl ?? '', host: hostName });

  function onTexted(p: GiftRow, via: 'sms' | 'whatsapp') {
    setTextedNow((prev) => ({ ...prev, [p.id]: via }));
    markGiftTexted(pageId, p.id, via).then((r) => { if (r.ok) router.refresh(); }).catch(() => {});
  }

  async function copyMessage(p: GiftRow) {
    try {
      await navigator.clipboard.writeText(messageFor(p));
      setCopied(p.id);
      setTimeout(() => setCopied((c) => (c === p.id ? null : c)), 2000);
    } catch {
      window.prompt('Copy this message:', messageFor(p));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* DETAILS */}
      <section style={card}>
        <h2 style={h2}>Details</h2>
        <p style={lead}>Shown in the section on your page and in everyone&rsquo;s Secret Santa message.</p>
        <form onSubmit={saveDetails} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }} className="gift-details-form">
          <label style={label}>Budget
            <input style={input} value={details.budget} maxLength={GIFT_BUDGET_MAX} placeholder="e.g. $25" onChange={(e) => setDetails({ ...details, budget: e.target.value })} />
          </label>
          <label style={label}>When gifts are exchanged
            <input style={input} value={details.exchangeDate} maxLength={GIFT_DATE_MAX} placeholder="e.g. December 19, at the party" onChange={(e) => setDetails({ ...details, exchangeDate: e.target.value })} />
          </label>
          <label style={{ ...label, gridColumn: '1 / -1' }}>A note for everyone (optional)
            <textarea style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} rows={2} value={details.note} maxLength={GIFT_NOTE_MAX} placeholder="e.g. Wrap your gift and bring it to the party — no peeking!" onChange={(e) => setDetails({ ...details, note: e.target.value })} />
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={primary} disabled={savingDetails}>{savingDetails ? 'Saving…' : 'Save details'}</button>
            <NoticeLine notice={detailsNotice} />
          </div>
        </form>
        <style>{`@media (max-width: 640px) { .gift-details-form { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* PARTICIPANTS + DRAW */}
      <section style={card}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ ...h2, margin: 0 }}>Who&rsquo;s taking part <span style={{ fontSize: 14, fontWeight: 500, color: '#6B6470' }}>· {participants.length}</span></h2>
          {drawn && <span style={{ fontSize: 13, fontWeight: 600, color: '#3D6B46' }}>✓ Names drawn</span>}
        </div>
        <p style={{ ...lead, marginTop: 6 }}>
          Guests can join from the section on your page, or you can add them here. {drawn
            ? 'Names have been drawn, so sign-ups are closed — clear the draw to change who’s taking part.'
            : `When everyone’s in (at least ${GIFT_MIN_TO_DRAW} people), draw names: everyone gets one person, and nobody gets themselves.`}
        </p>

        {!drawn && (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <button type="button" style={btn} onClick={() => setPickGuests((v) => !v)} disabled={!availableGuests.length} title={availableGuests.length ? undefined : 'Everyone on your guest list is already taking part (or the list is empty)'}>
                + Add from guest list ({availableGuests.length})
              </button>
            </div>
            {pickGuests && (
              <div style={{ border: '1px solid #EDE8E3', background: '#FBF9F7', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <button type="button" style={small} onClick={() => setChosenGuests(new Set(availableGuests.map((g) => g.id)))}>Select all</button>
                  <button type="button" style={small} onClick={() => setChosenGuests(new Set())}>Clear</button>
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 4 }}>
                  {availableGuests.map((g) => (
                    <label key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, padding: '4px 2px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={chosenGuests.has(g.id)} onChange={() => setChosenGuests((prev) => { const n = new Set(prev); if (n.has(g.id)) n.delete(g.id); else n.add(g.id); return n; })} style={{ accentColor: '#B6584A' }} />
                      <span>{g.name}{!g.email && <span style={{ color: '#9A8F8C' }}> · no email</span>}</span>
                    </label>
                  ))}
                </div>
                <button type="button" style={{ ...primary, marginTop: 10, opacity: chosenGuests.size ? 1 : 0.5 }} disabled={!chosenGuests.size || busy === 'guests'} onClick={addGuests}>
                  {busy === 'guests' ? 'Adding…' : `Add ${chosenGuests.size} ${chosenGuests.size === 1 ? 'guest' : 'guests'}`}
                </button>
              </div>
            )}
            <form onSubmit={addOne} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 2fr) minmax(140px, 2fr) minmax(110px, 1.5fr) auto', gap: 8, marginBottom: 8 }} className="gift-add-form">
              <input aria-label="Name" placeholder="Name" style={input} value={form.name} maxLength={GIFT_NAME_MAX} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input aria-label="Email" placeholder="Email (optional)" type="email" style={input} value={form.email} maxLength={254} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input aria-label="Phone" placeholder="Phone (optional)" type="tel" style={input} value={form.phone} maxLength={PHONE_MAX_LENGTH} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <button type="submit" style={btn} disabled={busy === 'add' || !form.name.trim()}>{busy === 'add' ? 'Adding…' : '+ Add person'}</button>
              <textarea aria-label="Gift ideas" placeholder="Gift ideas (optional)" rows={1} style={{ ...input, gridColumn: '1 / -1', resize: 'vertical', lineHeight: 1.5 }} value={form.wishlist} maxLength={GIFT_WISHLIST_MAX} onChange={(e) => setForm({ ...form, wishlist: e.target.value })} />
            </form>
            <style>{`@media (max-width: 700px) { .gift-add-form { grid-template-columns: 1fr 1fr !important; } }`}</style>
          </>
        )}
        <NoticeLine notice={listNotice} />

        {/* Couples and others who shouldn't draw each other */}
        {participants.length >= 2 && (
          <div style={{ border: '1px solid #EDE8E3', borderRadius: 10, padding: '12px 14px', margin: '16px 0 0' }}>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#241F2B' }}>Keep apart</p>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6B6470', lineHeight: 1.6 }}>
              Couples (or anyone else) you add here won&rsquo;t draw each other, either way round. For a family of three, add each pair.
            </p>
            <form onSubmit={keepApart} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <select aria-label="First person" style={{ ...input, minWidth: 170 }} value={apart.a} onChange={(e) => setApart({ ...apart, a: e.target.value })}>
                <option value="">Choose someone…</option>
                {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span style={{ fontSize: 13, color: '#6B6470' }}>and</span>
              <select aria-label="Second person" style={{ ...input, minWidth: 170 }} value={apart.b} onChange={(e) => setApart({ ...apart, b: e.target.value })}>
                <option value="">Choose someone…</option>
                {participants.filter((p) => String(p.id) !== apart.a).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="submit" style={{ ...btn, opacity: apart.a && apart.b ? 1 : 0.5 }} disabled={!apart.a || !apart.b || busy === 'apart'}>
                {busy === 'apart' ? 'Saving…' : 'Keep these two apart'}
              </button>
            </form>
            {exclusions.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {exclusions.map((x) => (
                  <li key={x.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 12px', borderRadius: 999, background: '#F5EDEA', color: '#8B3A2A', fontSize: 13, fontWeight: 600 }}>
                    {nameOf(x.a)} &amp; {nameOf(x.b)}
                    <button type="button" onClick={() => unpair(x.id)} disabled={busy === `unpair-${x.id}`} aria-label={`Let ${nameOf(x.a)} and ${nameOf(x.b)} draw each other`} title="Remove — they may draw each other again"
                      style={{ border: 'none', background: 'rgba(139,58,42,0.12)', color: 'inherit', borderRadius: 999, width: 20, height: 20, cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
                  </li>
                ))}
              </ul>
            )}
            <NoticeLine notice={apartNotice} />
          </div>
        )}

        {/* The draw and telling everyone */}
        <div style={{ border: '1px solid #EDE8E3', background: '#FBF9F7', borderRadius: 10, padding: '12px 14px', margin: '16px 0 14px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {!drawn ? (
              <button type="button" style={{ ...primary, opacity: participants.length >= GIFT_MIN_TO_DRAW ? 1 : 0.5 }} disabled={participants.length < GIFT_MIN_TO_DRAW || busy === 'draw'} onClick={draw}>
                {busy === 'draw' ? 'Drawing…' : 'Draw names'}
              </button>
            ) : (
              <>
                <button type="button" style={primary} disabled={!withEmail.length || busy === 'email'} onClick={emailAll}>
                  {busy === 'email' ? 'Sending…' : `✉ Email everyone (${withEmail.length})`}
                </button>
                <button type="button" style={btn} disabled={busy === 'draw'} onClick={draw}>{busy === 'draw' ? 'Drawing…' : 'Draw again'}</button>
                <button type="button" style={btn} disabled={busy === 'clear'} onClick={clearDraw}>{busy === 'clear' ? 'Clearing…' : 'Clear draw'}</button>
                <span style={{ flex: '1 1 auto' }} />
                <button type="button" style={small} aria-pressed={showPairs} onClick={() => {
                  if (!showPairs && !window.confirm('Show who has whom? If you’re taking part too, this spoils the surprise for you.')) return;
                  setShowPairs((v) => !v);
                }}>{showPairs ? 'Hide who has whom' : 'Show who has whom'}</button>
              </>
            )}
          </div>
          {!drawn && participants.length < GIFT_MIN_TO_DRAW && (
            <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 0' }}>Add at least {GIFT_MIN_TO_DRAW} people to draw names.</p>
          )}
          {drawn && (
            <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 0', lineHeight: 1.6 }}>
              Email sends each person their Secret Santa. <strong>Text</strong> and <strong>WhatsApp</strong> open a message on your phone with
              their private link — the message doesn&rsquo;t name anyone, so you won&rsquo;t see who has whom.
            </p>
          )}
          <NoticeLine notice={drawNotice} />
        </div>

        {participants.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9A8F8C', margin: 0 }}>Nobody has joined yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>{['Name', 'Email', 'Phone', 'Gift ideas', drawn ? 'Told' : '', ''].map((h, i) => <th key={i} style={headCell}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {participants.map((p) => {
                  const texted = textedNow[p.id] as 'sms' | 'whatsapp' | undefined;
                  const via = texted ?? p.notifiedVia;
                  return (
                    <Fragment key={p.id}>
                      <tr>
                        <td style={{ ...cell, fontWeight: 500 }}>
                          {p.name}
                          {p.fromGuestList && <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#9A8F8C' }}>from guest list</span>}
                          {showPairs && p.gifteeName && <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#B3262E' }}>→ gives to {p.gifteeName}</span>}
                        </td>
                        <td style={{ ...cell, color: '#6B6470', overflowWrap: 'anywhere' }}>{p.email || '—'}</td>
                        <td style={{ ...cell, color: '#6B6470', minWidth: 140 }}>
                          <div style={{ whiteSpace: 'nowrap' }}>{p.phone || '—'}</div>
                          {drawn && p.revealUrl && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                              {p.phone && (
                                <>
                                  <a href={smsHref(p.phone, messageFor(p))} onClick={() => onTexted(p, 'sms')} style={pill} title={`Text ${p.name} their Secret Santa link`}>Text</a>
                                  <a href={whatsappHref(p.phone, messageFor(p))} target="_blank" rel="noopener noreferrer" onClick={() => onTexted(p, 'whatsapp')} style={pill} title={`Send ${p.name} their Secret Santa link on WhatsApp`}>WhatsApp</a>
                                </>
                              )}
                              <button type="button" onClick={() => copyMessage(p)} style={pill} title="Copy their message with the private link">{copied === p.id ? '✓ Copied' : 'Copy'}</button>
                            </div>
                          )}
                        </td>
                        <td style={{ ...cell, color: '#6B6470', maxWidth: 260, whiteSpace: 'pre-line', fontSize: 13 }}>{p.wishlist || '—'}</td>
                        <td style={{ ...cell, fontSize: 13, color: '#3D6B46', fontWeight: 600, whiteSpace: 'nowrap' }} suppressHydrationWarning>
                          {drawn && via ? `✓ ${via === 'email' ? 'Emailed' : via === 'whatsapp' ? 'WhatsApp' : 'Texted'}${!texted && p.notifiedAt ? ` ${sentOn(p.notifiedAt)}` : ''}` : drawn ? <span style={{ color: '#9A8F8C', fontWeight: 400 }}>Not yet</span> : ''}
                        </td>
                        <td style={{ ...cell, textAlign: 'right' }}>
                          {!drawn && (
                            <button type="button" style={small} disabled={busy === `remove-${p.id}`} onClick={() => remove(p)}>
                              {busy === `remove-${p.id}` ? 'Removing…' : 'Remove'}
                            </button>
                          )}
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const h2: React.CSSProperties = { fontSize: 18, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' };
const lead: React.CSSProperties = { fontSize: 14, color: '#6B6470', margin: '0 0 16px', lineHeight: 1.6 };
const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#241F2B' };
