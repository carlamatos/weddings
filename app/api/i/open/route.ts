import { markInviteOpened, verifyInviteToken } from '@/app/lib/invite-tracking';

// The tiny image in an invitation email: the guest's email app loading it
// marks the invitation "Opened" on the host's guest list
// (app/lib/invite-tracking.ts). Always answers with the image, never cached.
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

export async function GET(req: Request) {
  const ref = verifyInviteToken(new URL(req.url).searchParams.get('t'));
  if (ref?.kind === 'guest') {
    try {
      await markInviteOpened(ref.guestId);
    } catch (error) {
      console.error('Failed to record invitation open:', error);
    }
  }
  return new Response(new Uint8Array(GIF), {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, max-age=0', 'X-Robots-Tag': 'noindex' },
  });
}
