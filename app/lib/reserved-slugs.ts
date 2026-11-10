// Top-level paths the site uses itself (mygala.ca/faq, /features, …): an
// event page with one of these addresses would be hidden behind the site's
// own page, so they can't be claimed. Shared by page creation and the setup
// form's availability check.
export const RESERVED_SLUGS = new Set([
  'about', 'admin', 'api', 'blog', 'check-email', 'christmas-invitations', 'company', 'construction', 'contact', 'dashboard', 'design-your-christmas-invitation', 'design-your-invitation', 'design-your-party-invitation', 'design-your-wedding-invitation', 'email-verified', 'es', 'events',
  'faq', 'features', 'forgot-password', 'fr', 'guest-count-planner', 'help', 'how-to-create-a-wedding-website', 'login', 'open-source', 'party-celebrations', 'pricing', 'privacy', 'register', 'reset-password', 'robots.txt', 'rsvp-deadline-calculator',
  'secret-santa', 'site', 'sitemap.xml', 'terms', 'theme-preview', 'themes', 'tools', 'unsubscribe', 'verify-2fa', 'verify-email-pending', 'wedding-budget-calculator', 'wedding-colour-palette', 'wedding-website',
  // Folders in public/.
  'customers', 'images', 'uploads', 'videos',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}
