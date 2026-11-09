import '@/app/ui/global.css';
import '@/app/ui/marketing.css';
import { NotFoundContent } from '@/app/ui/not-found-content';
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
          <NotFoundContent />
        </div>
      </body>
    </html>
  );
}
