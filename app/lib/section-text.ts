// Custom text for the section headings every theme shows: the small eyebrow
// line and the h2 title above each section. Owners edit them in place in the
// page editor. Each one is stored in user_page_settings as `text:<key>`, and an
// unset key falls back to the theme's own (translated) default. Keys name the
// section, not the theme, so custom text survives a theme switch. The owner
// can also give each one a colour, stored as `color:<key>` (#rrggbb).

export const SECTION_TEXT_KEYS = [
  'story.eyebrow', 'story.title',
  'details.eyebrow', 'details.title',
  'program.eyebrow', 'program.title',
  'rsvp.eyebrow', 'rsvp.title',
  'gallery.eyebrow', 'gallery.title',
  'photos.eyebrow', 'photos.title',
  'songs.eyebrow', 'songs.title',
  'share.eyebrow', 'share.title',
  'sponsors.eyebrow', 'sponsors.title',
  'livestream.eyebrow', 'livestream.title',
  'potluck.eyebrow', 'potluck.title', 'gift.eyebrow', 'gift.title',
  'countdown.eyebrow', 'countdown.title',
  'footer.eyebrow', 'footer.title', 'footer.signoff',
] as const;

export type SectionTextKey = (typeof SECTION_TEXT_KEYS)[number];
export type SectionText = Partial<Record<SectionTextKey, string>> & {
  colors?: Partial<Record<SectionTextKey, string>>; // owner's colour per heading; unset = the theme's
};

export const SECTION_TEXT_MAX_LENGTH = 120;

const SETTING_PREFIX = 'text:';
const COLOR_PREFIX = 'color:';

export function isSectionTextKey(key: string): key is SectionTextKey {
  return (SECTION_TEXT_KEYS as readonly string[]).includes(key);
}

export function sectionTextSettingName(key: SectionTextKey): string {
  return SETTING_PREFIX + key;
}

export function sectionColorSettingName(key: SectionTextKey): string {
  return COLOR_PREFIX + key;
}

// The section key in a `color:<key>` setting name, if it is one.
export function sectionKeyFromColorSetting(name: string): SectionTextKey | null {
  const key = name.startsWith(COLOR_PREFIX) ? name.slice(COLOR_PREFIX.length) : '';
  return isSectionTextKey(key) ? key : null;
}

// Picks the custom section text and colours out of a page's settings.
export function sectionTextFromSettings(settings: Record<string, string>): SectionText {
  const text: SectionText = {};
  for (const key of SECTION_TEXT_KEYS) {
    const value = settings[sectionTextSettingName(key)];
    if (value) text[key] = value;
    const color = settings[sectionColorSettingName(key)];
    if (color && /^#[0-9a-f]{6}$/i.test(color)) (text.colors ??= {})[key] = color;
  }
  return text;
}
