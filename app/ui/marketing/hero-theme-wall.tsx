import { HERO_DEFAULTS } from '@/app/ui/themes/hero-defaults';
import { THEME_CARDS } from '@/app/lib/marketing/theme-cards';
import { previewImage } from '@/app/ui/themes/preview-image';

// The homepage banner's background: the themes' own banner photos in slowly
// drifting columns, behind a cream wash that keeps the text readable (see
// .hero-wall in marketing.css). Decorative only — hidden from screen readers.
// Phones show the first three columns.
//
// A tile can be the page's Largest Contentful Paint (which one depends on the
// screen), so the tiles of the columns every screen shows (1–3) load at once
// at high priority — 9 small images. Columns 4–6 (desktop only) load lazily.

// Mixed so neighbouring tiles differ in colour and occasion.
const ORDER = [
  'the-day', 'halloween-party', 'love',
  'summit', 'alegria', 'christmas-party',
  'baby-shower-girl', 'nexus', 'dia-de-los-muertos',
  'quiet-coastal', 'fun-party', 'white-christmas',
  'antique-cars', 'baby-shower-boy', 'midnight-botanical',
  'community', 'vilma', 'baby-shower-neutral',
] as const;

const COLUMNS = 6;
const TILES = ORDER.map((slug) => ({
  slug,
  src: HERO_DEFAULTS[slug],
  name: THEME_CARDS.find((c) => c.slug === slug)?.name ?? slug,
}));

export default function HeroThemeWall() {
  const columns = Array.from({ length: COLUMNS }, (_, c) => TILES.filter((_, i) => i % COLUMNS === c));
  return (
    <div className="hero-wall" aria-hidden="true">
      {columns.map((tiles, c) => (
        <div className="hero-wall-col" key={c}>
          {/* Twice over, so the drift loops without a jump. */}
          {[...tiles, ...tiles].map((t, i) => (
            <div className="hero-wall-tile" key={`${t.slug}-${i}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img {...previewImage(t.src, '(max-width: 760px) 34vw, 260px', { priority: c < 3 })} alt="" />
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
