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
import { PlusLock, usePlus } from './plus-gate';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
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
const sentOn = (iso: string, locale: string) => new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

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
  const d = useDashText();
  const plus = usePlus();
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
  const nameOf = (id: number) => participants.find((p) => p.id === id)?.name ?? d.giftExchangeManager.someone;

  async function keepApart(e: React.FormEvent) {
    e.preventDefault();
    const a = Number(apart.a), b = Number(apart.b);
    if (!a || !b || a === b) { setApartNotice({ kind: 'error', text: d.giftExchangeManager.chooseTwoDifferentPeople }); return; }
    setApartNotice(null);
    const result = await run('apart', () => addGiftExclusion(pageId, a, b));
    if (result?.ok) {
      setApart({ a: '', b: '' });
      setApartNotice(result.value.redrawNeeded
        ? { kind: 'error', text: fill(d.giftExchangeManager.andDrewEachOtherIn, { v1: nameOf(a), v2: nameOf(b) }) }
        : { kind: 'ok', text: fill(d.giftExchangeManager.andWonTDrawEach, { v1: nameOf(a), v2: nameOf(b), v3: drawn ? d.giftExchangeManager.alreadyKeepsApart : '' }) });
      router.refresh();
    } else setApartNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTSavePleaseTry });
  }

  async function unpair(id: number) {
    setApartNotice(null);
    const result = await run(`unpair-${id}`, () => removeGiftExclusion(pageId, id));
    if (result?.ok) router.refresh();
    else setApartNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTRemovePleaseTry });
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
    if (result?.ok) { setDetails(result.value); setDetailsNotice({ kind: 'ok', text: d.giftExchangeManager.saved }); router.refresh(); }
    else setDetailsNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTSavePleaseTry });
  }

  async function addOne(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!isValidOptionalPhone(form.phone)) { setListNotice({ kind: 'error', text: PHONE_INVALID_MESSAGE }); return; }
    setListNotice(null);
    const result = await run('add', () => addGiftParticipant(pageId, form));
    if (result?.ok) { setForm({ name: '', email: '', phone: '', wishlist: '' }); setListNotice({ kind: 'ok', text: d.giftExchangeManager.added }); router.refresh(); }
    else setListNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTAddPleaseTry });
  }

  async function addGuests() {
    setListNotice(null);
    const result = await run('guests', () => addGiftParticipantsFromGuests(pageId, [...chosenGuests]));
    if (result?.ok) {
      const { added, skipped } = result.value;
      setListNotice({ kind: 'ok', text: fill(d.giftExchangeManager.added2, { added, v1: added === 1 ? d.giftExchangeManager.person : d.giftExchangeManager.people, v2: skipped ? fill(d.giftExchangeManager.alreadyTakingPart, { skipped }) : '' }) });
      setChosenGuests(new Set());
      setPickGuests(false);
      router.refresh();
    } else setListNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTAddGuestsPlease });
  }

  async function remove(p: GiftRow) {
    if (!window.confirm(fill(d.giftExchangeManager.removeFromTheGiftExchange, { name: p.name }))) return;
    const result = await run(`remove-${p.id}`, () => removeGiftParticipant(pageId, p.id));
    if (result?.ok) router.refresh();
    else setListNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTRemovePleaseTry });
  }

  async function draw() {
    // Drawing is what sets the exchange going for guests: Plus.
    if (!plus.paid) { plus.ask({ section: '/gift-exchange' }); return; }
    const again = drawn
      ? d.giftExchangeManager.thisReplacesTheCurrentDraw
      : '';
    if (!window.confirm(fill(d.giftExchangeManager.drawNamesForPeople, { length: participants.length, again }))) return;
    setDrawNotice(null);
    const result = await run('draw', () => drawGiftNames(pageId));
    if (result?.ok) { setShowPairs(false); setTextedNow({}); setDrawNotice({ kind: 'ok', text: fill(d.giftExchangeManager.namesDrawnForPeopleNow, { count: result.value.count }) }); router.refresh(); }
    else setDrawNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTDrawNamesPlease });
  }

  async function clearDraw() {
    if (!window.confirm(d.giftExchangeManager.clearTheDrawSignUps)) return;
    setDrawNotice(null);
    const result = await run('clear', () => clearGiftDraw(pageId));
    if (result?.ok) { setShowPairs(false); setDrawNotice({ kind: 'ok', text: d.giftExchangeManager.drawCleared }); router.refresh(); }
    else setDrawNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTClearTheDraw });
  }

  async function emailAll() {
    const again = withEmail.filter((p) => p.notifiedVia === 'email').length;
    if (!window.confirm(fill(d.giftExchangeManager.emailWhoTheyReThe, { length: withEmail.length, v1: withEmail.length === 1 ? d.giftExchangeManager.person : d.giftExchangeManager.people, v2: again ? fill(d.giftExchangeManager.alreadyGotTheirs, { again }) : '' }))) return;
    setDrawNotice(null);
    const result = await run('email', () => sendGiftExchangeEmails(pageId));
    if (result?.ok) {
      const { sent, skipped } = result.value;
      setDrawNotice({ kind: 'ok', text: fill(d.giftExchangeManager.emailed, { sent, v1: sent === 1 ? d.giftExchangeManager.person : d.giftExchangeManager.people, v2: skipped ? fill(d.giftExchangeManager.noEmailSkipped, { skipped }) : '' }) });
      router.refresh();
    } else setDrawNotice({ kind: 'error', text: result && !result.ok ? result.error : d.giftExchangeManager.couldnTSendTheEmails });
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
      window.prompt(d.giftExchangeManager.copyThisMessage, messageFor(p));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* DETAILS */}
      <section style={card}>
        <h2 style={h2}>{d.giftExchangeManager.details}</h2>
        <p style={lead}>{d.giftExchangeManager.shownInTheSectionOn}</p>
        <form onSubmit={saveDetails} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }} className="gift-details-form">
          <label style={label}>{d.giftExchangeManager.budget}
            <input style={input} value={details.budget} maxLength={GIFT_BUDGET_MAX} placeholder="e.g. $25" onChange={(e) => setDetails({ ...details, budget: e.target.value })} />
          </label>
          <label style={label}>{d.giftExchangeManager.whenGiftsAreExchanged}
            <input style={input} value={details.exchangeDate} maxLength={GIFT_DATE_MAX} placeholder={d.giftExchangeManager.eGDecember19At} onChange={(e) => setDetails({ ...details, exchangeDate: e.target.value })} />
          </label>
          <label style={{ ...label, gridColumn: '1 / -1' }}>{d.giftExchangeManager.aNoteForEveryoneOptional}
            <textarea style={{ ...input, resize: 'vertical', lineHeight: 1.5 }} rows={2} value={details.note} maxLength={GIFT_NOTE_MAX} placeholder={d.giftExchangeManager.eGWrapYourGift} onChange={(e) => setDetails({ ...details, note: e.target.value })} />
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" style={primary} disabled={savingDetails}>{savingDetails ? d.giftExchangeManager.saving : d.giftExchangeManager.saveDetails}</button>
            <NoticeLine notice={detailsNotice} />
          </div>
        </form>
        <style>{`@media (max-width: 640px) { .gift-details-form { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* PARTICIPANTS + DRAW */}
      <section style={card}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ ...h2, margin: 0 }}>{rich(fill(d.giftExchangeManager.whoSTakingPart, { length: participants.length }), { t0: (s) => <span style={{ fontSize: 14, fontWeight: 500, color: '#6B6470' }}>{s}</span> })}</h2>
          {drawn && <span style={{ fontSize: 13, fontWeight: 600, color: '#3D6B46' }}>{d.giftExchangeManager.namesDrawn}</span>}
        </div>
        <p style={{ ...lead, marginTop: 6 }}>
          {d.giftExchangeManager.guestsCanJoinFromThe} {drawn
            ? d.giftExchangeManager.namesHaveBeenDrawnSo
            : fill(d.giftExchangeManager.whenEveryoneSInAt, { GIFT_MIN_TO_DRAW })}
        </p>

        {!drawn && (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <button type="button" style={btn} onClick={() => setPickGuests((v) => !v)} disabled={!availableGuests.length} title={availableGuests.length ? undefined : d.giftExchangeManager.everyoneOnYourGuestList}>
                {fill(d.giftExchangeManager.addFromGuestList, { length: availableGuests.length })}
              </button>
            </div>
            {pickGuests && (
              <div style={{ border: '1px solid #EDE8E3', background: '#FBF9F7', borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <button type="button" style={small} onClick={() => setChosenGuests(new Set(availableGuests.map((g) => g.id)))}>{d.giftExchangeManager.selectAll}</button>
                  <button type="button" style={small} onClick={() => setChosenGuests(new Set())}>{d.giftExchangeManager.clear}</button>
                </div>
                <div style={{ maxHeight: 240, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 4 }}>
                  {availableGuests.map((g) => (
                    <label key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, padding: '4px 2px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={chosenGuests.has(g.id)} onChange={() => setChosenGuests((prev) => { const n = new Set(prev); if (n.has(g.id)) n.delete(g.id); else n.add(g.id); return n; })} style={{ accentColor: '#B6584A' }} />
                      <span>{g.name}{!g.email && <span style={{ color: '#9A8F8C' }}> {d.giftExchangeManager.noEmail}</span>}</span>
                    </label>
                  ))}
                </div>
                <button type="button" style={{ ...primary, marginTop: 10, opacity: chosenGuests.size ? 1 : 0.5 }} disabled={!chosenGuests.size || busy === 'guests'} onClick={addGuests}>
                  {busy === 'guests' ? d.giftExchangeManager.adding : `Add ${chosenGuests.size} ${chosenGuests.size === 1 ? 'guest' : 'guests'}`}
                </button>
              </div>
            )}
            <form onSubmit={addOne} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 2fr) minmax(140px, 2fr) minmax(110px, 1.5fr) auto', gap: 8, marginBottom: 8 }} className="gift-add-form">
              <input aria-label={d.giftExchangeManager.name} placeholder={d.giftExchangeManager.name} style={input} value={form.name} maxLength={GIFT_NAME_MAX} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input aria-label={d.giftExchangeManager.email} placeholder={d.giftExchangeManager.emailOptional} type="email" style={input} value={form.email} maxLength={254} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input aria-label={d.giftExchangeManager.phone} placeholder={d.giftExchangeManager.phoneOptional} type="tel" style={input} value={form.phone} maxLength={PHONE_MAX_LENGTH} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <button type="submit" style={btn} disabled={busy === 'add' || !form.name.trim()}>{busy === 'add' ? d.giftExchangeManager.adding : d.giftExchangeManager.addPerson}</button>
              <textarea aria-label={d.giftExchangeManager.giftIdeas} placeholder={d.giftExchangeManager.giftIdeasOptional} rows={1} style={{ ...input, gridColumn: '1 / -1', resize: 'vertical', lineHeight: 1.5 }} value={form.wishlist} maxLength={GIFT_WISHLIST_MAX} onChange={(e) => setForm({ ...form, wishlist: e.target.value })} />
            </form>
            <style>{`@media (max-width: 700px) { .gift-add-form { grid-template-columns: 1fr 1fr !important; } }`}</style>
          </>
        )}
        <NoticeLine notice={listNotice} />

        {/* Couples and others who shouldn't draw each other */}
        {participants.length >= 2 && (
          <div style={{ border: '1px solid #EDE8E3', borderRadius: 10, padding: '12px 14px', margin: '16px 0 0' }}>
            <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#241F2B' }}>{d.giftExchangeManager.keepApart}</p>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6B6470', lineHeight: 1.6 }}>
              {d.giftExchangeManager.couplesOrAnyoneElseYou}
            </p>
            <form onSubmit={keepApart} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <select aria-label={d.giftExchangeManager.firstPerson} style={{ ...input, minWidth: 170 }} value={apart.a} onChange={(e) => setApart({ ...apart, a: e.target.value })}>
                <option value="">{d.giftExchangeManager.chooseSomeone}</option>
                {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span style={{ fontSize: 13, color: '#6B6470' }}>{d.giftExchangeManager.and}</span>
              <select aria-label={d.giftExchangeManager.secondPerson} style={{ ...input, minWidth: 170 }} value={apart.b} onChange={(e) => setApart({ ...apart, b: e.target.value })}>
                <option value="">{d.giftExchangeManager.chooseSomeone}</option>
                {participants.filter((p) => String(p.id) !== apart.a).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button type="submit" style={{ ...btn, opacity: apart.a && apart.b ? 1 : 0.5 }} disabled={!apart.a || !apart.b || busy === 'apart'}>
                {busy === 'apart' ? d.giftExchangeManager.saving : d.giftExchangeManager.keepTheseTwoApart}
              </button>
            </form>
            {exclusions.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {exclusions.map((x) => (
                  <li key={x.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 12px', borderRadius: 999, background: '#F5EDEA', color: '#8B3A2A', fontSize: 13, fontWeight: 600 }}>
                    {nameOf(x.a)} &amp; {nameOf(x.b)}
                    <button type="button" onClick={() => unpair(x.id)} disabled={busy === `unpair-${x.id}`} aria-label={fill(d.giftExchangeManager.letAndDrawEachOther, { v1: nameOf(x.a), v2: nameOf(x.b) })} title={d.giftExchangeManager.removeTheyMayDrawEach}
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
                <PlusLock />
                {busy === 'draw' ? d.giftExchangeManager.drawing : d.giftExchangeManager.drawNames}
              </button>
            ) : (
              <>
                <button type="button" style={primary} disabled={!withEmail.length || busy === 'email'} onClick={emailAll}>
                  {busy === 'email' ? d.giftExchangeManager.sending : fill(d.giftExchangeManager.emailEveryone, { length: withEmail.length })}
                </button>
                <button type="button" style={btn} disabled={busy === 'draw'} onClick={draw}>{busy === 'draw' ? d.giftExchangeManager.drawing : d.giftExchangeManager.drawAgain}</button>
                <button type="button" style={btn} disabled={busy === 'clear'} onClick={clearDraw}>{busy === 'clear' ? d.giftExchangeManager.clearing : d.giftExchangeManager.clearDraw}</button>
                <span style={{ flex: '1 1 auto' }} />
                <button type="button" style={small} aria-pressed={showPairs} onClick={() => {
                  if (!showPairs && !window.confirm('Show who has whom? If you’re taking part too, this spoils the surprise for you.')) return;
                  setShowPairs((v) => !v);
                }}>{showPairs ? d.giftExchangeManager.hideWhoHasWhom : d.giftExchangeManager.showWhoHasWhom}</button>
              </>
            )}
          </div>
          {!drawn && participants.length < GIFT_MIN_TO_DRAW && (
            <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 0' }}>{fill(d.giftExchangeManager.addAtLeastPeopleTo, { GIFT_MIN_TO_DRAW })}</p>
          )}
          {drawn && (
            <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 0', lineHeight: 1.6 }}>
              {rich(d.giftExchangeManager.emailSendsEachPersonTheir, { t0: (s) => <strong>{s}</strong>, t1: (s) => <strong>{s}</strong> })}
            </p>
          )}
          <NoticeLine notice={drawNotice} />
        </div>

        {participants.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9A8F8C', margin: 0 }}>{d.giftExchangeManager.nobodyHasJoinedYet}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>{[d.giftExchangeManager.name, d.giftExchangeManager.email, d.giftExchangeManager.phone, d.giftExchangeManager.giftIdeas, drawn ? d.giftExchangeManager.told : '', ''].map((h, i) => <th key={i} style={headCell}>{h}</th>)}</tr>
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
                          {p.fromGuestList && <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: '#9A8F8C' }}>{d.giftExchangeManager.fromGuestList}</span>}
                          {showPairs && p.gifteeName && <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#B3262E' }}>{fill(d.giftExchangeManager.givesTo, { gifteeName: p.gifteeName })}</span>}
                        </td>
                        <td style={{ ...cell, color: '#6B6470', overflowWrap: 'anywhere' }}>{p.email || '—'}</td>
                        <td style={{ ...cell, color: '#6B6470', minWidth: 140 }}>
                          <div style={{ whiteSpace: 'nowrap' }}>{p.phone || '—'}</div>
                          {drawn && p.revealUrl && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                              {p.phone && (
                                <>
                                  <a href={smsHref(p.phone, messageFor(p))} onClick={() => onTexted(p, 'sms')} style={pill} title={fill(d.giftExchangeManager.textTheirSecretSantaLink, { name: p.name })}>{d.giftExchangeManager.text}</a>
                                  <a href={whatsappHref(p.phone, messageFor(p))} target="_blank" rel="noopener noreferrer" onClick={() => onTexted(p, 'whatsapp')} style={pill} title={fill(d.giftExchangeManager.sendTheirSecretSantaLink, { name: p.name })}>{d.giftExchangeManager.whatsapp}</a>
                                </>
                              )}
                              <button type="button" onClick={() => copyMessage(p)} style={pill} title={d.giftExchangeManager.copyTheirMessageWithThe}>{copied === p.id ? d.giftExchangeManager.copied : d.giftExchangeManager.copy}</button>
                            </div>
                          )}
                        </td>
                        <td style={{ ...cell, color: '#6B6470', maxWidth: 260, whiteSpace: 'pre-line', fontSize: 13 }}>{p.wishlist || '—'}</td>
                        <td style={{ ...cell, fontSize: 13, color: '#3D6B46', fontWeight: 600, whiteSpace: 'nowrap' }} suppressHydrationWarning>
                          {drawn && via ? `✓ ${via === 'email' ? d.giftExchangeManager.emailed2 : via === 'whatsapp' ? d.giftExchangeManager.whatsapp : d.giftExchangeManager.texted}${!texted && p.notifiedAt ? ` ${sentOn(p.notifiedAt, d.meta.locale)}` : ''}` : drawn ? <span style={{ color: '#9A8F8C', fontWeight: 400 }}>{d.giftExchangeManager.notYet}</span> : ''}
                        </td>
                        <td style={{ ...cell, textAlign: 'right' }}>
                          {!drawn && (
                            <button type="button" style={small} disabled={busy === `remove-${p.id}`} onClick={() => remove(p)}>
                              {busy === `remove-${p.id}` ? d.giftExchangeManager.removing : d.giftExchangeManager.remove}
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
