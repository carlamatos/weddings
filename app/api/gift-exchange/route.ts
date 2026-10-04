import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyPageToken } from '@/app/lib/page-token';
import { fetchPageSettings } from '@/app/lib/data';
import { guestAccessDenied } from '@/app/lib/page-access';
import { clientIp, overRateLimit } from '@/app/lib/rate-limit';
import { cleanPhone, isValidOptionalPhone, PHONE_INVALID_MESSAGE, PHONE_MAX_LENGTH } from '@/app/lib/phone';
import { GIFT_MAX_PARTICIPANTS, GIFT_NAME_MAX, GIFT_WISHLIST_MAX, isGiftExchangeOn } from '@/app/lib/gift-exchange';

const HOUR_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// A guest joins the Gift Exchange from the event page. One entry per email per
// page: sending again with the same email updates it. Once names are drawn,
// sign-ups close, but existing participants can still update their gift ideas.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || body.honeypot) return NextResponse.json({ ok: true });

    if (await overRateLimit(`gift-exchange:${clientIp(request.headers)}`, 30, HOUR_MS)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const pageId = verifyPageToken(typeof body.token === 'string' ? body.token : null);
    if (pageId === null) return NextResponse.json({ error: 'Page not found.' }, { status: 404 });

    const name = field(body.name, GIFT_NAME_MAX);
    const email = field(body.email, 254).toLowerCase();
    const phoneRaw = field(body.phone, PHONE_MAX_LENGTH);
    const wishlist = field(body.wishlist, GIFT_WISHLIST_MAX) || null;
    if (!name) return NextResponse.json({ error: 'Please add your name.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    if (!isValidOptionalPhone(phoneRaw)) return NextResponse.json({ error: PHONE_INVALID_MESSAGE }, { status: 400 });
    const phone = cleanPhone(phoneRaw);

    const [page, settings] = await Promise.all([
      sql`SELECT plan_type FROM user_page WHERE id = ${pageId} AND COALESCE(status, 'active') NOT IN ('inactive', 'suspended') LIMIT 1`,
      fetchPageSettings(pageId),
    ]);
    if (page.rows[0]?.plan_type !== 'paid' || !isGiftExchangeOn(settings)) {
      return NextResponse.json({ error: 'The gift exchange is closed.' }, { status: 403 });
    }
    if (await guestAccessDenied(request, pageId)) {
      return NextResponse.json({ error: 'This page is password protected.' }, { status: 403 });
    }

    const [state, existing] = await Promise.all([
      sql<{ n: number; drawn: boolean }>`SELECT COUNT(*)::int AS n, bool_or(giftee_id IS NOT NULL) AS drawn FROM page_gift_exchange WHERE user_page_id = ${pageId}`,
      sql<{ id: number }>`SELECT id FROM page_gift_exchange WHERE user_page_id = ${pageId} AND lower(email) = ${email} LIMIT 1`,
    ]);
    const drawn = !!state.rows[0]?.drawn;

    if (existing.rows[0]) {
      await sql`
        UPDATE page_gift_exchange
        SET name = ${name}, phone = COALESCE(${phone}, phone), wishlist = ${wishlist}, updated_at = NOW()
        WHERE id = ${existing.rows[0].id}
      `;
      return NextResponse.json({ ok: true, updated: true, drawn });
    }
    if (drawn) {
      return NextResponse.json({ error: 'Names have already been drawn, so sign-ups are closed.' }, { status: 403 });
    }
    if ((state.rows[0]?.n ?? 0) >= GIFT_MAX_PARTICIPANTS) {
      return NextResponse.json({ error: 'This gift exchange is full.' }, { status: 403 });
    }

    await sql`
      INSERT INTO page_gift_exchange (user_page_id, name, email, phone, wishlist)
      VALUES (${pageId}, ${name}, ${email}, ${phone}, ${wishlist})
      ON CONFLICT (user_page_id, (lower(email))) WHERE email IS NOT NULL
      DO UPDATE SET name = EXCLUDED.name, wishlist = EXCLUDED.wishlist, updated_at = NOW()
    `;
    return NextResponse.json({ ok: true, updated: false, drawn: false, count: (state.rows[0]?.n ?? 0) + 1 });
  } catch (err) {
    console.error('Gift exchange sign-up failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
