import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyPageToken } from '@/app/lib/page-token';
import { fetchPageSettings } from '@/app/lib/data';
import { guestAccessDenied } from '@/app/lib/page-access';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { isPotluckOn, POTLUCK_ITEMS_MAX, POTLUCK_MAX_ENTRIES, POTLUCK_NAME_MAX, POTLUCK_NOTE_MAX, publicName } from '@/app/lib/potluck';

const HOUR_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// A guest says what they're bringing. One entry per email per page: sending
// again with the same email updates it.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || body.honeypot) return NextResponse.json({ ok: true });

    if (await overRateLimit(`potluck:${clientIp(request.headers)}`, 30, HOUR_MS)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const pageId = verifyPageToken(typeof body.token === 'string' ? body.token : null);
    if (pageId === null) return NextResponse.json({ error: 'Page not found.' }, { status: 404 });

    const name = field(body.name, POTLUCK_NAME_MAX);
    const email = field(body.email, 254).toLowerCase();
    const items = field(body.items, POTLUCK_ITEMS_MAX);
    const note = field(body.note, POTLUCK_NOTE_MAX) || null;
    if (!name || !items) return NextResponse.json({ error: 'Please add your name and what you’re bringing.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });

    const [page, settings] = await Promise.all([
      sql`SELECT plan_type FROM user_page WHERE id = ${pageId} AND COALESCE(status, 'active') <> 'inactive' LIMIT 1`,
      fetchPageSettings(pageId),
    ]);
    if (page.rows[0]?.plan_type !== 'paid' || !isPotluckOn(settings)) {
      return NextResponse.json({ error: 'Potluck sign-ups are closed.' }, { status: 403 });
    }
    if (await guestAccessDenied(request, pageId)) {
      return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });
    }

    const count = await sql`SELECT COUNT(*)::int AS n FROM page_potluck WHERE user_page_id = ${pageId}`;
    const existing = await sql`SELECT id FROM page_potluck WHERE user_page_id = ${pageId} AND lower(email) = ${email} LIMIT 1`;
    if (!existing.rows[0] && count.rows[0].n >= POTLUCK_MAX_ENTRIES) {
      return NextResponse.json({ error: 'This potluck is full.' }, { status: 403 });
    }

    const result = await sql`
      INSERT INTO page_potluck (user_page_id, name, email, items, note)
      VALUES (${pageId}, ${name}, ${email}, ${items}, ${note})
      ON CONFLICT (user_page_id, (lower(email)))
      DO UPDATE SET name = EXCLUDED.name, items = EXCLUDED.items, note = EXCLUDED.note, updated_at = NOW()
      RETURNING (xmax <> 0) AS updated
    `;
    return NextResponse.json({ ok: true, updated: !!result.rows[0]?.updated, entry: { name: publicName(name), items } });
  } catch (err) {
    console.error('Potluck submission failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
