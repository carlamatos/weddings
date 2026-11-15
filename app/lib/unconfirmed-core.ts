import { sql } from '@vercel/postgres';

// Shared by the admin Cleanup list (app/lib/unconfirmed.ts) and the warning
// email (app/lib/removal-warning.ts).

// An account is "never confirmed" when ALL of these hold:
//  - its email was never confirmed (email_verified_at IS NULL)
//  - it signed up more than $1 days ago (users.date, or its first page)
//  - it has no page other than drafts (unconfirmed accounts can't publish)
//  - nothing on it says 'paid' and no Stripe customer is on file
//  - its owner hasn't opened the dashboard in the last $2 days
export const UNCONFIRMED_WHERE = `
  u.email_verified_at IS NULL
  AND COALESCE(u.date::date, (SELECT min(created_at)::date FROM user_page WHERE user_id = u.id)) < CURRENT_DATE - $1::int
  AND NOT EXISTS (SELECT 1 FROM user_page WHERE user_id = u.id AND COALESCE(status, 'active') <> 'draft')
  AND NOT EXISTS (SELECT 1 FROM user_page WHERE user_id = u.id AND (COALESCE(plan_type, 'free') = 'paid' OR stripe_customer_id IS NOT NULL))
  AND NOT EXISTS (SELECT 1 FROM user_plans WHERE user_id = u.id::text AND (COALESCE(plan_type, 'free') = 'paid' OR stripe_customer_id IS NOT NULL))
  AND (u.last_dashboard_at IS NULL OR u.last_dashboard_at < NOW() - ($2::int * INTERVAL '1 day'))
`;

// When the "your draft will be removed" email went out. Added on first use,
// so a new environment needs no setup step (it's also in /api/migrate).
let columnReady: Promise<unknown> | null = null;
export function ensureWarningColumn(): Promise<unknown> {
  columnReady ??= sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS removal_warning_sent_at TIMESTAMPTZ`
    .catch((error) => { columnReady = null; throw error; });
  return columnReady;
}
