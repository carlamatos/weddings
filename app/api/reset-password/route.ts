import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { consumeToken, invalidateTokens } from '@/app/lib/tokens';
import { ResetPasswordSchema } from '@/app/lib/password-schema';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ResetPasswordSchema.safeParse({
    password: body?.password,
    confirmPassword: body?.confirmPassword,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors.password?.[0] ?? parsed.error.flatten().fieldErrors.confirmPassword?.[0] ?? 'Invalid password.' },
      { status: 400 },
    );
  }

  const token = typeof body?.token === 'string' ? body.token : '';
  const userId = await consumeToken('password_reset_tokens', token);
  if (!userId) {
    return NextResponse.json({ error: 'This link is invalid or has expired. Request a new one.' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  // A successful reset proves control of the inbox, so grandfather in email
  // verification too if it wasn't done yet.
  await sql`
    UPDATE users
    SET password = ${hashedPassword}, email_verified_at = COALESCE(email_verified_at, NOW())
    WHERE id = ${userId}
  `;

  // The token that got us here is already marked used by consumeToken; also
  // invalidate any other outstanding reset tokens for this account so an
  // older, still-valid link can't be used after the password has changed.
  await invalidateTokens('password_reset_tokens', userId);

  return NextResponse.json({ ok: true });
}
