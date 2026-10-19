import { greatVibes } from '@/app/ui/fonts';
import RegisterForm from '@/app/ui/register-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = (await searchParams).lang === 'fr' ? 'fr' : 'en';
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <RegisterForm lang={lang} />
    </main>
  );
}
