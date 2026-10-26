import { greatVibes } from '@/app/ui/fonts';
import Verify2FAForm from '@/app/ui/verify-2fa-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import { AUTH_METADATA } from '@/app/lib/auth-metadata';

export const metadata = AUTH_METADATA.verify2fa;

export default function Verify2FAPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <Verify2FAForm />
    </main>
  );
}
