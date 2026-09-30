import { NextResponse } from 'next/server';
import { sendDueReminders } from '@/app/lib/reminder-send';
import { timingSafeStringEqual } from '@/app/lib/timing-safe-equal';

// Called once a day by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer $CRON_SECRET" when the CRON_SECRET env var is set;
// without that variable the endpoint refuses every call.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization') ?? '';
  if (!secret || !timingSafeStringEqual(provided, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const results = await sendDueReminders();
  return NextResponse.json({ ok: true, results });
}
