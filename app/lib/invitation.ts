// The invitation designer (every plan). The host chooses fonts, wording, colours
// and the background; the event's name, date, time and place always come
// from the page (changed only in Edit Page). Stored as JSON in
// user_page_settings under INVITATION_SETTING. Shared by the dashboard, the
// server action and the print view, so no server-only imports.

import { findOrnament } from './invitation-ornaments';

export const INVITATION_SETTING = 'invitation_design';

export const INVITATION_FONTS = {
  'great-vibes': { label: 'Great Vibes (script)', family: "'Great Vibes', cursive", google: 'Great+Vibes' },
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
};

export const INVITATION_TEXT_MAX = { eyebrow: 80, message: 600, closing: 160 } as const;

// The host's personal note for one guest (Guests → Invitations).
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
};

type Preset = Pick<InvitationDesign, 'headingFont' | 'bodyFont' | 'textColor' | 'accentColor'> & { bg: string };

// A starting design per theme, in that theme's colours and type mood.
const THEME_PRESETS: Record<string, Preset> = {
  'the-day': { bg: '#F6F2E9', textColor: '#33402F', accentColor: '#9C7C3C', headingFont: 'cormorant', bodyFont: 'lato' },
  'love': { bg: '#FBE4E2', textColor: '#5A2D3A', accentColor: '#B23A5B', headingFont: 'great-vibes', bodyFont: 'cormorant' },
  'nature': { bg: '#ECEEEE', textColor: '#2A231E', accentColor: '#2D4130', headingFont: 'parisienne', bodyFont: 'cormorant' },
  'wild-flores': { bg: '#EEE3DD', textColor: '#3E3A2C', accentColor: '#BE7922', headingFont: 'playfair', bodyFont: 'lato' },
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
  'community': { bg: '#F6E0BD', textColor: '#1F2E4D', accentColor: '#D9472B', headingFont: 'playfair', bodyFont: 'lato' },
  'antique-cars': { bg: '#2E1A47', textColor: '#FFF4DC', accentColor: '#F2C230', headingFont: 'cinzel', bodyFont: 'montserrat' },
  'christmas-party': { bg: '#2C3138', textColor: '#F4EDE1', accentColor: '#C8372D', headingFont: 'dancing-script', bodyFont: 'lato' },
  'white-christmas': { bg: '#DAE4F0', textColor: '#23415E', accentColor: '#B89B4F', headingFont: 'cormorant', bodyFont: 'lato' },
  'gnomes': { bg: '#F0E5DD', textColor: '#476735', accentColor: '#D91D1A', headingFont: 'fredoka', bodyFont: 'poppins' },
  'merry': { bg: '#101A25', textColor: '#F3F6F9', accentColor: '#D3B560', headingFont: 'playfair', bodyFont: 'montserrat' },
  'dia-de-los-muertos': { bg: '#3B1E4A', textColor: '#FDF3E1', accentColor: '#FBB813', headingFont: 'fredoka', bodyFont: 'poppins' },
  'halloween-party': { bg: '#1F1D1E', textColor: '#EDE4D3', accentColor: '#F07F1E', headingFont: 'creepster', bodyFont: 'poppins' },
};

const FALLBACK: Preset = THEME_PRESETS['the-day'];

// The decorations a theme's invitation starts with
// (app/lib/invitation-ornaments.ts), chosen for each theme's mood. Only the
// starting design: saved invitations keep exactly what their host chose.
const THEME_DECOR: Record<string, { divider: string; frame: string }> = {
  // Weddings (and the formal business themes, from the same elegant set)
  'the-day': { divider: 'wedding-scroll', frame: 'wedding-classic' },
  'love': { divider: 'wedding-heart', frame: 'wedding-floral' },
  'nature': { divider: 'wedding-fern', frame: '' }, // no frame: the fern divider alone
  'wild-flores': { divider: 'wedding-vine', frame: 'wedding-vine' },
  'terracotta-harvest': { divider: 'wedding-eucalyptus', frame: 'wedding-eucalyptus' },
  'midnight-botanical': { divider: 'wedding-filigree', frame: 'wedding-filigree' },
  'quiet-coastal': { divider: 'wedding-pearls', frame: 'wedding-pearls' },
  'vilma': { divider: 'wedding-rose', frame: 'wedding-rose' },
  'summit': { divider: 'wedding-diamond', frame: 'wedding-geometric' },
  'nexus': { divider: 'wedding-deco', frame: 'wedding-deco' },
  'dinner-gala': { divider: 'wedding-laurel', frame: 'wedding-laurel' },
  'community': { divider: 'wedding-bow', frame: 'wedding-arch' },
  // Celebrations
  'alegria': { divider: 'birthday-crown', frame: 'birthday-crown' },
  'fun-party': { divider: 'birthday-confetti', frame: 'birthday-confetti' },
  'balloons': { divider: 'birthday-balloons', frame: 'birthday-bunting' },
  'baby-shower-girl': { divider: 'birthday-polka', frame: 'birthday-balloons' },
  'baby-shower-neutral': { divider: 'birthday-cake', frame: 'birthday-polka' },
  'baby-shower-boy': { divider: 'birthday-stars', frame: 'birthday-sparkle' },
  'antique-cars': { divider: 'birthday-streamers', frame: 'birthday-streamers' },
  // Christmas
  'christmas-party': { divider: 'christmas-evergreen', frame: 'christmas-garland' },
  'white-christmas': { divider: 'christmas-snowflake', frame: 'christmas-snow' },
  'gnomes': { divider: 'christmas-holly', frame: 'christmas-holly' },
  'merry': { divider: 'christmas-stars', frame: 'christmas-stars' },
  // Halloween and Día de los Muertos
  'halloween-party': { divider: 'halloween-bats', frame: 'halloween-webs' },
  'dia-de-los-muertos': { divider: 'birthday-papel', frame: 'birthday-papel' },
};

export function defaultInvitation(themeSlug?: string | null): InvitationDesign {
  const p = (themeSlug && THEME_PRESETS[themeSlug]) || FALLBACK;
  const decor = (themeSlug && THEME_DECOR[themeSlug]) || THEME_DECOR['the-day'];
  return {
    headingFont: p.headingFont,
    bodyFont: p.bodyFont,
    eyebrow: 'You’re invited to',
    message: 'We would love for you to join us. Please RSVP on our event page.',
    closing: 'We can’t wait to celebrate with you!',
    textColor: p.textColor,
    accentColor: p.accentColor,
    background: { kind: 'color', color: p.bg, imageUrl: '', overlay: true, overlayColor: '#000000', overlayOpacity: 0.35 },
    showQr: true,
    divider: decor.divider,
    dividerColor: p.accentColor,
    frame: decor.frame,
    frameColor: p.accentColor,
  };
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const color = (v: unknown, fallback: string) => (typeof v === 'string' && HEX.test(v) ? v : fallback);
const text = (v: unknown, max: number, fallback: string) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').slice(0, max) : fallback);
const font = (v: unknown, fallback: InvitationFont): InvitationFont => (typeof v === 'string' && v in INVITATION_FONTS ? (v as InvitationFont) : fallback);

// Only images uploaded through MyGala's own storage (or local dev uploads).
export function isInvitationImageUrl(v: unknown): v is string {
  if (typeof v !== 'string' || !v) return false;
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
export function normalizeInvitation(raw: unknown, themeSlug?: string | null): InvitationDesign {
  const d = defaultInvitation(themeSlug);
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
  if (bg.kind !== 'image' || !bg.imageUrl) return null;
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
