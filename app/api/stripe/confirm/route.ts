import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/app/lib/stripe';
import { sql } from '@vercel/postgres';
import { planExpiryFromPayment } from '@/app/lib/plans';
import { pagePath } from '@/app/lib/dashboard';
import { enablePlusSetting } from '@/app/lib/plus-enable';
import { isPageReturnPath } from '@/app/lib/plus-features';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Back to the screen the upgrade started from (else the page's editor), or
  // the event pages list.
  let landing = '/dashboard';
  // Set on a successful purchase so the landing page reports the Google Ads
  // conversion (see PurchaseConversion).
  let conversion: { id: string; value: number; currency: string } | null = null;
  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // The term runs from the payment, so a confirmation link that's opened
    // again later (or after the term ended) grants nothing more.
    const paidExpiry = planExpiryFromPayment(checkoutSession.created);
    if (
      checkoutSession.payment_status === 'paid' &&
      checkoutSession.metadata?.userId === session.user.id &&
      paidExpiry.getTime() > Date.now()
    ) {
      const customerId = checkoutSession.customer as string | null;
      const pageId = checkoutSession.metadata?.pageId ? Number(checkoutSession.metadata.pageId) : null;
      const expiresAt = paidExpiry.toISOString();
      await sql`
        INSERT INTO user_plans (user_id, plan_type, plan_expires_at, stripe_customer_id, updated_at)
        VALUES (${session.user.id}, 'paid', ${expiresAt}, ${customerId}, NOW())
        ON CONFLICT (user_id) DO UPDATE
          SET plan_type = 'paid', plan_expires_at = GREATEST(user_plans.plan_expires_at, ${expiresAt}::timestamp), stripe_customer_id = ${customerId}, updated_at = NOW()
      `;

      if (pageId) {
        await sql`
          UPDATE user_page
          SET plan_type = 'paid', plan_expires_at = GREATEST(plan_expires_at, ${expiresAt}::timestamp), stripe_customer_id = ${customerId}
          WHERE id = ${pageId} AND user_id = ${session.user.id}
        `;
        await enablePlusSetting(pageId, session.user.id, checkoutSession.metadata?.enable);
        const returnPath = checkoutSession.metadata?.returnPath;
        landing = isPageReturnPath(returnPath, pageId) ? returnPath : pagePath(pageId);
      }
      conversion = {
        id: checkoutSession.id,
        // Revenue before tax (GST/HST and PST aren't MyGala's income).
        value: (checkoutSession.amount_subtotal ?? checkoutSession.amount_total ?? 0) / 100,
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
