import Link from 'next/link';
import { CameraIcon, CheckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { greatVibes } from '@/app/ui/fonts';
import { appHref } from '@/app/lib/app-url';
import { startQuery } from '@/app/lib/start-intent';
import { sampleInvitation, type InvitationLandingPage } from '@/app/lib/marketing/invitation-landing';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';
import { previewImage } from '@/app/ui/themes/preview-image';
import { LANDING_INVITATION_FONTS } from './invitation-landing-fonts';
import SiteFooter from './site-footer';
import '@/app/ui/marketing.css';
import '@/app/ui/marketing/landing.css';
import '@/app/ui/marketing/invitation-landing.css';

// The invitation-first landing pages (data: app/lib/marketing/invitation-landing.ts).
// Built to load fast: fully static (no session lookup), no client components
// of its own, every movement is CSS, the invitation fonts come in one request
// cut down to the letters the cards use, and only the banner's two images
// load up front — the gallery's photos and the scrolling pages load as they
// come into view.

// The theme's whole demo page as one tall picture (made by scripts/theme-page-shots.mjs).
const themePagePicture = (slug: string) => `/images/theme-pages/${slug}.webp`;
const themeName = (slug: string) => THEME_CARDS.find((t) => t.slug === slug)?.name ?? slug;
const themeDesc = (slug: string) => THEME_CARDS.find((t) => t.slug === slug)?.desc ?? '';

// One stylesheet request for every font the cards use, each cut down to just
// the characters on the cards (Google Fonts' text= subsetting).

export function InvitationLandingView({ page }: { page: InvitationLandingPage }) {
  // The occasion puts its themes first in the gallery after sign-up.
  const register = (theme?: string) => appHref('/register') + startQuery(page.start, theme, page.key === 'christmas' ? 'christmas' : 'wedding');
  const cta = (where: string) => `ilp-${page.key}-${where}`;
  const hero = sampleInvitation(page.hero.invitation);
  const groups = page.gallery.groups.map((g) => ({ ...g, cards: g.items.map((s) => ({ sample: s, ...sampleInvitation(s) })) }));

  return (
    <div className={`marketing-page ilp ilp--${page.key} ${greatVibes.variable}`}>
      <header className="lp-topbar">
        <Link href="/" className="wordmark">My<span className="accent">Gala</span></Link>
        <div className="lp-topbar-actions">
          <a href={appHref('/login')} className="lp-topbar-login">Log in</a>
          <a href={register()} className="topbar-signup" data-cta={cta('topbar')}>Sign up free</a>
        </div>
      </header>

      <main>
        {/* 1. The invitation, opening into its page — and why to make one. */}
        <section className="ilp-hero">
          <div className="ilp-hero-inner">
            <div className="ilp-stage" aria-hidden="true">
              <div className="ilp-phone">
                <div className="ilp-phone-screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="ilp-scroll" {...previewImage(themePagePicture(page.hero.pageTheme), '(max-width: 900px) 210px, 270px', { eager: true })} fetchPriority="low" alt="" />
                </div>
              </div>
              <div className="ilp-invite">
                <InvitationCard fonts={LANDING_INVITATION_FONTS} design={hero.design} details={hero.details}
                  bgImage={previewImage(hero.design.background.imageUrl, '(max-width: 900px) 64vw, 380px', { priority: true })} />
              </div>
              <span className="ilp-chip ilp-chip--rsvp"><CheckIcon />RSVP · 2 guests</span>
              <span className="ilp-chip ilp-chip--map"><MapPinIcon />Map &amp; directions</span>
              <span className="ilp-chip ilp-chip--photos"><CameraIcon />Photo wall</span>
            </div>

            <div className="ilp-copy ilp-copy-head">
              <p className="ilp-eyebrow">{page.hero.eyebrow}</p>
              <h1 className="ilp-headline">{page.hero.headline}</h1>
            </div>
            <div className="ilp-copy ilp-copy-body">
              <p className="ilp-sub">{page.hero.sub}</p>
              <ul className="ilp-points">
                {page.hero.points.map((p) => <li key={p}><CheckIcon aria-hidden="true" />{p}</li>)}
              </ul>
              <div className="ilp-actions">
                <a href={register(page.hero.invitation.theme)} className="btn-primary ilp-btn-big" data-cta={cta('hero')}>{page.cta}</a>
                <a href={`/themes/${page.hero.secondary.theme}`} className="ilp-link" data-cta={cta('hero-demo')}>{page.hero.secondary.label} →</a>
              </div>
              <p className="ilp-note">Free · no credit card · guests don’t need an app</p>
            </div>
          </div>
        </section>

        {/* 2. The invitations they can make. */}
        <section className="ilp-section ilp-gallery" id="invitations">
          <div className="ilp-wrap">
            <h2 className="ilp-title">{page.gallery.title}</h2>
            <p className="ilp-section-sub">{page.gallery.sub}</p>
            {groups.map((g, gi) => (
              <div className="ilp-group" key={g.title ?? gi}>
                {g.title && <h3 className="ilp-group-title">{g.title}</h3>}
                <ul className="ilp-cards">
                  {g.cards.map(({ sample, design, details }, i) => (
                    <li key={`${sample.theme}-${i}`}>
                      <a href={register(sample.theme)} className="ilp-card" data-cta={cta(`card-${sample.theme}`)}>
                        <InvitationCard fonts={LANDING_INVITATION_FONTS} design={design} details={details}
                          bgImage={design.background.kind === 'image' ? previewImage(design.background.imageUrl, '(max-width: 640px) 46vw, 230px') : undefined} />
                        <span className="ilp-card-label">
                          <strong>{themeName(sample.theme)}</strong>
                          <span>Use this design →</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 3. The pages the invitations open into, scrolling. */}
        <section className="ilp-section ilp-themes" id="themes">
          <div className="ilp-wrap">
            <h2 className="ilp-title">{page.themes.title}</h2>
            <p className="ilp-section-sub">{page.themes.sub}</p>
            <ul className="ilp-theme-list">
              {page.themes.slugs.map((slug) => (
                <li key={slug} className="ilp-theme">
                  <div className="ilp-phone ilp-phone--small">
                    <div className="ilp-phone-screen">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="ilp-scroll" {...previewImage(themePagePicture(slug), '240px')} alt={`The ${themeName(slug)} theme, the whole page`} />
                    </div>
                  </div>
                  <h3 className="ilp-theme-name">{themeName(slug)}</h3>
                  <p className="ilp-theme-desc">{themeDesc(slug)}</p>
                  <div className="ilp-theme-actions">
                    <a href={register(slug)} className="btn-primary" data-cta={cta(`theme-${slug}`)}>Start with {themeName(slug)}</a>
                    <a href={`/themes/${slug}`} className="ilp-link" data-cta={cta(`demo-${slug}`)}>Live demo →</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ilp-final">
          <h2 className="ilp-title">{page.final.title}</h2>
          <p className="ilp-section-sub">{page.final.text}</p>
          <a href={register(page.hero.invitation.theme)} className="btn-primary ilp-btn-big" data-cta={cta('final')}>{page.cta}</a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

