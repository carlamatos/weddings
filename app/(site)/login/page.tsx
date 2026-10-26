import { greatVibes } from '@/app/ui/fonts';
import LoginForm from '@/app/ui/login-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import { AUTH_METADATA } from '@/app/lib/auth-metadata';

export const metadata = AUTH_METADATA.login;

export default function LoginPage() {
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <LoginForm />
    </main>
  );
}
