import { sendPlanReminders } from '@/app/lib/plan-reminders';
import { sendGiftExchangeReminders } from '@/app/lib/gift-exchange-reminders';
import { sendPhotosReadyEmails, sendUpgradeEmails } from '@/app/lib/event-emails';
import { runCron } from '@/app/lib/cron-log';

// Called once a day by Vercel Cron (see vercel.json): reminder emails from
// hosts' saved plans, the RSVP timeline's dates and budget payments due
// (app/lib/plan-reminders.ts), and the Gift Exchange reminders a week and a
// day before each exchange (app/lib/gift-exchange-reminders.ts), and the
// emails around the event date (app/lib/event-emails.ts). Vercel sends "Authorization: Bearer
// $CRON_SECRET"; without that variable the endpoint refuses every call.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  return runCron(request, 'plan-reminders', async () => ({ results: await sendPlanReminders(), giftExchange: await sendGiftExchangeReminders(), upgrade: await sendUpgradeEmails(), photosReady: await sendPhotosReadyEmails() }));
}
