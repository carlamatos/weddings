import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isSafeImage, optimizeImage } from '@/app/lib/image-processing';

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  'video/mp4':       'mp4',
  'video/quicktime': 'mov',
  'video/webm':      'webm',
  'video/ogg':       'ogv',
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type in ALLOWED_VIDEO_TYPES;

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'Only images and videos are supported.' }, { status: 400 });
  }

  try {
    // ── VIDEO ────────────────────────────────────────────────
    if (isVideo) {
      if (file.size > MAX_VIDEO_BYTES) {
        return NextResponse.json({ error: 'Video must be under 200 MB.' }, { status: 400 });
      }

      const ext = ALLOWED_VIDEO_TYPES[file.type];
      const buffer = Buffer.from(await file.arrayBuffer());

      if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
        const { put } = await import('@vercel/blob');
        const blob = await put(`banners/${session.user.id}-${Date.now()}.${ext}`, buffer, {
          access: 'public',
          contentType: file.type,
        });
        return NextResponse.json({ url: blob.url });
      }

      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      const filename = `${session.user.id}-${Date.now()}.${ext}`;
      const dir = join(process.cwd(), 'public', 'uploads');
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, filename), buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    }

    // ── IMAGE ────────────────────────────────────────────────
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    const { safe, reason } = await isSafeImage(rawBuffer);
    if (!safe) return NextResponse.json({ error: reason }, { status: 422 });

    const buffer = await optimizeImage(rawBuffer);

    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`banners/${session.user.id}-${Date.now()}.webp`, buffer, {
        access: 'public',
        contentType: 'image/webp',
      });
      return NextResponse.json({ url: blob.url });
    }

    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const filename = `${session.user.id}-${Date.now()}.webp`;
    const dir = join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
