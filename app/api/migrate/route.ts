import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// One-time migration endpoint. Protected by MIGRATION_SECRET env var.
// Call: POST /api/migrate  with header Authorization: Bearer <MIGRATION_SECRET>
export async function POST(request: Request) {
  const secret = process.env.MIGRATION_SECRET;
  if (!secret || request.headers.get('Authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create unified table
  await sql`
    CREATE TABLE IF NOT EXISTS event_guests (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_page_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'attending', 'not_attending')),
      guests INTEGER NOT NULL DEFAULT 1,
      message TEXT,
      receive_updates BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      responded_at TIMESTAMP
    )
  `;

  let rsvpsMigrated = 0;
  let inviteesMigrated = 0;

  // Migrate from event_rsvp
  try {
    const rsvps = await sql`SELECT * FROM event_rsvp`;
    for (const r of rsvps.rows) {
      const exists = await sql`SELECT id FROM event_guests WHERE id = ${r.id} LIMIT 1`;
      if (exists.rows[0]) continue;
      await sql`
        INSERT INTO event_guests (id, user_page_id, name, email, phone, status, guests, message, receive_updates, created_at, responded_at)
        VALUES (${r.id}, ${r.user_page_id}, ${r.name}, ${r.email}, ${r.phone}, ${r.status}, ${r.guests}, ${r.message}, ${r.receive_updates}, ${r.created_at}, ${r.created_at})
      `;
      rsvpsMigrated++;
    }
  } catch {
    // event_rsvp table may not exist on fresh deployments
  }

  // Migrate from event_invitees
  try {
    const invitees = await sql`SELECT * FROM event_invitees`;
    for (const inv of invitees.rows) {
      // Skip if email already in guest list (may have since RSVP'd)
      if (inv.email) {
        const exists = await sql`
          SELECT id FROM event_guests WHERE user_page_id = ${inv.user_page_id} AND email = ${inv.email} LIMIT 1
        `;
        if (exists.rows[0]) continue;
      }
      await sql`
        INSERT INTO event_guests (id, user_page_id, name, email, phone, status, created_at)
        VALUES (${inv.id}, ${inv.user_page_id}, ${inv.name}, ${inv.email}, ${inv.phone}, 'invited', ${inv.created_at})
      `;
      inviteesMigrated++;
    }
  } catch {
    // event_invitees table may not exist on fresh deployments
  }

  return NextResponse.json({ success: true, rsvpsMigrated, inviteesMigrated });
}
