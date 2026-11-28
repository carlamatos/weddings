'use client';

import { useEffect } from 'react';
import { COMPANY } from '@/app/lib/company';
import { Mascot } from '@/app/ui/mascot';

// The "Something went wrong" screen, with Pop the party popper saying oops
// (app/ui/mascot.tsx): for the error.tsx files (the site, the dashboard, the
// French and Spanish pages) and app/global-error.tsx. Try again re-renders
// just the part that failed (Next's retry). The reference is the error's
// digest, which matches the server's logs, so a host who writes in can quote
// it. Inline styles only: global-error has none of the site's CSS.

export type ErrorText = { title: string; text: string; retry: string; home: string; help: string; reference: string };

export const ERROR_TEXT: Record<'en' | 'fr' | 'es', ErrorText> = {
  en: {
    title: 'Oops! Something went wrong',
    text: 'Pop tripped over its own confetti. It’s not you: please try again.',
    retry: 'Try again',
    home: 'Go to the home page',
    help: 'If it keeps happening, write to us at {email}.',
    reference: 'Reference: {code}',
  },
  fr: {
    title: 'Oups ! Un problème est survenu',
    text: 'Pop s’est pris les pieds dans ses confettis. Ce n’est pas votre faute : veuillez réessayer.',
    retry: 'Réessayer',
    home: 'Retour à l’accueil',
    help: 'Si le problème continue, écrivez-nous à {email}.',
    reference: 'Référence : {code}',
  },
  es: {
    title: '¡Ups! Algo salió mal',
    text: 'Pop se tropezó con su propio confeti. No es tu culpa: inténtalo de nuevo.',
    retry: 'Intentar de nuevo',
    home: 'Ir a la página de inicio',
    help: 'Si sigue pasando, escríbenos a {email}.',
    reference: 'Referencia: {code}',
  },
};

const ROSE = '#B6584A';

export function ErrorContent({ error, retry, t, homeHref, compact = false }: { error: unknown; retry: () => void; t: ErrorText; homeHref: string; compact?: boolean }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && 'digest' in error && typeof error.digest === 'string' ? error.digest : null;
  const [before, after] = t.help.split('{email}');

  return (
    <div role="alert" style={{ minHeight: compact ? 0 : '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: compact ? '48px 20px' : '40px 20px', textAlign: 'center', background: compact ? 'transparent' : 'linear-gradient(180deg, #FBF7F2 0%, #F3EADF 100%)', color: '#241F2B', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 520 }}>
        <Mascot pose="pop-oops" size={compact ? 150 : 180} eager style={{ display: 'block', margin: '0 auto 6px', maxWidth: '50vw', height: 'auto' }} />
        <h1 style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, fontSize: compact ? 30 : 'clamp(30px, 5vw, 42px)', lineHeight: 1.15, margin: '0 0 12px' }}>{t.title}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: '#6B6470', margin: '0 0 26px' }}>{t.text}</p>
        <p style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', margin: 0 }}>
          <button type="button" onClick={() => retry()} style={{ padding: '13px 26px', border: 'none', borderRadius: 999, background: ROSE, color: '#fff', font: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{t.retry}</button>
          {/* A full page load, not client navigation: the app may be what broke. */}
          <a href={homeHref} style={{ color: '#241F2B', fontWeight: 600, textDecoration: 'none', borderBottom: '2px solid currentColor', paddingBottom: 2 }}>{t.home}</a>
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#8A8090', margin: '28px 0 0' }}>
          {before}<a href={`mailto:${COMPANY.email}`} style={{ color: ROSE }}>{COMPANY.email}</a>{after}
          {digest && <><br /><span style={{ fontSize: 12 }}>{t.reference.replace('{code}', digest)}</span></>}
        </p>
      </div>
    </div>
  );
}
