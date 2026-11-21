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
export type InvitationLook = Omit<InvitationDesign, 'eyebrow' | 'message' | 'closing' | 'showQr' | 'envelope'>;

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
  id: string; // `${theme}` or `${theme}-${variant}`
  theme: string;
  themeName: string;
  variant: DesignVariant;
  group: DesignGroup;
  look: InvitationLook;
};

const LOOK_KEYS = ['headingFont', 'bodyFont', 'textColor', 'accentColor', 'background', 'divider', 'dividerColor', 'frame', 'frameColor', 'picture', 'layout'] as const satisfies readonly (keyof InvitationLook)[];

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
  nature: { background: { kind: 'color', color: '#F4F1EA', imageUrl: '', overlay: false, overlayColor: '#000000', overlayOpacity: 0 }, divider: 'wedding-fern', frame: 'wedding-fern' },
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
