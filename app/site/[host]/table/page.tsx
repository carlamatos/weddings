import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchUserPageByDomain, fetchPageSettings } from '@/app/lib/data';
import { signPageId } from '@/app/lib/page-token';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA, mustShowPasswordGate } from '@/app/lib/page-gate';
import { getTranslations } from '@/app/lib/translations';
import { isPageOffline } from '@/app/lib/page-status';
import { isSeatingOn } from '@/app/lib/seating';
import PagePasswordGate from '@/app/ui/page-password-gate';
import PageUnavailable from '@/app/ui/page-unavailable';
import FindTable from '@/app/ui/find-table';

// <custom domain>/table — Find Your Table (Plus); proxy.ts rewrites it here.
// Like the custom-domain page itself, there's no owner preview (the
// sign-in cookie belongs to mygala.ca).

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const page = await fetchUserPageByDomain(decodeURIComponent((await params).host));
  if (!page) return {};
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  const t = getTranslations(page.language || 'en');
  return { title: { absolute: `${t.findTableTitle} · ${page.heading}` }, robots: { index: false, follow: false } };
}

export default async function CustomDomainFindTable({ params, searchParams }: {
  params: Promise<{ host: string }>;
  searchParams: Promise<{ name?: string | string[] }>;
}) {
  const [{ host }, query] = await Promise.all([params, searchParams]);
  const page = await fetchUserPageByDomain(decodeURIComponent(host));
  if (!page) notFound();
  if (isPageOffline(page.status || 'active')) return <PageUnavailable />;
  const isPaid = page.plan_type === 'paid';
  const settings = await fetchPageSettings(page.id);
  const t = getTranslations(page.language || 'en');

  if (await mustShowPasswordGate(page.id, settings, isPaid)) {
    return <PagePasswordGate token={signPageId(page.id)} t={t} />;
  }

  return (
    <FindTable
      pageId={page.id}
      heading={page.heading}
      bannerImage={page.banner_image || undefined}
      t={t}
      on={isSeatingOn(settings, isPaid)}
      isOwner={false}
      backHref="/"
      query={typeof query.name === 'string' ? query.name : ''}
    />
  );
}
