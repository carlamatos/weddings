import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { fetchPageSettings, fetchUserPage } from '@/app/lib/data';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA, mustShowPasswordGate } from '@/app/lib/page-gate';
import { isPageDraft, isPageOffline } from '@/app/lib/page-status';
import { hasSaveTheDate } from '@/app/lib/save-the-date';
import PageUnavailable from '@/app/ui/page-unavailable';
import { SaveTheDateView, saveTheDateMetadata } from '@/app/ui/save-the-date-view';

// mygala.ca/<slug>/save-the-date — the shareable save-the-date
// (app/lib/save-the-date.ts). The custom-domain version is
// app/site/[host]/save-the-date. A page with no date to come, or behind a
// password the guest hasn't entered, goes to the event page instead.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await fetchUserPage((await params).slug);
  if (!page || isPageOffline(page.status || 'active')) return { robots: { index: false, follow: false } };
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  return saveTheDateMetadata(page);
}

export default async function SaveTheDatePage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, session] = await Promise.all([params, auth()]);
  const page = await fetchUserPage(slug);
  if (!page) notFound();
  const isOwner = session?.user?.id === page.user_id;
  if (isPageOffline(page.status || 'active') && !(isPageDraft(page.status) && isOwner)) return <PageUnavailable draft={isPageDraft(page.status)} />;
  const settings = await fetchPageSettings(page.id);
  if (!hasSaveTheDate(page) || await mustShowPasswordGate(page.id, settings, page.plan_type === 'paid', isOwner)) redirect(`/${page.slug}`);
  return <SaveTheDateView page={page} settings={settings} count={!session?.user} />;
}
