import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSuperAdmin } from '@/app/lib/admin';

// Idempotent schema setup. Run once per environment (staging, production)
// as a super admin after deploying: POST /api/db-setup
export async function POST() {
  if (!(await getSuperAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS user_plans (
      user_id TEXT PRIMARY KEY,
      plan_type TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_cancellations (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      cancelled_at TIMESTAMPTZ NOT NULL,
      reason TEXT,
      feedback TEXT,
      comment TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Admin: page deactivation ('active' | 'inactive')
  await sql`ALTER TABLE user_page ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`;

  // Admin: subscription renewal/expiry, kept up to date by the Stripe webhook
  await sql`ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ`;
  await sql`ALTER TABLE user_plans ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE`;

  // Admin: trash. One row per deletion, holding a full snapshot so the user
  // can be restored. restored_at stays set afterwards as an audit trail.
  await sql`
    CREATE TABLE IF NOT EXISTS deleted_users (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_by TEXT,
      snapshot JSONB NOT NULL,
      restored_at TIMESTAMPTZ
    )
  `;

  return NextResponse.json({
    ok: true,
    message:
      'Tables ready: user_plans, user_cancellations, deleted_users. Columns ready: user_page.status, user_plans.current_period_end, user_plans.cancel_at_period_end.',
  });
}
