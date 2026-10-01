import { greatVibes } from '@/app/ui/fonts';
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';
import Link from 'next/link';
import { signOut } from '@/auth';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';

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
            : "It's been a few days and we still don't have a confirmed email address for this account. Check your inbox for the verification link, or send a new one below."}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <ResendVerificationButton />
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
