import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml, type MailLang } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';
import { createToken } from './tokens';
import { ensureAdminEmailTables, userUnsubscribeUrl } from './admin-email';
import { ensureVisitColumns } from './dashboard-visits';
import { LINK_SHARED_SETTING } from './setup-progress';

// Follow-up emails from the daily cron (app/api/cron/setup-reminders):
//  1. sendSetupReminders — no event page yet (below).
//  2. sendPageFollowUps — a page made a day or more ago whose host stopped
//     before guests could see it or reply: confirm the email (an unconfirmed
//     account's page stays a draft), publish it, or share it.
// Neither goes to accounts that unsubscribed from MyGala's emails.

// "Your event page is one step away": one email to an account that signed
// up a day or so ago and hasn't made an event page yet, with a link back to
// the create form. Sent once per account (users.setup_reminder_sent_at) by
// the daily cron (app/api/cron/setup-reminders). Only accounts from the
// last few days qualify, so older accounts never get it. The wording says
// "event page", not "wedding page": the account may be for any event.

const LOOKBACK_DAYS = 3; // signed up 1 to 3 days ago (users.date is a day)
const BATCH = 200;

type ReminderUser = { id: string; email: string; given_name: string | null };

// Added on first use, so a new environment needs no setup step (it's also
// in /api/migrate).
let columnReady: Promise<unknown> | null = null;
function ensureReminderColumn(): Promise<unknown> {
  columnReady ??= sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS setup_reminder_sent_at TIMESTAMPTZ`
    .catch((error) => { columnReady = null; throw error; });
  return columnReady;
}

export function setupReminderHtml(user: { given_name: string | null }, unsubscribe?: string): string {
  const site = siteUrl();
  const name = (user.given_name ?? '').trim();
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Your event page is one step away</h2>
    <p style="${p}">${name ? `Hi ${escHtml(name)},` : 'Hi there,'}</p>
    <p style="${p}">Thanks for creating your MyGala account! You haven’t made your event page yet — and it only takes a minute.</p>
    <p style="${p}">Just give your event a name. Your page is ready straight away, in a design picked for you that you can change any time.
    No date yet? That’s fine — you can add it later, with the place and everything else.</p>
    <div style="margin: 24px 0;">${button(`${site}/dashboard/setup`, 'Create my event page')}</div>
    <p style="${p}">Once it’s made you can add your details, collect RSVPs and share it with your guests by link, QR code or invitation.</p>
    <p style="margin: 24px 0 0; line-height: 1.6;">Questions? Write to us at
    <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a> — we read every message.</p>
    <p style="margin: 28px 0 0; line-height: 1.6;">Happy planning,<br />The MyGala team</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: #9A8F8C;">You’re receiving this one-time email because you created a MyGala account.${unsubscribe ? ` <a href="${unsubscribe}" style="color: #9A8F8C;">Unsubscribe</a>` : ''}</p>
  `);
}

// Sends the email to every account due one. Each account is marked first, so
// a failed or repeated run never sends it twice.
export async function sendSetupReminders(): Promise<{ sent: number; failed: number }> {
  await Promise.all([ensureReminderColumn(), ensureAdminEmailTables()]);
  const { rows } = await sql<ReminderUser>`
    SELECT u.id, u.email, u.given_name FROM users u
    WHERE u.setup_reminder_sent_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM user_email_opt_outs o WHERE o.user_id = u.id)
      AND u.date >= CURRENT_DATE - ${LOOKBACK_DAYS}::int AND u.date < CURRENT_DATE
      AND NOT EXISTS (SELECT 1 FROM user_page p WHERE p.user_id = u.id)
    ORDER BY u.date
    LIMIT ${BATCH}
  `;
  let sent = 0;
  let failed = 0;
  for (const user of rows) {
    const claimed = await sql`UPDATE users SET setup_reminder_sent_at = NOW() WHERE id = ${user.id} AND setup_reminder_sent_at IS NULL`;
    if (!claimed.rowCount || !user.email) continue;
    try {
      await sendMail({ to: user.email, subject: 'Your event page is one step away', html: setupReminderHtml(user, userUnsubscribeUrl(user.id)) });
      sent++;
    } catch (error) {
      console.error('Failed to send setup reminder:', error);
      failed++;
    }
  }
  return { sent, failed };
}

