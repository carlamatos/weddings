import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca';

const authMiddleware = NextAuth(authConfig).auth as unknown as (req: NextRequest) => Promise<NextResponse>;

export default function proxy(req: NextRequest) {
  const rawHost = req.headers.get('host') ?? '';
  // Normalize: strip www. so matosweb.ca and www.matosweb.ca match the same record
  const host = rawHost.replace(/^www\./, '');

  const isCustomDomain =
    !host.includes('localhost') &&
    !host.endsWith('.vercel.app') &&
    !host.includes(rootDomain);

  // Custom domain pages are public — bypass NextAuth entirely
  if (isCustomDomain) {
    return NextResponse.rewrite(new URL(`/site/${host}`, req.url));
  }

  // All other routes go through NextAuth
  return authMiddleware(req);
}

// Static files in public/ must skip the proxy: the auth callback redirects
// signed-in users with no page yet to /dashboard/setup (which would turn every
// image request on the setup screen into an HTML redirect), and custom-domain
// requests would otherwise rewrite /images/... to /site/<host>.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|mov|m4v|woff2?|ttf|otf|txt|xml|webmanifest)$).*)'],
};
