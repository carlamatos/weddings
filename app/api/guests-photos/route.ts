import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';

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
      SELECT id, photo, uploaded_at
      FROM guests_photos
      WHERE user_page_id = ${userPageId}
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
        AND user_page_id = (SELECT id FROM user_page WHERE user_id = ${session.user.id} LIMIT 1)
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete guest photo:', err);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
