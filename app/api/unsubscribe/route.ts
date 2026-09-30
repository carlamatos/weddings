import { NextResponse } from 'next/server';
import { verifyUnsubscribe } from '@/app/lib/unsubscribe-token';
import { unsubscribeGuest } from '@/app/lib/unsubscribe';

// RFC 8058 one-click unsubscribe: mail apps (Gmail, Apple Mail) POST here
// from the List-Unsubscribe header without opening a page.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const guestId = verifyUnsubscribe(searchParams.get('g'), searchParams.get('t'));
  if (!guestId) return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
  await unsubscribeGuest(guestId);
  return NextResponse.json({ ok: true });
}
