// Plan tiers and their limits. Kept free of server-only imports so client
// components can share it. Change a limit here (or via MULTI_PAGE_LIMIT) and
// it applies to every existing subscriber immediately, because the database
// stores the tier, not the number.

export type Tier = 'free' | 'plus' | 'multi';

// The single-page paid plan is a one-time payment, not a recurring
// subscription: it unlocks Domain / Guest Photos / Song Requests for a
// fixed term, then the page drops back to the free tier (it stays live —
// just without the paid-only features) until the owner extends it.
export const PLAN_ONE_TIME_PRICE_USD = 49.99;
export const PLAN_TERM_MONTHS = 15;

// Feature bullets for the two plans — one list shared by the homepage
// pricing cards and the dashboard plan picker so they can't drift apart.
export const PLAN_FEATURES = {
  free: [
    '1 Event page',
    'All themes',
    'RSVP & guest count',
    'Countdown & event details',
    'Event Program',
    'Gala URL (mygala.ca/yourname)',
  ],
  plus: [
    'Everything in Free',
    'Photo uploads',
    'Livestream link & song requests',
    'Automatic reminder emails to guests',
    'Custom domain support',
    'Remove Gala branding',
    'Priority support',
  ],
} as const;

const DEFAULT_MULTI_PAGE_LIMIT = 5;

function multiPageLimit(): number {
  const fromEnv = Number(process.env.MULTI_PAGE_LIMIT);
  return Number.isInteger(fromEnv) && fromEnv >= 1 ? fromEnv : DEFAULT_MULTI_PAGE_LIMIT;
}

export function maxPagesFor(tier: Tier): number {
  return tier === 'multi' ? multiPageLimit() : 1;
}

// user_plans.plan_type is 'free' | 'paid'; user_plans.tier only says which paid
// plan. A paid user with no tier recorded is an existing single-page
// subscriber ('plus'), so no data migration is needed.
export function effectiveTier(planType: string | null | undefined, tier: string | null | undefined): Tier {
  if (planType !== 'paid') return 'free';
  return tier === 'multi' ? 'multi' : 'plus';
}

// Only the exact configured multi-page price grants the multi-page tier;
// any other paid price is the regular single-page plan.
export function tierForPriceId(priceId: string | null | undefined): Tier {
  const multi = process.env.STRIPE_PRICE_ID_MULTI;
  return multi && priceId === multi ? 'multi' : 'plus';
}

// expireIfPast (app/lib/plan-expiry) flips plan_type back to 'free' the
// moment a one-time-payment term runs out, so plan_type === 'paid' alone is
// always an accurate, current answer to "does this page have paid features
// unlocked right now" — no separate "and not expired" check needed.
export function isPagePaidAndLive(page: { plan_type?: string | null }): boolean {
  return page.plan_type === 'paid';
}

// True when this page was paid before but its term has lapsed (now free) —
// used to show "extend" messaging instead of a plain "upgrade" pitch.
export function hasExpiredPlan(page: { plan_type?: string | null; plan_expires_at?: string | Date | null }): boolean {
  if (page.plan_type === 'paid' || !page.plan_expires_at) return false;
  return new Date(page.plan_expires_at).getTime() <= Date.now();
}
