import { greatVibes } from '@/app/ui/fonts';
import Verify2FAForm from '@/app/ui/verify-2fa-form';
import Link from 'next/link';
import '@/app/ui/auth.css';

export default function Verify2FAPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href="/" className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <Verify2FAForm />
    </main>
  );
}
