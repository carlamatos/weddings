import type { MetadataRoute } from 'next';
import { siteUrl } from '@/app/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    // /api/og/ holds the event pages' link-preview images, which X and
    // other preview bots only fetch when robots.txt allows them.
    rules: { userAgent: '*', allow: ['/', '/api/og/'], disallow: ['/dashboard', '/admin', '/api/'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
