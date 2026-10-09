import { escHtml } from './mail';
import { googleFontsHref, INVITATION_FONTS, type InvitationDesign, type InvitationDetails, type InvitationFont } from './invitation';
import { companyMailingLine } from './company';

// The invitation email a guest receives (Invitations → Send). It carries the
// host's saved design — colours, wording, fonts, background — rebuilt with
// tables and inline styles so it renders in Gmail, Outlook and Apple Mail.
// Apple Mail and iOS load the Google fonts; other apps fall back to a close
// system font. Outlook on Windows ignores background images and shows the
// background (or overlay) colour instead.

type Lang = 'en' | 'fr' | 'es';

const COPY: Record<Lang, {
  subject: (title: string) => string;
  greeting: (name?: string) => string;
  personalNote: string;
  rsvp: string;
  viewPage: string;
  footer: (host: string) => string;
  unsubscribe: string;
}> = {
  en: {
    subject: (title) => `You're invited: ${title}`,
    greeting: (name) => (name ? `Dear ${name},` : 'Hello,'),
    personalNote: 'A personal note',
    rsvp: 'RSVP',
    viewPage: 'View the event page',
    footer: (host) => `${host} sent you this invitation with MyGala. Reply to this email to reach them.`,
    unsubscribe: 'Don’t want emails about this event? Unsubscribe',
  },
  fr: {
    subject: (title) => `Invitation : ${title}`,
    greeting: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    personalNote: 'Un mot pour vous',
    rsvp: 'Répondre',
    viewPage: 'Voir la page de l’événement',
    footer: (host) => `${host} vous a envoyé cette invitation avec MyGala. Répondez à ce courriel pour lui écrire.`,
    unsubscribe: 'Vous ne voulez plus de courriels sur cet événement ? Se désabonner',
  },
  es: {
    subject: (title) => `Invitación: ${title}`,
    greeting: (name) => (name ? `Hola, ${name}:` : 'Hola:'),
    personalNote: 'Una nota para ti',
    rsvp: 'Confirmar asistencia',
    viewPage: 'Ver la página del evento',
    footer: (host) => `${host} te envió esta invitación con MyGala. Responde a este correo para escribirle.`,
    unsubscribe: '¿No quieres correos sobre este evento? Darse de baja',
  },
};

