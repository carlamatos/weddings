import { purgeExpiredPages } from '@/app/lib/page-trash';
import { runCron } from '@/app/lib/cron-log';

// Called once a day by Vercel Cron (see vercel.json): permanently removes
// event pages that have been in the trash for 30 days, with their files.
// Same CRON_SECRET check as /api/cron/reminders.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  return runCron(request, 'purge-deleted-pages', async () => ({ ...(await purgeExpiredPages()) }));
}
