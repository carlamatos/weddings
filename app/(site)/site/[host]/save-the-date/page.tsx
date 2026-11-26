import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchPageSettings, fetchUserPageByDomain } from '@/app/lib/data';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA, mustShowPasswordGate } from '@/app/lib/page-gate';
import { isPageOffline } from '@/app/lib/page-status';
import { hasSaveTheDate } from '@/app/lib/save-the-date';
import PageUnavailable from '@/app/ui/page-unavailable';
import { SaveTheDateView, saveTheDateMetadata } from '@/app/ui/save-the-date-view';

// <custom domain>/save-the-date (rewritten here by proxy.ts): the same
// save-the-date as mygala.ca/<slug>/save-the-date.

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const page = await fetchUserPageByDomain(decodeURIComponent((await params).host));
  if (!page || isPageOffline(page.status)) return { robots: { index: false, follow: false } };
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  return saveTheDateMetadata(page);
}

export default async function CustomDomainSaveTheDate({ params }: { params: Promise<{ host: string }> }) {
  const page = await fetchUserPageByDomain(decodeURIComponent((await params).host));
  if (!page) notFound();
  if (isPageOffline(page.status)) return <PageUnavailable />;
  const settings = await fetchPageSettings(page.id);
  if (!hasSaveTheDate(page) || await mustShowPasswordGate(page.id, settings, page.plan_type === 'paid')) redirect('/');
  // Sessions don't reach a custom domain, so every visit counts (as on its home page).
  return <SaveTheDateView page={page} settings={settings} count />;
}
