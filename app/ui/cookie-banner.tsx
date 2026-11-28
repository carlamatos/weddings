'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CONSENT_SETTINGS_EVENT, isGuestPath, saveConsent, savedConsent, type ConsentChoice } from '@/app/lib/consent';
import { Mascot } from '@/app/ui/mascot';

// "We use cookies": Accept or Reject, with equal weight, and the privacy
// policy (app/lib/consent.ts). Shown until the visitor chooses, and again
// from "Cookie settings" in the footer. Not on guests' pages (no Google tags
// load there). In the page's language (<html lang>). Rendered only where
// Google's tags run (the live site): elsewhere there's nothing to agree to.

const TEXT = {
  en: { title: 'Cookies on MyGala', body: 'We use cookies from Google to measure our ads and see how MyGala is used, so we can make it better. You choose.', accept: 'Accept', reject: 'Reject', policy: 'Privacy policy' },
  fr: { title: 'Les témoins sur MyGala', body: 'Nous utilisons des témoins (cookies) de Google pour mesurer nos publicités et voir comment MyGala est utilisé, afin de l’améliorer. À vous de choisir.', accept: 'Accepter', reject: 'Refuser', policy: 'Politique de confidentialité' },
  es: { title: 'Cookies en MyGala', body: 'Usamos cookies de Google para medir nuestros anuncios y ver cómo se usa MyGala, para mejorarlo. Tú decides.', accept: 'Aceptar', reject: 'Rechazar', policy: 'Política de privacidad' },
};

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<keyof typeof TEXT>('en');

  useEffect(() => {
    const l = document.documentElement.lang.slice(0, 2);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(l === 'fr' || l === 'es' ? l : 'en');
    // Checked from the address itself (not the boot script's note, which
    // pages such as the 404 don't run).
    if (!isGuestPath(window.location.hostname, window.location.pathname) && !savedConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, reopen);
  }, []);

  if (!open) return null;
  const t = TEXT[lang];
  const choose = (c: ConsentChoice) => { saveConsent(c); setOpen(false); };

  return (
    <div className="mg-cookies" role="dialog" aria-labelledby="mg-cookies-title" aria-describedby="mg-cookies-body">
      <style>{`
        .mg-cookies { position: fixed; left: 16px; bottom: 16px; z-index: 2147483000; width: min(400px, calc(100vw - 32px)); display: flex; gap: 12px; align-items: flex-start;
          padding: 16px 18px; border-radius: 18px; background: #fff; color: #241F2B; border: 1px solid #EADFD3; box-shadow: 0 18px 40px -18px rgba(36,31,43,.45);
          font-family: inherit; font-size: 14px; line-height: 1.5; animation: mg-cookies-in .35s ease-out both; }
        .mg-cookies .mascot { flex: none; margin: -4px -2px 0 -6px; }
        .mg-cookies h2 { margin: 0 0 4px; font-size: 15px; font-weight: 700; }
        .mg-cookies p { margin: 0 0 12px; color: #5E5762; }
        .mg-cookies-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .mg-cookies button { padding: 9px 18px; border-radius: 999px; font: inherit; font-weight: 700; font-size: 14px; cursor: pointer; border: 1.5px solid #B6584A; }
        .mg-cookies .mg-accept { background: #B6584A; color: #fff; }
        .mg-cookies .mg-reject { background: #fff; color: #B6584A; }
        .mg-cookies button:focus-visible, .mg-cookies a:focus-visible { outline: 2px solid #241F2B; outline-offset: 2px; }
        .mg-cookies a { color: #5E5762; font-size: 13px; margin-left: 4px; }
        @keyframes mg-cookies-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @media (max-width: 640px) { .mg-cookies { left: 8px; right: 8px; bottom: 8px; width: auto; } }
        @media (prefers-reduced-motion: reduce) { .mg-cookies { animation: none; } }
      `}</style>
      <Mascot pose="bubbly" size={46} eager />
      <div>
        <h2 id="mg-cookies-title">{t.title}</h2>
        <p id="mg-cookies-body">{t.body}</p>
        <div className="mg-cookies-actions">
          <button type="button" className="mg-accept" onClick={() => choose('all')}>{t.accept}</button>
          <button type="button" className="mg-reject" onClick={() => choose('none')}>{t.reject}</button>
          <Link href="/privacy#cookies">{t.policy}</Link>
        </div>
      </div>
    </div>
  );
}

// "Cookie settings" in the footers: opens the banner again to change the choice.
export function CookieSettingsLink({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT))}
      style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textDecoration: 'inherit', textAlign: 'inherit' }}
    >
      {label}
    </button>
  );
}
