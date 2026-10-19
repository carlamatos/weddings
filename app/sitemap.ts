import type { MetadataRoute } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import { FEATURES } from '@/app/lib/marketing/features';
import { EVENT_TYPES } from '@/app/lib/marketing/events';
import { LANDING_PAGES } from '@/app/lib/marketing/landing';
import { BLOG_POSTS } from '@/app/lib/marketing/blog';
import { themeRegistry } from '@/app/ui/themes/registry';

// The sitemap is generated once per deploy, and every listed page is
// built from the code being deployed — so the deploy time is an honest
// last-modified date for them. Blog articles use their publish date.
const DEPLOYED_AT = new Date();

// Public marketing pages only. Hosts' event pages are not listed — they are
// shared by link, not promoted.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const entry = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' | 'yearly' = 'monthly', lastModified = DEPLOYED_AT) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    entry('/', 1, 'weekly'),
    entry('/features', 0.9),
    ...FEATURES.map((f) => entry(`/features/${f.slug}`, 0.8)),
    ...EVENT_TYPES.map((e) => entry(`/events/${e.slug}`, 0.8)),
    ...LANDING_PAGES.map((p) => entry(`/events/${p.slug}/start`, 0.8)),
    entry('/fr/mariage', 0.8),
    entry('/faq', 0.7),
    // Articles carry their publish date; the blog index changes when the newest one is published.
    entry('/blog', 0.6, 'weekly', new Date(Math.max(...BLOG_POSTS.map((p) => Date.parse(p.published))))),
    ...BLOG_POSTS.map((p) => entry(`/blog/${p.slug}`, 0.6, 'monthly', new Date(p.published))),
    ...Object.keys(themeRegistry).map((slug) => entry(`/themes/${slug}`, 0.5)),
    entry('/about', 0.5),
    entry('/contact', 0.4),
    entry('/privacy', 0.2, 'yearly'),
    entry('/terms', 0.2, 'yearly'),
    entry('/company', 0.2, 'yearly'),
    entry('/open-source', 0.1, 'yearly'),
  ];
}
