import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchUserPage, fetchPageSettings } from '@/app/lib/data';
import { auth } from '@/auth';
import { signPageId } from '@/app/lib/page-token';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA, mustShowPasswordGate } from '@/app/lib/page-gate';
import { getTranslations } from '@/app/lib/translations';
import { isPageOffline } from '@/app/lib/page-status';
import { isSeatingOn } from '@/app/lib/seating';
import PagePasswordGate from '@/app/ui/page-password-gate';
import PageUnavailable from '@/app/ui/page-unavailable';
import FindTable from '@/app/ui/find-table';

// mygala.ca/<slug>/table — Find Your Table (Plus). The custom-domain
// version is app/site/[host]/table.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = await fetchUserPage((await params).slug);
  if (!page) return {};
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  const t = getTranslations(page.language || 'en');
  return { title: { absolute: `${t.findTableTitle} · ${page.heading}` }, robots: { index: false, follow: false } };
}

export default async function FindTablePage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string | string[] }>;
}) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, auth()]);
  const page = await fetchUserPage(slug);
  if (!page) notFound();
  if (isPageOffline(page.status || 'active')) return <PageUnavailable />;
  const isPaid = page.plan_type === 'paid';
  const isOwner = session?.user?.id === page.user_id;
  const settings = await fetchPageSettings(page.id);
  const t = getTranslations(page.language || 'en');

  if (await mustShowPasswordGate(page.id, settings, isPaid, isOwner)) {
    return <PagePasswordGate token={signPageId(page.id)} t={t} />;
  }

  return (
    <FindTable
      pageId={page.id}
      heading={page.heading}
      bannerImage={page.banner_image || undefined}
      t={t}
      on={isSeatingOn(settings, isPaid)}
      isOwner={isOwner}
      backHref={`/${page.slug}`}
      query={typeof query.name === 'string' ? query.name : ''}
    />
  );
}
