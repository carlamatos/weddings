import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/auth';

const ADMIN_EMAIL = 'carlamatos@gmail.com';

export async function POST() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
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

  return NextResponse.json({ ok: true, message: 'Tables ready: user_plans, user_cancellations.' });
}
