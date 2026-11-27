import type { Metadata } from 'next';
import type { InvitationLandingPage } from './invitation-landing';
import { marketingMetadata } from './seo';

const HREFLANG = { en: 'en-CA', fr: 'fr-CA', es: 'es' } as const;
const OG_LOCALE = { en: 'en_CA', fr: 'fr_CA', es: 'es_419' } as const;

// A landing page's metadata, with the same page in its other languages as
// hreflang alternates (the New Year's Eve page in English, French and Spanish).
export function landingPageMetadata(page: InvitationLandingPage): Metadata {
  const meta = marketingMetadata(page.seo, page.path);
  const lang = page.lang ?? 'en';
  if (!page.languages) return meta;
  const languages = Object.fromEntries(Object.entries(page.languages).map(([l, path]) => [HREFLANG[l as keyof typeof HREFLANG], path]));
  return {
    ...meta,
    alternates: { ...meta.alternates, languages },
    openGraph: {
      ...meta.openGraph,
      locale: OG_LOCALE[lang],
      alternateLocale: Object.keys(page.languages).filter((l) => l !== lang).map((l) => OG_LOCALE[l as keyof typeof OG_LOCALE]),
    },
  };
}
