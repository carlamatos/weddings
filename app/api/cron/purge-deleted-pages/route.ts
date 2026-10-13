import { NextResponse } from 'next/server';
import { purgeExpiredPages } from '@/app/lib/page-trash';
import { timingSafeStringEqual } from '@/app/lib/timing-safe-equal';

// Called once a day by Vercel Cron (see vercel.json): permanently removes
// event pages that have been in the trash for 30 days, with their files.
// Same CRON_SECRET check as /api/cron/reminders.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization') ?? '';
  if (!secret || !timingSafeStringEqual(provided, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const results = await purgeExpiredPages();
  return NextResponse.json({ ok: true, ...results });
}
