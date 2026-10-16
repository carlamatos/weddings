import type { ThemeCard } from '@/app/lib/marketing/theme-cards';
import ThemeHeroPreview from '@/app/ui/dashboard/ThemeHeroPreview';

// Theme previews render at 280px tall; the card slot is 220px.
const PREVIEW_SCALE = 220 / 280;

// Cards with a live preview of each theme's banner; each opens the theme's
// full demo in a new tab. `columns` 2 suits the narrower article column.
export function ThemeGrid({ themes, columns = 3 }: { themes: ThemeCard[]; columns?: 2 | 3 }) {
  return (
    <div className={`theme-grid${columns === 2 ? ' theme-grid--2' : ''}`}>
      {themes.map((t) => (
        <a key={t.slug} href={`/themes/${t.slug}`} target="_blank" rel="noopener noreferrer" className="theme-card" style={{ textDecoration: 'none' }}>
          <div className="theme-preview" style={{ overflow: 'hidden', background: t.bg }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: `${100 / PREVIEW_SCALE}%`, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
              <ThemeHeroPreview themeSlug={t.slug} {...t.sample} />
            </div>
          </div>
          <div className="theme-info">
            <h3 className="theme-name">{t.name}</h3>
            <p className="theme-desc">{t.desc}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
