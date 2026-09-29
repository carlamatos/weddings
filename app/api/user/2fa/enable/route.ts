import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { isRateLimited, recordAttempt } from '@/app/lib/rate-limit';
import { decryptSecret, verifyTotp, generateBackupCodes, hashBackupCode } from '@/app/lib/totp';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // Shared bucket with disable/login-verify — all three are "guess a code
  // for this account" surfaces.
  const key = `2fa-verify:${userId}`;
  if (await isRateLimited(key, MAX_ATTEMPTS)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }
  await recordAttempt(key, WINDOW_MS);

  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token.trim() : '';

  const result = await sql`SELECT totp_secret, totp_enabled_at FROM users WHERE id = ${userId}`;
  const user = result.rows[0];
  if (!user?.totp_secret) {
    return NextResponse.json({ error: 'Start setup again before enabling.' }, { status: 400 });
  }
  if (user.totp_enabled_at) {
    return NextResponse.json({ error: 'Two-factor authentication is already enabled.' }, { status: 400 });
  }

  const secret = decryptSecret(user.totp_secret);
  const valid = await verifyTotp(secret, token);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
  }

  const backupCodes = generateBackupCodes();
  await sql`UPDATE users SET totp_enabled_at = NOW() WHERE id = ${userId}`;
  await sql`DELETE FROM totp_backup_codes WHERE user_id = ${userId}`;
  for (const code of backupCodes) {
    await sql`INSERT INTO totp_backup_codes (user_id, code_hash) VALUES (${userId}, ${hashBackupCode(code)})`;
  }

  return NextResponse.json({ ok: true, backupCodes });
}
