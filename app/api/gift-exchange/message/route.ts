import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyGiftLink, giftRevealUrl } from '@/app/lib/gift-token';
import { fetchPageSettings } from '@/app/lib/data';
import { isGiftExchangeOn } from '@/app/lib/gift-exchange';
import { ensureGiftMessagesTable, GIFT_MESSAGE_MAX } from '@/app/lib/gift-messages';
import { giftMessageEmail } from '@/app/lib/gift-exchange-email';
import { fromName, sendMailBatch } from '@/app/lib/mail';
import { overRateLimit } from '@/app/lib/rate-limit';
import { isPageOffline } from '@/app/lib/page-status';

const HOUR_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Person = { id: number; name: string; email: string | null; giftee_id: number | null; user_page_id: number };

// A participant writes, from their private Secret Santa link, either to the
// person they drew ("giftee") or to whoever drew them ("santa"). The message
// is stored and emailed to the recipient with their own private link. The
// Santa's identity is never revealed: emails to a giftee only say "your
// Secret Santa".
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const me = verifyGiftLink(typeof body?.p === 'string' ? body.p : null, typeof body?.t === 'string' ? body.t : null);
    if (me === null) return NextResponse.json({ error: 'This link isn’t valid.' }, { status: 403 });
    const to = body?.to === 'santa' ? 'santa' : body?.to === 'giftee' ? 'giftee' : null;
    const text = typeof body?.body === 'string' ? body.body.replace(/\r\n/g, '\n').trim().slice(0, GIFT_MESSAGE_MAX) : '';
    if (!to || !text) return NextResponse.json({ error: 'Please write a message.' }, { status: 400 });

    if (await overRateLimit(`gift-message:${me}`, 20, HOUR_MS)) {
      return NextResponse.json({ error: 'You’ve sent a lot of messages. Please try again later.' }, { status: 429 });
    }

    const self = (await sql<Person>`SELECT id, name, email, giftee_id, user_page_id FROM page_gift_exchange WHERE id = ${me}`).rows[0];
    if (!self) return NextResponse.json({ error: 'This link isn’t valid.' }, { status: 403 });

    const page = (await sql<{ heading: string | null; language: string | null; status: string | null; host_name: string | null }>`
      SELECT up.heading, up.language, up.status, u.name AS host_name
      FROM user_page up JOIN users u ON u.id = up.user_id WHERE up.id = ${self.user_page_id}`).rows[0];
    if (!page || isPageOffline(page.status) || !isGiftExchangeOn(await fetchPageSettings(self.user_page_id))) {
      return NextResponse.json({ error: 'The gift exchange is closed.' }, { status: 403 });
    }

    const other = to === 'giftee'
      ? self.giftee_id ? (await sql<Person>`SELECT id, name, email, giftee_id, user_page_id FROM page_gift_exchange WHERE id = ${self.giftee_id}`).rows[0] : undefined
      : (await sql<Person>`SELECT id, name, email, giftee_id, user_page_id FROM page_gift_exchange WHERE giftee_id = ${self.id} AND user_page_id = ${self.user_page_id} LIMIT 1`).rows[0];
    if (!other) return NextResponse.json({ error: 'Names haven’t been drawn yet.' }, { status: 409 });

    await ensureGiftMessagesTable();
    await sql`INSERT INTO page_gift_messages (user_page_id, from_id, to_id, body) VALUES (${self.user_page_id}, ${self.id}, ${other.id}, ${text})`;

    if (other.email && EMAIL_RE.test(other.email)) {
      const eventName = page.heading || 'the event';
      const fromSanta = to === 'giftee';
      const { subject, html } = giftMessageEmail({
        language: page.language,
        fromSanta,
        eventName,
        // A giftee writing back is named; the Santa already knows who they drew.
        gifteeName: self.name,
        participantName: other.name,
        body: text,
        revealLink: giftRevealUrl(other.id),
      });
      await sendMailBatch([{ to: other.email, subject, html, from: fromName(page.host_name?.trim() || eventName) }]);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Gift exchange message failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
