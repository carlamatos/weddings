// The invitation design catalog (Invitations → Choose a design): ready-made
// looks the host starts from. A design is everything about the card except
// the host's own words (eyebrow, message, closing) and the QR choice, so
// picking one never loses what they wrote. Built from each theme's starting
// design (app/lib/invitation.ts) plus a few variations on it: its banner photo
// under a wash, the monogram layout, and a framed version. Every piece is our
// own: the themes' photos and the line-art ornaments
// (app/lib/invitation-ornaments.ts). New artwork goes in INVITATION_PAPERS and
// gets a design here. Client-safe: no server imports.
import { defaultInvitation, type InvitationDesign } from './invitation';
import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';

// The look: what a design sets. The words, the QR choice and the envelope's
// liner and emblem stay the host's (its colours follow the design).
export type InvitationLook = Omit<InvitationDesign, 'eyebrow' | 'message' | 'closing' | 'showQr' | 'envelope' | 'photo' | 'initials'>;

export type DesignGroup = 'wedding' | 'party' | 'baby' | 'holiday' | 'business';
export const DESIGN_GROUPS: DesignGroup[] = ['wedding', 'party', 'baby', 'holiday', 'business'];

const GROUP_OF: Record<string, DesignGroup> = {
  'the-day': 'wedding', love: 'wedding', nature: 'wedding', 'wild-flores': 'wedding', forest: 'wedding',
  western: 'wedding', 'terracotta-harvest': 'wedding', 'midnight-botanical': 'wedding', 'quiet-coastal': 'wedding', vilma: 'wedding',
  alegria: 'party', 'fun-party': 'party', balloons: 'party', 'antique-cars': 'party', 'new-years-eve': 'party', fireworks: 'party',
  'baby-shower-girl': 'baby', 'baby-shower-neutral': 'baby', 'baby-shower-boy': 'baby',
  'christmas-party': 'holiday', 'white-christmas': 'holiday', merry: 'holiday', gnomes: 'holiday',
  'halloween-party': 'holiday', 'dia-de-los-muertos': 'holiday',
  summit: 'business', nexus: 'business', 'dinner-gala': 'business', simple: 'business', blessings: 'business', community: 'business',
};
export const designGroupOf = (themeSlug?: string | null): DesignGroup => (themeSlug && GROUP_OF[themeSlug]) || 'wedding';

// base: the theme's starting design. photo: on the theme's banner photo.
// monogram: the initials in a wreath (weddings). framed: an ornament frame.
export type DesignVariant = 'base' | 'photo' | 'monogram' | 'framed';

export type CatalogDesign = {
  id: string; // `${theme}` or `${theme}-${variant}`, or `${style}-${tone}`
  theme: string; // '' for a style (not tied to a theme)
  themeName: string;
  variant: DesignVariant;
  group: DesignGroup;
  look: InvitationLook;
  // A style of its own (DESIGN_STYLES): its name and colourway, shown in
  // the host's language (dash-text invitationDesigner.styles / tones).
  style?: DesignStyle;
  tone?: DesignTone;
};

// Styles: designs of their own, under an occasion but not tied to any theme.
// They come first in their occasion, before the theme designs. Each is one
// layout in a few colourways (tones).
export type DesignStyle = 'victorian' | 'white-gold' | 'paper-blooms' | 'white-roses' | 'portrait';
export type DesignTone = 'classic' | 'charcoal' | 'blush' | 'sage' | 'champagne' | 'peach' | 'ivory' | 'lilac' | 'linen' | 'rose-gold';

const solid = (color: string): InvitationLook['background'] => ({ kind: 'color', color, imageUrl: '', overlay: false, overlayColor: '#000000', overlayOpacity: 0 });
const styleLook = (l: Pick<InvitationLook, 'headingFont' | 'bodyFont' | 'textColor' | 'accentColor' | 'layout'> & { bg: string; frame?: string; divider?: string; flowers?: InvitationLook['flowers'] }): InvitationLook => ({
  headingFont: l.headingFont, bodyFont: l.bodyFont, textColor: l.textColor, accentColor: l.accentColor, layout: l.layout, flowers: l.flowers ?? 'peach',
  background: solid(l.bg), divider: l.divider ?? '', dividerColor: l.accentColor, frame: l.frame ?? '', frameColor: l.accentColor, picture: '',
});

