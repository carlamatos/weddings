import { NextResponse } from 'next/server';
import { verifyPageToken } from '@/app/lib/page-token';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { searchSongs } from '@/app/lib/song-search';

// Song suggestions while a guest types a title (iTunes). An empty list just
// means the guest types the artist by hand, as before.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (verifyPageToken(searchParams.get('t')) === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const q = (searchParams.get('q') ?? '').trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ enabled: true, tracks: [] });
  if (await overRateLimit(`song-search:${clientIp(request.headers)}`, 120, 60 * 60 * 1000)) return NextResponse.json({ enabled: true, tracks: [] });
  try {
    return NextResponse.json({ enabled: true, tracks: await searchSongs(q) });
  } catch (err) {
    console.error('Song search failed:', err);
    return NextResponse.json({ enabled: true, tracks: [] });
  }
}
