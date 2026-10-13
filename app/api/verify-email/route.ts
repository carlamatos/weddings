import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { consumeToken } from '@/app/lib/tokens';
import { sendWelcomeEmail } from '@/app/lib/welcome-email';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token') ?? '';

  const userId = await consumeToken('email_verification_tokens', token);
  if (!userId) {
    return NextResponse.redirect(new URL('/verify-email-pending?error=invalid', origin));
  }

  // RETURNING only yields a row the first time, so the welcome email goes out once.
  const verified = await sql`UPDATE users SET email_verified_at = NOW() WHERE id = ${userId} AND email_verified_at IS NULL RETURNING id`;
  if (verified.rows[0]) await sendWelcomeEmail(userId);
  return NextResponse.redirect(new URL('/email-verified', origin));
}
