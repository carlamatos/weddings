import { sql } from '@vercel/postgres';
import { verifyGiftLink } from '@/app/lib/gift-token';
import { GIFT_COPY, giftLang } from '@/app/lib/gift-exchange-copy';
import { giftExchangeDetails } from '@/app/lib/gift-exchange';
import { fetchPageSettings } from '@/app/lib/data';
import { publicPageUrl } from '@/app/lib/share';
import { isPageOffline } from '@/app/lib/page-status';
import type { UserPage } from '@/app/lib/definitions';
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/auth.css';

export const metadata = { title: 'Your Secret Santa', robots: { index: false, follow: false } };

type Row = {
  name: string;
  giftee_name: string | null;
  giftee_wishlist: string | null;
  page_id: number;
} & Pick<UserPage, 'heading' | 'language' | 'slug' | 'plan_type' | 'custom_domain' | 'domain_status' | 'status'>;

// The private link each Gift Exchange participant gets (by email, or as a text
// from the host's phone): who they're the Secret Santa for, with that person's
// current gift ideas. Only someone with the signed link can open it.
export default async function SecretSantaPage({ searchParams }: { searchParams: Promise<{ p?: string; t?: string }> }) {
  const { p, t } = await searchParams;
  const id = verifyGiftLink(p, t);
  const row = id
    ? (await sql<Row>`
        SELECT me.name, giftee.name AS giftee_name, giftee.wishlist AS giftee_wishlist, up.id AS page_id,
               up.heading, up.language, up.slug, up.plan_type, up.custom_domain, up.domain_status, up.status
        FROM page_gift_exchange me
        JOIN user_page up ON up.id = me.user_page_id
        LEFT JOIN page_gift_exchange giftee ON giftee.id = me.giftee_id
        WHERE me.id = ${id}
      `).rows[0]
    : undefined;

  const c = GIFT_COPY[giftLang(row?.language)];
  let body: React.ReactNode;
  if (!row || isPageOffline(row.status)) {
    body = <p className="auth-subheading">{c.linkInvalid}</p>;
  } else if (!row.giftee_name) {
    body = <p className="auth-subheading">{c.hi(row.name)} {c.notDrawnYet}</p>;
  } else {
    const details = giftExchangeDetails(await fetchPageSettings(row.page_id));
    const event = row.heading || 'the event';
    body = (
      <>
        <p className="auth-subheading" style={{ marginBottom: 18 }}>{c.hi(row.name)} {c.drawn(event)}</p>
        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#B3262E' }}>{c.youGiveTo}</p>
        <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-great-vibes), Georgia, serif', fontSize: 46, lineHeight: 1.15, color: '#241F2B', overflowWrap: 'anywhere' }}>{row.giftee_name}</p>
        <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6B6470' }}>{c.keepSecret}</p>
        <div style={{ textAlign: 'left', background: '#F7F4F1', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A8F8C' }}>{c.theirIdeas}</p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#241F2B', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{row.giftee_wishlist || c.noIdeas}</p>
        </div>
        {(details.budget || details.exchangeDate || details.note) && (
          <dl style={{ textAlign: 'left', margin: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: '#241F2B' }}>
            {details.budget && <><dt style={dt}>{c.budget}</dt><dd style={dd}>{details.budget}</dd></>}
            {details.exchangeDate && <><dt style={dt}>{c.exchange}</dt><dd style={dd}>{details.exchangeDate}</dd></>}
            {details.note && <><dt style={dt}>{c.noteFromHost}</dt><dd style={{ ...dd, whiteSpace: 'pre-line' }}>{details.note}</dd></>}
          </dl>
        )}
        <a className="auth-btn" href={publicPageUrl(row)} style={{ display: 'inline-block', textDecoration: 'none' }}>{c.viewEvent}</a>
      </>
    );
  }

  return (
    <main className={`auth-page ${greatVibes.variable}`}>
      <div className="auth-card" style={{ maxWidth: 460, textAlign: 'center' }}>
        <p style={{ fontSize: 44, margin: '0 0 6px', lineHeight: 1 }} aria-hidden="true">🎁</p>
        <p className="auth-wordmark">My<span className="accent">Gala</span></p>
        {body}
      </div>
    </main>
  );
}

const dt: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A8F8C', marginTop: 10 };
const dd: React.CSSProperties = { margin: '2px 0 0' };
