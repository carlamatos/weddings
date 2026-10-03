import type { InvitationDesign, InvitationDetails } from './invitation';

// The invitation as a text message, for the host to send from their own
// phone (Invitations → guest list → Text / WhatsApp / Copy). Built from the
// saved design's wording, the event's details and the guest's personal note.
// Client-safe: no server imports.

type Lang = 'en' | 'fr' | 'es';

const COPY: Record<Lang, { greeting: (name: string) => string; invited: string; rsvp: string }> = {
  en: { greeting: (name) => `Dear ${name},`, invited: 'You’re invited to', rsvp: 'Details & RSVP:' },
  fr: { greeting: (name) => `Bonjour ${name},`, invited: 'Nous vous invitons à', rsvp: 'Détails et réponse :' },
  es: { greeting: (name) => `Hola, ${name}:`, invited: 'Te invitamos a', rsvp: 'Detalles y confirmación:' },
};

export function invitationText({
  design,
  details,
  language,
  guestName,
  note,
  hostName,
}: {
  design: Pick<InvitationDesign, 'eyebrow'>;
  details: InvitationDetails;
  language?: string | null;
  guestName?: string;
  note?: string | null;
  hostName?: string;
}): string {
  const lang: Lang = language === 'fr' || language === 'es' ? language : 'en';
  const t = COPY[lang];
  const lead = (design.eyebrow.trim() || t.invited).replace(/[\s:…]+$/, '');
  const when = [details.date, details.time].filter(Boolean).join(' · ');
  const where = [details.venue, details.address].filter(Boolean).join(', ');
  const parts = [
    guestName?.trim() ? t.greeting(guestName.trim()) : '',
    `${lang === 'es' && !lead.startsWith('¡') ? '¡' : ''}${lead} ${details.name}!`,
    [when, where].filter(Boolean).join('\n'),
    note?.trim() ?? '',
    `${t.rsvp} ${details.url}`,
    hostName?.trim() ? `— ${hostName.trim()}` : '',
  ];
  return parts.filter(Boolean).join('\n\n');
}

// A number the Messages app can dial: digits, keeping a leading +.
export function smsNumber(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

// `sms:<number>?&body=` opens a pre-filled message on both iPhone and Android
// (and Messages on a Mac).
export function smsHref(phone: string, body: string): string {
  return `sms:${smsNumber(phone)}?&body=${encodeURIComponent(body)}`;
}

// WhatsApp needs the full international number without + or leading zeros.
// A 10-digit number without a country code is taken as North American (+1);
// anything else unclear opens WhatsApp's contact picker with the message.
export function whatsappNumber(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+') && digits.length >= 8) return digits;
  if (trimmed.startsWith('00') && digits.length >= 10) return digits.slice(2);
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return digits;
  return null;
}

export function whatsappHref(phone: string | null, body: string): string {
  const number = phone ? whatsappNumber(phone) : null;
  return `https://wa.me/${number ?? ''}?text=${encodeURIComponent(body)}`;
}
