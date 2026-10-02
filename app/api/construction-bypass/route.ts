import { NextResponse } from 'next/server';
import { timingSafeStringEqual } from '@/app/lib/timing-safe-equal';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { sharedCookieDomain } from '@/app/lib/app-url';

export async function POST(req: Request) {
  // Stops the preview password being guessed.
  if (await overRateLimit(`construction:${clientIp(req.headers)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }
  const { password } = await req.json().catch(() => ({}));
  const correct = process.env.CONSTRUCTION_PASSWORD;

  if (!correct || typeof password !== 'string' || !timingSafeStringEqual(password, correct)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('site_bypass', correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    // Shared with app.mygala.ca so the password is only asked once.
    domain: sharedCookieDomain(),
  });
  return res;
}
