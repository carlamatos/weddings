import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth, unstable_update } from '@/auth';
import { isRateLimited, recordAttempt } from '@/app/lib/rate-limit';
import { decryptSecret, verifyTotp, hashBackupCode } from '@/app/lib/totp';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // Shared bucket with the setup/disable code-guessing surfaces.
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
    return NextResponse.json({ error: 'Two-factor authentication is not enabled for this account.' }, { status: 400 });
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

  // Writes straight into the JWT via auth.ts's jwt() callback (trigger ===
  // 'update') — no DB write needed for this per-session flag.
  await unstable_update({ user: { totpVerified: true } });

  return NextResponse.json({ ok: true });
}
