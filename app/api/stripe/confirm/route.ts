import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/app/lib/stripe';
import { sql } from '@vercel/postgres';
import { PLAN_TERM_MONTHS } from '@/app/lib/plans';
import { pagePath } from '@/app/lib/dashboard';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Back to the page that was bought (its editor), else the event pages list.
  let landing = '/dashboard';
  // Set on a successful purchase so the landing page reports the Google Ads
  // conversion (see PurchaseConversion).
  let conversion: { id: string; value: number; currency: string } | null = null;
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      checkoutSession.payment_status === 'paid' &&
      checkoutSession.metadata?.userId === session.user.id
    ) {
      const customerId = checkoutSession.customer as string | null;
      const pageId = checkoutSession.metadata?.pageId ? Number(checkoutSession.metadata.pageId) : null;
      const expiresAt = new Date(Date.now() + PLAN_TERM_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString();
      await sql`
        INSERT INTO user_plans (user_id, plan_type, plan_expires_at, stripe_customer_id, updated_at)
        VALUES (${session.user.id}, 'paid', ${expiresAt}, ${customerId}, NOW())
        ON CONFLICT (user_id) DO UPDATE
          SET plan_type = 'paid', plan_expires_at = ${expiresAt}, stripe_customer_id = ${customerId}, updated_at = NOW()
      `;

      if (pageId) {
        await sql`
          UPDATE user_page
          SET plan_type = 'paid', plan_expires_at = ${expiresAt}, stripe_customer_id = ${customerId}
          WHERE id = ${pageId} AND user_id = ${session.user.id}
        `;
        landing = pagePath(pageId);
      }
      conversion = {
        id: checkoutSession.id,
        value: (checkoutSession.amount_total ?? 0) / 100,
        currency: (checkoutSession.currency ?? 'cad').toUpperCase(),
      };
    }
  } catch (err) {
    console.error('Stripe confirm error:', err);
  }

  const url = new URL(landing, req.url);
  if (conversion) {
    url.searchParams.set('purchase', 'plus');
    url.searchParams.set('tid', conversion.id);
    url.searchParams.set('value', String(conversion.value));
    url.searchParams.set('currency', conversion.currency);
  }
  return NextResponse.redirect(url);
}
