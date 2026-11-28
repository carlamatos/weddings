import { NextResponse } from 'next/server';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { isBot, recordPageView } from '@/app/lib/page-views';
import { recordBreakdown, visitCountry, visitDevice, visitSource } from '@/app/lib/visit-sources';

// A guest looked at an event page (app/ui/page-view-beacon.tsx). Body:
// { p: page id, v: true when this browser hasn't seen the page today,
//   n: true when it has never seen the page, and with a first view of the
//   day r: the referrer and u: the page link's utm_source }. A first view of
//   the day also counts its source, country and device
//   (app/lib/visit-sources.ts: labels only, nothing about the person).
// Always answers 204, so the page never waits on it or shows an error.
export async function POST(req: Request) {
  const done = new NextResponse(null, { status: 204 });
  if (isBot(req.headers.get('user-agent'))) return done;
  const body = (await req.json().catch(() => null)) as { p?: unknown; v?: unknown; n?: unknown; r?: unknown; u?: unknown } | null;
  const pageId = Number(body?.p);
  if (!Number.isInteger(pageId) || pageId <= 0) return done;
  try {
    // A generous cap per address, so a reload loop can't inflate a page.
    if (await overRateLimit(`view:${clientIp(req.headers)}:${pageId}`, 120, 60 * 60 * 1000)) return done;
    await recordPageView(pageId, body?.v === true, body?.n === true);
    if (body?.v === true) {
      const ua = req.headers.get('user-agent');
      const host = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '').split(':')[0];
      await recordBreakdown(pageId, visitSource(body.r, body.u, ua, host), visitCountry(req.headers), visitDevice(ua));
    }
  } catch (error) {
    console.error('Failed to record page view:', error);
  }
  return done;
}
