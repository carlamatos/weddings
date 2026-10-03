// Plus: the invitation designer. The host chooses fonts, wording, colours
// and the background; the event's name, date, time and place always come
// from the page (changed only in Edit Page). Stored as JSON in
// user_page_settings under INVITATION_SETTING. Shared by the dashboard, the
// server action and the print view, so no server-only imports.

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
};

type Preset = Pick<InvitationDesign, 'headingFont' | 'bodyFont' | 'textColor' | 'accentColor'> & { bg: string };

// A starting design per theme, in that theme's colours and type mood.
const THEME_PRESETS: Record<string, Preset> = {
  'the-day': { bg: '#F6F2E9', textColor: '#33402F', accentColor: '#9C7C3C', headingFont: 'cormorant', bodyFont: 'lato' },
  'love': { bg: '#FBE4E2', textColor: '#5A2D3A', accentColor: '#B23A5B', headingFont: 'great-vibes', bodyFont: 'cormorant' },
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
  'summit': { bg: '#14171C', textColor: '#E8ECF2', accentColor: '#2F5DFF', headingFont: 'space-grotesk', bodyFont: 'space-grotesk' },
  'nexus': { bg: '#1D2124', textColor: '#E7E3DA', accentColor: '#E8A33D', headingFont: 'montserrat', bodyFont: 'lato' },
  'dinner-gala': { bg: '#0A1420', textColor: '#EDE3CC', accentColor: '#C9A24B', headingFont: 'cinzel', bodyFont: 'cormorant' },
  'community': { bg: '#F6E0BD', textColor: '#1F2E4D', accentColor: '#D9472B', headingFont: 'playfair', bodyFont: 'lato' },
  'antique-cars': { bg: '#57C0B9', textColor: '#2E1A47', accentColor: '#F2C230', headingFont: 'cinzel', bodyFont: 'montserrat' },
  'christmas-party': { bg: '#2C3138', textColor: '#F4EDE1', accentColor: '#C8372D', headingFont: 'dancing-script', bodyFont: 'lato' },
  'white-christmas': { bg: '#DAE4F0', textColor: '#23415E', accentColor: '#B89B4F', headingFont: 'cormorant', bodyFont: 'lato' },
  'dia-de-los-muertos': { bg: '#3B1E4A', textColor: '#FDF3E1', accentColor: '#FBB813', headingFont: 'fredoka', bodyFont: 'poppins' },
  'halloween-party': { bg: '#1F1D1E', textColor: '#EDE4D3', accentColor: '#F07F1E', headingFont: 'creepster', bodyFont: 'poppins' },
};

const FALLBACK: Preset = THEME_PRESETS['the-day'];

export function defaultInvitation(themeSlug?: string | null): InvitationDesign {
  const p = (themeSlug && THEME_PRESETS[themeSlug]) || FALLBACK;
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
  };
}

export function googleFontsHref(fonts: InvitationFont[]): string {
  const families = [...new Set(fonts)].map((f) => `family=${INVITATION_FONTS[f].google}`).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
