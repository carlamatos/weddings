// The top banner's photo or video: how it fills the banner (cover/contain)
// and, when the owner picks one, its vertical alignment. With no alignment
// chosen, each theme's own object-position (tuned to its default image)
// applies. Shared by every theme and the editor's banner.

export type HeroObjectFit = 'cover' | 'contain';
export type HeroObjectPosition = 'top' | 'center' | 'bottom';

export const HERO_OBJECT_POSITIONS: HeroObjectPosition[] = ['top', 'center', 'bottom'];

export function isHeroObjectPosition(v: unknown): v is HeroObjectPosition {
  return v === 'top' || v === 'center' || v === 'bottom';
}

export function heroMediaStyle(fit: HeroObjectFit = 'cover', position?: HeroObjectPosition | null): React.CSSProperties {
  return position ? { objectFit: fit, objectPosition: `center ${position}` } : { objectFit: fit };
}
