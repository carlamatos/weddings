import { createHmac, timingSafeEqual } from 'crypto';

// Plus: password-protected event pages. Off unless the owner turns it on.
// Settings (user_page_settings):
//   page_password_hash  bcrypt hash of the password the host shares
//   password_protect    'true' when protection is on
//
// A guest who enters the right password gets a per-page cookie holding an
// HMAC of the page id and the current hash, so changing the password signs
// everyone out of the page. Checked by the public page and every guest API.

const SECRET = process.env.AUTH_SECRET ?? '';
export const PAGE_PASSWORD_MIN = 4;
export const PAGE_PASSWORD_MAX = 100;
export const PAGE_ACCESS_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, seconds

export function pageAccessCookieName(pageId: number | string): string {
  return `mg_page_access_${pageId}`;
}

export function pageAccessValue(pageId: number | string, hash: string): string {
  return createHmac('sha256', SECRET).update(`page-access|${pageId}|${hash}`).digest('hex');
}

// The page is locked: paid, protection on, and a password set.
export function isPageLocked(settings: Record<string, string>, isPaid: boolean): boolean {
  return isPaid && settings['password_protect'] === 'true' && !!settings['page_password_hash'];
}

export function hasPageAccess(pageId: number | string, settings: Record<string, string>, cookieValue: string | undefined): boolean {
  const hash = settings['page_password_hash'];
  if (!hash || !cookieValue || !SECRET) return false;
  const expected = Buffer.from(pageAccessValue(pageId, hash), 'hex');
  const given = Buffer.from(cookieValue, 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// For API routes: the access cookie from the request's Cookie header.
export function accessCookieFromRequest(request: Request, pageId: number | string): string | undefined {
  const name = pageAccessCookieName(pageId);
  for (const part of (request.headers.get('cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}
