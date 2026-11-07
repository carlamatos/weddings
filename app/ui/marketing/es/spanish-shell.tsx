import Link from 'next/link';
import { greatVibes } from '@/app/ui/fonts';
import MarketingReveal from '@/app/ui/marketing-reveal';
import { COMPANY, copyrightLine } from '@/app/lib/company';
import { ES_FEATURES, ES_PAGES } from '@/app/lib/marketing/es';
import SpanishTopbar from './spanish-topbar';
import '@/app/ui/marketing.css';
import './es.css';

// Top bar and footer around the Spanish pages (/es). english: the English
// page this one stands for, for the "EN" link.
export default function SpanishShell({ english = '/', children }: { english?: string; children: React.ReactNode }) {
  return (
    <div className={`marketing-page es-page ${greatVibes.variable}`}>
      <SpanishTopbar english={english} />
      <main>{children}</main>
      <SpanishFooter english={english} />
      <MarketingReveal />
    </div>
  );
}

function SpanishFooter({ english }: { english: string }) {
  return (
    <footer className="footer site-footer">
      <div className="site-footer-cols">
        <div>
          <p className="site-footer-heading">MyGala en español</p>
          {Object.values(ES_PAGES).map((p) => <Link key={p.path} href={p.path}>{p.label}</Link>)}
        </div>
        <div>
          <p className="site-footer-heading">Funciones</p>
          {ES_FEATURES.rows.map((f) => <Link key={f.id} href={`/es/funciones#${f.id}`}>{f.short}</Link>)}
          <Link href="/es/funciones#todo">Todas las funciones</Link>
        </div>
        <div>
          <p className="site-footer-heading">Información</p>
          {/* These pages are in English; the labels say so. */}
          <Link href="/privacy" hrefLang="en">Privacidad (en inglés)</Link>
          <Link href="/terms" hrefLang="en">Términos de uso (en inglés)</Link>
          <Link href="/company" hrefLang="en">Datos de la empresa (en inglés)</Link>
          <Link href={english} hrefLang="en" lang="en">MyGala in English</Link>
        </div>
      </div>
      <p className="footer-wordmark">My<span className="accent">Gala</span></p>
      <p style={{ marginTop: 6 }}>mygala.ca</p>
      <p style={{ marginTop: 6, fontSize: 12 }}>{copyrightLine().replace('All rights reserved.', 'Todos los derechos reservados.')} MyGala es operado por {COMPANY.legalName}</p>
    </footer>
  );
}
