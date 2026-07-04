import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

// Simple in-memory rate limiter: max 20 submissions per IP per hour
const ipStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = ipStore.get(ip);
  if (!rec || now > rec.resetAt) return false;
  return rec.count >= MAX_PER_IP;
}

function recordSubmission(ip: string): void {
  const now = Date.now();
  const rec = ipStore.get(ip);
  if (!rec || now > rec.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count++;
  }
}

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userPageId = searchParams.get('userPageId');
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  if (!userPageId) {
    return NextResponse.json({ error: 'Missing userPageId' }, { status: 400 });
  }

  try {
    const data = await sql`
      SELECT id, requester_name, song_title, artist, created_at
      FROM guests_songs
      WHERE user_page_id = ${userPageId}
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
    `;
    const rows = data.rows;
    const hasMore = rows.length > PAGE_SIZE;
    return NextResponse.json({ songs: hasMore ? rows.slice(0, PAGE_SIZE) : rows, hasMore });
  } catch (err) {
    console.error('Failed to fetch song requests:', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const { userPageId, requesterName, songTitle, artist } = body ?? {};

  if (!userPageId || !requesterName?.trim() || !songTitle?.trim() || !artist?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  // Verify paid plan
  const pageResult = await sql`
    SELECT plan_type FROM user_page WHERE id = ${userPageId} LIMIT 1
  `;
  if (!pageResult.rows[0] || pageResult.rows[0].plan_type !== 'paid') {
    return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
  }

  try {
    const result = await sql`
      INSERT INTO guests_songs (user_page_id, requester_name, song_title, artist, ip_address)
      VALUES (${userPageId}, ${requesterName.trim()}, ${songTitle.trim()}, ${artist.trim()}, ${ip})
      RETURNING id, requester_name, song_title, artist, created_at
    `;
    recordSubmission(ip);
    return NextResponse.json({ song: result.rows[0] });
  } catch (err) {
    console.error('Failed to save song request:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const songId = searchParams.get('id');
  if (!songId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    await sql`
      DELETE FROM guests_songs
      WHERE id = ${songId}
        AND user_page_id = (SELECT id FROM user_page WHERE user_id = ${session.user.id} LIMIT 1)
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete song request:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
