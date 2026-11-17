import { sql } from '@vercel/postgres';
import { sendMailBatch, fromName, type MailMessage } from './mail';
import { siteUrl } from './site-url';
import { publicPageUrl } from './share';
import { fetchPageSettings } from './data';
import { GIFT_MIN_TO_DRAW, giftExchangeDetails } from './gift-exchange';
import { giftJoinedEmail, giftJoinedHostEmail } from './gift-exchange-email';
import type { UserPage } from './definitions';

// Emails sent when a guest joins a page's Secret Santa: a "you're in" note to
// the guest and, when `host` is set, a heads-up to the organizer. Returns how
// many people have joined so far. Never throws: a mail problem must not fail
// the sign-up.
export async function sendGiftJoinEmails(
  pageId: number,
  joiner: { name: string; email: string; wishlist: string | null },
  { host }: { host: boolean },
): Promise<number | null> {
  try {
    const [pageRes, countRes, settings] = await Promise.all([
      sql<Pick<UserPage, 'slug' | 'plan_type' | 'custom_domain' | 'domain_status'> & { heading: string | null; language: string | null; owner_email: string | null; given_name: string | null; owner_name: string | null }>`
        SELECT up.slug, up.plan_type, up.custom_domain, up.domain_status, up.heading, up.language,
               u.email AS owner_email, u.given_name, u.name AS owner_name
        FROM user_page up JOIN users u ON u.id = up.user_id
        WHERE up.id = ${pageId}
      `,
      sql<{ n: number }>`SELECT COUNT(*)::int AS n FROM page_gift_exchange WHERE user_page_id = ${pageId}`,
      fetchPageSettings(pageId),
    ]);
    const page = pageRes.rows[0];
    if (!page) return null;
    const count = countRes.rows[0]?.n ?? 0;
    const eventName = (page.heading ?? '').replace(/\s+/g, ' ').trim() || 'MyGala';
    const hostName = page.owner_name?.trim() || eventName;

    const guest = giftJoinedEmail({
      language: page.language,
      eventName,
      eventUrl: publicPageUrl(page),
      participantName: joiner.name,
      wishlist: joiner.wishlist,
      details: giftExchangeDetails(settings),
    });
    const messages: MailMessage[] = [
      { to: joiner.email, ...guest, from: fromName(hostName), ...(page.owner_email ? { replyTo: page.owner_email } : {}) },
    ];
    if (host && page.owner_email && page.owner_email.toLowerCase() !== joiner.email.toLowerCase()) {
      messages.push({
        to: page.owner_email,
        ...giftJoinedHostEmail({
          language: page.language,
          eventName,
          ownerName: (page.given_name ?? '').trim(),
          name: joiner.name,
          wishlist: joiner.wishlist,
          count,
          minToDraw: GIFT_MIN_TO_DRAW,
          link: `${siteUrl()}/dashboard/pages/${pageId}/gift-exchange`,
        }),
      });
    }
    await sendMailBatch(messages);
    return count;
  } catch (error) {
    console.error('Failed to send Secret Santa sign-up emails:', error);
    return null;
  }
}
