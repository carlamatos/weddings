import type { ThemeProps, ThemePreviewProps } from './types';
import type { Translations } from '@/app/lib/translations';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import { Reveal } from './Reveal';
import { PreviewTopBar } from './PreviewTopBar';
import { Countdown } from './Countdown';
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

// "Blessings": a gentle theme for religious celebrations — baptisms and
// christenings (bautizo, baptême), first communions (primera comunión),
// confirmations and blessings. Ivory, soft gold and ink with a pale sky glow,
// Cormorant Garamond and Lato. With no banner photo, the cover is a soft sky
// with a dove carrying an olive branch inside a thin gold frame; olive sprigs
// mark the sections. Built from the Simple theme, so every section and
// feature works the same way.

// Soft, white and floral: from The Day and the neutral baby shower themes.
const GALLERY_PATHS = ['the-day/arch', 'the-day/bouquet', 'the-day/photo-2', 'the-day/photo-3', 'the-day/photo-4', 'the-day/photo-5', 'the-day/photo-8', 'baby-shower-neutral/photo-2']
  .map((p) => `/images/themes/${p}.jpeg`);
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `sm-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

const IVORY = '#FBF8F1';
const WHITE = '#FFFFFF';
const SAND = '#F3EEE2';
const LINE = '#E2D6BC';
const INK = '#2E2C3A';
const STONE = '#6E6A78';
const TAUPE = '#B08D57';
const TAUPE_DEEP = '#8A6A37';
const SKY = '#E6EEF5';

// ─── decorations ─────────────────────────────────────────

// A small olive sprig between two hairlines — the section ornament.
function Rule({ className = '' }: { className?: string }) {
  return (
    <div className={`bls-rule ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 18" width="64" height="18" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M8 9h16M40 9h16" opacity=".6" />
        <path d="M24 12c3-2 6-3 10-3s6 1 7 3" />
        <path d="M28 10.5c-.5-2.4 1-4.2 3.2-4.4M33 9.4c.2-2.6 2-4 4.2-3.8M30.5 11c-1.8 1.4-2 3.4-.6 4.6M35.6 10.4c-1 2 -.4 3.8 1.4 4.4" />
      </svg>
    </div>
  );
}

// A dove carrying an olive branch, for the default cover.
function Dove() {
  return (
    <svg className="hero-dove" viewBox="0 0 120 80" aria-hidden="true">
      <path fill="#FFFFFF" stroke="#B08D57" strokeWidth="1.2" strokeLinejoin="round" d="M18 46c10-2 18-8 24-17 4-6 10-9 17-8-5 3-7 7-7 11 7-8 18-13 31-12-9 4-15 10-18 17 9-3 18-2 26 2-10 1-18 5-24 11-6 6-15 9-26 9H30l-8 8 2-10-10-5z" />
      <circle cx="57" cy="27" r="1.4" fill="#2E2C3A" />
      <path fill="none" stroke="#7E8C5A" strokeWidth="1.3" strokeLinecap="round" d="M50 30c-6 2-11 6-14 11" />
      <path fill="#9DAA72" d="M41 35c-3-1-5 1-5 3 3 1 5-1 5-3zM45 32c-3-2-5-.5-5.5 1.7 3 1.2 5-.2 5.5-1.7zM38 39c-3 0-4.4 2.2-3.7 4 3 .3 4.3-1.8 3.7-4z" />
    </svg>
  );
}

// ─── the default banner ──────────────────────────────────

