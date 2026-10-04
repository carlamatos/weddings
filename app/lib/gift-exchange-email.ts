import { escHtml } from './mail';
import { companyMailingLine } from './company';
import { GIFT_COPY, giftLang } from './gift-exchange-copy';
import type { GiftExchangeDetails } from './gift-exchange';

// The email telling one participant who they're the Secret Santa for. Inline
// styles and tables so it renders in Gmail, Outlook and Apple Mail.

const C = { text: '#241F2B', soft: '#6B6470', muted: '#9A8F8C', line: '#EDE8E3', cream: '#F7F4F1', red: '#B3262E', green: '#2F6B4A' };

export function giftExchangeEmail({
  language,
  eventName,
  eventUrl,
  participantName,
  gifteeName,
  gifteeWishlist,
  details,
  revealLink,
}: {
  language?: string | null;
  eventName: string;
  eventUrl: string;
  participantName: string;
  gifteeName: string;
  gifteeWishlist: string | null;
  details: GiftExchangeDetails;
  revealLink: string;
}): { subject: string; html: string } {
  const lang = giftLang(language);
  const t = GIFT_COPY[lang];
  const row = (label: string, value: string) =>
    `<tr><td style="padding: 10px 0; border-top: 1px solid ${C.line}; width: 120px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${C.muted}; vertical-align: top;">${label}</td><td style="padding: 10px 0; border-top: 1px solid ${C.line}; font-size: 15px; line-height: 1.6; color: ${C.text};">${escHtml(value)}</td></tr>`;

  const html = `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escHtml(t.subject(eventName))}</title></head>
<body style="margin: 0; padding: 0; background: ${C.cream};">
  <div style="background: ${C.cream}; padding: 32px 16px; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
    <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(36,31,43,0.08);">
      <div style="height: 8px; background: repeating-linear-gradient(135deg, ${C.red} 0 14px, #fff 14px 22px, ${C.green} 22px 36px, #fff 36px 44px);"></div>
      <div style="padding: 32px 36px 36px; text-align: center;">
        <p style="margin: 0 0 18px; font-size: 40px; line-height: 1;">🎁</p>
        <p style="margin: 0 0 6px; font-size: 15px; color: ${C.text}; text-align: left;">${escHtml(t.hi(participantName))}</p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: ${C.text}; text-align: left;">${escHtml(t.drawn(eventName))}</p>
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${C.red};">${t.youGiveTo}</p>
        <p style="margin: 0 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size: 34px; line-height: 1.2; color: ${C.text};">${escHtml(gifteeName)}</p>
        <p style="margin: 0 0 24px; font-size: 13px; color: ${C.soft};">${t.keepSecret}</p>
        <div style="text-align: left; margin: 0 0 8px; padding: 16px 18px; background: ${C.cream}; border-radius: 10px;">
          <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${C.muted};">${t.theirIdeas}</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${C.text};">${gifteeWishlist ? escHtml(gifteeWishlist).replace(/\n/g, '<br />') : escHtml(t.noIdeas)}</p>
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 12px;">
          ${details.budget ? row(t.budget, details.budget) : ''}
          ${details.exchangeDate ? row(t.exchange, details.exchangeDate) : ''}
          ${details.note ? row(t.noteFromHost, details.note) : ''}
        </table>
        <div style="margin: 28px 0 0;">
          <a href="${escHtml(revealLink)}" style="display: inline-block; padding: 13px 28px; background: ${C.red}; color: #fff; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 600;">${t.openLink}</a>
        </div>
        <p style="margin: 14px 0 0; font-size: 13px;"><a href="${escHtml(eventUrl)}" style="color: ${C.soft};">${t.viewEvent}</a></p>
      </div>
    </div>
    <p style="max-width: 560px; margin: 20px auto 0; text-align: center; font-size: 12px; line-height: 1.6; color: ${C.muted};">
      ${escHtml(t.footer(eventName))}<br />${escHtml(companyMailingLine())}
    </p>
  </div>
</body>
</html>`;

  return { subject: t.subject(eventName), html };
}
