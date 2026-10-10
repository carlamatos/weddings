import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import Script from 'next/script';
import type { Metadata } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import { Suspense } from 'react';
import PurchaseConversion from '@/app/ui/purchase-conversion';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'MyGala',
    template: '%s | MyGala',
  },
  description: 'Beautiful event websites made easy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Suspense fallback={null}>
          <PurchaseConversion />
        </Suspense>
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
