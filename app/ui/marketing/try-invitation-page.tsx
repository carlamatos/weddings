import Link from 'next/link';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import type { TryInvitationPage } from '@/app/lib/marketing/try-invitation';
import { breadcrumbJsonLd, faqPageJsonLd, marketingMetadata, webApplicationJsonLd } from '@/app/lib/marketing/seo';
import { THEME_DEMOS } from '@/app/ui/themes/demo-content';
import { themeRegistry } from '@/app/ui/themes/registry';
import MarketingShell from './marketing-shell';
import { Breadcrumbs } from './breadcrumbs';
import { Steps } from './content-blocks';
import { FaqList } from './faq-list';
import { JsonLd } from './json-ld';
import { TryInvitation } from './try-invitation';
import '@/app/ui/auth.css';
import '@/app/ui/try-invitation.css';

// A "design your invitation" page (app/lib/marketing/try-invitation.ts): the
// try-it tool, then how it works, what can be changed, the designs and
// questions. ?theme= opens the tool in a theme, e.g. from a landing page.

export function tryInvitationMetadata(page: TryInvitationPage): Metadata {
  return marketingMetadata(page.seo, page.path);
}

const picture = (slug: string) => `/images/theme-pages/${slug}.webp`;

export async function TryInvitationLanding({ page, theme }: { page: TryInvitationPage; theme?: string }) {
  const initialTheme = theme && themeRegistry[theme] && THEME_CARDS.some((c) => c.slug === theme) ? theme : page.defaultTheme;
  const session = await auth();
  const crumbs = [{ name: 'Home', path: '/' }, { name: page.breadcrumb, path: page.path }];
  const themes = (page.themes.slugs
    ? page.themes.slugs.map((s) => THEME_CARDS.find((c) => c.slug === s)!)
    : THEME_CARDS
  ).filter((c) => c && THEME_DEMOS[c.slug]);

  return (
    <MarketingShell>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={webApplicationJsonLd(page.app, page.path, picture(page.defaultTheme))} />
      <JsonLd data={faqPageJsonLd(page.faqs)} />

      <div className="auth-page try-invite">
        <div className="try-invite__crumbs"><Breadcrumbs crumbs={crumbs} /></div>
        <TryInvitation key={initialTheme} initialTheme={initialTheme} isLoggedIn={!!session?.user} occasion={page.occasion} text={page} />
      </div>

      <div className="wrap try-invite__content">
        <section className="mk-block">
          <h2 className="mk-h2">How it works</h2>
          <Steps steps={page.steps} />
        </section>

        {page.blocks.map((b) => (
          <section className="mk-block" key={b.heading}>
            <h2 className="mk-h2">{b.heading}</h2>
            {b.paragraphs?.map((p) => <p key={p}>{p}</p>)}
            {b.bullets && <ul className="mk-list">{b.bullets.map((x) => <li key={x}>{x}</li>)}</ul>}
          </section>
        ))}

        <section className="mk-block">
          <h2 className="mk-h2">{page.themes.heading}</h2>
          <p>{page.themes.text}</p>
          <ul className="mk-chips mk-chips--links">
            {themes.map((t) => (
              <li key={t.slug}><Link href={`/themes/${t.slug}`}>{t.name}</Link></li>
            ))}
          </ul>
        </section>

        <section className="mk-block">
          <h2 className="mk-h2">Questions</h2>
          <FaqList faqs={page.faqs} />
        </section>

        <section className="mk-block try-invite__related">
          <h2 className="mk-h2">{page.related.heading}</h2>
          <div className="mk-cards">
            {page.related.links.map((l) => (
              <Link key={l.href} href={l.href} className="mk-card">
                <h3 className="mk-card-title">{l.label}</h3>
                <p>{l.text}</p>
                <span className="mk-card-more">Learn more →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
