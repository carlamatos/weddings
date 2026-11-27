import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml, type MailLang } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';
import { ensureAdminEmailTables, userUnsubscribeUrl } from './admin-email';
import { ensureVisitColumns } from './dashboard-visits';
import { ensurePageViewsTable } from './page-views';
import { ensureInviteColumns } from './invite-tracking';
import { FOLLOW_UP_SETTING } from './setup-reminder';
import { en } from './dash-text/en';
import { fr } from './dash-text/fr';
import { es } from './dash-text/es';
import { fill } from './dash-text/fill';
import { publicPageUrl } from './share';

// "No one has opened your page yet" (daily cron, app/api/cron/setup-reminders):
// one email to the host of a page that has been live for 2 to 7 days without
// reaching anyone. No guest has opened it, no invitation or save-the-date
// went out, nobody RSVPed or joined its Secret Santa. The button opens
// WhatsApp with the invitation message and the page's link ready to send.
//
// Only pages made after guest visits were counted (COUNTED_PAGES_FROM), whose
// event hasn't passed, and only while the host hasn't been in the dashboard
// for 12 hours (someone still working on the page doesn't need a nudge).
// Never within a day of the page's other follow-up email (FOLLOW_UP_SETTING),
// never to accounts that unsubscribed, never twice for a page
// (NOT_OPENED_SETTING), and one per account per run.

export const NOT_OPENED_SETTING = 'not_opened_email_sent_at';
// Guest visits started being counted around noon Pacific on VISITS_COUNTED_FROM
// (2026-11-25); a page made before then may have had visitors nobody counted.
// A UTC time, like user_page.created_at.
const COUNTED_PAGES_FROM = '2026-11-26 00:00:00';
const BATCH = 200;

export type NotOpenedRow = {
  page_id: number; heading: string | null; slug: string; language: string | null;
  plan_type: string | null; custom_domain: string | null; domain_status: string | null;
  user_id: string; email: string; given_name: string | null; locked: boolean;
};

// The pages due the email (read only: nothing is marked here).
export async function findNotOpenedPages(): Promise<NotOpenedRow[]> {
  await Promise.all([ensureAdminEmailTables(), ensureVisitColumns(), ensurePageViewsTable(), ensureInviteColumns()]);
  // The Secret Santa table is made by /api/migrate; a new environment may not have it yet.
  const gift = await sql<{ t: string | null }>`SELECT to_regclass('page_gift_exchange')::text AS t`;
  const noSantaJoins = gift.rows[0]?.t
    ? 'AND NOT EXISTS (SELECT 1 FROM page_gift_exchange x WHERE x.user_page_id = p.id)'
    : '';
  // user_page.created_at and user_page_settings.updated_at are UTC times
  // without a zone; status_changed_at (set when a draft is published) has one.
  const { rows } = await sql.query<NotOpenedRow & { live_since: Date }>(`
    SELECT * FROM (
      SELECT p.id AS page_id, p.heading, p.slug, p.language, p.plan_type, p.custom_domain, p.domain_status,
             u.id AS user_id, u.email, u.given_name,
             EXISTS (SELECT 1 FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = 'page_password_enc') AS locked,
             GREATEST(p.created_at AT TIME ZONE 'UTC', COALESCE(p.status_changed_at, p.created_at AT TIME ZONE 'UTC')) AS live_since
      FROM user_page p JOIN users u ON u.id = p.user_id
      WHERE COALESCE(p.status, 'active') = 'active'
        AND u.email_verified_at IS NOT NULL
        AND p.created_at >= $1::timestamp
        AND (p.event_date IS NULL OR p.event_date >= CURRENT_DATE)
        AND (u.last_dashboard_at IS NULL OR u.last_dashboard_at < NOW() - interval '12 hours')
        AND NOT EXISTS (SELECT 1 FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = $2)
        AND NOT EXISTS (
          SELECT 1 FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = $3
            AND s.updated_at > (NOW() AT TIME ZONE 'UTC') - interval '24 hours'
        )
        AND NOT EXISTS (SELECT 1 FROM user_email_opt_outs o WHERE o.user_id = u.id)
        AND NOT EXISTS (SELECT 1 FROM page_view_days v WHERE v.user_page_id = p.id AND (v.visitors > 0 OR COALESCE(v.people, 0) > 0))
        AND NOT EXISTS (
          SELECT 1 FROM event_guests g WHERE g.user_page_id = p.id
            AND (g.responded_at IS NOT NULL OR g.invited_at IS NOT NULL OR g.texted_at IS NOT NULL OR g.save_the_date_at IS NOT NULL)
        )
        ${noSantaJoins}
    ) due
    WHERE live_since <= NOW() - interval '48 hours' AND live_since >= NOW() - interval '7 days'
    ORDER BY live_since DESC
    LIMIT ${BATCH}
  `, [COUNTED_PAGES_FROM, NOT_OPENED_SETTING, FOLLOW_UP_SETTING]);
  return rows;
}

