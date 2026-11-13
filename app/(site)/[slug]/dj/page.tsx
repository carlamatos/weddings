import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchUserPage } from '@/app/lib/data';
import { isDjKey } from '@/app/lib/dj-token';
import { isPageOffline } from '@/app/lib/page-status';
import DjBoard from '@/app/ui/dj-board';

export const metadata: Metadata = { title: 'DJ song queue', robots: { index: false, follow: false } };

// mygala.ca/<slug>/dj?k=… — the DJ's song queue (Live Party): guests' requests
// sorted by votes, with a "Played" button. Only with the private key the host
// copies from Song Requests (app/lib/dj-token.ts).
export default async function DjPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ k?: string }> }) {
  const [{ slug }, { k }] = await Promise.all([params, searchParams]);
  const page = await fetchUserPage(slug);
  if (!page || !isDjKey(page.id, k)) notFound();
  const msg = (text: string) => (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#15111a', color: 'rgba(255,255,255,.8)', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      <p style={{ fontSize: 18, maxWidth: 480, lineHeight: 1.6 }}>{text}</p>
    </main>
  );
  if (isPageOffline(page.status || 'active')) return msg('This event page isn’t available right now.');
  if (page.plan_type !== 'paid') return msg('The song queue is part of MyGala Live Party. Ask the host to upgrade this event.');
  return <DjBoard pageId={Number(page.id)} djKey={k!} heading={page.heading || ''} />;
}
