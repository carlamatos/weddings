import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca';

export default NextAuth(authConfig).auth(function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';

  const isCustomDomain =
    !host.includes('localhost') &&
    !host.endsWith('.vercel.app') &&
    !host.includes(rootDomain);

  if (isCustomDomain) {
    const url = req.nextUrl.clone();
    url.pathname = `/site/${host}`;
    return NextResponse.rewrite(url);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};