import type { Metadata } from 'next';
import { greatVibes } from '@/app/ui/fonts';
import { NotFoundContent } from '@/app/ui/not-found-content';
import '@/app/ui/marketing.css';

// The 404 for pages that call notFound(), such as an event page address
// that no one has taken.
export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <div className={`marketing-page ${greatVibes.variable}`}>
      <NotFoundContent />
    </div>
  );
}
