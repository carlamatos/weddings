import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { verifyPageToken } from '@/app/lib/page-token';
import { fetchPageSettings } from '@/app/lib/data';
import { guestAccessDenied, guestPageOffline, PAGE_UNAVAILABLE_ERROR } from '@/app/lib/page-access';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { ensureLiveTables } from '@/app/lib/live-db';
import { areGuestMessagesOn, GUEST_MESSAGE_BODY_MAX, GUEST_MESSAGE_NAME_MAX } from '@/app/lib/guest-messages';
import { fetchGuestMessages } from '@/app/lib/guest-messages-data';

const HOUR_MS = 60 * 60 * 1000;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, max) : '');

// Guests post to the wall only on a Live Party page with messages switched on.
async function wallOpen(pageId: number): Promise<boolean> {
  const [page, settings] = await Promise.all([
    sql<{ plan_type: string | null }>`SELECT plan_type FROM user_page WHERE id = ${pageId} AND COALESCE(status, 'active') NOT IN ('inactive', 'suspended', 'draft') LIMIT 1`,
    fetchPageSettings(pageId),
  ]);
  return page.rows[0]?.plan_type === 'paid' && areGuestMessagesOn(settings);
}

// The wall for the slideshow and memories page (signed page token ?t=).
export async function GET(request: Request) {
  const pageId = verifyPageToken(new URL(request.url).searchParams.get('t'));
  if (pageId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (await guestPageOffline(pageId)) return NextResponse.json({ error: PAGE_UNAVAILABLE_ERROR }, { status: 404 });
  if (await guestAccessDenied(request, pageId)) return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });
  if (!(await wallOpen(pageId))) return NextResponse.json({ messages: [] });
  const messages = (await fetchGuestMessages(pageId)).map(({ id, name, body }) => ({ id, name, body }));
  return NextResponse.json({ messages }, { headers: { 'Cache-Control': 'no-store' } });
}

// A guest leaves a message.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || body.honeypot) return NextResponse.json({ ok: true });
    if (await overRateLimit(`guest-message:${clientIp(request.headers)}`, 10, HOUR_MS)) {
      return NextResponse.json({ error: 'You’ve left a lot of messages. Please try again later.' }, { status: 429 });
    }
    const pageId = verifyPageToken(typeof body.token === 'string' ? body.token : null);
    if (pageId === null) return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    if (await guestPageOffline(pageId)) return NextResponse.json({ error: PAGE_UNAVAILABLE_ERROR }, { status: 404 });
    if (await guestAccessDenied(request, pageId)) return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });
    const name = clean(body.name, GUEST_MESSAGE_NAME_MAX);
    const text = clean(body.body, GUEST_MESSAGE_BODY_MAX);
    if (!name || !text) return NextResponse.json({ error: 'Please add your name and a message.' }, { status: 400 });
    if (!(await wallOpen(pageId))) return NextResponse.json({ error: 'Messages are closed.' }, { status: 403 });
    await ensureLiveTables();
    await sql`INSERT INTO page_guest_messages (user_page_id, name, body, ip_address) VALUES (${pageId}, ${name}, ${text}, ${clientIp(request.headers)})`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Guest message failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// The host hides a message (or shows it again).
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(body?.id) || typeof body?.hidden !== 'boolean') return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  await ensureLiveTables();
  const r = await sql`
    UPDATE page_guest_messages SET hidden = ${body.hidden}
    WHERE id = ${body.id} AND user_page_id IN (SELECT id FROM user_page WHERE user_id = ${session.user.id})`;
  return r.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// The host deletes a message.
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  await ensureLiveTables();
  const r = await sql`
    DELETE FROM page_guest_messages
    WHERE id = ${id} AND user_page_id IN (SELECT id FROM user_page WHERE user_id = ${session.user.id})`;
  return r.rowCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}
