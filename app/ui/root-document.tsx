import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Script from 'next/script';
import type { Metadata } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import { Suspense } from 'react';
import PurchaseConversion from '@/app/ui/purchase-conversion';
import SignupTracker from '@/app/ui/signup-tracker';

// The <html> and <body> every page shares. The site has two root layouts so
// each page's <html lang> matches its language: English for everything in
// app/(site), French for app/fr (where its hreflang says fr-CA).

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

// tags={false}: no Tag Manager or conversion tracking, for pages shown only
// inside another page (the live theme previews, app/(frame)), so they
// don't count as visits.
export function RootDocument({ lang, children, tags = true }: { lang: string; children: React.ReactNode; tags?: boolean }) {
  const GTM_ID = tags ? LIVE_GTM_ID : null;
  return (
    <html lang={lang}>
      <body className={`${inter.className} antialiased`}>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
        {tags && (
          <Suspense fallback={null}>
            <PurchaseConversion />
            <SignupTracker />
          </Suspense>
        )}
        {/* One Google tag install: the GTM container already holds the GA4
            tag (G-5MD6D8FQ6X), so gtag.js isn't loaded separately. The queue
            and gtag() are set up at once, so the visit's start time and any
            early events (signup, purchase conversions) are kept; GTM itself
            loads when the browser is idle so it doesn't compete with the
            page's own content. Google Ads is configured here because the
            container has no Ads tag. */}
        {GTM_ID && (
          <>
            <Script id="google-tag-queue" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];
window.gtag=function(){dataLayer.push(arguments);};
dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
gtag('js',new Date());
gtag('config','AW-18504468577');`}
            </Script>
            <Script id="google-tag-manager" src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} strategy="lazyOnload" />
          </>
        )}
      </body>
    </html>
  );
}