// A soft sky with a dove inside a thin gold frame, shown until the host adds a photo.
// A span, not a div: the editor's banner slot puts it inside a <span>.
export function BlessingsDefaultHero() {
  return (
    <span className="hero-plain" aria-hidden="true">
      <span className="hero-frame" />
      <span className="hero-dove-wrap"><Dove /></span>
    </span>
  );
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  const ink = bannerImage ? WHITE : INK;
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: IVORY, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {bannerImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...previewImage(bannerImage)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(38,35,31,0.45)' }} />
        </>
      ) : (
        <div style={{ position: 'absolute', inset: 14, border: `1px solid ${LINE}` }} />
      )}
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own faces */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Lato:wght@400&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 28px' }}>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: bannerImage ? WHITE : TAUPE, margin: '0 0 10px' }}>You’re invited</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, fontSize: 'clamp(26px, 4.4vw, 36px)', color: ink, margin: '0 0 10px', lineHeight: 1.15 }}>{heading || 'Blessings'}</h2>
        {date && <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: bannerImage ? WHITE : STONE, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .bls {
    --bls-ivory: ${IVORY};
    --bls-white: ${WHITE};
    --bls-sand: ${SAND};
    --bls-line: ${LINE};
    --bls-ink: ${INK};
    --bls-stone: ${STONE};
    --bls-taupe: ${TAUPE};
    --bls-font-display: 'Cormorant Garamond', Georgia, serif;
    --bls-font-sans: 'Lato', 'Helvetica Neue', Arial, sans-serif;
  }
  .bls * { box-sizing: border-box; }
  .bls { margin: 0; background: var(--bls-ivory); color: var(--bls-ink); font-family: var(--bls-font-sans); overflow-x: clip; -webkit-font-smoothing: antialiased; }
  .bls img { max-width: 100%; }
  .bls a { color: var(--bls-ink); text-underline-offset: 3px; }
  .bls a:hover { color: ${TAUPE_DEEP}; }
  .bls :focus-visible { outline: 2px solid var(--bls-taupe); outline-offset: 3px; }

  @keyframes bls-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .bls .hero-content > * { animation: none !important; } }

  .bls .bls-rule { width: 64px; height: 18px; color: var(--bls-taupe); margin: 0 auto 26px; }
  .bls .bls-rule svg { display: block; }
  .bls .bls-rule.on-dark { color: rgba(255,255,255,0.8); }

  .bls .eyebrow { font-family: var(--bls-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 3.5px; text-transform: uppercase; color: var(--bls-taupe); margin: 0 0 14px; }
  .bls .eyebrow.on-dark { color: rgba(255,255,255,0.8); }
  .bls .section-title { font-family: var(--bls-font-display); font-size: clamp(30px, 4vw, 42px); font-weight: 400; color: var(--bls-ink); margin: 0 0 22px; line-height: 1.2; }
  .bls .section-title.on-dark { color: var(--bls-white); }

  .bls .wrap { max-width: 680px; margin: 0 auto; }
  .bls .wrap-wide { max-width: 1040px; margin: 0 auto; }
  .bls .section { position: relative; padding: 104px 24px; background: var(--bls-ivory); }
  .bls .section-white { background: var(--bls-white); }
  .bls .section-sand { background: var(--bls-sand); }
  .bls .section-dark { background: var(--bls-ink); color: var(--bls-white); }
  .bls .section-center { text-align: center; }
  @media (max-width: 640px) { .bls .section { padding: 76px 20px; } }

  .bls .btn { font-family: var(--bls-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; padding: 15px 30px; min-height: 48px; border-radius: 0; border: 1px solid var(--bls-ink); background: var(--bls-ink); color: var(--bls-white); cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; line-height: 1; transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
  .bls .btn:hover { background: ${TAUPE_DEEP}; border-color: ${TAUPE_DEEP}; color: var(--bls-white); }
  .bls .btn-outline { background: transparent; color: var(--bls-ink); }
  .bls .btn-outline:hover { background: var(--bls-ink); border-color: var(--bls-ink); color: var(--bls-white); }
  .bls .btn-outline.on-dark { color: var(--bls-white); border-color: rgba(255,255,255,0.8); }
  .bls .btn-outline.on-dark:hover { background: var(--bls-white); border-color: var(--bls-white); color: var(--bls-ink); }

  .bls input, .bls textarea, .bls select { font-family: var(--bls-font-sans); font-size: 15px; padding: 13px 14px; min-height: 48px; border: 1px solid var(--bls-line); border-radius: 0; outline: none; background: var(--bls-white); color: var(--bls-ink); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .bls textarea { min-height: 0; }
  .bls input:focus, .bls textarea:focus, .bls select:focus { border-color: var(--bls-taupe); box-shadow: 0 0 0 3px rgba(140,123,107,0.18); }
  .bls input::placeholder, .bls textarea::placeholder { color: rgba(38,35,31,0.4); }
  .bls label.field-label { font-family: var(--bls-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--bls-stone); display: block; margin-bottom: 7px; }
  .bls .radio-label, .bls .check-label { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 15px; color: var(--bls-ink); cursor: pointer; }
  .bls .radio-label input, .bls .check-label input { width: 20px; height: 20px; min-height: 0; border: none; padding: 0; accent-color: var(--bls-ink); box-shadow: none; }
  .bls .check-hint { font-size: 12px; color: var(--bls-stone); margin: 4px 0 0; }
  .bls .attend-options { display: flex; gap: 6px 22px; margin-top: 4px; flex-wrap: wrap; }
  .bls .rsvp-error { color: #9B2C1F; font-size: 13px; margin: 0; }
  .bls .rsvp-success { text-align: center; padding: 20px 0; }
  .bls .rsvp-headline { font-family: var(--bls-font-display); font-size: 38px; color: var(--bls-ink); margin: 0 0 8px; font-weight: 400; line-height: 1.15; }
  .bls .rsvp-sub { font-size: 14px; color: var(--bls-stone); margin: 0; }
  .bls .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: plain ivory in a thin frame, or the host's photo under a veil */
  .bls .hero { position: relative; min-height: 82vh; display: flex; align-items: center; justify-content: center; padding: 120px 24px; background: var(--bls-ivory); overflow: hidden; text-align: center; color: var(--bls-ink); }
  .bls .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .bls .hero-plain { position: absolute; inset: 0; z-index: 0; display: block; background: radial-gradient(ellipse 90% 70% at 50% 0%, ${SKY} 0%, var(--bls-ivory) 70%); }
  .bls .hero-frame { position: absolute; inset: clamp(14px, 3vw, 32px); display: block; border: 1px solid var(--bls-line); outline: 1px solid rgba(176,141,87,0.35); outline-offset: -7px; }
  .bls .hero-dove-wrap { position: absolute; left: 50%; top: clamp(40px, 9vh, 90px); transform: translateX(-50%); display: block; width: clamp(120px, 14vw, 170px); }
  .bls .hero-dove { display: block; width: 100%; height: auto; filter: drop-shadow(0 6px 14px rgba(46,44,58,0.10)); }
  .bls .hero-veil { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: rgba(38,35,31,0.42); }
  .bls .hero-content { position: relative; z-index: 2; max-width: 820px; }
  .bls .hero-content > * { animation: bls-in 1s ease both; }
  .bls .hero-eyebrow { animation-delay: 0.15s !important; font-size: 13px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--bls-taupe); margin: 0 0 22px; }
  .bls .hero-name { animation-delay: 0.3s !important; font-family: var(--bls-font-display); font-weight: 400; font-size: clamp(44px, 8vw, 96px); line-height: 1.08; color: var(--bls-ink); margin: 0; overflow-wrap: anywhere; }
  .bls .hero-content > .bls-rule { animation-delay: 0.45s !important; margin: 30px auto 22px; }
  .bls .hero-date { animation-delay: 0.55s !important; font-size: 15px; letter-spacing: 2px; text-transform: uppercase; color: var(--bls-stone); margin: 0 0 36px; }
  .bls .hero-actions { animation-delay: 0.7s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .bls .hero.has-photo .hero-eyebrow, .bls .hero.has-photo .hero-date { color: rgba(255,255,255,0.88); }
  .bls .hero.has-photo .hero-name { color: var(--bls-white); text-shadow: 0 2px 18px rgba(0,0,0,0.25); }
  .bls .hero.has-photo .bls-rule { background: rgba(255,255,255,0.7); }
  .bls .hero.has-photo .btn { background: var(--bls-white); border-color: var(--bls-white); color: var(--bls-ink); }
  .bls .hero.has-photo .btn:hover { background: var(--bls-sand); border-color: var(--bls-sand); }
  .bls .hero.has-photo .btn-outline { background: transparent; color: var(--bls-white); border-color: rgba(255,255,255,0.85); }
  .bls .hero.has-photo .btn-outline:hover { background: var(--bls-white); color: var(--bls-ink); }
  @media (max-width: 640px) {
    .bls .hero { min-height: 76vh; padding: 96px 28px; }
    .bls .hero-eyebrow { letter-spacing: 3px; font-size: 12px; }
    .bls .hero-date { font-size: 13px; }
  }

  /* about */
  .bls .story-text { font-size: 18px; line-height: 1.85; color: var(--bls-stone); margin: 0 auto; max-width: 620px; }

  /* countdown: white numbers on charcoal */
  .bls .countdown-shell { background: var(--bls-ink); }
  .bls .countdown-wrap { padding: 96px 24px; text-align: center; }
  .bls .countdown-wrap .eyebrow { color: rgba(255,255,255,0.7); }
  .bls .countdown-heading { font-family: var(--bls-font-display); font-weight: 400; font-size: clamp(30px, 4.4vw, 46px); color: var(--bls-white); margin: 0 0 40px; line-height: 1.15; }
  .bls .countdown-row { max-width: 680px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border: 1px solid rgba(255,255,255,0.22); }
  .bls .countdown-block { padding: 26px 8px; color: var(--bls-white); }
  .bls .countdown-block + .countdown-block { border-left: 1px solid rgba(255,255,255,0.22); }
  .bls .countdown-value { font-family: var(--bls-font-display); font-size: clamp(30px, 5vw, 50px); line-height: 1.1; }
  .bls .countdown-label { font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.65); margin-top: 6px; }
  @media (max-width: 520px) {
    .bls .countdown-wrap { padding: 76px 14px; }
    .bls .countdown-block { padding: 18px 4px; }
    .bls .countdown-label { font-size: 10px; letter-spacing: 1.5px; }
  }

  /* details: a white card, the map beside it */
  .bls .details-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; align-items: stretch; margin-top: 12px; }
  .bls .details-grid.single { grid-template-columns: minmax(0, 520px); justify-content: center; }
  .bls .details-card { background: var(--bls-white); border: 1px solid var(--bls-line); padding: clamp(40px, 6vw, 64px) clamp(28px, 5vw, 56px); display: flex; flex-direction: column; justify-content: center; }
  .bls .details-card .label { font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--bls-taupe); margin: 0 0 12px; }
  .bls .details-card .time { font-family: var(--bls-font-display); font-size: clamp(28px, 3.6vw, 38px); color: var(--bls-ink); margin: 0 0 10px; line-height: 1.15; }
  .bls .details-card p { font-size: 16px; line-height: 1.7; color: var(--bls-stone); margin: 0; }
  .bls .details-card address { font-style: normal; }
  .bls .details-card .venue { font-family: var(--bls-font-display); font-size: 21px; color: var(--bls-ink); margin-top: 16px; line-height: 1.3; }
  .bls .details-card .directions { display: inline-block; margin: 20px 10px 0; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 10px 0; }
  .bls .map-frame { min-height: 340px; border: 1px solid var(--bls-line); background: var(--bls-white); }
  .bls .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 340px; }
  @media (max-width: 760px) { .bls .details-grid { grid-template-columns: 1fr; gap: 24px; } }

  /* program: a plain list with times */
  .bls .schedule-day { max-width: 720px; margin: 0 auto 40px; }
  .bls .schedule-day:last-child { margin-bottom: 0; }
  .bls .schedule-day-title { font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--bls-taupe); margin: 0 0 14px; }
  .bls .timeline { list-style: none; margin: 0; padding: 0; text-align: left; border-top: 1px solid var(--bls-line); }
  .bls .timeline li { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 20px; padding: 20px 0; border-bottom: 1px solid var(--bls-line); }
  .bls .timeline .when { font-size: 15px; font-weight: 700; letter-spacing: 1px; color: var(--bls-ink); }
  .bls .timeline .name { font-family: var(--bls-font-display); font-size: 21px; color: var(--bls-ink); margin: 0; line-height: 1.3; }
  .bls .timeline .loc { color: var(--bls-stone); font-size: 15px; margin: 4px 0 0; }
  @media (max-width: 560px) { .bls .timeline li { grid-template-columns: 1fr; gap: 4px; } }

  /* RSVP, Potluck and Gift Exchange: a white card */
  .bls .rsvp-section { padding: 104px 18px; background: var(--bls-sand); }
  .bls #potluck.rsvp-section { background: var(--bls-ivory); }
  .bls .form-card { max-width: 640px; margin: 0 auto; text-align: left; background: var(--bls-white); border: 1px solid var(--bls-line); padding: clamp(40px, 7vw, 72px) clamp(24px, 7vw, 64px); }
  .bls .form-card .head { text-align: center; }
  .bls .form-card .section-title { margin-bottom: 14px; }
  @media (max-width: 560px) { .bls .rsvp-section { padding: 76px 12px; } }

  /* gallery: square photos with a little space */
  .bls .bls-gallery > div { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 12px !important; }
  .bls .bls-gallery button[style*="zoom-in"] { border-radius: 0 !important; }
  @media (max-width: 760px) { .bls .bls-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; } }

  /* registry and guest photos: an outlined card */
  .bls .outlined { max-width: 680px; margin: 0 auto; padding: 48px clamp(22px, 5vw, 48px); border: 1px solid var(--bls-line); background: var(--bls-white); text-align: center; }
  .bls .registry-photo { display: block; width: 100%; max-width: 420px; aspect-ratio: 4 / 3; object-fit: cover; margin: 0 auto 28px; }
  .bls .registry-description { font-size: 16px; line-height: 1.8; color: var(--bls-stone); margin: 0 auto 28px; max-width: 520px; }

  /* songs: on charcoal */
  .bls .song-section { background: var(--bls-ink); color: var(--bls-white); padding: 104px 24px; text-align: center; }
  .bls .song-section input::placeholder { color: rgba(255,255,255,0.45); }
  .bls .song-section label.field-label { color: rgba(255,255,255,0.7); }
  .bls .song-section .btn { background: var(--bls-white); border-color: var(--bls-white); color: var(--bls-ink); }
  .bls .song-section .btn:hover { background: var(--bls-sand); border-color: var(--bls-sand); }
  .bls .song-section .song-list { max-width: 620px; margin: 0 auto; text-align: left; }
  .bls .song-section .song-row { padding: 18px 0; border-top: 1px solid rgba(255,255,255,0.18); }
  .bls .song-section .song-row:last-child { border-bottom: 1px solid rgba(255,255,255,0.18); }
  .bls .song-section .song-row .title { color: var(--bls-white); font-weight: 700; }
  .bls .song-section .song-row .artist { color: rgba(255,255,255,0.7); }
  .bls .song-section p { color: rgba(255,255,255,0.7); }
  @media (max-width: 640px) { .bls .song-section { padding: 76px 20px; } }

  /* share */
  .bls .share-band { padding: 96px 24px; text-align: center; background: var(--bls-white); border-top: 1px solid var(--bls-line); }
  .bls .share-band .eyebrow.on-dark { color: var(--bls-taupe); }
  .bls .share-band .btn-outline.on-dark { color: var(--bls-ink); border-color: var(--bls-ink); }
  .bls .share-band .btn-outline.on-dark:hover { background: var(--bls-ink); color: var(--bls-white); }
  .bls .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .bls .share-hashtag { font-family: var(--bls-font-display); font-weight: 400; font-size: clamp(20px, 5vw, 42px); color: var(--bls-ink); margin: 0 0 30px; line-height: 1.2; overflow-wrap: anywhere; }

  /* footer: charcoal */
  .bls .footer { padding: 72px 24px 56px; background: var(--bls-ink); color: rgba(255,255,255,0.75); text-align: center; }
  .bls .footer p { font-size: 15px; margin: 0 0 4px; }
  .bls .footer a { color: var(--bls-white); text-decoration: none; }
  .bls .footer a:hover { color: var(--bls-sand); }
  .bls .footer-signoff { font-family: var(--bls-font-display); font-size: clamp(24px, 3.4vw, 30px) !important; color: var(--bls-white) !important; margin: 32px 0 0 !important; line-height: 1.25; }
  .bls .footer-credit { font-size: 13px !important; color: rgba(255,255,255,0.5) !important; margin-top: 20px !important; }
  .bls .footer-credit a { text-decoration: underline; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

// The theme's own wording, for any kind of event (the shared translations
// lean on weddings: "Our story", "Until we say I do", "The couple").
const WORDS = {
  eyebrow: { en: 'You’re invited', fr: 'Vous êtes invités', es: 'Estás invitado' },
  details: { en: 'Details', fr: 'Détails', es: 'Detalles' },
  welcome: { en: 'Welcome', fr: 'Bienvenue', es: 'Bienvenidos' },
  aboutTitle: { en: 'About the event', fr: 'À propos de l’événement', es: 'Sobre el evento' },
  countdown: { en: 'Until the event', fr: 'Avant l’événement', es: 'Hasta el evento' },
  today: { en: 'It’s today!', fr: 'C’est aujourd’hui !', es: '¡Es hoy!' },
  whenWhere: { en: 'When & where', fr: 'Quand et où', es: 'Cuándo y dónde' },
  program: { en: 'What’s happening', fr: 'Au programme', es: 'Lo que pasará' },
  rsvp: { en: 'Will you join us?', fr: 'Serez-vous des nôtres ?', es: '¿Nos acompañas?' },
  gallery: { en: 'Photos', fr: 'Photos', es: 'Fotos' },
  registry: { en: 'Gifts', fr: 'Cadeaux', es: 'Regalos' },
  songs: { en: 'Add a song', fr: 'Ajoutez une chanson', es: 'Añade una canción' },
  signoff: { en: 'See you there', fr: 'À bientôt', es: '¡Nos vemos allí!' },
};

export default function Blessings({
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
  const word = (k: keyof typeof WORDS) => pickByLanguage(WORDS[k], language);

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--bls-font-sans)', fontSize: 17, lineHeight: 1.85, color: STONE };

  const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
  const hasStory = !!(description || editSlots?.description);
  const hasDetails = !!(showVenue || showVirtual);
  const hasProgram = showEventProgram !== false && !!eventProgram && eventProgram.length > 0;
  const hasRsvp = showRsvp !== false;
  const hasGallery = !!editSlots?.gallery || gallery.length > 0;
  const hasRegistry = !!(registryDescription || registryButtonLink);
  const hasPhotos = !!galleryToken && showGuestPhotos !== false;
  const hasSongs = !!(isPaid && galleryToken && showSongRequests !== false);
  // With a photo the banner text turns light; plain ivory keeps it dark. In
  // the editor the background slot decides, so follow the uploaded banner.
  const hasPhoto = !!bannerImage;

  // Event details for search engines and AI assistants, on guests' pages only.
  const structuredData = !isPreview && !demo
    ? eventJsonLd({ heading, description, eventDate, eventTime, eventEndDate, eventEndTime, location, url, venueName, streetAddress, city, postalCode, country, image: bannerImage, pageUrl: shareUrl, language })
    : null;

  return (
    <div className="bls">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Lato:wght@400;700&display=swap" />
      <style>{css}</style>
      {structuredData && <JsonLd data={structuredData} />}
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO — plain ivory in a thin frame, or the host's photo */}
      <header id="top" className={`hero${hasPhoto ? ' has-photo' : ''}`}>
        {editSlots?.heroBg ?? (bannerImage ? (
          isVideoUrl(bannerImage) ? (
            <video className="hero-bg" src={bannerImage} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage} alt="" fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        ) : (
          <BlessingsDefaultHero />
        ))}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        {hasPhoto && <div className="hero-veil" />}
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || word('eyebrow')}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}>{heading}</h1>}
          <Rule />
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date" style={heroTextStyle(heroStyle?.text.date)}><time dateTime={eventDate}>{heroDateText}</time></p>)}
          <div className="hero-actions">
            <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            <HeroButton id="story" href="#story" className="btn btn-outline" label={word('details')} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            {hasPhotos && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
          </div>
        </div>
      </header>

      <main>
        {/* ABOUT */}
        {hasStory && (
          <section id="story" className="section section-white section-center">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={word('welcome')} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={word('aboutTitle')} />
              <Rule />
              {editSlots?.description ?? <p data-story-text className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
            </Reveal>
          </section>
        )}

        {/* COUNTDOWN — on charcoal */}
        {eventDate && (
          <section className="countdown-shell" aria-label={t.countingDown}>
            <Countdown
              eventDate={eventDate}
              eventTime={eventTime}
              eyebrow={t.countingDown}
              heading={word('countdown')}
              todayHeading={word('today')}
              unitLabels={{ days: t.days, hours: t.hours, mins: t.mins, secs: t.secs }}
              sectionText={sectionTextCtx}
            />
          </section>
        )}

        {/* DATE / LOCATION — a white card, the map beside it */}
        {hasDetails && (
          <section id="details" className="section section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <Rule />
              <div className={`details-grid${mapSrc ? '' : ' single'}`}>
                <div className="details-card">
                  <h3 className="label">{word('whenWhere')}</h3>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p><time dateTime={eventDate}>{when.date}</time></p>}
                  {(venueName || streetAddress || city) && (
                    <address>
                      {venueName && <p className="venue">{venueName}</p>}
                      {streetAddress && <p>{streetAddress}</p>}
                      {city && <p>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                    </address>
                  )}
                  <div>
                    {mapsUrl && <a className="directions" href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>}
                    {showVirtual && <a className="directions" href={url} target="_blank" rel="noopener noreferrer">{t.joinOnline}</a>}
                  </div>
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
          <section id="livestream" className="section section-sand section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <Rule />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="btn" textStyle={{ color: STONE }} />
            </Reveal>
          </section>
        )}

        {/* CUSTOM SECTIONS (Plus) */}
        {customSections?.map((section, i) => (
          <section key={`custom-${section.position}`} className={`section section-center${i % 2 ? ' section-sand' : ' section-white'}`}>
            <Reveal className="wrap">
              <Rule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </Reveal>
          </section>
        ))}

        {/* EVENT PROGRAM — a plain list with times */}
        {hasProgram && (
          <section id="program" className="section section-white section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" fallback={word('program')} />
              <Rule />
              {groupEventProgramByDate(eventProgram!).map((group) => (
                <div className="schedule-day" key={group.date}>
                  <p className="schedule-day-title"><time dateTime={group.date}>{formatProgramDate(group.date, t.dateLocale)}</time></p>
                  <ol className="timeline">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <span className="when">{formatProgramTime(item, t.dateLocale)}</span>
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

        {/* RSVP — a white card on sand */}
        {hasRsvp && (
          <section id="rsvp" className="rsvp-section">
            <Reveal className="form-card">
              <div className="head">
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={word('rsvp')} />
                <Rule />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* POTLUCK (Plus, off by default) */}
        {potluck && (
          <section id="potluck" className="rsvp-section">
            <Reveal className="form-card">
              <div className="head">
                <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
                <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
                <Rule />
              </div>
              <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) */}
        {giftExchange && (
          <section id="gift-exchange" className="rsvp-section">
            <Reveal className="form-card">
              <div className="head">
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
                <Rule />
              </div>
              <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* GALLERY — hidden on a live page until there are photos; theme
            previews show sample photos. */}
        {hasGallery && (
          <section id="gallery" className="section section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
              <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={word('gallery')} />
              <Rule />
              <div style={{ height: 8 }} />
              {editSlots?.gallery ?? <div className="bls-gallery"><GalleryGrid images={gallery} /></div>}
            </Reveal>
          </section>
        )}

        {/* REGISTRY — an outlined card */}
        {hasRegistry && (
          <section id="registry" className="section section-sand section-center">
            <Reveal className="outlined">
              <p className="eyebrow">{t.registry}</p>
              <h2 className="section-title">{word('registry')}</h2>
              <Rule />
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
          <section className="section section-white section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <Rule />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 0, border: `1px solid ${LINE}`, background: WHITE }} textStyle={{ color: STONE }} />
            </Reveal>
          </section>
        )}

        {/* GUEST PHOTOS — an outlined card */}
        {hasPhotos && (
          <section id="photos" className="section section-center">
            <Reveal className="outlined">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
              <Rule />
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

        {/* SONG REQUESTS — on charcoal */}
        {hasSongs && (
          <section id="songs" className="song-section">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow on-dark" fallback={t.buildOurPlaylist} />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title on-dark" fallback={word('songs')} />
              <Rule className="on-dark" />
              <SongRequestSection
                userPageId={galleryToken!}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn"
                inputStyle={{ background: '#34302B', color: WHITE, border: '1px solid rgba(255,255,255,0.25)', borderRadius: 0, minHeight: 48 }}
                disabled={formsDisabled}
              />
            </Reveal>
          </section>
        )}

        {/* SHARE / HASHTAG */}
        {showShare !== false && shareUrl && (
          <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
        )}
      </main>

      {/* FOOTER — charcoal, the contact and the sign-off */}
      <footer className="footer">
        <Rule className="on-dark" />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 14 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <address style={{ fontStyle: 'normal' }}>
            {heading && <p>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`}>{userPhone}</a></p>}
          </address>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={word('signoff')} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer">mygala</a></p>
      </footer>
    </div>
  );
}
