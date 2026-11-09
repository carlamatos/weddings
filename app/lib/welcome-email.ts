import { sql } from '@vercel/postgres';
import { sendMail, wrap, button, escHtml, type MailLang } from './mail';
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

// In the sign-up page's language (fr or es from /register?lang=fr|es). Values
// passed in are already escaped.
const WELCOME_TEXT = {
  en: {
    subject: (name: string) => (name ? `Welcome to MyGala, ${name}!` : 'Welcome to MyGala!'),
    heading: (name: string) => `Welcome to MyGala${name ? `, ${name}` : ''}! 🎉`,
    hi: (name: string) => (name ? `Hi ${name},` : 'Hi there,'),
    intro: `Thank you for joining MyGala — we’re so happy you’re here. Whether you’re planning a wedding, a birthday, a reunion or a
    gathering with friends, we’re here to help you give your guests a beautiful page with everything they need in one place.`,
    withProvider: (provider: string, email: string) => `You signed up with your ${provider} account (${email}), so next time just choose “Continue with ${provider}” to sign in.`,
    withPassword: (email: string) => `You’ll sign in with <strong>${email}</strong> and the password you chose.`,
    yourEvent: 'your event',
    started: (heading: string, link: string) => `Your event page <strong>${heading}</strong> is already started — it lives at
      ${link}.
      Here’s what to do next:`,
    startedSteps: [
      '<strong>Add your details</strong> — the date, the place, your story and a photo for the top banner.',
      '<strong>Turn on RSVP</strong> so guests can reply right on your page.',
      '<strong>Share it</strong> with a link, a QR code or invitations.',
    ],
    continueEditing: 'Continue editing your page',
    setUp: 'Setting up your event page takes just a few minutes:',
    setUpSteps: [
      '<strong>Pick a theme</strong> you love — you can change it anytime.',
      '<strong>Add your details</strong> — the date, the place, your story and a photo.',
      '<strong>Share it</strong> with your guests and watch the RSVPs come in.',
    ],
    create: 'Create your event page',
    helpHeading: 'We’re here to help',
    helpBody: 'Have a question, or stuck on something? We read every message and usually reply within one business day.',
    email: 'Email',
    contactForm: 'Contact form',
    faq: 'Answers to common questions',
    signOff: 'Happy planning,<br />The MyGala team',
    why: 'You’re receiving this email because you created a MyGala account.',
  },
  fr: {
    subject: (name: string) => (name ? `Bienvenue sur MyGala, ${name} !` : 'Bienvenue sur MyGala !'),
    heading: (name: string) => `Bienvenue sur MyGala${name ? `, ${name}` : ''} ! 🎉`,
    hi: (name: string) => (name ? `Bonjour ${name},` : 'Bonjour,'),
    intro: `Merci d’avoir rejoint MyGala — nous sommes ravis de vous compter parmi nous. Que vous prépariez un mariage, un anniversaire, des
    retrouvailles ou une soirée entre amis, nous vous aidons à offrir à vos invités une belle page qui réunit tout ce dont ils ont besoin.`,
    withProvider: (provider: string, email: string) => `Vous vous êtes inscrit avec votre compte ${provider} (${email}) : la prochaine fois, choisissez simplement « Continuer avec ${provider} » pour vous connecter.`,
    withPassword: (email: string) => `Vous vous connecterez avec <strong>${email}</strong> et le mot de passe que vous avez choisi.`,
    yourEvent: 'votre événement',
    started: (heading: string, link: string) => `Votre page d’événement <strong>${heading}</strong> est déjà commencée — elle se trouve à
      ${link}.
      Voici la suite :`,
    startedSteps: [
      '<strong>Ajoutez vos détails</strong> — la date, le lieu, votre histoire et une photo pour la bannière.',
      '<strong>Activez le RSVP</strong> pour que vos invités répondent directement sur votre page.',
      '<strong>Partagez-la</strong> avec un lien, un code QR ou des invitations.',
    ],
    continueEditing: 'Continuer à modifier ma page',
    setUp: 'Préparer votre page d’événement ne prend que quelques minutes :',
    setUpSteps: [
      '<strong>Choisissez un thème</strong> qui vous plaît — vous pourrez le changer à tout moment.',
      '<strong>Ajoutez vos détails</strong> — la date, le lieu, votre histoire et une photo.',
      '<strong>Partagez-la</strong> avec vos invités et regardez les réponses arriver.',
    ],
    create: 'Créer ma page d’événement',
    helpHeading: 'Nous sommes là pour vous aider',
    helpBody: 'Une question, ou vous êtes bloqué ? Nous lisons chaque message et répondons généralement en un jour ouvrable.',
    email: 'Courriel',
    contactForm: 'Formulaire de contact',
    faq: 'Réponses aux questions fréquentes',
    signOff: 'Bonne planification,<br />L’équipe MyGala',
    why: 'Vous recevez ce courriel parce que vous avez créé un compte MyGala.',
  },
  es: {
    subject: (name: string) => (name ? `¡Te damos la bienvenida a MyGala, ${name}!` : '¡Te damos la bienvenida a MyGala!'),
    heading: (name: string) => `¡Te damos la bienvenida a MyGala${name ? `, ${name}` : ''}! 🎉`,
    hi: (name: string) => (name ? `Hola, ${name}:` : 'Hola:'),
    intro: `Gracias por unirte a MyGala — nos alegra mucho tenerte aquí. Ya sea que estés planeando una boda, un cumpleaños, un reencuentro o
    una reunión con amigos, te ayudamos a darles a tus invitados una página preciosa con todo lo que necesitan en un solo lugar.`,
    withProvider: (provider: string, email: string) => `Te registraste con tu cuenta de ${provider} (${email}), así que la próxima vez solo elige «Continuar con ${provider}» para iniciar sesión.`,
    withPassword: (email: string) => `Iniciarás sesión con <strong>${email}</strong> y la contraseña que elegiste.`,
    yourEvent: 'tu evento',
    started: (heading: string, link: string) => `Tu página de evento <strong>${heading}</strong> ya está empezada — está en
      ${link}.
      Esto es lo que sigue:`,
    startedSteps: [
      '<strong>Añade los detalles</strong> — la fecha, el lugar, tu historia y una foto para el banner.',
      '<strong>Activa el RSVP</strong> para que tus invitados respondan directamente en tu página.',
      '<strong>Compártela</strong> con un enlace, un código QR o invitaciones.',
    ],
    continueEditing: 'Seguir editando mi página',
    setUp: 'Preparar tu página de evento solo toma unos minutos:',
    setUpSteps: [
      '<strong>Elige un tema</strong> que te encante — puedes cambiarlo cuando quieras.',
      '<strong>Añade los detalles</strong> — la fecha, el lugar, tu historia y una foto.',
      '<strong>Compártela</strong> con tus invitados y mira cómo llegan las respuestas.',
    ],
    create: 'Crear mi página de evento',
    helpHeading: 'Estamos para ayudarte',
    helpBody: '¿Tienes una pregunta o te atoraste con algo? Leemos todos los mensajes y solemos responder en un día hábil.',
    email: 'Correo',
    contactForm: 'Formulario de contacto',
    faq: 'Respuestas a preguntas frecuentes',
    signOff: '¡Feliz planificación!<br />El equipo de MyGala',
    why: 'Recibes este correo porque creaste una cuenta de MyGala.',
  },
};

