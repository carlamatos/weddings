import { DEFAULT_THEME, themeRegistry } from './registry';
import { HERO_DEFAULTS } from './hero-defaults';

// What the dashboard editor should show behind the hero when no banner is set:
// exactly what the public page of that theme shows. An unknown theme renders as
// the default theme (same as getTheme), so it gets the default theme's hero.
// Each theme owns its own fallback (registered as `FallbackHero` in
// registry.ts) so a new theme never accidentally inherits another theme's
// illustration.
export function heroFallbackFor(themeSlug?: string | null): { defaultSrc?: string; fallback?: React.ReactNode } {
  const slug = themeSlug && themeRegistry[themeSlug] ? themeSlug : DEFAULT_THEME;
  if (slug in HERO_DEFAULTS) return { defaultSrc: HERO_DEFAULTS[slug as keyof typeof HERO_DEFAULTS] };
  const FallbackHero = themeRegistry[slug].FallbackHero;
  return { fallback: FallbackHero ? <FallbackHero /> : undefined };
}
