import { NextResponse } from 'next/server';
import { verifyUnsubscribe } from '@/app/lib/unsubscribe-token';
import { unsubscribeGuest } from '@/app/lib/unsubscribe';
import { unsubscribeFromNewsletter, verifyNewsletterUnsubscribe } from '@/app/lib/newsletter';

// RFC 8058 one-click unsubscribe: mail apps (Gmail, Apple Mail) POST here
// from the List-Unsubscribe header without opening a page.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  // Newsletter emails carry ?n=<email> instead of a guest id.
  if (searchParams.has('n')) {
    const email = verifyNewsletterUnsubscribe(searchParams.get('n'), searchParams.get('t'));
    if (!email) return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    await unsubscribeFromNewsletter(email);
    return NextResponse.json({ ok: true });
  }
  const guestId = verifyUnsubscribe(searchParams.get('g'), searchParams.get('t'));
  if (!guestId) return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
  await unsubscribeGuest(guestId);
  return NextResponse.json({ ok: true });
}
