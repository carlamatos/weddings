import { greatVibes } from '@/app/ui/fonts';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import '@/app/ui/auth.css';
import { siteHref } from '@/app/lib/app-url';
import { AUTH_METADATA } from '@/app/lib/auth-metadata';
import type { Metadata } from 'next';

// In the sign-up page's language: the confirmation link carries ?lang=fr|es
// (app/api/verify-email/route.ts).
const TEXT = {
  en: {
    heading: 'Email verified',
    body: 'Your email address is confirmed and everything is unlocked: publish your page, send your invitations and share your link.',
    button: 'Go to my event',
  },
  fr: {
    heading: 'Courriel confirmé',
    body: 'Votre adresse courriel est confirmée et tout est débloqué : publiez votre page, envoyez vos invitations et partagez votre lien.',
    button: 'Aller à mon événement',
  },
  es: {
    heading: 'Correo verificado',
    body: 'Tu correo está confirmado y todo está desbloqueado: publica tu página, envía tus invitaciones y comparte tu enlace.',
    button: 'Ir a mi evento',
  },
};

type Params = { searchParams: Promise<{ lang?: string }> };

const pageLang = (lang?: string) => (lang === 'fr' || lang === 'es' ? lang : 'en');

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
  const lang = pageLang((await searchParams).lang);
  return lang === 'fr' ? AUTH_METADATA.emailVerifiedFr : lang === 'es' ? AUTH_METADATA.emailVerifiedEs : AUTH_METADATA.emailVerified;
}

export default async function EmailVerifiedPage({ searchParams }: Params) {
  const lang = pageLang((await searchParams).lang);
  const t = TEXT[lang];
  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <Link href={siteHref('/')} className="auth-wordmark">
        My<span className="accent">Gala</span>
      </Link>
      <div className="auth-card" lang={lang}>
        <h1 className="auth-heading">{t.heading}</h1>
        <p className="auth-subheading">{t.body}</p>
        <Link href="/dashboard" className="auth-btn" style={{ textDecoration: 'none' }}>
          {t.button} <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </Link>
      </div>
    </main>
  );
}
