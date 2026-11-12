'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appHref } from '@/app/lib/app-url';
import { FEATURES, getFeature } from '@/app/lib/marketing/features';
import { EVENT_TYPES } from '@/app/lib/marketing/events';
import SiteSearch from '@/app/ui/marketing/site-search';

const EVENT_LINKS = EVENT_TYPES.map((e) => ({ href: `/events/${e.slug}`, label: e.name }));
// The desktop Features mega menu: every feature, grouped. A feature not
// listed here still shows, at the end of the last group.
const FEATURE_GROUPS = (() => {
  const groups = [
    { title: 'Invite & plan', slugs: ['invitations', 'rsvp-meal-choices', 'event-reminder-emails', 'wedding-budget-tracker', 'rsvp-timeline-reminders', 'potluck', 'gift-exchange'] },
    { title: 'On the day', slugs: ['guest-photo-qr-code', 'live-photo-slideshow', 'find-your-table', 'livestream'] },
    { title: 'Your page', slugs: ['event-templates', 'custom-sections', 'event-page-translations', 'password-protection', 'custom-domain'] },
  ];
  const listed = new Set(groups.flatMap((g) => g.slugs));
  groups[groups.length - 1].slugs.push(...FEATURES.filter((f) => !listed.has(f.slug)).map((f) => f.slug));
  return groups.map((g) => ({ title: g.title, features: g.slugs.map((slug) => getFeature(slug)!) }));
})();
// The phone menu lists the most-used features; the rest are one click away
// under "All features".
const MENU_FEATURES = ['invitations', 'guest-photo-qr-code', 'find-your-table', 'livestream', 'event-reminder-emails', 'event-page-translations', 'gift-exchange', 'custom-domain'];
const FEATURE_LINKS = MENU_FEATURES.map((slug) => ({ href: `/features/${slug}`, label: getFeature(slug)!.navLabel }));
// After the two dropdowns. About, Contact and the legal pages are in the footer.
const PAGE_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
];

// The marketing pages' top bar (homepage, About, Contact, Privacy, Terms,
// features, events, pricing, FAQ, blog). Desktop shows the nav inline with hover
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

  // The Features mega menu is centred under its link, then nudged sideways
  // (--mega-shift) so it never runs off the edge of the window.
  const megaRef = useRef<HTMLDivElement>(null);
  const placeMega = () => {
    const panel = megaRef.current;
    const item = panel?.parentElement;
    if (!panel || !item) return;
    const r = item.getBoundingClientRect();
    const w = panel.offsetWidth;
    const left = r.left + r.width / 2 - w / 2;
    const margin = 24;
    const clamped = Math.min(Math.max(left, margin), window.innerWidth - margin - w);
    panel.style.setProperty('--mega-shift', `${Math.round(clamped - left)}px`);
  };
  useEffect(() => {
    placeMega();
    window.addEventListener('resize', placeMega);
    return () => window.removeEventListener('resize', placeMega);
  }, []);

  return (
    <div className="topbar">
      <Link href="/" className="wordmark">My<span className="accent">Gala</span></Link>
      <div className="topbar-right">
        <nav className="topbar-nav" aria-label="Main">
          <div className="nav-item">
            <Link href="/events" className="nav-link">Events</Link>
            <div className="nav-dropdown">
              {EVENT_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
            </div>
          </div>
          <div className="nav-item nav-item--mega" onMouseEnter={placeMega} onFocus={placeMega}>
            <Link href="/features" className="nav-link">Features</Link>
            <div className="nav-dropdown nav-mega" ref={megaRef}>
              <div className="nav-mega-cols">
                {FEATURE_GROUPS.map((g) => (
                  <div key={g.title} className="nav-mega-col">
                    <p className="nav-mega-heading">{g.title}</p>
                    {g.features.map((f) => (
                      <Link key={f.slug} href={`/features/${f.slug}`} className="nav-mega-link">
                        <span className="nav-mega-name">
                          {f.navLabel}
                          {f.plan === 'Live Party' && <span className="nav-mega-plus">Live Party</span>}
                        </span>
                        <span className="nav-mega-summary">{f.summary}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
              <div className="nav-mega-foot">
                <Link href="/features" className="nav-mega-all">All features →</Link>
                <Link href="/pricing" className="nav-mega-all">Compare Free and Live Party →</Link>
              </div>
            </div>
          </div>
          {PAGE_LINKS.map((l) => <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>)}
        </nav>
        <div className="topbar-actions">
          <SiteSearch />
          {isLoggedIn ? (
            <Link href={appHref('/dashboard')} className="topbar-signup">Dashboard</Link>
          ) : (
            <>
              <Link href={appHref('/login')} className="topbar-login">Log in</Link>
              <Link href={appHref('/register')} className="topbar-signup" data-cta="topbar">Sign up</Link>
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
          <Link href="/events" className="mobile-nav-link" onClick={close}>Events</Link>
          {EVENT_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-sublink" onClick={close}>{l.label}</Link>
          ))}
          <Link href="/features" className="mobile-nav-link" onClick={close}>Features</Link>
          {FEATURE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-sublink" onClick={close}>{l.label}</Link>
          ))}
          <Link href="/features" className="mobile-nav-sublink" onClick={close}>All features →</Link>
          {PAGE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="mobile-nav-link" onClick={close}>{l.label}</Link>
          ))}
          {!isLoggedIn && (
            // The smallest phones hide the top bar's Log in button.
            <Link href={appHref('/login')} className="mobile-nav-link" onClick={close}>Log in</Link>
          )}
        </nav>
      )}
    </div>
  );
}
