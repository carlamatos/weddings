'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { appHref } from '@/app/lib/app-url';
import { createUserPage, registerOnTryPage } from '@/app/lib/actions';
import { slugify } from '@/app/lib/slugify';
import GoogleButton from '@/app/ui/google-button';

// The sign-up step of a "design your invitation" page (try-invitation.tsx):
// after "Save", the visitor creates their account right here, beside their
// previews, and their event is created with the design, name and date they
// chose; then they're in its editor. Google sign-in and logging in to an
// account they already have leave the page, so those go on to the
// create-event form with the same choices in its address (setupPath).
export type TryChoices = {
  themeSlug: string;
  eventType: string;
  eventName: string;
  eventDate: string;
  intent: 'invitation' | 'website';
};

// Page addresses to try, best first (the create-event form suggests the same).
function addressCandidates(name: string, date: string): string[] {
  const base = slugify(name) || 'our-event';
  const year = date.slice(0, 4);
  const n4 = Math.floor(1000 + Math.random() * 9000);
  const n5 = Math.floor(10000 + Math.random() * 90000);
  return [...new Set([base, year ? `${base}-${year}` : '', `${base}-${n4}`, `${base}-${n5}`].filter(Boolean))];
}

async function freeAddresses(candidates: string[]): Promise<string[]> {
  try {
    const res = await fetch('/api/slug-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs: candidates }),
    });
    if (!res.ok) return candidates;
    const { taken = [] } = (await res.json()) as { taken?: string[] };
    const free = candidates.filter((c) => !taken.includes(c));
    return free.length ? free : candidates.slice(-1);
  } catch {
    return candidates; // creating the page checks again
  }
}

export function TrySignup({ choices, setupPath, heading, onBack }: {
  choices: TryChoices;
  setupPath: string;
  heading: string;
  onBack: () => void;
}) {
  const [state, formAction, isPending] = useActionState(registerOnTryPage, { message: null });
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const started = useRef(false);

  // Signed in: create the event, then createUserPage opens its editor.
  useEffect(() => {
    if (!state.ok || started.current) return;
    started.current = true;
    setCreating(true);
    (async () => {
      const addresses = await freeAddresses(addressCandidates(choices.eventName, choices.eventDate));
      for (const slug of addresses) {
        const fd = new FormData();
        fd.set('eventType', choices.eventType);
        fd.set('themeSlug', choices.themeSlug);
        fd.set('slug', slug);
        fd.set('plan', 'free');
        fd.set('location', 'address');
        fd.set('email', email);
        fd.set('eventName', choices.eventName);
        fd.set('eventDate', choices.eventDate);
        fd.set('givenName', givenName);
        fd.set('familyName', familyName);
        if (choices.intent === 'invitation') fd.set('next', 'invitations');
        // Success redirects to the editor (no result: on its way there).
        const result = await createUserPage({ message: null, errors: {} }, fd);
        if (!result) return;
        if (!result.errors?.slug) {
          setCreating(false);
          setCreateError(result?.message ?? 'Something went wrong creating your page.');
          return;
        }
        // That address was just taken: the next one.
      }
      setCreating(false);
      setCreateError('We couldn’t find a free address for your page.');
    })();
  }, [state.ok, choices, email, givenName, familyName]);

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

  const exists = !!state.errors?.email && /already exists/.test(state.errors.email[0]);
  const loginHref = appHref(`/login?next=${encodeURIComponent(setupPath)}`);
  const busy = isPending || creating || state.ok;

  if (createError) {
    // The account is made: finish on the create-event form, already filled in.
    return (
      <div className="try-signup">
        <h2 className="try-signup__title">Your account is ready</h2>
        <div className="auth-error"><ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />{createError}</div>
        <a className="auth-btn try-invite__save" href={appHref(setupPath)}>Finish creating my page <ArrowRightIcon style={{ width: 16, height: 16 }} /></a>
      </div>
    );
  }

  return (
    <div className="try-signup">
      <h2 className="try-signup__title">{heading}</h2>
      <p className="try-signup__sub">Create your free account. Your design, names and date are saved with it. No credit card needed.</p>

      <GoogleButton next={setupPath} />
      <div className="auth-divider">or with your email</div>

      {state.message && !state.errors && (
        <div className="auth-error" role="alert"><ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />{state.message}</div>
      )}

      <form action={formAction} onSubmit={checkMatch}>
        <div className="setup-name-row">
          <div className="auth-field">
            <label className="auth-label" htmlFor="trySignupGiven">First name</label>
            <input className="auth-input" id="trySignupGiven" type="text" value={givenName} onChange={(e) => setGivenName(e.target.value)} maxLength={100} autoComplete="given-name" required />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="trySignupFamily">Last name</label>
            <input className="auth-input" id="trySignupFamily" type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} maxLength={100} autoComplete="family-name" required />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="trySignupEmail">Email</label>
          <input className="auth-input" id="trySignupEmail" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" inputMode="email" required />
          {state.errors?.email && (
            <p className="auth-field-error" role="alert">
              {state.errors.email[0]}{exists && <> <a href={loginHref}>Log in instead</a></>}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="trySignupPassword">Password</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="trySignupPassword" type={showPassword ? 'text' : 'password'} name="password" placeholder="At least 8 characters"
              autoComplete="new-password" minLength={8} required onChange={() => setMismatch(false)} />
            <button type="button" className="auth-input-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
          {state.errors?.password && <p className="auth-field-error">{state.errors.password[0]}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="trySignupConfirm">Confirm password</label>
          <input className="auth-input" id="trySignupConfirm" type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Type your password again"
            autoComplete="new-password" minLength={8} required onChange={() => setMismatch(false)} />
          {(mismatch || state.errors?.confirmPassword) && <p className="auth-field-error" role="alert">Passwords don’t match.</p>}
        </div>

        <button className="auth-btn" type="submit" disabled={busy}>
          {creating || state.ok ? 'Creating your page…' : isPending ? 'Creating your account…' : 'Create my account'} <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>

      <p className="try-signup__foot">
        Already have an account? <a href={loginHref}>Log in</a>
      </p>
      <button type="button" className="setup-back try-signup__back" onClick={onBack} disabled={busy}>← Back to my design</button>
    </div>
  );
}
