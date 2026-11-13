import Link from 'next/link';
import type { Metadata } from 'next';
import { ES_FEATURES, ES_PAGES, ES_VIDEOS, esMetadata, esVideoReady } from '@/app/lib/marketing/es';
import { breadcrumbJsonLd, videoObjectJsonLd, webPageJsonLd } from '@/app/lib/marketing/seo';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import SpanishShell from '@/app/ui/marketing/es/spanish-shell';
import { EsBreadcrumbs, EsFinalCta, EsPricing, EsVideo, ICONS, registerHref } from '@/app/ui/marketing/es/es-blocks';

// What MyGala does, with every how-to video in Spanish.
const PATH = ES_PAGES.features.path;

export function generateMetadata(): Metadata {
  return esMetadata(ES_FEATURES.seo, PATH);
}

export default function SpanishFeatures() {
  return (
    <SpanishShell english="/features">
      <JsonLd data={webPageJsonLd(ES_FEATURES.seo, PATH, 'es')} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/es' }, { name: ES_PAGES.features.label, path: PATH }])} />
      {ES_FEATURES.rows.filter((r) => esVideoReady(r.video)).map((r) => (
        <JsonLd key={r.id} data={videoObjectJsonLd(ES_VIDEOS[r.video], `${PATH}#${r.id}`, 'es')} />
      ))}

      <header className="mk-hero">
        <div className="wrap">
          <EsBreadcrumbs current={ES_PAGES.features.label} />
          <p className="eyebrow">Funciones, paso a paso</p>
          <h1 className="mk-h1">Todo lo que MyGala hace por tu evento, en videos en español.</h1>
          <p className="mk-lead">
            Desde elegir tu tema hasta el día de la fiesta: mira cómo funciona cada cosa en menos de un minuto. El panel de MyGala
            está en inglés, así que los videos te muestran exactamente dónde tocar.
          </p>
          <div className="mk-cta-row mk-cta-row--hero">
            <Link {...registerHref('features-hero')} className="btn-primary">Crea tu página gratis</Link>
            <a href="#todo" className="btn-secondary">Ver todas las funciones</a>
          </div>
          <ul className="es-chipnav" aria-label="Ir a una función">
            {ES_FEATURES.rows.map((r) => <li key={r.id}><a href={`#${r.id}`}>{r.short}</a></li>)}
          </ul>
        </div>
      </header>

      <div className="wrap">
        {ES_FEATURES.rows.map((r) => (
          <section className="es-row" id={r.id} key={r.id} aria-labelledby={`${r.id}-title`}>
            <div className="es-row-media reveal">
              <EsVideo name={r.video} id={`video-${r.id}`} />
            </div>
            <div className="reveal delay-1">
              <p className="es-kicker">
                {r.kicker}
                <span className={`mk-badge${r.plan === 'Gratis' ? ' mk-badge--free' : ''}`}>{r.plan}</span>
              </p>
              <h2 id={`${r.id}-title`}>{r.title}</h2>
              <p className="es-row-text">{r.text}</p>
              <ul className="es-check">{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </section>
        ))}
      </div>

      <div className="theme-showcase" id="todo">
        <div className="wrap">
          <div className="section">
            <div className="reveal" style={{ maxWidth: 640, marginBottom: 44 }}>
              <p className="eyebrow">Y mucho más</p>
              <h2 className="section-title">Todo lo que tu evento necesita.</h2>
              <p className="section-sub">Las funciones gratis están en todas las páginas. Las funciones <Link href="/es/live-party">Live Party</Link> se desbloquean con un solo pago por evento.</p>
            </div>
            <div className="es-more">
              {ES_FEATURES.more.map((f, i) => {
                const Icon = ICONS[f.icon];
                return (
                  <div className={`es-more-card reveal${i % 4 ? ` delay-${Math.min(i % 4, 3)}` : ''}`} key={f.title}>
                    <Icon aria-hidden="true" />
                    <h3>{f.title}<span className={`mk-badge${f.plan === 'Gratis' ? ' mk-badge--free' : ''}`}>{f.plan}</span></h3>
                    <p>{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="section">
          <div className="es-center reveal">
            <p className="eyebrow">Precios</p>
            <h2 className="section-title">Gratis para empezar, <Link href="/es/live-party">Live Party</Link> cuando lo necesites.</h2>
          </div>
          <EsPricing />
        </div>
      </div>

      <EsFinalCta title="Mira tu página en vivo en minutos." text="Crea tu cuenta gratis, elige un tema y comparte tu enlace hoy mismo." cta="features-final" />
    </SpanishShell>
  );
}
