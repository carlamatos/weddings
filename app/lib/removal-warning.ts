import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml, type MailLang } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';
import { createToken } from './tokens';
import { ensureVisitColumns } from './dashboard-visits';
import { ensureWarningColumn, UNCONFIRMED_WHERE } from './unconfirmed-core';
import { UNCONFIRMED_AFTER_DAYS, UNCONFIRMED_RECENT_DAYS, UNCONFIRMED_WARNING_DAYS } from './retention';

// "Your MyGala draft will be removed": one email, from the daily cron
// (app/api/cron/setup-reminders), to an account that never confirmed its
// email and never published, UNCONFIRMED_WARNING_DAYS days before an admin
// can move it to the trash from the Cleanup screen (app/lib/unconfirmed.ts).
// Its button confirms the email, which keeps the account. It's a notice about
// the account itself, so it also goes to accounts that unsubscribed.

const BATCH = 200;

type WarningRow = { id: string; email: string; given_name: string | null; headings: (string | null)[]; language: string | null };

const WARNING_TEXT = {
  en: {
    subject: 'Your MyGala draft will be removed soon',
    heading: 'Keep your MyGala draft?',
    hi: (name: string) => (name ? `Hi ${name},` : 'Hi there,'),
    body: (pages: string, date: string) => `You started ${pages} on MyGala but never confirmed your email address, so it was never published and guests haven’t seen it.
      To keep things tidy, we remove drafts like this — with the account — <strong>after ${date}</strong>.`,
    yourDraft: 'an event page',
    keep: 'Want to keep it? Confirm your email and everything stays as it is:',
    button: 'Confirm my email and keep it',
    account: {
      subject: 'Your MyGala account will be removed soon',
      heading: 'Keep your MyGala account?',
      body: (date: string) => `You created a MyGala account but never confirmed your email address or made an event page.
        To keep things tidy, we remove unused accounts like this <strong>after ${date}</strong>.`,
      keep: 'Want to keep it? Confirm your email and your account stays:',
      button: 'Confirm my email and keep it',
    },
    nothing: 'If you don’t need it any more, there’s nothing to do. And if you change your mind later, you can always sign up again.',
    questions: 'Questions? Write to us at',
    readEvery: '— we read every message.',
    signoff: 'The MyGala team',
    why: 'You’re receiving this one-time notice because a MyGala account was created with this email address.',
  },
  fr: {
    subject: 'Votre brouillon MyGala sera bientôt supprimé',
    heading: 'Garder votre brouillon MyGala ?',
    hi: (name: string) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    body: (pages: string, date: string) => `Vous avez commencé ${pages} sur MyGala, mais vous n’avez jamais confirmé votre adresse courriel : la page n’a donc jamais été publiée et vos invités ne l’ont pas vue.
      Pour garder les choses en ordre, nous supprimons ces brouillons — avec le compte — <strong>après le ${date}</strong>.`,
    yourDraft: 'une page d’événement',
    keep: 'Vous voulez la garder ? Confirmez votre adresse courriel et tout reste comme avant :',
    button: 'Confirmer mon adresse et la garder',
    account: {
      subject: 'Votre compte MyGala sera bientôt supprimé',
      heading: 'Garder votre compte MyGala ?',
      body: (date: string) => `Vous avez créé un compte MyGala, mais vous n’avez jamais confirmé votre adresse courriel ni créé de page d’événement.
        Pour garder les choses en ordre, nous supprimons ces comptes inutilisés <strong>après le ${date}</strong>.`,
      keep: 'Vous voulez le garder ? Confirmez votre adresse courriel et votre compte reste actif :',
      button: 'Confirmer mon adresse et le garder',
    },
    nothing: 'Si vous n’en avez plus besoin, vous n’avez rien à faire. Et si vous changez d’avis plus tard, vous pourrez toujours vous réinscrire.',
    questions: 'Des questions ? Écrivez-nous à',
    readEvery: '— nous lisons chaque message.',
    signoff: 'L’équipe MyGala',
    why: 'Vous recevez cet avis unique parce qu’un compte MyGala a été créé avec cette adresse courriel.',
  },
  es: {
    subject: 'Tu borrador de MyGala se eliminará pronto',
    heading: '¿Quieres conservar tu borrador de MyGala?',
    hi: (name: string) => (name ? `Hola, ${name}:` : 'Hola:'),
    body: (pages: string, date: string) => `Empezaste ${pages} en MyGala, pero nunca confirmaste tu correo, así que nunca se publicó y tus invitados no la han visto.
      Para mantener todo en orden, eliminamos estos borradores — junto con la cuenta — <strong>después del ${date}</strong>.`,
    yourDraft: 'una página de evento',
    keep: '¿Quieres conservarla? Confirma tu correo y todo queda como está:',
    button: 'Confirmar mi correo y conservarla',
    account: {
      subject: 'Tu cuenta de MyGala se eliminará pronto',
      heading: '¿Quieres conservar tu cuenta de MyGala?',
      body: (date: string) => `Creaste una cuenta de MyGala, pero nunca confirmaste tu correo ni creaste una página de evento.
        Para mantener todo en orden, eliminamos estas cuentas sin usar <strong>después del ${date}</strong>.`,
      keep: '¿Quieres conservarla? Confirma tu correo y tu cuenta se queda:',
      button: 'Confirmar mi correo y conservarla',
    },
    nothing: 'Si ya no la necesitas, no tienes que hacer nada. Y si cambias de idea más adelante, siempre puedes registrarte de nuevo.',
    questions: '¿Tienes preguntas? Escríbenos a',
    readEvery: '— leemos cada mensaje.',
    signoff: 'El equipo de MyGala',
    why: 'Recibes este aviso único porque se creó una cuenta de MyGala con este correo.',
  },
} satisfies Record<MailLang, unknown>;

