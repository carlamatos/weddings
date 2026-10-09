// An optional colour wash between the top banner's photo and its text, chosen
// by the owner (colour + opacity). Every theme renders <HeroOverlay> right
// after its banner photo: the photo sits at z-index 0 and each theme's text at
// 1 or above, so this layer (also 0, but later in the page) lands between
// them. Opacity 0 (the default) draws nothing, so pages look exactly as
// before until an owner turns it on.

export type HeroOverlaySettings = { color: string; opacity: number }; // opacity: 0–100 (%)

export const HERO_OVERLAY_DEFAULT_COLOR = '#000000';

export function isHeroOverlayColor(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
}

export function isHeroOverlayOpacity(v: unknown): v is string {
  return typeof v === 'string' && /^(100|[1-9]?[0-9])$/.test(v);
}

// Reads hero_overlay_color / hero_overlay_opacity from the page settings.
// Undefined when there is no visible overlay.
export function heroOverlayFromSettings(settings: Record<string, string>): HeroOverlaySettings | undefined {
  const opacity = isHeroOverlayOpacity(settings['hero_overlay_opacity']) ? Number(settings['hero_overlay_opacity']) : 0;
  if (opacity === 0) return undefined;
  const color = isHeroOverlayColor(settings['hero_overlay_color']) ? settings['hero_overlay_color'] : HERO_OVERLAY_DEFAULT_COLOR;
  return { color, opacity };
}

export function HeroOverlay({ overlay }: { overlay?: HeroOverlaySettings }) {
  if (!overlay || overlay.opacity <= 0) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: overlay.color, opacity: overlay.opacity / 100,
      }}
    />
  );
}
