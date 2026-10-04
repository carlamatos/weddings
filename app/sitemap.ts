import type { MetadataRoute } from 'next';
import { siteUrl } from '@/app/lib/site-url';
import { FEATURES } from '@/app/lib/marketing/features';
import { EVENT_TYPES } from '@/app/lib/marketing/events';
import { themeRegistry } from '@/app/ui/themes/registry';

// Public marketing pages only. Hosts' event pages are not listed — they are
// shared by link, not promoted.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const entry = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' | 'yearly' = 'monthly') => ({
    url: `${base}${path}`,
    changeFrequency,
    priority,
  });
  return [
    entry('/', 1, 'weekly'),
    entry('/features', 0.9),
    ...FEATURES.map((f) => entry(`/features/${f.slug}`, 0.8)),
    ...EVENT_TYPES.map((e) => entry(`/events/${e.slug}`, 0.8)),
    entry('/faq', 0.7),
    ...Object.keys(themeRegistry).map((slug) => entry(`/themes/${slug}`, 0.5)),
    entry('/about', 0.5),
    entry('/contact', 0.4),
    entry('/privacy', 0.2, 'yearly'),
    entry('/terms', 0.2, 'yearly'),
    entry('/company', 0.2, 'yearly'),
    entry('/open-source', 0.1, 'yearly'),
  ];
}
