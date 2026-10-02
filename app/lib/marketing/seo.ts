import type { Metadata } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import type { Faq, SeoMeta } from './types';

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
    keywords: seo.keywords,
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
