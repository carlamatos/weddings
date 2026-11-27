'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appHref } from '@/app/lib/app-url';

// The French pages' top bar: the same look as the English one (.topbar in
// marketing.css), with the French pages and a link to the English site.
// Phones get the menu button and its panel.
const LINKS = [
  { href: '/fr', label: 'Accueil' },
  { href: '/fr/mariage', label: 'Mariages' },
  { href: '/fr/reveillon-du-nouvel-an', label: 'Nouvel An' },
  { href: '/fr#tarifs', label: 'Tarifs' },
  { href: '/fr#faq', label: 'FAQ' },
];

export default function FrenchTopbar({ english = '/' }: { english?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const current = (href: string) => (href === pathname ? 'page' : undefined);

  return (
    <div className="topbar">
      <Link href="/fr" className="wordmark">My<span className="accent">Gala</span></Link>
      <div className="topbar-right">
        <nav className="topbar-nav" aria-label="Menu principal">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className="nav-link" aria-current={current(l.href)}>{l.label}</Link>)}
        </nav>
        <div className="topbar-actions">
          <Link href={english} className="es-lang" hrefLang="en" lang="en" title="MyGala in English">EN</Link>
          <Link href={appHref('/login')} className="topbar-login">Se connecter</Link>
          <Link href={appHref('/register?lang=fr')} className="topbar-signup" data-cta="fr-topbar">Créer ma page</Link>
          <button
            type="button"
            className="topbar-menu-btn"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            aria-controls="fr-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="fr-mobile-nav" className="mobile-nav" aria-label="Menu principal">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-link" aria-current={current(l.href)} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link href={appHref('/login')} className="mobile-nav-link" onClick={() => setOpen(false)}>Se connecter</Link>
          <Link href={english} className="mobile-nav-sublink" hrefLang="en" lang="en" onClick={() => setOpen(false)}>MyGala in English →</Link>
        </nav>
      )}
    </div>
  );
}
