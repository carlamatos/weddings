import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca';

const authMiddleware = NextAuth(authConfig).auth(function middleware(req: NextRequest) {
  const constructionPassword = process.env.CONSTRUCTION_PASSWORD;
  const { pathname } = req.nextUrl;
  if (constructionPassword && pathname !== '/construction') {
    const bypass = req.cookies.get('site_bypass')?.value;
    if (bypass !== constructionPassword) {
      return NextResponse.rewrite(new URL('/construction', req.url));
    }
  }
}) as (req: NextRequest) => Promise<NextResponse>;

export default function middleware(req: NextRequest) {
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

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
