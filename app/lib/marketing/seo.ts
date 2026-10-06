import type { Metadata } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import type { Faq, SeoMeta } from './types';
import { COMPANY } from '@/app/lib/company';
import { PLAN_CURRENCY, PLAN_ONE_TIME_PRICE, PLAN_TERM_MONTHS } from '@/app/lib/plans';

// Metadata and structured data for the marketing content pages. Canonical
// and Open Graph URLs are absolute on the main domain (NEXT_PUBLIC_SITE_URL).

const OG_IMAGE = '/opengraph-image.png';

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`;
}

export function marketingMetadata(seo: SeoMeta, path: string): Metadata {
  const url = absoluteUrl(path);
  return {
    // The root layout appends " | MyGala".
    title: seo.title,
    description: seo.description,
    ...(seo.keywords?.length ? { keywords: seo.keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'MyGala',
      locale: 'en_CA',
      url,
      title: `${seo.title} | MyGala`,
      description: seo.description,
      images: [{ url: absoluteUrl(OG_IMAGE), alt: 'MyGala — event websites made easy' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.title} | MyGala`,
      description: seo.description,
      images: [absoluteUrl(OG_IMAGE)],
    },
    robots: { index: true, follow: true },
  };
}

export function faqPageJsonLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function webPageJsonLd(seo: SeoMeta, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url: absoluteUrl(path),
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'MyGala', url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'MyGala', url: absoluteUrl('/'), logo: absoluteUrl('/images/mygala-logo-email.png') },
  };
}

function cityLine(line: string) {
  const m = line.match(/^(.+?),\s*([A-Z]{2})\s+([A-Z]\d[A-Z] ?\d[A-Z]\d)$/);
  return m ? { addressLocality: m[1], addressRegion: m[2], postalCode: m[3] } : {};
}

// The business behind the site, from app/lib/company.ts — so AI assistants
// and search engines get the same name, address and contacts as the pages.
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: COMPANY.tradeName,
    legalName: COMPANY.legalName,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/icon.png'),
    email: COMPANY.email,
    ...(COMPANY.phone ? { telephone: COMPANY.phone } : {}),
    ...(COMPANY.address.length
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: COMPANY.address[0],
            // Second line is "City, PR A1A 1A1".
            ...cityLine(COMPANY.address[1] ?? ''),
            addressCountry: 'CA',
          },
        }
      : {}),
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: COMPANY.email, ...(COMPANY.phone ? { telephone: COMPANY.phone } : {}), availableLanguage: ['English', 'French', 'Spanish'] },
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: 'MyGala',
    url: absoluteUrl('/'),
    inLanguage: 'en',
    publisher: { '@id': absoluteUrl('/#organization') },
  };
}

// What MyGala is and what it costs, for answers like "how much is MyGala?".
export function productJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MyGala',
    url: absoluteUrl('/'),
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    description:
      'Event website builder for weddings, birthdays, baby showers, quinceañeras, conferences, galas and community events: RSVPs, guest lists, invitations, guest photo sharing by QR code, livestream, reminders and more.',
    publisher: { '@id': absoluteUrl('/#organization') },
    offers: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: PLAN_CURRENCY, description: 'Unlimited event pages with every theme, RSVPs, guest list, countdown, event details and event program.' },
      {
        '@type': 'Offer',
        name: 'Plus',
        price: PLAN_ONE_TIME_PRICE.toFixed(2),
        priceCurrency: PLAN_CURRENCY,
        description: `One-time payment per event page (not a subscription) that unlocks every Plus feature for ${PLAN_TERM_MONTHS} months.`,
        url: absoluteUrl('/#pricing'),
      },
    ],
  };
}

// Simple pages (About, Contact, legal): title, description and canonical URL.
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return marketingMetadata({ title, description }, path);
}
