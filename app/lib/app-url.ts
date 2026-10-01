// The dashboard, sign-in and admin screens can live on their own subdomain
// (app.mygala.ca) while the homepage, marketing pages and event pages stay
// on the main domain (mygala.ca/yourname). The split is on only when both
// NEXT_PUBLIC_APP_URL and NEXT_PUBLIC_SITE_URL are set (production); without
// them — local dev, preview deploys — everything is served from one host and
// these helpers return plain paths. No server-only imports: client
// components use these too.

const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

export const isSplitHost = !!APP_ORIGIN && !!SITE_ORIGIN && APP_ORIGIN !== SITE_ORIGIN;

// Path prefixes served from the app subdomain. Everything else (and /api,
// which both hosts serve) belongs to the main domain.
const APP_PATH_PREFIXES = [
  '/dashboard',
  '/admin',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/check-email',
  '/email-verified',
  '/verify-email-pending',
  '/verify-2fa',
];

export function isAppPath(pathname: string): boolean {
  return APP_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// A link to an app screen from a main-domain page (e.g. "Log in", "Dashboard").
export function appHref(path: string): string {
  return isSplitHost ? `${APP_ORIGIN}${path}` : path;
}

// A link to a main-domain page from an app screen (e.g. the logo, an event page).
export function siteHref(path: string): string {
  return isSplitHost ? `${SITE_ORIGIN}${path}` : path;
}

export function appOrigin(): string {
  return APP_ORIGIN;
}

export function siteOrigin(): string {
  return SITE_ORIGIN;
}

// The registrable domain both hosts share (mygala.ca), so the sign-in
// cookie is sent to both. Undefined when the split is off.
export function sharedCookieDomain(): string | undefined {
  if (!isSplitHost) return undefined;
  try {
    return new URL(SITE_ORIGIN).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}
