import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS event_invitees (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_page_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

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
    await sql`
      INSERT INTO event_invitees (user_page_id, name, email, phone)
      VALUES (
        ${userPageId},
        ${contact.name.trim()},
        ${contact.email?.trim() || null},
        ${contact.phone?.trim() || null}
      )
    `;
    imported++;
  }

  return NextResponse.json({ success: true, imported });
}
