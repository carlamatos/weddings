import { greatVibes } from '@/app/ui/fonts';
import RegisterForm from '@/app/ui/register-form';
import Link from 'next/link';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import { parseStartParams } from '@/app/lib/start-intent';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ lang?: string; start?: string; theme?: string }> }) {
  const params = await searchParams;
  const lang = params.lang === 'fr' ? 'fr' : 'en';
  // From a landing page: start with an invitation or a website, maybe in a chosen theme.
  const start = parseStartParams(params.start, params.theme);
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <RegisterForm lang={lang} start={start} />
    </main>
  );
}
