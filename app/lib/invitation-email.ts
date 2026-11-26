import { escHtml } from './mail';
import { googleFontsHref, INVITATION_FONTS, invitationOverlay, readableAccent, type InvitationDesign, type InvitationDetails, type InvitationFont } from './invitation';
import { companyMailingLine } from './company';
import { findOrnament } from './invitation-ornaments';
import { envelopeCopy, inkOn, lightness, shade } from './invitation-envelope';
import { saveTheDateCopy } from './save-the-date';

// The invitation email a guest receives (Invitations → Send). It carries the
// host's saved design — colours, wording, fonts, background — rebuilt with
// tables and inline styles so it renders in Gmail, Outlook and Apple Mail.
// Apple Mail and iOS load the Google fonts; other apps fall back to a close
// system font. Outlook on Windows ignores background images and shows the
// background (or overlay) colour instead. A chosen divider comes as a PNG
// (/api/invitation-ornament); a frame becomes a double rule in its colour,
// since the drawn frame can't stretch to an email's height.
// With the envelope on (design.envelope), the email instead shows the sealed
// envelope (/api/invitation-envelope) and a button to open it on MyGala
// (/i/…), like a card in the post. inviteLink: the guest's own link
// (app/lib/invite-tracking.ts); without one (the preview) the links go
// straight to the page. openPixel: the tiny image that marks it opened.

type Lang = 'en' | 'fr' | 'es';