const DESIGN_STYLES: { style: DesignStyle; group: DesignGroup; tones: [DesignTone, InvitationLook][] }[] = [
  // Victorian Emboss: white on white, a fine Victorian frame raised in the
  // paper itself, the words in black ink (layout 'embossed').
  {
    style: 'victorian',
    group: 'wedding',
    tones: [
      ['classic', styleLook({ layout: 'embossed', headingFont: 'cormorant', bodyFont: 'libre-baskerville', bg: '#FBFBF9', textColor: '#1C1C1C', accentColor: '#1C1C1C' })],
    ],
  },
  // White & Gold: white paper in a fine gold frame, the couple's initials in
  // calligraphy at the top, everything else in spaced gold capitals
  // (layout 'gilded').
  {
    style: 'white-gold',
    group: 'wedding',
    tones: [
      ['classic', styleLook({ layout: 'gilded', headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#FFFFFF', textColor: '#A8802F', accentColor: '#B48A33' })],
      ['ivory', styleLook({ layout: 'gilded', headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#FBF7EE', textColor: '#9C772C', accentColor: '#A98232' })],
      ['rose-gold', styleLook({ layout: 'gilded', headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#FFFFFF', textColor: '#A9695A', accentColor: '#B7735F' })],
    ],
  },
  // Paper Blooms: our flower cutouts in soft paper colours, raised off the
  // card with shadows, cascading down the right side (layout 'blooms').
  {
    style: 'paper-blooms',
    group: 'wedding',
    tones: [
      ['peach', styleLook({ layout: 'blooms', flowers: 'peach', headingFont: 'great-vibes', bodyFont: 'montserrat', bg: '#FBF3EC', textColor: '#3A2F2C', accentColor: '#B9604F' })],
      ['blush', styleLook({ layout: 'blooms', flowers: 'blush', headingFont: 'great-vibes', bodyFont: 'montserrat', bg: '#FBF1F2', textColor: '#3D2F33', accentColor: '#A8506A' })],
      ['ivory', styleLook({ layout: 'blooms', flowers: 'ivory', headingFont: 'great-vibes', bodyFont: 'montserrat', bg: '#F7F2EA', textColor: '#3A342C', accentColor: '#9A7840' })],
      ['lilac', styleLook({ layout: 'blooms', flowers: 'lilac', headingFont: 'great-vibes', bodyFont: 'montserrat', bg: '#F6F2F8', textColor: '#352F3D', accentColor: '#7E5A99' })],
    ],
  },
  // Portrait: the couple's photo in a circle inside a fine gold double ring, then
  // the names in spaced capitals (layout 'portrait'). Our sample couple until
  // the host uploads theirs.
  // White Roses: like Paper Blooms, with The Day's white roses (its rose
  // photo fading into the paper down the right side, white rose cutouts
  // raised over it) in The Day's colours and lettering.
  {
    style: 'white-roses',
    group: 'wedding',
    tones: [
      ['ivory', styleLook({ layout: 'blooms', flowers: 'roses', headingFont: 'cormorant', bodyFont: 'lato', bg: '#F6F2E9', textColor: '#33402F', accentColor: '#9C7C3C' })],
      ['sage', styleLook({ layout: 'blooms', flowers: 'roses', headingFont: 'cormorant', bodyFont: 'lato', bg: '#EEF0E6', textColor: '#20371D', accentColor: '#395036' })],
      ['linen', styleLook({ layout: 'blooms', flowers: 'roses', headingFont: 'cormorant', bodyFont: 'lato', bg: '#EFEEEA', textColor: '#33402F', accentColor: '#698B58' })],
    ],
  },
  {
    style: 'portrait',
    group: 'wedding',
    tones: [
      ['classic', styleLook({ layout: 'portrait', headingFont: 'mrs-saint-delafield', bodyFont: 'playfair', bg: '#FFFFFF', textColor: '#2A2A2A', accentColor: '#A88A4E' })],
      ['champagne', styleLook({ layout: 'portrait', headingFont: 'mrs-saint-delafield', bodyFont: 'playfair', bg: '#F3EADB', textColor: '#7A6235', accentColor: '#9A7840' })],
      ['sage', styleLook({ layout: 'portrait', headingFont: 'mrs-saint-delafield', bodyFont: 'playfair', bg: '#EDF0E8', textColor: '#3F4B38', accentColor: '#5E7150' })],
      ['blush', styleLook({ layout: 'portrait', headingFont: 'mrs-saint-delafield', bodyFont: 'playfair', bg: '#F7ECE7', textColor: '#5C4544', accentColor: '#B08A5A' })],
      ['charcoal', styleLook({ layout: 'portrait', headingFont: 'mrs-saint-delafield', bodyFont: 'playfair', bg: '#2B2B2E', textColor: '#EDE5D6', accentColor: '#C9A96A' })],
    ],
  },
];

const LOOK_KEYS = ['headingFont', 'bodyFont', 'textColor', 'accentColor', 'background', 'divider', 'dividerColor', 'frame', 'frameColor', 'picture', 'layout', 'flowers'] as const satisfies readonly (keyof InvitationLook)[];

export function lookOf(design: InvitationDesign): InvitationLook {
  const out = {} as Record<string, unknown>;
  for (const k of LOOK_KEYS) out[k] = design[k];
  return out as InvitationLook;
}

// The host's design with a catalog look: their words and QR choice kept, the
// envelope recoloured to match.
export const applyLook = (design: InvitationDesign, look: InvitationLook): InvitationDesign => ({
  ...design,
  ...look,
  background: { ...look.background },
  envelope: { ...design.envelope, color: look.layout === 'own' ? design.envelope.color : look.background.color, linerColor: look.accentColor, sealColor: look.accentColor },
});

export const sameLook = (design: InvitationDesign, look: InvitationLook) => JSON.stringify(lookOf(design)) === JSON.stringify(look);

// Banners that don't suit the words on top: Nature's starting design is
// already its watercolour paper, and these show people's faces.
const NO_PHOTO = new Set(['nature', 'forest', 'quiet-coastal', 'community', 'dia-de-los-muertos']);
// Themes whose invitation photo isn't their banner.
const PHOTO_OVERRIDE: Partial<Record<string, string>> = { merry: '/images/invitations/merry-village.jpeg' };

// Banner photos that work as an invitation background (no videos or SVG).
function photoOf(theme: string): string | null {
  const src = PHOTO_OVERRIDE[theme] ?? (HERO_DEFAULTS as Record<string, string>)[theme];
  if (!src || NO_PHOTO.has(theme) || !/\.(jpe?g|png|webp)$/i.test(src)) return null;
  return src;
}

// A stronger wash where the photo is busy behind the words.
const PHOTO_WASH: Partial<Record<string, number>> = { love: 0.85, 'fun-party': 0.82, alegria: 0.8 };

// The framed wedding designs: a frame (and a divider to go with it) from the
// same line-art set, chosen for each theme's mood.
const FRAMED: Partial<Record<string, Partial<InvitationLook>>> = {
  'the-day': { headingFont: 'great-vibes', bodyFont: 'cormorant', divider: 'wedding-rings', frame: 'wedding-ribbon' },
  love: { divider: 'wedding-rose', frame: 'wedding-floral' },
  nature: { background: { kind: 'color', color: '#F4F1EA', imageUrl: '', overlay: false, overlayColor: '#000000', overlayOpacity: 0 }, divider: 'wedding-diamond', frame: 'wedding-arch' },
  'wild-flores': { divider: 'wedding-vine', frame: 'wedding-floral' },
  forest: { divider: 'wedding-eucalyptus', frame: 'wedding-eucalyptus' },
  western: { divider: 'wedding-arrow', frame: 'wedding-scallop' },
  'terracotta-harvest': { divider: 'wedding-laurel', frame: 'wedding-arch' },
  'midnight-botanical': { divider: 'wedding-deco', frame: 'wedding-deco' },
  'quiet-coastal': { divider: 'wedding-scroll', frame: 'wedding-scallop' },
  vilma: { divider: 'wedding-rose', frame: 'wedding-rose' },
};

function buildCatalog(): CatalogDesign[] {
  const out: CatalogDesign[] = [];
  // One colourway of each style in turn, so the first cards show every style.
  const most = Math.max(...DESIGN_STYLES.map((s) => s.tones.length));
  for (let i = 0; i < most; i++) {
    for (const s of DESIGN_STYLES) {
      const entry = s.tones[i];
      if (entry) out.push({ id: `${s.style}-${entry[0]}`, theme: '', themeName: '', variant: 'base', group: s.group, look: entry[1], style: s.style, tone: entry[0] });
    }
  }
  for (const card of THEME_CARDS) {
    const theme = card.slug;
    const group = designGroupOf(theme);
    const base = lookOf(defaultInvitation(theme));
    const add = (variant: DesignVariant, look: InvitationLook) =>
      out.push({ id: variant === 'base' ? theme : `${theme}-${variant}`, theme, themeName: card.name, variant, group, look });

    add('base', base);

    const photo = photoOf(theme);
    if (photo) {
      const wash = PHOTO_WASH[theme] ?? 0.76;
      add('photo', { ...base, background: { kind: 'image', color: base.background.color, imageUrl: photo, overlay: true, overlayColor: base.background.color, overlayOpacity: wash } });
    }

    if (group === 'wedding') {
      const plain = base.background.kind === 'image'
        ? { kind: 'color' as const, color: '#FBF8F3', imageUrl: '', overlay: false, overlayColor: '#000000', overlayOpacity: 0 }
        : base.background;
      add('monogram', { ...base, layout: 'monogram', bodyFont: 'libre-baskerville', divider: '', frame: '', picture: '', background: plain });
      const framed = FRAMED[theme];
      if (framed) {
        const look = { ...base, ...framed, layout: 'classic' as const };
        look.dividerColor = look.accentColor;
        look.frameColor = look.accentColor;
        add('framed', look);
      }
    }
  }
  return out;
}

export const INVITATION_CATALOG: CatalogDesign[] = buildCatalog();