const LOCALE: Record<MailLang, string> = { en: 'en-CA', fr: 'fr-CA', es: 'es' };

export function removalWarningEmail(opts: {
  name: string | null;
  headings: (string | null)[];
  link: string;
  removeAfter: Date;
  lang: MailLang;
}): { subject: string; html: string } {
  const t = WARNING_TEXT[opts.lang];
  const named = opts.headings.map((h) => (h ?? '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const pages = named.length ? named.map((h) => `<strong>${escHtml(h)}</strong>`).join(', ') : t.yourDraft;
  const date = opts.removeAfter.toLocaleDateString(LOCALE[opts.lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  // An account with no page at all gets the account wording.
  const k = opts.headings.length
    ? { subject: t.subject, heading: t.heading, body: t.body(pages, date), keep: t.keep, button: t.button }
    : { ...t.account, body: t.account.body(date) };
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  const html = wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">${k.heading}</h2>
    <p style="${p}">${t.hi(escHtml((opts.name ?? '').trim()))}</p>
    <p style="${p}">${k.body}</p>
    <p style="${p}">${k.keep}</p>
    <div style="margin: 24px 0;">${button(opts.link, k.button)}</div>
    <p style="${p}">${t.nothing}</p>
    <p style="margin: 24px 0 0; line-height: 1.6;">${t.questions}
    <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a> ${t.readEvery}</p>
    <p style="margin: 28px 0 0; line-height: 1.6;">${t.signoff}</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: #9A8F8C;">${t.why}</p>
  `);
  return { subject: k.subject, html };
}

const mailLang = (lang: string | null): MailLang => (lang === 'fr' || lang === 'es' ? lang : 'en');

// Sends the warning to every account due one: never confirmed, past
// UNCONFIRMED_AFTER_DAYS minus UNCONFIRMED_WARNING_DAYS since sign-up, not
// warned yet. Each account is marked first, so a failed or repeated run never
// sends it twice.
export async function sendRemovalWarnings(): Promise<{ sent: number; failed: number }> {
  await Promise.all([ensureWarningColumn(), ensureVisitColumns()]);
  const { rows } = await sql.query<WarningRow>(`
    SELECT u.id::text AS id, u.email, u.given_name,
           COALESCE((SELECT json_agg(heading ORDER BY id) FROM user_page WHERE user_id = u.id), '[]'::json) AS headings,
           (SELECT language FROM user_page WHERE user_id = u.id ORDER BY id LIMIT 1) AS language
    FROM users u
    WHERE ${UNCONFIRMED_WHERE}
      AND u.removal_warning_sent_at IS NULL
    ORDER BY u.date
    LIMIT ${BATCH}
  `, [UNCONFIRMED_AFTER_DAYS - UNCONFIRMED_WARNING_DAYS, UNCONFIRMED_RECENT_DAYS]);

  const site = siteUrl();
  const removeAfter = new Date(Date.now() + UNCONFIRMED_WARNING_DAYS * 86_400_000);
  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    const claimed = await sql`UPDATE users SET removal_warning_sent_at = NOW() WHERE id = ${row.id} AND removal_warning_sent_at IS NULL AND email_verified_at IS NULL`;
    if (!claimed.rowCount || !row.email) continue;
    const lang = mailLang(row.language);
    try {
      // The link works until the account can be removed.
      const token = await createToken('email_verification_tokens', row.id, UNCONFIRMED_WARNING_DAYS * 86_400_000);
      const link = `${site}/api/verify-email?token=${token}${lang === 'en' ? '' : `&lang=${lang}`}`;
      await sendMail({ to: row.email, ...removalWarningEmail({ name: row.given_name, headings: row.headings, link, removeAfter, lang }) });
      sent++;
    } catch (error) {
      console.error('Failed to send removal warning:', error);
      failed++;
    }
  }
  return { sent, failed };
}
