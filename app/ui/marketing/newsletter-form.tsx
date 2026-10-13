'use client';

import { useState } from 'react';

// Newsletter sign-up in the marketing footer. The 10%-off Plus code is
// emailed (app/api/newsletter), not shown here.
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, source: 'footer' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <section className="newsletter" aria-labelledby="newsletter-heading">
      <p className="newsletter-eyebrow">MyGala newsletter</p>
      <h2 id="newsletter-heading" className="newsletter-heading">Get 10% off MyGala Plus</h2>
      {status === 'done' ? (
        <p className="newsletter-done" role="status">
          You&rsquo;re in! 🎉 Check <strong>{email}</strong> for your 10% off code.
        </p>
      ) : (
        <>
          <p className="newsletter-lead">
            Subscribe for new themes, event ideas and offers, and we&rsquo;ll email you a code for 10% off Plus.
          </p>
          <form className="newsletter-form" onSubmit={submit}>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* Honeypot: hidden from people, filled in by bots. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
              onChange={(e) => setWebsite(e.target.value)} style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
            <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Subscribing…' : 'Subscribe'}</button>
          </form>
          {status === 'error' && <p className="newsletter-error" role="alert">{error}</p>}
          <p className="newsletter-fine">No spam — unsubscribe anytime. See our <a href="/privacy">Privacy Policy</a>.</p>
        </>
      )}
    </section>
  );
}
