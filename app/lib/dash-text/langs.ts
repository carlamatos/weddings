// The dashboard's own language (its menus, buttons and help text), chosen by
// the host in the account menu. Separate from each event page's language,
// which is what guests see.
export type DashLang = 'en' | 'fr' | 'es';
export const DASH_LANGS: { code: DashLang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];
export const DASH_LANG_COOKIE = 'mygala_dash_lang';
export const isDashLang = (v: unknown): v is DashLang => v === 'en' || v === 'fr' || v === 'es';
