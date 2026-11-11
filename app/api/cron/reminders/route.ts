import { sendDueReminders } from '@/app/lib/reminder-send';
import { runCron } from '@/app/lib/cron-log';

// Called every hour by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET" when the CRON_SECRET env var is set;
// without that variable the endpoint refuses every call.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  return runCron(request, 'reminders', async () => ({ results: await sendDueReminders() }));
}
