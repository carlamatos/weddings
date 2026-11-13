import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml, type MailLang } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';
import { ensureAdminEmailTables, userUnsubscribeUrl } from './admin-email';
import { PLAN_PRICE_PLUS_TAX } from './plans';

// Emails around the event date, from the daily cron (app/api/cron/plan-reminders):
//  1. sendUpgradeEmails — about two weeks before the event, a free page's host
//     hears what Live Party adds on the day (the slideshow on the venue
//     screen, up to 500 photos, song requests, Find Your Table…). Once per page.
//  2. sendPhotosReadyEmails — the day after the event, the host of a page with
//     guest photos gets a link to see and download them all. Once per page.
// Neither goes to accounts that unsubscribed from MyGala's emails. Each page
// is marked (claimed) before sending, so a failed or repeated run never sends
// twice. event_date is a calendar day, compared in UTC.

const UPGRADE_SENT = 'upgrade_email_sent';
const PHOTOS_SENT = 'photos_ready_email_sent';
const BATCH = 200;

type Row = { page_id: number; heading: string | null; language: string | null; user_id: string; email: string; given_name: string | null; photos?: number };

const mailLang = (lang: string | null): MailLang => (lang === 'fr' || lang === 'es' ? lang : 'en');
const plainHeading = (h: string | null, fallback: string) => (h ?? '').replace(/\s+/g, ' ').trim() || fallback;

const TEXT = {
  en: {
    hi: (name: string) => (name ? `Hi ${name},` : 'Hi there,'),
    yourEvent: 'your event',
    upgradeSubject: (h: string) => `Two weeks until ${h}: make it a Live Party 🎉`,
    upgradeHeading: 'Make the day itself unforgettable',
    upgradeBody: (h: string) => `<strong>${h}</strong> is two weeks away! Your page is all set for RSVPs. For the day itself, MyGala Live Party adds:`,
    upgradeList: ['A live photo slideshow for the TV or projector at your venue', 'Up to 500 guest photos, shared by QR code', 'Song requests and a livestream for faraway family', 'Find Your Table: guests scan a sign and see their table', 'Automatic reminder emails to your guests'],
    upgradePrice: `One payment of ${PLAN_PRICE_PLUS_TAX} for this event. No subscription.`,
    upgradeButton: 'See Live Party',
    upgradeMore: 'Watch the video and see everything in Live Party',
    upgradePage: '/live-party',
    photosSubject: (h: string, n: number) => `${n} guest photo${n === 1 ? '' : 's'} from ${h} 📸`,
    photosHeading: 'Your guests’ photos are ready',
    photosBody: (h: string, n: number) => `Your guests shared <strong>${n} photo${n === 1 ? '' : 's'}</strong> from <strong>${h}</strong>. See them all in your dashboard and download them in one click.`,
    photosButton: 'See the photos',
    questions: 'Questions? Write to us at',
    signoff: 'Warmly,<br />The MyGala team',
    why: 'You’re receiving this because you created an event page on MyGala.',
    unsubscribe: 'Unsubscribe',
  },
  fr: {
    hi: (name: string) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    yourEvent: 'votre événement',
    upgradeSubject: (h: string) => `Plus que deux semaines avant ${h} : passez à Live Party 🎉`,
    upgradeHeading: 'Rendez le jour J inoubliable',
    upgradeBody: (h: string) => `<strong>${h}</strong> a lieu dans deux semaines ! Votre page est prête pour les RSVP. Pour le jour J, MyGala Live Party ajoute :`,
    upgradeList: ['Un diaporama de photos en direct sur la télé ou le projecteur de votre salle', 'Jusqu’à 500 photos des invités, partagées par code QR', 'Les demandes de chansons et une diffusion en direct pour la famille au loin', 'Find Your Table : les invités scannent une affiche et voient leur table', 'Des courriels de rappel automatiques à vos invités'],
    upgradePrice: `Un seul paiement de ${PLAN_PRICE_PLUS_TAX} pour cet événement. Sans abonnement.`,
    upgradeButton: 'Découvrir Live Party',
    upgradeMore: 'Voir la vidéo et tout ce qu’inclut Live Party (en anglais)',
    upgradePage: '/live-party',
    photosSubject: (h: string, n: number) => `${n} photo${n === 1 ? '' : 's'} des invités de ${h} 📸`,
    photosHeading: 'Les photos de vos invités sont prêtes',
    photosBody: (h: string, n: number) => `Vos invités ont partagé <strong>${n} photo${n === 1 ? '' : 's'}</strong> de <strong>${h}</strong>. Voyez-les toutes dans votre tableau de bord et téléchargez-les en un clic.`,
    photosButton: 'Voir les photos',
    questions: 'Des questions ? Écrivez-nous à',
    signoff: 'Chaleureusement,<br />L’équipe MyGala',
    why: 'Vous recevez ce courriel parce que vous avez créé une page d’événement sur MyGala.',
    unsubscribe: 'Se désabonner',
  },
  es: {
    hi: (name: string) => (name ? `Hola, ${name}:` : 'Hola:'),
    yourEvent: 'tu evento',
    upgradeSubject: (h: string) => `Faltan dos semanas para ${h}: hazlo Live Party 🎉`,
    upgradeHeading: 'Haz que el gran día sea inolvidable',
    upgradeBody: (h: string) => `¡Faltan dos semanas para <strong>${h}</strong>! Tu página ya está lista para las confirmaciones. Para el día de la fiesta, MyGala Live Party añade:`,
    upgradeList: ['Una presentación de fotos en vivo en la pantalla o el proyector del salón', 'Hasta 500 fotos de tus invitados, con código QR', 'Peticiones de canciones y transmisión en vivo para la familia lejana', 'Find Your Table: tus invitados escanean un letrero y ven su mesa', 'Recordatorios automáticos por correo para tus invitados'],
    upgradePrice: `Un solo pago de ${PLAN_PRICE_PLUS_TAX} por este evento. Sin suscripción.`,
    upgradeButton: 'Ver Live Party',
    upgradeMore: 'Mira el video y todo lo que incluye Live Party',
    upgradePage: '/es/live-party',
    photosSubject: (h: string, n: number) => `${n} foto${n === 1 ? '' : 's'} de tus invitados de ${h} 📸`,
    photosHeading: 'Las fotos de tus invitados están listas',
    photosBody: (h: string, n: number) => `Tus invitados compartieron <strong>${n} foto${n === 1 ? '' : 's'}</strong> de <strong>${h}</strong>. Velas todas en tu panel y descárgalas con un clic.`,
    photosButton: 'Ver las fotos',
    questions: '¿Preguntas? Escríbenos a',
    signoff: 'Con cariño,<br />El equipo de MyGala',
    why: 'Recibes este correo porque creaste una página de evento en MyGala.',
    unsubscribe: 'Darte de baja',
  },
} satisfies Record<MailLang, unknown>;

