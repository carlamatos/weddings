import { sql } from '@vercel/postgres';

// Single Postgres-backed limiter, replacing the two separate in-memory Maps
// that used to live here and in auth.ts. In-memory state doesn't survive
// serverless cold starts (close to useless under real traffic), and this
// file is now shared by every security-sensitive endpoint — login, resend
// verification, forgot password, 2FA verify — not just the login form.
//
// Callers own their own key namespace (e.g. `login:${ip}`,
// `verify-email:${email}`, `2fa:${userId}`) so different features never
// collide or share a budget.

// Read-only: does NOT increment. Callers that want a friendly early message
// (e.g. "too many attempts") check this before doing any work; the actual
// increment happens once, at the real enforcement point (see recordAttempt).
export async function isRateLimited(key: string, limit: number): Promise<boolean> {
  const result = await sql`
    SELECT count FROM rate_limits WHERE rl_key = ${key} AND reset_at > NOW()
  `;
  const count = result.rows[0]?.count ?? 0;
  return count >= limit;
}

// Increments the counter for `key`, starting a fresh window if the previous
// one (or none) has expired. Safe to call without a prior isRateLimited
// check — expiry is re-evaluated here too, so a stale row always resets
// correctly rather than accumulating forever.
export async function recordAttempt(key: string, windowMs: number): Promise<void> {
  const resetAt = new Date(Date.now() + windowMs).toISOString();
  await sql.query(
    `INSERT INTO rate_limits (rl_key, count, reset_at)
     VALUES ($1, 1, $2)
     ON CONFLICT (rl_key) DO UPDATE SET
       count = CASE WHEN rate_limits.reset_at < NOW() THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at < NOW() THEN $2::timestamptz ELSE rate_limits.reset_at END`,
    [key, resetAt],
  );
  await pruneExpiredRateLimits();
}

export async function clearRateLimit(key: string): Promise<void> {
  await sql`DELETE FROM rate_limits WHERE rl_key = ${key}`;
}

// Table hygiene, not correctness — long-expired rows are harmless but there's
// no cron job in this app, so sweep them opportunistically instead.
async function pruneExpiredRateLimits(): Promise<void> {
  await sql`DELETE FROM rate_limits WHERE reset_at < NOW() - INTERVAL '1 day'`;
}

// Count one attempt against `key` and say whether the caller is over the
// limit — for public forms where every request counts (RSVP, contact, …).
export async function overRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (await isRateLimited(key, limit)) return true;
  await recordAttempt(key, windowMs);
  return false;
}

// The visitor's IP. On Vercel the first x-forwarded-for entry is set by the
// platform, not the client.
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown';
}
