'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { signOut } from 'next-auth/react';

export default function Verify2FAForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="auth-card">
      <h1 className="auth-heading">Two-factor verification</h1>
      <p className="auth-subheading">
        {useBackupCode
          ? 'Enter one of your backup codes.'
          : 'Enter the 6-digit code from your authenticator app.'}
      </p>

      {error && (
        <div className="auth-error" aria-live="polite">
          <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="code">{useBackupCode ? 'Backup code' : 'Verification code'}</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              id="code"
              type="text"
              inputMode={useBackupCode ? 'text' : 'numeric'}
              placeholder={useBackupCode ? 'xxxxx-xxxxx' : '123456'}
              autoComplete="one-time-code"
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <KeyIcon className="auth-input-icon" />
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={isPending}>
          Verify <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>

      <p className="auth-footer">
        <button
          type="button"
          onClick={() => { setUseBackupCode((v) => !v); setCode(''); setError(null); }}
          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--rose)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
        >
          {useBackupCode ? 'Use an authenticator code instead' : "Use a backup code instead"}
        </button>
      </p>
      <p className="auth-footer">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--rose)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign in as someone else
        </button>
      </p>
    </div>
  );
}