// ── Page follow-ups ─────────────────────────────────────────────────────────

// Pages made 20 hours to 4 days ago qualify (older pages never get one), and
// only while the host hasn't been in the dashboard for 12 hours: someone
// still working on their page doesn't need a nudge. One per page, remembered
// in user_page_settings (FOLLOW_UP_SETTING).
export const FOLLOW_UP_SETTING = 'follow_up_email_sent_at';
const MIN_AGE = '20 hours';
const MAX_AGE = '4 days';
const QUIET_FOR = '12 hours';
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;

export type FollowUpKind = 'confirm' | 'publish' | 'share';

type FollowUpRow = {
  page_id: number; heading: string | null; slug: string; status: string; language: string | null;
  user_id: string; email: string; given_name: string | null; verified: boolean; has_guests: boolean; shared: boolean;
};

// What the host still has to do, or null when the page is on its way.
export function followUpKind(row: Pick<FollowUpRow, 'status' | 'verified' | 'has_guests' | 'shared'>): FollowUpKind | null {
  if (row.status === 'draft') return row.verified ? 'publish' : 'confirm';
  if (row.status === 'active' && !row.has_guests && !row.shared) return 'share';
  return null;
}

const FOLLOW_UP_TEXT = {
  en: {
    hi: (name: string) => (name ? `Hi ${name},` : 'Hi there,'),
    yourEvent: 'your event',
    confirm: {
      subject: (h: string) => `One click to publish ${h}`,
      heading: 'Your page is almost ready to share',
      body: (h: string) => `Thanks for making <strong>${h}</strong> on MyGala! Right now it’s a <strong>draft</strong>, so guests who open its link can’t see it yet.
        To publish it, please confirm your email address — it’s how we know where to send you your guests’ RSVPs.`,
      button: 'Confirm my email',
      after: 'Then open your dashboard and choose <strong>Publish</strong>. This link works for 48 hours; after that, sign in and use “Resend email” in your dashboard.',
    },
    publish: {
      subject: (h: string) => `${h} is still a draft`,
      heading: 'Your page is still a draft',
      body: (h: string) => `Thanks for making <strong>${h}</strong> on MyGala! It’s still a <strong>draft</strong>, so guests who open its link can’t see it yet.
        When you’re happy with it, one click on <strong>Publish</strong> puts it online — you can keep changing it afterwards.`,
      button: 'Open my page',
      after: '',
    },
    share: {
      subject: (h: string) => `Ready to invite your guests to ${h}?`,
      heading: 'Your page is ready for your guests',
      body: (h: string) => `<strong>${h}</strong> is online! The next step is getting it to your guests. Send the link in a group chat or by email, show the QR code,
        or send personal invitations — everyone who RSVPs is added to your guest list automatically, so there’s nothing to type in.`,
      button: 'Invite my guests',
      after: 'You’ll get an email each time someone replies.',
    },
    questions: 'Questions, or stuck on something? Write to us at',
    readEvery: '— we read every message.',
    signoff: 'Happy planning,<br />The MyGala team',
    why: 'You’re receiving this one-time email because you created an event page on MyGala.',
    unsubscribe: 'Unsubscribe',
  },
  fr: {
    hi: (name: string) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    yourEvent: 'votre événement',
    confirm: {
      subject: (h: string) => `Un clic pour publier ${h}`,
      heading: 'Votre page est presque prête',
      body: (h: string) => `Merci d’avoir créé <strong>${h}</strong> sur MyGala ! Pour l’instant, c’est un <strong>brouillon</strong> : les invités qui ouvrent le lien ne peuvent pas encore la voir.
        Pour la publier, confirmez votre adresse courriel — c’est là que nous vous enverrons les réponses de vos invités.`,
      button: 'Confirmer mon adresse',
      after: 'Ouvrez ensuite votre tableau de bord et choisissez <strong>Publier</strong>. Ce lien fonctionne 48 heures; ensuite, connectez-vous et utilisez « Renvoyer le courriel » dans votre tableau de bord.',
    },
    publish: {
      subject: (h: string) => `${h} est encore un brouillon`,
      heading: 'Votre page est encore un brouillon',
      body: (h: string) => `Merci d’avoir créé <strong>${h}</strong> sur MyGala ! C’est encore un <strong>brouillon</strong> : les invités qui ouvrent le lien ne peuvent pas encore la voir.
        Quand elle vous plaît, un clic sur <strong>Publier</strong> la met en ligne — vous pourrez toujours la modifier ensuite.`,
      button: 'Ouvrir ma page',
      after: '',
    },
    share: {
      subject: (h: string) => `Prêt à inviter vos invités à ${h} ?`,
      heading: 'Votre page est prête pour vos invités',
      body: (h: string) => `<strong>${h}</strong> est en ligne ! La prochaine étape : la faire connaître à vos invités. Envoyez le lien dans une conversation de groupe ou par courriel, montrez le code QR
        ou envoyez des invitations personnelles — chaque personne qui répond est ajoutée automatiquement à votre liste d’invités, rien à saisir.`,
      button: 'Inviter mes invités',
      after: 'Vous recevrez un courriel à chaque réponse.',
    },
    questions: 'Des questions ou un blocage ? Écrivez-nous à',
    readEvery: '— nous lisons chaque message.',
    signoff: 'Bonne organisation,<br />L’équipe MyGala',
    why: 'Vous recevez ce courriel unique parce que vous avez créé une page d’événement sur MyGala.',
    unsubscribe: 'Se désabonner',
  },
  es: {
    hi: (name: string) => (name ? `Hola, ${name}:` : 'Hola:'),
    yourEvent: 'tu evento',
    confirm: {
      subject: (h: string) => `Un clic para publicar ${h}`,
      heading: 'Tu página está casi lista',
      body: (h: string) => `¡Gracias por crear <strong>${h}</strong> en MyGala! Por ahora es un <strong>borrador</strong>, así que los invitados que abran el enlace todavía no pueden verla.
        Para publicarla, confirma tu correo electrónico — ahí te enviaremos las respuestas de tus invitados.`,
      button: 'Confirmar mi correo',
      after: 'Después abre tu panel y elige <strong>Publicar</strong>. Este enlace funciona durante 48 horas; después, inicia sesión y usa «Reenviar correo» en tu panel.',
    },
    publish: {
      subject: (h: string) => `${h} sigue siendo un borrador`,
      heading: 'Tu página sigue siendo un borrador',
      body: (h: string) => `¡Gracias por crear <strong>${h}</strong> en MyGala! Todavía es un <strong>borrador</strong>, así que los invitados que abran el enlace no pueden verla.
        Cuando te guste cómo quedó, un clic en <strong>Publicar</strong> la pone en línea — puedes seguir cambiándola después.`,
      button: 'Abrir mi página',
      after: '',
    },
    share: {
      subject: (h: string) => `¿Listo para invitar a tus invitados a ${h}?`,
      heading: 'Tu página está lista para tus invitados',
      body: (h: string) => `¡<strong>${h}</strong> ya está en línea! El siguiente paso es hacerla llegar a tus invitados. Envía el enlace por un grupo de chat o por correo, muestra el código QR
        o envía invitaciones personales — cada persona que confirma se añade sola a tu lista de invitados, no tienes que escribir nada.`,
      button: 'Invitar a mis invitados',
      after: 'Recibirás un correo cada vez que alguien responda.',
    },
    questions: '¿Tienes preguntas o te atascaste? Escríbenos a',
    readEvery: '— leemos cada mensaje.',
    signoff: '¡Feliz organización!<br />El equipo de MyGala',
    why: 'Recibes este correo único porque creaste una página de evento en MyGala.',
    unsubscribe: 'Darte de baja',
  },
} satisfies Record<MailLang, unknown>;

