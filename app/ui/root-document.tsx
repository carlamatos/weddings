import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Script from 'next/script';
import type { Metadata } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import { Suspense } from 'react';
import PurchaseConversion from '@/app/ui/purchase-conversion';
import SignupTracker from '@/app/ui/signup-tracker';
import CookieBanner from '@/app/ui/cookie-banner';
import { tagsBootScript } from '@/app/lib/consent';

// The <html> and <body> every page shares. The site has a root layout per
// language so each page's <html lang> matches it: English for everything in
// app/(site), French for app/fr (where its hreflang says fr-CA), Spanish
// for app/es.

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'MyGala',
    template: '%s | MyGala',
  },
  description: 'Beautiful event websites made easy.',
  // Bing Webmaster Tools site verification.
  verification: { other: { 'msvalidate.01': 'AE77ECCD7DD0A74107D9A0D6D41DFF4A' } },
};

// Google Tag Manager runs on the live site only (not staging, previews or
// local dev), so test visits never reach the live container.
const LIVE_GTM_ID = process.env.VERCEL_ENV === 'production' ? 'GTM-NKSF95VQ' : null;
const ADS_ID = 'AW-18504468577';
// COOKIE_BANNER_PREVIEW=1 shows the cookie banner where Google's tags don't
// run (localhost, staging), to see it without sending test visits to Google.
const BANNER_PREVIEW = process.env.COOKIE_BANNER_PREVIEW === '1';

// tags={false}: no Tag Manager or conversion tracking, for pages shown only
// inside another page (the live theme previews, app/(frame)), so they
// don't count as visits.
export function RootDocument({ lang, children, tags = true }: { lang: string; children: React.ReactNode; tags?: boolean }) {
  const GTM_ID = tags ? LIVE_GTM_ID : null;
  return (
    <html lang={lang}>
      <body className={`${inter.className} antialiased`}>
        {children}
        {tags && (
          <Suspense fallback={null}>
            <PurchaseConversion />
            <SignupTracker />
          </Suspense>
        )}
        {/* One Google tag install: the GTM container already holds the GA4
            tag (G-5MD6D8FQ6X), so gtag.js isn't loaded separately; Google Ads
            is configured here because the container has no Ads tag. The boot
            script (app/lib/consent.ts) runs first: Consent Mode defaults
            (Quebec, the EU, the UK and Switzerland wait for Accept), the
            visitor's saved choice, then Tag Manager when the browser is idle,
            except on guests' pages (event pages, /i/ invitations, hosts'
            domains), which load no Google tags. The gtag() queue is always
            set up, so early events (sign-up, purchase) are kept. No <noscript>
            Tag Manager: without scripts there's no way to ask for consent. */}
        {tags && <Script id="google-tags" strategy="beforeInteractive">{tagsBootScript(GTM_ID, ADS_ID)}</Script>}
        {(GTM_ID || (tags && BANNER_PREVIEW)) && <CookieBanner />}
      </body>
    </html>
  );
}
