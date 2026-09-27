import { sql } from '@vercel/postgres';

// One-time-payment pages carry their own plan_expires_at (purchase time +
// PLAN_TERM_MONTHS) instead of relying on a recurring Stripe subscription.
// There's no cron: whichever of the lower-level fetchers loads the page next
// (owner dashboard, public slug, or custom domain) drops it to the free tier
// itself, so the term's cutoff always takes effect on first access after it
// passes. The page stays live at its URL — it just loses paid-only features,
// same as any other free page. A NULL plan_expires_at means "no fixed term"
// (legacy or multi-page plans) and is never auto-expired.
export async function expireIfPast(page: { id: number | string; plan_type?: string | null; plan_expires_at?: string | Date | null }): Promise<void> {
  if (page.plan_type !== 'paid' || !page.plan_expires_at) return;
  if (new Date(page.plan_expires_at).getTime() > Date.now()) return;
  await sql`
    UPDATE user_page SET plan_type = 'free' WHERE id = ${page.id} AND plan_type = 'paid'
  `;
  page.plan_type = 'free';
}
