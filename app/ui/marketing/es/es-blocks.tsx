import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';
import {
  BellAlertIcon, CakeIcon, CalendarDaysIcon, ClipboardDocumentCheckIcon, GiftIcon, GlobeAltIcon, LockClosedIcon,
  MusicalNoteIcon, PaperAirplaneIcon, Squares2X2Icon, UserGroupIcon, VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { appHref } from '@/app/lib/app-url';
import { ES_PLAN_FEATURES, ES_PRICE, ES_REGISTER, ES_VIDEOS, esVideoReady, type EsVideoKey } from '@/app/lib/marketing/es';
import { PLAN_TERM_MONTHS } from '@/app/lib/plans';
import type { Faq } from '@/app/lib/marketing/types';
import { FeatureVideo } from '@/app/ui/marketing/feature-video';
import { HomeVideo } from '@/app/ui/marketing/home-video';
import { ThemePagePicture } from '@/app/ui/marketing/theme-page-picture';
import { Rich } from '@/app/ui/marketing/rich';

// The pieces the Spanish pages share.

export const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  mail: PaperAirplaneIcon, rsvp: ClipboardDocumentCheckIcon, guests: UserGroupIcon, program: CalendarDaysIcon,
  bell: BellAlertIcon, video: VideoCameraIcon, music: MusicalNoteIcon, potluck: CakeIcon, sections: Squares2X2Icon,
  gift: GiftIcon, lock: LockClosedIcon, domain: GlobeAltIcon,
};

export const registerHref = (cta: string) => ({ href: appHref(ES_REGISTER), 'data-cta': `es-${cta}` });

// A video in Spanish once its file is there; until then, its picture.
export function EsVideo({ name, id, home = false }: { name: EsVideoKey; id?: string; home?: boolean }) {
  const video = ES_VIDEOS[name];
  if (esVideoReady(name)) {
    return home ? <HomeVideo video={video} lang="es" anchor="como-funciona" /> : <FeatureVideo video={video} lang="es" id={id} soundOnPlay />;
  }
  return (
    <figure className={home ? 'home-video' : 'mk-video'} id={id}>
      <div className={home ? 'home-video-frame' : 'mk-video-frame'}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.still} alt="" width={video.width} height={video.height} loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: 'auto' }} />
      </div>
      <figcaption>{video.caption}</figcaption>
    </figure>
  );
}

export function EsThemeCards({ themes }: { themes: { slug: string; name: string; desc: string }[] }) {
  return (
    <div className="theme-grid">
      {themes.map((t, i) => (
        <a key={t.slug} href={`/themes/${t.slug}?lang=es`} target="_blank" rel="noopener noreferrer" className={`theme-card reveal${i % 3 ? ` delay-${i % 3}` : ''}`} style={{ textDecoration: 'none' }}>
          <ThemePagePicture slug={t.slug} es alt={`El tema ${t.name}: la página completa, desliza para verla`} />
          <div className="theme-info">
            <p className="theme-name">{t.name}</p>
            <p className="theme-desc">{t.desc}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

export function EsPricing() {
  return (
    <>
      <div className="pricing-grid">
        <div className="price-card reveal">
          <p className="price-tier">Gratis</p>
          <p className="price-amount">$0</p>
          <p className="price-desc">Todo lo que necesitas para empezar.</p>
          <ul className="price-features">{ES_PLAN_FEATURES.free.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link {...registerHref('pricing-free')} className="btn-secondary" style={{ textAlign: 'center' }}>Empieza gratis</Link>
        </div>
        <div className="price-card featured reveal delay-1">
          <span className="price-badge">El más popular</span>
          <p className="price-tier"><Link href="/es/live-party" className="price-tier-link">Live Party</Link></p>
          <p className="price-amount">{ES_PRICE.replace(' CAD', '')}<span className="per"> CAD + impuestos, un solo pago por evento</span></p>
          <p className="price-desc">Todas las funciones de MyGala para tu evento, durante {PLAN_TERM_MONTHS} meses.</p>
          <ul className="price-features">{ES_PLAN_FEATURES.plus.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/es/live-party" className="price-more">Ver todo lo que incluye Live Party →</Link>
          <Link {...registerHref('pricing-plus')} className="btn-primary" style={{ textAlign: 'center' }}>Crea tu página</Link>
        </div>
      </div>
      <p className="es-fine">
        🔒 Pago seguro con Stripe · Visa, Mastercard y American Express · Precios en dólares canadienses (CAD); los impuestos se agregan al pagar.{' '}
        <Link href="/terms#refunds" hrefLang="en">Política de reembolsos (en inglés)</Link>
      </p>
    </>
  );
}

export function EsFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="reveal">
      {faqs.map((f) => (
        <div className="faq-item" key={f.q}>
          <p className="faq-q">{f.q}</p>
          <p className="faq-a"><Rich text={f.a} liveParty="/es/live-party" /></p>
        </div>
      ))}
    </div>
  );
}

export function EsFinalCta({ title, text, cta, liveParty = '/es/live-party' }: { title: string; text: string; cta: string; liveParty?: string | false }) {
  return (
    <div className="final-cta reveal">
      <h2 className="section-title">{title}</h2>
      <p className="hero-sub"><Rich text={text} liveParty={liveParty} /></p>
      <Link {...registerHref(cta)} className="btn-primary">Crea tu página gratis</Link>
    </div>
  );
}

export function EsBreadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Ruta de navegación" className="mk-breadcrumbs">
      <ol>
        <li><Link href="/es">Inicio</Link></li>
        <li><span aria-current="page">{current}</span></li>
      </ol>
    </nav>
  );
}
