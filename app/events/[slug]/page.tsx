import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { appHref } from '@/app/lib/app-url';
import { EVENT_TYPES, getEventType } from '@/app/lib/marketing/events';
import { breadcrumbJsonLd, faqPageJsonLd, marketingMetadata, webPageJsonLd } from '@/app/lib/marketing/seo';
import { themeCardsFor } from '@/app/lib/marketing/theme-cards';
import ThemeHeroPreview from '@/app/ui/dashboard/ThemeHeroPreview';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { Blocks, FeatureCards, FinalCta } from '@/app/ui/marketing/content-blocks';
import { FaqList } from '@/app/ui/marketing/faq-list';
import { JsonLd } from '@/app/ui/marketing/json-ld';

// Theme previews render at 280px tall; the card slot is 220px.
const PREVIEW_SCALE = 220 / 280;

export const dynamicParams = false;

export function generateStaticParams() {
  return EVENT_TYPES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const type = getEventType((await params).slug);
  return type ? marketingMetadata(type.seo, `/events/${type.slug}`) : {};
}

export default async function EventTypePage({ params }: { params: Promise<{ slug: string }> }) {
  const type = getEventType((await params).slug);
  if (!type) notFound();
  const path = `/events/${type.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/#themes' },
    { name: type.name, path },
  ];
  const themes = themeCardsFor(type.category);

  return (
    <MarketingShell>
      <JsonLd data={webPageJsonLd(type.seo, path)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqPageJsonLd(type.faqs)} />

      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">{type.eyebrow}</p>
          <h1 className="mk-h1">{type.h1}</h1>
          <p className="mk-lead">{type.lead}</p>
          <div className="mk-cta-row">
            <Link href={appHref('/register')} className="btn-primary">Create your free event page</Link>
            <a href="#templates" className="btn-secondary">See the templates</a>
          </div>
          <ul className="mk-chips" aria-label="Perfect for">
            {type.occasions.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </header>

      <div className="wrap">
        <section className="mk-templates" id="templates">
          <h2 className="mk-h2">{type.name} templates</h2>
          <p className="mk-sub">Open any template for a full live preview. Every template includes every feature, and you can switch at any time.</p>
          <div className="theme-grid">
            {themes.map((t) => (
              <a key={t.slug} href={`/themes/${t.slug}`} target="_blank" rel="noopener noreferrer" className="theme-card" style={{ textDecoration: 'none' }}>
                <div className="theme-preview" style={{ overflow: 'hidden', background: t.bg }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / PREVIEW_SCALE}%`, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                    <ThemeHeroPreview themeSlug={t.slug} {...t.sample} />
                  </div>
                </div>
                <div className="theme-info">
                  <h3 className="theme-name">{t.name}</h3>
                  <p className="theme-desc">{t.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className="mk-body">
          <Blocks blocks={type.blocks} />

          <section className="mk-block">
            <h2 className="mk-h2">How to create your page</h2>
            <ol className="mk-steps">
              {[
                ['Sign up free', 'Create your account with your email, Google, Apple or Facebook.'],
                ['Pick a template', `Choose one of the ${type.name.toLowerCase()} templates above — or any other theme.`],
                ['Add your details', 'Fill in the date, venue and description, upload a banner, and add your schedule.'],
                ['Share one link', 'Send your page link by text, email or social media, and watch the RSVPs come in.'],
              ].map(([title, text], i) => (
                <li key={title}>
                  <span className="mk-step-num" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3 className="mk-step-title">{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mk-note"><Link href={appHref('/register')}>Create your page now</Link> — it’s free.</p>
          </section>

          <section className="mk-block" id="faq">
            <h2 className="mk-h2">Frequently asked questions</h2>
            <FaqList faqs={type.faqs} />
            <p className="mk-note">More questions? Read the <Link href="/faq">MyGala FAQ</Link>.</p>
          </section>
        </div>

        <section className="mk-related">
          <h2 className="mk-h2">Features {type.name.toLowerCase()} hosts love</h2>
          <FeatureCards slugs={type.featureSlugs} />
        </section>
      </div>

      <FinalCta title={type.cta.title} text={type.cta.text} />
    </MarketingShell>
  );
}
