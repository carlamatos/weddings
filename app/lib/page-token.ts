import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.AUTH_SECRET ?? '';

// Opaque, unforgeable reference to a user_page row, safe to expose to
// anonymous visitors. Prevents enumerating every page on the platform by
// guessing sequential ids — a valid token can only be minted server-side
// while rendering that specific page.
export function signPageId(id: number | string): string {
  const idStr = String(id);
  const sig = createHmac('sha256', SECRET).update(idStr).digest('hex');
  return `${idStr}.${sig}`;
}

export function verifyPageToken(token: string | null | undefined): number | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const idStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(idStr)) return null;

  const expected = createHmac('sha256', SECRET).update(idStr).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const sigBuf = Buffer.from(sig, 'hex');
  if (expectedBuf.length !== sigBuf.length || !timingSafeEqual(expectedBuf, sigBuf)) {
    return null;
  }

  return Number(idStr);
}