function shell(lang: MailLang, inner: string, unsubscribe: string): string {
  const t = TEXT[lang];
  return wrap(`
    ${inner}
    <p style="margin: 24px 0 0; line-height: 1.6;">${t.questions} <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a></p>
    <p style="margin: 28px 0 0; line-height: 1.6;">${t.signoff}</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: #9A8F8C;">${t.why} <a href="${unsubscribe}" style="color: #9A8F8C;">${t.unsubscribe}</a></p>
  `);
}

export function upgradeEmail(opts: { name: string | null; heading: string | null; link: string; unsubscribe: string; lang: MailLang }): { subject: string; html: string } {
  const t = TEXT[opts.lang];
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  const heading = escHtml(plainHeading(opts.heading, t.yourEvent));
  const inner = `
    <h2 style="margin: 0 0 16px; font-size: 20px;">${t.upgradeHeading}</h2>
    <p style="${p}">${t.hi(escHtml((opts.name ?? '').trim()))}</p>
    <p style="${p}">${t.upgradeBody(heading)}</p>
    <ul style="margin: 0 0 16px; padding-left: 20px; line-height: 1.7;">${t.upgradeList.map((li) => `<li>${escHtml(li)}</li>`).join('')}</ul>
    <p style="${p}">${escHtml(t.upgradePrice)}</p>
    <div style="margin: 24px 0;">${button(opts.link, t.upgradeButton)}</div>
    <p style="${p}"><a href="${siteUrl()}${t.upgradePage}" style="color: #B6584A;">${escHtml(t.upgradeMore)} →</a></p>`;
  return { subject: t.upgradeSubject(plainHeading(opts.heading, t.yourEvent)), html: shell(opts.lang, inner, opts.unsubscribe) };
}

