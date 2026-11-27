import { sendPageFollowUps, sendSetupReminders } from '@/app/lib/setup-reminder';
import { sendRemovalWarnings } from '@/app/lib/removal-warning';
import { sendNotOpenedEmails } from '@/app/lib/share-nudge';
import { runCron } from '@/app/lib/cron-log';

// Called once a day by Vercel Cron (see vercel.json): emails accounts that
// signed up without making an event page, and hosts whose new page isn't
// published or shared yet (app/lib/setup-reminder.ts), hosts whose live
// page no one has opened after 2 days (app/lib/share-nudge.ts), and warns never-
// confirmed accounts before they can be removed (app/lib/removal-warning.ts).
// Vercel sends "Authorization: Bearer $CRON_SECRET"; without that variable
// the endpoint refuses every call.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  return runCron(request, 'setup-reminders', async () => ({ noPage: await sendSetupReminders(), pageFollowUps: await sendPageFollowUps(), notOpened: await sendNotOpenedEmails(), removalWarnings: await sendRemovalWarnings() }));
}
