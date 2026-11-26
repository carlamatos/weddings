import { fetchPageSettings, fetchUserPage } from '@/app/lib/data';
import { isPageOffline } from '@/app/lib/page-status';
import { mustShowPasswordGate } from '@/app/lib/page-gate';
import { calendarEvent, icsFile } from '@/app/lib/save-the-date';

// /api/calendar/<slug>.ics — the event as a calendar file, for the
// save-the-date's "Apple Calendar" button (app/lib/save-the-date.ts). Phones
// and computers open it in their calendar app. Only for published pages with
// a date, and not past a page password the visitor hasn't entered.
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const notFound = new Response('Not found', { status: 404 });
  const slug = decodeURIComponent((await params).file).replace(/\.ics$/i, '');
  if (!/^[a-z0-9-]+$/.test(slug)) return notFound;
  const page = await fetchUserPage(slug);
  if (!page || isPageOffline(page.status || 'active')) return notFound;
  const settings = await fetchPageSettings(page.id);
  if (await mustShowPasswordGate(page.id, settings, page.plan_type === 'paid')) return notFound;
  const event = calendarEvent(page);
  if (!event) return notFound;
  return new Response(icsFile(event, `page-${page.id}`), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug}.ics"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
