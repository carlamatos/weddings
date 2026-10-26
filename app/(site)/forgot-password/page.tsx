import { greatVibes } from '@/app/ui/fonts';
import ForgotPasswordForm from '@/app/ui/forgot-password-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';

export default function ForgotPasswordPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <ForgotPasswordForm />
    </main>
  );
}
