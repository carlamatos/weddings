import { createHmac, timingSafeEqual } from 'crypto';
import { siteUrl } from './site-url';

// Private, per-participant links to a Gift Exchange draw result
// (/secret-santa?p=<id>&t=<signature>). Sent by email or as a text from the
// host's phone, so the message itself doesn't name the giftee. The "gift:"
// prefix keeps these signatures distinct from other tokens using AUTH_SECRET.
const SECRET = process.env.AUTH_SECRET ?? '';

function sign(participantId: number): string {
  return createHmac('sha256', SECRET).update(`gift:${participantId}`).digest('hex');
}

export function giftRevealUrl(participantId: number): string {
  return `${siteUrl()}/secret-santa?p=${participantId}&t=${sign(participantId)}`;
}

// The participant id when the link is genuine, else null.
export function verifyGiftLink(p: string | null | undefined, t: string | null | undefined): number | null {
  if (!p || !t || !/^\d{1,10}$/.test(p) || !/^[0-9a-f]{64}$/i.test(t) || !SECRET) return null;
  const id = Number(p);
  const expected = Buffer.from(sign(id), 'hex');
  const given = Buffer.from(t, 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given) ? id : null;
}