// The web font first, then a system font with the same feel. Never the
// generic `cursive`, which some apps render as Comic Sans.
function fontStack(font: InvitationFont): string {
  const family = INVITATION_FONTS[font].family;
  const name = family.split(',')[0];
  if (family.includes('sans-serif')) return `${name}, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  return `${name}, Georgia, 'Times New Roman', serif`;
}

// Dark text on a light accent, white on a dark one.
function onColor(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.45 ? '#241F2B' : '#FFFFFF';
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const absolute = (url: string, base: string) => (url.startsWith('/') ? `${base}${url}` : url);

export function invitationEmail({
  design,
  details,
  language,
  hostName,
  guestName,
  note,
  unsubscribeLink,
  siteBase,
}: {
  design: InvitationDesign;
  details: InvitationDetails;
  language?: string | null;
  hostName: string;
  guestName?: string; // the name as on the guest list, for "Dear …,"
  note?: string | null; // the host's personal note for this guest
  unsubscribeLink?: string; // omitted for the host's own test copy
  siteBase: string;
}): { subject: string; html: string } {
  const lang: Lang = language === 'fr' || language === 'es' ? language : 'en';
  const t = COPY[lang];
  const heading = fontStack(design.headingFont);
  const body = fontStack(design.bodyFont);
  const bg = design.background;
  const image = bg.kind === 'image' && bg.imageUrl ? absolute(bg.imageUrl, siteBase) : '';
  // What shows where the image can't (Outlook): the wash colour if there is one.
  const solid = image && bg.overlay ? bg.overlayColor : bg.color;
  const wash = image && bg.overlay ? rgba(bg.overlayColor, bg.overlayOpacity) : 'transparent';
  const accent = design.accentColor;
  const text = design.textColor;
  const rsvpUrl = `${details.url}#rsvp`;

  const p = (content: string, style = '') =>
    `<p style="margin: 0 0 14px; font-family: ${body}; color: ${text}; ${style}">${content}</p>`;

  const place = [details.venue && `<strong style="font-weight: 600;">${escHtml(details.venue)}</strong>`, details.address && escHtml(details.address)]
    .filter(Boolean)
    .join('<br />');

  const card = `
    ${guestName !== undefined ? p(escHtml(t.greeting(guestName)), 'font-size: 16px; margin-bottom: 22px;') : ''}
    ${design.eyebrow ? p(escHtml(design.eyebrow), 'font-size: 13px; letter-spacing: 3px; text-transform: uppercase;') : ''}
    <h1 style="margin: 0 0 16px; font-family: ${heading}; font-weight: 400; font-size: 44px; line-height: 1.1; color: ${accent};">${escHtml(details.name)}</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 20px;"><tr><td style="width: 70px; height: 2px; background: ${accent}; font-size: 0; line-height: 0;">&nbsp;</td></tr></table>
    ${details.date ? p(escHtml(details.date), 'font-size: 18px; font-weight: 600; margin-bottom: 6px;') : ''}
    ${details.time ? p(escHtml(details.time), 'font-size: 16px;') : ''}
    ${place ? p(place, 'font-size: 15px; line-height: 1.55; margin-top: 8px;') : ''}
    ${details.password ? p(`${escHtml(details.passwordLabel ?? 'Page password')}: <strong style="font-weight: 700; letter-spacing: 1px;">${escHtml(details.password)}</strong>`, 'font-size: 15px; margin-top: 8px;') : ''}
    ${note?.trim() ? `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 24px auto 0; max-width: 440px; width: 100%;">
      <tr><td style="padding: 16px 20px; border: 1px solid ${rgba(accent, 0.55)}; border-left: 3px solid ${accent}; border-radius: 6px; text-align: left;">
        <p style="margin: 0 0 6px; font-family: ${body}; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: ${accent};">${t.personalNote}</p>
        <p style="margin: 0; font-family: ${body}; font-size: 15px; line-height: 1.65; color: ${text};">${escHtml(note.trim()).replace(/\n/g, '<br />')}</p>
      </td></tr>
    </table>` : ''}
    ${design.message ? p(escHtml(design.message).replace(/\n/g, '<br />'), 'font-size: 15px; line-height: 1.7; margin: 22px auto 0; max-width: 420px;') : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 28px auto 6px;">
      <tr><td style="border-radius: 999px; background: ${accent};">
        <a href="${escHtml(rsvpUrl)}" style="display: inline-block; padding: 14px 34px; font-family: ${body}; font-size: 15px; font-weight: 600; letter-spacing: 1px; color: ${onColor(accent)}; text-decoration: none; border-radius: 999px;">${t.rsvp}</a>
      </td></tr>
    </table>
    <p style="margin: 10px 0 0; font-family: ${body}; font-size: 13px;"><a href="${escHtml(details.url)}" style="color: ${text}; text-decoration: underline;">${t.viewPage}</a></p>
    ${design.closing ? `<p style="margin: 26px 0 0; font-family: ${heading}; font-size: 26px; line-height: 1.3; color: ${accent};">${escHtml(design.closing)}</p>` : ''}
  `;

  const preheader = [design.eyebrow, details.name, details.date].filter(Boolean).join(' · ');

  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${escHtml(details.name)}</title>
  <link rel="stylesheet" href="${googleFontsHref([design.headingFont, design.bodyFont])}" />
</head>
<body style="margin: 0; padding: 0; background: #F2EFEC;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #F2EFEC;">
    <tr><td align="center" style="padding: 28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; border-radius: 6px; overflow: hidden;">
        <tr>
          <td bgcolor="${solid}" ${image ? `background="${escHtml(image)}"` : ''} style="background-color: ${solid}; ${image ? `background-image: url('${escHtml(image)}'); background-size: cover; background-position: center;` : ''}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding: 56px 36px 52px; text-align: center; background: ${wash};">
                ${card}
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="max-width: 520px; margin: 20px auto 0; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; line-height: 1.6; color: #8A8086; text-align: center;">
        ${escHtml(t.footer(hostName))}
        ${unsubscribeLink ? `<br /><a href="${escHtml(unsubscribeLink)}" style="color: #8A8086;">${t.unsubscribe}</a>` : ''}
        <br />${escHtml(companyMailingLine())}
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: t.subject(details.name), html };
}
