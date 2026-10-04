'use client';

import { useState } from 'react';
import type { Translations } from '@/app/lib/translations';
import { GIFT_NAME_MAX, GIFT_WISHLIST_MAX, type GiftExchangeProps } from '@/app/lib/gift-exchange';
import { isValidOptionalPhone, PHONE_INVALID_MESSAGE, PHONE_MAX_LENGTH } from '@/app/lib/phone';

// The Gift Exchange section (Plus): guests join the Secret Santa and add gift
// ideas. Uses the RSVP form's classes, so each theme styles it like its RSVP
// card. Sending again with the same email updates the entry; after the draw,
// only existing participants can update their gift ideas (see /api/gift-exchange).
export default function GiftExchangeSection({
  giftExchange,
  translations: t,
  disabled = false,
}: {
  giftExchange: GiftExchangeProps;
  translations: Translations;
  disabled?: boolean;
}) {
  const { details, drawn } = giftExchange;
  const [count, setCount] = useState(giftExchange.participantCount);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<'joined' | 'updated' | null>(null);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    if (!name.trim()) { setError(t.errorName); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(t.errorEmail); return; }
    if (!isValidOptionalPhone(phone)) { setError(PHONE_INVALID_MESSAGE); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/gift-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: giftExchange.token, name, email, phone, wishlist, honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.errorGeneral);
        return;
      }
      setDone(data.updated ? 'updated' : 'joined');
      if (typeof data.count === 'number') setCount(data.count);
    } catch {
      setError(t.errorGeneral);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        {/* rsvp-sub: every theme colours it for its RSVP card */}
        <p className="rsvp-sub" style={{ margin: '0 0 12px', lineHeight: 1.6 }}>{drawn ? t.giftDrawn : t.giftIntro}</p>
        {(details.budget || details.exchangeDate) && (
          <p className="rsvp-sub" style={{ margin: '0 0 8px', lineHeight: 1.6 }}>
            {details.budget && <><strong>{t.giftBudget}:</strong> {details.budget}</>}
            {details.budget && details.exchangeDate && <span aria-hidden="true"> &nbsp;·&nbsp; </span>}
            {details.exchangeDate && <><strong>{t.giftDate}:</strong> {details.exchangeDate}</>}
          </p>
        )}
        {details.note && <p className="rsvp-sub" style={{ margin: '0 0 8px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{details.note}</p>}
        {count > 0 && <p className="check-hint" style={{ margin: 0 }}>{t.giftCount.replace('{n}', String(count))}</p>}
      </div>

      {done ? (
        <div className="rsvp-success">
          <p className="rsvp-headline">{done === 'updated' ? t.giftUpdated : t.giftJoined}</p>
          <button type="button" className="btn" style={{ width: 'fit-content', margin: '16px auto 0' }} onClick={() => setDone(null)}>
            {t.giftAnother}
          </button>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={submit} noValidate>
          {disabled && (
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B6470', background: 'rgba(0,0,0,0.05)', border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 14px', margin: 0 }}>
              Preview only — guests can join from your live page.
            </p>
          )}
          {drawn && <p className="check-hint" style={{ margin: 0 }}>{t.giftUpdateIdeas}</p>}
          <fieldset disabled={disabled} style={{ display: 'contents' }}>
            <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
              <label htmlFor="gift-website">Website</label>
              <input type="text" id="gift-website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="gift-name">{t.fullName}</label>
              <input type="text" id="gift-name" value={name} maxLength={GIFT_NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </div>
            <div>
              <label className="field-label" htmlFor="gift-email">{t.email}</label>
              <input type="email" id="gift-email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" required />
              <p className="check-hint">{t.giftEmailHint}</p>
            </div>
            <div>
              <label className="field-label" htmlFor="gift-phone">{t.phoneOptional}</label>
              <input type="tel" id="gift-phone" value={phone} maxLength={PHONE_MAX_LENGTH} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" inputMode="tel" />
            </div>
            <div>
              <label className="field-label" htmlFor="gift-wishlist">{t.giftWishlist}</label>
              <textarea id="gift-wishlist" value={wishlist} rows={3} maxLength={GIFT_WISHLIST_MAX} onChange={(e) => setWishlist(e.target.value)} placeholder={t.giftWishlistPlaceholder} style={{ resize: 'vertical' }} />
            </div>
            {error && <p className="rsvp-error">{error}</p>}
            <button type="submit" className="btn" disabled={submitting} style={{ width: 'fit-content' }}>
              {submitting ? t.sending : t.giftJoin}
            </button>
          </fieldset>
        </form>
      )}
    </>
  );
}
