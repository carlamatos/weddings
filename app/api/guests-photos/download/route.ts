import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import JSZip from 'jszip';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userPageId = req.nextUrl.searchParams.get('userPageId');
  if (!userPageId) {
    return NextResponse.json({ error: 'Missing userPageId' }, { status: 400 });
  }

  // Verify the page belongs to this user
  const pageCheck = await sql`
    SELECT id FROM user_page WHERE id = ${userPageId} AND user_id = ${session.user.id} LIMIT 1
  `;
  if (!pageCheck.rows[0]) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await sql`
    SELECT id, photo, uploaded_at FROM guests_photos
    WHERE user_page_id = ${userPageId}
    ORDER BY uploaded_at ASC
  `;

  const photos = result.rows;

  if (photos.length === 0) {
    return NextResponse.json({ error: 'No photos to download' }, { status: 404 });
  }

  const zip = new JSZip();

  await Promise.all(
    photos.map(async (p, i) => {
      try {
        const res = await fetch(p.photo as string);
        if (!res.ok) return;
        const buffer = await res.arrayBuffer();
        const ext = (p.photo as string).split('?')[0].split('.').pop() ?? 'jpg';
        const date = new Date(p.uploaded_at as string).toISOString().slice(0, 10);
        zip.file(`photo-${String(i + 1).padStart(3, '0')}-${date}.${ext}`, buffer);
      } catch {
        // skip failed fetches
      }
    })
  );

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="guest-photos.zip"',
    },
  });
}
