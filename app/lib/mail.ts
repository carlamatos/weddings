import { Resend } from 'resend';
import { siteUrl } from './site-url';
import { companyMailingLine } from './company';

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

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
  from?: string; // defaults to MyGala's no-reply address
  replyTo?: string;
};

// A display name that's safe inside a From header: "Ana Silva via MyGala".
export function fromName(name: string): string {
  const clean = name.replace(/["<>\\\r\n]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return clean ? `"${clean} via MyGala" <no-reply@mygala.ca>` : 'MyGala <no-reply@mygala.ca>';
}

// Many personalized emails at once (Resend caps a batch at 100). Throws on
// failure so callers can release whatever they had claimed for this batch.
export async function sendMailBatch(messages: MailMessage[]): Promise<void> {
  if (!messages.length) return;
  if (!process.env.RESEND_API_KEY) {
    for (const m of messages) console.log(`[mail] RESEND_API_KEY not set — would send to ${m.to}: ${m.subject}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100).map((m) => ({ from: 'MyGala <no-reply@mygala.ca>', ...m }));
    const { error } = await resend.batch.send(chunk);
    if (error) throw new Error(`Resend batch failed: ${error.message}`);
  }
}

export function wrap(bodyHtml: string): string {
  // The MyGala wordmark, as a PNG: most email apps (Gmail, Outlook) don't
  // show SVG. Made from public/images/mygala-logo.svg at 3x for sharp screens.
  const logoUrl = `${siteUrl()}/images/mygala-logo-email.png`;
  return `
    <div style="background: ${BRAND.cream}; padding: 40px 16px; font-family: system-ui, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px 40px 32px; box-shadow: 0 1px 3px rgba(36,31,43,0.08);">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="${logoUrl}" alt="MyGala" width="150" height="54" style="display: inline-block; width: 150px; height: 54px; border: 0;" />
        </div>
        <div style="color: ${BRAND.text};">
          ${bodyHtml}
        </div>
      </div>
      <p style="max-width: 560px; margin: 24px auto 0; text-align: center; font-size: 12px; color: ${BRAND.muted};">${escHtml(companyMailingLine())}</p>
    </div>
  `;
}

export function button(link: string, label: string): string {
  return `<a href="${link}" style="display: inline-block; padding: 12px 24px; background: ${BRAND.text}; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">${label}</a>`;
}

export function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// The confirmation email in the sign-up page's language (fr and es from
// /register?lang=fr|es; the resend button uses the dashboard's language).
export type MailLang = 'en' | 'fr' | 'es';

const VERIFY_TEXT = {
  en: {
    subject: 'Confirm your email address for MyGala',
    heading: 'Welcome to MyGala!',
    hi: (name: string) => `Hi ${name},`,
    hiThere: 'Hi there,',
    intro: "Thanks for creating your MyGala account. Before you get started building your event page, please confirm this is your email address — we'll also use it to send you important updates, like new RSVPs and guest messages, so it's worth double-checking.",
    click: 'Click the button below to verify your address:',
    button: 'Verify email address',
    fallback: "If the button doesn't work, copy and paste this link into your browser:",
    expires: "This link expires in 48 hours. If you didn't create an account, you can safely ignore this email.",
  },
  fr: {
    subject: 'Confirmez votre adresse courriel pour MyGala',
    heading: 'Bienvenue sur MyGala !',
    hi: (name: string) => `Bonjour ${name},`,
    hiThere: 'Bonjour,',
    intro: 'Merci d’avoir créé votre compte MyGala. Avant de commencer à préparer votre page d’événement, veuillez confirmer que cette adresse courriel est bien la vôtre — nous l’utiliserons aussi pour vous envoyer des nouvelles importantes, comme les nouvelles réponses et les messages de vos invités, alors elle vaut la peine d’être vérifiée.',
    click: 'Cliquez sur le bouton ci-dessous pour confirmer votre adresse :',
    button: 'Confirmer mon adresse courriel',
    fallback: 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :',
    expires: 'Ce lien expire dans 48 heures. Si vous n’avez pas créé de compte, vous pouvez ignorer ce courriel.',
  },
  es: {
    subject: 'Confirma tu correo electrónico para MyGala',
    heading: '¡Te damos la bienvenida a MyGala!',
    hi: (name: string) => `Hola, ${name}:`,
    hiThere: 'Hola:',
    intro: 'Gracias por crear tu cuenta de MyGala. Antes de empezar a armar tu página de evento, confirma que este es tu correo electrónico — también lo usaremos para enviarte novedades importantes, como nuevas respuestas y mensajes de tus invitados, así que vale la pena comprobarlo.',
    click: 'Haz clic en el botón para verificar tu correo:',
    button: 'Verificar mi correo',
    fallback: 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
    expires: 'Este enlace caduca en 48 horas. Si no creaste una cuenta, puedes ignorar este correo.',
  },
};

export function verificationEmail(link: string, name?: string, lang: MailLang = 'en'): { subject: string; html: string } {
  const t = VERIFY_TEXT[lang];
  const greeting = name ? t.hi(escHtml(name)) : t.hiThere;
  return {
    subject: t.subject,
    html: wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">${t.heading}</h2>
    <p style="margin: 0 0 16px; line-height: 1.6;">${greeting}</p>
    <p style="margin: 0 0 16px; line-height: 1.6;">${t.intro}</p>
    <p style="margin: 0 0 24px; line-height: 1.6;">${t.click}</p>
    ${button(link, t.button)}
    <p style="margin: 24px 0 0; font-size: 13px; color: ${BRAND.muted}; line-height: 1.6;">${t.fallback}<br /><a href="${link}" style="color: ${BRAND.muted}; word-break: break-all;">${link}</a></p>
    <p style="margin: 16px 0 0; font-size: 13px; color: ${BRAND.muted};">${t.expires}</p>
  `),
  };
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
