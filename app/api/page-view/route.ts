import { NextResponse } from 'next/server';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { isBot, recordPageView } from '@/app/lib/page-views';

// A guest looked at an event page (app/ui/page-view-beacon.tsx). Body:
// { p: page id, v: true when this browser hasn't seen the page today,
//   n: true when it has never seen the page }.
// Always answers 204, so the page never waits on it or shows an error.
export async function POST(req: Request) {
  const done = new NextResponse(null, { status: 204 });
  if (isBot(req.headers.get('user-agent'))) return done;
  const body = (await req.json().catch(() => null)) as { p?: unknown; v?: unknown; n?: unknown } | null;
  const pageId = Number(body?.p);
  if (!Number.isInteger(pageId) || pageId <= 0) return done;
  try {
    // A generous cap per address, so a reload loop can't inflate a page.
    if (await overRateLimit(`view:${clientIp(req.headers)}:${pageId}`, 120, 60 * 60 * 1000)) return done;
    await recordPageView(pageId, body?.v === true, body?.n === true);
  } catch (error) {
    console.error('Failed to record page view:', error);
  }
  return done;
}