export function followUpEmail(
  kind: FollowUpKind,
  opts: { name: string | null; heading: string | null; link: string; unsubscribe: string; lang: MailLang },
): { subject: string; html: string } {
  const t = FOLLOW_UP_TEXT[opts.lang];
  const k = t[kind];
  const heading = escHtml((opts.heading ?? '').replace(/\s+/g, ' ').trim() || t.yourEvent);
  const name = escHtml((opts.name ?? '').trim());
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  const html = wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">${k.heading}</h2>
    <p style="${p}">${t.hi(name)}</p>
    <p style="${p}">${k.body(heading)}</p>
    <div style="margin: 24px 0;">${button(opts.link, k.button)}</div>
    ${k.after ? `<p style="${p}">${k.after}</p>` : ''}
    <p style="margin: 24px 0 0; line-height: 1.6;">${t.questions}
    <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a> ${t.readEvery}</p>
    <p style="margin: 28px 0 0; line-height: 1.6;">${t.signoff}</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: #9A8F8C;">${t.why} <a href="${opts.unsubscribe}" style="color: #9A8F8C;">${t.unsubscribe}</a></p>
  `);
  // Subjects are plain text: the event's name as typed, on one line.
  const plain = (opts.heading ?? '').replace(/\s+/g, ' ').trim() || t.yourEvent;
  return { subject: k.subject(plain), html };
}

function mailLang(lang: string | null): MailLang {
  return lang === 'fr' || lang === 'es' ? lang : 'en';
}

export async function sendPageFollowUps(): Promise<{ sent: number; failed: number; skipped: number }> {
  await Promise.all([ensureAdminEmailTables(), ensureVisitColumns()]);
  // user_page.created_at is a UTC time without a zone.
  const { rows } = await sql.query<FollowUpRow>(`
    SELECT p.id AS page_id, p.heading, p.slug, COALESCE(p.status, 'active') AS status, p.language,
           u.id AS user_id, u.email, u.given_name, (u.email_verified_at IS NOT NULL) AS verified,
           EXISTS (SELECT 1 FROM event_guests g WHERE g.user_page_id = p.id) AS has_guests,
           EXISTS (SELECT 1 FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = $1) AS shared
    FROM user_page p JOIN users u ON u.id = p.user_id
    WHERE p.created_at <= (NOW() AT TIME ZONE 'UTC') - interval '${MIN_AGE}'
      AND p.created_at >= (NOW() AT TIME ZONE 'UTC') - interval '${MAX_AGE}'
      AND NOT EXISTS (SELECT 1 FROM user_page_settings s WHERE s.user_page_id = p.id AND s.setting_name = $2)
      AND NOT EXISTS (SELECT 1 FROM user_email_opt_outs o WHERE o.user_id = u.id)
      AND (u.last_dashboard_at IS NULL OR u.last_dashboard_at < NOW() - interval '${QUIET_FOR}')
    ORDER BY p.created_at DESC
    LIMIT ${BATCH}
  `, [LINK_SHARED_SETTING, FOLLOW_UP_SETTING]);

  const site = siteUrl();
  const emailed = new Set<string>(); // one per account per run (its newest page)
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (const row of rows) {
    const kind = followUpKind(row);
    if (!kind || !row.email || emailed.has(row.user_id)) { skipped++; continue; }
    // Claimed first, so a failed or repeated run never sends it twice.
    const claimed = await sql`
      INSERT INTO user_page_settings (user_page_id, setting_name, setting_value)
      SELECT ${row.page_id}, ${FOLLOW_UP_SETTING}, ${`${kind} ${new Date().toISOString()}`}
      WHERE NOT EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${row.page_id} AND setting_name = ${FOLLOW_UP_SETTING})
    `;
    if (!claimed.rowCount) continue;
    emailed.add(row.user_id);
    const lang = mailLang(row.language);
    try {
      let link = `${site}/dashboard/pages/${row.page_id}${kind === 'share' ? '/invitations' : ''}`;
      if (kind === 'confirm') {
        const token = await createToken('email_verification_tokens', row.user_id, VERIFY_TTL_MS);
        link = `${site}/api/verify-email?token=${token}${lang === 'en' ? '' : `&lang=${lang}`}`;
      }
      await sendMail({
        to: row.email,
        ...followUpEmail(kind, { name: row.given_name, heading: row.heading, link, unsubscribe: userUnsubscribeUrl(row.user_id), lang }),
      });
      sent++;
    } catch (error) {
      console.error('Failed to send page follow-up:', error);
      failed++;
    }
  }
  return { sent, failed, skipped };
}
