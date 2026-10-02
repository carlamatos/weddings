// Top-level paths the site uses itself (mygala.ca/faq, /features, …): an
// event page with one of these addresses would be hidden behind the site's
// own page, so they can't be claimed. Shared by page creation and the setup
// form's availability check.
export const RESERVED_SLUGS = new Set([
  'about', 'admin', 'api', 'check-email', 'construction', 'contact', 'dashboard', 'email-verified', 'events',
  'faq', 'features', 'forgot-password', 'login', 'pricing', 'privacy', 'register', 'reset-password', 'robots.txt',
  'site', 'sitemap.xml', 'terms', 'themes', 'unsubscribe', 'verify-2fa', 'verify-email-pending',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}
