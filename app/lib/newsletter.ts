import { createHmac, timingSafeEqual } from 'crypto';
import { sql } from '@vercel/postgres';
import { sendMailBatch, wrap, button, escHtml } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';
import { PLAN_TERM_MONTHS } from './plans';

// The MyGala newsletter (sign-up form in the marketing site's footer). New
// subscribers get an email with a 10%-off code for Plus. The code itself is a
// Stripe promotion code — create it in the Stripe dashboard with exactly this
// name (Plus checkout already accepts promotion codes).
export const NEWSLETTER_DISCOUNT_CODE = 'GALA10';
export const NEWSLETTER_DISCOUNT_PERCENT = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NEWSLETTER_EMAIL_MAX = 254;

export function normalizeNewsletterEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  return email.length <= NEWSLETTER_EMAIL_MAX && EMAIL_RE.test(email) ? email : null;
}

// The table is created on first use, so a new environment needs no setup
// step (it's also in /api/db-setup).
let tableReady: Promise<unknown> | null = null;
export function ensureNewsletterTable(): Promise<unknown> {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      source TEXT,
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ
    )
  `.catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

// Adds (or re-subscribes) an address. True when the address is newly on the
// list, false when it was already subscribed.
export async function subscribeToNewsletter(email: string, source: string): Promise<boolean> {
  await ensureNewsletterTable();
  const existing = await sql`SELECT unsubscribed_at FROM newsletter_subscribers WHERE email = ${email}`;
  if (existing.rows[0] && !existing.rows[0].unsubscribed_at) return false;
  await sql`
    INSERT INTO newsletter_subscribers (email, source) VALUES (${email}, ${source})
    ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL, subscribed_at = NOW(), source = ${source}
  `;
  return true;
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  await ensureNewsletterTable();
  await sql`UPDATE newsletter_subscribers SET unsubscribed_at = NOW() WHERE email = ${email} AND unsubscribed_at IS NULL`;
}

export async function isNewsletterSubscriber(email: string): Promise<boolean> {
  await ensureNewsletterTable();
  const res = await sql`SELECT 1 FROM newsletter_subscribers WHERE email = ${email} AND unsubscribed_at IS NULL`;
  return !!res.rows[0];
}

// Signed unsubscribe links. The "newsletter-unsubscribe:" prefix keeps these
// signatures distinct from the guest ones (app/lib/unsubscribe-token.ts).
const SECRET = process.env.AUTH_SECRET ?? '';
function sign(email: string): string {
  return createHmac('sha256', SECRET).update(`newsletter-unsubscribe:${email}`).digest('hex');
}

export function newsletterUnsubscribeUrl(email: string): string {
  return `${siteUrl()}/unsubscribe?n=${encodeURIComponent(email)}&t=${sign(email)}`;
}

export function newsletterOneClickUrl(email: string): string {
  return `${siteUrl()}/api/unsubscribe?n=${encodeURIComponent(email)}&t=${sign(email)}`;
}

// The (normalized) email when the token is genuine, else null.
export function verifyNewsletterUnsubscribe(rawEmail: string | null, token: string | null): string | null {
  const email = normalizeNewsletterEmail(rawEmail);
  if (!email || !token || !/^[0-9a-f]{64}$/i.test(token)) return null;
  const expected = Buffer.from(sign(email), 'hex');
  const given = Buffer.from(token, 'hex');
  return expected.length === given.length && timingSafeEqual(expected, given) ? email : null;
}

export function newsletterWelcomeHtml(email: string): string {
  const site = siteUrl();
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Thanks for subscribing! Here’s ${NEWSLETTER_DISCOUNT_PERCENT}% off 🎁</h2>
    <p style="${p}">Hi there,</p>
    <p style="${p}">Welcome to the MyGala newsletter. Every now and then we’ll send you new themes, ideas for your event and the occasional
    offer — never spam.</p>
    <p style="${p}">As a thank-you, here’s <strong>${NEWSLETTER_DISCOUNT_PERCENT}% off MyGala Plus</strong> (${PLAN_TERM_MONTHS} months of invitations by email, text &amp; WhatsApp,
    guest photo uploads, reminders, a custom domain, a page password and more for one event page):</p>
    <div style="margin: 0 0 24px; padding: 18px; text-align: center; border: 2px dashed #B6584A; border-radius: 12px; background: #FBF5F3;">
      <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: #9A8F8C;">Your code</p>
      <p style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 3px; color: #241F2B;">${NEWSLETTER_DISCOUNT_CODE}</p>
    </div>
    <p style="${p}">Enter it on the payment page when you upgrade (click “Add promotion code”).</p>
    ${button(`${site}/dashboard`, 'Start your event page')}
    <p style="margin: 24px 0 0; line-height: 1.6;">Questions? Email us at <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a>
    or use our <a href="${site}/contact" style="color: #B6584A;">contact form</a>.</p>
    <p style="margin: 24px 0 0; font-size: 13px; color: #9A8F8C; line-height: 1.6;">You’re receiving this because ${escHtml(email)} signed up for
    the MyGala newsletter. <a href="${newsletterUnsubscribeUrl(email)}" style="color: #9A8F8C;">Unsubscribe</a></p>
  `);
}

export async function sendNewsletterWelcome(email: string): Promise<void> {
  await sendMailBatch([{
    to: email,
    subject: `Your ${NEWSLETTER_DISCOUNT_PERCENT}% off MyGala Plus code`,
    html: newsletterWelcomeHtml(email),
    headers: {
      'List-Unsubscribe': `<${newsletterOneClickUrl(email)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }]);
}
