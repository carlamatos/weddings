import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { fetchPageSettings } from '@/app/lib/data';
import { guestAccessDenied, guestPageOffline } from '@/app/lib/page-access';
import { ensureInviteColumns, verifyInviteToken } from '@/app/lib/invite-tracking';
import { SUB_EVENTS_SETTING, eventsForGuest, parseEventReplies, parseInvitedEvents, parseSubEvents } from '@/app/lib/sub-events';

// What the RSVP form needs beyond the page: the page's sub-events, and for a
// guest who came from their own invitation link (?g=<token>), their name and
// email to fill in, the seats saved for their household and only their
// events. /api/rsvp/guest?p=<page id>&t=<token>
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const pageId = Number(params.get('p'));
  if (!Number.isInteger(pageId) || pageId <= 0) return NextResponse.json({ events: [] }, { status: 404 });
  if (await guestPageOffline(pageId)) return NextResponse.json({ events: [] }, { status: 404 });
  if (await guestAccessDenied(req, pageId)) return NextResponse.json({ events: [] }, { status: 403 });

  const all = parseSubEvents((await fetchPageSettings(pageId))[SUB_EVENTS_SETTING]);
  const ref = verifyInviteToken(params.get('t'));
  let guest: { name: string; email: string | null; seats: number | null; events: string[] | null; replies: Record<string, boolean> } | null = null;
  if (ref?.kind === 'guest') {
    await ensureInviteColumns();
    const res = await sql<{ name: string; email: string | null; seats: number | null; guests: number | null; status: string; invited_events: unknown; event_replies: unknown }>`
      SELECT name, email, seats, guests, status, invited_events, event_replies FROM event_guests
      WHERE id = ${ref.guestId}::uuid AND user_page_id = ${pageId}
    `;
    const g = res.rows[0];
    if (g) {
      // The seats saved for them: set by the host, or their number while they
      // haven't replied. One seat isn't a limit (it's the default).
      const seats = g.seats ?? (g.status === 'invited' ? g.guests : null);
      guest = { name: g.name, email: g.email, seats: seats && seats > 1 ? seats : null, events: parseInvitedEvents(g.invited_events), replies: parseEventReplies(g.event_replies) };
    }
  }
  const events = eventsForGuest(all, guest?.events ?? null);
  return NextResponse.json(
    { events, guest: guest && { name: guest.name, email: guest.email, seats: guest.seats, replies: guest.replies } },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
