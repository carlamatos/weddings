import { greatVibes } from '@/app/ui/fonts';
import LoginForm from '@/app/ui/login-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import { AUTH_METADATA } from '@/app/lib/auth-metadata';

export const metadata = AUTH_METADATA.login;

// Messages for ?error= after a social sign-in (Auth.js, auth.ts signIn).
const OAUTH_ERRORS: Record<string, string> = {
  NoEmail: 'Your Facebook account has no email address. Please continue with Google or sign up with your email instead.',
  OAuthAccountNotLinked: 'Something went wrong signing you in. Please try again.',
  OAuthCallbackError: 'Something went wrong signing you in. Please try again.',
  AccessDenied: 'Sign-in was cancelled. Please try again.',
};

// ?next=: from a "design your invitation" page, back to the create-event
// form with the visitor's choices after logging in. ?facebook=1: show
// "Continue with Facebook" (hidden from everyone else until Meta's review).
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; facebook?: string; error?: string }> }) {
  const { next, facebook, error } = await searchParams;
  const setupNext = typeof next === 'string' && next.startsWith('/dashboard/setup') ? next : undefined;
  const oauthError = typeof error === 'string' ? OAUTH_ERRORS[error] ?? OAUTH_ERRORS.OAuthCallbackError : undefined;
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <LoginForm next={setupNext} facebook={facebook === '1'} oauthError={oauthError} />
    </main>
  );
}
