import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/app/lib/stripe';
import { sql } from '@vercel/postgres';

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
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string | null;
        if (userId) {
          await sql`
            INSERT INTO user_plans (user_id, plan_type, stripe_customer_id, updated_at)
            VALUES (${userId}, 'paid', ${customerId}, NOW())
            ON CONFLICT (user_id) DO UPDATE
              SET plan_type = 'paid', stripe_customer_id = ${customerId}, updated_at = NOW()
          `;
          await sql`
            UPDATE user_page
            SET plan_type = 'paid', stripe_customer_id = ${customerId}
            WHERE user_id = ${userId}
          `;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await sql`
            INSERT INTO user_plans (user_id, plan_type, updated_at)
            VALUES (${userId}, 'free', NOW())
            ON CONFLICT (user_id) DO UPDATE SET plan_type = 'free', updated_at = NOW()
          `;
          await sql`
            UPDATE user_page SET plan_type = 'free' WHERE user_id = ${userId}
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
