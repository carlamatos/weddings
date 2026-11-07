import Link from 'next/link';
import type { Metadata } from 'next';
import { ES_PAGES, ES_QUINCE, esMetadata } from '@/app/lib/marketing/es';
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from '@/app/lib/marketing/seo';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import SpanishShell from '@/app/ui/marketing/es/spanish-shell';
import { EsBreadcrumbs, EsFaq, EsFinalCta, EsThemeCards, registerHref } from '@/app/ui/marketing/es/es-blocks';

// Birthdays, with a section of its own for quinceañeras.
const PATH = ES_PAGES.quince.path;

export function generateMetadata(): Metadata {
  return esMetadata(ES_QUINCE.seo, PATH);
}

export default function BirthdaysAndQuinceaneras() {
  return (
    <SpanishShell english="/events/celebrations">
      <JsonLd data={webPageJsonLd(ES_QUINCE.seo, PATH, 'es')} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/es' }, { name: ES_PAGES.quince.label, path: PATH }])} />
      <JsonLd data={faqPageJsonLd(ES_QUINCE.faqs)} />

      <header className="mk-hero">
        <div className="wrap es-split">
          <div>
            <EsBreadcrumbs current={ES_PAGES.quince.label} />
            <p className="eyebrow">Cumpleaños, baby showers y quinceañeras</p>
            <h1 className="mk-h1">Una página para tu fiesta, de los primeros años a los XV.</h1>
            <p className="mk-lead">
              Elige un tema lleno de color, agrega la fecha y el lugar, y comparte un solo enlace. Tus invitados confirman, ven
              la cuenta regresiva y el mapa, y el día de la fiesta comparten sus fotos. Todo en español.
            </p>
            <div className="mk-cta-row mk-cta-row--hero">
              <Link {...registerHref('quince-hero')} className="btn-primary">Crea tu página gratis</Link>
              <a href="#quinceaneras" className="btn-secondary">Para quinceañeras</a>
            </div>
          </div>
          <div className="es-phone" aria-hidden="true">
            <div className="es-phone-screen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/theme-pages/es/phone/alegria.webp" alt="" />
            </div>
            <p className="es-phone-tag"><b>Alegría</b>Un tema para quinceañeras</p>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="mk-highlights">
          {ES_QUINCE.highlights.map((h) => (
            <div className="mk-highlight" key={h.title}>
              <h2 className="mk-highlight-title">{h.title}</h2>
              <p>{h.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="section" style={{ paddingTop: 72 }}>
          <div className="es-split" style={{ alignItems: 'start' }}>
            <div className="reveal">
              <p className="eyebrow">Cumpleaños para todas las edades</p>
              <h2 className="section-title">Del primer añito a los cincuenta, y más.</h2>
              <p className="section-sub">
                Una página con todo lo que tus invitados necesitan saber: cuándo, dónde, qué llevar y cuántos van. Tú ves las
                confirmaciones llegar, sin perseguir a nadie por mensaje.
              </p>
            </div>
            <ul className="es-check reveal delay-1" style={{ marginTop: 8 }}>
              {ES_QUINCE.birthdays.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <section className="es-quince" id="quinceaneras" aria-labelledby="es-quince-title">
        <div className="wrap">
          <div className="es-quince-head">
            <div className="reveal">
              <p className="es-quince-script" aria-hidden="true">Mis XV años</p>
              <p className="eyebrow">Para quinceañeras</p>
              <h2 className="section-title" id="es-quince-title">Tu quinceañera, como la soñaste.</h2>
              <p className="section-sub">
                La misa, la recepción, el vals y el baile sorpresa: una quinceañera tiene muchos momentos y muchos invitados.
                MyGala los reúne en una sola página, en español, para toda la familia, cerca y lejos.
              </p>
              <div className="mk-cta-row" style={{ marginTop: 28 }}>
                <Link {...registerHref('quince-section')} className="btn-primary">Crea la página de tus XV</Link>
                <Link href="/themes/alegria?lang=es" className="btn-secondary">Ver el tema Alegría</Link>
              </div>
            </div>
            <div className="es-phone reveal delay-1" aria-hidden="true">
              <div className="es-phone-screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/theme-pages/es/phone/fun-party.webp" alt="" style={{ animationDelay: '-6s' }} />
              </div>
              <p className="es-phone-tag"><b>Fun Party</b>Para unos XV que destacan</p>
            </div>
          </div>
          <div className="es-qgrid">
            {ES_QUINCE.quince.map((q, i) => (
              <div className={`es-qcard reveal${i % 3 ? ` delay-${i % 3}` : ''}`} key={q.title}>
                <p className="es-qnum">0{i + 1}</p>
                <h3>{q.title}</h3>
                <p>{q.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="theme-showcase">
        <div className="wrap">
          <div className="section">
            <div className="reveal" style={{ maxWidth: 640, marginBottom: 40 }}>
              <p className="eyebrow">Temas para celebrar</p>
              <h2 className="section-title">Elige el que va con tu fiesta.</h2>
              <p className="section-sub">Todos los temas son gratis y traen las mismas funciones. Ábrelos para ver una página de ejemplo completa.</p>
            </div>
            <EsThemeCards themes={ES_QUINCE.themes} />
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="section">
          <div className="reveal" style={{ maxWidth: 640, marginBottom: 54 }}>
            <p className="eyebrow">Cómo empezar</p>
            <h2 className="section-title">Tu página, lista hoy mismo.</h2>
          </div>
          <ol className="es-steps reveal">
            <li><h3>Crea tu cuenta gratis</h3><p>Solo necesitas tu correo. No te pedimos tarjeta de crédito.</p></li>
            <li><h3>Elige tu tema</h3><p>Alegría, Fun Party, Balloons o el que más te guste. Puedes cambiarlo cuando quieras.</p></li>
            <li><h3>Pon tu página en español</h3><p>Elige Español en el menú de idioma y escribe tus textos para tus invitados.</p></li>
            <li><h3>Comparte tu enlace</h3><p>Envía las invitaciones por correo, mensaje de texto o WhatsApp, y mira llegar las confirmaciones.</p></li>
          </ol>
          <p className="es-fine" style={{ textAlign: 'left', margin: '36px 0 0' }}>
            ¿Quieres ver cada paso? <Link href="/es/funciones">Mira nuestros videos en español</Link>.
          </p>
        </div>
      </div>

      <div className="wrap">
        <div className="section" style={{ maxWidth: 760, margin: '0 auto', paddingTop: 0 }}>
          <div className="reveal" style={{ marginBottom: 40 }}>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 className="section-title">Lo que más nos preguntan</h2>
          </div>
          <EsFaq faqs={ES_QUINCE.faqs} />
        </div>
      </div>

      <EsFinalCta title="Que tu fiesta empiece desde la invitación." text="Crea tu página gratis y compártela hoy mismo." cta="quince-final" />
    </SpanishShell>
  );
}
