import { Resend } from 'resend';
import { siteUrl } from './site-url';

const BRAND = {
  text: '#241F2B',
  muted: '#9A8F8C',
  border: '#EDE8E3',
  cream: '#F7F4F1',
};

// Shared with app/api/contact/route.ts's style, extracted so every
// transactional email (verification, password reset, ...) looks the same.
export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    // Local dev has no RESEND_API_KEY — log instead of failing the request.
    // The client is also constructed lazily (not at module scope) for the
    // same reason: `new Resend(undefined)` throws immediately, which would
    // otherwise break the build the moment anything imports this file.
    console.log(`[mail] RESEND_API_KEY not set — would send to ${to}: ${subject}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'MyGala <no-reply@mygala.ca>',
    to,
    subject,
    html,
  });
}

function wrap(bodyHtml: string): string {
  const logoUrl = `${siteUrl()}/images/logo_1.png`;
  return `
    <div style="background: ${BRAND.cream}; padding: 40px 16px; font-family: system-ui, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px 40px 32px; box-shadow: 0 1px 3px rgba(36,31,43,0.08);">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="${logoUrl}" alt="MyGala" width="160" style="display: inline-block; width: 160px; height: auto;" />
        </div>
        <div style="color: ${BRAND.text};">
          ${bodyHtml}
        </div>
      </div>
      <p style="max-width: 560px; margin: 24px auto 0; text-align: center; font-size: 12px; color: ${BRAND.muted};">MyGala &middot; mygala.ca</p>
    </div>
  `;
}

function button(link: string, label: string): string {
  return `<a href="${link}" style="display: inline-block; padding: 12px 24px; background: ${BRAND.text}; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">${label}</a>`;
}

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function verificationEmailHtml(link: string, name?: string): string {
  const greeting = name ? `Hi ${escHtml(name)},` : 'Hi there,';
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Welcome to MyGala!</h2>
    <p style="margin: 0 0 16px; line-height: 1.6;">${greeting}</p>
    <p style="margin: 0 0 16px; line-height: 1.6;">Thanks for creating your MyGala account. Before you get started building your event page, please confirm this is your email address — we'll also use it to send you important updates, like new RSVPs and guest messages, so it's worth double-checking.</p>
    <p style="margin: 0 0 24px; line-height: 1.6;">Click the button below to verify your address:</p>
    ${button(link, 'Verify email address')}
    <p style="margin: 24px 0 0; font-size: 13px; color: ${BRAND.muted}; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:<br /><a href="${link}" style="color: ${BRAND.muted}; word-break: break-all;">${link}</a></p>
    <p style="margin: 16px 0 0; font-size: 13px; color: ${BRAND.muted};">This link expires in 48 hours. If you didn't create an account, you can safely ignore this email.</p>
  `);
}

export function resetEmailHtml(link: string, name?: string): string {
  const greeting = name ? `Hi ${escHtml(name)},` : 'Hi there,';
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Reset your password</h2>
    <p style="margin: 0 0 16px; line-height: 1.6;">${greeting}</p>
    <p style="margin: 0 0 24px; line-height: 1.6;">We received a request to reset your MyGala password. Click below to choose a new one.</p>
    ${button(link, 'Reset password')}
    <p style="margin: 24px 0 0; font-size: 13px; color: ${BRAND.muted}; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:<br /><a href="${link}" style="color: ${BRAND.muted}; word-break: break-all;">${link}</a></p>
    <p style="margin: 16px 0 0; font-size: 13px; color: ${BRAND.muted};">This link expires in 45 minutes. If you didn't request this, you can safely ignore this email — your password won't change.</p>
  `);
}
