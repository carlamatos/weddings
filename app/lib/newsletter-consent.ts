import { COMPANY } from './company';

// The newsletter checkbox on the sign-up forms, worded for Canada's
// Anti-Spam Legislation (CASL, s. 10(1) and CRTC Regulations 2012-36): a
// request for express consent must say what the emails are for, who is
// asking (name, mailing address, and an email, phone or website), and that
// consent can be withdrawn at any time. The box starts unticked and is
// separate from accepting the terms, so ticking it is the person's own act.
// The exact wording shown is saved with the subscriber (consent_text,
// app/lib/newsletter.ts), since under CASL the sender must be able to prove
// consent. Client-safe: no server imports.

export type ConsentLang = 'en' | 'fr' | 'es';
export const isConsentLang = (v: unknown): v is ConsentLang => v === 'en' || v === 'fr' || v === 'es';

const SENDER = `${COMPANY.legalName}, ${COMPANY.address.join(', ')} · ${COMPANY.email}`;

const TEXT: Record<ConsentLang, { label: string; fine: string; privacy: string }> = {
  en: {
    label: 'Yes, I’d like to receive emails from MyGala: our newsletter, event ideas, new features and offers. (Optional)',
    fine: `Sent by ${SENDER}. You can withdraw your consent at any time with the unsubscribe link in every email, or by contacting us.`,
    privacy: 'Privacy Policy',
  },
  fr: {
    label: 'Oui, je souhaite recevoir des courriels de MyGala : l’infolettre, des idées pour mes événements, les nouveautés et les offres. (Facultatif)',
    fine: `Envoyés par ${SENDER}. Vous pouvez retirer votre consentement en tout temps grâce au lien de désabonnement présent dans chaque courriel, ou en nous écrivant.`,
    privacy: 'Politique de confidentialité',
  },
  es: {
    label: 'Sí, quiero recibir correos de MyGala: el boletín, ideas para eventos, novedades y ofertas. (Opcional)',
    fine: `Enviados por ${SENDER}. Puedes retirar tu consentimiento en cualquier momento con el enlace para darte de baja de cada correo, o escribiéndonos.`,
    privacy: 'Política de privacidad',
  },
};

export const newsletterConsentText = (lang: ConsentLang) => TEXT[lang];

// What's stored as proof: the label and the fine print, as shown.
export const newsletterConsentRecord = (lang: ConsentLang) => `${TEXT[lang].label} ${TEXT[lang].fine}`;
