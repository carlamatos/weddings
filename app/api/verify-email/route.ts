import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { consumeToken } from '@/app/lib/tokens';
import { sendWelcomeEmail } from '@/app/lib/welcome-email';
import { DASH_LANG_COOKIE, isDashLang } from '@/app/lib/dash-text/langs';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token') ?? '';
  // The sign-up page's language, carried by the link (fr or es; else English).
  const param = searchParams.get('lang');
  const lang = param === 'fr' || param === 'es' ? param : 'en';

  const userId = await consumeToken('email_verification_tokens', token);
  if (!userId) {
    return NextResponse.redirect(new URL('/verify-email-pending?error=invalid', origin));
  }

  // RETURNING only yields a row the first time, so the welcome email goes out once.
  const verified = await sql`UPDATE users SET email_verified_at = NOW() WHERE id = ${userId} AND email_verified_at IS NULL RETURNING id`;
  if (verified.rows[0]) await sendWelcomeEmail(userId, lang);
  const response = NextResponse.redirect(new URL(lang === 'en' ? '/email-verified' : `/email-verified?lang=${lang}`, origin));
  // Opened on another device: start its dashboard in the same language too,
  // unless that browser already chose one.
  const saved = request.headers.get('cookie')?.match(new RegExp(`(?:^|; )${DASH_LANG_COOKIE}=([^;]*)`))?.[1];
  if (lang !== 'en' && !isDashLang(saved)) {
    response.cookies.set(DASH_LANG_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  return response;
}
