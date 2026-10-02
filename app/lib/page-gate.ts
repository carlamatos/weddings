import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { hasPageAccess, isPageLocked, pageAccessCookieName } from './page-password';

// Server side of password-protected pages (Plus) for the public page routes.
// True when this visitor must see the password screen instead of the page.
export async function mustShowPasswordGate(
  pageId: number | string,
  settings: Record<string, string>,
  isPaid: boolean,
  isOwner = false,
): Promise<boolean> {
  if (isOwner || !isPageLocked(settings, isPaid)) return false;
  const cookie = (await cookies()).get(pageAccessCookieName(pageId))?.value;
  return !hasPageAccess(pageId, settings, cookie);
}

// Metadata for a locked page: nothing about the event (link previews and
// search results would otherwise show its name, description and banner).
export const LOCKED_PAGE_METADATA: Metadata = {
  title: { absolute: 'Private event' },
  description: 'This event page is password protected.',
  robots: { index: false, follow: false },
};
