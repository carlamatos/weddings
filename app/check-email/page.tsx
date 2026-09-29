import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import '@/app/ui/auth.css';

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href="/" className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <div className="auth-card">
        <h1 className="auth-heading">Check your email</h1>
        <p className="auth-subheading">
          {email
            ? <>We&apos;ve sent a verification link to <strong>{email}</strong>. Click it to confirm your account.</>
            : "We've sent a verification link to your email address. Click it to confirm your account."}
        </p>
        <p className="auth-footer">
          Already verified? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