export function welcomeEmailHtml(user: WelcomeUser, page: FirstPage | null, lang: MailLang = 'en'): string {
  const t = WELCOME_TEXT[lang];
  const site = siteUrl();
  const name = escHtml((user.given_name ?? '').trim());
  const provider = PROVIDER_NAMES[(user.provider ?? '').toLowerCase()];
  const muted = '#9A8F8C';
  const p = 'margin: 0 0 16px; line-height: 1.6;';
  const steps = (items: string[]) => `
      <ol style="margin: 0 0 24px; padding-left: 20px; line-height: 1.7;">
        ${items.map((item) => `<li>${item}</li>`).join('\n        ')}
      </ol>`;

  const signedUpWith = provider ? t.withProvider(provider, escHtml(user.email)) : t.withPassword(escHtml(user.email));

  const nextStep = page
    ? `
      <p style="${p}">${t.started(
        escHtml(page.heading || t.yourEvent),
        `<a href="${site}/${escHtml(page.slug)}" style="color: #B6584A;">${escHtml(site.replace(/^https?:\/\//, ''))}/${escHtml(page.slug)}</a>`,
      )}</p>${steps(t.startedSteps)}
      ${button(`${site}/dashboard/pages/${page.id}`, t.continueEditing)}`
    : `
      <p style="${p}">${t.setUp}</p>${steps(t.setUpSteps)}
      ${button(`${site}/dashboard`, t.create)}`;

  return wrap(`
    <h2 style="margin: 0 0 16px; font-size: 20px;">${t.heading(name)}</h2>
    <p style="${p}">${t.hi(name)}</p>
    <p style="${p}">${t.intro}</p>
    ${nextStep}
    <p style="margin: 24px 0 16px; line-height: 1.6;">${signedUpWith}</p>

    <div style="margin: 28px 0 0; padding: 20px; background: #F7F4F1; border-radius: 12px;">
      <p style="margin: 0 0 8px; font-weight: 600;">${t.helpHeading}</p>
      <p style="margin: 0 0 12px; line-height: 1.6;">${t.helpBody}</p>
      <p style="margin: 0; line-height: 1.8;">
        ✉️ ${t.email}: <a href="mailto:${COMPANY.email}" style="color: #B6584A;">${COMPANY.email}</a><br />
        💬 ${t.contactForm}: <a href="${site}/contact" style="color: #B6584A;">${site.replace(/^https?:\/\//, '')}/contact</a><br />
        ❓ ${t.faq}: <a href="${site}/faq" style="color: #B6584A;">${site.replace(/^https?:\/\//, '')}/faq</a>
      </p>
    </div>

    <p style="margin: 28px 0 0; line-height: 1.6;">${t.signOff}</p>
    <p style="margin: 16px 0 0; font-size: 13px; color: ${muted};">${t.why}</p>
  `);
}

// Never throws: a mail problem must not break signing in or verifying.
export async function sendWelcomeEmail(userId: string, lang: MailLang = 'en'): Promise<void> {
  try {
    const users = await sql<WelcomeUser>`SELECT email, given_name, provider FROM users WHERE id = ${userId}`;
    const user = users.rows[0];
    if (!user?.email) return;
    const pages = await sql<FirstPage>`SELECT id, heading, slug FROM user_page WHERE user_id = ${userId} ORDER BY id LIMIT 1`;
    const name = (user.given_name ?? '').trim();
    await sendMail({
      to: user.email,
      subject: WELCOME_TEXT[lang].subject(name),
      html: welcomeEmailHtml(user, pages.rows[0] ?? null, lang),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
