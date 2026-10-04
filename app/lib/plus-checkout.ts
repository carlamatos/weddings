import { stripe } from '@/app/lib/stripe';
import { PLAN_CURRENCY, PLAN_ONE_TIME_PRICE, PLAN_TERM_MONTHS } from '@/app/lib/plans';

// Stripe Checkout for one event page's Plus term: a one-time payment, not a
// subscription. Completion is recorded by /api/stripe/confirm (the success
// redirect) and the checkout.session.completed webhook, both keyed on the
// pageId in the metadata.
export async function createPlusCheckout({
  userId,
  email,
  pageId,
  origin,
  cancelPath = '/dashboard',
}: {
  userId: string;
  email?: string;
  pageId: number;
  origin: string;
  cancelPath?: string;
}): Promise<string | null> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: PLAN_CURRENCY.toLowerCase(),
          unit_amount: Math.round(PLAN_ONE_TIME_PRICE * 100),
          product_data: { name: `MyGala Plus — ${PLAN_TERM_MONTHS} months (one event page)` },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}`,
    metadata: { userId, pageId: String(pageId) },
    allow_promotion_codes: true,
  });
  return session.url;
}
