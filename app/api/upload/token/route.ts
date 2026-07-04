import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/ogg',
];

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_VIDEO_TYPES,
        maximumSizeInBytes: 200 * 1024 * 1024,
        tokenPayload: session.user!.id,
      }),
      onUploadCompleted: async ({ blob }) => {
        // URL is saved to the DB by the client via updateBannerImage after upload completes.
        console.log('Video uploaded:', blob.url);
      },
    });
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
