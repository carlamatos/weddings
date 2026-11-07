import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { previewImage } from '@/app/ui/themes/preview-image';

// A theme card's picture on the homepage: the theme's whole demo page (made
// by scripts/theme-page-shots.mjs), the card's full width. It doesn't move
// by itself; visitors scroll or swipe inside it, and the line under it says
// so. The picture loads as it comes into view.
// For the Spanish pages: alt, the picture's description in Spanish, and es,
// the picture with MyGala's words in Spanish (public/images/theme-pages/es).
export function ThemePagePicture({ slug, alt, es = false }: { slug: string; alt?: string; es?: boolean }) {
  const card = THEME_CARDS.find((t) => t.slug === slug);
  return (
    <div className="theme-preview theme-preview--page" style={{ background: card?.bg }}>
      <div className="theme-page-screen" tabIndex={0} aria-label={alt ?? `${card?.name ?? slug}: the whole page, scroll to see it`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...previewImage(`/images/theme-pages/${es ? 'es/' : ''}${slug}.webp`, '(max-width: 800px) 100vw, 380px')} alt={alt ?? `The ${card?.name ?? slug} theme, the whole page`} />
      </div>
      <p className="theme-page-hint" aria-hidden="true" />
    </div>
  );
}
