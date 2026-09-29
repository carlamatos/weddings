'use client';

import { useState, FormEvent } from 'react';
import { KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  if (success) {
    return (
      <div className="auth-card">
        <h1 className="auth-heading">Password updated</h1>
        <p className="auth-subheading">Your password has been changed. You can now sign in with your new password.</p>
        <Link href="/login" className="auth-btn" style={{ textDecoration: 'none' }}>
          Sign in <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-heading">Choose a new password</h1>
      <p className="auth-subheading">Enter a new password for your account.</p>

      {error && (
        <div className="auth-error" aria-live="polite">
          <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="password">New password</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              id="password"
              type="password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <KeyIcon className="auth-input-icon" />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirmPassword">Confirm new password</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <KeyIcon className="auth-input-icon" />
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={isPending || !token}>
          Update password <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>
    </div>
  );
}
