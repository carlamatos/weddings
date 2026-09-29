import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { isRateLimited, recordAttempt } from '@/app/lib/rate-limit';
import { createToken } from '@/app/lib/tokens';
import { sendMail, verificationEmailHtml } from '@/app/lib/mail';
import { siteUrl } from '@/app/lib/site-url';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;
const TTL_MS = 48 * 60 * 60 * 1000;

// Only reachable by a signed-in user (the resend button lives in the
// dashboard) — there's no anonymous "enter your email" form, so unlike
// forgot-password there's no account-existence question to keep generic.
export async function POST() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ ok: true });

  const key = `verify-email:${email.toLowerCase()}`;
  if (await isRateLimited(key, MAX_PER_WINDOW)) {
    return NextResponse.json({ ok: true });
  }
  await recordAttempt(key, WINDOW_MS);

  try {
    const result = await sql`SELECT id, email_verified_at FROM users WHERE email = ${email}`;
    const user = result.rows[0];
    if (user && !user.email_verified_at) {
      const token = await createToken('email_verification_tokens', user.id, TTL_MS);
      const link = `${siteUrl()}/api/verify-email?token=${token}`;
      await sendMail({ to: email, subject: 'Confirm your email address', html: verificationEmailHtml(link) });
    }
  } catch (error) {
    console.error('Failed to resend verification email:', error);
  }

  return NextResponse.json({ ok: true });
}
