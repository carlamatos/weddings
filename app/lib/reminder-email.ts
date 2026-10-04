import type { UserPage } from './definitions';
import { escHtml } from './mail';
import { publicPageUrl, socialImagePathFor, socialImageFor } from './share';
import { reminderLeadText, type ReminderKey } from './reminders';
import { eventWhen } from '@/app/ui/themes/event-when';
import { companyMailingLine } from './company';

// The reminder email guests receive (see app/api/cron/reminders). Written in
// the page's language; laid out with inline styles and tables so it renders
// in Gmail, Outlook and Apple Mail alike.

type Lang = 'en' | 'fr' | 'es';

const COPY: Record<Lang, {
  locale: string;
  eyebrow: string;
  subject: (title: string, lead: string) => string;
  headline: (lead: string) => string;
  greeting: (name?: string) => string;
  intro: string;
  when: string;
  where: string;
  online: string;
  joinOnline: string;
  directions: string;
  noteFromHost: string;
  viewPage: string;
  footer: (title: string) => string;
  unsubscribe: string;
}> = {
  en: {
    locale: 'en-US',
    eyebrow: 'Event reminder',
    subject: (title, lead) => `Reminder: ${title} is ${lead}`,
    headline: (lead) => `It's ${lead}!`,
    greeting: (name) => (name ? `Hi ${name},` : 'Hi there,'),
    intro: 'Just a friendly reminder that the day is almost here. Here are the details:',
    when: 'When',
    where: 'Where',
    online: 'Online',
    joinOnline: 'Join online',
    directions: 'Get directions',
    noteFromHost: 'A note from your host',
    viewPage: 'View event page',
    footer: (title) => `You're receiving this because you asked for updates about ${title} when you replied to the invitation.`,
    unsubscribe: 'Unsubscribe',
  },
  fr: {
    locale: 'fr-FR',
    eyebrow: 'Rappel',
    subject: (title, lead) => `Rappel : ${title}, c'est ${lead}`,
    headline: (lead) => `C'est ${lead} !`,
    greeting: (name) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    intro: 'Petit rappel amical : le grand jour approche. Voici les détails :',
    when: 'Quand',
    where: 'Où',
    online: 'En ligne',
    joinOnline: 'Rejoindre en ligne',
    directions: "Obtenir l'itinéraire",
    noteFromHost: 'Un mot de votre hôte',
    viewPage: "Voir la page de l'événement",
    footer: (title) => `Vous recevez ce courriel parce que vous avez demandé à recevoir des nouvelles de ${title} en répondant à l'invitation.`,
    unsubscribe: 'Se désabonner',
  },
  es: {
    locale: 'es-ES',
    eyebrow: 'Recordatorio',
    subject: (title, lead) => `Recordatorio: ${title} es ${lead}`,
    headline: (lead) => `¡Es ${lead}!`,
    greeting: (name) => (name ? `Hola ${name}:` : 'Hola:'),
    intro: 'Un recordatorio amistoso: el gran día está muy cerca. Estos son los detalles:',
    when: 'Cuándo',
    where: 'Dónde',
    online: 'En línea',
    joinOnline: 'Unirse en línea',
    directions: 'Cómo llegar',
    noteFromHost: 'Un mensaje de tu anfitrión',
    viewPage: 'Ver la página del evento',
    footer: (title) => `Recibes este correo porque pediste recibir novedades sobre ${title} al responder la invitación.`,
    unsubscribe: 'Darse de baja',
  },
};

const C = {
  text: '#241F2B',
  soft: '#6B6470',
  muted: '#9A8F8C',
  line: '#EDE8E3',
  cream: '#F7F4F1',
  rose: '#B6584A',
};

