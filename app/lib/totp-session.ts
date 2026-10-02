// Whether a signed-in session still owes its 2FA code. Plain data only (no
// DB, no crypto) so both the proxy (auth.config.ts) and auth.ts can use it.
//
// totpRequired is written into the JWT at sign-in from the account's
// totp_enabled_at; totpVerifiedAt is written by auth.ts's jwt() callback
// only when /api/auth/2fa/verify hands it a server-signed proof.

export const TOTP_VERIFIED_TTL_MS = 24 * 60 * 60 * 1000;

export function isTotpPending(token: { totpRequired?: boolean; totpVerified?: boolean; totpVerifiedAt?: number } | null | undefined): boolean {
  if (!token?.totpRequired) return false;
  const verified = !!token.totpVerified && !!token.totpVerifiedAt && Date.now() - token.totpVerifiedAt < TOTP_VERIFIED_TTL_MS;
  return !verified;
}
