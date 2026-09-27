import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/app/lib/stripe';
import { sql } from '@vercel/postgres';
import { isDeadSubscription, subscriptionPeriodEnd } from '@/app/lib/subscriptions';
import { PLAN_TERM_MONTHS } from '@/app/lib/plans';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // One-time payment: mode is 'payment', not 'subscription', so this
        // fires once per purchase and there's no renewal to track. Grants
        // PLAN_TERM_MONTHS from now, whether this is a first purchase or an
        // extension of a lapsed (dropped-to-free) page. Deliberately doesn't
        // touch status — deactivation is a separate, manual choice.
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const pageId = session.metadata?.pageId ? Number(session.metadata.pageId) : null;
        const customerId = session.customer as string | null;
        if (userId) {
          const expiresAt = new Date(Date.now() + PLAN_TERM_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString();
          await sql`
            INSERT INTO user_plans (user_id, plan_type, plan_expires_at, stripe_customer_id, updated_at)
            VALUES (${userId}, 'paid', ${expiresAt}, ${customerId}, NOW())
            ON CONFLICT (user_id) DO UPDATE
              SET plan_type = 'paid', plan_expires_at = ${expiresAt}, stripe_customer_id = ${customerId}, updated_at = NOW()
          `;
          if (pageId) {
            await sql`
              UPDATE user_page
              SET plan_type = 'paid', plan_expires_at = ${expiresAt}, stripe_customer_id = ${customerId}
              WHERE id = ${pageId} AND user_id = ${userId}
            `;
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        // Keep the renewal/expiry date fresh for the admin panel. Only the two
        // date columns are written — plan_type is still driven by checkout
        // completion and subscription deletion above/below.
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId && !isDeadSubscription(subscription.status)) {
          const periodEnd = subscriptionPeriodEnd(subscription);
          await sql`
            INSERT INTO user_plans (user_id, plan_type, current_period_end, cancel_at_period_end, updated_at)
            VALUES (${userId}, 'free', ${periodEnd}, ${subscription.cancel_at_period_end}, NOW())
            ON CONFLICT (user_id) DO UPDATE
              SET current_period_end = ${periodEnd},
                  cancel_at_period_end = ${subscription.cancel_at_period_end},
                  updated_at = NOW()
          `;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const customerId = subscription.customer as string | null;
        const details = subscription.cancellation_details;
        const cancelledAt = subscription.ended_at
          ? new Date(subscription.ended_at * 1000).toISOString()
          : new Date().toISOString();

        if (userId) {
          // A subscription can be deleted for a reason unrelated to access —
          // notably, converting a legacy subscriber to the one-time-payment
          // plan cancels their old subscription on purpose while granting
          // them a fresh plan_expires_at. Only downgrade to free when
          // nothing (account or any page) still has a live term.
          const stillLive = await sql`
            SELECT 1 FROM user_plans WHERE user_id = ${userId} AND plan_expires_at > NOW()
            UNION ALL
            SELECT 1 FROM user_page WHERE user_id = ${userId} AND plan_expires_at > NOW()
            LIMIT 1
          `;
          if (!stillLive.rows.length) {
            await sql`
              INSERT INTO user_plans (user_id, plan_type, updated_at)
              VALUES (${userId}, 'free', NOW())
              ON CONFLICT (user_id) DO UPDATE SET plan_type = 'free', updated_at = NOW()
            `;
            await sql`
              UPDATE user_page SET plan_type = 'free' WHERE user_id = ${userId}
            `;
          }
          await sql`
            INSERT INTO user_cancellations
              (user_id, stripe_customer_id, stripe_subscription_id, cancelled_at, reason, feedback, comment)
            VALUES (
              ${userId},
              ${customerId},
              ${subscription.id},
              ${cancelledAt},
              ${details?.reason ?? null},
              ${details?.feedback ?? null},
              ${details?.comment ?? null}
            )
          `;
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Could send an email here in the future
        console.warn('Payment failed for invoice:', event.data.object);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
