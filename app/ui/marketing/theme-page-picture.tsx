import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { previewImage } from '@/app/ui/themes/preview-image';

// A theme card's picture on the homepage: the theme's whole demo page (made
// by scripts/theme-page-shots.mjs), the card's full width. It doesn't move
// by itself; visitors scroll or swipe inside it, and the line under it says
// so. The picture loads as it comes into view.
export function ThemePagePicture({ slug }: { slug: string }) {
  const card = THEME_CARDS.find((t) => t.slug === slug);
  return (
    <div className="theme-preview theme-preview--page" style={{ background: card?.bg }}>
      <div className="theme-page-screen" tabIndex={0} aria-label={`${card?.name ?? slug}: the whole page, scroll to see it`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...previewImage(`/images/theme-pages/${slug}.webp`, '(max-width: 800px) 100vw, 380px')} alt={`The ${card?.name ?? slug} theme, the whole page`} />
      </div>
      <p className="theme-page-hint" aria-hidden="true" />
    </div>
  );
}
