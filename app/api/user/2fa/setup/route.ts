import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { auth } from '@/auth';
import { isRateLimited, recordAttempt } from '@/app/lib/rate-limit';
import { generateSecret, totpUri, qrCodeDataUrl, encryptSecret } from '@/app/lib/totp';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const key = `2fa-setup:${userId}`;
  if (await isRateLimited(key, MAX_ATTEMPTS)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }
  await recordAttempt(key, WINDOW_MS);

  const result = await sql`SELECT password, totp_enabled_at FROM users WHERE id = ${userId}`;
  const user = result.rows[0];
  if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  if (user.totp_enabled_at) {
    return NextResponse.json(
      { error: 'Two-factor authentication is already enabled. Disable it first to set up a new device.' },
      { status: 400 },
    );
  }

  // Fresh credential check: a hijacked session shouldn't be able to
  // silently set up 2FA on attacker-controlled hardware and lock the real
  // owner out. OAuth-only accounts (no password) skip this — same trust
  // level as their normal sign-in.
  if (user.password) {
    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }
  }

  const secret = generateSecret();
  const uri = totpUri(secret, email);
  const qrCode = await qrCodeDataUrl(uri);
  await sql`UPDATE users SET totp_secret = ${encryptSecret(secret)} WHERE id = ${userId}`;

  return NextResponse.json({ qrCode, secret });
}
