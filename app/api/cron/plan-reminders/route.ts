import { NextResponse } from 'next/server';
import { sendPlanReminders } from '@/app/lib/plan-reminders';
import { timingSafeStringEqual } from '@/app/lib/timing-safe-equal';

// Called once a day by Vercel Cron (see vercel.json): reminder emails from
// hosts' saved plans, the RSVP timeline's dates and budget payments due
// (app/lib/plan-reminders.ts). Vercel sends "Authorization: Bearer
// $CRON_SECRET"; without that variable the endpoint refuses every call.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization') ?? '';
  if (!secret || !timingSafeStringEqual(provided, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const results = await sendPlanReminders();
  return NextResponse.json({ ok: true, results });
}
