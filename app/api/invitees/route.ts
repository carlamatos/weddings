import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = await sql`SELECT id FROM user_page WHERE user_id = ${session.user.id} LIMIT 1`;
  if (!page.rows[0]) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  const userPageId = page.rows[0].id;

  const { contacts } = await request.json() as {
    contacts: Array<{ name: string; email?: string; phone?: string }>;
  };

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: 'No contacts provided' }, { status: 400 });
  }

  let imported = 0;
  for (const contact of contacts) {
    if (!contact.name?.trim()) continue;
    const email = contact.email?.trim() || null;

    // Skip if this email is already in the guest list
    if (email) {
      const existing = await sql`
        SELECT id FROM event_guests WHERE user_page_id = ${userPageId} AND email = ${email} LIMIT 1
      `;
      if (existing.rows[0]) continue;
    }

    await sql`
      INSERT INTO event_guests (user_page_id, name, email, phone, status)
      VALUES (${userPageId}, ${contact.name.trim()}, ${email}, ${contact.phone?.trim() || null}, 'invited')
    `;
    imported++;
  }

  return NextResponse.json({ success: true, imported });
}
