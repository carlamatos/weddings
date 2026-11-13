import { NextResponse } from 'next/server';
import { guestAccessDenied, guestPageOffline, PAGE_UNAVAILABLE_ERROR } from '@/app/lib/page-access';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import { verifyPageToken } from '@/app/lib/page-token';
import { ownsPage, parsePageId } from '@/app/lib/data';
import { ensureLiveTables } from '@/app/lib/live-db';

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  // Guests present the signed token minted when the wedding page was rendered,
  // so raw sequential ids can't be enumerated. A signed-in owner (dashboard)
  // may instead pass the raw id of a page they own.
  const param = searchParams.get('userPageId');
  let pageId = verifyPageToken(param);
  if (pageId !== null && (await guestPageOffline(pageId))) {
    return NextResponse.json({ error: PAGE_UNAVAILABLE_ERROR }, { status: 404 });
  }
  if (pageId !== null && (await guestAccessDenied(request, pageId))) {
    return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });
  }
  let owner = false;
  if (pageId === null) {
    const session = await auth();
    const raw = parsePageId(param);
    if (session?.user?.id && raw !== null && (await ownsPage(session.user.id, raw))) { pageId = raw; owner = true; }
  }
  if (pageId === null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Guests never see photos the host hid; the host's dashboard lists them all.
    await ensureLiveTables();
    const data = await sql`
      SELECT id, photo, uploaded_at, hidden
      FROM guests_photos
      WHERE user_page_id = ${pageId} AND (${owner} OR NOT hidden)
      ORDER BY uploaded_at DESC
      LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
    `;
    const rows = data.rows;
    const hasMore = rows.length > PAGE_SIZE;
    return NextResponse.json({
      photos: hasMore ? rows.slice(0, PAGE_SIZE) : rows,
      hasMore,
    });
  } catch (err) {
    console.error('Failed to fetch guest photos:', err);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get('id');
  if (!photoId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Only delete if the photo belongs to the authenticated user's page
    await sql`
      DELETE FROM guests_photos
      WHERE id = ${photoId}
        AND user_page_id IN (SELECT id FROM user_page WHERE user_id = ${session.user.id})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete guest photo:', err);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}

// The host hides a photo from the page and slideshow, or shows it again.
// Hidden photos stay in the dashboard and in "Download all".
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!/^[0-9a-f-]{36}$/i.test(id) || typeof body?.hidden !== 'boolean') return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  try {
    await ensureLiveTables();
    const r = await sql`
      UPDATE guests_photos SET hidden = ${body.hidden}
      WHERE id = ${id} AND user_page_id IN (SELECT id FROM user_page WHERE user_id = ${session.user.id})`;
    if (!r.rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to hide guest photo:', err);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}
