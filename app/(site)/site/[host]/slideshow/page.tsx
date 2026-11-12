import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchUserPageByDomain, fetchPageSettings } from '@/app/lib/data';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA } from '@/app/lib/page-gate';
import { isPageOffline } from '@/app/lib/page-status';
import PageUnavailable from '@/app/ui/page-unavailable';
import SlideshowScreen from '@/app/ui/slideshow-screen';

// <custom domain>/slideshow — the live photo slideshow (Live Party); proxy.ts
// rewrites it here. No owner preview (the sign-in cookie belongs to mygala.ca).

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const page = await fetchUserPageByDomain(decodeURIComponent((await params).host));
  if (!page) return {};
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  return { title: { absolute: `Photo slideshow · ${page.heading}` }, robots: { index: false, follow: false } };
}

export default async function CustomDomainSlideshow({ params }: { params: Promise<{ host: string }> }) {
  const page = await fetchUserPageByDomain(decodeURIComponent((await params).host));
  if (!page) notFound();
  if (isPageOffline(page.status || 'active')) return <PageUnavailable />;
  return <SlideshowScreen page={page} isOwner={false} />;
}
