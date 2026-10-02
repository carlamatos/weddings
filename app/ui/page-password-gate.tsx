'use client';

import { useState } from 'react';
import type { Translations } from '@/app/lib/translations';

// Shown instead of a password-protected event page (Plus) until the guest
// enters the password the host shared. Nothing about the event is rendered.
export default function PagePasswordGate({ token, t }: { token: string; t: Translations }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/page-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error === 'too_many' ? t.privateTooMany : t.privateWrong);
    } catch {
      setError(t.errorGeneral);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#F6F2ED', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#241F2B' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 400, background: '#fff', border: '1px solid #EDE6DB', borderRadius: 16, padding: '36px 28px', textAlign: 'center', boxShadow: '0 16px 40px -20px rgba(36,31,43,0.25)' }}>
        <div aria-hidden="true" style={{ width: 52, height: 52, borderRadius: '50%', background: '#F6E6E3', color: '#B6584A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 26, margin: '0 0 10px' }}>{t.privateTitle}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: '#6B6470', margin: '0 0 24px' }}>{t.privateText}</p>
        <label htmlFor="page-password" style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: '#6B6470', marginBottom: 6 }}>
          {t.privatePassword}
        </label>
        <input
          id="page-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontSize: 16, border: '1px solid #DCD3C5', borderRadius: 10, outline: 'none' }}
        />
        {error && <p role="alert" style={{ color: '#B91C1C', fontSize: 14, margin: '12px 0 0' }}>{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          style={{ marginTop: 18, width: '100%', padding: '13px 20px', border: 'none', borderRadius: 999, background: '#B6584A', color: '#fff', fontSize: 15, fontWeight: 600, cursor: busy ? 'default' : 'pointer', opacity: busy || !password ? 0.6 : 1 }}
        >
          {busy ? t.sending : t.privateEnter}
        </button>
      </form>
    </main>
  );
}
