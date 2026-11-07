import { createHmac, timingSafeEqual } from 'crypto';
import { sql } from '@vercel/postgres';
import { sendMailBatch, wrap, button, escHtml, type MailMessage } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';
import { isSuperAdmin } from './admin';
import { PLAN_PRICE_PLUS_TAX } from './plans';
import type { AdminEmailAudience, AdminEmailButtonLink } from './admin-email-templates';

// The admin email sender (/admin/email): personal emails from MyGala to
// account holders — setup help, reminders, news. Every email carries an
// unsubscribe link; people who use it (user_email_opt_outs) are never
// emailed from here again. Each send is logged (admin_email_log) so nobody
// gets the same email twice by accident.
//
// To protect the sending reputation of mygala.ca (the same domain sends
// verification emails and guest invitations): unverified addresses are never
// emailed (they bounce more), and nobody is emailed from here more than once
// every ADMIN_EMAIL_COOLDOWN_DAYS.
export const ADMIN_EMAIL_COOLDOWN_DAYS = 7;

// Who the email is from. Set ADMIN_EMAIL_FROM to send from another address,
// e.g. a subdomain verified in Resend ("Carla from MyGala <carla@news.mygala.ca>")
// to keep these separate from invitation emails. Replies go to COMPANY.email.
function fromAddress(): string {
  return process.env.ADMIN_EMAIL_FROM?.trim() || 'MyGala <no-reply@mygala.ca>';
}

