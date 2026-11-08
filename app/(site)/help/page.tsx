import Link from 'next/link';
import type { Metadata } from 'next';
import { HELP_CATEGORIES, HELP_GUIDES, HELP_SEO } from '@/app/lib/marketing/help';
import { breadcrumbJsonLd, marketingMetadata, webPageJsonLd } from '@/app/lib/marketing/seo';
import MarketingShell from '@/app/ui/marketing/marketing-shell';
import { Breadcrumbs } from '@/app/ui/marketing/breadcrumbs';
import { HelpLayout } from '@/app/ui/marketing/help-layout';
import { JsonLd } from '@/app/ui/marketing/json-ld';

// The help centre home: every how-to guide (app/lib/marketing/help.ts),
// grouped by topic, beside the topics sidebar.

export const metadata: Metadata = marketingMetadata(HELP_SEO, '/help');

const START = ['create-your-event-page', 'add-your-event-details', 'publish-your-page', 'send-invitations'];

export default function HelpPage() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Help centre', path: '/help' }];
  return (
    <MarketingShell>
      <JsonLd data={webPageJsonLd(HELP_SEO, '/help')} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <HelpLayout>
        <Breadcrumbs crumbs={crumbs} />
        <p className="eyebrow">Help centre</p>
        <h1 className="hc-h1">How can we help?</h1>
        <p className="hc-lead">Short, step-by-step guides for everything you can do with MyGala, from your first page to the last photo. Pick any topic, or start here.</p>

        <section className="hc-start" aria-labelledby="hc-start-title">
          <h2 className="hc-h2" id="hc-start-title">New to MyGala? Start here</h2>
          <ol className="hc-start-list">
            {START.map((slug) => HELP_GUIDES.find((g) => g.slug === slug)!).map((g) => (
              <li key={g.slug}><Link href={`/help/${g.slug}`}><strong>{g.title}</strong><span>{g.summary}</span></Link></li>
            ))}
          </ol>
        </section>

        {HELP_CATEGORIES.map((c) => (
          <section key={c.id} id={c.id} className="hc-category">
            <h2 className="hc-h2">{c.title}</h2>
            <p className="hc-sub">{c.text}</p>
            <ul className="hc-list">
              {HELP_GUIDES.filter((g) => g.category === c.id).map((g) => (
                <li key={g.slug}>
                  <Link href={`/help/${g.slug}`} className="hc-guide">
                    <strong>{g.title}{g.plan && <span className="hc-plus">Plus</span>}</strong>
                    <span>{g.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="hc-more">
          <h2 className="hc-h2">Still have a question?</h2>
          <p>Read the <Link href="/faq">FAQ</Link>, see <Link href="/features">every feature</Link>, or <Link href="/contact">write to us</Link>. We read every message and usually reply within one business day.</p>
        </section>
      </HelpLayout>
    </MarketingShell>
  );
}
