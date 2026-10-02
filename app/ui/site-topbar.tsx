'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appHref } from '@/app/lib/app-url';
import { FEATURES } from '@/app/lib/marketing/features';
import { EVENT_TYPES } from '@/app/lib/marketing/events';

const EVENT_LINKS = EVENT_TYPES.map((e) => ({ href: `/events/${e.slug}`, label: e.name }));
const FEATURE_LINKS = FEATURES.map((f) => ({ href: `/features/${f.slug}`, label: f.navLabel }));

// The marketing pages' top bar (homepage, About, Contact, Privacy, Terms,
// features, event types, FAQ). Desktop shows the nav inline with hover
// dropdowns; narrower screens get a menu button that opens the same links
// as a panel, since touch has no hover.
export default function SiteTopbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation and on Escape.
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

  const close = () => setOpen(false);

  return (
    <div className="topbar">
      <Link href="/" className="wordmark">My<span className="accent">Gala</span></Link>
      <div className="topbar-right">
        <nav className="topbar-nav" aria-label="Main">
          <div className="nav-item">
            <Link href="/#themes" className="nav-link">Events</Link>
            <div className="nav-dropdown">
              {EVENT_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
            </div>
          </div>
          <div className="nav-item">
            <Link href="/features" className="nav-link">Features</Link>
            <div className="nav-dropdown">
              {FEATURE_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
              <Link href="/features" className="nav-dropdown-all">All features →</Link>
            </div>
          </div>
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/about" className="nav-link">About Us</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </nav>
        <div className="topbar-actions">
          {isLoggedIn ? (
            <Link href={appHref('/dashboard')} className="topbar-signup">Dashboard</Link>
          ) : (
            <>
              <Link href={appHref('/login')} className="topbar-login">Log in</Link>
              <Link href={appHref('/register')} className="topbar-signup">Sign up</Link>
            </>
          )}
          <button
            type="button"
            className="topbar-menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Main">
          <Link href="/#themes" className="mobile-nav-link" onClick={close}>Events</Link>
          {EVENT_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-sublink" onClick={close}>{l.label}</Link>
          ))}
          <Link href="/features" className="mobile-nav-link" onClick={close}>Features</Link>
          {FEATURE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-sublink" onClick={close}>{l.label}</Link>
          ))}
          <Link href="/faq" className="mobile-nav-link" onClick={close}>FAQ</Link>
          <Link href="/about" className="mobile-nav-link" onClick={close}>About Us</Link>
          <Link href="/contact" className="mobile-nav-link" onClick={close}>Contact</Link>
        </nav>
      )}
    </div>
  );
}
