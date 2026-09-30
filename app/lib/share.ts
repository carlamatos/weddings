import type { Metadata } from 'next';
import type { UserPage } from './definitions';
import { siteUrl } from './site-url';
import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';

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

// Metadata for a public event page (slug route and custom-domain route alike).
export function eventPageMetadata(page: UserPage): Metadata {
  if (page.status === 'inactive') return { robots: { index: false, follow: false } };
  const title = page.heading || 'MyGala';
  const description = plainDescription(page)?.slice(0, 140);
  const url = publicPageUrl(page);
  const image = { url: socialImageFor(page), alt: title };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'MyGala',
      title,
      description,
      url,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
