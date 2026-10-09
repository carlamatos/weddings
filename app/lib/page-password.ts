import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

// Plus: password-protected event pages. Off unless the owner turns it on.
// Settings (user_page_settings):
//   page_password_hash  bcrypt hash of the password the host shares
//   password_protect    'true' when protection is on
//   page_password_enc   the same password, encrypted (AES-256-GCM, key from
//                       AUTH_SECRET), so it can be printed in invitations.
//                       Only set for passwords saved since this was added.
//   invitation_include_password  'false' to leave it out of invitations;
//                       unset = include it (the default)
//
// A guest who enters the right password gets a per-page cookie holding an
// HMAC of the page id and the current hash, so changing the password signs
// everyone out of the page. Checked by the public page and every guest API.

const SECRET = process.env.AUTH_SECRET ?? '';
export const PAGE_PASSWORD_MIN = 4;
export const PAGE_PASSWORD_MAX = 100;
export const PAGE_ACCESS_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, seconds

const encKey = () => createHash('sha256').update(`page-password-enc|${SECRET}`).digest();

export function encryptPagePassword(password: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encKey(), iv);
  const data = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}

export function decryptPagePassword(value: string | undefined): string | null {
  if (!value || !SECRET) return null;
  try {
    const [iv, tag, data] = value.split('.').map((p) => Buffer.from(p, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', encKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// The page password for the invitations, and whether the host can include it:
//   'none'        the page isn't password protected
//   'unavailable' it is, but the password was saved before it could be read
//                 back (the host re-enters it to include it)
//   'included' / 'excluded'  per the host's choice (included by default)
export type InvitationPasswordState = { state: 'none' | 'unavailable' | 'included' | 'excluded'; password: string | null };

export function invitationPassword(settings: Record<string, string>, isPaid: boolean): InvitationPasswordState {
  if (!isPageLocked(settings, isPaid)) return { state: 'none', password: null };
  const password = decryptPagePassword(settings['page_password_enc']);
  if (!password) return { state: 'unavailable', password: null };
  if (settings['invitation_include_password'] === 'false') return { state: 'excluded', password: null };
  return { state: 'included', password };
}

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
