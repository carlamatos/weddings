'use client';

import { UserIcon, AtSymbolIcon, KeyIcon, PhoneIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useActionState } from 'react';
import { registerUser, RegisterState } from '@/app/lib/actions';
import Link from 'next/link';

export default function RegisterForm() {
  const initialState: RegisterState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <div className="auth-card">
      <h1 className="auth-heading">Create your account</h1>
      <p className="auth-subheading">Start building your wedding page today.</p>

      {state.message && !state.errors && (
        <div className="auth-error">
          <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {state.message}
        </div>
      )}

      <form action={formAction}>
        <div className="auth-grid-2">
          <div className="auth-field">
            <label className="auth-label" htmlFor="given_name">First Name</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="given_name" type="text" name="given_name" placeholder="First name" required />
              <UserIcon className="auth-input-icon" />
            </div>
            {state.errors?.given_name && <p className="auth-field-error">{state.errors.given_name[0]}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="family_name">Last Name</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="family_name" type="text" name="family_name" placeholder="Last name" required />
              <UserIcon className="auth-input-icon" />
            </div>
            {state.errors?.family_name && <p className="auth-field-error">{state.errors.family_name[0]}</p>}
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="phone">
            Phone <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, opacity: 0.7 }}>(optional)</span>
          </label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="phone" type="tel" name="phone" placeholder="Enter phone number" />
            <PhoneIcon className="auth-input-icon" />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="email" type="email" name="email" placeholder="you@example.com" required />
            <AtSymbolIcon className="auth-input-icon" />
          </div>
          {state.errors?.email && <p className="auth-field-error">{state.errors.email[0]}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="password" type="password" name="password" placeholder="At least 6 characters" required minLength={6} />
            <KeyIcon className="auth-input-icon" />
          </div>
          {state.errors?.password && <p className="auth-field-error">{state.errors.password[0]}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="confirmPassword" type="password" name="confirmPassword" placeholder="Re-enter your password" required minLength={6} />
            <KeyIcon className="auth-input-icon" />
          </div>
          {state.errors?.confirmPassword && <p className="auth-field-error">{state.errors.confirmPassword[0]}</p>}
        </div>

        <button className="auth-btn" type="submit" disabled={isPending}>
          Create account <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{' '}
        <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