const COPY: Record<Lang, {
  subject: (title: string) => string;
  greeting: (name?: string) => string;
  personalNote: string;
  rsvp: string;
  viewPage: string;
  footer: (host: string) => string;
  unsubscribe: string;
  yourEvents: string;
  saveTheDate: string;
  saveTheDateSubject: (title: string) => string;
  invitationToFollow: string;
  visitPage: string;
}> = {
  en: {
    subject: (title) => `You're invited: ${title}`,
    greeting: (name) => (name ? `Dear ${name},` : 'Hello,'),
    personalNote: 'A personal note',
    rsvp: 'RSVP',
    viewPage: 'View the event page',
    footer: (host) => `${host} sent you this invitation with MyGala. Reply to this email to reach them.`,
    unsubscribe: 'Don’t want emails about this event? Unsubscribe',
    yourEvents: 'You’re invited to',
    saveTheDate: 'Save the date',
    saveTheDateSubject: (title) => `Save the date: ${title}`,
    invitationToFollow: 'Invitation to follow',
    visitPage: 'Visit our event page',
  },
  fr: {
    subject: (title) => `Invitation : ${title}`,
    greeting: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    personalNote: 'Un mot pour vous',
    rsvp: 'Répondre',
    viewPage: 'Voir la page de l’événement',
    footer: (host) => `${host} vous a envoyé cette invitation avec MyGala. Répondez à ce courriel pour lui écrire.`,
    unsubscribe: 'Vous ne voulez plus de courriels sur cet événement ? Se désabonner',
    yourEvents: 'Vous êtes invités à',
    saveTheDate: 'Réservez la date',
    saveTheDateSubject: (title) => `Réservez la date : ${title}`,
    invitationToFollow: 'L’invitation suivra',
    visitPage: 'Voir notre page d’événement',
  },
  es: {
    subject: (title) => `Invitación: ${title}`,
    greeting: (name) => (name ? `Hola, ${name}:` : 'Hola:'),
    personalNote: 'Una nota para ti',
    rsvp: 'Confirmar asistencia',
    viewPage: 'Ver la página del evento',
    footer: (host) => `${host} te envió esta invitación con MyGala. Responde a este correo para escribirle.`,
    unsubscribe: '¿No quieres correos sobre este evento? Darse de baja',
    yourEvents: 'Estás invitado a',
    saveTheDate: 'Reserva la fecha',
    saveTheDateSubject: (title) => `Reserva la fecha: ${title}`,
    invitationToFollow: 'La invitación llegará pronto',
    visitPage: 'Visita nuestra página del evento',
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

// The guest's own sub-events, as a short list.
function eventsBlock(events: InvitationDetails['events'], heading: string, font: string, color: string, accent: string): string {
  if (!events?.length) return '';
  const rows = events.map((e) => `
      <tr><td style="padding: 8px 0; border-top: 1px solid ${rgba(accent, 0.35)}; text-align: center;">
        <p style="margin: 0; font-family: ${font}; font-size: 16px; font-weight: 600; color: ${color};">${escHtml(e.name)}</p>
        ${e.when ? `<p style="margin: 2px 0 0; font-family: ${font}; font-size: 14px; color: ${color};">${escHtml(e.when)}</p>` : ''}
        ${e.venue ? `<p style="margin: 2px 0 0; font-family: ${font}; font-size: 13px; color: ${color}; opacity: 0.85;">${escHtml(e.venue)}</p>` : ''}
      </td></tr>`).join('');
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 22px auto 0; max-width: 400px; width: 100%;">
      <tr><td style="padding-bottom: 6px; text-align: center; font-family: ${font}; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: ${accent};">${escHtml(heading)}</td></tr>
      ${rows}
    </table>`;
}

export function invitationEmail({
  design,
  details,
  language,
  hostName,
  guestName,
  note,
  unsubscribeLink,
  siteBase,
  inviteLink,
  openPixel,
}: {
  design: InvitationDesign;
  details: InvitationDetails;
  language?: string | null;
  hostName: string;
  guestName?: string; // the name as on the guest list, for "Dear …,"
  note?: string | null; // the host's personal note for this guest
  unsubscribeLink?: string; // omitted for the host's own test copy
  siteBase: string;
  inviteLink?: string;
  openPixel?: string;
}): { subject: string; html: string } {
  const lang: Lang = language === 'fr' || language === 'es' ? language : 'en';
  const t = COPY[lang];
  const heading = fontStack(design.headingFont);
  const body = fontStack(design.bodyFont);
  const bg = design.background;
  // The host's own finished invitation: shown as an image, not as a background.
  const own = design.layout === 'own' && bg.kind === 'image' && !!bg.imageUrl;
  const image = !own && bg.kind === 'image' && bg.imageUrl ? absolute(bg.imageUrl, siteBase) : '';
  // What shows where the image can't (Outlook): the wash colour if there is one.
  // The photo's wash, strong enough for the words to read (as on the card).
  const overlay = image ? invitationOverlay(design) : null;
  const solid = overlay ? overlay.color : bg.color;
  const wash = overlay ? rgba(overlay.color, overlay.opacity) : 'transparent';
  const accent = design.accentColor;
  // The name and closing: the accent, made readable when it's too faint.
  const accentText = readableAccent(design);
  const text = design.textColor;
  // The RSVP hidden on the page: the button opens the page itself instead.
  // Through the guest's own link when there is one, so the host sees they
  // followed it.
  const pageUrl = inviteLink ? `${inviteLink}?to=page` : details.url;
  const rsvpUrl = inviteLink ? `${inviteLink}?to=rsvp` : details.rsvpOff ? details.url : `${details.url}#rsvp`;
  const envelope = design.envelope.on ? design.envelope : null;
  const divider = findOrnament('divider', design.divider);
  const frame = findOrnament('frame', design.frame);

  const p = (content: string, style = '') =>
    `<p style="margin: 0 0 14px; font-family: ${body}; color: ${text}; ${style}">${content}</p>`;

  const place = [details.venue && `<strong style="font-weight: 600;">${escHtml(details.venue)}</strong>`, details.address && escHtml(details.address)]
    .filter(Boolean)
    .join('<br />');

  const buttons = `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 28px auto 6px;">
      <tr><td style="border-radius: 999px; background: ${accent};">
        <a href="${escHtml(rsvpUrl)}" style="display: inline-block; padding: 14px 34px; font-family: ${body}; font-size: 15px; font-weight: 600; letter-spacing: 1px; color: ${onColor(accent)}; text-decoration: none; border-radius: 999px;">${details.rsvpOff ? t.viewPage : t.rsvp}</a>
      </td></tr>
    </table>
    ${details.rsvpOff ? '' : `<p style="margin: 10px 0 0; font-family: ${body}; font-size: 13px;"><a href="${escHtml(pageUrl)}" style="color: ${text}; text-decoration: underline;">${t.viewPage}</a></p>`}`;

  const noteBox = note?.trim() ? `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 24px auto 0; max-width: 440px; width: 100%;">
      <tr><td style="padding: 16px 20px; border: 1px solid ${rgba(accent, 0.55)}; border-left: 3px solid ${accent}; border-radius: 6px; text-align: left;">
        <p style="margin: 0 0 6px; font-family: ${body}; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: ${accent};">${t.personalNote}</p>
        <p style="margin: 0; font-family: ${body}; font-size: 15px; line-height: 1.65; color: ${text};">${escHtml(note.trim()).replace(/\n/g, '<br />')}</p>
      </td></tr>
    </table>` : '';

  // Their own design: the greeting, the image (linked to the page), the note
  // and the buttons.
  const ownCard = own ? `
    ${guestName !== undefined ? p(escHtml(t.greeting(guestName)), 'font-size: 16px; margin-bottom: 22px;') : ''}
    <a href="${escHtml(pageUrl)}" style="display: block; text-decoration: none;"><img src="${escHtml(absolute(bg.imageUrl, siteBase))}" width="488" alt="${escHtml(details.name)}" style="display: block; width: 100%; max-width: 488px; height: auto; margin: 0 auto; border: 0; border-radius: 4px;" /></a>
    ${eventsBlock(details.events, t.yourEvents, body, text, accent)}
    ${noteBox}
    ${buttons}
  ` : '';

  const card = own ? ownCard : `
    ${guestName !== undefined ? p(escHtml(t.greeting(guestName)), 'font-size: 16px; margin-bottom: 22px;') : ''}
    ${design.eyebrow ? p(escHtml(design.eyebrow), 'font-size: 13px; letter-spacing: 3px; text-transform: uppercase;') : ''}
    <h1 style="margin: 0 0 16px; font-family: ${heading}; font-weight: 400; font-size: 44px; line-height: 1.1; color: ${accentText};">${escHtml(details.name)}</h1>
    ${divider
      ? `<img src="${escHtml(`${siteBase}/api/invitation-ornament?kind=divider&id=${divider.id}&color=${design.dividerColor.slice(1)}`)}" width="240" height="40" alt="" style="display: block; width: 240px; max-width: 100%; height: auto; margin: 0 auto 20px; border: 0;" />`
      : `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 20px;"><tr><td style="width: 70px; height: 2px; background: ${accent}; font-size: 0; line-height: 0;">&nbsp;</td></tr></table>`}
    ${details.date ? p(escHtml(details.date), 'font-size: 18px; font-weight: 600; margin-bottom: 6px;') : ''}
    ${details.time ? p(escHtml(details.time), 'font-size: 16px;') : ''}
    ${place ? p(place, 'font-size: 15px; line-height: 1.55; margin-top: 8px;') : ''}
    ${details.password ? p(`${escHtml(details.passwordLabel ?? 'Page password')}: <strong style="font-weight: 700; letter-spacing: 1px;">${escHtml(details.password)}</strong>`, 'font-size: 15px; margin-top: 8px;') : ''}
    ${eventsBlock(details.events, t.yourEvents, body, text, accentText)}
    ${noteBox}
    ${design.message ? p(escHtml(design.message).replace(/\n/g, '<br />'), 'font-size: 15px; line-height: 1.7; margin: 22px auto 0; max-width: 420px;') : ''}
    ${buttons}
    ${design.closing ? `<p style="margin: 26px 0 0; font-family: ${heading}; font-size: 26px; line-height: 1.3; color: ${accentText};">${escHtml(design.closing)}</p>` : ''}
  `;

  // The sealed envelope: the greeting, who it's from, the envelope (linked)
  // and the button to open it.
  const e = envelopeCopy(lang);
  const backdrop = envelope ? (lightness(envelope.color) > 0.4 ? shade(envelope.color, -0.09) : shade(envelope.color, 0.16)) : '';
  const ink = envelope ? inkOn(backdrop) : text;
  const openUrl = inviteLink ?? details.url;
  const envelopeImg = envelope
    ? `${siteBase}/api/invitation-envelope?c=${envelope.color.slice(1)}&s=${envelope.sealColor.slice(1)}&e=${envelope.seal}`
    : '';
  const envCard = envelope ? `
    ${guestName !== undefined ? `<p style="margin: 0 0 6px; font-family: ${body}; font-size: 16px; color: ${ink};">${escHtml(t.greeting(guestName))}</p>` : ''}
    <p style="margin: 0 0 22px; font-family: ${body}; font-size: 15px; color: ${ink};">${escHtml(e.emailLead(hostName))}</p>
    <a href="${escHtml(openUrl)}" style="display: block; text-decoration: none;"><img src="${escHtml(envelopeImg)}" width="440" alt="${escHtml(e.openYourInvitation)}" style="display: block; width: 100%; max-width: 440px; height: auto; margin: 0 auto; border: 0;" /></a>
    <p style="margin: 18px 0 4px; font-family: ${heading}; font-weight: 400; font-size: 30px; line-height: 1.2; color: ${ink};">${escHtml(details.name)}</p>
    ${details.date ? `<p style="margin: 0; font-family: ${body}; font-size: 14px; letter-spacing: 1px; color: ${ink};">${escHtml(details.date)}</p>` : ''}
    ${eventsBlock(details.events, t.yourEvents, body, ink, ink)}
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 24px auto 0;">
      <tr><td style="border-radius: 999px; background: ${accent};">
        <a href="${escHtml(openUrl)}" style="display: inline-block; padding: 14px 34px; font-family: ${body}; font-size: 15px; font-weight: 600; letter-spacing: 1px; color: ${onColor(accent)}; text-decoration: none; border-radius: 999px;">${e.emailButton}</a>
      </td></tr>
    </table>
  ` : '';
  const pixel = openPixel ? `<img src="${escHtml(openPixel)}" width="1" height="1" alt="" style="display: block; width: 1px; height: 1px; border: 0;" />` : '';

  const preheader = envelope
    ? [e.emailLead(hostName), details.name].filter(Boolean).join(' · ')
    : [design.eyebrow, details.name, details.date].filter(Boolean).join(' · ');

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
          ${envelope ? `<td bgcolor="${backdrop}" align="center" style="background-color: ${backdrop}; padding: 40px 24px 44px; text-align: center;">${envCard}</td>` : `<td bgcolor="${solid}" ${image ? `background="${escHtml(image)}"` : ''} style="background-color: ${solid}; ${image ? `background-image: url('${escHtml(image)}'); background-size: cover; background-position: center;` : ''}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding: ${own ? '28px 24px 36px' : frame ? '16px' : '56px 36px 52px'}; text-align: center; background: ${wash};">
                ${frame && !own ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 40px 24px 36px; text-align: center; border: 4px double ${design.frameColor};">${card}</td></tr></table>` : card}
              </td></tr>
            </table>
          </td>`}
        </tr>
      </table>
      <p style="max-width: 520px; margin: 20px auto 0; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 12px; line-height: 1.6; color: #8A8086; text-align: center;">
        ${escHtml(t.footer(hostName))}
        ${unsubscribeLink ? `<br /><a href="${escHtml(unsubscribeLink)}" style="color: #8A8086;">${t.unsubscribe}</a>` : ''}
        <br />${escHtml(companyMailingLine())}
      </p>
      ${pixel}
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: t.subject(details.name), html };
}

// A save-the-date, months before the invitation: the event's name and date
// in the invitation's fonts and colours, the place, "Invitation to follow"
// and a link to the page. No RSVP yet, and no tracking.
export function saveTheDateEmail({
  design,
  details,
  language,
  hostName,
  guestName,
  unsubscribeLink,
  calendar,
  link,
}: {
  design: InvitationDesign;
  details: InvitationDetails;
  language?: string | null;
  hostName: string;
  guestName?: string;
  unsubscribeLink?: string;
  siteBase: string;
  // "Add it to your calendar": Google Calendar and the .ics file
  // (app/lib/save-the-date.ts), when the event has a date.
  calendar?: { google: string; apple: string };
  // The shareable save-the-date page, for the button (else the event page).
  link?: string;
}): { subject: string; html: string } {
  const lang: Lang = language === 'fr' || language === 'es' ? language : 'en';
  const t = COPY[lang];
  const cal = saveTheDateCopy(lang);
  const heading = fontStack(design.headingFont);
  const body = fontStack(design.bodyFont);
  // Their own uploaded design has no colours of its own: the envelope's.
  const own = design.layout === 'own';
  const paper = own ? design.envelope.color : design.background.kind === 'image' ? (invitationOverlay(design)?.color ?? design.background.color) : design.background.color;
  const text = own ? inkOn(paper) : design.textColor;
  const accent = design.accentColor;
  const accentText = own ? text : readableAccent(design);
  const place = [details.venue, details.address].filter(Boolean).join(' · ');
  const p = (content: string, style = '') => `<p style="margin: 0 0 12px; font-family: ${body}; color: ${text}; ${style}">${content}</p>`;

  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>${escHtml(t.saveTheDate)}: ${escHtml(details.name)}</title>
  <link rel="stylesheet" href="${googleFontsHref([design.headingFont, design.bodyFont])}" />
</head>
<body style="margin: 0; padding: 0; background: #F2EFEC;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escHtml([t.saveTheDate, details.name, details.date].filter(Boolean).join(' · '))}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #F2EFEC;">
    <tr><td align="center" style="padding: 28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; border-radius: 6px; overflow: hidden;">
        <tr><td bgcolor="${paper}" align="center" style="background-color: ${paper}; padding: 52px 32px 48px; text-align: center;">
          ${guestName ? p(escHtml(t.greeting(guestName)), 'font-size: 16px; margin-bottom: 26px;') : ''}
          ${p(escHtml(t.saveTheDate), `font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: ${accentText};`)}
          <h1 style="margin: 0 0 18px; font-family: ${heading}; font-weight: 400; font-size: 42px; line-height: 1.12; color: ${accentText};">${escHtml(details.name)}</h1>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 20px;"><tr><td style="width: 70px; height: 2px; background: ${accent}; font-size: 0; line-height: 0;">&nbsp;</td></tr></table>
          ${details.date ? p(escHtml(details.date), 'font-size: 22px; font-weight: 600; margin-bottom: 8px;') : ''}
          ${place ? p(escHtml(place), 'font-size: 15px; line-height: 1.55;') : ''}
          ${eventsBlock(details.events, t.yourEvents, body, text, accentText)}
          ${p(escHtml(t.invitationToFollow), `font-family: ${heading}; font-size: 24px; margin: 26px 0 0; color: ${accentText};`)}
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 26px auto 0;">
            <tr><td style="border-radius: 999px; background: ${accent};">
              <a href="${escHtml(link ?? details.url)}" style="display: inline-block; padding: 13px 30px; font-family: ${body}; font-size: 15px; font-weight: 600; letter-spacing: 1px; color: ${onColor(accent)}; text-decoration: none; border-radius: 999px;">${link ? escHtml(cal.open) : t.visitPage}</a>
            </td></tr>
          </table>
          ${calendar ? `${p(escHtml(cal.addToCalendar), 'font-size: 14px; margin: 24px 0 8px;')}
          <p style="margin: 0; font-family: ${body}; font-size: 14px;"><a href="${escHtml(calendar.google)}" style="color: ${accentText}; font-weight: 600;">${escHtml(cal.google)}</a> &nbsp;·&nbsp; <a href="${escHtml(calendar.apple)}" style="color: ${accentText}; font-weight: 600;">${escHtml(cal.apple)}</a></p>` : ''}
        </td></tr>
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
  return { subject: t.saveTheDateSubject(details.name), html };
}
