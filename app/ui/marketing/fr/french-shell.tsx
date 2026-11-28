import Link from 'next/link';
import { greatVibes } from '@/app/ui/fonts';
import MarketingReveal from '@/app/ui/marketing-reveal';
import { COMPANY, copyrightLine } from '@/app/lib/company';
import { FR_PAGES } from '@/app/lib/marketing/fr';
import FrenchTopbar from './french-topbar';
import SocialLinks from '@/app/ui/marketing/social-links';
import '@/app/ui/marketing.css';
// The French pages share the Spanish pages' layout styles (.es-page …).
import '@/app/ui/marketing/es/es.css';
import { CookieSettingsLink } from '@/app/ui/cookie-banner';

// Top bar and footer around the French pages (/fr). english: the English
// page this one stands for, for the "EN" link.
export default function FrenchShell({ english = '/', children }: { english?: string; children: React.ReactNode }) {
  return (
    <div className={`marketing-page es-page fr-page ${greatVibes.variable}`}>
      <FrenchTopbar english={english} />
      <main>{children}</main>
      <FrenchFooter english={english} />
      <MarketingReveal />
    </div>
  );
}

export function FrenchFooter({ english = '/' }: { english?: string }) {
  return (
    <footer className="footer site-footer">
      <div className="site-footer-cols">
        <div>
          <p className="site-footer-heading">MyGala en français</p>
          {Object.values(FR_PAGES).map((p) => <Link key={p.path} href={p.path}>{p.label}</Link>)}
        </div>
        <div>
          <p className="site-footer-heading">Information</p>
          {/* These pages are in English; the labels say so. */}
          <Link href="/live-party" hrefLang="en">Live Party (en anglais)</Link>
          <Link href="/contact" hrefLang="en">Nous joindre (en anglais)</Link>
          <Link href="/privacy" hrefLang="en">Confidentialité (en anglais)</Link>
          <CookieSettingsLink label="Paramètres des témoins" />
          <Link href="/terms" hrefLang="en">Conditions d’utilisation (en anglais)</Link>
        </div>
        <div>
          <p className="site-footer-heading">Autres langues</p>
          <Link href={english} hrefLang="en" lang="en">MyGala in English</Link>
          <Link href="/es" hrefLang="es" lang="es">MyGala en español</Link>
        </div>
      </div>
      <p className="footer-wordmark">My<span className="accent">Gala</span></p>
      <SocialLinks lang="fr" />
      <p style={{ marginTop: 6 }}>mygala.ca</p>
      <p style={{ marginTop: 6, fontSize: 12 }}>{copyrightLine().replace('All rights reserved.', 'Tous droits réservés.')} MyGala est exploité par {COMPANY.legalName}</p>
    </footer>
  );
}
