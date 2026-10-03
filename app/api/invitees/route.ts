import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { parsePageId } from '@/app/lib/data';
import { MAX_IMPORT, partySize } from '@/app/lib/guest-import';
import { INVITATION_NOTE_MAX } from '@/app/lib/invitation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Adds guests to a page's guest list (Invitations screen, Plus) as
// "invited": from a CSV, a .vcf file, the phone's contact picker or the
// add-a-guest form. Guests whose email (or, without one, name + phone) is
// already on the list are skipped.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { pageId?: unknown; contacts?: unknown };
  const pageId = parsePageId(body.pageId);
  if (pageId === null) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const page = await sql`SELECT plan_type FROM user_page WHERE id = ${pageId} AND user_id = ${session.user.id}`;
  if (!page.rows[0]) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  if (page.rows[0].plan_type !== 'paid') return NextResponse.json({ error: 'The guest list is a Plus feature.' }, { status: 403 });

  if (!Array.isArray(body.contacts) || body.contacts.length === 0) {
    return NextResponse.json({ error: 'No guests to add.' }, { status: 400 });
  }
  if (body.contacts.length > MAX_IMPORT) {
    return NextResponse.json({ error: `Add up to ${MAX_IMPORT} guests at a time.` }, { status: 400 });
  }

  const existing = await sql`SELECT lower(email) AS email, lower(name) AS name, phone FROM event_guests WHERE user_page_id = ${pageId}`;
  const emails = new Set(existing.rows.map((r) => r.email).filter(Boolean));
  const namePhones = new Set(existing.rows.map((r) => `${r.name}|${r.phone ?? ''}`));

  let imported = 0;
  let skipped = 0;
  for (const raw of body.contacts as Record<string, unknown>[]) {
    const name = field(raw?.name, 120);
    const emailRaw = field(raw?.email, 254).toLowerCase();
    const email = EMAIL_RE.test(emailRaw) ? emailRaw : null;
    const phone = field(raw?.phone, 40) || null;
    const guests = partySize(raw?.guests);
    const note = typeof raw?.note === 'string' ? raw.note.replace(/\r\n/g, '\n').trim().slice(0, INVITATION_NOTE_MAX) || null : null;
    const key = `${name.toLowerCase()}|${phone ?? ''}`;
    if (!name || (email ? emails.has(email) : namePhones.has(key))) { skipped++; continue; }

    await sql`
      INSERT INTO event_guests (user_page_id, name, email, phone, status, guests, invitation_note)
      VALUES (${pageId}, ${name}, ${email}, ${phone}, 'invited', ${guests}, ${note})
    `;
    if (email) emails.add(email);
    namePhones.add(key);
    imported++;
  }

  return NextResponse.json({ success: true, imported, skipped });
}
