import { normalizeInvitation } from './invitation';
import { INVITATION_CATALOG, lookOf, type CatalogDesign } from './invitation-designs';
import { en } from './dash-text/en';

// Admin → Activity → Invitation designs. A saved invitation doesn't record
// which gallery design it started from, only its look (fonts, colours,
// paper, layout, ornaments), so the design is worked out by comparing that
// look with every design in the gallery (app/lib/invitation-designs.ts).
// An exact match is that design; one where most of the look still matches is
// that design "edited"; anything further off is "Customised".

const t = en.invitationDesigner;
const KEYS = ['headingFont', 'bodyFont', 'textColor', 'accentColor', 'background', 'divider', 'dividerColor', 'frame', 'frameColor', 'picture', 'layout', 'flowers'] as const;

function designName(x: CatalogDesign): string {
  const name = x.style ? t.styles[x.style] : x.themeName;
  const variant = x.tone
    ? (x.style && INVITATION_CATALOG.filter((o) => o.style === x.style).length > 1 ? t.tones[x.tone] : '')
    : x.variant === 'photo' ? t.variantPhoto : x.variant === 'monogram' ? t.variantMonogram : x.variant === 'framed' ? t.variantFramed : '';
  return variant ? `${name} · ${variant}` : name;
}

export type IdentifiedDesign = { name: string; edited: boolean; custom: boolean };

export function identifyInvitationDesign(raw: string, themeSlug: string | null): IdentifiedDesign {
  let parsed: unknown = null;
  try { parsed = JSON.parse(raw); } catch { /* treated as the theme's default */ }
  const look = lookOf(normalizeInvitation(parsed, themeSlug));
  if (look.layout === 'own') return { name: 'Their own uploaded design', edited: false, custom: false };

  // Score each gallery design by how much of the look it shares. The paper
  // (background) and the layout are what make a design recognisable, so they
  // count double. Ties go to the page's own theme.
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  let best: { d: CatalogDesign; score: number } | null = null;
  for (const d of INVITATION_CATALOG) {
    let score = 0;
    for (const k of KEYS) if (same(look[k], d.look[k])) score += k === 'background' || k === 'layout' ? 2 : 1;
    if (!best || score > best.score || (score === best.score && d.theme === themeSlug && best.d.theme !== themeSlug)) best = { d, score };
  }
  const max = KEYS.length + 2;
  if (!best) return { name: 'Customised', edited: false, custom: true };
  if (best.score === max) return { name: designName(best.d), edited: false, custom: false };
  if (best.score >= max - 5) return { name: designName(best.d), edited: true, custom: false };
  return { name: 'Customised', edited: false, custom: true };
}
