'use client';

import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useActionState } from 'react';
import { authenticate, GoogleSignIn, AppleSignIn, FacebookSignIn } from '@/app/lib/actions';
import Link from 'next/link';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="auth-card">
      <h1 className="auth-heading">Welcome back</h1>
      <p className="auth-subheading">Log in to manage your wedding page.</p>

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
          <label className="auth-label" htmlFor="password">Password</label>
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

      <button onClick={() => GoogleSignIn()} className="auth-social-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: 18, height: 18 }}>
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Continue with Google
      </button>

      <button onClick={() => AppleSignIn()} className="auth-social-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" style={{ width: 16, height: 16 }}>
          <path fill="#000000" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 382.8-.2 266.6 0 154.8 0 68.5 54.8 2.4 128.2 2.4c36.2 0 81.9 24.4 106.2 58.4 23.1 32.3 50.4 78.4 100.3 78.4h.6c-5.1-26.1-6.3-53.6 3.2-80.8 18.1-52.1 63.8-90.5 119.1-90.5 36.2 0 75.6 18.2 101.3 52.1 25.7 34 42.8 85.4 42.8 140.3z"/>
        </svg>
        Continue with Apple
      </button>

      <button onClick={() => FacebookSignIn()} className="auth-social-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: 18, height: 18 }}>
          <path fill="#1877F2" d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.014 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"/>
          <path fill="#fff" d="M33.342 30.938 34.406 24H27.75v-4.5c0-1.9.93-3.75 3.911-3.75h3.026V9.844s-2.747-.469-5.372-.469c-5.482 0-9.065 3.323-9.065 9.337V24h-6.094v6.938h6.094V47.708A24.124 24.124 0 0 0 24 48c1.28 0 2.542-.097 3.75-.292V30.938h5.592z"/>
        </svg>
        Continue with Facebook
      </button>

      <p className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link href="/register">Sign up</Link>
      </p>
    </div>
  );
}
