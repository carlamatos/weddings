import { fetchGuests } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { GuestListManager } from '@/app/ui/dashboard/guest-list-manager';

// Guests → Guest List: on every plan. Sending invitations to the list is on
// the Invitations screen (Plus).
export default async function GuestListPage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);
  const guests = await fetchGuests(pageId);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Guest List</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Keep everyone you&rsquo;re inviting in one place — import them from a spreadsheet or your phone&rsquo;s contacts, or add them
          one by one. Their replies show up on your RSVP screen.
        </p>
      </div>
      <GuestListManager pageId={pageId} guests={guests} isPaid={page.plan_type === 'paid'} invitationsHref={pagePath(pageId, '/invitations')} />
    </div>
  );
}
