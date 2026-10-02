import { sql } from '@vercel/postgres';

// Changing a password (or an OAuth sign-in claiming an unverified account)
// sets users.password_changed_at; every session that signed in before then
// is treated as signed out — on every device.

// Sessions signed in this soon before the change survive it (clock skew
// between the app and the database).
const GRACE_MS = 5000;

export function signedInBefore(signedInAt: number | undefined, passwordChangedAt: unknown): boolean {
  if (!passwordChangedAt) return false;
  const changed = new Date(passwordChangedAt as string).getTime();
  if (!Number.isFinite(changed)) return false;
  return (signedInAt ?? 0) + GRACE_MS < changed;
}

// For the proxy, which only has the token: looks the account up by email.
// Fails open (not revoked) if the column doesn't exist yet — run
// POST /api/migrate after deploying.
export async function isSessionRevoked(email: string | null | undefined, signedInAt: number | undefined): Promise<boolean> {
  if (!email) return false;
  try {
    const result = await sql`SELECT password_changed_at FROM users WHERE email = ${email} LIMIT 1`;
    return signedInBefore(signedInAt, result.rows[0]?.password_changed_at);
  } catch {
    return false;
  }
}

// Records a password change. Separate from the password UPDATE so a missing
// column (migration not run yet) never blocks the change itself.
export async function markPasswordChanged(where: { userId: string } | { email: string }): Promise<void> {
  try {
    if ('userId' in where) await sql`UPDATE users SET password_changed_at = NOW() WHERE id = ${where.userId}`;
    else await sql`UPDATE users SET password_changed_at = NOW() WHERE email = ${where.email}`;
  } catch (error) {
    console.error('Could not record password change (has /api/migrate run?):', error);
  }
}
