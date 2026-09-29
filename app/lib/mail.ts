import { Resend } from 'resend';

const BRAND = {
  text: '#241F2B',
  muted: '#9A8F8C',
  border: '#EDE8E3',
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
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; color: ${BRAND.text};">
      ${bodyHtml}
      <p style="margin: 32px 0 0; font-size: 12px; color: ${BRAND.muted}; border-top: 1px solid ${BRAND.border}; padding-top: 16px;">MyGala &middot; mygala.ca</p>
    </div>
  `;
}

function button(link: string, label: string): string {
  return `<a href="${link}" style="display: inline-block; padding: 12px 24px; background: ${BRAND.text}; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">${label}</a>`;
}

export function verificationEmailHtml(link: string): string {
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Confirm your email address</h2>
    <p style="margin: 0 0 24px; line-height: 1.6;">Welcome to MyGala! Please confirm this is your email address to finish setting up your account.</p>
    ${button(link, 'Verify email address')}
    <p style="margin: 24px 0 0; font-size: 13px; color: ${BRAND.muted};">This link expires in 48 hours. If you didn't create an account, you can ignore this email.</p>
  `);
}

export function resetEmailHtml(link: string): string {
  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">Reset your password</h2>
    <p style="margin: 0 0 24px; line-height: 1.6;">We received a request to reset your MyGala password. Click below to choose a new one.</p>
    ${button(link, 'Reset password')}
    <p style="margin: 24px 0 0; font-size: 13px; color: ${BRAND.muted};">This link expires in 45 minutes. If you didn't request this, you can ignore this email — your password won't change.</p>
  `);
}
