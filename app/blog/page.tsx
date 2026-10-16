import Link from 'next/link';
import type { Metadata } from 'next';
import { BLOG_POSTS, formatPostDate } from '@/app/lib/marketing/blog';
import { breadcrumbJsonLd, marketingMetadata, webPageJsonLd } from '@/app/lib/marketing/seo';
import type { SeoMeta } from '@/app/lib/marketing/types';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { FinalCta } from '@/app/ui/marketing/content-blocks';
import { JsonLd } from '@/app/ui/marketing/json-ld';

const SEO: SeoMeta = {
  title: 'Blog: Wedding and Event Planning Tips',
  description:
    'Practical guides for planning weddings, birthdays and every kind of event: checklists, timelines, invitations, RSVPs and tips for a great guest experience.',
  keywords: ['wedding planning blog', 'event planning tips', 'wedding planning guide', 'event planning checklist'],
};

export const metadata: Metadata = marketingMetadata(SEO, '/blog');

export default function BlogIndex() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }];
  return (
    <MarketingShell>
      <JsonLd data={webPageJsonLd(SEO, '/blog')} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <header className="mk-hero">
        <div className="wrap">
          <Breadcrumbs crumbs={crumbs} />
          <p className="eyebrow">Blog</p>
          <h1 className="mk-h1">Planning tips for weddings and every celebration</h1>
          <p className="mk-lead">Checklists, timelines and practical advice to help you plan your event and keep your guests in the loop.</p>
        </div>
      </header>
      <div className="wrap">
        <section className="mk-related" style={{ paddingTop: 8 }}>
          <div className="mk-cards">
            {BLOG_POSTS.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="mk-card">
                <span className="mk-post-meta">{p.eyebrow} · {formatPostDate(p.published)}</span>
                <h2 className="mk-card-title">{p.title}</h2>
                <p>{p.summary}</p>
                <span className="mk-card-more">Read the article →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <FinalCta title="Plan it, then share it in one link" text="Create your free event page with every detail and RSVPs in one place." />
    </MarketingShell>
  );
}
