// Plans and their limits. Kept free of server-only imports so client
// components can share it.

// Plus is a one-time payment per event page, not a recurring subscription:
// it unlocks that page's paid features for a fixed term, then the page drops
// back to the free tier (it stays live — just without the paid-only
// features) until the owner extends it.
export const PLAN_ONE_TIME_PRICE_USD = 49.99;
export const PLAN_TERM_MONTHS = 15;

// Feature bullets for the two plans — one list shared by the homepage
// pricing cards and the dashboard plan picker so they can't drift apart.
export const PLAN_FEATURES = {
  free: [
    'As many event pages as you need',
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
    'Custom sections & sponsors',
    'Gift registry section',
    'Custom domain support',
    'Remove Gala branding',
    'Priority support',
  ],
} as const;

// Every account can create as many event pages as it needs; each page is
// free or Plus on its own (Plus is bought per event). The cap only guards
// against abuse — raise it with MAX_PAGES_PER_ACCOUNT.
const DEFAULT_MAX_PAGES_PER_ACCOUNT = 50;

export function maxPagesPerAccount(): number {
  const fromEnv = Number(process.env.MAX_PAGES_PER_ACCOUNT);
  return Number.isInteger(fromEnv) && fromEnv >= 1 ? fromEnv : DEFAULT_MAX_PAGES_PER_ACCOUNT;
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
