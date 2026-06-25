import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userPageId, name, email, phone, status, guests, message, receiveUpdates } = body;

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

    await sql`
      INSERT INTO event_rsvp (user_page_id, name, email, phone, status, guests, message, receive_updates)
      VALUES (
        ${Number(userPageId)},
        ${name.trim()},
        ${email.trim()},
        ${phone?.trim() || null},
        ${status},
        ${status === 'attending' ? (Number(guests) || 1) : 1},
        ${message?.trim() || null},
        ${!!receiveUpdates}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
