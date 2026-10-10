import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { appHref } from '@/app/lib/app-url';
import { FEATURES, getFeature } from '@/app/lib/marketing/features';
import { breadcrumbJsonLd, faqPageJsonLd, marketingMetadata, webPageJsonLd } from '@/app/lib/marketing/seo';
import { PLAN_PRICE_PLUS_TAX } from '@/app/lib/plans';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { Blocks, FeatureCards, FinalCta, Steps } from '@/app/ui/marketing/content-blocks';
import { FaqList } from '@/app/ui/marketing/faq-list';
import { JsonLd } from '@/app/ui/marketing/json-ld';

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const feature = getFeature((await params).slug);
  return feature ? marketingMetadata(feature.seo, `/features/${feature.slug}`) : {};
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const feature = getFeature((await params).slug);
  if (!feature) notFound();
  const path = `/features/${feature.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: feature.navLabel, path },
  ];

  return (
    <MarketingShell>
      <JsonLd data={webPageJsonLd(feature.seo, path)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqPageJsonLd(feature.faqs)} />

      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">
            {feature.eyebrow}
            <span className={`mk-badge${feature.plan === 'Free' ? ' mk-badge--free' : ''}`}>
              {feature.plan === 'Free' ? 'Free on every plan' : 'Plus feature'}
            </span>
          </p>
          <h1 className="mk-h1">{feature.h1}</h1>
          <p className="mk-lead">{feature.lead}</p>
          <div className="mk-cta-row">
            <Link href={appHref('/register')} className="btn-primary">Create your free event page</Link>
            <a href="#how-to" className="btn-secondary">How to set it up</a>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="mk-highlights">
          {feature.highlights.map((h) => (
            <div className="mk-highlight" key={h.title}>
              <h2 className="mk-highlight-title">{h.title}</h2>
              <p>{h.text}</p>
            </div>
          ))}
        </div>

        <div className="mk-body">
          <Blocks blocks={feature.blocks} />

          <section className="mk-block" id="how-to">
            <h2 className="mk-h2">How to set it up</h2>
            <Steps steps={feature.steps} />
            {feature.plan === 'Plus' && (
              <p className="mk-note">
                {feature.navLabel} is part of MyGala Plus: a one-time payment of {PLAN_PRICE_PLUS_TAX} per event page that unlocks every
                premium feature for 15 months. No subscription. <Link href="/#pricing">Compare plans</Link>.
              </p>
            )}
          </section>

          <section className="mk-block" id="faq">
            <h2 className="mk-h2">Frequently asked questions</h2>
            <FaqList faqs={feature.faqs} />
            <p className="mk-note">More questions? Read the <Link href="/faq">MyGala FAQ</Link> or <Link href="/contact">contact us</Link>.</p>
          </section>
        </div>

        <section className="mk-related">
          <h2 className="mk-h2">More features for your event</h2>
          <FeatureCards slugs={feature.related} />
        </section>
      </div>

      <FinalCta title={feature.cta.title} text={feature.cta.text} />
    </MarketingShell>
  );
}
