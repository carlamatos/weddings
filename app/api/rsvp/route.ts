import { NextResponse } from 'next/server';
import { notifyAdminsPageActive } from '@/app/lib/admin-notify';
import { isRsvpSongOn, RSVP_SONG_MAX } from '@/app/lib/rsvp-song';
import { GIFT_MAX_PARTICIPANTS, GIFT_NAME_MAX, GIFT_WISHLIST_MAX, isGiftExchangeOn } from '@/app/lib/gift-exchange';
import { guestAccessDenied, guestPageOffline, PAGE_UNAVAILABLE_ERROR } from '@/app/lib/page-access';
import { sql } from '@vercel/postgres';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { fetchPageSettings } from '@/app/lib/data';
import { isRsvpNotifyOn, notifyOwnerOfRsvp } from '@/app/lib/rsvp-notify';
import { sendGiftJoinEmails } from '@/app/lib/gift-join-notify';
import { isRsvpGuestListOnly } from '@/app/lib/rsvp-settings';
import { rsvpFormFromSettings } from '@/app/lib/rsvp-form-options';
import { cleanPartyMeals, mealOptionsFromSettings } from '@/app/lib/rsvp-meals';
import { ensureMealsColumn } from '@/app/lib/rsvp-meals-data';
import { ensureInviteColumns, verifyInviteToken } from '@/app/lib/invite-tracking';
import { SUB_EVENTS_SETTING, eventsForGuest, parseInvitedEvents, parseSubEvents } from '@/app/lib/sub-events';

