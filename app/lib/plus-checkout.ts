import Stripe from 'stripe';
import { stripe } from '@/app/lib/stripe';
import { PLAN_CURRENCY, PLAN_ONE_TIME_PRICE, PLAN_TERM_MONTHS } from '@/app/lib/plans';

// Stripe Tax product code for MyGala Plus: an online service bought by
// individuals ("Software as a service (SaaS) – personal use").
const PLUS_TAX_CODE = 'txcd_10103000';

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
  // Tax-exclusive pricing: Stripe Tax adds GST/HST and provincial sales
  // tax (e.g. BC PST) on top of the price, from the billing address, for the
  // provinces registered under Tax → Registrations in the Stripe dashboard.
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    billing_address_collection: 'required',
    automatic_tax: { enabled: true },
    line_items: [
      {
        price_data: {
          currency: PLAN_CURRENCY.toLowerCase(),
          unit_amount: Math.round(PLAN_ONE_TIME_PRICE * 100),
          tax_behavior: 'exclusive',
          product_data: {
            name: `MyGala Plus — ${PLAN_TERM_MONTHS} months (one event page)`,
            tax_code: PLUS_TAX_CODE,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}`,
    metadata: { userId, pageId: String(pageId) },
    allow_promotion_codes: true,
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(params);
  } catch (error) {
    // If Stripe Tax isn't set up for this account or mode (e.g. no head-office
    // address), don't block the purchase: log it loudly and charge without tax.
    if (!(error instanceof Stripe.errors.StripeInvalidRequestError) || !/tax/i.test(error.message)) throw error;
    console.error('Stripe Tax unavailable — checkout created WITHOUT tax:', error.message);
    session = await stripe.checkout.sessions.create({ ...params, automatic_tax: { enabled: false } });
  }
  return session.url;
}
