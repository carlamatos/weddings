import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@vercel/postgres';
import { parsePageId } from '@/app/lib/data';
import { isSafeImage, optimizeImage } from '@/app/lib/image-processing';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const formData = await request.formData();
  const pageId = parsePageId(formData.get('pageId'));
  if (pageId === null) {
    return NextResponse.json({ error: 'Missing page' }, { status: 400 });
  }

  // The page must belong to this user; its plan and its own gallery decide the limit.
  const pageResult = await sql`SELECT plan_type FROM user_page WHERE id = ${pageId} AND user_id = ${userId}`;
  if (!pageResult.rows[0]) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  const isPaid = pageResult.rows[0].plan_type === 'paid';
  const MAX_IMAGES = isPaid ? 100 : 8;

  const countResult = await sql`SELECT COUNT(*) as count FROM event_gallery WHERE user_page_id = ${pageId}`;
  const currentCount = parseInt(countResult.rows[0]?.count ?? '0', 10);
  if (currentCount >= MAX_IMAGES) {
    return NextResponse.json(
      { error: `Gallery limit reached (${MAX_IMAGES} photos maximum).` },
      { status: 403 }
    );
  }

  const file = formData.get('file') as File | null;

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  try {
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    const { safe, reason } = await isSafeImage(rawBuffer);
    if (!safe) return NextResponse.json({ error: reason }, { status: 422 });

    const buffer = await optimizeImage(rawBuffer);

    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`gallery/${session.user.id}-${Date.now()}.webp`, buffer, {
        access: 'public',
        contentType: 'image/webp',
      });
      return NextResponse.json({ url: blob.url });
    }

    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const filename = `gallery-${session.user.id}-${Date.now()}.webp`;
    const dir = join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });

  } catch (err) {
    console.error('Gallery upload error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
