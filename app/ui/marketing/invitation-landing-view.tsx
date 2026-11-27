import Link from 'next/link';
import { CalendarDaysIcon, CameraIcon, CheckIcon, ClockIcon, MapPinIcon, MusicalNoteIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { greatVibes } from '@/app/ui/fonts';
import { appHref } from '@/app/lib/app-url';
import { startQuery } from '@/app/lib/start-intent';
import { sampleInvitation, sampleStyleName, type FunIcon, type InvitationLandingPage } from '@/app/lib/marketing/invitation-landing';
import type { LandingLang } from '@/app/lib/marketing/landing-lang';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { InvitationCard } from '@/app/ui/dashboard/invitation-card';
import { previewImage } from '@/app/ui/themes/preview-image';
import { RsvpPreview } from '@/app/ui/rsvp-preview';
import { LANDING_INVITATION_FONTS } from './invitation-landing-fonts';
import SiteFooter from './site-footer';
import { FreeToolsStrip } from './free-tools-strip';
import { NewYearsHeroEffect } from './new-years-hero-effect';
import { OccasionSpotlight } from './occasion-spotlight';
import '@/app/ui/marketing.css';
import '@/app/ui/marketing/landing.css';
import '@/app/ui/marketing/invitation-landing.css';

// The invitation-first landing pages (data: app/lib/marketing/invitation-landing.ts).
// Built to load fast: fully static (no session lookup), no client components
// of its own, every movement is CSS, the invitation fonts are served from our
// own domain, and only the banner's two images load up front — the gallery's
// photos and the scrolling pages load as they come into view. The gallery's
// cards are laid out with the page, so their fonts download straight away and
// are ready before the cards scroll into view.

// The theme's whole demo page as one tall picture (made by scripts/theme-page-shots.mjs).
const FUN_ICONS: Record<FunIcon, typeof ClockIcon> = {
  clock: ClockIcon, music: MusicalNoteIcon, schedule: CalendarDaysIcon, camera: CameraIcon, sparkles: SparklesIcon, share: PaperAirplaneIcon,
};

// In French and Spanish, the pictures with MyGala's words in that language.
const themePagePicture = (slug: string, lang: LandingLang = 'en') => `/images/theme-pages/${lang === 'en' ? '' : `${lang}/`}${slug}.webp`;
const themeName = (slug: string) => THEME_CARDS.find((t) => t.slug === slug)?.name ?? slug;
const themeDesc = (slug: string) => THEME_CARDS.find((t) => t.slug === slug)?.desc ?? '';

// The page's own words, in its language.
const UI: Record<LandingLang, {
  login: string; signup: string; useDesign: string; startWith: string; liveDemo: string; note: string; pageAlt: string;
  rsvp: string; map: string; photos: string; languages: string;
}> = {
  en: { login: 'Log in', signup: 'Sign up free', useDesign: 'Use this design →', startWith: 'Start with {name}', liveDemo: 'Live demo →', note: 'Free · no credit card · guests don’t need an app', pageAlt: 'The {name} theme, the whole page', rsvp: 'RSVP', map: 'Map & directions', photos: 'Photo wall', languages: 'Languages' },
  fr: { login: 'Se connecter', signup: 'Inscription gratuite', useDesign: 'Utiliser ce modèle →', startWith: 'Commencer avec {name}', liveDemo: 'Démo en direct →', note: 'Gratuit · sans carte de crédit · aucune appli pour vos invités', pageAlt: 'Le thème {name}, la page complète', rsvp: 'Réponses', map: 'Carte et itinéraire', photos: 'Mur de photos', languages: 'Langues' },
  es: { login: 'Iniciar sesión', signup: 'Regístrate gratis', useDesign: 'Usar este diseño →', startWith: 'Empezar con {name}', liveDemo: 'Ver ejemplo →', note: 'Gratis · sin tarjeta de crédito · tus invitados no necesitan app', pageAlt: 'El tema {name}, la página completa', rsvp: 'Confirmaciones', map: 'Mapa y cómo llegar', photos: 'Muro de fotos', languages: 'Idiomas' },
};
const LANG_NAMES: Record<LandingLang, string> = { en: 'English', fr: 'Français', es: 'Español' };
const HOMES: Record<LandingLang, string> = { en: '/', fr: '/fr', es: '/es' };

// footer: the page's language's own (French and Spanish); else the English site's.
export function InvitationLandingView({ page, footer }: { page: InvitationLandingPage; footer?: React.ReactNode }) {
  const lang = page.lang ?? 'en';
  const t = UI[lang];
  const name = (text: string, slug: string) => text.replace('{name}', themeName(slug));
  // The look: the same page in another language looks the same (ilp--new-years).
  const look = page.key.replace(/-(fr|es)$/, '');
  // The occasion puts its themes first in the gallery after sign-up.
  const occasion = page.key === 'christmas' ? 'christmas' : page.key === 'weddings' ? 'wedding' : 'celebration';
  // Sign-up opens in the page's language.
  const register = (theme?: string) => appHref('/register') + startQuery(page.start, theme, occasion) + (lang === 'en' ? '' : `&lang=${lang}`);
  // A theme's buttons: try it first (choose, then sign up) where the page has a try page.
  const start = (theme?: string) => (page.tryPath ? `${page.tryPath}${theme ? `?theme=${theme}` : ''}` : register(theme));
  // A theme's demo, with MyGala's words in the page's language.
  const demo = (slug: string) => `/themes/${slug}${lang === 'en' ? '' : `?lang=${lang}`}`;
  const cta = (where: string) => `ilp-${page.key}-${where}`;
  const hero = sampleInvitation(page.hero.invitation, lang);
  const groups = page.gallery.groups.map((g) => ({ ...g, cards: g.items.map((s) => ({ sample: s, ...sampleInvitation(s, lang) })) }));
  const otherLanguages = page.languages ? (Object.entries(page.languages) as [LandingLang, string][]).filter(([l]) => l !== lang) : [];

  // The invitations they can make.
  const gallerySection = (
    <section className="ilp-section ilp-gallery" id="invitations">
      <div className="ilp-wrap">
        <h2 className="ilp-title">{page.gallery.title}</h2>
        <p className="ilp-section-sub">{page.gallery.sub}</p>
        {groups.map((g, gi) => (
          <div className="ilp-group" key={g.title ?? gi}>
            {g.title && <h3 className="ilp-group-title">{g.title}</h3>}
            <ul className="ilp-cards">
              {g.cards.map(({ sample, design, details }, i) => (
                <li key={`${sample.style ?? sample.theme}-${i}`}>
                  <a href={start(sample.theme)} className="ilp-card" data-cta={cta(`card-${sample.style ?? sample.theme}`)}>
                    <InvitationCard fonts={LANDING_INVITATION_FONTS} design={design} details={details}
                      bgImage={design.background.kind === 'image' ? previewImage(design.background.imageUrl, '(max-width: 640px) 46vw, 230px') : undefined} />
                    <span className="ilp-card-label">
                      <strong>{sampleStyleName(sample, lang) ?? themeName(sample.theme)}</strong>
                      <span>{t.useDesign}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );

  // The pages the invitations open into, scrolling.
  const themesSection = (
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
                  <img className="ilp-scroll" {...previewImage(themePagePicture(slug, lang), '240px')} alt={name(t.pageAlt, slug)} />
                </div>
              </div>
              <h3 className="ilp-theme-name">{themeName(slug)}</h3>
              <p className="ilp-theme-desc">{page.themes.descs?.[slug] ?? themeDesc(slug)}</p>
              <div className="ilp-theme-actions">
                <a href={start(slug)} className="btn-primary" data-cta={cta(`theme-${slug}`)}>{name(t.startWith, slug)}</a>
                <a href={demo(slug)} className="ilp-link" data-cta={cta(`demo-${slug}`)}>{t.liveDemo}</a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );

  return (
    <div className={`marketing-page ilp ilp--${look} ${greatVibes.variable}`}>
      <header className="lp-topbar">
        {/* No prefetch: the French and Spanish home pages are static, and
            prefetching one would load its banner photos alongside this page's. */}
        <Link href={HOMES[lang]} className="wordmark" prefetch={false}>My<span className="accent">Gala</span></Link>
        <div className="lp-topbar-actions">
          {otherLanguages.length > 0 && (
            <nav className="lp-topbar-langs" aria-label={t.languages}>
              {otherLanguages.map(([l, href]) => (
                <a key={l} href={href} hrefLang={l === 'fr' ? 'fr-CA' : l === 'en' ? 'en-CA' : l} lang={l} title={LANG_NAMES[l]}>{l.toUpperCase()}</a>
              ))}
            </nav>
          )}
          <a href={appHref('/login')} className="lp-topbar-login">{t.login}</a>
          <a href={register()} className="topbar-signup" data-cta={cta('topbar')}>{t.signup}</a>
        </div>
      </header>

      <main>
        {/* 1. The invitation, opening into its page — and why to make one. */}
        <section className={`ilp-hero${page.hero.effect ? ' ilp-hero--effect' : ''}`}>
          {page.hero.effect?.kind === 'new-years' && <NewYearsHeroEffect year={page.hero.effect.year} />}
          <div className="ilp-hero-inner">
            {!page.hero.effect && <div className="ilp-stage" aria-hidden="true">
              <div className="ilp-phone">
                <div className="ilp-phone-screen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="ilp-scroll" {...previewImage(themePagePicture(page.hero.pageTheme, lang), '(max-width: 900px) 210px, 270px', { eager: true })} fetchPriority="low" alt="" />
                </div>
              </div>
              {page.hero.rsvp ? (
                <div className="ilp-invite ilp-invite--rsvp">
                  <RsvpPreview fonts={LANDING_INVITATION_FONTS} design={hero.design} name={hero.details.name} date={hero.details.date} />
                </div>
              ) : (
                <div className="ilp-invite">
                  <InvitationCard fonts={LANDING_INVITATION_FONTS} design={hero.design} details={hero.details}
                    bgImage={previewImage(hero.design.background.imageUrl, '(max-width: 900px) 64vw, 380px', { priority: true })} />
                </div>
              )}
              <span className="ilp-chip ilp-chip--rsvp"><CheckIcon />{t.rsvp}</span>
              <span className="ilp-chip ilp-chip--map"><MapPinIcon />{t.map}</span>
              <span className="ilp-chip ilp-chip--photos"><CameraIcon />{t.photos}</span>
            </div>}

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
                <a href={start(page.hero.invitation.theme)} className="btn-primary ilp-btn-big" data-cta={cta('hero')}>{page.cta}</a>
                <a href={demo(page.hero.secondary.theme)} className="ilp-link" data-cta={cta('hero-demo')}>{page.hero.secondary.label} →</a>
              </div>
              <p className="ilp-note">{t.note}</p>
            </div>
          </div>
        </section>

        {/* Why it's fun (New Year's Eve). */}
        {page.fun && (
          <section className="ilp-section ilp-fun" id="why">
            <div className="ilp-wrap">
              <h2 className="ilp-title">{page.fun.title}</h2>
              <p className="ilp-section-sub">{page.fun.sub}</p>
              <ul className="ilp-fun-list">
                {page.fun.items.map((item) => {
                  const Icon = FUN_ICONS[item.icon];
                  return (
                  <li key={item.title} className="ilp-fun-item">
                    <span className="ilp-fun-icon" aria-hidden="true"><Icon /></span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </li>
                  );
                })}
              </ul>
              {page.fun.note && (
                <p className="ilp-fun-note">
                  {page.fun.note.text}{' '}
                  <a href={page.fun.note.href} className="ilp-link" data-cta={cta('fun-note')}>{page.fun.note.label} →</a>
                </p>
              )}
            </div>
          </section>
        )}

        {/* A page for one occasion (the party page → New Year's Eve). */}
        {page.spotlight && <OccasionSpotlight spotlight={page.spotlight} cta={cta('spotlight')} />}

        {/* 2–3. The invitations they can make, and the pages they open into
            (weddings: the pages first, to choose a theme). */}
        {page.themesFirst ? <>{themesSection}{gallerySection}</> : <>{gallerySection}{themesSection}</>}

        {page.freeTools && <FreeToolsStrip eyebrow="Free wedding tools" title={page.freeTools.title} sub={page.freeTools.sub} />}

        <section className="ilp-final">
          <h2 className="ilp-title">{page.final.title}</h2>
          <p className="ilp-section-sub">{page.final.text}</p>
          <a href={start(page.hero.invitation.theme)} className="btn-primary ilp-btn-big" data-cta={cta('final')}>{page.cta}</a>
        </section>
      </main>

      {footer ?? <SiteFooter />}
    </div>
  );
}

