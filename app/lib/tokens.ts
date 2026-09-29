import crypto from 'crypto';
import { sql } from '@vercel/postgres';

// The table name is always one of these two literals from our own call
// sites, never attacker input, so interpolating it into the query text below
// is safe (there's no way to parameterize a table name with $1 anyway).
type TokenTable = 'email_verification_tokens' | 'password_reset_tokens';

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// Random, single-use, expiring, revocable tokens — deliberately not the
// HMAC-signed opaque tokens used for page ids (page-token.ts), which have no
// expiry or revocation and aren't a fit for verification/reset links.
export async function createToken(table: TokenTable, userId: string, ttlMs: number): Promise<string> {
  const raw = crypto.randomBytes(32).toString('base64url');
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  await sql.query(
    `INSERT INTO ${table} (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hash, expiresAt],
  );
  return raw;
}

// Atomically checks validity and marks the token used in one statement, so
// two concurrent requests with the same token can't both succeed.
export async function consumeToken(table: TokenTable, rawToken: string): Promise<string | null> {
  if (!rawToken) return null;
  const hash = hashToken(rawToken);
  const result = await sql.query<{ user_id: string }>(
    `UPDATE ${table}
     SET used_at = NOW()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
     RETURNING user_id`,
    [hash],
  );
  return result.rows[0]?.user_id ?? null;
}

export async function invalidateTokens(table: TokenTable, userId: string): Promise<void> {
  await sql.query(
    `UPDATE ${table} SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );
}
