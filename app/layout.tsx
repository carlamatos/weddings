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
        {/* beforeInteractive puts the GTM snippet in <head>, as Google asks. */}
        {GTM_ID && (
          <Script id="google-tag-manager" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5MD6D8FQ6X"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5MD6D8FQ6X');
            gtag('config', 'AW-18504468577');
          `}
        </Script>
      </body>
    </html>
  );
}
