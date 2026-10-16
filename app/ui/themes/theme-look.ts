import { useCallback, useEffect, useRef } from 'react';

// How an element on the page actually looks with the theme's own styling —
// its text colour, background and type — so the editor can preview the
// theme's colours instead of a generic stand-in when the owner hasn't
// picked their own.

export type ThemeLook = {
  color?: string; // CSS colour of the text
  colorHex?: string; // the same as #rrggbb, when it can be expressed that way
  background?: string; // CSS background (a colour or a gradient), if any
  backgroundHex?: string;
  borderColor?: string;
  font: React.CSSProperties;
  shape: React.CSSProperties; // border and corners, for buttons
};

const TRANSPARENT = /^(transparent|rgba\([^)]*,\s*0\))$/;

function toHex(css: string): string | undefined {
  const m = css.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+%?))?\s*\)$/);
  if (!m) return undefined;
  if (m[4] !== undefined && parseFloat(m[4]) === 0) return undefined;
  return '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
}

// The owner's inline colours are set aside while reading, so this is the
// theme's colour even when a custom one is showing. Read it when nothing is
// hovered or animating (on mount), since :hover can change a button's colours.
export function readThemeLook(el: HTMLElement | null): ThemeLook | undefined {
  if (!el) return undefined;
  const saved = el.style.cssText;
  for (const prop of ['color', '-webkit-text-fill-color', 'background', 'background-color', 'border-color']) {
    el.style.removeProperty(prop);
  }
  const cs = getComputedStyle(el);
  const fill = cs.getPropertyValue('-webkit-text-fill-color');
  // A gradient heading paints its text through a transparent fill; its
  // `color` is the closest single colour.
  const color = fill && !TRANSPARENT.test(fill) && fill !== cs.color ? fill : cs.color;
  const bgColor = TRANSPARENT.test(cs.backgroundColor) ? '' : cs.backgroundColor;
  const bgImage = cs.backgroundImage !== 'none' && cs.backgroundImage.includes('gradient') ? cs.backgroundImage : '';
  const look: ThemeLook = {
    color,
    colorHex: toHex(color),
    background: bgImage || bgColor || undefined,
    backgroundHex: bgColor ? toHex(bgColor) : undefined,
    borderColor: TRANSPARENT.test(cs.borderTopColor) ? undefined : cs.borderTopColor,
    font: {
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight as React.CSSProperties['fontWeight'],
      fontStyle: cs.fontStyle,
      textTransform: cs.textTransform as React.CSSProperties['textTransform'],
      letterSpacing: cs.letterSpacing === 'normal' ? undefined : cs.letterSpacing,
    },
    shape: {
      borderRadius: cs.borderRadius,
      borderWidth: cs.borderTopWidth,
      borderStyle: cs.borderTopStyle,
    },
  };
  el.style.cssText = saved;
  return look;
}

// A ref for the element plus a reader for its theme look. The look is taken
// once on mount, before any hover, and kept for when the editor opens.
export function useThemeLook<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const cached = useRef<ThemeLook | undefined>(undefined);
  useEffect(() => { cached.current = readThemeLook(ref.current); }, []);
  const read = useCallback(() => cached.current ?? readThemeLook(ref.current), []);
  return [ref, read] as const;
}
