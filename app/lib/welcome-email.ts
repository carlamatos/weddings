import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml } from './mail';
import { siteUrl } from './site-url';
import { COMPANY } from './company';

// The welcome email a new account holder receives once their email address
// is confirmed: on verification for email sign-ups, at once for Google /
// Apple / Facebook sign-ups (already verified by the provider). Personalized
// with their first name, how they signed up and, when they already have an
// event page, that page.

const PROVIDER_NAMES: Record<string, string> = { google: 'Google', apple: 'Apple', facebook: 'Facebook' };

type WelcomeUser = { email: string; given_name: string | null; provider: string | null };
type FirstPage = { id: number; heading: string | null; slug: string };

export function welcomeEmailHtml(user: WelcomeUser, page: FirstPage | null): string {
  const site = siteUrl();
  const name = (user.given_name ?? '').trim();
  const provider = PROVIDER_NAMES[(user.provider ?? '').toLowerCase()];
  const muted = '#9A8F8C';
  const p = 'margin: 0 0 16px; line-height: 1.6;';

  const signedUpWith = provider
    ? `You signed up with your ${provider} account (${escHtml(user.email)}), so next time just choose “Continue with ${provider}” to sign in.`
    : `You’ll sign in with <strong>${escHtml(user.email)}</strong> and the password you chose.`;

  const nextStep = page
    ? `
      <p style="${p}">Your event page <strong>${escHtml(page.heading || 'your event')}</strong> is already started — it lives at
      <a href="${site}/${escHtml(page.slug)}" style="color: #B6584A;">${escHtml(site.replace(/^https?:\/\//, ''))}/${escHtml(page.slug)}</a>.
      Here’s what to do next:</p>
      <ol style="margin: 0 0 24px; padding-left: 20px; line-height: 1.7;">
        <li><strong>Add your details</strong> — the date, the place, your story and a photo for the top banner.</li>
        <li><strong>Turn on RSVP</strong> so guests can reply right on your page.</li>
        <li><strong>Share it</strong> with a link, a QR code or invitations.</li>
      </ol>
      ${button(`${site}/dashboard/pages/${page.id}`, 'Continue editing your page')}`
    : `
      <p style="${p}">Setting up your event page takes just a few minutes:</p>
      <ol style="margin: 0 0 24px; padding-left: 20px; line-height: 1.7;">
        <li><strong>Pick a theme</strong> you love — you can change it anytime.</li>
        <li><strong>Add your details</strong> — the date, the place, your story and a photo.</li>
        <li><strong>Share it</strong> with your guests and watch the RSVPs come in.</li>
      </ol>
      ${button(`${site}/dashboard`, 'Create your event page')}`;

  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Welcome to MyGala${name ? `, ${escHtml(name)}` : ''}! 🎉</h2>
    <p style="${p}">${name ? `Hi ${escHtml(name)},` : 'Hi there,'}</p>
    <p style="${p}">Thank you for joining MyGala — we’re so happy you’re here. Whether you’re planning a wedding, a birthday, a reunion or a
    gathering with friends, we’re here to help you give your guests a beautiful page with everything they need in one place.</p>
    ${nextStep}
    <p style="margin: 24px 0 16px; line-height: 1.6;">${signedUpWith}</p>

    <div style="margin: 28px 0 0; padding: 20px; background: #F7F4F1; border-radius: 12px;">
      <p style="margin: 0 0 8px; font-weight: 600;">We’re here to help</p>
      <p style="margin: 0 0 12px; line-height: 1.6;">Have a question, or stuck on something? We read every message and usually reply within one business day.</p>
      <p style="margin: 0; line-height: 1.8;">
        ✉️ Email: <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a><br />
        💬 Contact form: <a href="${site}/contact" style="color: #B6584A;">${site.replace(/^https?:\/\//, '')}/contact</a><br />
        ❓ Answers to common questions: <a href="${site}/faq" style="color: #B6584A;">${site.replace(/^https?:\/\//, '')}/faq</a>
      </p>
    </div>

    <p style="margin: 28px 0 0; line-height: 1.6;">Happy planning,<br />The MyGala team</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: ${muted};">You’re receiving this email because you created a MyGala account.</p>
  `);
}

// Never throws: a mail problem must not break signing in or verifying.
export async function sendWelcomeEmail(userId: string): Promise<void> {
  try {
    const users = await sql<WelcomeUser>`SELECT email, given_name, provider FROM users WHERE id = ${userId}`;
    const user = users.rows[0];
    if (!user?.email) return;
    const pages = await sql<FirstPage>`SELECT id, heading, slug FROM user_page WHERE user_id = ${userId} ORDER BY id LIMIT 1`;
    const name = (user.given_name ?? '').trim();
    await sendMail({
      to: user.email,
      subject: name ? `Welcome to MyGala, ${name}!` : 'Welcome to MyGala!',
      html: welcomeEmailHtml(user, pages.rows[0] ?? null),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
