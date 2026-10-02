import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { verifyPageToken } from '@/app/lib/page-token';
import { fetchPageSettings } from '@/app/lib/data';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { PAGE_ACCESS_MAX_AGE, PAGE_PASSWORD_MAX, pageAccessCookieName, pageAccessValue } from '@/app/lib/page-password';

const WINDOW_MS = 15 * 60 * 1000;

// A guest unlocks a password-protected event page. On success the page's
// access cookie is set for this host (mygala.ca or the page's own domain).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = verifyPageToken(typeof body?.token === 'string' ? body.token : null);
  const password = typeof body?.password === 'string' ? body.password.slice(0, PAGE_PASSWORD_MAX) : '';
  if (pageId === null) return NextResponse.json({ error: 'Page not found.' }, { status: 404 });

  // Guessing guard, per visitor and per page.
  if (
    (await overRateLimit(`page-password:${clientIp(request.headers)}`, 10, WINDOW_MS)) ||
    (await overRateLimit(`page-password-page:${pageId}`, 100, WINDOW_MS))
  ) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }

  const settings = await fetchPageSettings(pageId);
  const hash = settings['page_password_hash'];
  if (!hash || !password || !(await bcrypt.compare(password, hash))) {
    return NextResponse.json({ error: 'wrong' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(pageAccessCookieName(pageId), pageAccessValue(pageId, hash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: PAGE_ACCESS_MAX_AGE,
  });
  return res;
}
