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

// "Simple": a quiet, neutral theme for any kind of event — ivory, stone and
// charcoal, Playfair Display and Lato, lots of space and no decoration
// beyond thin rules. The create form starts here when a visitor didn't come
// from a wedding, party or Christmas page (app/ui/subscribe-form.tsx). No
// banner photo by default: the banner is plain ivory inside a thin frame
// until the host adds their own picture (then it sits under a soft veil
// with light text).

// Gatherings of every kind, from the Community Day theme.
const GALLERY_PATHS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/images/themes/community/celebration-${n}.jpeg`);
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `sm-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

const IVORY = '#FAF8F4';
const WHITE = '#FFFFFF';
const SAND = '#F1EDE6';
const LINE = '#DDD6CB';
const INK = '#26231F';
const STONE = '#6E6860';
const TAUPE = '#8C7B6B';
const TAUPE_DEEP = '#6F6052';

// ─── decorations ─────────────────────────────────────────

// A short thin line — the only ornament.
function Rule({ className = '' }: { className?: string }) {
  return <div className={`smp-rule ${className}`} aria-hidden="true" />;
}

// ─── the default banner ──────────────────────────────────

// Plain ivory with a thin inset frame, shown until the host adds a photo.
// A span, not a div: the editor's banner slot puts it inside a <span>.
export function SimpleDefaultHero() {
  return (
    <span className="hero-plain" aria-hidden="true">
      <span className="hero-frame" />
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
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&family=Lato:wght@400&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 28px' }}>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: bannerImage ? WHITE : TAUPE, margin: '0 0 10px' }}>You’re invited</p>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontSize: 'clamp(26px, 4.4vw, 36px)', color: ink, margin: '0 0 10px', lineHeight: 1.15 }}>{heading || 'Simple'}</h2>
        {date && <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: bannerImage ? WHITE : STONE, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .smp {
    --smp-ivory: ${IVORY};
    --smp-white: ${WHITE};
    --smp-sand: ${SAND};
    --smp-line: ${LINE};
    --smp-ink: ${INK};
    --smp-stone: ${STONE};
    --smp-taupe: ${TAUPE};
    --smp-font-display: 'Playfair Display', Georgia, serif;
    --smp-font-sans: 'Lato', 'Helvetica Neue', Arial, sans-serif;
  }
  .smp * { box-sizing: border-box; }
  .smp { margin: 0; background: var(--smp-ivory); color: var(--smp-ink); font-family: var(--smp-font-sans); overflow-x: clip; -webkit-font-smoothing: antialiased; }
  .smp img { max-width: 100%; }
  .smp a { color: var(--smp-ink); text-underline-offset: 3px; }
  .smp a:hover { color: ${TAUPE_DEEP}; }
  .smp :focus-visible { outline: 2px solid var(--smp-taupe); outline-offset: 3px; }

  @keyframes smp-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) { .smp .hero-content > * { animation: none !important; } }

  .smp .smp-rule { width: 48px; height: 1px; background: var(--smp-taupe); margin: 0 auto 28px; }
  .smp .smp-rule.on-dark { background: rgba(255,255,255,0.7); }

  .smp .eyebrow { font-family: var(--smp-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 3.5px; text-transform: uppercase; color: var(--smp-taupe); margin: 0 0 14px; }
  .smp .eyebrow.on-dark { color: rgba(255,255,255,0.8); }
  .smp .section-title { font-family: var(--smp-font-display); font-size: clamp(30px, 4vw, 42px); font-weight: 400; color: var(--smp-ink); margin: 0 0 22px; line-height: 1.2; }
  .smp .section-title.on-dark { color: var(--smp-white); }

  .smp .wrap { max-width: 680px; margin: 0 auto; }
  .smp .wrap-wide { max-width: 1040px; margin: 0 auto; }
  .smp .section { position: relative; padding: 104px 24px; background: var(--smp-ivory); }
  .smp .section-white { background: var(--smp-white); }
  .smp .section-sand { background: var(--smp-sand); }
  .smp .section-dark { background: var(--smp-ink); color: var(--smp-white); }
  .smp .section-center { text-align: center; }
  @media (max-width: 640px) { .smp .section { padding: 76px 20px; } }

  .smp .btn { font-family: var(--smp-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; padding: 15px 30px; min-height: 48px; border-radius: 0; border: 1px solid var(--smp-ink); background: var(--smp-ink); color: var(--smp-white); cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; line-height: 1; transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }
  .smp .btn:hover { background: ${TAUPE_DEEP}; border-color: ${TAUPE_DEEP}; color: var(--smp-white); }
  .smp .btn-outline { background: transparent; color: var(--smp-ink); }
  .smp .btn-outline:hover { background: var(--smp-ink); border-color: var(--smp-ink); color: var(--smp-white); }
  .smp .btn-outline.on-dark { color: var(--smp-white); border-color: rgba(255,255,255,0.8); }
  .smp .btn-outline.on-dark:hover { background: var(--smp-white); border-color: var(--smp-white); color: var(--smp-ink); }

  .smp input, .smp textarea, .smp select { font-family: var(--smp-font-sans); font-size: 15px; padding: 13px 14px; min-height: 48px; border: 1px solid var(--smp-line); border-radius: 0; outline: none; background: var(--smp-white); color: var(--smp-ink); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .smp textarea { min-height: 0; }
  .smp input:focus, .smp textarea:focus, .smp select:focus { border-color: var(--smp-taupe); box-shadow: 0 0 0 3px rgba(140,123,107,0.18); }
  .smp input::placeholder, .smp textarea::placeholder { color: rgba(38,35,31,0.4); }
  .smp label.field-label { font-family: var(--smp-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--smp-stone); display: block; margin-bottom: 7px; }
  .smp .radio-label, .smp .check-label { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 15px; color: var(--smp-ink); cursor: pointer; }
  .smp .radio-label input, .smp .check-label input { width: 20px; height: 20px; min-height: 0; border: none; padding: 0; accent-color: var(--smp-ink); box-shadow: none; }
  .smp .check-hint { font-size: 12px; color: var(--smp-stone); margin: 4px 0 0; }
  .smp .attend-options { display: flex; gap: 6px 22px; margin-top: 4px; flex-wrap: wrap; }
  .smp .rsvp-error { color: #9B2C1F; font-size: 13px; margin: 0; }
  .smp .rsvp-success { text-align: center; padding: 20px 0; }
  .smp .rsvp-headline { font-family: var(--smp-font-display); font-size: 38px; color: var(--smp-ink); margin: 0 0 8px; font-weight: 400; line-height: 1.15; }
  .smp .rsvp-sub { font-size: 14px; color: var(--smp-stone); margin: 0; }
  .smp .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: plain ivory in a thin frame, or the host's photo under a veil */
  .smp .hero { position: relative; min-height: 82vh; display: flex; align-items: center; justify-content: center; padding: 120px 24px; background: var(--smp-ivory); overflow: hidden; text-align: center; color: var(--smp-ink); }
  .smp .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .smp .hero-plain { position: absolute; inset: 0; z-index: 0; display: block; background: var(--smp-ivory); }
  .smp .hero-frame { position: absolute; inset: clamp(14px, 3vw, 32px); display: block; border: 1px solid var(--smp-line); }
  .smp .hero-veil { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: rgba(38,35,31,0.42); }
  .smp .hero-content { position: relative; z-index: 2; max-width: 820px; }
  .smp .hero-content > * { animation: smp-in 1s ease both; }
  .smp .hero-eyebrow { animation-delay: 0.15s !important; font-size: 13px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--smp-taupe); margin: 0 0 22px; }
  .smp .hero-name { animation-delay: 0.3s !important; font-family: var(--smp-font-display); font-weight: 400; font-size: clamp(44px, 8vw, 96px); line-height: 1.08; color: var(--smp-ink); margin: 0; overflow-wrap: anywhere; }
  .smp .hero-content > .smp-rule { animation-delay: 0.45s !important; margin: 30px auto 22px; }
  .smp .hero-date { animation-delay: 0.55s !important; font-size: 15px; letter-spacing: 2px; text-transform: uppercase; color: var(--smp-stone); margin: 0 0 36px; }
  .smp .hero-actions { animation-delay: 0.7s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .smp .hero.has-photo .hero-eyebrow, .smp .hero.has-photo .hero-date { color: rgba(255,255,255,0.88); }
  .smp .hero.has-photo .hero-name { color: var(--smp-white); text-shadow: 0 2px 18px rgba(0,0,0,0.25); }
  .smp .hero.has-photo .smp-rule { background: rgba(255,255,255,0.7); }
  .smp .hero.has-photo .btn { background: var(--smp-white); border-color: var(--smp-white); color: var(--smp-ink); }
  .smp .hero.has-photo .btn:hover { background: var(--smp-sand); border-color: var(--smp-sand); }
  .smp .hero.has-photo .btn-outline { background: transparent; color: var(--smp-white); border-color: rgba(255,255,255,0.85); }
  .smp .hero.has-photo .btn-outline:hover { background: var(--smp-white); color: var(--smp-ink); }
  @media (max-width: 640px) {
    .smp .hero { min-height: 76vh; padding: 96px 28px; }
    .smp .hero-eyebrow { letter-spacing: 3px; font-size: 12px; }
    .smp .hero-date { font-size: 13px; }
  }

  /* about */
  .smp .story-text { font-size: 18px; line-height: 1.85; color: var(--smp-stone); margin: 0 auto; max-width: 620px; }

  /* countdown: white numbers on charcoal */
  .smp .countdown-shell { background: var(--smp-ink); }
  .smp .countdown-wrap { padding: 96px 24px; text-align: center; }
  .smp .countdown-wrap .eyebrow { color: rgba(255,255,255,0.7); }
  .smp .countdown-heading { font-family: var(--smp-font-display); font-weight: 400; font-size: clamp(30px, 4.4vw, 46px); color: var(--smp-white); margin: 0 0 40px; line-height: 1.15; }
  .smp .countdown-row { max-width: 680px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border: 1px solid rgba(255,255,255,0.22); }
  .smp .countdown-block { padding: 26px 8px; color: var(--smp-white); }
  .smp .countdown-block + .countdown-block { border-left: 1px solid rgba(255,255,255,0.22); }
  .smp .countdown-value { font-family: var(--smp-font-display); font-size: clamp(30px, 5vw, 50px); line-height: 1.1; }
  .smp .countdown-label { font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.65); margin-top: 6px; }
  @media (max-width: 520px) {
    .smp .countdown-wrap { padding: 76px 14px; }
    .smp .countdown-block { padding: 18px 4px; }
    .smp .countdown-label { font-size: 10px; letter-spacing: 1.5px; }
  }

  /* details: a white card, the map beside it */
  .smp .details-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; align-items: stretch; margin-top: 12px; }
  .smp .details-grid.single { grid-template-columns: minmax(0, 520px); justify-content: center; }
  .smp .details-card { background: var(--smp-white); border: 1px solid var(--smp-line); padding: clamp(40px, 6vw, 64px) clamp(28px, 5vw, 56px); display: flex; flex-direction: column; justify-content: center; }
  .smp .details-card .label { font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--smp-taupe); margin: 0 0 12px; }
  .smp .details-card .time { font-family: var(--smp-font-display); font-size: clamp(28px, 3.6vw, 38px); color: var(--smp-ink); margin: 0 0 10px; line-height: 1.15; }
  .smp .details-card p { font-size: 16px; line-height: 1.7; color: var(--smp-stone); margin: 0; }
  .smp .details-card address { font-style: normal; }
  .smp .details-card .venue { font-family: var(--smp-font-display); font-size: 21px; color: var(--smp-ink); margin-top: 16px; line-height: 1.3; }
  .smp .details-card .directions { display: inline-block; margin: 20px 10px 0; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 10px 0; }
  .smp .map-frame { min-height: 340px; border: 1px solid var(--smp-line); background: var(--smp-white); }
  .smp .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 340px; }
  @media (max-width: 760px) { .smp .details-grid { grid-template-columns: 1fr; gap: 24px; } }

  /* program: a plain list with times */
  .smp .schedule-day { max-width: 720px; margin: 0 auto 40px; }
  .smp .schedule-day:last-child { margin-bottom: 0; }
  .smp .schedule-day-title { font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--smp-taupe); margin: 0 0 14px; }
  .smp .timeline { list-style: none; margin: 0; padding: 0; text-align: left; border-top: 1px solid var(--smp-line); }
  .smp .timeline li { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 20px; padding: 20px 0; border-bottom: 1px solid var(--smp-line); }
  .smp .timeline .when { font-size: 15px; font-weight: 700; letter-spacing: 1px; color: var(--smp-ink); }
  .smp .timeline .name { font-family: var(--smp-font-display); font-size: 21px; color: var(--smp-ink); margin: 0; line-height: 1.3; }
  .smp .timeline .loc { color: var(--smp-stone); font-size: 15px; margin: 4px 0 0; }
  @media (max-width: 560px) { .smp .timeline li { grid-template-columns: 1fr; gap: 4px; } }

  /* RSVP, Potluck and Gift Exchange: a white card */
  .smp .rsvp-section { padding: 104px 18px; background: var(--smp-sand); }
  .smp #potluck.rsvp-section { background: var(--smp-ivory); }
  .smp .form-card { max-width: 640px; margin: 0 auto; text-align: left; background: var(--smp-white); border: 1px solid var(--smp-line); padding: clamp(40px, 7vw, 72px) clamp(24px, 7vw, 64px); }
  .smp .form-card .head { text-align: center; }
  .smp .form-card .section-title { margin-bottom: 14px; }
  @media (max-width: 560px) { .smp .rsvp-section { padding: 76px 12px; } }

  /* gallery: square photos with a little space */
  .smp .smp-gallery > div { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 12px !important; }
  .smp .smp-gallery button[style*="zoom-in"] { border-radius: 0 !important; }
  @media (max-width: 760px) { .smp .smp-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; } }

  /* registry and guest photos: an outlined card */
  .smp .outlined { max-width: 680px; margin: 0 auto; padding: 48px clamp(22px, 5vw, 48px); border: 1px solid var(--smp-line); background: var(--smp-white); text-align: center; }
  .smp .registry-photo { display: block; width: 100%; max-width: 420px; aspect-ratio: 4 / 3; object-fit: cover; margin: 0 auto 28px; }
  .smp .registry-description { font-size: 16px; line-height: 1.8; color: var(--smp-stone); margin: 0 auto 28px; max-width: 520px; }

  /* songs: on charcoal */
  .smp .song-section { background: var(--smp-ink); color: var(--smp-white); padding: 104px 24px; text-align: center; }
  .smp .song-section input::placeholder { color: rgba(255,255,255,0.45); }
  .smp .song-section label.field-label { color: rgba(255,255,255,0.7); }
  .smp .song-section .btn { background: var(--smp-white); border-color: var(--smp-white); color: var(--smp-ink); }
  .smp .song-section .btn:hover { background: var(--smp-sand); border-color: var(--smp-sand); }
  .smp .song-section .song-list { max-width: 620px; margin: 0 auto; text-align: left; }
  .smp .song-section .song-row { padding: 18px 0; border-top: 1px solid rgba(255,255,255,0.18); }
  .smp .song-section .song-row:last-child { border-bottom: 1px solid rgba(255,255,255,0.18); }
  .smp .song-section .song-row .title { color: var(--smp-white); font-weight: 700; }
  .smp .song-section .song-row .artist { color: rgba(255,255,255,0.7); }
  .smp .song-section p { color: rgba(255,255,255,0.7); }
  @media (max-width: 640px) { .smp .song-section { padding: 76px 20px; } }

  /* share */
  .smp .share-band { padding: 96px 24px; text-align: center; background: var(--smp-white); border-top: 1px solid var(--smp-line); }
  .smp .share-band .eyebrow.on-dark { color: var(--smp-taupe); }
  .smp .share-band .btn-outline.on-dark { color: var(--smp-ink); border-color: var(--smp-ink); }
  .smp .share-band .btn-outline.on-dark:hover { background: var(--smp-ink); color: var(--smp-white); }
  .smp .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .smp .share-hashtag { font-family: var(--smp-font-display); font-weight: 400; font-size: clamp(20px, 5vw, 42px); color: var(--smp-ink); margin: 0 0 30px; line-height: 1.2; overflow-wrap: anywhere; }

  /* footer: charcoal */
  .smp .footer { padding: 72px 24px 56px; background: var(--smp-ink); color: rgba(255,255,255,0.75); text-align: center; }
  .smp .footer p { font-size: 15px; margin: 0 0 4px; }
  .smp .footer a { color: var(--smp-white); text-decoration: none; }
  .smp .footer a:hover { color: var(--smp-sand); }
  .smp .footer-signoff { font-family: var(--smp-font-display); font-size: clamp(24px, 3.4vw, 30px) !important; color: var(--smp-white) !important; margin: 32px 0 0 !important; line-height: 1.25; }
  .smp .footer-credit { font-size: 13px !important; color: rgba(255,255,255,0.5) !important; margin-top: 20px !important; }
  .smp .footer-credit a { text-decoration: underline; }
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

export default function Simple({
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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--smp-font-sans)', fontSize: 17, lineHeight: 1.85, color: STONE };

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
    <div className="smp">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@400;700&display=swap" />
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
          <SimpleDefaultHero />
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
        {isPaid && customSections?.map((section, i) => (
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
        {isPaid && potluck && (
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
              {editSlots?.gallery ?? <div className="smp-gallery"><GalleryGrid images={gallery} /></div>}
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
