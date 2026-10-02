import { NextResponse } from 'next/server';
import { guestAccessDenied } from '@/app/lib/page-access';
import { sql } from '@vercel/postgres';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';

const HOUR_MS = 60 * 60 * 1000;
const MAX_GUESTS = 50;
const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'mygala.ca').toLowerCase();
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userPageId, name, email, phone, status, guests, message, receiveUpdates, honeypot, cfToken } = body;

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

    const page = await sql`SELECT id FROM user_page WHERE id = ${pageId} AND COALESCE(status, 'active') <> 'inactive' LIMIT 1`;
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

    // If the guest was already invited, update their record; otherwise insert fresh
    const existing = await sql`
      SELECT id FROM event_guests
      WHERE user_page_id = ${pageId} AND email = ${email.trim()}
      LIMIT 1
    `;

    if (existing.rows[0]) {
      await sql`
        UPDATE event_guests SET
          name = ${name.trim()},
          phone = ${cleanPhone},
          status = ${status},
          guests = ${guestCount},
          message = ${cleanMessage},
          receive_updates = ${!!receiveUpdates},
          responded_at = NOW()
        WHERE id = ${existing.rows[0].id}
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
