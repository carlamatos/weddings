import { sql } from '@vercel/postgres';

// When hosts come back to their dashboard, for the admin's Activity tab:
// users.first_dashboard_at, last_dashboard_at and dashboard_visits. A visit
// is a stretch of dashboard use; one that starts 30 minutes or more after
// the last counts as a new visit. Written at most every 5 minutes per
// account, after the response (DashboardShell), so screens don't wait on it.

const NEW_VISIT_AFTER = '30 minutes';
const WRITE_EVERY = '5 minutes';

let columnsReady: Promise<unknown> | null = null;
export function ensureVisitColumns(): Promise<unknown> {
  columnsReady ??= sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS first_dashboard_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS last_dashboard_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS dashboard_visits INTEGER NOT NULL DEFAULT 0
  `.catch((error) => { columnsReady = null; throw error; });
  return columnsReady;
}

export async function recordDashboardVisit(userId: string): Promise<void> {
  try {
    await ensureVisitColumns();
    await sql.query(
      `UPDATE users SET
         dashboard_visits = dashboard_visits + CASE WHEN last_dashboard_at IS NULL OR last_dashboard_at < NOW() - interval '${NEW_VISIT_AFTER}' THEN 1 ELSE 0 END,
         first_dashboard_at = COALESCE(first_dashboard_at, NOW()),
         last_dashboard_at = NOW()
       WHERE id = $1 AND (last_dashboard_at IS NULL OR last_dashboard_at < NOW() - interval '${WRITE_EVERY}')`,
      [userId],
    );
  } catch (error) {
    console.error('Failed to record dashboard visit:', error);
  }
}
