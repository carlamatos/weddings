import Link from 'next/link';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import {
  BellAlertIcon, CakeIcon, CalendarDaysIcon, CheckIcon, ClipboardDocumentCheckIcon, ClockIcon, GiftIcon,
  GlobeAltIcon, HeartIcon, LanguageIcon, LinkIcon, LockClosedIcon, MapPinIcon, MusicalNoteIcon,
  PaperAirplaneIcon, PhotoIcon, QrCodeIcon, Squares2X2Icon, SwatchIcon, UserGroupIcon, VideoCameraIcon, TableCellsIcon,
} from '@heroicons/react/24/outline';
import { greatVibes } from '@/app/ui/fonts';
import { appHref } from '@/app/lib/app-url';
import { LANDING_UI, type LandingIcon, type LandingPage } from '@/app/lib/marketing/landing';
import { THEME_CARDS, type ThemeCard } from '@/app/lib/marketing/theme-cards';
import type { Faq } from '@/app/lib/marketing/types';
import ThemeHeroPreview from '@/app/ui/dashboard/ThemeHeroPreview';
import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';
import { previewImage } from '@/app/ui/themes/preview-image';
import '@/app/ui/marketing.css';
import '@/app/ui/marketing/landing.css';

// The Google Ads landing page layout, shared by /events/<slug>/start and the
// French page (/fr/mariage). Built to load fast on a phone: fully static (no
// session lookup), no client components — every movement on the page is
// CSS — and only the banner's photos load up front.

// Theme previews render at 280px tall; the card slot is 220px.
const PREVIEW_SCALE = 220 / 280;

const ICONS: Record<LandingIcon, ComponentType<SVGProps<SVGSVGElement>>> = {
  rsvp: ClipboardDocumentCheckIcon, guests: UserGroupIcon, countdown: ClockIcon, map: MapPinIcon,
  program: CalendarDaysIcon, palette: SwatchIcon, globe: LanguageIcon, link: LinkIcon, photo: PhotoIcon,
  mail: PaperAirplaneIcon, camera: QrCodeIcon, video: VideoCameraIcon, music: MusicalNoteIcon,
  bell: BellAlertIcon, gift: GiftIcon, sections: Squares2X2Icon, lock: LockClosedIcon, domain: GlobeAltIcon,
  potluck: CakeIcon, heart: HeartIcon, seat: TableCellsIcon,
};

const themePhoto = (slug: string): string | undefined => HERO_DEFAULTS[slug as keyof typeof HERO_DEFAULTS];
const themeName = (slug: string) => THEME_CARDS.find((t) => t.slug === slug)?.name ?? slug;

