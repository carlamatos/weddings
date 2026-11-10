import { redirect } from 'next/navigation';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';

// Share is now part of Invite (the invitations screen). This address stays
// for old links: help guides, bookmarks, the top bar's "More sharing options".
export default async function SharePage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  redirect(pagePath(page.id, '/invitations'));
}
