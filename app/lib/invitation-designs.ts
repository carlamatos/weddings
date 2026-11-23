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
export type InvitationLook = Omit<InvitationDesign, 'eyebrow' | 'message' | 'closing' | 'showQr' | 'envelope' | 'photo' | 'initials' | 'eventName' | 'eventDate' | 'eventTime' | 'eventVenue' | 'eventAddress'>;

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
export type DesignStyle = 'wedding-engraved-scroll' | 'wedding-green-filigree' | 'wedding-baroque-frame' | 'wedding-flower-wall' | 'wedding-eucalyptus' | 'wedding-mandala' | 'wedding-gold-flourish' | 'wedding-gold-wreath' | 'wedding-rose-marble' | 'christmas-evergreen' | 'christmas-candy-baubles' | 'christmas-rustic' | 'christmas-red-ribbon' | 'birthday-candles' | 'birthday-party-table' | 'birthday-bunting' | 'birthday-confetti' | 'birthday-blue-balloons' | 'birthday-cake' | 'garden-scroll' | 'rustic-lace' | 'wildflower-meadow' | 'victorian' | 'white-gold' | 'paper-blooms' | 'white-roses' | 'portrait';
export type DesignTone = 'classic' | 'charcoal' | 'blush' | 'sage' | 'champagne' | 'peach' | 'ivory' | 'lilac' | 'linen' | 'rose-gold' | 'walnut';

const solid = (color: string): InvitationLook['background'] => ({ kind: 'color', color, imageUrl: '', overlay: false, overlayColor: '#000000', overlayOpacity: 0 });
// paper: one of our papers (INVITATION_PAPERS) under the words; bg is then
// what shows while it loads.
const styleLook = (l: Pick<InvitationLook, 'headingFont' | 'bodyFont' | 'textColor' | 'accentColor' | 'layout'> & { bg: string; paper?: string; frame?: string; divider?: string; flowers?: InvitationLook['flowers'] }): InvitationLook => ({
  headingFont: l.headingFont, bodyFont: l.bodyFont, textColor: l.textColor, accentColor: l.accentColor, layout: l.layout, flowers: l.flowers ?? 'peach',
  background: l.paper ? { ...solid(l.bg), kind: 'image', imageUrl: l.paper } : solid(l.bg), divider: l.divider ?? '', dividerColor: l.accentColor, frame: l.frame ?? '', frameColor: l.accentColor, picture: '',
});