function row(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding: 12px 0; border-top: 1px solid ${C.line}; width: 90px; vertical-align: top; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${C.muted};">${label}</td>
      <td style="padding: 12px 0; border-top: 1px solid ${C.line}; font-size: 15px; line-height: 1.6; color: ${C.text};">${valueHtml}</td>
    </tr>`;
}

export function reminderEmail({
  page,
  reminderKey,
  message,
  guestName,
  unsubscribeLink,
}: {
  page: UserPage;
  reminderKey: ReminderKey;
  message?: string;
  guestName?: string;
  unsubscribeLink: string;
}): { subject: string; html: string } {
  const lang: Lang = page.language === 'fr' || page.language === 'es' ? page.language : 'en';
  const t = COPY[lang];
  const title = page.heading || 'MyGala';
  const lead = reminderLeadText(reminderKey, t.locale);
  const url = publicPageUrl(page);

  // No image rather than the generic MyGala card when the page has neither a
  // banner nor a theme default.
  const imagePath = socialImagePathFor(page);
  const image = imagePath === '/opengraph-image.png' ? '' : socialImageFor(page);

  const when = eventWhen(
    { eventDate: page.event_date, eventTime: page.event_time, eventEndDate: page.event_end_date, eventEndTime: page.event_end_time },
    t.locale,
  );
  const whenHtml = [when.date, when.time].filter(Boolean).map((s) => escHtml(s)).join('<br />');

  let whereHtml = '';
  if (page.location === 'virtual') {
    whereHtml = escHtml(t.online) + (page.url ? `<br /><a href="${escHtml(page.url)}" style="color: ${C.rose}; font-weight: 600;">${t.joinOnline} →</a>` : '');
  } else {
    const street = [page.street_address, page.unit_number].filter(Boolean).join(', ');
    const cityLine = [page.city, page.postal_code, page.country].filter(Boolean).join(', ');
    const lines = [page.venue_name && `<strong>${escHtml(page.venue_name)}</strong>`, street && escHtml(street), cityLine && escHtml(cityLine)].filter(Boolean);
    const query = page.formatted_address || [page.venue_name, street, cityLine].filter(Boolean).join(', ');
    if (query) {
      const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}${page.place_id ? `&query_place_id=${encodeURIComponent(page.place_id)}` : ''}`;
      lines.push(`<a href="${maps}" style="color: ${C.rose}; font-weight: 600;">${t.directions} →</a>`);
    }
    whereHtml = lines.join('<br />');
  }

  const note = message?.trim();
  const noteHtml = note
    ? `
      <div style="margin: 28px 0 0; padding: 18px 20px; background: ${C.cream}; border-left: 3px solid ${C.rose}; border-radius: 6px;">
        <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${C.muted};">${t.noteFromHost}</p>
        <p style="margin: 0; font-size: 15px; line-height: 1.7; color: ${C.text}; white-space: pre-line;">${escHtml(note)}</p>
      </div>`
    : '';

  const html = `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escHtml(title)}</title></head>
<body style="margin: 0; padding: 0; background: ${C.cream};">
  <div style="background: ${C.cream}; padding: 32px 16px; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;">
    <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(36,31,43,0.08);">
      ${image ? `<img src="${escHtml(image)}" alt="" width="560" style="display: block; width: 100%; max-width: 560px; height: 220px; object-fit: cover; border: 0;" />` : ''}
      <div style="padding: 32px 36px 36px;">
        <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${C.rose};">${t.eyebrow}</p>
        <h1 style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 500; line-height: 1.25; color: ${C.text};">${escHtml(title)}</h1>
        <p style="margin: 0 0 24px; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-style: italic; color: ${C.soft};">${escHtml(t.headline(lead))}</p>
        <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: ${C.text};">${escHtml(t.greeting(guestName))}</p>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: ${C.text};">${t.intro}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          ${whenHtml ? row(t.when, whenHtml) : ''}
          ${whereHtml ? row(t.where, whereHtml) : ''}
        </table>
        ${noteHtml}
        <div style="margin: 30px 0 0; text-align: center;">
          <a href="${escHtml(url)}" style="display: inline-block; padding: 13px 28px; background: ${C.text}; color: #fff; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 600;">${t.viewPage}</a>
        </div>
      </div>
    </div>
    <p style="max-width: 560px; margin: 20px auto 0; text-align: center; font-size: 12px; line-height: 1.6; color: ${C.muted};">
      ${escHtml(t.footer(title))}<br />
      <a href="${escHtml(unsubscribeLink)}" style="color: ${C.muted};">${t.unsubscribe}</a><br />
      ${escHtml(companyMailingLine())}
    </p>
  </div>
</body>
</html>`;

  return { subject: t.subject(title, lead), html };
}
