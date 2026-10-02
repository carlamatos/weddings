import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchOwnedPage, parsePageId } from '@/app/lib/data';
import { createPlusCheckout } from '@/app/lib/plus-checkout';

// Buy (or extend) Plus for one of the user's event pages. Plus is charged
// per event, so a page id is required.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const body = (await req.json().catch(() => ({}))) as { pageId?: unknown };
  const pageId = parsePageId(body.pageId);
  if (pageId === null) {
    return NextResponse.json({ error: 'Choose an event page to upgrade.' }, { status: 400 });
  }

  const page = await fetchOwnedPage(userId, pageId);
  if (!page) {
    return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
  }
  // A currently-live paid term blocks re-purchase; an expired one (dropped
  // to plan_type 'free' by expireIfPast) is exactly what "extend" is for.
  if (page.plan_type === 'paid') {
    return NextResponse.json({ error: 'This page is already on the paid plan.' }, { status: 400 });
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const url = await createPlusCheckout({ userId, email: session.user.email ?? undefined, pageId, origin });
  return NextResponse.json({ url });
}
