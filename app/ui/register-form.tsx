'use client';

import { AtSymbolIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useActionState, useEffect, useState } from 'react';
import { registerUser, RegisterState } from '@/app/lib/actions';
import Link from 'next/link';
import GoogleButton from '@/app/ui/google-button';
import { saveStartIntent, type StartIntent } from '@/app/lib/start-intent';

// Just an email and a password (typed twice): every extra field costs sign-ups. Names and
// phone can be added later in the profile. French when the visitor comes
// from the French landing page (/register?lang=fr). start: how a landing
// page's visitor wants to begin (see app/lib/start-intent.ts) — kept for the
// create-event form, and an invitation heading here.
const TEXT = {
  en: {
    heading: 'Create your free event',
    sub: 'Free to start — no credit card needed.',
    divider: 'or sign up with email',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 8 characters',
    confirmPassword: 'Confirm password',
    confirmHint: 'Type your password again',
    mismatch: 'Passwords don’t match.',
    show: 'Show password',
    hide: 'Hide password',
    submit: 'Create my free account',
    haveAccount: 'Already have an account?',
    login: 'Log in',
  },
  fr: {
    heading: 'Créez votre page gratuite',
    sub: 'Gratuit pour commencer, sans carte de crédit.',
    divider: 'ou inscrivez-vous par courriel',
    email: 'Courriel',
    password: 'Mot de passe',
    passwordHint: 'Au moins 8 caractères',
    confirmPassword: 'Confirmer le mot de passe',
    confirmHint: 'Retapez votre mot de passe',
    mismatch: 'Les mots de passe ne correspondent pas.',
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    submit: 'Créer mon compte gratuit',
    haveAccount: 'Vous avez déjà un compte?',
    login: 'Se connecter',
  },
} as const;

const INVITATION_HEADING = {
  en: { heading: 'Create your free invitation', sub: 'Design it, share one link, and watch the RSVPs come in. No credit card needed.' },
  fr: { heading: 'Créez votre invitation gratuite', sub: 'Créez-la, partagez un seul lien et recevez les réponses. Sans carte de crédit.' },
} as const;

export default function RegisterForm({ lang = 'en', start = null }: { lang?: 'en' | 'fr'; start?: StartIntent | null }) {
  const t = start?.intent === 'invitation' ? { ...TEXT[lang], ...INVITATION_HEADING[lang] } : TEXT[lang];
  useEffect(() => {
    if (start) saveStartIntent(start);
  }, [start]);
  const initialState: RegisterState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(registerUser, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  // Stop the sign-up when the two passwords differ (the server checks too).
  function checkMatch(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
    if (password !== confirm) {
      e.preventDefault();
      setMismatch(true);
      (form.elements.namedItem('confirmPassword') as HTMLInputElement).focus();
    }
  }
  const confirmError = mismatch ? t.mismatch : state.errors?.confirmPassword?.[0];

  return (
    <div className="auth-card" lang={lang}>
      <h1 className="auth-heading">{t.heading}</h1>
      <p className="auth-subheading">{t.sub}</p>

      <GoogleButton lang={lang} />

      <div className="auth-divider">{t.divider}</div>

      {state.message && !state.errors && (
        <div className="auth-error">
          <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {state.message}
        </div>
      )}

      <form action={formAction} onSubmit={checkMatch}>
        <input type="hidden" name="lang" value={lang} />

        <div className="auth-field">
          <label className="auth-label" htmlFor="email">{t.email}</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="email" type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
            <AtSymbolIcon className="auth-input-icon" />
          </div>
          {state.errors?.email && <p className="auth-field-error">{state.errors.email[0]}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">{t.password}</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={t.passwordHint}
              autoComplete="new-password"
              required
              minLength={8}
              onChange={() => setMismatch(false)}
            />
            <button
              type="button"
              className="auth-input-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t.hide : t.show}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          {state.errors?.password && <p className="auth-field-error">{state.errors.password[0]}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirmPassword">{t.confirmPassword}</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder={t.confirmHint}
              autoComplete="new-password"
              required
              minLength={8}
              onChange={() => setMismatch(false)}
              aria-invalid={confirmError ? true : undefined}
              aria-describedby={confirmError ? 'confirmPassword-error' : undefined}
            />
          </div>
          {confirmError && <p className="auth-field-error" id="confirmPassword-error" role="alert">{confirmError}</p>}
        </div>

        <button className="auth-btn" type="submit" disabled={isPending}>
          {t.submit} <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>

      <p className="auth-footer">
        {t.haveAccount}{' '}
        <Link href="/login">{t.login}</Link>
      </p>
    </div>
  );
}
