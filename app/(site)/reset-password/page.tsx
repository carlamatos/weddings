import { greatVibes } from '@/app/ui/fonts';
import ResetPasswordForm from '@/app/ui/reset-password-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="auth-card">
          <h1 className="auth-heading">Invalid link</h1>
          <p className="auth-subheading">This password reset link is missing or invalid.</p>
          <p className="auth-footer">
            <Link href="/forgot-password">Request a new link</Link>
          </p>
        </div>
      )}
    </main>
  );
}
