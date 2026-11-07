import Link from 'next/link';
import type { Metadata } from 'next';
import { COMPANY } from '@/app/lib/company';
import { ES_PAGES, esMetadata } from '@/app/lib/marketing/es';
import { breadcrumbJsonLd, organizationJsonLd, webPageJsonLd } from '@/app/lib/marketing/seo';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import SpanishShell from '@/app/ui/marketing/es/spanish-shell';
import { EsBreadcrumbs } from '@/app/ui/marketing/es/es-blocks';
import ContactForm from '@/app/(site)/contact/ContactForm';

// Contact, in Spanish: the contact form (its messages arrive marked
// "Español") and who MyGala is.
const PATH = ES_PAGES.contact.path;
const SEO = {
  title: 'Contacto',
  description: 'Escríbele a MyGala para pedir ayuda con la página de tu evento, tu pago o una colaboración. Te respondemos en un día hábil.',
};

export function generateMetadata(): Metadata {
  return esMetadata(SEO, PATH);
}

export default function SpanishContact() {
  return (
    <SpanishShell english="/contact">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webPageJsonLd(SEO, PATH, 'es')} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/es' }, { name: ES_PAGES.contact.label, path: PATH }])} />

      <header className="mk-hero">
        <div className="wrap">
          <EsBreadcrumbs current={ES_PAGES.contact.label} />
          <p className="eyebrow">Estamos para ayudarte</p>
          <h1 className="mk-h1">Hablemos de tu evento.</h1>
          <p className="mk-lead" style={{ marginBottom: 0 }}>
            ¿Tienes una pregunta, una idea o necesitas ayuda con tu página? Somos un equipo pequeño y leemos cada mensaje.
            Te respondemos en un día hábil.
          </p>
        </div>
      </header>

      <div className="wrap">
        <div className="es-contact">
          <div className="es-card reveal">
            <h2>Envíanos un mensaje</h2>
            <p>Cuéntanos qué necesitas y te escribimos a tu correo.</p>
            <ContactForm lang="es" />
          </div>

          <div className="reveal delay-1">
            <div className="es-info">
              <h2>Sobre MyGala</h2>
              <p>
                MyGala es una empresa canadiense que crea páginas web para bodas, cumpleaños, quinceañeras y toda clase de
                celebraciones. Queremos que organizar tu evento sea tan bonito como celebrarlo.
              </p>
              <dl>
                <div>
                  <dt>Correo</dt>
                  <dd><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></dd>
                </div>
                <div>
                  <dt>Respuesta</dt>
                  <dd>En un día hábil</dd>
                </div>
                {COMPANY.address.length > 0 && (
                  <div>
                    <dt>Dirección</dt>
                    <dd>{COMPANY.legalName}<br />{COMPANY.address.map((line) => <span key={line}>{line}<br /></span>)}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="es-links">
              <Link href="/es/funciones"><span>Mira los videos en español<small>Cada función, paso a paso</small></span><span aria-hidden="true">→</span></Link>
              <Link href="/es#precios"><span>Precios<small>Gratis para empezar, Plus por evento</small></span><span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </div>
    </SpanishShell>
  );
}