const bday = (name: string) => `/images/invitations/birthday-${name}.jpeg`;
const xmas = (name: string) => `/images/invitations/christmas-${name}.jpeg`;
const wed = (name: string) => `/images/invitations/wedding-${name}.jpeg`;
const DESIGN_STYLES: { style: DesignStyle; group: DesignGroup; tones: [DesignTone, InvitationLook][] }[] = [
  // The wedding, birthday (Party) and Christmas (Holiday) papers: photos and cutouts
  // MyGala licensed from Adobe Stock, set on card-shaped papers with room
  // for the words.
  { style: 'wedding-gold-wreath', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('gold-wreath'), headingFont: 'great-vibes', bodyFont: 'montserrat', bg: '#FFFCF7', textColor: '#4B3B2E', accentColor: '#B07E32' })]] },
  { style: 'wedding-flower-wall', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('flower-wall'), headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#F3F2F0', textColor: '#45403F', accentColor: '#A85C70' })]] },
  { style: 'wedding-gold-flourish', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('gold-flourish'), headingFont: 'great-vibes', bodyFont: 'cinzel', bg: '#13203A', textColor: '#F1E7D6', accentColor: '#D9B062' })]] },
  { style: 'wedding-rose-marble', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('rose-marble'), headingFont: 'parisienne', bodyFont: 'montserrat', bg: '#FFF7F5', textColor: '#4A3340', accentColor: '#A4566A' })]] },
  { style: 'wedding-engraved-scroll', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('engraved-scroll'), headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#FFFFFF', textColor: '#3A2E24', accentColor: '#9C7A3C' })]] },
  { style: 'wedding-green-filigree', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('green-filigree'), headingFont: 'great-vibes', bodyFont: 'lato', bg: '#FFFFFF', textColor: '#26392C', accentColor: '#4C7A55' })]] },
  { style: 'wedding-baroque-frame', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('baroque-frame'), headingFont: 'playfair', bodyFont: 'cormorant', bg: '#FBF7EF', textColor: '#2A2522', accentColor: '#5E4E3E' })]] },
  { style: 'wedding-eucalyptus', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('eucalyptus'), headingFont: 'parisienne', bodyFont: 'cormorant', bg: '#F2F2F3', textColor: '#3D4A3A', accentColor: '#5F7C55' })]] },
  { style: 'wedding-mandala', group: 'wedding', tones: [['classic', styleLook({ layout: 'classic', paper: wed('mandala'), headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#FBF4E6', textColor: '#6E0F33', accentColor: '#A8236A' })]] },
  { style: 'christmas-evergreen', group: 'holiday', tones: [['classic', styleLook({ layout: 'classic', paper: xmas('evergreen'), headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#F1F1F2', textColor: '#23402E', accentColor: '#B01E2A' })]] },
  { style: 'christmas-red-ribbon', group: 'holiday', tones: [['classic', styleLook({ layout: 'classic', paper: xmas('red-ribbon'), headingFont: 'great-vibes', bodyFont: 'cormorant', bg: '#123F2B', textColor: '#F7F0E1', accentColor: '#E8C77E' })]] },
  { style: 'christmas-rustic', group: 'holiday', tones: [['classic', styleLook({ layout: 'classic', paper: xmas('rustic'), headingFont: 'great-vibes', bodyFont: 'montserrat', bg: '#3A281C', textColor: '#FFFFFF', accentColor: '#F4E7D0' })]] },
  { style: 'christmas-candy-baubles', group: 'holiday', tones: [['classic', styleLook({ layout: 'classic', paper: xmas('candy-baubles'), headingFont: 'playfair', bodyFont: 'lato', bg: '#FFFFFF', textColor: '#2E2A2A', accentColor: '#C4122F' })]] },
  { style: 'birthday-cake', group: 'party', tones: [['classic', styleLook({ layout: 'classic', paper: bday('cake'), headingFont: 'dancing-script', bodyFont: 'poppins', bg: '#FFF3F5', textColor: '#4A3040', accentColor: '#D63F78' })]] },
  { style: 'birthday-party-table', group: 'party', tones: [['classic', styleLook({ layout: 'classic', paper: bday('party-table'), headingFont: 'fredoka', bodyFont: 'poppins', bg: '#CFE7EC', textColor: '#26394A', accentColor: '#C93A72' })]] },
  { style: 'birthday-bunting', group: 'party', tones: [['classic', styleLook({ layout: 'classic', paper: bday('bunting'), headingFont: 'fredoka', bodyFont: 'poppins', bg: '#FFFAF2', textColor: '#3A3346', accentColor: '#D9423B' })]] },
  { style: 'birthday-blue-balloons', group: 'party', tones: [['classic', styleLook({ layout: 'classic', paper: bday('blue-balloons'), headingFont: 'playfair', bodyFont: 'montserrat', bg: '#143764', textColor: '#FFFFFF', accentColor: '#A9D4FF' })]] },
  { style: 'birthday-confetti', group: 'party', tones: [['classic', styleLook({ layout: 'classic', paper: bday('confetti'), headingFont: 'dancing-script', bodyFont: 'poppins', bg: '#FFFFFF', textColor: '#2C2440', accentColor: '#CC1F78' })]] },
  { style: 'birthday-candles', group: 'party', tones: [['classic', styleLook({ layout: 'classic', paper: bday('candles'), headingFont: 'parisienne', bodyFont: 'montserrat', bg: '#FFFBF5', textColor: '#40345A', accentColor: '#7F4AB0' })]] },
  // Garden Scroll: our engraved frame of scrolls, leaves and blossoms in
  // one ink on white paper (layout 'garden').
  {
    style: 'garden-scroll',
    group: 'wedding',
    tones: [
      ['classic', styleLook({ layout: 'garden', headingFont: 'cormorant', bodyFont: 'cormorant', bg: '#FFFFFF', textColor: '#9A7436', accentColor: '#A57B37' })],
      ['ivory', styleLook({ layout: 'garden', headingFont: 'cormorant', bodyFont: 'cormorant', bg: '#FBF7EE', textColor: '#8E6C33', accentColor: '#9B7536' })],
      ['sage', styleLook({ layout: 'garden', headingFont: 'cormorant', bodyFont: 'cormorant', bg: '#FAFAF6', textColor: '#56684D', accentColor: '#617558' })],
    ],
  },
  // Rustic Lace: dark wood planks with white lace flowers in two corners
  // (layout 'lace'); the paper colour tints the wood. One colourway: walnut.
  {
    style: 'rustic-lace',
    group: 'wedding',
    tones: [
      ['walnut', styleLook({ layout: 'lace', headingFont: 'cormorant', bodyFont: 'montserrat', bg: '#5A3F2E', textColor: '#FFFFFF', accentColor: '#F7F2EA' })],
    ],
  },
  // Wildflower Meadow: watercolour wildflower garlands top and bottom on
  // white, the name in calligraphy (layout 'meadow').
  {
    style: 'wildflower-meadow',
    group: 'wedding',
    tones: [
      ['classic', styleLook({ layout: 'meadow', headingFont: 'parisienne', bodyFont: 'cormorant', bg: '#FFFFFF', textColor: '#5A5550', accentColor: '#4A4642' })],
      ['ivory', styleLook({ layout: 'meadow', headingFont: 'parisienne', bodyFont: 'cormorant', bg: '#FBF8F1', textColor: '#5A5550', accentColor: '#4A4642' })],
    ],
  },
  // Victorian Emboss: slate-blue paper with Victorian flourishes raised in
  // the paper itself, the words in near-white (layout 'embossed').
  {
    style: 'victorian',
    group: 'wedding',
    tones: [
      ['classic', styleLook({ layout: 'embossed', headingFont: 'cormorant', bodyFont: 'libre-baskerville', bg: '#74859A', textColor: '#F5F5F5', accentColor: '#F5F5F5' })],
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
      ['classic', styleLook({ layout: 'portrait', headingFont: 'dancing-script', bodyFont: 'playfair', bg: '#FFFFFF', textColor: '#2A2A2A', accentColor: '#A88A4E' })],
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
  envelope: look.layout === 'embossed'
    // Victorian Emboss: a light envelope (the letters' colour) closed with a
    // seal in the paper's colour.
    ? { ...design.envelope, color: look.textColor, linerColor: look.background.color, sealColor: look.background.color }
    : { ...design.envelope, color: look.layout === 'own' ? design.envelope.color : look.background.color, linerColor: look.accentColor, sealColor: look.accentColor },
});

export const sameLook = (design: InvitationDesign, look: InvitationLook) => JSON.stringify(lookOf(design)) === JSON.stringify(look);

// Banners that don't suit the words on top: Nature's starting design is
// already its watercolour paper, and these show people's faces.
const NO_PHOTO = new Set(['nature', 'forest', 'quiet-coastal', 'community', 'dia-de-los-muertos']);
// Themes whose invitation photo isn't their banner.
// baby-shower-neutral: the right of its banner cut to the card's shape, so
// the bunny shows (the middle of the banner is bare wood).
// midnight-botanical: its woods with the couple painted out (the path left
// empty in the mist), cut to the card's shape.
const PHOTO_OVERRIDE: Partial<Record<string, string>> = { merry: '/images/invitations/merry-village.jpeg', 'baby-shower-neutral': '/images/invitations/baby-shower-bunny.jpeg', 'midnight-botanical': '/images/invitations/midnight-woods.jpeg' };

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
  'the-day': { headingFont: 'great-vibes', bodyFont: 'cormorant', divider: 'flourish-7', frame: 'wedding-ribbon' }, // Looped ribbon
  love: { divider: 'flourish-17', frame: 'wedding-floral' }, // Dotted scroll
  nature: { background: { kind: 'color', color: '#F4F1EA', imageUrl: '', overlay: false, overlayColor: '#000000', overlayOpacity: 0 }, divider: 'flourish-21', frame: 'wedding-arch' }, // Swash
  'wild-flores': { divider: 'flourish-8', frame: 'wedding-floral' }, // Scroll line
  forest: { divider: 'wedding-stem', frame: 'wedding-rule' },
  western: { divider: 'flourish-19', frame: 'wedding-scallop' }, // Grand flourish
  'terracotta-harvest': { divider: 'wedding-laurel', frame: 'wedding-arch' },
  'midnight-botanical': { divider: 'wedding-deco-line', frame: 'wedding-deco-rule' },
  'quiet-coastal': { divider: 'flourish-11', frame: 'wedding-scallop' }, // Spiral line, like waves
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
