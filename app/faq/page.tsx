import Link from 'next/link';
import type { Metadata } from 'next';
import { appHref } from '@/app/lib/app-url';
import { FAQ_GROUPS, FAQ_SEO } from '@/app/lib/marketing/faq';
import { breadcrumbJsonLd, faqPageJsonLd, marketingMetadata } from '@/app/lib/marketing/seo';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FinalCta } from '@/app/ui/marketing/content-blocks';
import { FaqList } from '@/app/ui/marketing/faq-list';
import { JsonLd } from '@/app/ui/marketing/json-ld';

export const metadata: Metadata = marketingMetadata(FAQ_SEO, '/faq');

export default function FaqPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }];
  return (
    <MarketingShell>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqPageJsonLd(FAQ_GROUPS.flatMap((g) => g.faqs))} />

      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">Help & answers</p>
          <h1 className="mk-h1">Frequently asked questions</h1>
          <p className="mk-lead">
            Everything hosts ask before creating an event page — from pricing and RSVPs to privacy, photos and what happens after the
            event. Can’t find your answer? <Link href="/contact">Contact us</Link>.
          </p>
          <nav aria-label="FAQ topics">
            <ul className="mk-chips mk-chips--links">
              {FAQ_GROUPS.map((g) => <li key={g.id}><a href={`#${g.id}`}>{g.title}</a></li>)}
            </ul>
          </nav>
        </div>
      </header>

      <div className="wrap">
        <div className="mk-body">
          {FAQ_GROUPS.map((g) => (
            <section className="mk-block" id={g.id} key={g.id}>
              <h2 className="mk-h2">{g.title}</h2>
              <FaqList faqs={g.faqs} />
            </section>
          ))}
          <p className="mk-note">
            Ready to start? <Link href={appHref('/register')}>Create your free event page</Link>, or explore the <Link href="/features">features</Link>.
          </p>
        </div>
      </div>

      <FinalCta title="Your event deserves a beautiful home" text="Start free today. Upgrade only if you need to." />
    </MarketingShell>
  );
}