export function photosReadyEmail(opts: { name: string | null; heading: string | null; photos: number; link: string; unsubscribe: string; lang: MailLang }): { subject: string; html: string } {
  const t = TEXT[opts.lang];
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  const heading = escHtml(plainHeading(opts.heading, t.yourEvent));
  const inner = `
    <h2 style="margin: 0 0 16px; font-size: 20px;">${t.photosHeading}</h2>
    <p style="${p}">${t.hi(escHtml((opts.name ?? '').trim()))}</p>
    <p style="${p}">${t.photosBody(heading, opts.photos)}</p>
    <div style="margin: 24px 0;">${button(opts.link, t.photosButton)}</div>`;
  return { subject: t.photosSubject(plainHeading(opts.heading, t.yourEvent), opts.photos), html: shell(opts.lang, inner, opts.unsubscribe) };
}

// Marks the page; false when another run got there first.
async function claim(pageId: number, setting: string): Promise<boolean> {
  const r = await sql`
    INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
    SELECT ${pageId}, ${setting}, ${new Date().toISOString()}
    WHERE NOT EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${pageId} AND setting_name = ${setting})`;
  return !!r.rowCount;
}

// Free pages whose event is 12 to 14 days away (a missed run catches up).
export async function sendUpgradeEmails(): Promise<{ sent: number; failed: number }> {
  await ensureAdminEmailTables();
  const { rows } = await sql.query<Row>(`
    SELECT p.id AS page_id, p.heading, p.language, u.id AS user_id, u.email, u.given_name
    FROM user_page p JOIN users u ON u.id = p.user_id
    WHERE COALESCE(p.plan_type, 'free') <> 'paid'
      AND COALESCE(p.status, 'active') = 'active'
      AND p.event_date IS NOT NULL
      AND p.event_date::date BETWEEN CURRENT_DATE + 12 AND CURRENT_DATE + 14
      AND NOT EXISTS (SELECT 1 FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = $1)
      AND NOT EXISTS (SELECT 1 FROM user_email_opt_outs o WHERE o.user_id = u.id)
    LIMIT ${BATCH}`, [UPGRADE_SENT]);
  const site = siteUrl();
  let sent = 0, failed = 0;
  for (const row of rows) {
    if (!row.email || !(await claim(row.page_id, UPGRADE_SENT))) continue;
    try {
      await sendMail({ to: row.email, ...upgradeEmail({ name: row.given_name, heading: row.heading, link: `${site}/dashboard/pages/${row.page_id}`, unsubscribe: userUnsubscribeUrl(row.user_id), lang: mailLang(row.language) }) });
      sent++;
    } catch (error) {
      console.error('Failed to send upgrade email:', error);
      failed++;
    }
  }
  return { sent, failed };
}

// Pages whose event was 1 to 3 days ago and that have guest photos.
export async function sendPhotosReadyEmails(): Promise<{ sent: number; failed: number }> {
  await ensureAdminEmailTables();
  const { rows } = await sql.query<Row>(`
    SELECT p.id AS page_id, p.heading, p.language, u.id AS user_id, u.email, u.given_name,
           (SELECT COUNT(*)::int FROM guests_photos g WHERE g.user_page_id = p.id) AS photos
    FROM user_page p JOIN users u ON u.id = p.user_id
    WHERE COALESCE(p.status, 'active') = 'active'
      AND p.event_date IS NOT NULL
      AND p.event_date::date BETWEEN CURRENT_DATE - 3 AND CURRENT_DATE - 1
      AND EXISTS (SELECT 1 FROM guests_photos g WHERE g.user_page_id = p.id)
      AND NOT EXISTS (SELECT 1 FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = $1)
      AND NOT EXISTS (SELECT 1 FROM user_email_opt_outs o WHERE o.user_id = u.id)
    LIMIT ${BATCH}`, [PHOTOS_SENT]);
  const site = siteUrl();
  let sent = 0, failed = 0;
  for (const row of rows) {
    if (!row.email || !(await claim(row.page_id, PHOTOS_SENT))) continue;
    try {
      await sendMail({ to: row.email, ...photosReadyEmail({ name: row.given_name, heading: row.heading, photos: row.photos ?? 0, link: `${site}/dashboard/pages/${row.page_id}/guest-photos`, unsubscribe: userUnsubscribeUrl(row.user_id), lang: mailLang(row.language) }) });
      sent++;
    } catch (error) {
      console.error('Failed to send photos-ready email:', error);
      failed++;
    }
  }
  return { sent, failed };
}
