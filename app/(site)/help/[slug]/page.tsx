import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { appHref, isAppPath } from '@/app/lib/app-url';
import { FEATURES } from '@/app/lib/marketing/features';
import { HELP_CATEGORIES, HELP_GUIDES, getHelpGuide } from '@/app/lib/marketing/help';
import { absoluteUrl, breadcrumbJsonLd, marketingMetadata, videoObjectJsonLd } from '@/app/lib/marketing/seo';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { HelpLayout } from '@/app/ui/marketing/help-layout';
import { FeatureVideo } from '@/app/ui/marketing/feature-video';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { Rich } from '@/app/ui/marketing/article-blocks';

// One help guide: the steps, tips, a how-to video when there is one, where
// to do it in the dashboard and related guides.

export function generateStaticParams() {
  return HELP_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = getHelpGuide((await params).slug);
  if (!g) return {};
  return marketingMetadata({ title: `${g.title} | MyGala Help`, description: g.summary, keywords: [] }, `/help/${g.slug}`);
}

const strip = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');

export default async function HelpGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = getHelpGuide((await params).slug);
  if (!g) notFound();
  const path = `/help/${g.slug}`;
  const category = HELP_CATEGORIES.find((c) => c.id === g.category)!;
  const feature = g.feature ? FEATURES.find((f) => f.slug === g.feature) : undefined;
  const video = g.videoFrom ? FEATURES.find((f) => f.slug === g.videoFrom)?.video : undefined;
  const related = g.related.map((s) => getHelpGuide(s)).filter((r) => r !== undefined);
  const index = HELP_GUIDES.indexOf(g);
  const prev = HELP_GUIDES[index - 1];
  const next = HELP_GUIDES[index + 1];
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Help centre', path: '/help' }, { name: g.title, path }];
  const dashboardHref = g.dashboard ? (isAppPath(g.dashboard.path) ? appHref(g.dashboard.path) : g.dashboard.path) : null;

  return (
    <MarketingShell>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: g.title,
        description: g.summary,
        url: absoluteUrl(path),
        inLanguage: 'en',
        articleSection: category.title,
        articleBody: strip([g.intro ?? '', ...g.steps, ...(g.tips ?? [])].join(' ')),
        publisher: { '@type': 'Organization', name: 'MyGala', url: absoluteUrl('/'), logo: absoluteUrl('/images/mygala-logo-email.png') },
      }} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {video && <JsonLd data={videoObjectJsonLd(video, path)} />}

      <HelpLayout current={g.slug}>
        <Breadcrumbs crumbs={crumbs} />
        <p className="eyebrow"><Link href={`/help#${category.id}`}>{category.title}</Link>{g.plan && <span className="hc-plus">Plus</span>}</p>
        <h1 className="hc-h1">{g.title}</h1>
        <p className="hc-lead">{g.summary}</p>
        <article className="hc-article">
          {g.intro && <p className="hc-intro"><Rich text={g.intro} /></p>}
          {g.plan && (
            <p className="hc-plan">This is part of <Link href="/help/upgrade-to-plus">MyGala Plus</Link>, a one-time payment per event page. You can set it up on a free page and it goes live when you upgrade.</p>
          )}
          <h2 className="hc-h2">Step by step</h2>
          <ol className="hc-steps">
            {g.steps.map((s, i) => <li key={i}><Rich text={s} /></li>)}
          </ol>
          {dashboardHref && <p><a href={dashboardHref} className="btn-primary hc-btn">{g.dashboard!.label} →</a></p>}
          {video && (
            <section className="hc-video">
              <h2 className="hc-h2">Watch how it works</h2>
              <FeatureVideo video={video} />
            </section>
          )}
          {g.tips && (
            <section className="hc-tips">
              <h2 className="hc-h2">Good to know</h2>
              <ul>{g.tips.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ul>
            </section>
          )}
          {feature && <p className="mk-note">Want more detail? Read about <Link href={`/features/${feature.slug}`}>{feature.navLabel}</Link>.</p>}
        </article>

        {related.length > 0 && (
          <section className="hc-related">
            <h2 className="hc-h2">Related guides</h2>
            <ul className="hc-list">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/help/${r.slug}`} className="hc-guide">
                    <strong>{r.title}{r.plan && <span className="hc-plus">Plus</span>}</strong>
                    <span>{r.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <nav className="hc-pager" aria-label="More guides">
          {prev ? <Link href={`/help/${prev.slug}`} rel="prev"><small>Previous</small><span>{prev.title}</span></Link> : <span />}
          {next ? <Link href={`/help/${next.slug}`} rel="next" className="hc-pager-next"><small>Next</small><span>{next.title}</span></Link> : <span />}
        </nav>
        <p className="hc-back">Still stuck? <Link href="/contact">Write to us</Link>. We read every message.</p>
      </HelpLayout>
    </MarketingShell>
  );
}
