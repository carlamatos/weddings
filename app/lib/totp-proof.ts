import { createHmac, timingSafeEqual } from 'crypto';

// A short-lived, server-signed "this session just passed 2FA" proof.
//
// The 2FA verify route marks the session as verified through Auth.js's
// session update, but browsers can send session updates too (POST
// /api/auth/session). So the jwt() callback only accepts the flag together
// with a proof that only the server can mint (HMAC with AUTH_SECRET), bound
// to the account's email and valid for one minute.

const SECRET = process.env.AUTH_SECRET ?? '';
const MAX_AGE_MS = 60 * 1000;

// 'verified': this session just passed 2FA (or turned it on with a valid
// code). 'disabled': the account just turned 2FA off.
export type TotpProofState = 'verified' | 'disabled';

function sign(email: string, issuedAt: number, state: TotpProofState): string {
  return createHmac('sha256', SECRET).update(`totp-${state}|${email.toLowerCase()}|${issuedAt}`).digest('hex');
}

export function createTotpProof(email: string, state: TotpProofState): string {
  const issuedAt = Date.now();
  return `${issuedAt}.${sign(email, issuedAt, state)}`;
}

export function verifyTotpProof(email: string | null | undefined, proof: unknown, state: TotpProofState): boolean {
  if (!SECRET || !email || typeof proof !== 'string') return false;
  const dot = proof.indexOf('.');
  const issuedAt = Number(proof.slice(0, dot));
  const sig = proof.slice(dot + 1);
  if (dot < 1 || !Number.isFinite(issuedAt) || Math.abs(Date.now() - issuedAt) > MAX_AGE_MS) return false;
  const expected = Buffer.from(sign(email, issuedAt, state), 'hex');
  const given = Buffer.from(sig, 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given);
}
