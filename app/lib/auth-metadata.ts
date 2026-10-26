import type { Metadata } from 'next';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import type { StartIntent } from '@/app/lib/start-intent';

// Titles and descriptions for the sign-up, sign-in and account screens
// (kept out of search results by next.config.ts, but shown in browser tabs,
// link previews and SEO tools).

export const AUTH_METADATA = {
  login: {
    title: 'Log in',
    description: 'Log in to MyGala to edit your event website, design and send your invitations, follow your RSVPs and guest list, and share your event with one link.',
  },
  forgotPassword: {
    title: 'Forgot your password',
    description: 'Forgot your MyGala password? Enter the email address on your account and we’ll send you a link to choose a new one and get back to your event.',
  },
  resetPassword: {
    title: 'Choose a new password',
    description: 'Choose a new password for your MyGala account, then log in to keep working on your event website, invitations, RSVPs and guest list.',
  },
  checkEmail: {
    title: 'Check your email',
    description: 'We’ve emailed you a link to confirm your address. Open it to verify your MyGala account, then publish your event page and share it with your guests.',
  },
  checkEmailFr: {
    title: 'Vérifiez vos courriels',
    description: 'Nous vous avons envoyé un lien pour confirmer votre adresse. Ouvrez-le pour vérifier votre compte MyGala, puis partagez votre page avec vos invités.',
  },
  emailVerified: {
    title: 'Email confirmed',
    description: 'Your email address is confirmed and your MyGala account is ready. Head to your dashboard to finish your event page and share the link with your guests.',
  },
  verifyEmailPending: {
    title: 'Confirm your email',
    description: 'Confirm your email address to publish your MyGala event page. Open the link we emailed you to finish setting up your account and share your page.',
  },
  verify2fa: {
    title: 'Two-step verification',
    description: 'Enter the code from your authenticator app to finish logging in to your MyGala account and get back to your event pages, invitations and RSVPs.',
  },
} satisfies Record<string, Metadata & { title: string; description: string }>;

// /register: the words follow where the visitor came from (a wedding
// website, a Christmas invitation, a chosen design, or the French page).
export function registerMetadata(lang: 'en' | 'fr', start?: StartIntent | null): Metadata {
  if (lang === 'fr') {
    return {
      title: 'Créer votre compte gratuit',
      description: 'Créez votre compte MyGala gratuit et votre site de mariage en quelques minutes : choisissez un modèle, ajoutez la date et le lieu, puis recevez les RSVP.',
    };
  }
  const theme = start?.theme ? THEME_CARDS.find((t) => t.slug === start.theme)?.name : undefined;
  const design = theme ? ` with the ${theme} design` : '';
  if (start?.occasion === 'christmas') {
    return {
      title: theme ? `Create your ${theme} Christmas invitation` : 'Create your free Christmas invitation',
      description: `Sign up free and create your Christmas party invitation${design}: add the date and place, then share one link your guests can open and RSVP to.`,
    };
  }
  if (start?.occasion === 'wedding') {
    return {
      title: theme ? `Start your ${theme} wedding website` : 'Create your free wedding website',
      description: `Sign up free and start your wedding website${design}: add your names, date and venue, then collect RSVPs from every guest with one link.`,
    };
  }
  if (start?.intent === 'invitation') {
    return {
      title: 'Create your free invitation',
      description: `Sign up free and create your online invitation${design}: add the date and place, and send one link guests can open on any phone to RSVP.`,
    };
  }
  return {
    title: 'Sign up free',
    description: `Create your free MyGala account and start your event website${design} in minutes: pick a design, add your date and venue, and collect RSVPs with one link.`,
  };
}
