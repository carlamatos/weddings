import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Script from 'next/script';
import type { Metadata } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import { Suspense } from 'react';
import PurchaseConversion from '@/app/ui/purchase-conversion';
import SignupTracker from '@/app/ui/signup-tracker';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'MyGala',
    template: '%s | MyGala',
  },
  description: 'Beautiful event websites made easy.',
  // Pinterest domain claim: <meta name="p:domain_verify" content="…">.
  verification: {
    other: { 'p:domain_verify': '4d3552c75368443fb81329d46054f89b' },
  },
};

// Google Tag Manager runs on the live site only (not staging, previews or
// local dev), so test visits never reach the live container.
const GTM_ID = process.env.VERCEL_ENV === 'production' ? 'GTM-NKSF95VQ' : null;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
        <Suspense fallback={null}>
          <PurchaseConversion />
          <SignupTracker />
        </Suspense>
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
