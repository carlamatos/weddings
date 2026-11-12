import { NextResponse } from 'next/server';
import { GIFT_MAX_PARTICIPANTS, GIFT_NAME_MAX, GIFT_WISHLIST_MAX, isGiftExchangeOn } from '@/app/lib/gift-exchange';
import { guestAccessDenied, guestPageOffline, PAGE_UNAVAILABLE_ERROR } from '@/app/lib/page-access';
import { sql } from '@vercel/postgres';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { fetchPageSettings } from '@/app/lib/data';
import { isRsvpNotifyOn, notifyOwnerOfRsvp } from '@/app/lib/rsvp-notify';
import { isRsvpGuestListOnly } from '@/app/lib/rsvp-settings';
import { cleanPartyMeals, mealOptionsFromSettings } from '@/app/lib/rsvp-meals';
import { ensureMealsColumn } from '@/app/lib/rsvp-meals-data';

const HOUR_MS = 60 * 60 * 1000;
const MAX_GUESTS = 50;
const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca').toLowerCase();
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userPageId, name, email, phone, status, guests, message, receiveUpdates, honeypot, cfToken, meals, joinGiftExchange, giftIdeas } = body;

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

    const requested = Math.floor(Number(guests));
    const guestCount = status === 'attending' ? Math.min(Math.max(Number.isFinite(requested) ? requested : 1, 1), MAX_GUESTS) : 1;
    const cleanPhone = str(phone, 40) || null;
    const cleanMessage = str(message, 2000) || null;

    const settings = await fetchPageSettings(pageId);

    // Meal choices, when the host asks for them (all optional for guests).
    // When the host doesn't ask, what a guest chose before is left as it is.
    const mealOptions = mealOptionsFromSettings(settings, page.rows[0].language);
    const partyMeals = mealOptions && status === 'attending' ? cleanPartyMeals(meals, guestCount, mealOptions) : null;
    const mealsJson = partyMeals ? JSON.stringify(partyMeals) : null;
    if (mealOptions) await ensureMealsColumn();

    // If the guest was already invited (same email), update their record;
    // otherwise insert fresh. With "only guests on the list" on, the email
    // must already be on the guest list, and a reply is never added as new.
    const existing = await sql<{ id: number }>`
      SELECT id FROM event_guests
      WHERE user_page_id = ${pageId} AND lower(email) = lower(${email.trim()})
      LIMIT 1
    `;

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
          responded_at = NOW()
        WHERE id = ${existing.rows[0].id}
      `;
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

    // "Count me in for the gift exchange": an attending guest joins the
    // page's Gift Exchange too, while sign-ups are open. Never fails the RSVP.
    if (joinGiftExchange === true && status === 'attending' && isGiftExchangeOn(settings)) {
      try {
        const ideas = typeof giftIdeas === 'string' ? giftIdeas.trim().slice(0, GIFT_WISHLIST_MAX) || null : null;
        const guestRow = await sql<{ id: string }>`SELECT id FROM event_guests WHERE user_page_id = ${pageId} AND lower(email) = lower(${email.trim()}) LIMIT 1`;
        await sql`
          INSERT INTO page_gift_exchange (user_page_id, name, email, phone, wishlist, guest_id)
          SELECT ${pageId}, ${name.trim().slice(0, GIFT_NAME_MAX)}, ${email.trim().toLowerCase()}, ${cleanPhone}, ${ideas}, ${guestRow.rows[0]?.id ?? null}
          WHERE NOT EXISTS (SELECT 1 FROM page_gift_exchange WHERE user_page_id = ${pageId} AND giftee_id IS NOT NULL)
            AND (SELECT COUNT(*) FROM page_gift_exchange WHERE user_page_id = ${pageId}) < ${GIFT_MAX_PARTICIPANTS}
          ON CONFLICT (user_page_id, (lower(email))) WHERE email IS NOT NULL
          DO UPDATE SET name = EXCLUDED.name, wishlist = COALESCE(EXCLUDED.wishlist, page_gift_exchange.wishlist), updated_at = NOW()
        `;
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
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
