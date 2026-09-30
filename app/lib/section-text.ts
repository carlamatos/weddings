// Custom text for the section headings every theme shows: the small eyebrow
// line and the h2 title above each section. Owners edit them in place in the
// page editor. Each one is stored in user_page_settings as `text:<key>`, and an
// unset key falls back to the theme's own (translated) default. Keys name the
// section, not the theme, so custom text survives a theme switch.

export const SECTION_TEXT_KEYS = [
  'story.eyebrow', 'story.title',
  'details.eyebrow', 'details.title',
  'program.eyebrow', 'program.title',
  'rsvp.eyebrow', 'rsvp.title',
  'gallery.eyebrow', 'gallery.title',
  'photos.eyebrow', 'photos.title',
  'songs.eyebrow', 'songs.title',
  'share.eyebrow', 'share.title',
  'countdown.eyebrow', 'countdown.title',
  'footer.eyebrow', 'footer.title', 'footer.credit',
] as const;

export type SectionTextKey = (typeof SECTION_TEXT_KEYS)[number];
export type SectionText = Partial<Record<SectionTextKey, string>>;

export const SECTION_TEXT_MAX_LENGTH = 120;

const SETTING_PREFIX = 'text:';

export function isSectionTextKey(key: string): key is SectionTextKey {
  return (SECTION_TEXT_KEYS as readonly string[]).includes(key);
}

export function sectionTextSettingName(key: SectionTextKey): string {
  return SETTING_PREFIX + key;
}

// Picks the custom section text out of a page's settings.
export function sectionTextFromSettings(settings: Record<string, string>): SectionText {
  const text: SectionText = {};
  for (const key of SECTION_TEXT_KEYS) {
    const value = settings[sectionTextSettingName(key)];
    if (value) text[key] = value;
  }
  return text;
}
