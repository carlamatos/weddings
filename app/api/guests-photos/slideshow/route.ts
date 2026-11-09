import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { verifyPageToken } from '@/app/lib/page-token';
import { guestAccessDenied, guestPageOffline, PAGE_UNAVAILABLE_ERROR } from '@/app/lib/page-access';
import { fetchPageSettings } from '@/app/lib/data';
import { areGuestPhotosOn } from '@/app/lib/guest-photos';
import { isSlideshowLive } from '@/app/lib/slideshow';
import { fetchSlideshowPhotos } from '@/app/lib/slideshow-data';

// The live slideshow (<page>/slideshow) asks for the photo list every few
// seconds: new uploads join the show, and photos the host deletes leave it.
// Takes the signed page token the slideshow was rendered with.
export async function GET(request: Request) {
  const pageId = verifyPageToken(new URL(request.url).searchParams.get('t'));
  if (pageId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (await guestPageOffline(pageId)) return NextResponse.json({ error: PAGE_UNAVAILABLE_ERROR }, { status: 404 });
  if (await guestAccessDenied(request, pageId)) return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });

  const [page, settings] = await Promise.all([
    sql<{ plan_type: string | null; user_id: string }>`SELECT plan_type, user_id FROM user_page WHERE id = ${pageId} LIMIT 1`,
    fetchPageSettings(pageId),
  ]);
  const row = page.rows[0];
  const isPaid = row?.plan_type === 'paid';
  if (!isSlideshowLive(isPaid, areGuestPhotosOn(settings, isPaid))) {
    const session = await auth();
    if (!row || session?.user?.id !== row.user_id) return NextResponse.json({ error: 'The slideshow is off.' }, { status: 403 });
  }

  try {
    const photos = await fetchSlideshowPhotos(pageId);
    return NextResponse.json({ photos }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Failed to fetch slideshow photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