export function LandingView({ page, templates, faqs, lang = 'en', footer }: {
  page: LandingPage;
  templates: ThemeCard[];
  faqs: Faq[];
  lang?: 'en' | 'fr';
  footer: ReactNode;
}) {
  const ui = LANDING_UI[lang];
  // The sign-up form opens in the page's language.
  const register = appHref('/register') + (lang === 'fr' ? '?lang=fr' : '');
  const cta = (where: string) => `lp-${page.slug}${lang === 'en' ? '' : `-${lang}`}-${where}`;
  const free = page.features.items.filter((f) => !f.plus);
  const plus = page.features.items.filter((f) => f.plus);

  const s = page.steps;
  const stepPhoto = themePhoto(s.theme);
  // Banner: the step's theme in front, two others fanned out behind it.
  const fan = s.pickFrom.filter((t) => t !== s.theme && themePhoto(t)).slice(0, 2);

  return (
    <div className={`marketing-page lp ${greatVibes.variable}`} lang={lang}>
      {/* TOP BAR: just the brand and sign-up, nothing to wander off to. */}
      <header className="lp-topbar">
        <Link href="/" className="wordmark">My<span className="accent">Gala</span></Link>
        <div className="lp-topbar-actions">
          <a href={appHref('/login')} className="lp-topbar-login">{ui.login}</a>
          <a href={register} className="topbar-signup" data-cta={cta('topbar')}>{ui.signupFree}</a>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <div className="lp-hero-copy">
              <p className="hero-eyebrow hero-badge"><span className="hero-badge-free">{ui.freePill}</span><span>{page.hero.badge}</span></p>
              <p className="hero-tagline">{page.hero.tagline}</p>
              <h1 className="hero-headline">{page.hero.headline}</h1>
              <p className="hero-sub">{page.hero.sub}</p>
              <div className="hero-actions">
                <a href={register} className="btn-primary lp-btn-big" data-cta={cta('hero')}>{page.cta}</a>
                <a href={`/themes/${page.demo}`} className="btn-secondary btn-demo" data-cta={cta('hero-demo')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M10 8.5l5.5 3.5-5.5 3.5z" fill="currentColor" />
                  </svg>
                  {ui.demo}
                </a>
              </div>
              <ul className="lp-hero-checks">
                {ui.checks.map((c) => <li key={c}><CheckIcon aria-hidden="true" />{c}</li>)}
              </ul>
            </div>

            {/* A fan of event pages: the example page in front, two themes behind. */}
            <div className="lp-fan" aria-hidden="true">
              {fan.map((t, i) => (
                <div className={`lp-fan-card lp-fan-card--${i === 0 ? 'left' : 'right'}`} key={t}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...previewImage(themePhoto(t) ?? '', '(max-width: 900px) 40vw, 240px')} alt="" />
                </div>
              ))}
              <div className="lp-fan-card lp-fan-card--front">
                <div className="lp-fan-bar"><i /><i /><i /><span>mygala.ca/{s.link}</span></div>
                <div className="lp-fan-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img {...previewImage(stepPhoto ?? '', '(max-width: 900px) 60vw, 340px', { priority: true, eager: true })} alt="" />
                  <div className="lp-fan-title">
                    <p className="lp-fan-name">{s.name}</p>
                    <p className="lp-fan-date">{s.date}</p>
                  </div>
                </div>
                <div className="lp-fan-rsvp"><span>{ui.rsvp}</span></div>
              </div>
              {s.rsvps[0] && (
                <div className="lp-fan-note">
                  <CheckIcon />
                  <span><strong>{s.rsvps[0].who}</strong>{s.rsvps[0].reply}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TEMPLATES */}
        <section className="lp-section lp-templates" id="templates">
          <div className="wrap">
            <p className="eyebrow lp-center">{ui.templatesEyebrow}</p>
            <h2 className="section-title lp-center">{page.templates.title}</h2>
            <p className="section-sub lp-center lp-sub">{page.templates.sub}</p>
          </div>
          <div className="lp-template-row" role="list">
            {templates.map((t) => (
              <div className="lp-template" role="listitem" key={t.slug}>
                <a href={`/themes/${t.slug}`} className="theme-card" data-cta={cta(`template-${t.slug}`)}>
                  <div className="theme-preview" style={{ overflow: 'hidden', background: t.bg }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / PREVIEW_SCALE}%`, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
                      <ThemeHeroPreview themeSlug={t.slug} {...t.sample} />
                    </div>
                    <span className="lp-template-demo">{ui.liveDemo}</span>
                  </div>
                  <div className="theme-info">
                    <h3 className="theme-name">{t.name}</h3>
                    <p className="theme-desc">{page.templateDescs?.[t.slug] ?? t.desc}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
          <p className="lp-swipe-hint" aria-hidden="true">{ui.swipe}</p>
          <div className="lp-center">
            <a href={register} className="btn-primary" data-cta={cta('templates')}>{ui.templatesCta}</a>
          </div>
        </section>

        {/* HOW IT WORKS: an animated phone walks through the four steps. */}
        <section className="lp-section lp-how">
          <div className="wrap">
            <p className="eyebrow lp-center">{ui.howEyebrow}</p>
            <h2 className="section-title lp-center">{ui.howTitle}</h2>
            <p className="section-sub lp-center lp-sub">{ui.howSub}</p>
            <div className="lp-how-grid">
              <div className="lp-phone" aria-hidden="true">
                <div className="lp-phone-notch" />
                <div className="lp-phone-screen">
                  {/* 1. Sign up */}
                  <div className="lp-scr lp-scr-1">
                    <p className="lp-scr-brand">My<span>Gala</span></p>
                    <p className="lp-scr-title">{ui.phone.signupTitle}</p>
                    <div className="lp-scr-btn lp-scr-google"><span className="lp-g">G</span>{ui.phone.google}</div>
                    <p className="lp-scr-or">{ui.phone.or}</p>
                    <div className="lp-scr-field">{ui.phone.email}</div>
                    <div className="lp-scr-btn lp-scr-primary lp-tap">{ui.phone.signup}</div>
                    <p className="lp-scr-small">{ui.phone.small}</p>
                  </div>
                  {/* 2. Pick a template */}
                  <div className="lp-scr lp-scr-2">
                    <p className="lp-scr-title">{ui.phone.pickTitle}</p>
                    <div className="lp-scr-themes">
                      {s.pickFrom.map((t, i) => (
                        <div className={`lp-scr-theme${i === 0 ? ' lp-picked' : ''}`} key={t}>
                          {themePhoto(t) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img {...previewImage(themePhoto(t)!, '120px')} alt="" />
                          )}
                          <span>{themeName(t)}</span>
                          {i === 0 && <b className="lp-check">✓</b>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 3. Add the details */}
                  <div className="lp-scr lp-scr-3">
                    <p className="lp-scr-title">{ui.phone.detailsTitle}</p>
                    <label>{ui.phone.nameLabel}</label>
                    <div className="lp-scr-field"><span className="lp-type lp-type-1">{s.name}</span></div>
                    <label>{ui.phone.dateLabel}</label>
                    <div className="lp-scr-field"><span className="lp-type lp-type-2">{s.date}</span></div>
                    <label>{ui.phone.placeLabel}</label>
                    <div className="lp-scr-field"><span className="lp-type lp-type-3">{s.place}</span></div>
                    <div className="lp-scr-btn lp-scr-primary">{ui.phone.publish}</div>
                  </div>
                  {/* 4. Share and watch the RSVPs */}
                  <div className="lp-scr lp-scr-4">
                    <div className="lp-scr-hero">
                      {stepPhoto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img {...previewImage(stepPhoto, '260px')} alt="" />
                      )}
                      <div>
                        <p className="lp-scr-hero-name">{s.name}</p>
                        <p className="lp-scr-hero-date">{s.date}</p>
                      </div>
                    </div>
                    <div className="lp-scr-link"><LinkIcon aria-hidden="true" />mygala.ca/{s.link}</div>
                    <p className="lp-scr-label">{ui.phone.newRsvps}</p>
                    {s.rsvps.map((r, i) => (
                      <div className={`lp-scr-rsvp lp-rsvp-${i + 1}`} key={r.who}>
                        <span className="lp-rsvp-dot">✓</span>
                        <div><b>{r.who}</b><small>{r.reply}</small></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <ol className="lp-steps">
                {ui.steps.map(([title, text], i) => (
                  <li className={`lp-step lp-step-${i + 1}`} key={title}>
                    <span className="lp-step-num">{i + 1}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                    <span className="lp-step-bar" aria-hidden="true" />
                  </li>
                ))}
              </ol>
            </div>
            <div className="lp-center lp-how-cta">
              <a href={register} className="btn-primary lp-btn-big" data-cta={cta('steps')}>{ui.stepsCta}</a>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="lp-section lp-features">
          <div className="wrap">
            <p className="eyebrow lp-center">{ui.featuresEyebrow}</p>
            <h2 className="section-title lp-center">{page.features.title}</h2>
            <p className="section-sub lp-center lp-sub">{page.features.sub}</p>

            <h3 className="lp-feature-group"><span className="lp-pill lp-pill-free">{ui.freePill}</span>{ui.freeGroup}</h3>
            <div className="lp-feature-grid">
              {free.map((f) => {
                const Icon = ICONS[f.icon];
                return (
                  <div className="lp-feature" key={f.title}>
                    <span className="lp-feature-icon"><Icon aria-hidden="true" /></span>
                    <div><h4>{f.title}</h4><p>{f.text}</p></div>
                  </div>
                );
              })}
            </div>

            <h3 className="lp-feature-group"><span className="lp-pill lp-pill-plus">{ui.plusPill}</span>{ui.plusGroup}</h3>
            <div className="lp-feature-grid">
              {plus.map((f) => {
                const Icon = ICONS[f.icon];
                return (
                  <div className="lp-feature lp-feature-plus" key={f.title}>
                    <span className="lp-feature-icon"><Icon aria-hidden="true" /></span>
                    <div><h4>{f.title}</h4><p>{f.text}</p></div>
                  </div>
                );
              })}
            </div>
            <div className="lp-center lp-features-cta">
              <a href={register} className="btn-primary lp-btn-big" data-cta={cta('features')}>{page.cta}</a>
            </div>
          </div>
        </section>

        {/* OCCASIONS */}
        <section className="lp-section lp-occasions">
          <div className="wrap">
            <h2 className="section-title lp-center">{page.occasions.title}</h2>
            <ul className="lp-chips">{page.occasions.items.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="lp-section lp-faq">
          <div className="wrap">
            <h2 className="section-title lp-center">{ui.faqTitle}</h2>
            <div className="lp-faq-list">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta lp-final">
          <h2 className="section-title">{page.final.title}</h2>
          <p className="hero-sub">{page.final.text}</p>
          <a href={register} className="btn-primary lp-btn-big" data-cta={cta('footer')}>{page.cta}</a>
          <p className="lp-final-note">{ui.finalNote}</p>
        </section>
      </main>

      {footer}

      {/* Phones: the sign-up button stays in reach while scrolling. */}
      <div className="lp-sticky">
        <a href={register} className="btn-primary" data-cta={cta('sticky')}>{page.cta}</a>
        <span>{ui.stickyNote}</span>
      </div>
    </div>
  );
}
