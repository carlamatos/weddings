import Link from 'next/link';
import type { Metadata } from 'next';
import { COMPANY } from '@/app/lib/company';
import { WEDDING_LANDING_FR } from '@/app/lib/marketing/landing';
import { marketingMetadata } from '@/app/lib/marketing/seo';
import { themeCardsFor } from '@/app/lib/marketing/theme-cards';
import { LandingView } from '@/app/ui/marketing/landing-view';

// French wedding landing page for Google Ads in Quebec and French Canada:
// the same page as /events/weddings/start, in French. The sign-up form and
// the "check your email" page follow in French (?lang=fr); the dashboard is
// in English, which the page's FAQ says plainly.

const PATH = '/fr/mariage';

export function generateMetadata(): Metadata {
  const meta = marketingMetadata(WEDDING_LANDING_FR.seo, PATH);
  return {
    ...meta,
    alternates: { ...meta.alternates, languages: { 'en-CA': '/events/weddings/start', 'fr-CA': PATH } },
    openGraph: { ...meta.openGraph, locale: 'fr_CA', alternateLocale: ['en_CA'] },
  };
}

// The site's pages it links to are in English; the labels say where they go.
function FrenchFooter() {
  return (
    <footer className="footer site-footer">
      <p className="footer-wordmark">My<span className="accent">Gala</span></p>
      <p style={{ marginTop: 12, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/">Accueil</Link>
        <Link href="/events/weddings/start" hrefLang="en">English</Link>
        <Link href="/privacy">Confidentialité</Link>
        <Link href="/terms">Conditions d’utilisation</Link>
        <Link href="/contact">Nous joindre</Link>
      </p>
      <p style={{ marginTop: 6, fontSize: 12 }}>© {new Date().getFullYear()} {COMPANY.legalName} Tous droits réservés.</p>
    </footer>
  );
}

export default function FrenchWeddingLanding() {
  return (
    <LandingView
      page={WEDDING_LANDING_FR}
      templates={themeCardsFor('wedding')}
      faqs={WEDDING_LANDING_FR.faqs ?? []}
      lang="fr"
      footer={<FrenchFooter />}
    />
  );
}
