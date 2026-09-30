import { sql } from '@vercel/postgres';

// Turns off event emails for one guest (the RSVP "receive updates" opt-in).
// Returns the event name for the confirmation screen, or null if the guest
// no longer exists.
export async function unsubscribeGuest(guestId: string): Promise<string | null> {
  const res = await sql<{ heading: string }>`
    UPDATE event_guests g SET receive_updates = FALSE
    FROM user_page up
    WHERE g.id = ${guestId} AND up.id = g.user_page_id
    RETURNING up.heading
  `;
  return res.rows[0] ? res.rows[0].heading || 'this event' : null;
}

export async function guestEventName(guestId: string): Promise<{ heading: string; subscribed: boolean } | null> {
  const res = await sql<{ heading: string; receive_updates: boolean }>`
    SELECT up.heading, g.receive_updates FROM event_guests g JOIN user_page up ON up.id = g.user_page_id WHERE g.id = ${guestId}
  `;
  const row = res.rows[0];
  return row ? { heading: row.heading || 'this event', subscribed: row.receive_updates } : null;
}
