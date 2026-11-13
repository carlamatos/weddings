import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { sql } from '@vercel/postgres';
import { verifyPageToken } from '@/app/lib/page-token';
import { guestAccessDenied, guestPageOffline, PAGE_UNAVAILABLE_ERROR } from '@/app/lib/page-access';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { ensureLiveTables } from '@/app/lib/live-db';

// A guest upvotes a requested song (Live Party). One vote per song per guest,
// counted by a hash of their connection (never stored as is), so the DJ's
// list is sorted by what the room wants.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = verifyPageToken(typeof body?.token === 'string' ? body.token : null);
  const songId = typeof body?.songId === 'string' && /^[0-9a-f-]{36}$/i.test(body.songId) ? body.songId : null;
  if (pageId === null || !songId) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  if (await guestPageOffline(pageId)) return NextResponse.json({ error: PAGE_UNAVAILABLE_ERROR }, { status: 404 });
  if (await guestAccessDenied(request, pageId)) return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });
  const ip = clientIp(request.headers);
  if (await overRateLimit(`song-vote:${ip}`, 60, 60 * 60 * 1000)) return NextResponse.json({ error: 'Too many votes. Please try again later.' }, { status: 429 });
  try {
    await ensureLiveTables();
    const page = await sql`SELECT plan_type FROM user_page WHERE id = ${pageId} LIMIT 1`;
    if (page.rows[0]?.plan_type !== 'paid') return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
    const voter = createHash('sha256').update(`${pageId}:${ip}:${process.env.AUTH_SECRET ?? ''}`).digest('hex').slice(0, 32);
    const song = await sql`SELECT 1 FROM guests_songs WHERE id = ${songId} AND user_page_id = ${pageId}`;
    if (!song.rowCount) return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    await sql`INSERT INTO guests_song_votes (song_id, voter) VALUES (${songId}, ${voter}) ON CONFLICT DO NOTHING`;
    const r = await sql<{ votes: number }>`
      UPDATE guests_songs SET votes = (SELECT COUNT(*)::int FROM guests_song_votes WHERE song_id = ${songId})
      WHERE id = ${songId} RETURNING votes`;
    return NextResponse.json({ votes: r.rows[0]?.votes ?? 0 });
  } catch (err) {
    console.error('Song vote failed:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
