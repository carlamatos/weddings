import type { Metadata } from 'next';
import type { UserPage } from './definitions';
import { siteUrl } from './site-url';
import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';
import { isPageOffline } from './page-status';
import { getTranslations } from './translations';
import { formatDateRange } from '@/app/ui/themes/event-when';

// Social networks can't render a video or an SVG as a link-preview card, so
// those fall through to the next candidate.
export function isCardImage(url: string | null | undefined): url is string {
  return !!url && !/\.(mp4|webm|mov|m4v|ogg|svg)(\?|#|$)/i.test(url);
}

function absolute(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${siteUrl()}${url.startsWith('/') ? '' : '/'}${url}`;
}

// The image a link to this page shows on social media: the owner's top banner,
// else the theme's default banner, else the MyGala card. Theme defaults come
// back as site paths ("/images/..."), for use on this site's own pages.
export function socialImagePathFor(page: Pick<UserPage, 'banner_image' | 'theme_slug'>): string {
  const themeDefault = page.theme_slug
    ? (HERO_DEFAULTS as Record<string, string>)[page.theme_slug]
    : undefined;
  return [page.banner_image, themeDefault].find(isCardImage) ?? '/opengraph-image.png';
}

// Absolute version for Open Graph tags, which crawlers fetch from outside.
export function socialImageFor(page: Pick<UserPage, 'banner_image' | 'theme_slug'>): string {
  return absolute(socialImagePathFor(page));
}

// The link-preview card: the banner cropped to 1200×630 and kept small
// (/api/og/[slug]), so every network shows it. ?v= changes with the banner,
// so networks and the CDN fetch the new one instead of a cached copy.
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

function shortHash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function socialCardImageFor(page: Pick<UserPage, 'slug' | 'banner_image' | 'theme_slug'>): string {
  return `${siteUrl()}/api/og/${encodeURIComponent(page.slug)}?v=${shortHash(socialImagePathFor(page))}`;
}

const OG_LOCALES: Record<string, string> = { en: 'en_CA', fr: 'fr_CA', es: 'es_ES' };

// "Saturday, September 25, 2027 · Cedar Hollow Lodge, Muskoka, ON" — the
// when and where, in the page's language, for the preview's description.
function whenAndWhere(page: UserPage): string {
  const t = getTranslations(page.language);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(page.event_date ?? '')
    ? formatDateRange(page.event_date, page.event_end_date, t.dateLocale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const place = page.location === 'virtual'
    ? ''
    : [page.venue_name, page.city, page.country].filter(Boolean).join(', ');
  return [date, place].filter(Boolean).join(' · ');
}

// The public URL guests should be sent to. A paid page with a verified custom
// domain shares that; everything else shares the MyGala slug URL.
export function publicPageUrl(
  page: Pick<UserPage, 'slug' | 'plan_type' | 'custom_domain' | 'domain_status'>,
): string {
  if (page.plan_type === 'paid' && page.custom_domain && page.domain_status === 'active') {
    return `https://${page.custom_domain}`;
  }
  return `${siteUrl()}/${page.slug}`;
}

export function plainDescription(page: Pick<UserPage, 'description'>): string | undefined {
  const text = page.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, 200) : undefined;
}

// Metadata for a public event page (slug route and custom-domain route alike):
// what a shared link shows — the banner, the event name, when and where, and
// the start of the story.
export function eventPageMetadata(page: UserPage): Metadata {
  if (isPageOffline(page.status)) return { robots: { index: false, follow: false } };
  const title = page.heading || 'MyGala';
  const summary = whenAndWhere(page);
  const story = plainDescription(page);
  const description = clip([summary, story].filter(Boolean).join(' — ') || 'You’re invited! Open the link for all the details.', 200);
  const url = publicPageUrl(page);
  const image = { url: socialCardImageFor(page), secureUrl: socialCardImageFor(page), width: OG_WIDTH, height: OG_HEIGHT, type: 'image/jpeg', alt: title };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'MyGala',
      locale: OG_LOCALES[page.language ?? 'en'] ?? OG_LOCALES.en,
      title,
      description,
      url,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: image.url, alt: title }],
    },
  };
}

// Cut at a word, for a preview that ends cleanly.
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max - 1)).replace(/[,.;:—–\s]+$/, '') + '…';
}

// Hosts can keep their event page out of search engines and AI answers
// (Share screen). New pages start hidden until the host ticks "Show this
// page in search results"; older pages without the setting stay listed.
// Crawlers that honour robots meta tags — Google, Bing and the AI
// assistants built on them — then skip the page.
export function isHiddenFromSearch(settings: Record<string, string>): boolean {
  return settings['show_in_search'] === 'false';
}

export function withSearchVisibility(meta: Metadata, settings: Record<string, string>): Metadata {
  if (!isHiddenFromSearch(settings)) return meta;
  return {
    ...meta,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  };
}
