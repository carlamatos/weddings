import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchOwnedPage, listOwnedPages, parsePageId } from './data';
import type { UserPage } from './definitions';

// URL of a dashboard screen for one page, e.g. pagePath(12, '/rsvp').
export function pagePath(pageId: number | string, section = ''): string {
  return `/dashboard/pages/${pageId}${section}`;
}

// Loads the page named in the URL for the signed-in user, or stops the request:
// signed out -> login, not theirs / not found -> 404. Every dashboard page calls
// this itself (a parent layout's check doesn't protect its child pages).
export async function requireOwnedPage(params: Promise<{ pageId: string }>): Promise<UserPage> {
  const pageId = parsePageId((await params).pageId);
  if (pageId === null) notFound();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');
  const page = await fetchOwnedPage(userId, pageId);
  if (!page) notFound();
  return page;
}

// Old dashboard URLs (/dashboard/rsvp etc.) forward to the user's oldest page.
export async function redirectToDefaultPage(section: string, search = ''): Promise<never> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/login');
  const pages = await listOwnedPages(userId);
  if (!pages.length) redirect('/dashboard/setup');
  redirect(`${pagePath(pages[0].id, section)}${search}`);
}
