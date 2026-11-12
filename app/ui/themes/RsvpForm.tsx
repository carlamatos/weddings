'use client';

import { useState, useEffect, useRef } from 'react';
import type { Translations } from '@/app/lib/translations';
import { useRsvpOptions } from './rsvp-options';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        action?: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca';
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

// The Cloudflare bot check only works on hostnames listed for the site key
// (MyGala's own domain). There the widget renders directly; on a host's
// custom domain it runs inside MyGala's bridge page (app/api/turnstile/frame),
// which posts the token back here.
function onRootDomain(hostname: string): boolean {
  return hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`);
}

// The largest party one RSVP can bring (the RSVP route allows the same).
// Families can be big, so it's a number to type or step, not a short list.
const MAX_PARTY = 50;

export default function RsvpForm({ userPageId, translations: t, disabled = false }: { userPageId?: string; translations: Translations; disabled?: boolean }) {
  const { guestListOnly, meals: mealOptions, giftExchange } = useRsvpOptions();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'attending' | 'not_attending'>('attending');
  const [guests, setGuests] = useState(1);
  // What's typed in the number box, which may be empty mid-edit.
  const [guestsDraft, setGuestsDraft] = useState('1');
  const setPartySize = (n: number) => {
    const next = Math.min(Math.max(Number.isFinite(n) ? Math.floor(n) : 1, 1), MAX_PARTY);
    setGuests(next);
    setGuestsDraft(String(next));
  };
  const [message, setMessage] = useState('');
  // Meal choices, one row per person in the party (when the host asks).
  const [party, setParty] = useState<{ name: string; meal: string; diet: string }[]>(
    () => Array.from({ length: MAX_PARTY }, () => ({ name: '', meal: '', diet: '' })),
  );
  const setPerson = (i: number, patch: Partial<{ name: string; meal: string; diet: string }>) =>
    setParty((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  // Ticked by default; guests can untick it, and every email links to /unsubscribe.
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [joinGift, setJoinGift] = useState(false);
  const [giftIdeas, setGiftIdeas] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [cfToken, setCfToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [turnstileMode, setTurnstileMode] = useState<'none' | 'direct' | 'bridge'>('none');
  const [bridgeSrc, setBridgeSrc] = useState('');
  const bridgeRef = useRef<HTMLIFrameElement>(null);
  const useTurnstile = turnstileMode === 'direct';

  useEffect(() => {
    if (!SITE_KEY || disabled) return;
    const { hostname, host } = window.location;
    if (onRootDomain(hostname)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the hostname is only known in the browser
      setTurnstileMode('direct');
    } else if (SITE_ORIGIN) {
      setBridgeSrc(`${SITE_ORIGIN}/api/turnstile/frame?parent=${encodeURIComponent(host)}`);
      setTurnstileMode('bridge');
    }
  }, [disabled]);

  // Tokens from the bridge: only from that frame, only of the expected shape.
  useEffect(() => {
    if (turnstileMode !== 'bridge') return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== bridgeRef.current?.contentWindow) return;
      const data = e.data as { type?: unknown; token?: unknown } | null;
      if (data?.type === 'mygala-turnstile' && typeof data.token === 'string') setCfToken(data.token);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [turnstileMode]);

  useEffect(() => {
    if (!SITE_KEY || !useTurnstile) return;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY!,
          action: 'rsvp',
          callback: (token) => setCfToken(token),
          'expired-callback': () => setCfToken(''),
          'error-callback': () => setCfToken(''),
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [useTurnstile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Belt-and-suspenders: the fieldset below already disables every control
    // and blocks native submission, but a preview render should never POST.
    if (disabled) return;
    if (!name.trim()) { setError(t.errorName); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.errorEmail); return;
    }
    if (turnstileMode !== 'none' && !cfToken) {
      setError('Please complete the security check.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPageId, name, email, phone, status, guests, message, receiveUpdates, honeypot, cfToken, ...(mealOptions ? { meals: party.slice(0, guests) } : {}), ...(giftExchange && joinGift && status === 'attending' ? { joinGiftExchange: true, giftIdeas } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.code === 'not_on_guest_list' ? t.errorNotOnGuestList : data.error ?? t.errorGeneral);
        // Tokens are single-use: get a fresh one for the next attempt.
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
          setCfToken('');
        } else if (turnstileMode === 'bridge') {
          bridgeRef.current?.contentWindow?.postMessage({ type: 'mygala-turnstile-reset' }, '*');
          setCfToken('');
        }
      } else {
        setSubmitted(true);
      }
    } catch {
      setError(t.errorGeneral);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rsvp-success">
        <p className="rsvp-headline">
          {status === 'attending' ? t.successAttending : t.successNotAttending}
        </p>
        <p className="rsvp-sub">{t.confirmationNoted.replace('{{name}}', name)}</p>
      </div>
    );
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
      {disabled && (
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6B6470', background: 'rgba(0,0,0,0.05)', border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 14px', margin: 0 }}>
          Preview only — RSVPs can be submitted from your live page.
        </p>
      )}
      {/* A native fieldset disables every control inside it (including via
          keyboard) — more robust than disabling each input individually. */}
      <fieldset disabled={disabled} style={{ display: 'contents' }}>
      {/* Honeypot — hidden from real users, bots fill it in */}
      <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="rsvp-website">Website</label>
        <input
          type="text" id="rsvp-website" name="website" tabIndex={-1} autoComplete="off"
          value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* The host only accepts replies from their guest list, matched by email. */}
      {guestListOnly && (
        <p id="rsvp-guest-list-note" className="rsvp-guest-list-note" style={{ margin: 0, fontSize: '0.95em', lineHeight: 1.55 }}>
          {t.rsvpGuestListNote}
        </p>
      )}
      <div>
        <label className="field-label" htmlFor="rsvp-name">{t.fullName}</label>
        <input
          type="text" id="rsvp-name" value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe" required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="rsvp-email">{t.email}</label>
        <input
          type="email" id="rsvp-email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@email.com" required
          aria-describedby={guestListOnly ? 'rsvp-guest-list-note' : undefined}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="rsvp-phone">{t.phoneOptional}</label>
        <input
          type="tel" id="rsvp-phone" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
        />
      </div>
      <div>
        <label className="field-label">{t.willYouAttend}</label>
        <div className="attend-options">
          <label className="radio-label">
            <input type="radio" name="rsvp-attending" value="attending"
              checked={status === 'attending'} onChange={() => setStatus('attending')} />
            {t.joyfullyAccepts}
          </label>
          <label className="radio-label">
            <input type="radio" name="rsvp-attending" value="not_attending"
              checked={status === 'not_attending'} onChange={() => setStatus('not_attending')} />
            {t.regretfullyDeclines}
          </label>
        </div>
      </div>
      {status === 'attending' && (
        <div>
          <label className="field-label" htmlFor="rsvp-guests">{t.numberOfGuests}</label>
          <div className="rsvp-party-size" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="rsvp-step" aria-label={t.fewerGuests} disabled={guests <= 1} onClick={() => setPartySize(guests - 1)} style={stepBtn}><StepIcon /></button>
            <input
              id="rsvp-guests"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_PARTY}
              value={guestsDraft}
              onChange={(e) => {
                setGuestsDraft(e.target.value);
                const n = Number(e.target.value);
                if (e.target.value !== '' && Number.isFinite(n) && n >= 1) setGuests(Math.min(Math.floor(n), MAX_PARTY));
              }}
              onBlur={() => setPartySize(Number(guestsDraft) || 1)}
              style={{ width: 84, flex: '0 0 auto', textAlign: 'center' }}
            />
            <button type="button" className="rsvp-step" aria-label={t.moreGuests} disabled={guests >= MAX_PARTY} onClick={() => setPartySize(guests + 1)} style={stepBtn}><StepIcon plus /></button>
            <span className="check-hint" style={{ margin: 0 }}>{guests === 1 ? t.justMe : t.includingYou}</span>
          </div>
        </div>
      )}
      {status === 'attending' && mealOptions && (
        <div className="rsvp-meals" role="group" aria-labelledby="rsvp-meals-label">
          {/* A label like the form's others, so it takes the theme's look. */}
          <label className="field-label" id="rsvp-meals-label" htmlFor="rsvp-meal-0">{t.mealsHeading}</label>
          <p className="check-hint" style={{ margin: '0 0 10px' }}>{t.mealsHint}</p>
          <div style={{ display: 'grid', gap: 14 }}>
            {party.slice(0, guests).map((row, i) => (
              <div key={i} className="rsvp-meal-person" style={{ display: 'grid', gap: 8 }}>
                {guests > 1 && (
                  i === 0 ? (
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95em' }}>{t.mealsYou}{name.trim() ? ` · ${name.trim()}` : ''}</p>
                  ) : (
                    <label style={{ display: 'grid', gap: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95em' }}>{t.mealsGuestLabel.replace('{{n}}', String(i + 1))}</span>
                      <input type="text" value={row.name} maxLength={80} placeholder={t.mealsGuestNamePlaceholder} onChange={(e) => setPerson(i, { name: e.target.value })} />
                    </label>
                  )
                )}
                <select id={`rsvp-meal-${i}`} value={row.meal} aria-label={`${t.mealsHeading}${guests > 1 ? ` · ${i === 0 ? t.mealsYou : t.mealsGuestLabel.replace('{{n}}', String(i + 1))}` : ''}`} onChange={(e) => setPerson(i, { meal: e.target.value })}>
                  <option value="">{t.mealsChoose}</option>
                  {mealOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" value={row.diet} maxLength={200} aria-label={t.mealsDiet} placeholder={`${t.mealsDiet}: ${t.mealsDietPlaceholder}`} onChange={(e) => setPerson(i, { diet: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      )}
      {status === 'attending' && giftExchange && (
        <div>
          <label className="check-label">
            <input type="checkbox" checked={joinGift} onChange={(e) => setJoinGift(e.target.checked)} />
            {t.rsvpGiftJoin}
          </label>
          {joinGift && (
            <>
              <label className="field-label" htmlFor="rsvp-gift-ideas" style={{ marginTop: 10 }}>{t.rsvpGiftIdeas}</label>
              <textarea id="rsvp-gift-ideas" value={giftIdeas} rows={2} maxLength={500} onChange={(e) => setGiftIdeas(e.target.value)} placeholder={t.rsvpGiftIdeasPlaceholder} style={{ resize: 'vertical' }} />
            </>
          )}
        </div>
      )}
      <div>
        <label className="field-label" htmlFor="rsvp-note">{t.noteForCouple}</label>
        <textarea
          id="rsvp-note" value={message} rows={3}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.noteForCouplePlaceholder}
          style={{ resize: 'vertical' }}
        />
      </div>
      <div>
        <label className="check-label">
          <input type="checkbox" checked={receiveUpdates}
            onChange={(e) => setReceiveUpdates(e.target.checked)} />
          {t.receiveUpdatesLabel}
        </label>
        <p className="check-hint">{t.unsubscribeHint}</p>
      </div>

      {useTurnstile && <div ref={turnstileRef} style={{ margin: '8px 0' }} />}
      {turnstileMode === 'bridge' && bridgeSrc && (
        <iframe
          ref={bridgeRef}
          src={bridgeSrc}
          title="Security check"
          style={{ display: 'block', width: 300, maxWidth: '100%', height: 70, border: 0, margin: '8px 0', background: 'transparent' }}
        />
      )}

      {error && <p className="rsvp-error">{error}</p>}
      <button type="submit" className="btn" disabled={submitting || (!!SITE_KEY && !cfToken)} style={{ width: 'fit-content' }}>
        {submitting ? t.sending : t.sendRsvp}
      </button>
      </fieldset>
    </form>
  );
}

// The − and + beside the party size: outlined in the theme's text colour.
// Drawn, not typed: a font's − and + sit off-centre in a circle.
function StepIcon({ plus = false }: { plus?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{ display: 'block' }}>
      <path d={plus ? 'M3 8h10M8 3v10' : 'M3 8h10'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const stepBtn: React.CSSProperties = {
  width: 40, height: 40, flex: '0 0 auto', display: 'grid', placeItems: 'center', padding: 0, borderRadius: '50%',
  border: '1.5px solid currentColor', background: 'transparent', color: 'inherit', font: 'inherit', fontSize: 20, lineHeight: 1, cursor: 'pointer',
};
