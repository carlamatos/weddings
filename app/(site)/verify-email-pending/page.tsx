import { greatVibes } from '@/app/ui/fonts';
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';
import { DashTextProvider } from '@/app/ui/dashboard/dash-text';
import { en } from '@/app/lib/dash-text/en';
import Link from 'next/link';
import { signOut } from '@/auth';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import { AUTH_METADATA } from '@/app/lib/auth-metadata';

export const metadata = AUTH_METADATA.verifyEmailPending;

export default async function VerifyEmailPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <div className="auth-card">
        <h1 className="auth-heading">Please verify your email</h1>
        <p className="auth-subheading">
          {error === 'invalid'
            ? "That verification link is invalid or has expired. Send a new one below."
            : "Check your inbox for the verification link we sent you, or send a new one below. Verifying unlocks publishing your page and sending invitations."}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          {/* The sign-in pages are in English, so the button is too. */}
          <DashTextProvider text={en}><ResendVerificationButton /></DashTextProvider>
        </div>
        <p className="auth-footer">
          Wrong account?{' '}
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }} style={{ display: 'inline' }}>
            <button
              type="submit"
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--rose)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Log in as someone else
            </button>
          </form>
        </p>
      </div>
    </main>
  );
}
