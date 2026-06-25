'use client';

import { useState } from 'react';

export default function RsvpForm({ userPageId }: { userPageId?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'attending' | 'not_attending'>('attending');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.'); return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPageId, name, email, phone, status, guests, message, receiveUpdates }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rsvp-success">
        <p className="rsvp-headline">
          {status === 'attending'
            ? "we can't wait to celebrate with you"
            : "we'll miss you, but thank you for letting us know"}
        </p>
        <p className="rsvp-sub">a confirmation has been noted for {name}.</p>
      </div>
    );
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="field-label" htmlFor="rsvp-name">full name</label>
        <input
          type="text" id="rsvp-name" value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe" required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="rsvp-email">email</label>
        <input
          type="email" id="rsvp-email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@email.com" required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="rsvp-phone">phone (optional)</label>
        <input
          type="tel" id="rsvp-phone" value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
        />
      </div>
      <div>
        <label className="field-label">will you attend?</label>
        <div className="attend-options">
          <label className="radio-label">
            <input type="radio" name="rsvp-attending" value="attending"
              checked={status === 'attending'} onChange={() => setStatus('attending')} />
            joyfully accepts
          </label>
          <label className="radio-label">
            <input type="radio" name="rsvp-attending" value="not_attending"
              checked={status === 'not_attending'} onChange={() => setStatus('not_attending')} />
            regretfully declines
          </label>
        </div>
      </div>
      {status === 'attending' && (
        <div>
          <label className="field-label" htmlFor="rsvp-guests">number of guests</label>
          <select id="rsvp-guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            <option value={1}>just me</option>
            <option value={2}>2 guests</option>
            <option value={3}>3 guests</option>
            <option value={4}>4 guests</option>
          </select>
        </div>
      )}
      <div>
        <label className="field-label" htmlFor="rsvp-note">note for the couple (optional)</label>
        <textarea
          id="rsvp-note" value={message} rows={3}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="So excited for you two…"
          style={{ resize: 'vertical' }}
        />
      </div>
      <div>
        <label className="check-label">
          <input type="checkbox" checked={receiveUpdates}
            onChange={(e) => setReceiveUpdates(e.target.checked)} />
          I'd like to receive event updates via email
        </label>
        <p className="check-hint">you can unsubscribe at any time.</p>
      </div>
      {error && <p className="rsvp-error">{error}</p>}
      <button type="submit" className="btn" disabled={submitting} style={{ width: 'fit-content' }}>
        {submitting ? 'sending…' : 'send rsvp'}
      </button>
    </form>
  );
}
