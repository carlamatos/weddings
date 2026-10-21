'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SIGNUP_COOKIE } from '@/app/lib/signup-cookie';

// Google Ads "Sign up" conversion, once it's created in Google Ads:
// NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO = 'AW-…/…' (the snippet's send_to).
const ADS_SIGNUP_SEND_TO = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO;

// Funnel events for Google Analytics:
// - sign_up_click: a "Create your free event page" / "Sign up" link was clicked
//   (location = the link's data-cta, else the page it was on);
// - cta_click: another link with a data-cta was clicked (e.g. the demo);
// - sign_up: an account was just created (markSignUp left a cookie), also
//   reported as a Google Ads conversion when one is configured, and pushed to
//   Tag Manager as 'mygala_signup' (a Custom Event trigger: gtag() calls
//   don't fire those) for tags like Pinterest's.
export default function SignupTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      let url: URL;
      try { url = new URL(link.href); } catch { return; }
      if (url.pathname !== '/register') {
        // Other tagged calls to action (e.g. "See a live demo").
        if (link.dataset.cta) window.gtag?.('event', 'cta_click', { location: link.dataset.cta, link_text: link.textContent?.trim().slice(0, 60), transport_type: 'beacon' });
        return;
      }
      window.gtag?.('event', 'sign_up_click', {
        location: link.dataset.cta ?? window.location.pathname,
        link_text: link.textContent?.trim().slice(0, 60),
        transport_type: 'beacon',
      });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${SIGNUP_COOKIE}=([^;]*)`));
    if (!match) return;
    const method = decodeURIComponent(match[1]);
    document.cookie = `${SIGNUP_COOKIE}=; Max-Age=0; Path=/`;

    // Queued for Tag Manager, which reads it whenever it loads (live site only).
    const w = window as Window & { dataLayer?: unknown[] };
    (w.dataLayer ??= []).push({ event: 'mygala_signup', method });

    // gtag loads after hydration; wait for it (up to 10s).
    let tries = 0;
    const timer = window.setInterval(() => {
      if (!window.gtag && ++tries < 40) return;
      window.clearInterval(timer);
      window.gtag?.('event', 'sign_up', { method });
      if (ADS_SIGNUP_SEND_TO) window.gtag?.('event', 'conversion', { send_to: ADS_SIGNUP_SEND_TO });
    }, 250);
    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}
