import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userPageId, name, email, phone, status, guests, message, receiveUpdates, honeypot, cfToken } = body;

    // Honeypot: bots fill hidden fields, real users don't
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Cloudflare Turnstile verification
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret) {
      if (!cfToken) {
        return NextResponse.json({ error: 'Security check required.' }, { status: 400 });
      }
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: turnstileSecret, response: cfToken }),
      });
      const verifyData = await verifyRes.json() as { success: boolean };
      if (!verifyData.success) {
        return NextResponse.json({ error: 'Security check failed. Please try again.' }, { status: 400 });
      }
    }

    if (!name?.trim() || !email?.trim() || !status || !userPageId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!['attending', 'not_attending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const page = await sql`SELECT id FROM user_page WHERE id = ${Number(userPageId)} LIMIT 1`;
    if (!page.rows[0]) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const guestCount = status === 'attending' ? (Number(guests) || 1) : 1;

    // If the guest was already invited, update their record; otherwise insert fresh
    const existing = await sql`
      SELECT id FROM event_guests
      WHERE user_page_id = ${Number(userPageId)} AND email = ${email.trim()}
      LIMIT 1
    `;

    if (existing.rows[0]) {
      await sql`
        UPDATE event_guests SET
          name = ${name.trim()},
          phone = ${phone?.trim() || null},
          status = ${status},
          guests = ${guestCount},
          message = ${message?.trim() || null},
          receive_updates = ${!!receiveUpdates},
          responded_at = NOW()
        WHERE id = ${existing.rows[0].id}
      `;
    } else {
      await sql`
        INSERT INTO event_guests (user_page_id, name, email, phone, status, guests, message, receive_updates, responded_at)
        VALUES (
          ${Number(userPageId)},
          ${name.trim()},
          ${email.trim()},
          ${phone?.trim() || null},
          ${status},
          ${guestCount},
          ${message?.trim() || null},
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
