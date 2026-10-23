// A page's own background for a section, instead of the theme's: a colour,
// or a photo (with an optional light or dark wash so the text stays
// readable). Each one is stored in user_page_settings as `bg:<section>`, as
// JSON. Keys name the section, not the theme (the same names as the section
// headings in section-text.ts), so a background stays when the theme changes;
// removing the setting brings the theme's own background back.
// Applied in the browser by app/ui/themes/SectionBackgrounds.tsx.

export const SECTION_BG_KEYS = [
  'story', 'countdown', 'details', 'program', 'rsvp', 'gallery', 'photos', 'songs',
  'share', 'sponsors', 'livestream', 'potluck', 'gift', 'footer',
] as const;

export type SectionBgKey = (typeof SECTION_BG_KEYS)[number];

export type SectionBackground =
  | { kind: 'color'; color: string }
  | { kind: 'image'; url: string; wash: 'none' | 'light' | 'dark'; strength: number }; // strength: 0–80 (%)

export type SectionBackgrounds = Partial<Record<SectionBgKey, SectionBackground>>;

export const SECTION_BG_LABELS: Record<SectionBgKey, string> = {
  story: 'Story', countdown: 'Countdown', details: 'Date & location', program: 'Event Program', rsvp: 'RSVP',
  gallery: 'Gallery', photos: 'Guest photos', songs: 'Song requests', share: 'Share', sponsors: 'Sponsors',
  livestream: 'Livestream', potluck: 'Potluck', gift: 'Gift exchange', footer: 'Footer',
};

const PREFIX = 'bg:';

export function isSectionBgKey(key: unknown): key is SectionBgKey {
  return typeof key === 'string' && (SECTION_BG_KEYS as readonly string[]).includes(key);
}

export function sectionBgSettingName(key: SectionBgKey): string {
  return PREFIX + key;
}

const isColor = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

// Photos come from MyGala's own uploads (Vercel Blob, or /uploads/ in local
// development) or the site's images. The character set keeps the address
// safe to put inside CSS url().
export function isSectionBgImageUrl(v: unknown): v is string {
  if (typeof v !== 'string' || v.length > 500 || !/^[\w\-./:%~]+$/.test(v)) return false;
  return /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(v) || /^\/(uploads|images)\//.test(v);
}

// A background, checked; null when it isn't a valid one.
export function parseSectionBackground(raw: unknown): SectionBackground | null {
  let v: unknown = raw;
  if (typeof raw === 'string') {
    try { v = JSON.parse(raw); } catch { return null; }
  }
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (o.kind === 'color' && isColor(o.color)) return { kind: 'color', color: o.color.toLowerCase() };
  if (o.kind === 'image' && isSectionBgImageUrl(o.url)) {
    const wash = o.wash === 'light' || o.wash === 'dark' ? o.wash : 'none';
    const strength = typeof o.strength === 'number' && Number.isFinite(o.strength) ? Math.max(0, Math.min(80, Math.round(o.strength))) : 0;
    return { kind: 'image', url: o.url, wash, strength: wash === 'none' ? 0 : strength };
  }
  return null;
}

// Picks the section backgrounds out of a page's settings.
export function sectionBackgroundsFromSettings(settings: Record<string, string>): SectionBackgrounds {
  const out: SectionBackgrounds = {};
  for (const key of SECTION_BG_KEYS) {
    const bg = parseSectionBackground(settings[sectionBgSettingName(key)]);
    if (bg) out[key] = bg;
  }
  return out;
}

// The CSS `background` value for one.
export function sectionBgCss(bg: SectionBackground): string {
  if (bg.kind === 'color') return bg.color;
  const layer = `url("${bg.url}") center / cover no-repeat`;
  if (bg.wash === 'none' || !bg.strength) return layer;
  const c = bg.wash === 'light' ? '255,255,255' : '0,0,0';
  const a = bg.strength / 100;
  return `linear-gradient(rgba(${c},${a}), rgba(${c},${a})), ${layer}`;
}
