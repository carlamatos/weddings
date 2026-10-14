import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { hasPageAccess, isPageLocked, pageAccessCookieName } from './page-password';
import { siteUrl } from './site-url';

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
// search results would otherwise show its name, description and banner) —
// just a neutral MyGala invitation card, so a shared link isn't bare.
const LOCKED_TITLE = 'You’re invited — private event';
const LOCKED_DESCRIPTION = 'This event page is private. Open the link and enter the password from your host to see the details.';
export const LOCKED_PAGE_METADATA: Metadata = {
  title: { absolute: LOCKED_TITLE },
  description: LOCKED_DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'MyGala',
    title: LOCKED_TITLE,
    description: LOCKED_DESCRIPTION,
    images: [{ url: `${siteUrl()}/opengraph-image.png`, width: 1200, height: 630, alt: 'MyGala' }],
  },
  twitter: { card: 'summary_large_image', title: LOCKED_TITLE, description: LOCKED_DESCRIPTION, images: [`${siteUrl()}/opengraph-image.png`] },
};
