import { NextResponse } from 'next/server';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { normalizeNewsletterEmail, sendNewsletterWelcome, subscribeToNewsletter } from '@/app/lib/newsletter';

const HOUR_MS = 60 * 60 * 1000;

// Newsletter sign-up (marketing site footer). Emails the 10%-off code to the
// address, so the code only reaches people who own the inbox they typed.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // Honeypot: bots fill hidden fields, real visitors don't.
  if (body?.website) return NextResponse.json({ ok: true });

  if (await overRateLimit(`newsletter:${clientIp(req.headers)}`, 10, HOUR_MS)) {
    return NextResponse.json({ error: 'Too many sign-ups from this connection. Please try again later.' }, { status: 429 });
  }
  const email = normalizeNewsletterEmail(body?.email);
  if (!email) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });

  try {
    const isNew = await subscribeToNewsletter(email, typeof body?.source === 'string' ? body.source.slice(0, 40) : 'footer');
    // Already subscribed: send the code again, but only a couple of times a
    // day per address, so the form can't be used to flood someone's inbox.
    if (isNew || !(await overRateLimit(`newsletter-email:${email}`, 2, 24 * HOUR_MS))) {
      await sendNewsletterWelcome(email);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Newsletter sign-up failed:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
