import '@/app/ui/global.css';
import '@/app/ui/marketing.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { greatVibes, inter } from '@/app/ui/fonts';

// The 404 for addresses that match no page at all. The site has two root
// layouts (app/(site) and app/fr), so this page brings its own <html>.
// Pages that call notFound() still show their own layout's 404.
export const metadata: Metadata = {
  title: 'Page not found | MyGala',
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className={`marketing-page ${greatVibes.variable}`}>
          <main className="mk-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <div className="wrap" style={{ textAlign: 'center' }}>
              <Link href="/" className="wordmark" style={{ fontSize: 44 }}>My<span className="accent">Gala</span></Link>
              <h1 className="mk-h1" style={{ marginTop: 24 }}>Page not found</h1>
              <p className="mk-lead" style={{ margin: '0 auto 28px' }}>This page doesn’t exist, or it has moved.</p>
              <p style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" className="btn-primary">Go to the home page</Link>
                <Link href="/themes" className="ilp-link">See the themes</Link>
              </p>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