const TEXT = {
  en: {
    hi: (name: string) => (name ? `Hi ${name},` : 'Hi there,'),
    yourEvent: 'your event',
    subject: (h: string) => `Share ${h} in 10 seconds`,
    heading: 'Your page hasn’t been opened yet',
    body: (h: string) => `<strong>${h}</strong> is online, but none of your guests have opened it yet. The quickest way to get it to them takes about 10 seconds: send the link on WhatsApp.`,
    button: 'Share on WhatsApp',
    linkLabel: 'Or copy your link:',
    tip: 'Tip: paste it into your family or friends’ group chat. Guests open your page, see every detail and RSVP right there, and their replies appear in your guest list.',
    more: 'More ways to share: email, text, QR code or invitations',
    // A password-protected page: the link alone isn't enough, so no WhatsApp button.
    lockedBody: (h: string) => `<strong>${h}</strong> is online, but none of your guests have opened it yet. Your page is password protected, so send your guests the link together with its password.`,
    lockedButton: 'Share my page',
    questions: 'Questions, or stuck on something? Write to us at',
    readEvery: '— we read every message.',
    signoff: 'Happy planning,<br />The MyGala team',
    why: 'You’re receiving this one-time email because you created an event page on MyGala.',
    unsubscribe: 'Unsubscribe',
  },
  fr: {
    hi: (name: string) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    yourEvent: 'votre événement',
    subject: (h: string) => `Partagez ${h} en 10 secondes`,
    heading: 'Votre page n’a pas encore été ouverte',
    body: (h: string) => `<strong>${h}</strong> est en ligne, mais aucun de vos invités ne l’a encore ouverte. Le moyen le plus rapide de la leur faire parvenir prend environ 10 secondes : envoyez le lien sur WhatsApp.`,
    button: 'Partager sur WhatsApp',
    linkLabel: 'Ou copiez votre lien :',
    tip: 'Astuce : collez-le dans la conversation de groupe de votre famille ou de vos amis. Vos invités ouvrent votre page, voient tous les détails et répondent directement, et leurs réponses s’ajoutent à votre liste d’invités.',
    more: 'Autres façons de partager : courriel, texto, code QR ou invitations',
    lockedBody: (h: string) => `<strong>${h}</strong> est en ligne, mais aucun de vos invités ne l’a encore ouverte. Votre page est protégée par un mot de passe : envoyez à vos invités le lien avec son mot de passe.`,
    lockedButton: 'Partager ma page',
    questions: 'Des questions ou un blocage ? Écrivez-nous à',
    readEvery: '— nous lisons chaque message.',
    signoff: 'Bonne organisation,<br />L’équipe MyGala',
    why: 'Vous recevez ce courriel unique parce que vous avez créé une page d’événement sur MyGala.',
    unsubscribe: 'Se désabonner',
  },
  es: {
    hi: (name: string) => (name ? `Hola, ${name}:` : 'Hola:'),
    yourEvent: 'tu evento',
    subject: (h: string) => `Comparte ${h} en 10 segundos`,
    heading: 'Nadie ha abierto tu página todavía',
    body: (h: string) => `<strong>${h}</strong> ya está en línea, pero ninguno de tus invitados la ha abierto todavía. La forma más rápida de hacérsela llegar toma unos 10 segundos: envía el enlace por WhatsApp.`,
    button: 'Compartir por WhatsApp',
    linkLabel: 'O copia tu enlace:',
    tip: 'Consejo: pégalo en el grupo de chat de tu familia o de tus amigos. Tus invitados abren tu página, ven todos los detalles y confirman ahí mismo, y sus respuestas aparecen en tu lista de invitados.',
    more: 'Más formas de compartir: correo, mensaje de texto, código QR o invitaciones',
    lockedBody: (h: string) => `<strong>${h}</strong> ya está en línea, pero ninguno de tus invitados la ha abierto todavía. Tu página está protegida con contraseña: envía a tus invitados el enlace junto con su contraseña.`,
    lockedButton: 'Compartir mi página',
    questions: '¿Tienes preguntas o te atascaste? Escríbenos a',
    readEvery: '— leemos cada mensaje.',
    signoff: '¡Feliz organización!<br />El equipo de MyGala',
    why: 'Recibes este correo único porque creaste una página de evento en MyGala.',
    unsubscribe: 'Darte de baja',
  },
} satisfies Record<MailLang, unknown>;

