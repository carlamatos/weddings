import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/app/lib/stripe';
import { fetchUserPlan, listOwnedPages } from '@/app/lib/data';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The subscription belongs to the user, not to any one page.
  const [plan, pages] = await Promise.all([fetchUserPlan(session.user.id), listOwnedPages(session.user.id)]);
  const customerId = plan?.stripe_customer_id ?? pages.find((p) => p.stripe_customer_id)?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  }

  const baseUrl = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
