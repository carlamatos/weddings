import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/ogg',
];

export async function POST(request: Request): Promise<NextResponse> {
  // After upload Vercel Blob sends a server-to-server callback to this route.
  // We don't need to act on it — the client saves the URL via updateBannerImage.
  const body = await request.json() as { type?: string; payload?: { pathname?: string } };
  if (body.type === 'blob.upload-completed') {
    return NextResponse.json({ response: 'ok' });
  }

  // Token generation: verify browser session (this request comes from the browser)
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Vercel Blob is not configured (BLOB_READ_WRITE_TOKEN missing).' },
      { status: 500 },
    );
  }

  const pathname = body.payload?.pathname ?? `banners/${Date.now()}`;

  try {
    const validUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    const clientToken = await generateClientTokenFromReadWriteToken({
      token,
      pathname,
      allowedContentTypes: ALLOWED_VIDEO_TYPES,
      maximumSizeInBytes: 200 * 1024 * 1024,
      validUntil,
    });
    return NextResponse.json({ clientToken });
  } catch (err) {
    console.error('generateClientTokenFromReadWriteToken error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
