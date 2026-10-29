import { greatVibes } from '@/app/ui/fonts';
import LoginForm from '@/app/ui/login-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import { AUTH_METADATA } from '@/app/lib/auth-metadata';

export const metadata = AUTH_METADATA.login;

// ?next=: from a "design your invitation" page, back to the create-event
// form with the visitor's choices after logging in.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const setupNext = typeof next === 'string' && next.startsWith('/dashboard/setup') ? next : undefined;
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <LoginForm next={setupNext} />
    </main>
  );
}
