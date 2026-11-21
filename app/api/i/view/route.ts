import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';
import { markInviteViewed, verifyInviteToken } from '@/app/lib/invite-tracking';

// Sent by the invitation page (/i/…) when the guest opens the envelope or
// follows a link from the invitation: marks it "Viewed" on the host's guest
// list. Only from the page's script, so link checkers that just fetch the
// page don't count. The host trying their guests' links doesn't count either.
export async function POST(req: Request) {
  let token: unknown = null;
  try {
    token = (await req.json())?.t;
  } catch {
    token = null;
  }
  const ref = verifyInviteToken(typeof token === 'string' ? token : null);
  if (ref?.kind !== 'guest') return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (userId) {
      const own = await sql`
        SELECT 1 FROM event_guests g JOIN user_page p ON p.id = g.user_page_id
        WHERE g.id = ${ref.guestId}::uuid AND p.user_id = ${userId}
      `;
      if (own.rows.length) return NextResponse.json({ ok: true, host: true });
    }
    await markInviteViewed(ref.guestId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to record invitation view:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
