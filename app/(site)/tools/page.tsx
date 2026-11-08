import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS, FREE_TOOLS } from '@/app/lib/marketing/blog';
import { absoluteUrl, breadcrumbJsonLd, marketingMetadata } from '@/app/lib/marketing/seo';
import type { SeoMeta } from '@/app/lib/marketing/types';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FinalCta } from '@/app/ui/marketing/content-blocks';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { previewImage } from '@/app/ui/themes/preview-image';

// Every free planning tool on one page, each with its guide's card picture.

const SEO: SeoMeta = {
  title: 'Free Wedding and Event Planning Tools',
  description:
    'Free wedding and event planning tools: a budget calculator, guest count planner, RSVP deadline calculator and colour palette generator. No sign-up.',
  keywords: ['free wedding planning tools', 'wedding planning calculator', 'event planning tools', 'wedding tools', 'free wedding planner tools'],
};

export const metadata: Metadata = marketingMetadata(SEO, '/tools');

const TOOLS = FREE_TOOLS.map((t) => ({ ...t, post: BLOG_POSTS.find((p) => p.path === t.path)! }));

export default function ToolsPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Free tools', path: '/tools' }];
  return (
    <MarketingShell>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: SEO.title,
        itemListElement: TOOLS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: absoluteUrl(t.path) })),
      }} />
      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">Free tools</p>
          <h1 className="mk-h1">Free wedding and event planning tools</h1>
          <p className="mk-lead">Work out your budget, your guest count, your RSVP deadline and your colours in a few minutes. Free, with no sign-up, and every result can be shared with a link.</p>
        </div>
      </header>
      <div className="wrap">
        <section className="mk-related" style={{ paddingTop: 48 }}>
          <div className="mk-cards">
            {TOOLS.map((t) => (
              <Link key={t.path} href={t.path} className="mk-card mk-post-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img {...previewImage(t.post.cardImage, '(max-width: 760px) 100vw, 360px', { eager: true })} alt="" className="mk-post-card-img" />
                <h2 className="mk-card-title">{t.name}</h2>
                <p>{t.text}</p>
                <span className="mk-card-more">Open the tool →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <FinalCta title="Then share it all in one link" text="Create a free event page or wedding website with your invitations, RSVPs and every detail in one place." />
    </MarketingShell>
  );
}
