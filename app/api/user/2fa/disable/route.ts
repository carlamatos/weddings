import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { isRateLimited, recordAttempt } from '@/app/lib/rate-limit';
import { decryptSecret, verifyTotp, hashBackupCode } from '@/app/lib/totp';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

// Requires a valid TOTP code or an unused backup code — never a password
// fallback. OAuth-only accounts have no password, and disabling 2FA must be
// at least as strong a proof as enabling it was.
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const key = `2fa-verify:${userId}`;
  if (await isRateLimited(key, MAX_ATTEMPTS)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }
  await recordAttempt(key, WINDOW_MS);

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  const result = await sql`SELECT totp_secret, totp_enabled_at FROM users WHERE id = ${userId}`;
  const user = result.rows[0];
  if (!user?.totp_enabled_at) {
    return NextResponse.json({ error: 'Two-factor authentication is not enabled.' }, { status: 400 });
  }

  let valid = false;
  if (/^\d{6}$/.test(code)) {
    valid = await verifyTotp(decryptSecret(user.totp_secret), code);
  }
  if (!valid) {
    const backupResult = await sql`
      UPDATE totp_backup_codes SET used_at = NOW()
      WHERE user_id = ${userId} AND code_hash = ${hashBackupCode(code)} AND used_at IS NULL
      RETURNING id
    `;
    valid = (backupResult.rowCount ?? 0) > 0;
  }
  if (!valid) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
  }

  await sql`UPDATE users SET totp_secret = NULL, totp_enabled_at = NULL WHERE id = ${userId}`;
  await sql`DELETE FROM totp_backup_codes WHERE user_id = ${userId}`;

  return NextResponse.json({ ok: true });
}
