import type { ThemeProps, ThemePreviewProps } from './types';
import type { Translations } from '@/app/lib/translations';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import { Reveal } from './Reveal';
import { PreviewTopBar } from './PreviewTopBar';
import { Countdown } from './Countdown';
import { HERO_DEFAULTS } from './hero-defaults';
import { getTranslations, pickByLanguage } from '@/app/lib/translations';
import { eventWhen, formatDateRange } from './event-when';
import ShareSection from './ShareSection';
import { SectionText } from './section-text';
import { CustomSectionContent, SponsorGrid } from './PlusSections';
import { LivestreamContent } from './LivestreamSection';
import PotluckForm from './PotluckForm';
import GiftExchangeSection from './GiftExchangeSection';
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';
import { heroMediaStyle } from './hero-media';
import { HeroOverlay } from './hero-overlay';
import { heroTextStyle } from './hero-style';
import HeroButton from './HeroButton';
import { previewImage } from './preview-image';
import PreviewFont from './PreviewFont';
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { eventJsonLd } from './event-json-ld';

const IMG = '/images/themes/western';

// Barn, field and outdoor moments from the other wedding themes.
const GALLERY_PATHS = [
  '/images/themes/nature/photo-1.jpeg', '/images/themes/the-day/photo-3.jpeg', '/images/themes/nature/photo-4.jpeg', '/images/themes/love/photo-5.jpeg',
  '/images/themes/nature/photo-6.jpeg', '/images/themes/the-day/photo-6.jpeg', '/images/themes/nature/photo-2.jpeg', '/images/themes/love/photo-8.jpeg',
];
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `ww-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// Saddle leather and sun-bleached canvas: saddle brown, canvas and hay;
// rust and a brass gold.
const SADDLE = '#2B1B12';
const LEATHER = '#4A3324';
const CANVAS = '#F4EADB';
const HAY = '#EADBC4';
const PAPER = '#FBF5EB';
const RUST = '#A4452B';
const RUST_DEEP = '#7A2F1C';
const BRASS = '#C9A26B';
const GOLD = '#E2B36B';
const DUST = '#6B4F3A';

// ─── decorations ─────────────────────────────────────────

// The four-point star of a spur rowel.
function Rowel({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2 L14.6 9.4 L22 12 L14.6 14.6 L12 22 L9.4 14.6 L2 12 L9.4 9.4 Z" fill="currentColor" />
    </svg>
  );
}

// A rowel between two lines — the section rule.
function StarRule({ className = '' }: { className?: string }) {
  return (
    <div className={`ww-rule ${className}`} aria-hidden="true">
      <span className="ww-rule-line" />
      <Rowel />
      <span className="ww-rule-line" />
    </div>
  );
}

// "Sadie & Wyatt" → "S & W", for the monogram in the menu.
function monogram(heading: string): string {
  const names = heading.split(/\s*(?:&|\+|\band\b|\bet\b|\by\b)\s*/i).map((s) => s.trim()).filter(Boolean);
  if (names.length >= 2) return `${names[0][0]} & ${names[1][0]}`.toUpperCase();
  return heading.trim().slice(0, 18);
}

// The names with their "&" set apart, on its own line, in gold.
function Names({ heading }: { heading: string }) {
  const parts = heading.split(/\s+&\s+/);
  if (parts.length !== 2) return <>{heading}</>;
  return <>{parts[0]} <span className="amp">&amp;</span> {parts[1]}</>;
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: SADDLE, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...previewImage(bannerImage || HERO_DEFAULTS.western)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(43,27,18,0.55), rgba(43,27,18,0.35) 45%, rgba(43,27,18,0.8))' }} />
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own faces */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Rye&family=Oswald:wght@500&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}>
        <p style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: GOLD, fontWeight: 500, margin: '0 0 8px' }}>Together with their families</p>
        <h2 style={{ fontFamily: "'Rye', Rockwell, serif", fontWeight: 400, fontSize: 'clamp(26px, 4.4vw, 36px)', color: CANVAS, margin: '0 0 8px', lineHeight: 1.1 }}>{heading || 'Western'}</h2>
        {date && <p style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif", fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: HAY, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const PAPER_TEXTURE = `linear-gradient(rgba(244,234,219,0.78), rgba(244,234,219,0.78)), url(${IMG}/paper.webp) center / cover`;

const css = `
  .ww {
    --ww-saddle: ${SADDLE};
    --ww-leather: ${LEATHER};
    --ww-canvas: ${CANVAS};
    --ww-hay: ${HAY};
    --ww-paper: ${PAPER};
    --ww-rust: ${RUST};
    --ww-brass: ${BRASS};
    --ww-gold: ${GOLD};
    --ww-dust: ${DUST};
    --ww-font-display: 'Rye', Rockwell, 'Courier New', serif;
    --ww-font-serif: 'Libre Baskerville', Georgia, serif;
    --ww-font-sans: 'Oswald', 'Arial Narrow', sans-serif;
  }
  .ww * { box-sizing: border-box; }
  .ww { margin: 0; background: var(--ww-canvas); color: var(--ww-saddle); font-family: var(--ww-font-serif); overflow-x: clip; -webkit-font-smoothing: antialiased; }
  .ww img { max-width: 100%; }
  .ww a { color: var(--ww-rust); }
  .ww a:hover { color: ${RUST_DEEP}; }
  .ww :focus-visible { outline: 2px solid var(--ww-gold); outline-offset: 3px; }

  @keyframes ww-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .ww .hero-content > * { animation: none !important; } .ww { scroll-behavior: auto; } }

  /* the rowel rule */
  .ww .ww-rule { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 0 auto 26px; color: var(--ww-rust); }
  .ww .ww-rule-line { width: 70px; height: 1px; background: currentColor; }
  .ww .ww-rule.on-dark { color: var(--ww-gold); }

  .ww .eyebrow { font-family: var(--ww-font-sans); font-size: 14px; font-weight: 500; letter-spacing: 5px; text-transform: uppercase; color: var(--ww-rust); margin: 0 0 12px; }
  .ww .eyebrow.on-dark { color: var(--ww-gold); }
  .ww .section-title { font-family: var(--ww-font-display); font-size: clamp(32px, 4.4vw, 44px); font-weight: 400; color: var(--ww-saddle); margin: 0 0 22px; line-height: 1.15; }
  .ww .section-title.on-dark { color: var(--ww-canvas); }

  .ww .wrap { max-width: 720px; margin: 0 auto; }
  .ww .wrap-wide { max-width: 1080px; margin: 0 auto; }
  .ww .section { position: relative; padding: 112px 24px; background: var(--ww-canvas); }
  .ww .section-paper { background: ${PAPER_TEXTURE}, var(--ww-canvas); }
  .ww .section-hay { background: var(--ww-hay); border-top: 3px double var(--ww-brass); border-bottom: 3px double var(--ww-brass); }
  .ww .section-dark { background: var(--ww-saddle); color: var(--ww-canvas); }
  .ww .section-center { text-align: center; }
  @media (max-width: 640px) { .ww .section { padding: 80px 20px; } }

  .ww .btn { font-family: var(--ww-font-sans); font-size: 15px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; padding: 15px 30px; min-height: 50px; border-radius: 2px; border: 2px solid var(--ww-rust); background: var(--ww-rust); color: #FFF8EE; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; line-height: 1; transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease; }
  .ww .btn:hover { background: ${RUST_DEEP}; border-color: ${RUST_DEEP}; color: #FFF8EE; }
  .ww .btn-outline { background: transparent; color: var(--ww-saddle); border-color: var(--ww-saddle); }
  .ww .btn-outline:hover { background: var(--ww-saddle); border-color: var(--ww-saddle); color: var(--ww-canvas); }
  .ww .btn-outline.on-dark { color: var(--ww-canvas); border-color: rgba(244,234,219,0.8); }
  .ww .btn-outline.on-dark:hover { background: var(--ww-gold); border-color: var(--ww-gold); color: var(--ww-saddle); }

  .ww input, .ww textarea, .ww select { font-family: var(--ww-font-serif); font-size: 15px; padding: 13px 14px; min-height: 48px; border: 1px solid var(--ww-dust); border-radius: 2px; outline: none; background: rgba(255,253,248,0.92); color: var(--ww-saddle); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .ww textarea { min-height: 0; }
  .ww input:focus, .ww textarea:focus, .ww select:focus { border-color: var(--ww-rust); box-shadow: 0 0 0 3px rgba(164,69,43,0.2); }
  .ww input::placeholder, .ww textarea::placeholder { color: rgba(43,27,18,0.45); }
  .ww label.field-label { font-family: var(--ww-font-sans); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: var(--ww-saddle); display: block; margin-bottom: 7px; font-weight: 500; }
  .ww .radio-label, .ww .check-label { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 15px; color: var(--ww-saddle); cursor: pointer; }
  .ww .radio-label input, .ww .check-label input { width: 20px; height: 20px; min-height: 0; border: none; padding: 0; accent-color: var(--ww-rust); box-shadow: none; }
  .ww .check-hint { font-size: 12px; color: rgba(43,27,18,0.7); margin: 4px 0 0; }
  .ww .attend-options { display: flex; gap: 6px 22px; margin-top: 4px; flex-wrap: wrap; }
  .ww .rsvp-error { color: #8E2A17; font-size: 13px; margin: 0; }
  .ww .rsvp-success { text-align: center; padding: 20px 0; }
  .ww .rsvp-headline { font-family: var(--ww-font-display); font-size: 44px; color: var(--ww-rust); margin: 0 0 8px; font-weight: 400; line-height: 1.1; }
  .ww .rsvp-sub { font-size: 14px; color: var(--ww-saddle); margin: 0; }
  .ww .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* the menu: saddle brown under a double brass rule */
  .ww .ww-nav { z-index: 30; background: var(--ww-saddle); border-bottom: 3px double var(--ww-brass); }
  .ww .ww-nav.is-sticky { position: sticky; top: 0; }
  .ww .ww-nav-inner { max-width: 1200px; margin: 0 auto; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; gap: 8px 32px; }
  .ww .ww-mono { font-family: var(--ww-font-display); font-size: 24px; color: var(--ww-canvas); text-decoration: none; letter-spacing: 1px; white-space: nowrap; }
  .ww .ww-mono:hover { color: var(--ww-canvas); }
  .ww .ww-mono span span { color: var(--ww-gold); }
  .ww .ww-nav ul { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; gap: 4px 22px; font-family: var(--ww-font-sans); font-size: 15px; letter-spacing: 2px; text-transform: uppercase; }
  .ww .ww-nav ul a { display: inline-block; color: ${HAY}; text-decoration: none; padding: 12px 0; white-space: nowrap; }
  .ww .ww-nav ul a:hover { color: var(--ww-gold); }
  .ww .ww-nav ul a.ww-nav-rsvp { color: var(--ww-saddle); background: var(--ww-gold); padding: 12px 18px; border-radius: 2px; font-weight: 600; }
  @media (max-width: 900px) {
    .ww .ww-nav-inner { flex-direction: column; padding: 10px 0 0; }
    .ww .ww-nav ul { width: 100%; overflow-x: auto; scrollbar-width: none; padding: 0 20px 6px; justify-content: flex-start; font-size: 13px; gap: 4px 18px; }
    .ww .ww-nav ul::-webkit-scrollbar { display: none; }
    .ww .ww-nav ul li:first-child { margin-left: auto; }
    .ww .ww-nav ul li:last-child { margin-right: auto; }
  }

  /* hero: the buttes at sundown, the names in Rye */
  .ww .hero { position: relative; min-height: 88vh; display: flex; align-items: center; justify-content: center; padding: 120px 24px 140px; background: var(--ww-saddle); overflow: hidden; text-align: center; color: var(--ww-canvas); border-bottom: 3px double var(--ww-brass); }
  .ww .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .ww .hero-veil { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(to bottom, rgba(43,27,18,0.55) 0%, rgba(43,27,18,0.3) 40%, rgba(43,27,18,0.45) 70%, rgba(43,27,18,0.85) 100%); }
  .ww .hero-content { position: relative; z-index: 2; max-width: 820px; }
  .ww .hero-content > * { animation: ww-in 1.1s ease both; }
  .ww .hero-eyebrow { animation-delay: 0.2s !important; font-family: var(--ww-font-sans); letter-spacing: 6px; text-transform: uppercase; font-size: 15px; color: var(--ww-gold); margin: 0 0 20px; text-shadow: 0 1px 8px rgba(43,27,18,0.6); }
  .ww .hero-name { animation-delay: 0.35s !important; font-family: var(--ww-font-display); font-weight: 400; font-size: clamp(52px, 9vw, 112px); line-height: 1.05; color: var(--ww-canvas); margin: 0; text-shadow: 0 3px 18px rgba(43,27,18,0.55); }
  .ww .hero-name .amp { display: block; font-size: 0.45em; color: var(--ww-gold); margin: 6px 0; }
  .ww .hero-content > .ww-rule { animation-delay: 0.5s !important; margin: 28px auto 18px; }
  .ww .hero-date { animation-delay: 0.6s !important; font-size: 20px; font-style: italic; color: ${HAY}; margin: 0 0 34px; text-shadow: 0 1px 8px rgba(43,27,18,0.7); }
  .ww .hero-actions { animation-delay: 0.8s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .ww .hero .btn-outline { color: var(--ww-canvas); border-color: rgba(244,234,219,0.85); background: rgba(43,27,18,0.25); }
  .ww .hero .btn-outline:hover { background: var(--ww-gold); border-color: var(--ww-gold); color: var(--ww-saddle); }
  @media (max-width: 640px) {
    .ww .hero { min-height: 80vh; padding: 96px 20px 110px; }
    .ww .hero-eyebrow { letter-spacing: 4px; font-size: 13px; }
    .ww .hero-date { font-size: 17px; }
  }

  /* story: on old paper */
  .ww .story-text { font-size: 18px; line-height: 1.85; color: var(--ww-leather); margin: 0 auto; max-width: 640px; }

  /* countdown: the dirt road, the numbers in framed saddle-brown boxes */
  .ww .countdown-shell { position: relative; overflow: hidden; background: var(--ww-saddle) url(${IMG}/road.webp) center 70% / cover no-repeat; border-top: 3px double var(--ww-brass); border-bottom: 3px double var(--ww-brass); }
  .ww .countdown-shell::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(43,27,18,0.5), rgba(43,27,18,0.72)); }
  .ww .countdown-wrap { position: relative; z-index: 1; padding: 104px 24px; text-align: center; }
  .ww .countdown-heading { font-family: var(--ww-font-display); font-weight: 400; font-size: clamp(34px, 5vw, 52px); color: var(--ww-canvas); margin: 0 0 40px; line-height: 1.1; text-shadow: 0 2px 14px rgba(43,27,18,0.6); }
  .ww .countdown-row { max-width: 720px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .ww .countdown-block { background: var(--ww-saddle); color: var(--ww-canvas); padding: 24px 8px; border-radius: 2px; outline: 1px solid var(--ww-brass); outline-offset: -8px; box-shadow: 0 18px 30px -18px rgba(0,0,0,0.6); }
  .ww .countdown-value { font-family: var(--ww-font-display); font-size: clamp(30px, 5vw, 52px); line-height: 1.1; }
  .ww .countdown-label { font-family: var(--ww-font-sans); letter-spacing: 3px; text-transform: uppercase; font-size: 13px; color: var(--ww-gold); margin-top: 6px; }
  @media (max-width: 520px) {
    .ww .countdown-wrap { padding: 80px 14px; }
    .ww .countdown-row { gap: 8px; }
    .ww .countdown-block { padding: 18px 4px; outline-offset: -5px; }
    .ww .countdown-label { font-size: 10px; letter-spacing: 1.5px; }
  }

  /* details: a poster nailed up, the map in a double frame */
  .ww .details-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: center; margin-top: 18px; }
  .ww .details-grid.single { grid-template-columns: minmax(0, 520px); justify-content: center; }
  .ww .poster { position: relative; background: url(${IMG}/parchment.webp) center / 100% 100% no-repeat; padding: clamp(60px, 7vw, 84px) clamp(36px, 6vw, 70px); text-align: center; filter: drop-shadow(0 18px 24px rgba(43,27,18,0.3)); }
  .ww .poster .label { font-family: var(--ww-font-sans); letter-spacing: 5px; text-transform: uppercase; font-size: 15px; color: var(--ww-rust); margin: 0 0 8px; }
  .ww .poster .time { font-family: var(--ww-font-display); font-size: clamp(32px, 4vw, 44px); color: var(--ww-saddle); margin: 0 0 12px; line-height: 1.1; }
  .ww .poster p { font-size: 16px; line-height: 1.7; color: var(--ww-leather); margin: 0; }
  .ww .poster address { font-style: normal; }
  .ww .poster .venue { font-family: var(--ww-font-display); font-size: 22px; color: var(--ww-saddle); margin-top: 14px; line-height: 1.3; }
  .ww .poster .directions { display: inline-block; margin: 18px 10px 0; font-family: var(--ww-font-sans); letter-spacing: 3px; text-transform: uppercase; font-size: 14px; color: var(--ww-rust); padding: 10px 0; }
  .ww .map-frame { position: relative; aspect-ratio: 1; background: var(--ww-paper); border: 2px solid var(--ww-saddle); outline: 1px solid var(--ww-saddle); outline-offset: -10px; padding: 18px; }
  .ww .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; }
  @media (max-width: 760px) { .ww .details-grid { grid-template-columns: 1fr; gap: 36px; } .ww .map-frame { max-width: 420px; margin: 0 auto; width: 100%; } }

  /* program: the day's roundup on saddle brown */
  .ww .schedule-day { max-width: 760px; margin: 0 auto 40px; }
  .ww .schedule-day:last-child { margin-bottom: 0; }
  .ww .schedule-day-title { font-style: italic; color: ${HAY}; margin: 0 0 18px; font-size: 17px; }
  .ww .roundup { list-style: none; margin: 0; padding: 0; text-align: left; }
  .ww .roundup li { display: grid; grid-template-columns: 180px 28px minmax(0, 1fr); gap: 16px; align-items: start; padding: 20px 0; border-bottom: 1px dashed var(--ww-dust); }
  .ww .roundup li:last-child { border-bottom: 0; }
  .ww .roundup .when { font-family: var(--ww-font-sans); font-size: 18px; letter-spacing: 1px; color: var(--ww-gold); text-align: right; }
  .ww .roundup .star { color: var(--ww-gold); padding-top: 2px; }
  .ww .roundup .name { font-family: var(--ww-font-display); font-size: 22px; color: var(--ww-canvas); margin: 0; line-height: 1.3; }
  .ww .roundup .loc { color: ${HAY}; font-size: 15px; margin: 4px 0 0; }
  @media (max-width: 560px) {
    .ww .roundup li { grid-template-columns: 22px minmax(0, 1fr); gap: 4px 12px; }
    .ww .roundup .when { grid-column: 2; text-align: left; font-size: 15px; }
    .ww .roundup .star { grid-row: 1 / span 2; grid-column: 1; }
    .ww .roundup li > div { grid-column: 2; }
  }

  /* RSVP, Potluck and Gift Exchange: the form on a nailed-up poster */
  .ww .rsvp-section { padding: 112px 18px; background: ${PAPER_TEXTURE}, var(--ww-canvas); }
  .ww #potluck.rsvp-section { background: var(--ww-saddle); }
  .ww #gift-exchange.rsvp-section { background: var(--ww-rust); }
  .ww .poster-card { max-width: 660px; margin: 0 auto; text-align: left; padding: clamp(72px, 9vw, 96px) clamp(30px, 8vw, 78px) clamp(72px, 9vw, 92px); }
  .ww .poster-card .head { text-align: center; }
  .ww .poster-card .section-title { margin-bottom: 14px; }
  @media (max-width: 560px) { .ww .rsvp-section { padding: 80px 10px; } .ww .poster-card { padding: 72px 30px 76px; } }

  /* gallery: photos with a canvas border, like prints pinned to a barn wall */
  .ww .ww-gallery > div { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 16px !important; }
  .ww .ww-gallery button[style*="zoom-in"] { border: 8px solid var(--ww-paper) !important; border-radius: 0 !important; box-shadow: 0 2px 0 var(--ww-brass), 0 14px 24px -16px rgba(43,27,18,0.6) !important; }
  @media (max-width: 760px) { .ww .ww-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; } .ww .ww-gallery button[style*="zoom-in"] { border-width: 5px !important; } }

  /* registry and guest photos: dashed cards, like a stitched leather edge */
  .ww .stitched { max-width: 720px; margin: 0 auto; padding: 48px clamp(22px, 5vw, 48px); border: 2px dashed var(--ww-dust); background: rgba(251,245,235,0.6); text-align: center; }
  .ww .registry-photo { display: block; width: 100%; max-width: 420px; aspect-ratio: 4 / 3; object-fit: cover; margin: 0 auto 28px; border: 8px solid var(--ww-paper); box-shadow: 0 2px 0 var(--ww-brass); }
  .ww .registry-description { font-size: 16px; line-height: 1.8; color: var(--ww-leather); margin: 0 auto 28px; max-width: 520px; }

  /* songs: the jukebox on saddle brown */
  .ww .song-section { background: var(--ww-saddle); color: var(--ww-canvas); padding: 112px 24px; text-align: center; }
  .ww .song-section input::placeholder { color: rgba(244,234,219,0.5); }
  .ww .song-section label.field-label { color: ${HAY}; }
  .ww .song-section .btn { background: var(--ww-gold); border-color: var(--ww-gold); color: var(--ww-saddle); }
  .ww .song-section .btn:hover { background: var(--ww-canvas); border-color: var(--ww-canvas); }
  .ww .song-section .song-list { max-width: 620px; margin: 0 auto; text-align: left; }
  .ww .song-section .song-row { padding: 18px 0; border-top: 1px dashed var(--ww-dust); }
  .ww .song-section .song-row:last-child { border-bottom: 1px dashed var(--ww-dust); }
  .ww .song-section .song-row .title { color: var(--ww-canvas); font-weight: 700; }
  .ww .song-section .song-row .artist { color: ${HAY}; font-style: italic; }
  .ww .song-section p { color: ${HAY}; }
  @media (max-width: 640px) { .ww .song-section { padding: 80px 20px; } }

  /* share: the hashtag on old paper */
  .ww .share-band { padding: 104px 24px; text-align: center; background: ${PAPER_TEXTURE}, var(--ww-canvas); }
  .ww .share-band .eyebrow.on-dark { color: var(--ww-rust); }
  .ww .share-band .btn-outline.on-dark { color: var(--ww-saddle); border-color: var(--ww-saddle); border-width: 1px; }
  .ww .share-band .btn-outline.on-dark:hover { background: var(--ww-saddle); color: var(--ww-canvas); }
  .ww .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .ww .share-hashtag { font-family: var(--ww-font-display); font-weight: 400; font-size: clamp(20px, 5.4vw, 48px); color: var(--ww-saddle); margin: 0 0 30px; line-height: 1.15; overflow-wrap: anywhere; }

  /* footer: saddle brown under a double brass rule */
  .ww .footer { padding: 72px 24px 56px; background: var(--ww-saddle); color: ${HAY}; text-align: center; border-top: 3px double var(--ww-brass); }
  .ww .footer p { font-size: 15px; margin: 0 0 4px; }
  .ww .footer a { color: var(--ww-gold); text-decoration: none; }
  .ww .footer a:hover { color: var(--ww-canvas); }
  .ww .footer-signoff { font-family: var(--ww-font-display); font-size: clamp(24px, 3.4vw, 30px) !important; color: var(--ww-canvas) !important; margin: 34px 0 0 !important; line-height: 1.2; }
  .ww .footer-credit { font-size: 13px !important; color: rgba(234,219,196,0.65) !important; margin-top: 20px !important; }
  .ww .footer-credit a { color: var(--ww-gold) !important; text-decoration: underline; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const HERO_EYEBROW_DEFAULT = { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' };
// The theme's own section titles, used until the host writes their own.
const TITLES = {
  story: { en: 'How the trail led here', fr: 'Le chemin jusqu’ici', es: 'El camino hasta aquí' },
  program: { en: 'The day’s roundup', fr: 'Le programme de la journée', es: 'El programa del día' },
  rsvp: { en: 'Saddle up & RSVP', fr: 'En selle : répondez', es: 'Ensilla y confirma' },
  registry: { en: 'Gifts & giddy-ups', fr: 'Cadeaux & coups de chapeau', es: 'Regalos y buenos deseos' },
  songs: { en: 'Jukebox requests', fr: 'Le juke-box', es: 'La rocola' },
  contact: { en: 'Holler at us', fr: 'Faites-nous signe', es: 'Escríbenos' },
};
// The default banner photo's description, for search engines and screen readers.
const HERO_ALT = { en: 'Desert buttes under a sunset sky', fr: 'Buttes du désert sous un ciel de coucher de soleil', es: 'Mesetas del desierto bajo un cielo al atardecer' };

// The form on a nailed-up parchment poster.
function PosterCard({ children }: { children: React.ReactNode }) {
  return <Reveal className="poster poster-card">{children}</Reveal>;
}

export default function Western({
  heading,
  description,
  eventDate,
  eventTime,
  eventEndDate,
  eventEndTime,
  location,
  city,
  country,
  streetAddress,
  postalCode,
  formattedAddress,
  placeId,
  url,
  bannerImage,
  userEmail,
  userPhone,
  mapsKey,
  registryImage,
  registryDescription,
  registryButtonText,
  registryButtonLink,
  galleryImages,
  userPageId,
  galleryToken,
  editSlots,
  heroEyebrow,
  venueName,
  language,
  isPaid,
  guestPhotos,
  guestPhotosHasMore,
  guestSongs,
  guestSongsHasMore,
  heroObjectFit = 'cover',
  heroObjectPosition,
  heroOverlay,
  heroStyle,
  eventProgram,
  showEventProgram,
  showSongRequests,
  showGuestPhotos,
  showRsvp,
  showShare,
  shareHashtag,
  shareUrl,
  sectionText,
  sectionTextPageId,
  customSections,
  sponsors,
  livestream,
  potluck,
  giftExchange,
  isLoggedIn,
  demo,
}: ThemeProps) {
  const t: Translations = getTranslations(language);
  const isPreview = !!editSlots;
  // Forms are shown but can't be submitted in the editor or a showcase preview.
  const formsDisabled = isPreview || !!demo;
  const sectionTextCtx = { values: sectionText, pageId: sectionTextPageId };
  const heroDateText = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';
  const heroSrc = bannerImage || HERO_DEFAULTS.western;
  const title = (k: keyof typeof TITLES) => pickByLanguage(TITLES[k], language);

  const when = eventWhen({ eventDate, eventTime, eventEndDate, eventEndTime }, t.dateLocale);
  const formattedTime = when.time;

  const mapSrc = placeId && mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=place_id:${placeId}`
    : formattedAddress && mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(formattedAddress)}`
    : null;

  const mapsUrl = placeId
    ? `https://www.google.com/maps?q=place_id:${placeId}`
    : formattedAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(formattedAddress)}`
    : null;

  const showVenue = location === 'address';
  const showVirtual = location === 'virtual' && url;
  const textStyle: React.CSSProperties = { fontFamily: 'var(--ww-font-serif)', fontSize: 17, lineHeight: 1.85, color: LEATHER };

  const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
  const hasStory = !!(description || editSlots?.description);
  const hasDetails = !!(showVenue || showVirtual);
  const hasProgram = showEventProgram !== false && !!eventProgram && eventProgram.length > 0;
  const hasRsvp = showRsvp !== false;
  const hasGallery = !!editSlots?.gallery || gallery.length > 0;
  const hasRegistry = !!(registryDescription || registryButtonLink);
  const hasPhotos = !!galleryToken && showGuestPhotos !== false;
  const hasSongs = !!(isPaid && galleryToken && showSongRequests !== false);

  // The menu lists only the sections this page shows.
  const menu = [
    hasStory && { href: '#story', label: t.ourStoryLabel },
    hasDetails && { href: '#details', label: t.theDetails },
    hasProgram && { href: '#program', label: t.eventProgram },
    hasGallery && { href: '#gallery', label: t.ourMoments },
    hasRegistry && { href: '#registry', label: t.registry },
    hasPhotos && { href: '#photos', label: t.guestPhotos },
    hasSongs && { href: '#songs', label: t.songRequests },
  ].filter(Boolean) as { href: string; label: string }[];

  // Event details for search engines and AI assistants, on guests' pages only.
  const structuredData = !isPreview && !demo
    ? eventJsonLd({ heading, description, eventDate, eventTime, eventEndDate, eventEndTime, location, url, venueName, streetAddress, city, postalCode, country, image: heroSrc, pageUrl: shareUrl, language })
    : null;

  return (
    <div className="ww">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rye&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;500;600&display=swap" />
      <style>{css}</style>
      {structuredData && <JsonLd data={structuredData} />}
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* MENU — sticky on guests' pages; in the editor and previews it scrolls away */}
      <nav className={`ww-nav${isPreview || demo ? '' : ' is-sticky'}`} aria-label={heading || 'Menu'}>
        <div className="ww-nav-inner">
          <a href="#top" className="ww-mono">{monogram(heading || '').split(' & ').map((part, i) => (i ? <span key={i}> <span>&amp;</span> {part}</span> : part))}</a>
          <ul>
            {menu.map((m) => <li key={m.href}><a href={m.href}>{m.label}</a></li>)}
            {hasRsvp && <li><a href="#rsvp" className="ww-nav-rsvp">{t.rsvpBtn}</a></li>}
          </ul>
        </div>
      </nav>

      {/* HERO — the buttes at sundown, the names in Rye */}
      <header id="top" className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt={bannerImage ? '' : pickByLanguage(HERO_ALT, language)} fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        <div className="hero-veil" />
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}><Names heading={heading} /></h1>}
          <StarRule className="on-dark" />
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date" style={heroTextStyle(heroStyle?.text.date)}><time dateTime={eventDate}>{heroDateText}</time></p>)}
          <div className="hero-actions">
            <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            <HeroButton id="story" href="#story" className="btn btn-outline" label={t.ourStoryBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            {hasPhotos && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
          </div>
        </div>
      </header>

      <main>
        {/* STORY — on old paper */}
        {hasStory && (
          <section id="story" className="section section-paper section-center">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={title('story')} />
              <StarRule />
              {editSlots?.description ?? <p data-story-text className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
            </Reveal>
          </section>
        )}

        {/* COUNTDOWN — down the dirt road */}
        {eventDate && (
          <section className="countdown-shell" aria-label={t.countingDown}>
            <Countdown
              eventDate={eventDate}
              eventTime={eventTime}
              eyebrow={t.countingDown}
              heading={t.untilWeSayIDo}
              todayHeading={t.todayIsTheDay}
              unitLabels={{ days: t.days, hours: t.hours, mins: t.mins, secs: t.secs }}
              sectionText={sectionTextCtx}
            />
          </section>
        )}

        {/* DATE / LOCATION — a poster nailed up, the map in a double frame */}
        {hasDetails && (
          <section id="details" className="section section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <StarRule />
              <div className={`details-grid${mapSrc ? '' : ' single'}`}>
                <div className="poster">
                  <h3 className="label">{t.ceremony}</h3>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p><time dateTime={eventDate}>{when.date}</time></p>}
                  {(venueName || streetAddress || city) && (
                    <address>
                      {venueName && <p className="venue">{venueName}</p>}
                      {streetAddress && <p>{streetAddress}</p>}
                      {city && <p>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                    </address>
                  )}
                  {mapsUrl && <a className="directions" href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>}
                  {showVirtual && <a className="directions" href={url} target="_blank" rel="noopener noreferrer">{t.joinOnline}</a>}
                </div>
                {mapSrc && (
                  <div className="map-frame">
                    <iframe title={venueName ? `${venueName} — map` : 'Venue map'} src={mapSrc} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
              </div>
            </Reveal>
          </section>
        )}

        {/* LIVE STREAM (Plus) */}
        {isPaid && livestream && (
          <section id="livestream" className="section section-hay section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <StarRule />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="btn" textStyle={{ color: LEATHER }} />
            </Reveal>
          </section>
        )}

        {/* CUSTOM SECTIONS (Plus) */}
        {isPaid && customSections?.map((section, i) => (
          <section key={`custom-${section.position}`} className={`section section-center${i % 2 ? ' section-hay' : ' section-paper'}`}>
            <Reveal className="wrap">
              <StarRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </Reveal>
          </section>
        ))}

        {/* EVENT PROGRAM — the day's roundup on saddle brown */}
        {hasProgram && (
          <section id="program" className="section section-dark section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow on-dark" fallback={t.theSchedule} />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title on-dark" fallback={title('program')} />
              <StarRule className="on-dark" />
              {groupEventProgramByDate(eventProgram!).map((group) => (
                <div className="schedule-day" key={group.date}>
                  <p className="schedule-day-title"><time dateTime={group.date}>{formatProgramDate(group.date, t.dateLocale)}</time></p>
                  <ol className="roundup">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <span className="when">{formatProgramTime(item, t.dateLocale)}</span>
                        <span className="star"><Rowel size={22} /></span>
                        <div>
                          <h3 className="name">{item.name}</h3>
                          {item.location && <p className="loc">{item.location}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </Reveal>
          </section>
        )}

        {/* RSVP — on a poster nailed to old paper */}
        {hasRsvp && (
          <section id="rsvp" className="rsvp-section">
            <PosterCard>
              <div className="head">
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={title('rsvp')} />
                <StarRule />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </PosterCard>
          </section>
        )}

        {/* POTLUCK (Plus, off by default) — plain saddle brown */}
        {isPaid && potluck && (
          <section id="potluck" className="rsvp-section">
            <PosterCard>
              <div className="head">
                <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
                <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
                <StarRule />
              </div>
              <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
            </PosterCard>
          </section>
        )}

        {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) — plain rust */}
        {isPaid && giftExchange && (
          <section id="gift-exchange" className="rsvp-section">
            <PosterCard>
              <div className="head">
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
                <StarRule />
              </div>
              <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
            </PosterCard>
          </section>
        )}

        {/* GALLERY — prints pinned to the barn wall. Hidden on a live page
            until there are some; theme previews show sample photos. */}
        {hasGallery && (
          <section id="gallery" className="section section-hay section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
              <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
              <StarRule />
              <div style={{ height: 14 }} />
              {editSlots?.gallery ?? <div className="ww-gallery"><GalleryGrid images={gallery} /></div>}
            </Reveal>
          </section>
        )}

        {/* REGISTRY — a stitched card */}
        {hasRegistry && (
          <section id="registry" className="section section-paper section-center">
            <Reveal className="stitched">
              <p className="eyebrow">{t.registry}</p>
              <h2 className="section-title">{title('registry')}</h2>
              <StarRule />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {registryImage && <img className="registry-photo" src={registryImage} alt="" loading="lazy" decoding="async" />}
              {registryDescription && <p className="registry-description" style={{ whiteSpace: 'pre-line' }}>{registryDescription}</p>}
              {registryButtonLink && (
                <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  {registryButtonText || t.viewRegistry}
                </a>
              )}
            </Reveal>
          </section>
        )}

        {/* SPONSORS (Plus) */}
        {isPaid && sponsors && sponsors.length > 0 && (
          <section className="section section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <StarRule />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 2, border: `2px solid ${SADDLE}`, background: PAPER }} textStyle={{ color: LEATHER }} />
            </Reveal>
          </section>
        )}

        {/* GUEST PHOTOS — a stitched card */}
        {hasPhotos && (
          <section id="photos" className="section section-hay section-center">
            <Reveal className="stitched">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
              <StarRule />
              <GuestPhotoSection
                userPageId={galleryToken!}
                initialPhotos={guestPhotos ?? []}
                initialHasMore={guestPhotosHasMore ?? false}
                labels={{ shareYourPhoto: t.shareYourPhoto, loadMore: t.loadMore, beFirstToShare: t.beFirstToShare, photoUploaded: t.photoUploaded, photoUploadError: t.photoUploadError, uploading: t.sending }}
                btnClassName="btn"
                disabled={formsDisabled}
              />
            </Reveal>
          </section>
        )}

        {/* SONG REQUESTS — the jukebox */}
        {hasSongs && (
          <section id="songs" className="song-section">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow on-dark" fallback={t.buildOurPlaylist} />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title on-dark" fallback={title('songs')} />
              <StarRule className="on-dark" />
              <SongRequestSection
                userPageId={galleryToken!}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn"
                inputStyle={{ background: '#3A2619', color: CANVAS, border: `1px solid ${BRASS}`, borderRadius: 2, minHeight: 48 }}
                disabled={formsDisabled}
              />
            </Reveal>
          </section>
        )}

        {/* SHARE / HASHTAG — on old paper */}
        {showShare !== false && shareUrl && (
          <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
        )}
      </main>

      {/* FOOTER — saddle brown, the rowel, the contact and the sign-off */}
      <footer className="footer">
        <StarRule className="on-dark" />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 14 }} fallback={title('contact')} />
        {editSlots?.footerContact ?? (
          <address style={{ fontStyle: 'normal' }}>
            {heading && <p>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`}>{userPhone}</a></p>}
          </address>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer">mygala</a></p>
      </footer>
    </div>
  );
}
