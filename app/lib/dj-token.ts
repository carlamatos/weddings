import { createHmac, timingSafeEqual } from 'crypto';

// The DJ's private link to a page's song queue (<page>/dj?k=…): the host
// copies it from Song Requests and sends it to the DJ. The "dj:" prefix keeps
// these signatures distinct from other tokens made with AUTH_SECRET.
const SECRET = process.env.AUTH_SECRET ?? '';

export function djKey(pageId: number | string): string {
  return createHmac('sha256', SECRET).update(`dj:${pageId}`).digest('hex').slice(0, 32);
}

export function isDjKey(pageId: number | string, key: string | null | undefined): boolean {
  if (!key || !/^[0-9a-f]{32}$/.test(key) || !SECRET) return false;
  const a = Buffer.from(djKey(pageId)), b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}