let tablesReady: Promise<unknown> | null = null;
export function ensureAdminEmailTables(): Promise<unknown> {
  tablesReady ??= Promise.all([
    sql`
      CREATE TABLE IF NOT EXISTS user_email_opt_outs (
        user_id UUID PRIMARY KEY,
        opted_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS admin_email_log (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        email TEXT NOT NULL,
        template TEXT NOT NULL,
        subject TEXT NOT NULL,
        sent_by TEXT,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
  ]).then(() => sql`CREATE INDEX IF NOT EXISTS admin_email_log_user_idx ON admin_email_log (user_id, sent_at DESC)`)
    .catch((error) => { tablesReady = null; throw error; });
  return tablesReady;
}

// ── Unsubscribe links ──────────────────────────────────────────────────────
// The "user-unsubscribe:" prefix keeps these signatures distinct from the
// guest and newsletter ones.
const SECRET = process.env.AUTH_SECRET ?? '';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function sign(userId: string): string {
  return createHmac('sha256', SECRET).update(`user-unsubscribe:${userId}`).digest('hex');
}

export function userUnsubscribeUrl(userId: string): string {
  return `${siteUrl()}/unsubscribe?u=${userId}&t=${sign(userId)}`;
}

function userOneClickUrl(userId: string): string {
  return `${siteUrl()}/api/unsubscribe?u=${userId}&t=${sign(userId)}`;
}

// The user id when the token is genuine, else null.
export function verifyUserUnsubscribe(userId: string | null, token: string | null): string | null {
  if (!userId || !token || !UUID_RE.test(userId) || !/^[0-9a-f]{64}$/i.test(token)) return null;
  const expected = Buffer.from(sign(userId), 'hex');
  const given = Buffer.from(token, 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given) ? userId : null;
}

export async function unsubscribeUser(userId: string): Promise<void> {
  await ensureAdminEmailTables();
  await sql`INSERT INTO user_email_opt_outs (user_id) VALUES (${userId}) ON CONFLICT (user_id) DO NOTHING`;
}

// The account's email for the confirmation screen, and whether it's still
// subscribed; null when the account no longer exists.
export async function userEmailPreference(userId: string): Promise<{ email: string; subscribed: boolean } | null> {
  await ensureAdminEmailTables();
  const res = await sql<{ email: string; opted_out: boolean }>`
    SELECT u.email, (o.user_id IS NOT NULL) AS opted_out
    FROM users u LEFT JOIN user_email_opt_outs o ON o.user_id = u.id
    WHERE u.id = ${userId}
  `;
  const row = res.rows[0];
  return row ? { email: row.email, subscribed: !row.opted_out } : null;
}

// ── Recipients ─────────────────────────────────────────────────────────────
export type AdminEmailPage = {
  id: number;
  heading: string;
  slug: string;
  status: string;
  plan_type: string;
  event_date: string | null; // YYYY-MM-DD
  guests: number;
};

export type AdminEmailCandidate = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  verified: boolean;
  joined: string | null;
  optedOut: boolean;
  pages: AdminEmailPage[]; // newest first
  lastSentAt: string | null; // any email from this sender
  sentTemplates: Record<string, string>; // template → last sent (ISO)
};

function firstNameOf(given: string | null, name: string | null): string {
  const g = (given ?? '').trim();
  if (g) return g;
  return (name ?? '').trim().split(/\s+/)[0] ?? '';
}

export async function fetchAdminEmailCandidates(): Promise<AdminEmailCandidate[]> {
  await ensureAdminEmailTables();
  const [users, pages, optOuts, log] = await Promise.all([
    sql<{ id: string; email: string; name: string | null; given_name: string | null; email_verified_at: string | null; date: string | null }>`
      SELECT id, email, name, given_name, email_verified_at, to_char(date, 'YYYY-MM-DD') AS date FROM users ORDER BY date DESC NULLS LAST, email
    `,
    sql<AdminEmailPage & { user_id: string }>`
      SELECT p.user_id, p.id, COALESCE(p.heading, '') AS heading, p.slug, COALESCE(p.status, 'active') AS status,
             COALESCE(p.plan_type, 'free') AS plan_type, to_char(p.event_date, 'YYYY-MM-DD') AS event_date,
             (SELECT count(*) FROM event_guests g WHERE g.user_page_id = p.id)::int AS guests
      FROM user_page p ORDER BY p.created_at DESC
    `,
    sql<{ user_id: string }>`SELECT user_id FROM user_email_opt_outs`,
    sql<{ user_id: string; template: string; sent_at: string }>`
      SELECT user_id, template, max(sent_at) AS sent_at FROM admin_email_log GROUP BY user_id, template
    `,
  ]);

  const optedOut = new Set(optOuts.rows.map((r) => r.user_id));
  const byUser = new Map<string, AdminEmailCandidate>();
  for (const u of users.rows) {
    if (isSuperAdmin(u.email)) continue; // test sends cover the admin's own inbox
    byUser.set(u.id, {
      id: u.id,
      email: u.email,
      name: (u.name ?? '').trim(),
      firstName: firstNameOf(u.given_name, u.name),
      verified: !!u.email_verified_at,
      joined: u.date,
      optedOut: optedOut.has(u.id),
      pages: [],
      lastSentAt: null,
      sentTemplates: {},
    });
  }
  for (const { user_id, ...p } of pages.rows) byUser.get(user_id)?.pages.push({ ...p, id: Number(p.id) });
  for (const l of log.rows) {
    const c = byUser.get(l.user_id);
    if (!c) continue;
    const at = new Date(l.sent_at).toISOString();
    c.sentTemplates[l.template] = at;
    if (!c.lastSentAt || at > c.lastSentAt) c.lastSentAt = at;
  }
  return [...byUser.values()];
}

function todayPlus(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// The page an audience is about for this person (the newest that fits), or
// undefined when they're not in it. null = in the audience, but no page.
export function audiencePage(c: AdminEmailCandidate, audience: AdminEmailAudience): AdminEmailPage | null | undefined {
  const live = (p: AdminEmailPage) => p.status === 'active';
  switch (audience) {
    case 'all':
      return c.pages[0] ?? null;
    case 'no_page':
      return c.pages.length ? undefined : null;
    case 'no_guests':
      return c.pages.find((p) => (live(p) || p.status === 'draft') && p.guests === 0);
    case 'draft':
      return c.pages.find((p) => p.status === 'draft');
    case 'free_with_guests':
      return c.pages.find((p) => live(p) && p.plan_type !== 'paid' && p.guests > 0);
    case 'upcoming': {
      const from = todayPlus(0);
      const to = todayPlus(30);
      return c.pages.find((p) => live(p) && p.plan_type !== 'paid' && !!p.event_date && p.event_date >= from && p.event_date <= to);
    }
  }
}

// Why this person can't be emailed right now, or null when they can.
export function blockedReason(c: AdminEmailCandidate): string | null {
  if (c.optedOut) return 'Unsubscribed';
  if (!c.verified) return 'Email not verified';
  if (c.lastSentAt && Date.now() - new Date(c.lastSentAt).getTime() < ADMIN_EMAIL_COOLDOWN_DAYS * 86_400_000) {
    return `Emailed in the last ${ADMIN_EMAIL_COOLDOWN_DAYS} days`;
  }
  return null;
}

// ── Rendering ──────────────────────────────────────────────────────────────
export type AdminEmailDraft = {
  template: string;
  subject: string;
  body: string;
  buttonLabel: string;
  buttonLink: AdminEmailButtonLink;
  signature: string;
};

function formatEventDate(ymd: string | null): string {
  if (!ymd) return 'your event date';
  const d = new Date(`${ymd}T12:00:00Z`);
  return d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(first_name|page_name|event_date|page_link|plus_price)\}/g, (_, k: string) => vars[k] ?? '');
}

// Escaped text with line breaks and clickable web addresses.
function textHtml(text: string): string {
  return escHtml(text)
    .replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)'"]/g, (url) => `<a href="${url}" style="color: #B6584A;">${url}</a>`)
    .replace(/\n/g, '<br />');
}

export function renderAdminEmail(draft: AdminEmailDraft, c: Pick<AdminEmailCandidate, 'id' | 'email' | 'firstName'>, page: AdminEmailPage | null) {
  const site = siteUrl();
  const vars: Record<string, string> = {
    first_name: c.firstName || 'there',
    page_name: page?.heading.trim() || 'your event page',
    event_date: formatEventDate(page?.event_date ?? null),
    page_link: page ? `${site}/${page.slug}` : site,
    plus_price: PLAN_PRICE_PLUS_TAX,
  };
  const subject = fill(draft.subject, vars).replace(/[\r\n]+/g, ' ').trim();
  const paragraphs = fill(draft.body, vars).trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const p = 'margin: 0 0 16px; line-height: 1.6;';

  const links: Record<Exclude<AdminEmailButtonLink, 'none'>, string> = {
    dashboard: page ? `${site}/dashboard/pages/${page.id}` : `${site}/dashboard`,
    page: vars.page_link,
    features: `${site}/features`,
  };
  const buttonHtml = draft.buttonLink !== 'none' && draft.buttonLabel.trim()
    ? `<div style="margin: 8px 0 24px;">${button(links[draft.buttonLink], escHtml(draft.buttonLabel.trim()))}</div>`
    : '';

  // The button sits before the sign-off when the text ends with one
  // ("Warm regards,"), so the email still closes with the signature.
  const last = paragraphs.at(-1) ?? '';
  const endsWithSignOff = paragraphs.length > 1 && /,$/.test(last) && last.length < 60;
  const main = endsWithSignOff ? paragraphs.slice(0, -1) : paragraphs;
  const signOff = endsWithSignOff ? `<p style="margin: 0; line-height: 1.6;">${textHtml(last)}</p>` : '';
  const signature = draft.signature.trim() ? `<p style="margin: ${signOff ? '4px' : '0'} 0 0; line-height: 1.6;">${textHtml(draft.signature.trim())}</p>` : '';

  const html = wrap(`
    ${main.map((t) => `<p style="${p}">${textHtml(t)}</p>`).join('\n')}
    ${buttonHtml}
    ${signOff}
    ${signature}
    <p style="margin: 32px 0 0; font-size: 13px; color: #9A8F8C; line-height: 1.6;">You’re receiving this because you have a MyGala account
    (${escHtml(c.email)}). Just reply to reach us at ${escHtml(COMPANY.email)}.
    <a href="${userUnsubscribeUrl(c.id)}" style="color: #9A8F8C;">Unsubscribe from these emails</a></p>
  `);
  return { subject, html };
}

function message(draft: AdminEmailDraft, c: AdminEmailCandidate, page: AdminEmailPage | null, to = c.email, subjectPrefix = ''): MailMessage {
  const { subject, html } = renderAdminEmail(draft, c, page);
  return {
    to,
    subject: `${subjectPrefix}${subject}`,
    html,
    from: fromAddress(),
    replyTo: COMPANY.email,
    headers: {
      'List-Unsubscribe': `<${userOneClickUrl(c.id)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

// A test copy to the admin, filled in with one person's details.
export async function sendAdminEmailTest(draft: AdminEmailDraft, c: AdminEmailCandidate, page: AdminEmailPage | null, adminEmail: string): Promise<void> {
  await sendMailBatch([message(draft, c, page, adminEmail, '[Test] ')]);
}

// Sends to everyone given who can be emailed (blockedReason), logs it, and
// says who got it and who was skipped.
export async function sendAdminEmail(
  draft: AdminEmailDraft,
  recipients: { candidate: AdminEmailCandidate; page: AdminEmailPage | null }[],
  sentBy: string,
): Promise<{ sent: number; skipped: { email: string; reason: string }[] }> {
  await ensureAdminEmailTables();
  const skipped: { email: string; reason: string }[] = [];
  const ok = recipients.filter(({ candidate }) => {
    const reason = blockedReason(candidate);
    if (reason) skipped.push({ email: candidate.email, reason });
    return !reason;
  });
  const messages = ok.map(({ candidate, page }) => message(draft, candidate, page));
  await sendMailBatch(messages);
  for (let i = 0; i < ok.length; i++) {
    const { candidate } = ok[i];
    await sql`
      INSERT INTO admin_email_log (user_id, email, template, subject, sent_by)
      VALUES (${candidate.id}, ${candidate.email}, ${draft.template}, ${messages[i].subject}, ${sentBy})
    `;
  }
  return { sent: ok.length, skipped };
}

export async function fetchAdminEmailLog(limit = 50) {
  await ensureAdminEmailTables();
  const res = await sql<{ id: number; email: string; template: string; subject: string; sent_at: string }>`
    SELECT id, email, template, subject, sent_at FROM admin_email_log ORDER BY sent_at DESC LIMIT ${limit}
  `;
  return res.rows.map((r) => ({ ...r, sent_at: new Date(r.sent_at).toISOString() }));
}
