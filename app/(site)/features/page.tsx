import Link from 'next/link';
import type { Metadata } from 'next';
import { appHref } from '@/app/lib/app-url';
import { FEATURES } from '@/app/lib/marketing/features';
import { breadcrumbJsonLd, marketingMetadata, webPageJsonLd } from '@/app/lib/marketing/seo';
import type { SeoMeta } from '@/app/lib/marketing/types';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FeatureCards, FinalCta } from '@/app/ui/marketing/content-blocks';
import { JsonLd } from '@/app/ui/marketing/json-ld';

const SEO: SeoMeta = {
  title: 'Event Website Features: RSVP, Photo QR, Livestream',
  description:
    'RSVPs, guest photo QR codes, livestream, reminder emails, English/Spanish/French pages, custom sections and your own domain — all in one event website.',
  keywords: ['event website features', 'event RSVP website', 'event photo QR code', 'event livestream', 'event reminder emails', 'event website builder'],
};

export const metadata: Metadata = marketingMetadata(SEO, '/features');

const INCLUDED = [
  'RSVP form with guest counts and CSV export',
  'Date, time, venue and map with directions',
  'Live countdown to your event',
  'Event program for one day or several',
  'Photo gallery and share section',
  'Show or hide the sections you don’t need',
];

export default function FeaturesIndex() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Features', path: '/features' }];
  return (
    <MarketingShell>
      <JsonLd data={webPageJsonLd(SEO, '/features')} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">Features</p>
          <h1 className="mk-h1">Everything your event page needs, in one link</h1>
          <p className="mk-lead">
            MyGala gives every event — weddings, birthdays, baby showers, conferences, galas, holiday parties and community events — a
            complete website with RSVPs and all the details. These features take it further.
          </p>
          <div className="mk-cta-row">
            <Link href={appHref('/register')} className="btn-primary">Create your free event page</Link>
          </div>
        </div>
      </header>
      <div className="wrap">
        <section className="mk-related" style={{ paddingTop: 8 }}>
          <FeatureCards slugs={FEATURES.map((f) => f.slug)} />
        </section>
        <section className="mk-body">
          <h2 className="mk-h2">Included on every page, free</h2>
          <ul className="mk-list mk-list--cols">
            {INCLUDED.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>
      </div>
      <FinalCta title="Start with everything included" text="Create your event page free, and upgrade to Plus only when you need more." />
    </MarketingShell>
  );
}
