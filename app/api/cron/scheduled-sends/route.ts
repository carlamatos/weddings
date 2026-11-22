import { sendDueScheduled } from '@/app/lib/invitation-send';
import { runCron } from '@/app/lib/cron-log';

// Called every hour by Vercel Cron (see vercel.json): sends the invitations
// and save-the-dates hosts scheduled (Invite → Send later). Vercel sends
// "Authorization: Bearer $CRON_SECRET"; without it every call is refused.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  return runCron(request, 'scheduled-sends', async () => ({ results: await sendDueScheduled() }));
}
