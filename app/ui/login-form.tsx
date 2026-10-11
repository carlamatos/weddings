'use client';

import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import GoogleButton from '@/app/ui/google-button';
import Link from 'next/link';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="auth-card">
      <h1 className="auth-heading">Welcome back</h1>
      <p className="auth-subheading">Log in to manage your event page.</p>

      {errorMessage && (
        <div className="auth-error" aria-live="polite">
          <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {errorMessage}
        </div>
      )}

      <form action={formAction}>
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
            />
            <AtSymbolIcon className="auth-input-icon" />
          </div>
        </div>

        <div className="auth-field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label className="auth-label" htmlFor="password">Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--rose)', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <KeyIcon className="auth-input-icon" />
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={isPending}>
          Log in <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>

      <div className="auth-divider">or continue with</div>

      <GoogleButton />

      <p className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link href="/register">Sign up</Link>
      </p>
    </div>
  );
}
