import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { ES_HOME, ES_VIDEOS, esMetadata, esVideoReady } from '@/app/lib/marketing/es';
import { faqPageJsonLd, organizationJsonLd, videoObjectJsonLd, webPageJsonLd } from '@/app/lib/marketing/seo';
import HeroThemeWall from '@/app/ui/marketing/hero-theme-wall';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import SpanishShell from '@/app/ui/marketing/es/spanish-shell';
import { EsFaq, EsFinalCta, EsPricing, EsThemeCards, EsVideo, registerHref } from '@/app/ui/marketing/es/es-blocks';

// MyGala in Spanish: the homepage's overall picture, with the Spanish video.
const PATH = '/es';

export function generateMetadata(): Metadata {
  return esMetadata(ES_HOME.seo, PATH);
}

// The words MyGala writes on a page, before and after choosing Español
// (app/lib/translations.ts).
const WORDS = [
  ['Kindly respond', 'Confirma tu asistencia'],
  ['Our story', 'Nuestra historia'],
  ['Until we say I do', 'Hasta el sí quiero'],
  ['Get directions', 'Cómo llegar'],
];

export default function SpanishHome() {
  return (
    <SpanishShell english="/">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webPageJsonLd(ES_HOME.seo, PATH, 'es')} />
      <JsonLd data={faqPageJsonLd(ES_HOME.faqs)} />
      {esVideoReady('home') && <JsonLd data={videoObjectJsonLd(ES_VIDEOS.home, PATH, 'es')} />}

      <div className="hero">
        <HeroThemeWall />
        <div className="hero-wash" />
        <p className="hero-eyebrow hero-badge"><span className="hero-badge-free">Gratis</span><span>Páginas para bodas, cumpleaños, quinceañeras y toda celebración</span></p>
        <p className="hero-tagline">Una página tan especial como tu celebración.</p>
        <h1 className="hero-headline">Organiza tu evento en minutos.</h1>
        <p className="hero-sub">Elige un tema, agrega los detalles y comparte un solo enlace con todos tus seres queridos. Invitaciones, confirmaciones, fotos y cada detalle, en un solo lugar y en español.</p>
        <div className="hero-actions">
          <Link {...registerHref('hero')} className="btn-primary">Crea tu página gratis</Link>
          <a href="#como-funciona" className="btn-secondary btn-demo" data-cta="es-hero-video">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M10 8.5l5.5 3.5-5.5 3.5z" fill="currentColor" />
            </svg>
            Mira cómo funciona
          </a>
          <Link href="/themes/alegria?lang=es" className="btn-secondary btn-demo" data-cta="es-hero-demo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Ver un ejemplo
          </Link>
        </div>
        <p className="hero-note"><span>Gratis para empezar</span> · <span>Sin tarjeta de crédito</span> · <span>Sin saber de diseño</span></p>
      </div>

      <div className="wrap" id="como-funciona">
        <div className="section home-video-section">
          <div className="reveal" style={{ maxWidth: 640, marginBottom: 36 }}>
            <p className="eyebrow">Míralo en un minuto</p>
            <h2 className="section-title">De &ldquo;¡vamos a celebrar!&rdquo; a la fiesta.</h2>
          </div>
          <EsVideo name="home" home />
        </div>
      </div>

      <div className="wrap">
        <div className="section" style={{ paddingTop: 40 }}>
          <div className="reveal" style={{ maxWidth: 640, marginBottom: 54 }}>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="section-title">Cuatro pasos, y a celebrar.</h2>
          </div>
          <ol className="es-steps reveal">
            {ES_HOME.steps.map((s) => <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>)}
          </ol>
        </div>
      </div>

      <section className="es-band" aria-labelledby="es-band-title">
        <div className="wrap">
          <div className="reveal">
            <p className="eyebrow">Tu página, en tu idioma</p>
            <h2 className="section-title" id="es-band-title">Tus invitados leen todo en español.</h2>
            <p className="section-sub">Elige Español y MyGala traduce todo lo que escribe en tu página. Tus propios textos se muestran tal como los escribes, en español, en inglés o en los dos.</p>
            <ul className="es-check">
              <li>Títulos, botones, fechas y la cuenta regresiva</li>
              <li>El formulario de confirmación de asistencia</li>
              <li>Los recordatorios por correo a tus invitados</li>
              <li>Gratis en todos los planes</li>
            </ul>
          </div>
          <div className="es-words reveal delay-1" aria-label="Ejemplos de lo que cambia al elegir Español">
            {WORDS.map(([en, es]) => (
              <p className="es-word" key={es}>
                <span lang="en">{en}</span>
                <ArrowRightIcon width={18} height={18} aria-hidden="true" />
                <b>{es}</b>
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="section">
          <div className="reveal" style={{ maxWidth: 640, marginBottom: 50 }}>
            <p className="eyebrow">Por qué MyGala</p>
            <h2 className="section-title">Todo lo que tu evento necesita, nada que le sobre.</h2>
          </div>
          <div className="props-grid">
            {ES_HOME.props.map((p, i) => (
              <div className={`prop-card reveal${i ? ` delay-${i}` : ''}`} key={p.title}>
                <p className="prop-num">0{i + 1}</p>
                <h3 className="prop-title">{p.title}</h3>
                <p className="prop-copy">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="theme-showcase" id="temas">
        <div className="wrap">
          <div className="section">
            <div className="reveal" style={{ maxWidth: 640, marginBottom: 40 }}>
              <p className="eyebrow">Un tema para cada ocasión</p>
              <h2 className="section-title">Elige el tema que va con tu celebración.</h2>
              <p className="section-sub">Cada tema trae las mismas funciones: confirmaciones, cuenta regresiva, galería, transmisión en vivo y más. Solo cambia el estilo.</p>
            </div>
            <EsThemeCards themes={ES_HOME.themes} />
            <p style={{ marginTop: 28, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Link href="/es/cumpleanos-y-quinceaneras" className="learn-more-link">Cumpleaños y quinceañeras →</Link>
              <Link href="/es/funciones" className="learn-more-link">Todas las funciones →</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="wrap" id="precios">
        <div className="section">
          <div className="es-center reveal">
            <p className="eyebrow">Precios sencillos</p>
            <h2 className="section-title">Empieza gratis. Mejora cuando quieras.</h2>
            <p className="section-sub">Un solo pago, sin cargos recurrentes y sin sorpresas mientras se acerca tu evento.</p>
          </div>
          <EsPricing />
        </div>
      </div>

      <div className="wrap">
        <div className="section" style={{ maxWidth: 760, margin: '0 auto', paddingTop: 0 }}>
          <div className="reveal" style={{ marginBottom: 40 }}>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 className="section-title">Bueno saberlo</h2>
          </div>
          <EsFaq faqs={ES_HOME.faqs} />
          <p className="es-fine" style={{ textAlign: 'left', margin: '28px 0 0' }}>
            ¿Más preguntas? <Link href="/es/contacto">Escríbenos</Link>.
          </p>
        </div>
      </div>

      <EsFinalCta title="Tu celebración merece una página hermosa." text="Empieza gratis hoy. Mejora a Live Party solo si lo necesitas." cta="final" />
    </SpanishShell>
  );
}
