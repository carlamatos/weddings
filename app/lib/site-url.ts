// Absolute origin for links sent outside the request/response cycle (emails).
// Vercel doesn't put the custom production domain in an obvious single env
// var, so prefer an explicit override, then the stable production URL Vercel
// provides, then the per-deployment URL, then localhost for `next dev`.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
