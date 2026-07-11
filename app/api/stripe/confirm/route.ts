import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/app/lib/stripe';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      checkoutSession.payment_status === 'paid' &&
      checkoutSession.metadata?.userId === session.user.id
    ) {
      const customerId = checkoutSession.customer as string | null;
      await sql`
        INSERT INTO user_plans (user_id, plan_type, stripe_customer_id, updated_at)
        VALUES (${session.user.id}, 'paid', ${customerId}, NOW())
        ON CONFLICT (user_id) DO UPDATE
          SET plan_type = 'paid', stripe_customer_id = ${customerId}, updated_at = NOW()
      `;

      // Also update user_page if it already exists
      await sql`
        UPDATE user_page
        SET plan_type = 'paid', stripe_customer_id = ${customerId}
        WHERE user_id = ${session.user.id}
      `;
    }
  } catch (err) {
    console.error('Stripe confirm error:', err);
  }

  return NextResponse.redirect(new URL('/dashboard', req.url));
}
