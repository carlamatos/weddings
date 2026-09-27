import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/app/lib/stripe';
import { fetchOwnedPage } from '@/app/lib/data';
import { PLAN_ONE_TIME_PRICE_USD } from '@/app/lib/plans';

// One-time payment (not a subscription) that unlocks a specific page's paid
// features for PLAN_TERM_MONTHS. Pass pageId to buy/extend an existing page;
// omit it for the pre-page-creation purchase (PlanPicker), which is recorded
// on user_plans and copied onto the page once it's created (createUserPage).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email ?? undefined;
  const body = (await req.json().catch(() => ({}))) as { pageId?: unknown };
  const pageId = typeof body.pageId === 'number' ? body.pageId : undefined;

  if (pageId !== undefined) {
    const page = await fetchOwnedPage(userId, pageId);
    if (!page) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }
    // A currently-live paid term blocks re-purchase; an expired one (dropped
    // to plan_type 'free' by expireIfPast) is exactly what "extend" is for.
    if (page.plan_type === 'paid') {
      return NextResponse.json({ error: 'This page is already on the paid plan.' }, { status: 400 });
    }
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const baseUrl = origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(PLAN_ONE_TIME_PRICE_USD * 100),
          product_data: { name: 'MyGala Plus — 15 months' },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/dashboard`,
    metadata: { userId, ...(pageId !== undefined ? { pageId: String(pageId) } : {}) },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
