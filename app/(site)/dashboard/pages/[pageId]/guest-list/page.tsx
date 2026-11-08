import Link from 'next/link';
import { fetchGuests, fetchPageSettings } from '@/app/lib/data';
import { LINK_SHARED_SETTING } from '@/app/lib/setup-progress';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { GuestListManager } from '@/app/ui/dashboard/guest-list-manager';
import { PlanningToolTip } from '@/app/ui/dashboard/planning-tool-tip';
import { HelpLink } from '@/app/ui/dashboard/help-link';

// Guests → Guest List: on every plan. Sending invitations to the list is on
// the Invitations screen (Plus).
export default async function GuestListPage({ params }: { params: Promise<{ pageId: string }> }) {
  const page = await requireOwnedPage(params);
  const pageId = Number(page.id);
  const [guests, settings] = await Promise.all([fetchGuests(pageId), fetchPageSettings(pageId)]);
  // Right after adding guests is when hosts are keenest to invite them.
  const invited = guests.filter((g) => g.invited_at || g.texted_at).length;
  const waiting = guests.length - invited;
  const linkShared = !!settings[LINK_SHARED_SETTING];
  const people = (n: number) => `${n} ${n === 1 ? 'guest' : 'guests'}`;
  const prompt = guests.length === 0 || waiting === 0 ? null
    : invited === 0 ? (linkShared ? null : {
      title: `You have ${people(guests.length)} on your list. Ready to send them your invitation?`,
      text: 'Email it, text it or send it on WhatsApp in a few taps, or simply share your page link.',
    })
    : {
      title: `${people(waiting)} ${waiting === 1 ? 'hasn’t' : 'haven’t'} received your invitation yet.`,
      text: 'Send it to them whenever you’re ready.',
    };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Guest List</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Keep everyone you&rsquo;re inviting in one place — import them from a spreadsheet or your phone&rsquo;s contacts, or add them
          one by one. Their replies show up on your RSVP screen.
          {' '}<HelpLink guide="add-your-guests" />
        </p>
      </div>
      {prompt && (
        <div
          role="status"
          style={{
            background: '#FBF5F3', border: '1px solid #E6D3CD', borderRadius: 10, padding: '14px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1.6, color: '#241F2B' }}>
            <strong>{prompt.title}</strong> <span style={{ color: '#6B6470' }}>{prompt.text}</span>
          </span>
          <Link
            href={pagePath(pageId, '/invitations')}
            style={{ padding: '9px 18px', borderRadius: 8, background: '#B6584A', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Send invitations
          </Link>
        </div>
      )}
      <GuestListManager pageId={pageId} guests={guests} isPaid={page.plan_type === 'paid'} invitationsHref={pagePath(pageId, '/invitations')} />
      <PlanningToolTip
        href="/guest-count-planner"
        title="Not everyone you invite will come."
        text="Our free guest count planner estimates how many will, and whether they fit your venue."
        cta="Guest count planner"
      />
    </div>
  );
}
