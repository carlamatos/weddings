// Plan tiers and their limits. Kept free of server-only imports so client
// components can share it. Change a limit here (or via MULTI_PAGE_LIMIT) and
// it applies to every existing subscriber immediately, because the database
// stores the tier, not the number.

export type Tier = 'free' | 'plus' | 'multi';

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
