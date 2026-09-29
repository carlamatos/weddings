import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { consumeToken } from '@/app/lib/tokens';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token') ?? '';

  const userId = await consumeToken('email_verification_tokens', token);
  if (!userId) {
    return NextResponse.redirect(new URL('/verify-email-pending?error=invalid', origin));
  }

  await sql`UPDATE users SET email_verified_at = NOW() WHERE id = ${userId} AND email_verified_at IS NULL`;
  return NextResponse.redirect(new URL('/email-verified', origin));
}
