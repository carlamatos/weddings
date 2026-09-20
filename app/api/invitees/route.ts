import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import { ownsPage, parsePageId } from '@/app/lib/data';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageId, contacts } = (await request.json().catch(() => ({}))) as {
    pageId?: unknown;
    contacts: Array<{ name: string; email?: string; phone?: string }>;
  };

  const userPageId = parsePageId(pageId);
  if (userPageId === null || !(await ownsPage(session.user.id, userPageId))) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

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
