import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { isRateLimited, recordAttempt } from '@/app/lib/rate-limit';
import { createToken } from '@/app/lib/tokens';
import { sendMail, resetEmailHtml } from '@/app/lib/mail';
import { siteUrl } from '@/app/lib/site-url';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;
const TTL_MS = 45 * 60 * 1000;

// Always returns the same generic response, whatever the input — no branch
// may leak whether an account exists, has a password (vs. OAuth-only), or
// hit the rate limit, or an attacker can enumerate registered emails.
const GENERIC_RESPONSE = { ok: true, message: "If that email has an account, we've sent a password reset link." };

export async function POST(request: Request) {
  let email = '';
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return NextResponse.json(GENERIC_RESPONSE);
  }
  if (!email) return NextResponse.json(GENERIC_RESPONSE);

  const key = `forgot-password:${email}`;
  if (await isRateLimited(key, MAX_PER_WINDOW)) {
    return NextResponse.json(GENERIC_RESPONSE);
  }
  await recordAttempt(key, WINDOW_MS);

  try {
    const result = await sql`SELECT id, password, given_name FROM users WHERE email = ${email}`;
    const user = result.rows[0];
    // OAuth-only accounts have no password to reset.
    if (user && user.password) {
      const token = await createToken('password_reset_tokens', user.id, TTL_MS);
      const link = `${siteUrl()}/reset-password?token=${token}`;
      await sendMail({ to: email, subject: 'Reset your password for MyGala', html: resetEmailHtml(link, user.given_name) });
    }
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
