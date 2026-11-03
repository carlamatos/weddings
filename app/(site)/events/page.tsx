import Link from 'next/link';
import type { Metadata } from 'next';
import { appHref } from '@/app/lib/app-url';
import { EVENT_TYPES } from '@/app/lib/marketing/events';
import { breadcrumbJsonLd, marketingMetadata, webPageJsonLd } from '@/app/lib/marketing/seo';
import { themeCardsFor } from '@/app/lib/marketing/theme-cards';
import type { SeoMeta } from '@/app/lib/marketing/types';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FinalCta } from '@/app/ui/marketing/content-blocks';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { ThemePagePicture } from '@/app/ui/marketing/theme-page-picture';

const SEO: SeoMeta = {
  title: 'Event Website Templates: Weddings, Parties & More',
  description:
    'Event website templates for weddings, birthdays, baby showers, quinceañeras, conferences, galas, holiday parties and community events. Every theme is free.',
  keywords: ['event website templates', 'wedding website templates', 'birthday invitation page', 'baby shower website', 'conference website template', 'party invitation website'],
};

export const metadata: Metadata = marketingMetadata(SEO, '/events');

// The Events hub: each event type (app/lib/marketing/events.ts) with its
// themes, linking on to that type's page. The top bar's "Events" points here.
export default function EventsIndex() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Events', path: '/events' }];
  return (
    <MarketingShell>
      <JsonLd data={webPageJsonLd(SEO, '/events')} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">Events</p>
          <h1 className="mk-h1">An event website for every occasion</h1>
          <p className="mk-lead">
            Weddings, birthdays, baby showers, conferences, galas, holiday parties and neighbourhood get-togethers: pick a theme
            made for your kind of event. Every theme is free and includes every feature, and you can switch at any time.
          </p>
          <div className="mk-cta-row">
            <Link href={appHref('/register')} className="btn-primary">Create your free event page</Link>
          </div>
          <ul className="mk-jump" aria-label="Event types">
            {EVENT_TYPES.map((t) => <li key={t.slug}><a href={`#${t.slug}`}>{t.name}</a></li>)}
          </ul>
        </div>
      </header>

      <div className="wrap">
        {EVENT_TYPES.map((type) => (
          <section className="mk-event-type" id={type.slug} key={type.slug}>
            <p className="eyebrow">{type.eyebrow}</p>
            <h2 className="mk-h2"><Link href={`/events/${type.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{type.name}</Link></h2>
            <p className="mk-sub">{type.lead}</p>
            <div className="theme-grid">
              {themeCardsFor(type.category).map((t) => (
                <a key={t.slug} href={`/themes/${t.slug}`} target="_blank" rel="noopener noreferrer" className="theme-card" style={{ textDecoration: 'none' }}>
                  <ThemePagePicture slug={t.slug} />
                  <div className="theme-info">
                    <h3 className="theme-name">{t.name}</h3>
                    <p className="theme-desc">{t.desc}</p>
                  </div>
                </a>
              ))}
            </div>
            <Link href={`/events/${type.slug}`} className="learn-more-link">{type.learnMoreLabel} →</Link>
          </section>
        ))}
      </div>

      <FinalCta title="Found your theme?" text="Create your event page free, add your details and share one link with every guest." />
    </MarketingShell>
  );
}
