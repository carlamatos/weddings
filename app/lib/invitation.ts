// The invitation designer (every plan). The host chooses fonts, wording, colours
// and the background; the event's name, date, time and place always come
// from the page (changed only in Edit Page). Stored as JSON in
// user_page_settings under INVITATION_SETTING. Shared by the dashboard, the
// server action and the print view, so no server-only imports.

import { findOrnament, ornamentOccasion } from './invitation-ornaments';
import { isEnvelopeLiner, isEnvelopeSeal, type EnvelopeLiner, type EnvelopeSeal, type InvitationEnvelope } from './invitation-envelope';

export const INVITATION_SETTING = 'invitation_design';

// The invitation is made in steps, one screen at a time, ending with
// sending it. A finished design the host uploaded skips Words and Style.
export const INVITATION_STEPS = ['design', 'words', 'style', 'envelope', 'send'] as const;
export type InvitationStep = (typeof INVITATION_STEPS)[number];
export const isInvitationStep = (v: unknown): v is InvitationStep => typeof v === 'string' && (INVITATION_STEPS as readonly string[]).includes(v);

export const INVITATION_FONTS = {
  'great-vibes': { label: 'Great Vibes (script)', family: "'Great Vibes', cursive", google: 'Great+Vibes' },
  // Formal calligraphy (the Couple Portrait designs).
  'mrs-saint-delafield': { label: 'Mrs Saint Delafield (calligraphy)', family: "'Mrs Saint Delafield', cursive", google: 'Mrs+Saint+Delafield' },
  'parisienne': { label: 'Parisienne (script)', family: "'Parisienne', cursive", google: 'Parisienne' },
  'dancing-script': { label: 'Dancing Script (handwritten)', family: "'Dancing Script', cursive", google: 'Dancing+Script:wght@400;600' },
  'playfair': { label: 'Playfair Display (elegant serif)', family: "'Playfair Display', serif", google: 'Playfair+Display:ital,wght@0,400;0,600;1,400' },
  'cormorant': { label: 'Cormorant Garamond (classic serif)', family: "'Cormorant Garamond', serif", google: 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400' },
  'cinzel': { label: 'Cinzel (formal capitals)', family: "'Cinzel', serif", google: 'Cinzel:wght@400;600' },
  'libre-baskerville': { label: 'Libre Baskerville (serif)', family: "'Libre Baskerville', serif", google: 'Libre+Baskerville:ital@0;1' },
  'montserrat': { label: 'Montserrat (modern sans)', family: "'Montserrat', sans-serif", google: 'Montserrat:wght@400;600' },
  'josefin': { label: 'Josefin Sans (geometric sans)', family: "'Josefin Sans', sans-serif", google: 'Josefin+Sans:wght@400;600' },
  'lato': { label: 'Lato (clean sans)', family: "'Lato', sans-serif", google: 'Lato:wght@400;700' },
  'poppins': { label: 'Poppins (friendly sans)', family: "'Poppins', sans-serif", google: 'Poppins:wght@400;600' },
  'space-grotesk': { label: 'Space Grotesk (tech sans)', family: "'Space Grotesk', sans-serif", google: 'Space+Grotesk:wght@400;600' },
  'fredoka': { label: 'Fredoka (playful)', family: "'Fredoka', sans-serif", google: 'Fredoka:wght@400;600' },
  'creepster': { label: 'Creepster (spooky)', family: "'Creepster', cursive", google: 'Creepster' },
  'amatic': { label: 'Amatic SC (hand-lettered capitals)', family: "'Amatic SC', cursive", google: 'Amatic+SC:wght@400;700' },
} as const;

export type InvitationFont = keyof typeof INVITATION_FONTS;

export type InvitationDesign = {
  headingFont: InvitationFont; // event name
  bodyFont: InvitationFont; // everything else
  eyebrow: string; // line above the event name, e.g. "You're invited to"
  message: string; // the host's words below the details
  closing: string; // sign-off at the bottom
  textColor: string;
  accentColor: string; // event name and the small rules
  background: {
    kind: 'color' | 'image';
    color: string;
    imageUrl: string;
    overlay: boolean; // a colour wash over the image, for legible text
    overlayColor: string;
    overlayOpacity: number; // 0–0.9
  };
  showQr: boolean; // QR code to the event page (for RSVPs)
  // Decorations (app/lib/invitation-ornaments.ts): ids, '' for none.
  divider: string; // under the event name, in place of the plain rule
  dividerColor: string;
  frame: string; // around the card's edge
  frameColor: string;
  // A picture from the theme in a corner (INVITATION_PICTURES), '' for none.
  picture: string;
  // How the words are set out. classic: centred lines, the event name in the
  // heading font. monogram (weddings): the couple's initials in a leaf
  // wreath, "the WEDDING of" in the heading font and tall hand-lettered
  // capitals, then the names, details and closing in the body font's capitals.
  // blooms (weddings): our flower cutouts (the Wild Flores theme's) cascading
  // down the right side in soft paper colours (flowers), raised off the card
  // with shadows, the words set to their left.
  // portrait (weddings): the couple's photo in a circle inside a fine double
  // ring (photo; our sample photo until the host adds theirs), the line above
  // the names in calligraphy, the names in spaced capitals with "and" in
  // calligraphy between.
  // gilded (weddings): white paper in a fine gold frame, the couple's
  // initials (initials) in calligraphy at the top, then everything in
  // spaced gold capitals, the names largest with "and" between.
  // embossed (weddings): a Victorian frame of scrolls, shells and acanthus
  // pressed into the paper (raised, in the paper's own colour), the words
  // centred inside: italic lines, the names in large capitals.
  // garden (weddings): an engraved frame of scrolls, leaves and blossoms,
  // the words in spaced capitals with "and" and the place in calligraphy.
  // lace (weddings): dark wood planks with white lace flowers in two
  // corners, the name in large serif capitals.
  // meadow (weddings): watercolour wildflower garlands along the top and
  // bottom, the name in large calligraphy.
  // own: the host's finished invitation (an uploaded image) shown as it is,
  // with no words, decorations or wash over it.
  layout: InvitationLayout;
  // The couple's photo for the portrait layout: one the host uploaded, or ''
  // for our sample (COUPLE_SAMPLE_PHOTO). Kept when they pick another design.
  photo: string;
  // The initials at the top of the gilded layout, as the host wrote them
  // ('' : the first letters of the names). Kept when they change design.
  initials: string;
  // The event's facts as the invitation says them: the host can word them
  // here without changing the event page ('' : the page's own, see
  // withInvitationText).
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventAddress: string;
  // The flowers' colour in the blooms layout (INVITATION_FLOWER_TONES).
  flowers: FlowerTone;
  // The envelope it arrives in (app/lib/invitation-envelope.ts): on, the
  // email shows it sealed and guests open it on MyGala.
  envelope: InvitationEnvelope;
};

export const INVITATION_LAYOUTS = ['classic', 'monogram', 'portrait', 'blooms', 'gilded', 'embossed', 'garden', 'lace', 'meadow', 'own'] as const;
export type InvitationLayout = (typeof INVITATION_LAYOUTS)[number];

// Pictures from a theme that its invitation can show in a corner: drawn
// under the words so they never hide any. width is a share of the card's
// width (cqw); corner and nudge place it.
export const INVITATION_PICTURES = {
  balloons: { label: 'Balloons', src: '/images/invitations/balloons.webp', corner: 'top-right', width: 20, rotate: 6 },
  gnome: { label: 'Gnome', src: '/images/invitations/gnome.webp', corner: 'bottom-left', width: 13, rotate: -4 },
} as const;
export type InvitationPicture = keyof typeof INVITATION_PICTURES;
// The blooms layout's flower colours: the cutouts softened into paper
// tones with CSS filters (the shadows that raise them are added after).
export const INVITATION_FLOWER_TONES = {
  peach: 'sepia(0.6) saturate(1.25) hue-rotate(-14deg) brightness(1.1)',
  blush: 'sepia(0.2) saturate(0.55) brightness(1.13)',
  ivory: 'grayscale(0.85) sepia(0.35) brightness(1.18) contrast(0.92)',
  lilac: 'hue-rotate(-28deg) saturate(0.45) brightness(1.1)',
  // White roses (The Day's): their cream taken down to white.
  roses: 'saturate(0.35) brightness(1.07) contrast(1.02)',
} as const;
export type FlowerTone = keyof typeof INVITATION_FLOWER_TONES;
const isFlowerTone = (v: unknown): v is FlowerTone => typeof v === 'string' && v in INVITATION_FLOWER_TONES;

// The portrait layout's photo until the host adds their own.
export const COUPLE_SAMPLE_PHOTO = '/images/themes/quiet-coastal/couple.png';

// Themes whose invitation starts on one of our papers (INVITATION_PAPERS).
const THEME_PAPER: Partial<Record<string, string>> = { nature: '/images/invitations/nature-greenery.jpg' };
// Which theme starts with which picture.
export const THEME_PICTURE: Partial<Record<string, InvitationPicture>> = { balloons: 'balloons', gnomes: 'gnome' };
export const isInvitationPicture = (v: unknown): v is InvitationPicture => typeof v === 'string' && v in INVITATION_PICTURES;

export const INVITATION_TEXT_MAX = { eyebrow: 80, message: 600, closing: 160, initials: 5, eventName: 120, eventDate: 80, eventTime: 80, eventVenue: 120, eventAddress: 200 } as const;

// The host's personal note for one guest (Guests → Invite).
export const INVITATION_NOTE_MAX = 500;

// Event facts shown on the invitation, read-only (from the page).
export type InvitationDetails = {
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  url: string;
  // The page password, when the page is protected and the host includes it in
  // invitations, with its label in the page's language.
  password?: string;
  passwordLabel?: string;
  // The host hid the RSVP on the page: no "RSVP" button or wording.
  rsvpOff?: boolean;
  // The guest's own sub-events (app/lib/sub-events.ts), when the page has
  // them: shown with the invitation, not on the card itself.
  events?: { name: string; when: string; venue: string }[];
};

type Preset = Pick<InvitationDesign, 'headingFont' | 'bodyFont' | 'textColor' | 'accentColor'> & { bg: string };

// A starting design per theme, in that theme's colours and type mood.
const THEME_PRESETS: Record<string, Preset> = {
  'the-day': { bg: '#F6F2E9', textColor: '#33402F', accentColor: '#9C7C3C', headingFont: 'cormorant', bodyFont: 'lato' },
  'love': { bg: '#FBE4E2', textColor: '#5A2D3A', accentColor: '#B23A5B', headingFont: 'great-vibes', bodyFont: 'cormorant' },
  'nature': { bg: '#ECEEEE', textColor: '#2A231E', accentColor: '#2D4130', headingFont: 'parisienne', bodyFont: 'cormorant' },
  'western': { bg: '#F4EADB', textColor: '#2B1B12', accentColor: '#A4452B', headingFont: 'libre-baskerville', bodyFont: 'libre-baskerville' },
  'wild-flores': { bg: '#EEE3DD', textColor: '#3E3A2C', accentColor: '#BE7922', headingFont: 'playfair', bodyFont: 'lato' },
  'forest': { bg: '#FEFEFE', textColor: '#2F3532', accentColor: '#5E7165', headingFont: 'playfair', bodyFont: 'lato' },
  'terracotta-harvest': { bg: '#F7F1E6', textColor: '#3D2B1F', accentColor: '#BC5A38', headingFont: 'playfair', bodyFont: 'lato' },
  'midnight-botanical': { bg: '#0F1F1A', textColor: '#E9E2CC', accentColor: '#C9A75D', headingFont: 'cormorant', bodyFont: 'cormorant' },
  'quiet-coastal': { bg: '#FFFFFF', textColor: '#3E4A45', accentColor: '#7D8F84', headingFont: 'cormorant', bodyFont: 'josefin' },
  'vilma': { bg: '#FFFFFF', textColor: '#3C4A5C', accentColor: '#F8AC4C', headingFont: 'parisienne', bodyFont: 'cormorant' },
  'alegria': { bg: '#FFF8F3', textColor: '#4A3550', accentColor: '#C77FA1', headingFont: 'parisienne', bodyFont: 'playfair' },
  'fun-party': { bg: '#1A0B2E', textColor: '#F4F1FF', accentColor: '#FF3EA5', headingFont: 'fredoka', bodyFont: 'poppins' },
  'balloons': { bg: '#FFFDF6', textColor: '#1E3A5F', accentColor: '#E63946', headingFont: 'fredoka', bodyFont: 'poppins' },
  'baby-shower-girl': { bg: '#F5D7DF', textColor: '#5B4A54', accentColor: '#C9708A', headingFont: 'dancing-script', bodyFont: 'poppins' },
  'baby-shower-neutral': { bg: '#E3E5E8', textColor: '#4A5060', accentColor: '#8A7FB5', headingFont: 'dancing-script', bodyFont: 'poppins' },
  'baby-shower-boy': { bg: '#D9EEFB', textColor: '#244A63', accentColor: '#B07A45', headingFont: 'dancing-script', bodyFont: 'poppins' },
  'summit': { bg: '#14171C', textColor: '#E8ECF2', accentColor: '#CECECE', headingFont: 'space-grotesk', bodyFont: 'space-grotesk' },
  'nexus': { bg: '#1D2124', textColor: '#E7E3DA', accentColor: '#E8A33D', headingFont: 'montserrat', bodyFont: 'lato' },
  'dinner-gala': { bg: '#0A1420', textColor: '#EDE3CC', accentColor: '#C9A24B', headingFont: 'cinzel', bodyFont: 'cormorant' },
  'simple': { bg: '#FAF8F4', textColor: '#26231F', accentColor: '#8C7B6B', headingFont: 'playfair', bodyFont: 'lato' },
  'blessings': { bg: '#FBF8F1', textColor: '#2E2C3A', accentColor: '#B08D57', headingFont: 'cormorant', bodyFont: 'lato' },
  'community': { bg: '#F6E0BD', textColor: '#1F2E4D', accentColor: '#D9472B', headingFont: 'playfair', bodyFont: 'lato' },
  'antique-cars': { bg: '#2E1A47', textColor: '#FFF4DC', accentColor: '#F2C230', headingFont: 'cinzel', bodyFont: 'montserrat' },
  'christmas-party': { bg: '#2C3138', textColor: '#F4EDE1', accentColor: '#C8372D', headingFont: 'dancing-script', bodyFont: 'lato' },
  'white-christmas': { bg: '#DAE4F0', textColor: '#23415E', accentColor: '#B89B4F', headingFont: 'cormorant', bodyFont: 'lato' },
  'gnomes': { bg: '#F0E5DD', textColor: '#476735', accentColor: '#D91D1A', headingFont: 'fredoka', bodyFont: 'poppins' },
  'merry': { bg: '#101A25', textColor: '#F3F6F9', accentColor: '#D3B560', headingFont: 'playfair', bodyFont: 'montserrat' },
  'fireworks': { bg: '#0E0B14', textColor: '#FCF7EB', accentColor: '#EF9488', headingFont: 'playfair', bodyFont: 'josefin' },
  'new-years-eve': { bg: '#181509', textColor: '#F7F1E6', accentColor: '#C59F5E', headingFont: 'cormorant', bodyFont: 'montserrat' },
  'dia-de-los-muertos': { bg: '#3B1E4A', textColor: '#FDF3E1', accentColor: '#FBB813', headingFont: 'fredoka', bodyFont: 'poppins' },
  'halloween-party': { bg: '#1F1D1E', textColor: '#EDE4D3', accentColor: '#F07F1E', headingFont: 'creepster', bodyFont: 'poppins' },
};

const FALLBACK: Preset = THEME_PRESETS['the-day'];

// The decorations a theme's invitation starts with
// (app/lib/invitation-ornaments.ts), chosen for each theme's mood. Only the
// starting design: saved invitations keep exactly what their host chose.
const THEME_DECOR: Record<string, { divider: string; frame: string }> = {
  // Weddings (and the formal business themes, from the same elegant set)
  'the-day': { divider: 'wedding-scroll', frame: '' },
  'love': { divider: 'wedding-heart', frame: 'wedding-pearls' }, // the same pearls as Quiet Coastal
  'nature': { divider: '', frame: '' }, // the watercolour greenery paper is decoration enough
  'wild-flores': { divider: 'wedding-vine', frame: '' },
  'forest': { divider: 'wedding-vine', frame: '' },
  'western': { divider: 'wedding-diamond', frame: 'wedding-classic' }, // the rowel star and a double rule
  'terracotta-harvest': { divider: 'wedding-eucalyptus', frame: 'wedding-classic' },
  'midnight-botanical': { divider: 'wedding-line', frame: 'wedding-double-rule' }, // fine gold lines, no loops
  'quiet-coastal': { divider: 'wedding-pearls', frame: 'wedding-pearls' },
  'vilma': { divider: 'wedding-rose', frame: '' },
  'summit': { divider: 'wedding-diamond', frame: 'wedding-geometric' },
  'nexus': { divider: 'wedding-deco', frame: '' },
  'dinner-gala': { divider: 'wedding-laurel', frame: '' },
  'simple': { divider: 'wedding-diamond', frame: '' }, // a small diamond, nothing more
  'blessings': { divider: 'wedding-laurel', frame: '' }, // an olive-like laurel sprig
  'community': { divider: 'wedding-bow', frame: 'wedding-arch' },
  // Celebrations
  'alegria': { divider: 'birthday-stars', frame: '' },
  'fun-party': { divider: 'birthday-confetti', frame: '' },
  'balloons': { divider: 'birthday-balloons', frame: '' }, // the balloon picture instead
  'baby-shower-girl': { divider: 'birthday-polka', frame: 'birthday-balloons' },
  'baby-shower-neutral': { divider: 'birthday-cake', frame: 'birthday-polka' },
  'baby-shower-boy': { divider: 'birthday-stars', frame: 'birthday-sparkle' },
  'antique-cars': { divider: 'birthday-streamers', frame: '' },
  // Christmas
  'christmas-party': { divider: 'christmas-evergreen', frame: '' },
  'white-christmas': { divider: 'christmas-snowflake', frame: 'christmas-snow' },
  'gnomes': { divider: 'christmas-holly', frame: '' }, // the gnome picture instead
  'merry': { divider: 'christmas-stars', frame: 'christmas-border' },
  // New Year's Eve and Fireworks
  'new-years-eve': { divider: 'birthday-stars', frame: 'wedding-deco' },
  'fireworks': { divider: 'birthday-confetti', frame: 'birthday-sparkle' }, // confetti and a sparkle border
  // Halloween and Día de los Muertos
  'halloween-party': { divider: 'halloween-bats', frame: 'halloween-webs' },
  'dia-de-los-muertos': { divider: 'birthday-papel', frame: '' },
};

// The starting wording, in the page's language.
const INVITATION_WORDS = {
  en: { eyebrow: 'You’re invited to', message: 'We would love for you to join us.\nPlease RSVP on our event page.', closing: 'We can’t wait to celebrate with you!' },
  fr: { eyebrow: 'Vous êtes invités à', message: 'Nous serions ravis de vous compter parmi nous.\nVeuillez répondre sur notre page d’événement.', closing: 'Nous avons hâte de célébrer avec vous !' },
  es: { eyebrow: 'Estás invitado a', message: 'Nos encantaría que nos acompañaras.\nConfirma tu asistencia en nuestra página del evento.', closing: '¡Estamos deseando celebrarlo contigo!' },
} as const;

export function defaultInvitation(themeSlug?: string | null, language?: string | null): InvitationDesign {
  const words = INVITATION_WORDS[language === 'fr' || language === 'es' ? language : 'en'];
  const p = (themeSlug && THEME_PRESETS[themeSlug]) || FALLBACK;
  const decor = (themeSlug && THEME_DECOR[themeSlug]) || THEME_DECOR['the-day'];
  return {
    headingFont: p.headingFont,
    bodyFont: p.bodyFont,
    eyebrow: words.eyebrow,
    message: words.message,
    closing: words.closing,
    textColor: p.textColor,
    accentColor: p.accentColor,
    background: THEME_PAPER[themeSlug ?? '']
      ? { kind: 'image', color: p.bg, imageUrl: THEME_PAPER[themeSlug ?? '']!, overlay: false, overlayColor: '#000000', overlayOpacity: 0 }
      : { kind: 'color', color: p.bg, imageUrl: '', overlay: true, overlayColor: '#000000', overlayOpacity: 0.35 },
    showQr: true,
    divider: decor.divider,
    dividerColor: p.accentColor,
    frame: decor.frame,
    frameColor: p.accentColor,
    picture: (themeSlug && THEME_PICTURE[themeSlug]) || '',
    layout: 'classic',
    photo: '',
    initials: '',
    eventName: '',
    eventDate: '',
    eventTime: '',
    eventVenue: '',
    eventAddress: '',
    flowers: 'peach',
    envelope: defaultEnvelope(themeSlug, p.bg, p.accentColor),
  };
}

// The envelope a theme starts with: its paper colour, the accent for the
// liner and the seal, and a liner and emblem for the occasion.
const ENVELOPE_BY_OCCASION: Record<string, { liner: EnvelopeLiner; seal: EnvelopeSeal }> = {
  wedding: { liner: 'leaves', seal: 'heart' },
  christmas: { liner: 'stripes', seal: 'star' },
  birthday: { liner: 'confetti', seal: 'star' },
  halloween: { liner: 'dots', seal: 'star' },
};
export function defaultEnvelope(themeSlug: string | null | undefined, paper: string, accent: string): InvitationEnvelope {
  const kind = ENVELOPE_BY_OCCASION[ornamentOccasion(themeSlug)] ?? ENVELOPE_BY_OCCASION.wedding;
  return { on: true, color: paper, liner: kind.liner, linerColor: accent, seal: kind.seal, sealColor: accent };
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const color = (v: unknown, fallback: string) => (typeof v === 'string' && HEX.test(v) ? v : fallback);
const text = (v: unknown, max: number, fallback: string) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').slice(0, max) : fallback);
const font = (v: unknown, fallback: InvitationFont): InvitationFont => (typeof v === 'string' && v in INVITATION_FONTS ? (v as InvitationFont) : fallback);

// Only images uploaded through MyGala's own storage (or local dev uploads).
// Papers we design ourselves for a theme's starting invitation: already
// light where the words go, so they need no wash; textLeft moves the words
// right (a share of the card's width, cqw) to clear the artwork on the left.
// box, when set, is the blank area of the artwork the words sit in: the space
// kept clear on each side, in cqw (the card is 100 wide and 140 tall).
export const INVITATION_PAPERS: Record<string, { textLeft: number; box?: { top: number; right: number; bottom: number; left: number } }> = {
  '/images/invitations/nature-greenery.jpg': { textLeft: 0 },
};

// An image the host uploaded (not one of our papers or theme photos).
export const isOwnUpload = (v: string) => !!v && !v.startsWith('/images/');

export function isInvitationImageUrl(v: unknown): v is string {
  if (typeof v !== 'string' || !v) return false;
  if (v in INVITATION_PAPERS) return true;
  // Our own theme photos and invitation art (the design catalog).
  if (/^\/images\/(themes|invitations)\/[\w-]+(\/[\w-]+)*\.(jpe?g|png|webp)$/i.test(v)) return true;
  if (v.startsWith('/uploads/')) return /^\/uploads\/[\w.-]+$/.test(v);
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

// Cleans any input (saved JSON, a client payload) into a valid design,
// falling back to the theme's defaults field by field.
export function normalizeInvitation(raw: unknown, themeSlug?: string | null, language?: string | null): InvitationDesign {
  const d = defaultInvitation(themeSlug, language);
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>;
  const bg = (r.background && typeof r.background === 'object' ? r.background : {}) as Record<string, unknown>;
  const imageUrl = isInvitationImageUrl(bg.imageUrl) ? bg.imageUrl : '';
  const opacity = Number(bg.overlayOpacity);
  return {
    headingFont: font(r.headingFont, d.headingFont),
    bodyFont: font(r.bodyFont, d.bodyFont),
    eyebrow: text(r.eyebrow, INVITATION_TEXT_MAX.eyebrow, d.eyebrow),
    message: text(r.message, INVITATION_TEXT_MAX.message, d.message),
    closing: text(r.closing, INVITATION_TEXT_MAX.closing, d.closing),
    textColor: color(r.textColor, d.textColor),
    accentColor: color(r.accentColor, d.accentColor),
    background: {
      kind: bg.kind === 'image' && imageUrl ? 'image' : 'color',
      color: color(bg.color, d.background.color),
      imageUrl,
      overlay: typeof bg.overlay === 'boolean' ? bg.overlay : d.background.overlay,
      overlayColor: color(bg.overlayColor, d.background.overlayColor),
      overlayOpacity: Number.isFinite(opacity) ? Math.min(Math.max(opacity, 0), 0.9) : d.background.overlayOpacity,
    },
    showQr: typeof r.showQr === 'boolean' ? r.showQr : d.showQr,
    divider: typeof r.divider === 'string' && findOrnament('divider', r.divider) ? r.divider : '',
    dividerColor: color(r.dividerColor, color(r.accentColor, d.dividerColor)),
    frame: typeof r.frame === 'string' && findOrnament('frame', r.frame) ? r.frame : '',
    frameColor: color(r.frameColor, color(r.accentColor, d.frameColor)),
    // Saved designs from before pictures existed keep looking as they did.
    picture: isInvitationPicture(r.picture) ? r.picture : '',
    // "Your own design" needs the host's own uploaded image.
    layout: r.layout === 'own'
      ? (bg.kind === 'image' && isOwnUpload(imageUrl) ? 'own' : 'classic')
      : INVITATION_LAYOUTS.includes(r.layout as InvitationLayout) ? (r.layout as InvitationLayout) : 'classic',
    photo: isInvitationImageUrl(r.photo) ? r.photo : '',
    initials: text(r.initials, INVITATION_TEXT_MAX.initials, '').replace(/\s+/g, ' ').trim(),
    eventName: text(r.eventName, INVITATION_TEXT_MAX.eventName, '').trim(),
    eventDate: text(r.eventDate, INVITATION_TEXT_MAX.eventDate, '').trim(),
    eventTime: text(r.eventTime, INVITATION_TEXT_MAX.eventTime, '').trim(),
    eventVenue: text(r.eventVenue, INVITATION_TEXT_MAX.eventVenue, '').trim(),
    eventAddress: text(r.eventAddress, INVITATION_TEXT_MAX.eventAddress, '').trim(),
    flowers: isFlowerTone(r.flowers) ? r.flowers : d.flowers,
    envelope: (() => {
      const e = (r.envelope && typeof r.envelope === 'object' ? r.envelope : {}) as Record<string, unknown>;
      // Designs saved before envelopes existed take their colours from the design.
      const base = r.envelope ? d.envelope : defaultEnvelope(themeSlug, color(bg.color, d.envelope.color), color(r.accentColor, d.envelope.sealColor));
      return {
        on: typeof e.on === 'boolean' ? e.on : base.on,
        color: color(e.color, base.color),
        liner: isEnvelopeLiner(e.liner) ? e.liner : base.liner,
        linerColor: color(e.linerColor, base.linerColor),
        // The leaf seal became the balloon.
        seal: e.seal === 'leaf' ? 'balloon' : isEnvelopeSeal(e.seal) ? e.seal : base.seal,
        sealColor: color(e.sealColor, base.sealColor),
      };
    })(),
  };
}

const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const luminance = (hex: string) => {
  const [r, g, b] = hexRgb(hex).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// The accent colour for words (the event name, the closing line), readable
// on what's behind them: when the accent is too faint there (below 3.5:1 on
// a plain colour, 4.5:1 on a photo — these are often thin script fonts), it's blended toward the text colour
// just enough to read, keeping as much of its hue as it can. Frames and
// dividers keep the accent as chosen.
export function readableAccent(design: InvitationDesign): string {
  // On a photo, what's behind the words is mostly the wash's colour — but
  // some of the photo shows through, so it needs more contrast (4.5:1).
  const overlay = invitationOverlay(design);
  const behind = overlay?.color ?? design.background.color;
  const target = overlay ? 4.5 : 3.5;
  if (contrast(design.accentColor, behind) >= target) return design.accentColor;
  const [a, t] = [hexRgb(design.accentColor), hexRgb(design.textColor)];
  for (let step = 1; step <= 10; step++) {
    const mixed = `#${a.map((v, i) => Math.round(v + ((t[i] - v) * step) / 10).toString(16).padStart(2, '0')).join('')}`;
    if (contrast(mixed, behind) >= target) return mixed;
  }
  return design.textColor;
}

// The colour wash over a photo background, made strong enough for the words
// to read clearly whatever the photo: at least 65%, in a colour that stands
// apart from the text (dark for light text, light for dark text), and on even
// when the host turned it off. null on a plain colour, which needs none.
// Shared by the card (preview, print, PDF) and the email.
export const MIN_PHOTO_WASH = 0.65;
export function invitationOverlay(design: InvitationDesign): { color: string; opacity: number } | null {
  const bg = design.background;
  if (bg.kind !== 'image' || !bg.imageUrl || design.layout === 'own') return null;
  // Our own papers are light where the words go: only the host's own wash, if any.
  if (bg.imageUrl in INVITATION_PAPERS) return bg.overlay && bg.overlayOpacity > 0 ? { color: bg.overlayColor, opacity: bg.overlayOpacity } : null;
  const lightText = luminance(design.textColor) > 0.4;
  let color = bg.overlay ? bg.overlayColor : lightText ? '#000000' : bg.color;
  if (contrast(color, design.textColor) < 4.5) color = lightText ? '#000000' : luminance(bg.color) > 0.4 ? bg.color : '#FFFFFF';
  if (contrast(color, design.textColor) < 4.5) color = lightText ? '#000000' : '#FFFFFF';
  return { color, opacity: Math.max(bg.overlay ? bg.overlayOpacity : 0, MIN_PHOTO_WASH) };
}

export function googleFontsHref(fonts: InvitationFont[]): string {
  const families = [...new Set(fonts)].map((f) => `family=${INVITATION_FONTS[f].google}`).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

// The event's facts as the invitation shows them: the host's own wording
// from the Words step where there is one, else the event page's.
export function withInvitationText<T extends InvitationDetails>(details: T, design: Pick<InvitationDesign, 'eventName' | 'eventDate' | 'eventTime' | 'eventVenue' | 'eventAddress'>): T {
  return {
    ...details,
    name: design.eventName || details.name,
    date: design.eventDate || details.date,
    time: design.eventTime || details.time,
    venue: design.eventVenue || details.venue,
    address: design.eventAddress || details.address,
  };
}
