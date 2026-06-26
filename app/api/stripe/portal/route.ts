import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { stripe } from '@/app/lib/stripe';
import { fetchUserPageById } from '@/app/lib/data';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userPage = await fetchUserPageById(session.user.id);
  if (!userPage?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: userPage.stripe_customer_id,
    return_url: `${baseUrl}/dashboard/domain`,
  });

  return NextResponse.json({ url: portalSession.url });
}
