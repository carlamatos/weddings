import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isSafeImage, optimizeImage } from '@/app/lib/image-processing';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  try {
    // Images only — videos use /api/upload/token for client-side direct upload
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
