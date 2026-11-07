import type { Metadata } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import type { Faq, SeoMeta, Video } from './types';
import { COMPANY } from '@/app/lib/company';
import { PLAN_CURRENCY, PLAN_ONE_TIME_PRICE, PLAN_TERM_MONTHS } from '@/app/lib/plans';

// Metadata and structured data for the marketing content pages. Canonical
// and Open Graph URLs are absolute on the main domain (NEXT_PUBLIC_SITE_URL).

const OG_IMAGE = '/opengraph-image.png';

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`;
}

// "Pricing" → "Pricing | MyGala", but a title that already names the brand
// ("MyGala — Event Websites…") is used as is, so it isn't doubled.
function withBrand(title: string): string {
  return /\bMyGala\b/.test(title) ? title : `${title} | MyGala`;
}

export function marketingMetadata(seo: SeoMeta, path: string): Metadata {
  const url = absoluteUrl(path);
  const title = withBrand(seo.title);
  return {
    // Absolute, so the root layout's " | MyGala" template isn't added twice.
    title: { absolute: title },
    description: seo.description,
    ...(seo.keywords?.length ? { keywords: seo.keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'MyGala',
      locale: 'en_CA',
      url,
      title,
      description: seo.description,
      images: [{ url: absoluteUrl(OG_IMAGE), alt: 'MyGala — event websites made easy' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
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

export function webPageJsonLd(seo: SeoMeta, path: string, lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url: absoluteUrl(path),
    inLanguage: lang,
    isPartOf: { '@type': 'WebSite', name: 'MyGala', url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'MyGala', url: absoluteUrl('/'), logo: absoluteUrl('/images/mygala-logo-email.png') },
  };
}

// Google wants uploadDate as a date and time with a time zone: a plain
// YYYY-MM-DD becomes noon, Pacific time (MyGala is in British Columbia).
function videoUploadDate(date: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00-08:00` : date;
}

// A product video, so search engines can show it in video results.
export function videoObjectJsonLd(video: Video, path: string, lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: absoluteUrl(video.poster),
    contentUrl: absoluteUrl(video.src),
    uploadDate: videoUploadDate(video.uploadDate),
    duration: video.duration,
    width: video.width,
    height: video.height,
    inLanguage: lang,
    url: absoluteUrl(path),
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
    alternateName: COMPANY.alternateNames,
    legalName: COMPANY.legalName,
    url: absoluteUrl('/'),
    logo: { '@type': 'ImageObject', url: absoluteUrl('/images/mygala-logo-email.png') },
    image: absoluteUrl('/opengraph-image.png'),
    ...(COMPANY.profiles.length ? { sameAs: COMPANY.profiles } : {}),
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
    name: COMPANY.tradeName,
    alternateName: COMPANY.alternateNames,
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
        url: absoluteUrl('/pricing'),
      },
    ],
  };
}

// Simple pages (About, Contact, legal): title, description and canonical URL.
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return marketingMetadata({ title, description }, path);
}

// A blog article: the usual marketing metadata, shared as an article with
// its own photo as the link preview instead of the site-wide image.
export function articleMetadata(seo: SeoMeta, path: string, published: string, image: { src: string; alt: string }): Metadata {
  const base = marketingMetadata(seo, path);
  const url = absoluteUrl(image.src);
  return {
    ...base,
    openGraph: { ...base.openGraph, type: 'article', publishedTime: published, images: [{ url, alt: image.alt }] },
    twitter: { ...base.twitter, images: [url] },
  };
}

// The blog index: a Blog listing every article.
export function blogJsonLd(seo: SeoMeta, path: string, posts: { title: string; path: string; published: string; image: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: seo.title,
    description: seo.description,
    url: absoluteUrl(path),
    inLanguage: 'en',
    publisher: { '@type': 'Organization', name: 'MyGala', url: absoluteUrl('/'), logo: absoluteUrl('/images/mygala-logo-email.png') },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: absoluteUrl(p.path),
      datePublished: p.published,
      image: absoluteUrl(p.image),
    })),
  };
}

// A free tool on a page (the colour palette generator).
export function webApplicationJsonLd(app: { name: string; description: string }, path: string, image: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: app.name,
    description: app.description,
    url: absoluteUrl(path),
    image: absoluteUrl(image),
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'en',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    publisher: { '@type': 'Organization', name: 'MyGala', url: absoluteUrl('/') },
  };
}

export function blogPostingJsonLd(seo: SeoMeta, headline: string, path: string, published: string, image: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description: seo.description,
    url: absoluteUrl(path),
    mainEntityOfPage: absoluteUrl(path),
    datePublished: published,
    dateModified: published,
    inLanguage: 'en',
    image: absoluteUrl(image),
    // The Organization itself is only on the homepage, so spell it out here.
    author: { '@type': 'Organization', name: 'MyGala', url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'MyGala', url: absoluteUrl('/'), logo: absoluteUrl('/images/mygala-logo-email.png') },
  };
}
