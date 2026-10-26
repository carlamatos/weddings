import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';

export default function EmailVerifiedPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <div className="auth-card">
        <h1 className="auth-heading">Email verified</h1>
        <p className="auth-subheading">
          Your email address is confirmed and everything is unlocked: publish your page, send your invitations and share your link.
        </p>
        <Link href="/dashboard" className="auth-btn" style={{ textDecoration: 'none' }}>
          Go to my event <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </Link>
      </div>
    </main>
  );
}
