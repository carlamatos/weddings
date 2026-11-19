import { sendPublishedPagesDigest } from '@/app/lib/admin-notify';
import { runCron } from '@/app/lib/cron-log';

// Called once a day by Vercel Cron (see vercel.json) at 07:50 UTC — 11:50 pm
// Pacific in winter, 12:50 am in summer (it reports the day that just ended
// either way): emails the super admins the pages published that day, with
// their links, and the pages that got their first guest reply
// (app/lib/admin-notify.ts). Vercel sends "Authorization: Bearer
// $CRON_SECRET"; without that variable the endpoint refuses every call.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  return runCron(request, 'daily-digest', async () => await sendPublishedPagesDigest());
}
