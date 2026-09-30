import { createHmac, timingSafeEqual } from 'crypto';
import { siteUrl } from './site-url';

// Signed, per-guest unsubscribe links for reminder/update emails. The
// "unsubscribe:" prefix keeps these signatures distinct from page tokens
// (app/lib/page-token.ts) even though both use AUTH_SECRET.
const SECRET = process.env.AUTH_SECRET ?? '';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sign(guestId: string): string {
  return createHmac('sha256', SECRET).update(`unsubscribe:${guestId}`).digest('hex');
}

// Page link for the email footer (asks the guest to confirm).
export function unsubscribeUrl(guestId: string): string {
  return `${siteUrl()}/unsubscribe?g=${guestId}&t=${sign(guestId)}`;
}

// Endpoint for the List-Unsubscribe header (mail apps POST to it directly).
export function oneClickUnsubscribeUrl(guestId: string): string {
  return `${siteUrl()}/api/unsubscribe?g=${guestId}&t=${sign(guestId)}`;
}

// The guest id when the token is genuine, else null.
export function verifyUnsubscribe(guestId: string | null, token: string | null): string | null {
  if (!guestId || !token || !UUID_RE.test(guestId) || !/^[0-9a-f]{64}$/i.test(token)) return null;
  const expected = Buffer.from(sign(guestId), 'hex');
  const given = Buffer.from(token, 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given) ? guestId : null;
}
