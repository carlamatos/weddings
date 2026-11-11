import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { timingSafeStringEqual } from './timing-safe-equal';

// Every scheduled job (vercel.json) runs through runCron, which checks
// Vercel's "Authorization: Bearer $CRON_SECRET" and remembers how each call
// went in cron_runs: one row per job and outcome, with the last time and a
// count. The admin's Activity tab shows it, so a job that never runs (no
// CRON_SECRET in the environment, crons not set up) is plain to see.

export type CronOutcome = 'ok' | 'failed' | 'refused_no_secret' | 'refused_wrong_secret';

export type CronRunRow = { job: string; outcome: CronOutcome; last_at: Date; count: number; detail: string | null };

let tableReady: Promise<unknown> | null = null;
export function ensureCronRunsTable(): Promise<unknown> {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS cron_runs (
      job TEXT NOT NULL,
      outcome TEXT NOT NULL,
      last_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      count INTEGER NOT NULL DEFAULT 1,
      detail TEXT,
      PRIMARY KEY (job, outcome)
    )
  `.catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

async function logRun(job: string, outcome: CronOutcome, detail: unknown) {
  try {
    await ensureCronRunsTable();
    const text = detail == null ? null : (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 500);
    await sql`
      INSERT INTO cron_runs (job, outcome, last_at, count, detail) VALUES (${job}, ${outcome}, NOW(), 1, ${text})
      ON CONFLICT (job, outcome) DO UPDATE SET last_at = NOW(), count = cron_runs.count + 1, detail = EXCLUDED.detail
    `;
  } catch (error) {
    console.error('Failed to log cron run:', error);
  }
}

export async function runCron(request: Request, job: string, work: () => Promise<Record<string, unknown>>) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization') ?? '';
  if (!secret) {
    await logRun(job, 'refused_no_secret', 'CRON_SECRET is not set in this environment');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!timingSafeStringEqual(provided, `Bearer ${secret}`)) {
    // Only Vercel's own calls are worth a row; anyone can knock on the URL.
    if (request.headers.get('user-agent')?.includes('vercel-cron')) await logRun(job, 'refused_wrong_secret', null);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const results = await work();
    await logRun(job, 'ok', results);
    return NextResponse.json({ ok: true, ...results });
  } catch (error) {
    await logRun(job, 'failed', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function fetchCronRuns(): Promise<CronRunRow[]> {
  await ensureCronRunsTable();
  const { rows } = await sql<CronRunRow>`SELECT job, outcome, last_at, count, detail FROM cron_runs ORDER BY job, last_at DESC`;
  return rows;
}
