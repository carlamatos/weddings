import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import '@/app/ui/auth.css';

export default function EmailVerifiedPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href="/" className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <div className="auth-card">
        <h1 className="auth-heading">Email verified</h1>
        <p className="auth-subheading">Your email address has been confirmed. You can now sign in to your account.</p>
        <Link href="/login" className="auth-btn" style={{ textDecoration: 'none' }}>
          Sign in <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </Link>
      </div>
    </main>
  );
}
