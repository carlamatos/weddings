import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchUserPage, fetchPageSettings } from '@/app/lib/data';
import { auth } from '@/auth';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA } from '@/app/lib/page-gate';
import { isPageDraft, isPageOffline } from '@/app/lib/page-status';
import PageUnavailable from '@/app/ui/page-unavailable';
import SlideshowScreen from '@/app/ui/slideshow-screen';

// mygala.ca/<slug>/slideshow — the live photo slideshow (Live Party). The
// custom-domain version is app/site/[host]/slideshow.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await fetchUserPage((await params).slug);
  if (!page) return {};
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  return { title: { absolute: `Photo slideshow · ${page.heading}` }, robots: { index: false, follow: false } };
}

export default async function SlideshowPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, auth()]);
  const page = await fetchUserPage(slug);
  if (!page) notFound();
  const isOwner = session?.user?.id === page.user_id;
  if (isPageOffline(page.status || 'active') && !(isPageDraft(page.status) && isOwner)) return <PageUnavailable draft={isPageDraft(page.status)} />;
  return <SlideshowScreen page={page} isOwner={isOwner} />;
}
