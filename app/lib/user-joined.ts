import { sql } from '@vercel/postgres';

// When each account was made, to the minute (users.date is only the day):
// users.created_at, set by the database for every new account. Accounts
// from before it existed get their earliest known moment on their sign-up
// day — email confirmed, first dashboard visit or first page — else the
// start of that day, so their times are close but not exact. Done on first
// use (the admin's Users and Activity tabs, /api/migrate).
let ready: Promise<unknown> | null = null;
export function ensureUserCreatedAt(): Promise<unknown> {
  ready ??= (async () => {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ`;
    await sql`ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW()`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_dashboard_at TIMESTAMPTZ`;
    await sql`
      UPDATE users u SET created_at = COALESCE(
        (SELECT MIN(t) FROM (VALUES
            (u.email_verified_at),
            (u.first_dashboard_at),
            ((SELECT MIN(p.created_at) FROM user_page p WHERE p.user_id = u.id) AT TIME ZONE 'UTC')
          ) AS v(t)
         WHERE t IS NOT NULL AND (t AT TIME ZONE 'UTC')::date = u.date::date),
        u.date::timestamp AT TIME ZONE 'UTC',
        NOW())
      WHERE u.created_at IS NULL
    `;
  })().catch((error) => { ready = null; throw error; });
  return ready;
}
