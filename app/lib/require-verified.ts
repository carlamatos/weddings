import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

// Mirrors getSuperAdmin()'s pattern (app/lib/admin.ts): a parent layout check
// doesn't protect API routes, so any sensitive route calls this itself.
export async function requireEmailVerified(): Promise<{ id: string; email: string } | null> {
  const session = await auth();
  const id = session?.user?.id;
  const email = session?.user?.email;
  if (!id || !email || !session?.user?.verifiedEmail) return null;
  return { id, email };
}

const VERIFICATION_GRACE_MS = 72 * 60 * 60 * 1000;

// Soft-verification grace period: true once an unverified account is old
// enough that the dashboard should hard-block it. There's no
// users.created_at column; the first verification token (always issued at
// signup) is used as a proxy for signup time instead of adding one.
export async function verificationGracePeriodOver(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT MIN(created_at) AS created_at FROM email_verification_tokens WHERE user_id = ${userId}
  `;
  const value = result.rows[0]?.created_at;
  if (!value) return false;
  return Date.now() - new Date(value).getTime() > VERIFICATION_GRACE_MS;
}
