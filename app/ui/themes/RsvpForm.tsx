'use client';

import { useState, useEffect, useRef } from 'react';
import type { Translations } from '@/app/lib/translations';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function RsvpForm({ userPageId, translations: t }: { userPageId?: string; translations: Translations }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'attending' | 'not_attending'>('attending');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [cfToken, setCfToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => setCfToken(token),
          'expired-callback': () => setCfToken(''),
          'error-callback': () => setCfToken(''),
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(t.errorName); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.errorEmail); return;
    }
    if (SITE_KEY && !cfToken) {
      setError('Please complete the security check.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPageId, name, email, phone, status, guests, message, receiveUpdates, honeypot, cfToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t.errorGeneral);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
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
      {/* Honeypot — hidden from real users, bots fill it in */}
      <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="rsvp-website">Website</label>
        <input
          type="text" id="rsvp-website" name="website" tabIndex={-1} autoComplete="off"
          value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

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
          <select id="rsvp-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            <option value={1}>{t.justMe}</option>
            <option value={2}>2 {t.guests}</option>
            <option value={3}>3 {t.guests}</option>
            <option value={4}>4 {t.guests}</option>
          </select>
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
      <div style={{ display: 'none' }}>
        <label className="check-label">
          <input type="checkbox" checked={receiveUpdates}
            onChange={(e) => setReceiveUpdates(e.target.checked)} />
          {t.receiveUpdatesLabel}
        </label>
        <p className="check-hint">{t.unsubscribeHint}</p>
      </div>

      {SITE_KEY && <div ref={turnstileRef} style={{ margin: '8px 0' }} />}

      {error && <p className="rsvp-error">{error}</p>}
      <button type="submit" className="btn" disabled={submitting || (!!SITE_KEY && !cfToken)} style={{ width: 'fit-content' }}>
        {submitting ? t.sending : t.sendRsvp}
      </button>
    </form>
  );
}
