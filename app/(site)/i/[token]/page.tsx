import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { fetchPageById, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { INVITATION_SETTING, googleFontsHref, normalizeInvitation } from '@/app/lib/invitation';
import { invitationDetails } from '@/app/lib/invitation-details';
import { invitationPassword } from '@/app/lib/page-password';
import { ensureInviteColumns, verifyInviteToken } from '@/app/lib/invite-tracking';
import { SUB_EVENTS_SETTING, eventsForGuest, localeOf, parseInvitedEvents, parseSubEvents, subEventWhen } from '@/app/lib/sub-events';
import { isPageDraft, isPageOffline } from '@/app/lib/page-status';
import PageUnavailable from '@/app/ui/page-unavailable';
import { InvitationOpen } from '@/app/ui/invitation-open';

// A guest's own invitation (/i/<token>, from their email or text): the
// envelope to open, then the card, their note and the RSVP button. The link
// also tells the host the guest saw it (app/lib/invite-tracking.ts). A page
// token instead of a guest's opens it for anyone (the host's test email).
// ?to=rsvp or ?to=page: a link from the full-invitation email, which goes
// straight on to the page after counting the view.
export const metadata: Metadata = { title: 'Your invitation', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function InvitationPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ to?: string; open?: string }> }) {
  const [{ token }, { to, open }] = await Promise.all([params, searchParams]);
  const ref = verifyInviteToken(token);
  if (!ref) notFound();

  type Row = { id: string; name: string; invitation_note: string | null; user_page_id: number; invited_events: unknown };
  let guest: Row | undefined;
  if (ref.kind === 'guest') {
    await ensureInviteColumns();
    const res = await sql<Row>`
      SELECT id, name, invitation_note, user_page_id, invited_events FROM event_guests WHERE id = ${ref.guestId}::uuid
    `;
    guest = res.rows[0];
    if (!guest) notFound();
  }
  const pageId = guest ? Number(guest.user_page_id) : ref.kind === 'page' ? ref.pageId : NaN;
  const [page, session] = await Promise.all([fetchPageById(pageId), auth()]);
  if (!page) notFound();
  const isOwner = session?.user?.id === page.user_id;
  if (isPageOffline(page.status) && !(isPageDraft(page.status) && isOwner)) return <PageUnavailable draft={isPageDraft(page.status)} />;

  const [settings, host] = await Promise.all([
    fetchPageSettings(page.id),
    sql<{ name: string | null }>`SELECT name FROM users WHERE id = ${page.user_id}`,
  ]);
  let saved: unknown = null;
  try { saved = JSON.parse(settings[INVITATION_SETTING] ?? 'null'); } catch { saved = null; }
  const design = normalizeInvitation(saved, page.theme_slug, page.language);
  // Only the guest's own sub-events (all of them on the host's test link).
  const locale = localeOf(page.language);
  const events = eventsForGuest(parseSubEvents(settings[SUB_EVENTS_SETTING]), guest ? parseInvitedEvents(guest.invited_events) : null)
    .map((e) => ({ name: e.name, when: subEventWhen(e, locale), venue: e.venue }));
  const details = { ...invitationDetails(page, invitationPassword(settings, true).password, isSectionOn(settings, 'show_rsvp')), events };
  const withGuest = guest ? `${details.url}?g=${encodeURIComponent(token)}` : details.url;
  const hostName = host.rows[0]?.name?.trim() || page.heading || '';
  const go = to === 'rsvp' ? (details.rsvpOff ? withGuest : `${withGuest}#rsvp`) : to === 'page' ? withGuest : null;

  return (
    <main lang={page.language || 'en'}>
      <link rel="stylesheet" href={googleFontsHref([design.headingFont, design.bodyFont])} />
      <InvitationOpen
        token={ref.kind === 'guest' ? token : null}
        go={go}
        design={design}
        details={details}
        language={page.language}
        guestName={guest?.name ?? ''}
        note={guest?.invitation_note ?? null}
        hostName={hostName}
        startOpen={open === '1' || !design.envelope.on}
      />
    </main>
  );
}
