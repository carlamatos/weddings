'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import NavLinks from './nav-links';
import ThemeSwitcher from './theme-switcher';
import { Bars3Icon, XMarkIcon, PowerIcon } from '@heroicons/react/24/outline';
import type { EventTheme } from '@/app/lib/definitions';

interface Props {
  hasPage: boolean;
  themes: EventTheme[];
  currentThemeId: string | null;
}

export default function MobileMenu({ hasPage, themes, currentThemeId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="mobile-burger" onClick={() => setOpen(true)} aria-label="Open menu">
        <Bars3Icon />
      </button>

      {open && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setOpen(false)} />
          <aside className="mobile-menu-drawer">
            <div className="mobile-menu-header">
              <Link href="/" className="dash-sidebar-logo" onClick={() => setOpen(false)}>
                <span className="dash-sidebar-wordmark">
                  My<span className="accent">Gala</span>
                </span>
              </Link>
              <button className="mobile-menu-close" onClick={() => setOpen(false)} aria-label="Close menu">
                <XMarkIcon />
              </button>
            </div>

            <nav className="dash-sidebar-nav" onClick={() => setOpen(false)}>
              <NavLinks hasPage={hasPage} />
            </nav>

            {themes.length > 0 && (
              <div className="mobile-menu-theme">
                <p className="mobile-menu-theme-label">Theme</p>
                <ThemeSwitcher currentThemeId={currentThemeId} themes={themes} />
              </div>
            )}

            <div className="dash-sidebar-footer">
              <button className="dash-signout-btn" onClick={() => signOut()}>
                <PowerIcon />
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