const HOUR_MS = 60 * 60 * 1000;
const MAX_GUESTS = 50;
const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca').toLowerCase();
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userPageId, name, email, phone, status, guests, message, receiveUpdates, honeypot, cfToken, meals, joinGiftExchange, giftIdeas, song, inviteToken, eventReplies } = body;

    // Honeypot: bots fill hidden fields, real users don't
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Spam guard: per visitor, and per page so one page can't be flooded.
    if (await overRateLimit(`rsvp:${clientIp(request.headers)}`, 30, HOUR_MS)) {
      return NextResponse.json({ error: 'Too many replies from this connection. Please try again later.' }, { status: 429 });
    }

    if (typeof name !== 'string' || typeof email !== 'string' || !name.trim() || !email.trim() || !status || !userPageId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!['attending', 'not_attending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    if (name.trim().length > 120 || email.trim().length > 254) {
      return NextResponse.json({ error: 'Name or email is too long.' }, { status: 400 });
    }
    const pageId = Number(userPageId);
    if (!Number.isInteger(pageId) || pageId <= 0) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const page = await sql`SELECT id, language FROM user_page WHERE id = ${pageId} AND COALESCE(status, 'active') NOT IN ('inactive', 'suspended', 'draft') LIMIT 1`;
    if (!page.rows[0]) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }
    // Cloudflare Turnstile bot check (when TURNSTILE_SECRET_KEY is set). It
    // always runs on MyGala's own domain — directly on mygala.ca pages, or in
    // the bridge frame (app/api/turnstile/frame) on custom-domain pages — so
    // a token solved anywhere else is rejected.
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (typeof cfToken !== 'string' || !cfToken || cfToken.length > 4096) {
        return NextResponse.json({ error: 'Security check required.' }, { status: 400 });
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: turnstileSecret, response: cfToken, remoteip: clientIp(request.headers) }),
      });
      const verifyData = await verifyRes.json().catch(() => ({ success: false })) as { success: boolean; hostname?: string; action?: string };
      const solvedHost = (verifyData.hostname ?? '').toLowerCase();
      // The widget is tagged action 'rsvp', so a token minted for any other form is refused.
      if (!verifyData.success || verifyData.action !== 'rsvp' || !(solvedHost === ROOT_DOMAIN || solvedHost.endsWith(`.${ROOT_DOMAIN}`))) {
        return NextResponse.json({ error: 'Security check failed. Please try again.' }, { status: 400 });
      }
    }

    if (await guestPageOffline(pageId)) {
      return NextResponse.json({ error: PAGE_UNAVAILABLE_ERROR }, { status: 404 });
    }
    if (await guestAccessDenied(request, pageId)) {
      return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });
    }
    if (await overRateLimit(`rsvp-page:${pageId}`, 500, HOUR_MS)) {
      return NextResponse.json({ error: 'This page is receiving a lot of replies. Please try again shortly.' }, { status: 429 });
    }

    // A guest who came from their own invitation link (app/lib/invite-tracking.ts):
    // their reply goes on their own row, even with no email on the list.
    await ensureInviteColumns();
    const ref = verifyInviteToken(typeof inviteToken === 'string' ? inviteToken : null);
    const invited = ref?.kind === 'guest'
      ? (await sql<{ id: string; seats: number | null; guests: number | null; status: string; invited_events: unknown }>`
          SELECT id, seats, guests, status, invited_events FROM event_guests WHERE id = ${ref.guestId}::uuid AND user_page_id = ${pageId}
        `).rows[0]
      : undefined;

    const requested = Math.floor(Number(guests));
    // A household's seats (set by the host) are the most this reply can bring.
    const seatCap = invited ? (invited.seats ?? (invited.status === 'invited' ? invited.guests : null)) : null;
    const settings = await fetchPageSettings(pageId);
    // "One person per reply" (app/lib/rsvp-form-options.ts) caps every reply at 1.
    const maxGuests = rsvpFormFromSettings(settings).onePerson ? 1 : seatCap && seatCap > 1 ? Math.min(seatCap, MAX_GUESTS) : MAX_GUESTS;
    const guestCount = status === 'attending' ? Math.min(Math.max(Number.isFinite(requested) ? requested : 1, 1), maxGuests) : 1;
    const cleanPhone = str(phone, 40) || null;
    const cleanMessage = str(message, 2000) || null;

    // Meal choices, when the host asks for them (all optional for guests).
    // When the host doesn't ask, what a guest chose before is left as it is.
    const mealOptions = mealOptionsFromSettings(settings, page.rows[0].language);
    const partyMeals = mealOptions && status === 'attending' ? cleanPartyMeals(meals, guestCount, mealOptions) : null;
    const mealsJson = partyMeals ? JSON.stringify(partyMeals) : null;
    if (mealOptions) await ensureMealsColumn();

    // If the guest was already invited (same email), update their record;
    // otherwise insert fresh. With "only guests on the list" on, the email
    // must already be on the guest list, and a reply is never added as new.
    const existing = invited
      ? { rows: [{ id: invited.id as unknown as number, invited_events: invited.invited_events }] }
      : await sql<{ id: number; invited_events: unknown }>`
      SELECT id, invited_events FROM event_guests
      WHERE user_page_id = ${pageId} AND lower(email) = lower(${email.trim()})
      LIMIT 1
    `;

    // Their answer for each of their sub-events (app/lib/sub-events.ts).
    const myEvents = eventsForGuest(parseSubEvents(settings[SUB_EVENTS_SETTING]), parseInvitedEvents(existing.rows[0]?.invited_events));
    const answers = eventReplies && typeof eventReplies === 'object' ? (eventReplies as Record<string, unknown>) : {};
    const repliesJson = myEvents.length
      ? JSON.stringify(Object.fromEntries(myEvents.map((e) => [e.id, status === 'attending' && answers[e.id] !== false])))
      : null;

    if (isRsvpGuestListOnly(settings) && !existing.rows[0]) {
      return NextResponse.json(
        { error: 'We couldn’t find this email on the guest list. Please use the email address your host has for you.', code: 'not_on_guest_list' },
        { status: 403 },
      );
    }

    if (existing.rows[0]) {
      await sql`
        UPDATE event_guests SET
          name = ${name.trim()},
          phone = COALESCE(${cleanPhone}, phone),
          status = ${status},
          guests = ${guestCount},
          message = ${cleanMessage},
          receive_updates = ${!!receiveUpdates},
          responded_at = NOW(),
          seats = COALESCE(seats, CASE WHEN status = 'invited' AND guests > 1 THEN guests END),
          event_replies = COALESCE(${repliesJson}::jsonb, event_replies)
        WHERE id = ${existing.rows[0].id}
      `;
      // From their own link: the email they typed joins their row, unless
      // another guest on the list already has it.
      if (invited) {
        await sql`
          UPDATE event_guests SET email = ${email.trim()}
          WHERE id = ${existing.rows[0].id} AND (email IS NULL OR lower(email) <> lower(${email.trim()}))
            AND NOT EXISTS (SELECT 1 FROM event_guests o WHERE o.user_page_id = ${pageId} AND lower(o.email) = lower(${email.trim()}) AND o.id <> ${existing.rows[0].id})
        `;
      }
      if (mealOptions) await sql`UPDATE event_guests SET meals = ${mealsJson}::jsonb WHERE id = ${existing.rows[0].id}`;
    } else if (mealOptions) {
      await sql`
        INSERT INTO event_guests (user_page_id, name, email, phone, status, guests, message, receive_updates, responded_at, meals)
        VALUES (${pageId}, ${name.trim()}, ${email.trim()}, ${cleanPhone}, ${status}, ${guestCount}, ${cleanMessage}, ${!!receiveUpdates}, NOW(), ${mealsJson}::jsonb)
      `;
    } else {
      await sql`
        INSERT INTO event_guests (user_page_id, name, email, phone, status, guests, message, receive_updates, responded_at)
        VALUES (
          ${pageId},
          ${name.trim()},
          ${email.trim()},
          ${cleanPhone},
          ${status},
          ${guestCount},
          ${cleanMessage},
          ${!!receiveUpdates},
          NOW()
        )
      `;
    }

    // A new reply's answers for the page's sub-events.
    if (!existing.rows[0] && repliesJson) {
      await sql`UPDATE event_guests SET event_replies = ${repliesJson}::jsonb WHERE user_page_id = ${pageId} AND lower(email) = lower(${email.trim()})`;
    }

    // The free song question: saved as a song request, so the host sees it
    // in Song Requests. Never fails the RSVP.
    const songText = typeof song === 'string' ? song.trim().slice(0, RSVP_SONG_MAX) : '';
    if (songText && status === 'attending' && isRsvpSongOn(settings)) {
      try {
        await sql`
          INSERT INTO guests_songs (user_page_id, requester_name, song_title, artist, ip_address)
          VALUES (${pageId}, ${name.trim().slice(0, 120)}, ${songText}, '', ${clientIp(request.headers)})
        `;
      } catch (songErr) {
        console.error('RSVP song request failed:', songErr);
      }
    }

    // "Count me in for the gift exchange": an attending guest joins the
    // page's Gift Exchange too, while sign-ups are open. Never fails the RSVP.
    let secretSanta: number | null = null;
    if (joinGiftExchange === true && status === 'attending' && isGiftExchangeOn(settings)) {
      try {
        const ideas = typeof giftIdeas === 'string' ? giftIdeas.trim().slice(0, GIFT_WISHLIST_MAX) || null : null;
        const guestRow = await sql<{ id: string }>`SELECT id FROM event_guests WHERE user_page_id = ${pageId} AND lower(email) = lower(${email.trim()}) LIMIT 1`;
        const joined = await sql<{ inserted: boolean }>`
          INSERT INTO page_gift_exchange (user_page_id, name, email, phone, wishlist, guest_id)
          SELECT ${pageId}, ${name.trim().slice(0, GIFT_NAME_MAX)}, ${email.trim().toLowerCase()}, ${cleanPhone}, ${ideas}, ${guestRow.rows[0]?.id ?? null}
          WHERE NOT EXISTS (SELECT 1 FROM page_gift_exchange WHERE user_page_id = ${pageId} AND giftee_id IS NOT NULL)
            AND (SELECT COUNT(*) FROM page_gift_exchange WHERE user_page_id = ${pageId}) < ${GIFT_MAX_PARTICIPANTS}
          ON CONFLICT (user_page_id, (lower(email))) WHERE email IS NOT NULL
          DO UPDATE SET name = EXCLUDED.name, wishlist = COALESCE(EXCLUDED.wishlist, page_gift_exchange.wishlist), updated_at = NOW()
          RETURNING (xmax = 0) AS inserted
        `;
        // A new sign-up gets the guest's "you're in" email here; the organizer
        // hears about it in the RSVP email below, not in a second email.
        if (joined.rows[0]?.inserted) {
          secretSanta = await sendGiftJoinEmails(pageId, { name: name.trim().slice(0, GIFT_NAME_MAX), email: email.trim().toLowerCase(), wishlist: ideas }, { host: false });
        }
      } catch (giftErr) {
        console.error('RSVP gift exchange join failed:', giftErr);
      }
    }

    // Let the organizer know (unless they turned it off in Guests & RSVPs).
    if (isRsvpNotifyOn(settings)) {
      await notifyOwnerOfRsvp(pageId, {
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone,
        status,
        guests: guestCount,
        message: cleanMessage,
        meals: partyMeals,
        updated: !!existing.rows[0],
        secretSanta,
      });
    }

    // The page's first guest reply: the admins hear it's in use (once per page).
    await notifyAdminsPageActive(pageId, { kind: 'rsvp', name: name.trim(), email: email.trim() });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
