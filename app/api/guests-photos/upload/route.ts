import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { isSafeImage, optimizeImage } from '@/app/lib/image-processing';

// Simple in-memory rate limiter: max 10 uploads per IP per hour
const ipStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = ipStore.get(ip);
  if (!rec || now > rec.resetAt) return false;
  return rec.count >= MAX_PER_IP;
}

function recordUpload(ip: string): void {
  const now = Date.now();
  const rec = ipStore.get(ip);
  if (!rec || now > rec.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count++;
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }

  const formData = await request.formData();
  const userPageId = formData.get('userPageId') as string | null;
  const file = formData.get('file') as File | null;

  if (!userPageId) {
    return NextResponse.json({ error: 'Missing userPageId' }, { status: 400 });
  }
  if (!file || !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  // Verify the page exists and is paid
  const pageResult = await sql`
    SELECT plan_type FROM user_page WHERE id = ${userPageId} LIMIT 1
  `;
  if (!pageResult.rows[0] || pageResult.rows[0].plan_type !== 'paid') {
    return NextResponse.json({ error: 'Feature not available' }, { status: 403 });
  }

  try {
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const { safe, reason } = await isSafeImage(rawBuffer);
    if (!safe) return NextResponse.json({ error: reason }, { status: 422 });

    const buffer = await optimizeImage(rawBuffer);
    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`guests/${userPageId}-${Date.now()}.webp`, buffer, {
        access: 'public',
        contentType: 'image/webp',
      });
      url = blob.url;
    } else {
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      const filename = `guest-${userPageId}-${Date.now()}.webp`;
      const dir = join(process.cwd(), 'public', 'uploads');
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, filename), buffer);
      url = `/uploads/${filename}`;
    }

    const result = await sql`
      INSERT INTO guests_photos (user_page_id, photo, ip_address)
      VALUES (${userPageId}, ${url}, ${ip})
      RETURNING id, uploaded_at
    `;

    recordUpload(ip);

    return NextResponse.json({ url, id: result.rows[0].id, uploaded_at: result.rows[0].uploaded_at });
  } catch (err) {
    console.error('Guest photo upload error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
