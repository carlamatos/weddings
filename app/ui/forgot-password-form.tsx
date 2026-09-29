'use client';

import { useState, FormEvent } from 'react';
import { AtSymbolIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } finally {
      // Always show the same confirmation, regardless of outcome — whether
      // the account exists isn't something this page should reveal.
      setSent(true);
      setIsPending(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-card">
        <h1 className="auth-heading">Check your email</h1>
        <p className="auth-subheading">If that email has an account, we&apos;ve sent a link to reset your password.</p>
        <p className="auth-footer">
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="auth-heading">Forgot your password?</h1>
      <p className="auth-subheading">Enter your email and we&apos;ll send you a link to reset it.</p>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AtSymbolIcon className="auth-input-icon" />
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={isPending}>
          Send reset link <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>

      <p className="auth-footer">
        <Link href="/login">Back to login</Link>
      </p>
    </div>
  );
}
