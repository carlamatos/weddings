import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { isDjKey } from '@/app/lib/dj-token';
import { ensureLiveTables } from '@/app/lib/live-db';

type DjSong = { id: string; song_title: string; artist: string; requester_name: string; votes: number; played_at: string | null; created_at: string };

// The DJ's queue: the page's requests by votes (then oldest first), played
// songs last. Needs the DJ's private key (app/lib/dj-token.ts).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = Number(searchParams.get('p'));
  if (!Number.isInteger(pageId) || !isDjKey(pageId, searchParams.get('k'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureLiveTables();
  const { rows } = await sql<DjSong>`
    SELECT id, song_title, artist, requester_name, votes, played_at, created_at FROM guests_songs
    WHERE user_page_id = ${pageId}
    ORDER BY (played_at IS NOT NULL), votes DESC, created_at ASC
    LIMIT 300`;
  return NextResponse.json({ songs: rows }, { headers: { 'Cache-Control': 'no-store' } });
}

// The DJ marks a song played (or not).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pageId = Number(body?.p);
  const songId = typeof body?.songId === 'string' && /^[0-9a-f-]{36}$/i.test(body.songId) ? body.songId : null;
  if (!Number.isInteger(pageId) || !isDjKey(pageId, body?.k) || !songId || typeof body?.played !== 'boolean') return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  await ensureLiveTables();
  await sql`UPDATE guests_songs SET played_at = ${body.played ? new Date().toISOString() : null} WHERE id = ${songId} AND user_page_id = ${pageId}`;
  return NextResponse.json({ ok: true });
}
