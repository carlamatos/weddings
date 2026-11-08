// Top-level paths the site uses itself (mygala.ca/faq, /features, …): an
// event page with one of these addresses would be hidden behind the site's
// own page, so they can't be claimed. Shared by page creation and the setup
// form's availability check.
export const RESERVED_SLUGS = new Set([
  'about', 'admin', 'api', 'blog', 'check-email', 'christmas-invitations', 'construction', 'contact', 'dashboard', 'design-your-christmas-invitation', 'design-your-invitation', 'design-your-party-invitation', 'design-your-wedding-invitation', 'email-verified', 'events',
  'faq', 'features', 'forgot-password', 'fr', 'guest-count-planner', 'help', 'how-to-create-a-wedding-website', 'login', 'party-celebrations', 'pricing', 'privacy', 'register', 'reset-password', 'robots.txt', 'rsvp-deadline-calculator',
  'site', 'sitemap.xml', 'terms', 'theme-preview', 'themes', 'tools', 'unsubscribe', 'verify-2fa', 'verify-email-pending', 'wedding-budget-calculator', 'wedding-colour-palette', 'wedding-website',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}