// The invitation message the dashboard's share buttons send, in the page's language.
const INVITE_MESSAGE: Record<MailLang, string> = {
  en: en.quickShare.inviteMessage,
  fr: fr.quickShare.inviteMessage,
  es: es.quickShare.inviteMessage,
};

export function notOpenedEmail(opts: {
  name: string | null; heading: string | null; pageUrl: string; shareLink: string; unsubscribe: string; lang: MailLang; locked?: boolean;
}): { subject: string; html: string } {
  const t = TEXT[opts.lang];
  const plain = (opts.heading ?? '').replace(/\s+/g, ' ').trim() || t.yourEvent;
  const heading = escHtml(plain);
  const name = escHtml((opts.name ?? '').trim());
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(fill(INVITE_MESSAGE[opts.lang], { title: plain, url: opts.pageUrl }))}`;
  const html = wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">${t.heading}</h2>
    <p style="${p}">${t.hi(name)}</p>
    <p style="${p}">${opts.locked ? t.lockedBody(heading) : t.body(heading)}</p>
    <div style="margin: 24px 0;">${opts.locked ? button(escHtml(opts.shareLink), t.lockedButton) : button(escHtml(whatsapp), t.button)}</div>
    ${opts.locked ? '' : `<p style="margin: 0 0 6px; line-height: 1.6;">${t.linkLabel}</p>
    <p style="margin: 0 0 16px; padding: 10px 14px; background: #F6F1EE; border-radius: 8px; font-size: 15px; word-break: break-all;"><a href="${escHtml(opts.pageUrl)}" style="color: #241F2B;">${escHtml(opts.pageUrl)}</a></p>`}
    <p style="${p}">${t.tip}</p>
    <p style="${p}"><a href="${escHtml(opts.shareLink)}" style="color: #B6584A;">${t.more} →</a></p>
    <p style="margin: 24px 0 0; line-height: 1.6;">${t.questions}
    <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a> ${t.readEvery}</p>
    <p style="margin: 28px 0 0; line-height: 1.6;">${t.signoff}</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: #9A8F8C;">${t.why} <a href="${opts.unsubscribe}" style="color: #9A8F8C;">${t.unsubscribe}</a></p>
  `);
  return { subject: t.subject(plain), html };
}

const mailLang = (lang: string | null): MailLang => (lang === 'fr' || lang === 'es' ? lang : 'en');

export async function sendNotOpenedEmails(): Promise<{ sent: number; failed: number; skipped: number }> {
  // A failed lookup mustn't stop the cron's other emails.
  let rows: NotOpenedRow[];
  try { rows = await findNotOpenedPages(); } catch (error) {
    console.error('Failed to find pages no one has opened:', error);
    return { sent: 0, failed: 1, skipped: 0 };
  }
  const site = siteUrl();
  const emailed = new Set<string>(); // one per account per run (its newest page)
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (const row of rows) {
    if (!row.email || emailed.has(row.user_id)) { skipped++; continue; }
    // Claimed first, so a failed or repeated run never sends it twice.
    const claimed = await sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      SELECT ${row.page_id}, ${NOT_OPENED_SETTING}, ${new Date().toISOString()}
      WHERE NOT EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${row.page_id} AND setting_name = ${NOT_OPENED_SETTING})
    `;
    if (!claimed.rowCount) continue;
    emailed.add(row.user_id);
    try {
      await sendMail({
        to: row.email,
        ...notOpenedEmail({
          name: row.given_name, heading: row.heading, lang: mailLang(row.language), locked: row.locked,
          // The address guests use: MyGala's, or the page's own domain (Live Party).
          pageUrl: publicPageUrl({ slug: row.slug, plan_type: row.plan_type ?? 'free', custom_domain: row.custom_domain ?? undefined, domain_status: row.domain_status ?? undefined }),
          shareLink: `${site}/dashboard/pages/${row.page_id}/invitations`,
          unsubscribe: userUnsubscribeUrl(row.user_id),
        }),
      });
      sent++;
    } catch (error) {
      console.error('Failed to send not-opened email:', error);
      failed++;
    }
  }
  return { sent, failed, skipped };
}
