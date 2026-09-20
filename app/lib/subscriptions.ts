import type Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { stripe } from '@/app/lib/stripe';

export type SubscriptionInfo = {
  hasLiveSubscription: boolean;
  status: string | null;
  currentPeriodEnd: string | null; // ISO
  cancelAtPeriodEnd: boolean;
};

// Subscriptions in these states can never bill again.
const DEAD_STATUSES = new Set(['canceled', 'incomplete_expired']);

// In this Stripe API version the period end lives on each subscription item,
// not on the subscription itself. Earliest item = next billing boundary.
export function subscriptionPeriodEnd(sub: Stripe.Subscription): string | null {
  const ends = sub.items.data.map((i) => i.current_period_end).filter((n) => typeof n === 'number');
  if (!ends.length) return null;
  return new Date(Math.min(...ends) * 1000).toISOString();
}

export function isDeadSubscription(status: string): boolean {
  return DEAD_STATUSES.has(status);
}

// Asks Stripe directly (the authoritative source). Throws if Stripe can't be
// reached — callers must treat that as "unknown", never as "no subscription".
export async function fetchLiveSubscription(customerIds: string[]): Promise<SubscriptionInfo> {
  let best: Stripe.Subscription | null = null;
  for (const customer of customerIds) {
    const list = await stripe.subscriptions.list({ customer, limit: 10 });
    for (const sub of list.data) {
      if (isDeadSubscription(sub.status)) continue;
      // Prefer one that is actually running over e.g. a paused/incomplete one.
      if (!best || (sub.status === 'active' && best.status !== 'active')) best = sub;
    }
  }
  if (!best) {
    return { hasLiveSubscription: false, status: null, currentPeriodEnd: null, cancelAtPeriodEnd: false };
  }
  return {
    hasLiveSubscription: true,
    status: best.status,
    currentPeriodEnd: subscriptionPeriodEnd(best),
    cancelAtPeriodEnd: best.cancel_at_period_end,
  };
}

export async function saveSubscriptionInfo(userId: string, info: SubscriptionInfo) {
  await sql`
    UPDATE user_plans
    SET current_period_end = ${info.currentPeriodEnd},
        cancel_at_period_end = ${info.cancelAtPeriodEnd},
        updated_at = NOW()
    WHERE user_id = ${userId}
  `;
}

type HydratableRow = {
  plan_type: string;
  stripe_customer_id: string | null;
  current_period_end: Date | string | null;
  cancel_at_period_end: boolean;
};

// Subscriptions that were already active before renewal dates were tracked
// have no date stored until their next renewal. Fill those in from Stripe on
// first view (and remember the result), so the admin lists are correct now.
export async function hydrateSubscriptionInfo<T extends HydratableRow>(
  rows: T[],
  userIdOf: (row: T) => string,
): Promise<void> {
  await Promise.all(
    rows
      .filter((r) => r.plan_type === 'paid' && !r.current_period_end && r.stripe_customer_id)
      .map(async (row) => {
        try {
          const info = await fetchLiveSubscription([row.stripe_customer_id as string]);
          if (!info.hasLiveSubscription) return;
          row.current_period_end = info.currentPeriodEnd;
          row.cancel_at_period_end = info.cancelAtPeriodEnd;
          await saveSubscriptionInfo(userIdOf(row), info);
        } catch (err) {
          console.error('Could not load subscription info from Stripe:', err);
        }
      }),
  );
}

export type DeletableCheck = { ok: true } | { ok: false; reason: string };

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// A user may only be deleted when they have no live Stripe subscription.
// Checked against Stripe itself right before deleting, and fails closed:
// if Stripe can't be reached we refuse rather than guess.
export async function checkUserDeletable(userId: string): Promise<DeletableCheck> {
  const [plan, pages] = await Promise.all([
    sql`SELECT plan_type, stripe_customer_id FROM user_plans WHERE user_id = ${userId}`,
    sql`SELECT plan_type, stripe_customer_id FROM user_page WHERE user_id = ${userId}`,
  ]);

  const customerIds = [
    ...new Set(
      [...plan.rows, ...pages.rows]
        .map((r) => r.stripe_customer_id as string | null)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const markedPaid = [...plan.rows, ...pages.rows].some((r) => r.plan_type === 'paid');

  if (!customerIds.length) {
    if (markedPaid) {
      return {
        ok: false,
        reason:
          'This user is on a paid plan but has no Stripe customer on file, so their subscription status cannot be verified. Nothing was deleted. Deactivate their page instead, or fix the billing record first.',
      };
    }
    return { ok: true };
  }

  let info: SubscriptionInfo;
  try {
    info = await fetchLiveSubscription(customerIds);
  } catch (err) {
    console.error('Stripe check before delete failed:', err);
    return {
      ok: false,
      reason: `Could not verify this user's Stripe subscription (${err instanceof Error ? err.message : 'unknown error'}). Nothing was deleted. Please try again.`,
    };
  }

  if (info.hasLiveSubscription) {
    const date = formatDate(info.currentPeriodEnd);
    const when = date
      ? info.cancelAtPeriodEnd
        ? ` It is set to end on ${date}.`
        : ` It renews on ${date}.`
      : '';
    return {
      ok: false,
      reason: `This user has an active Stripe subscription (${info.status}).${when} Users with an active subscription cannot be deleted — deactivate their page instead, or delete them once the subscription has ended.`,
    };
  }

  return { ok: true };
}
