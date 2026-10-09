// The owner's custom look for the top banner's text and buttons: a colour for
// the eyebrow, the name and the date line, and for each banner button its
// own label, button colour and text colour. Stored as page settings; any
// value left unset falls back to the theme's own styling, so pages look
// exactly as before until an owner changes something. "Restore default theme
// colors" clears every colour (labels are kept).

import type React from 'react';

export type HeroTextKey = 'eyebrow' | 'name' | 'date';
export type HeroButtonKey = 'rsvp' | 'story' | 'photos';

export const HERO_TEXT_KEYS: HeroTextKey[] = ['eyebrow', 'name', 'date'];
export const HERO_BUTTON_KEYS: HeroButtonKey[] = ['rsvp', 'story', 'photos'];
export const HERO_BUTTON_LABEL_MAX_LENGTH = 40;

export type HeroButtonStyle = { label?: string; bg?: string; color?: string };
export type HeroStyle = {
  text: Partial<Record<HeroTextKey, string>>;
  buttons: Partial<Record<HeroButtonKey, HeroButtonStyle>>;
};

export const heroTextColorSetting = (key: HeroTextKey) => `hero_${key}_color`;
export const heroButtonSetting = (key: HeroButtonKey, part: 'label' | 'bg' | 'color') => `hero_btn_${key}_${part}`;

export function isHeroColor(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
}

export function isHeroButtonKey(v: unknown): v is HeroButtonKey {
  return v === 'rsvp' || v === 'story' || v === 'photos';
}

export function normalizeHeroButtonLabel(v: unknown): string {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, HERO_BUTTON_LABEL_MAX_LENGTH) : '';
}

export function heroStyleFromSettings(settings: Record<string, string>): HeroStyle {
  const color = (name: string) => (isHeroColor(settings[name]) ? settings[name] : undefined);
  const text: HeroStyle['text'] = {};
  for (const k of HERO_TEXT_KEYS) {
    const c = color(heroTextColorSetting(k));
    if (c) text[k] = c;
  }
  const buttons: HeroStyle['buttons'] = {};
  for (const k of HERO_BUTTON_KEYS) {
    const label = normalizeHeroButtonLabel(settings[heroButtonSetting(k, 'label')]) || undefined;
    const bg = color(heroButtonSetting(k, 'bg'));
    const c = color(heroButtonSetting(k, 'color'));
    if (label || bg || c) buttons[k] = { label, bg, color: c };
  }
  return { text, buttons };
}

// Text colour for an eyebrow / name / date. Also sets the text fill so a
// theme that paints its heading with a gradient shows the chosen colour.
export function heroTextStyle(color?: string): React.CSSProperties | undefined {
  return color ? { color, WebkitTextFillColor: color } : undefined;
}

// A button colour fills the button (outline buttons become filled) and
// recolours its border; the text colour recolours the label.
export function heroButtonStyle(b?: HeroButtonStyle): React.CSSProperties | undefined {
  if (!b?.bg && !b?.color) return undefined;
  return {
    ...(b.bg ? { background: b.bg, borderColor: b.bg } : {}),
    ...(b.color ? { color: b.color, WebkitTextFillColor: b.color } : {}),
  };
}
