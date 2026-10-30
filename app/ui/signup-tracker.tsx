'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PAGE_CREATED_COOKIE, SIGNUP_COOKIE } from '@/app/lib/signup-cookie';

// Google Ads "Sign up" conversion, once it's created in Google Ads:
// NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO = 'AW-…/…' (the snippet's send_to).
const ADS_SIGNUP_SEND_TO = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO;
// The same for an "Event page created" conversion.
const ADS_PAGE_SEND_TO = process.env.NEXT_PUBLIC_GOOGLE_ADS_PAGE_CREATED_SEND_TO;

// A cookie's value, and the cookie deleted so it's only reported once.
function takeCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match) return null;
  document.cookie = `${name}=; Max-Age=0; Path=/`;
  return decodeURIComponent(match[1]);
}

// Funnel events for Google Analytics:
// - sign_up_click: a "Create your free event page" / "Sign up" link was clicked
//   (location = the link's data-cta, else the page it was on);
// - cta_click: another link with a data-cta was clicked (e.g. the demo);
// - sign_up: an account was just created (markSignUp left a cookie), also
//   reported as a Google Ads conversion when one is configured, and pushed to
//   Tag Manager as 'mygala_signup' (a Custom Event trigger: gtag() calls
//   don't fire those) for tags like Pinterest's;
// - event_page_created: an event page was just created (markPageCreated left
//   a cookie), with its event_type, theme and plan; also a Google Ads
//   conversion when one is configured, and 'mygala_event_page_created' for
//   Tag Manager.
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
    const method = takeCookie(SIGNUP_COOKIE);
    let page: { eventType?: string; theme?: string; plan?: string } | null = null;
    try { page = JSON.parse(takeCookie(PAGE_CREATED_COOKIE) ?? 'null'); } catch { page = null; }
    if (!method && !page) return;
    const pageParams = page && { event_type: String(page.eventType ?? ''), theme: String(page.theme ?? ''), plan: String(page.plan ?? '') };

    // Queued for Tag Manager, which reads it whenever it loads (live site only).
    const w = window as Window & { dataLayer?: unknown[] };
    if (method) (w.dataLayer ??= []).push({ event: 'mygala_signup', method });
    if (pageParams) (w.dataLayer ??= []).push({ event: 'mygala_event_page_created', ...pageParams });

    // gtag loads after hydration; wait for it (up to 10s).
    let tries = 0;
    const timer = window.setInterval(() => {
      if (!window.gtag && ++tries < 40) return;
      window.clearInterval(timer);
      if (method) {
        window.gtag?.('event', 'sign_up', { method });
        if (ADS_SIGNUP_SEND_TO) window.gtag?.('event', 'conversion', { send_to: ADS_SIGNUP_SEND_TO });
      }
      if (pageParams) {
        window.gtag?.('event', 'event_page_created', pageParams);
        if (ADS_PAGE_SEND_TO) window.gtag?.('event', 'conversion', { send_to: ADS_PAGE_SEND_TO });
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}
