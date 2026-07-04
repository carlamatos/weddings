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
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Runs only for the browser's token request — session cookies are present.
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');
        return {
          allowedContentTypes: ALLOWED_VIDEO_TYPES,
          maximumSizeInBytes: 200 * 1024 * 1024,
          tokenPayload: session.user.id,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Runs via a server-to-server callback from Vercel Blob — no browser
        // session is present. The URL is saved by the client via updateBannerImage.
        console.log('Video uploaded:', blob.url, 'user:', tokenPayload);
      },
    });
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
