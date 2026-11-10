import { redirect } from 'next/navigation';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';

// RSVP is now part of Guests & RSVPs (the guest-list screen). This address
// stays for old links: RSVP notification emails, help guides, bookmarks.
export default async function RsvpPage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  redirect(pagePath(page.id, '/guest-list'));
}
