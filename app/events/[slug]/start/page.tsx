import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEventType } from '@/app/lib/marketing/events';
import { LANDING_PAGES, getLandingPage } from '@/app/lib/marketing/landing';
import { marketingMetadata } from '@/app/lib/marketing/seo';
import { themeCardsFor } from '@/app/lib/marketing/theme-cards';
import SiteFooter from '@/app/ui/marketing/site-footer';
import { LandingView } from '@/app/ui/marketing/landing-view';

// Google Ads landing pages: /events/weddings/start and
// /events/celebrations/start. The layout is app/ui/marketing/landing-view.tsx.

export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getLandingPage((await params).slug);
  if (!page) return {};
  const meta = marketingMetadata(page.seo, `/events/${page.slug}/start`);
  // The wedding page has a French version.
  if (page.slug !== 'weddings') return meta;
  return { ...meta, alternates: { ...meta.alternates, languages: { 'en-CA': '/events/weddings/start', 'fr-CA': '/fr/mariage' } } };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  const type = getEventType(slug);
  if (!page || !type) notFound();
  return <LandingView page={page} templates={themeCardsFor(type.category)} faqs={type.faqs} footer={<SiteFooter />} />;
}
