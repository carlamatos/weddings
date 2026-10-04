import { sql } from '@vercel/postgres';
import { fetchPageSettings } from './data';
import { accessCookieFromRequest, hasPageAccess, isPageLocked } from './page-password';
import { isPageOffline } from './page-status';

// For guest-facing API routes (RSVP, photos, songs, potluck): true when the
// page is password protected and this request doesn't carry its access
// cookie — so locking a page also locks everything guests can do on it.
export async function guestAccessDenied(request: Request, pageId: number): Promise<boolean> {
  const [settings, page] = await Promise.all([
    fetchPageSettings(pageId),
    sql`SELECT plan_type FROM user_page WHERE id = ${pageId} LIMIT 1`,
  ]);
  const isPaid = page.rows[0]?.plan_type === 'paid';
  if (!isPageLocked(settings, isPaid)) return false;
  return !hasPageAccess(pageId, settings, accessCookieFromRequest(request, pageId));
}

// For guest-facing API routes: true when the page is deactivated or suspended
// (or gone), so its forms and uploads are closed along with the page.
export async function guestPageOffline(pageId: number): Promise<boolean> {
  const page = await sql<{ status: string | null }>`SELECT status FROM user_page WHERE id = ${pageId} LIMIT 1`;
  return !page.rows[0] || isPageOffline(page.rows[0].status);
}

export const PAGE_UNAVAILABLE_ERROR = 'This page is unavailable.';
