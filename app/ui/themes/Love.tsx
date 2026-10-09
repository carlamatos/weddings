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

const IMG = '/images/themes/love';

// Exclusive to Love — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `lv-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The roses-and-hydrangea palette: blush and rose pinks to raspberry,
// peach and apricot, creamy whites, and olive-to-forest greens.
const BLUSH = '#FBDFDE';
const HYDRANGEA = '#F6C4C3';
const DUSTY_ROSE = '#E29E9D';
const ROSE = '#E08A89';
const DEEP_ROSE = '#BA4347';
const RASPBERRY = '#9A2B34';
const PEACH = '#E5C19F';
const APRICOT = '#E49763';
const CREAM = '#F6EADE';
const WHITE_HYD = '#E4E4DC';
const WHITE_SHADE = '#D0D2C5';
const BUD = '#BDAD6F';
const OLIVE = '#867D56';
const LEAF = '#36652F';
const DARK_LEAF = '#2F3020';

// ─── SVG ornaments ───────────────────────────────────────

function Heart({ size = 14, fill = ROSE, stroke, className, style }: { size?: number; fill?: string; stroke?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 21 C 5 15, 0 11, 0 6 A 6 6 0 0 1 12 4 A 6 6 0 0 1 24 6 C 24 11, 19 15, 12 21 Z" fill={fill} stroke={stroke} strokeWidth={stroke ? 1.4 : 0} />
    </svg>
  );
}

// Hairlines with a small beating heart between them — the section ornament.
function HeartRule({ light }: { light?: boolean }) {
  const line = light ? 'rgba(246,234,222,0.6)' : DUSTY_ROSE;
  return (
    <div className="lv-rule" aria-hidden="true">
      <svg width="200" height="20" viewBox="0 0 200 20" fill="none">
        <line x1="0" y1="10" x2="82" y2="10" stroke={line} strokeWidth="0.8" />
        <line x1="118" y1="10" x2="200" y2="10" stroke={line} strokeWidth="0.8" />
        <circle cx="76" cy="10" r="1.6" fill={light ? PEACH : APRICOT} />
        <circle cx="124" cy="10" r="1.6" fill={light ? PEACH : APRICOT} />
      </svg>
      <Heart className="lv-beat" size={16} fill={light ? HYDRANGEA : ROSE} />
    </div>
  );
}

// Two interlocking rings, drawn in fine line — above the hero names.
function Rings() {
  return (
    <svg className="lv-rings" width="64" height="36" viewBox="0 0 64 36" fill="none" aria-hidden="true">
      <circle cx="24" cy="20" r="13" stroke={PEACH} strokeWidth="2.2" />
      <circle cx="40" cy="20" r="13" stroke={APRICOT} strokeWidth="2.2" />
      <path d="M36 4 L40 0 L44 4 L40 7 Z" fill={WHITE_HYD} stroke={PEACH} strokeWidth="1" />
    </svg>
  );
}

// A line-art rose with two leaves — the footer emblem.
function Rose() {
  return (
    <svg className="lv-rose" width="70" height="86" viewBox="0 0 70 86" fill="none" aria-hidden="true">
      <path d="M35 42 C 35 60, 33 72, 35 84" stroke={BUD} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M34 64 C 24 58, 16 60, 12 66 C 20 70, 28 69, 34 64 Z" fill={OLIVE} opacity="0.8" />
      <path d="M35 56 C 45 50, 54 52, 58 58 C 50 62, 42 61, 35 56 Z" fill={OLIVE} opacity="0.65" />
      <path d="M35 40 C 20 40, 14 28, 18 16 C 24 4, 46 4, 52 16 C 56 28, 50 40, 35 40 Z" fill={HYDRANGEA} opacity="0.9" />
      <path d="M35 34 C 26 34, 24 24, 30 18 C 36 12, 46 18, 42 26 C 40 30, 34 30, 33 25 C 32 21, 38 20, 38 24" stroke={DEEP_ROSE} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M20 22 C 16 30, 22 38, 30 40" stroke={DUSTY_ROSE} strokeWidth="1" fill="none" />
      <path d="M50 22 C 54 30, 48 38, 40 40" stroke={DUSTY_ROSE} strokeWidth="1" fill="none" />
    </svg>
  );
}

const HERO_HEARTS = [
  { left: '58%', delay: '0s', size: 14, fill: HYDRANGEA }, { left: '66%', delay: '-3s', size: 10, fill: ROSE },
  { left: '74%', delay: '-6s', size: 16, fill: BLUSH }, { left: '82%', delay: '-1.5s', size: 11, fill: DUSTY_ROSE },
  { left: '90%', delay: '-4.5s', size: 13, fill: HYDRANGEA }, { left: '95%', delay: '-7.5s', size: 9, fill: ROSE },
];
const COUNTDOWN_HEARTS = [
  { left: '8%', delay: '0s', size: 12 }, { left: '20%', delay: '-4s', size: 9 }, { left: '33%', delay: '-2s', size: 14 },
  { left: '67%', delay: '-5s', size: 10 }, { left: '80%', delay: '-1s', size: 15 }, { left: '92%', delay: '-3s', size: 9 },
];

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: HYDRANGEA, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS.love} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }} />
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own script face */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Allura&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 22px', maxWidth: '52%' }}>
        <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: RASPBERRY, fontWeight: 600, margin: '0 0 4px' }}>Together with their families</p>
        <h2 style={{ fontFamily: "'Allura', 'Brush Script MT', cursive", fontWeight: 400, fontSize: 'clamp(30px, 5.2vw, 44px)', color: RASPBERRY, margin: '0 0 6px', lineHeight: 1 }}>{heading || 'Love'}</h2>
        {date && <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: DARK_LEAF, fontWeight: 600, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .lv {
    --lv-blush: ${BLUSH};
    --lv-hydrangea: ${HYDRANGEA};
    --lv-dusty-rose: ${DUSTY_ROSE};
    --lv-rose: ${ROSE};
    --lv-deep-rose: ${DEEP_ROSE};
    --lv-raspberry: ${RASPBERRY};
    --lv-peach: ${PEACH};
    --lv-apricot: ${APRICOT};
    --lv-cream: ${CREAM};
    --lv-white-hyd: ${WHITE_HYD};
    --lv-white-shade: ${WHITE_SHADE};
    --lv-bud: ${BUD};
    --lv-olive: ${OLIVE};
    --lv-leaf: ${LEAF};
    --lv-dark-leaf: ${DARK_LEAF};
    /* The bouquet photo's own backdrop, so its edges disappear */
    --lv-bouquet-bg: #D1CDCB;
    --lv-font-script: 'Allura', 'Great Vibes', cursive;
    --lv-font-display: 'Playfair Display', Georgia, serif;
    --lv-font-sans: 'Raleway', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .lv * { box-sizing: border-box; }
  .lv { margin: 0; background: var(--lv-cream); color: var(--lv-dark-leaf); font-family: var(--lv-font-sans); font-weight: 400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .lv img { max-width: 100%; }

  /* ─ motion: soft and slow ─ */
  @keyframes lv-float { 0% { transform: translateY(0) rotate(-8deg) scale(0.7); opacity: 0; } 15% { opacity: 0.9; } 50% { transform: translateY(-45vh) rotate(8deg) scale(1); } 100% { transform: translateY(-95vh) rotate(-6deg) scale(0.9); opacity: 0; } }
  @keyframes lv-rise { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 20% { opacity: 0.85; } 100% { transform: translateY(-300px) scale(1.05); opacity: 0; } }
  @keyframes lv-beat { 0%, 70%, 100% { transform: scale(1); } 78% { transform: scale(1.18); } 86% { transform: scale(0.96); } 92% { transform: scale(1.1); } }
  @keyframes lv-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .lv .lv-heart-float, .lv .lv-heart-rise, .lv .lv-beat, .lv .hero-content > * { animation: none !important; }
    .lv .lv-heart-float, .lv .lv-heart-rise { display: none; }
  }
  .lv .lv-heart-float { position: absolute; bottom: -20px; z-index: 1; pointer-events: none; animation: lv-float 16s ease-in-out infinite; }
  .lv .lv-heart-rise { position: absolute; bottom: -20px; z-index: 1; pointer-events: none; animation: lv-rise 9s ease-in infinite; }
  .lv .lv-rule { position: relative; width: 200px; height: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
  .lv .lv-rule > svg:first-child { position: absolute; inset: 0; }
  .lv .lv-beat { position: relative; animation: lv-beat 3.2s ease-in-out infinite; }
  .lv .lv-rings { display: block; margin: 0 0 14px auto; }
  .lv .lv-rose { display: block; margin: 0 auto 22px; }

  .lv .eyebrow { font-family: var(--lv-font-sans); font-size: 12px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--lv-raspberry); margin: 0 0 14px; }
  .lv .eyebrow.on-dark { color: var(--lv-hydrangea); }
  .lv .section-title { font-family: var(--lv-font-display); font-size: clamp(34px, 4.6vw, 54px); font-weight: 400; color: var(--lv-dark-leaf); margin: 0 0 18px; line-height: 1.12; }
  .lv .section-title.on-dark { color: var(--lv-cream); }

  .lv .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; }
  .lv .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .lv .section { position: relative; padding: 108px 28px; background: var(--lv-cream); overflow: hidden; }
  .lv .section-blush { background: var(--lv-blush); }
  .lv .section-white { background: #FFFDFB; }
  .lv .section-center { text-align: center; }
  @media (max-width: 640px) { .lv .section { padding: 74px 22px; } }

  .lv .btn { font-family: var(--lv-font-sans); font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 16px 34px; border-radius: 999px; border: 1px solid var(--lv-raspberry); background: var(--lv-raspberry); color: var(--lv-cream); cursor: pointer; transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .lv .btn:hover { background: var(--lv-deep-rose); border-color: var(--lv-deep-rose); }
  .lv .btn-outline { background: rgba(246,234,222,0.6); color: var(--lv-raspberry); }
  .lv .btn-outline:hover { background: var(--lv-raspberry); color: var(--lv-cream); }
  .lv .btn-outline.on-dark { background: transparent; color: var(--lv-cream); border-color: rgba(246,234,222,0.7); }
  .lv .btn-outline.on-dark:hover { background: var(--lv-cream); color: var(--lv-raspberry); }

  .lv input, .lv textarea, .lv select { font-family: var(--lv-font-sans); font-size: 15px; padding: 12px 16px; border: 1px solid var(--lv-hydrangea); border-radius: 12px; outline: none; background: #FFFDFB; color: var(--lv-dark-leaf); width: 100%; display: block; transition: border-color 0.2s ease; }
  .lv input:focus, .lv textarea:focus, .lv select:focus { border-color: var(--lv-rose); }
  .lv input::placeholder, .lv textarea::placeholder { color: rgba(47,48,32,0.45); }
  .lv label.field-label { font-family: var(--lv-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--lv-raspberry); display: block; margin-bottom: 6px; font-weight: 600; }
  .lv .radio-label, .lv .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--lv-dark-leaf); cursor: pointer; }
  .lv .radio-label input, .lv .check-label input { width: auto; border: none; padding: 0; accent-color: var(--lv-raspberry); }
  .lv .check-hint { font-family: var(--lv-font-sans); font-size: 12px; color: var(--lv-olive); margin: 4px 0 0; }
  .lv .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .lv .rsvp-error { color: var(--lv-deep-rose); font-size: 13px; margin: 0; font-family: var(--lv-font-sans); }
  .lv .rsvp-success { text-align: center; padding: 20px 0; }
  .lv .rsvp-headline { font-family: var(--lv-font-script); font-size: 46px; color: var(--lv-raspberry); margin: 0 0 8px; font-weight: 400; }
  .lv .rsvp-sub { font-size: 14px; color: var(--lv-dark-leaf); margin: 0; }
  .lv .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the bouquet and rings sit on the left, so the names sit on the right */
  .lv .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: flex-end; text-align: right; padding: 96px 8vw; background: var(--lv-hydrangea); overflow: hidden; }
  .lv .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: left center; z-index: 0; }
  .lv .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to left, rgba(251,223,222,0.55) 0%, rgba(251,223,222,0.25) 40%, rgba(251,223,222,0) 60%); z-index: 0; pointer-events: none; }
  .lv .hero-content { position: relative; z-index: 2; max-width: 560px; }
  .lv .hero-eyebrow { animation: lv-in 1.2s ease both; font-family: var(--lv-font-sans); font-size: 12px; letter-spacing: 5px; text-transform: uppercase; font-weight: 600; color: var(--lv-raspberry); margin: 0 0 10px; }
  .lv .hero-name { animation: lv-in 1.2s ease 0.2s both; font-family: var(--lv-font-script); font-size: clamp(70px, 10vw, 140px); font-weight: 400; color: var(--lv-raspberry); margin: 0 0 18px; line-height: 0.95; text-shadow: 0 2px 20px rgba(251,223,222,0.6); }
  .lv .hero-date { animation: lv-in 1.2s ease 0.4s both; font-family: var(--lv-font-sans); font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: var(--lv-dark-leaf); font-weight: 600; margin: 0 0 32px; }
  .lv .hero-actions { animation: lv-in 1.2s ease 0.6s both; display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
  @media (max-width: 760px) {
    .lv .hero { padding: 72px 22px 88px; align-items: flex-end; }
    .lv .hero-overlay { background: linear-gradient(to top, rgba(251,223,222,0.94) 0%, rgba(251,223,222,0.65) 48%, rgba(251,223,222,0.05) 100%); }
  }

  /* countdown: the flower-lined aisle under a raspberry veil */
  .lv .countdown-shell { position: relative; background: var(--lv-raspberry); background-size: cover; background-position: center; overflow: hidden; }
  .lv .countdown-shell::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(154,43,52,0.86) 0%, rgba(154,43,52,0.76) 50%, rgba(154,43,52,0.9) 100%); }
  .lv .countdown-wrap { position: relative; z-index: 1; padding: 116px 24px; text-align: center; }
  .lv .countdown-heading { font-family: var(--lv-font-script); font-size: clamp(52px, 7vw, 84px); color: var(--lv-cream); margin: 0 0 38px; font-weight: 400; line-height: 1; }
  .lv .countdown-row { display: flex; justify-content: center; gap: clamp(12px, 3vw, 28px); }
  .lv .countdown-block { text-align: center; width: clamp(78px, 14vw, 118px); padding: 22px 8px 16px; border: 1px solid rgba(246,196,195,0.55); border-radius: 999px 999px 14px 14px; }
  .lv .countdown-value { font-family: var(--lv-font-display); font-size: clamp(34px, 5vw, 56px); color: var(--lv-cream); font-weight: 400; line-height: 1; }
  .lv .countdown-label { font-family: var(--lv-font-sans); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--lv-hydrangea); margin-top: 10px; font-weight: 600; }

  /* details: arched cards */
  .lv .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 14px; }
  @media (max-width: 720px) { .lv .details-grid { grid-template-columns: 1fr; } }
  .lv .details-card { background: #FFFDFB; padding: 64px 34px 40px; border-radius: 220px 220px 16px 16px; border: 1px solid var(--lv-hydrangea); box-shadow: 0 24px 50px -32px rgba(154,43,52,0.35); }
  .lv .details-card .label { font-family: var(--lv-font-sans); font-size: 11px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--lv-raspberry); margin: 0 0 14px; font-weight: 600; }
  .lv .details-card .time { font-family: var(--lv-font-display); font-size: 34px; line-height: 1.15; color: var(--lv-dark-leaf); font-weight: 400; margin-bottom: 10px; }
  .lv .details-card p { font-size: 15px; color: var(--lv-dark-leaf); margin: 0 0 4px; }
  .lv .map-frame { overflow: hidden; min-height: 300px; border-radius: 220px 220px 16px 16px; border: 6px solid #FFFDFB; box-shadow: 0 24px 50px -32px rgba(154,43,52,0.35); }
  .lv .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 300px; }
  .lv .directions-link { text-align: center; margin-top: 28px; }
  .lv .directions-link a { font-family: var(--lv-font-sans); font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--lv-raspberry); text-decoration: none; border-bottom: 1px solid var(--lv-rose); padding-bottom: 4px; }

  /* program */
  .lv .schedule-day { max-width: 600px; margin: 0 auto 50px; }
  .lv .schedule-day:last-child { margin-bottom: 0; }
  .lv .schedule-day-title { font-family: var(--lv-font-script); font-size: 38px; color: var(--lv-raspberry); margin: 0 0 14px; }
  .lv .schedule-list { border-top: 1px solid var(--lv-dusty-rose); text-align: left; }
  .lv .schedule-row { display: flex; gap: 26px; padding: 18px 0; border-bottom: 1px solid var(--lv-hydrangea); align-items: baseline; }
  .lv .schedule-time { font-family: var(--lv-font-sans); font-size: 12px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--lv-deep-rose); min-width: 120px; flex-shrink: 0; }
  .lv .schedule-info .name { font-family: var(--lv-font-display); font-size: 22px; color: var(--lv-dark-leaf); margin: 0 0 2px; }
  .lv .schedule-info .loc { font-size: 14px; color: var(--lv-olive); margin: 0; }

  /* rsvp: the round bouquet on its own pale backdrop, the arched card beside it */
  .lv .rsvp-section { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; min-height: 820px; background: var(--lv-bouquet-bg); padding: 96px 6vw; overflow: hidden; }
  .lv .lv-bouquet { position: absolute; left: 0; top: 0; bottom: 0; width: 62%; height: 100%; object-fit: cover; object-position: 42% center;
    -webkit-mask-image: linear-gradient(to right, #000 0%, #000 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
    -webkit-mask-composite: source-in; mask-image: linear-gradient(to right, #000 0%, #000 70%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%); mask-composite: intersect; }
  .lv .rsvp-panel { grid-column: 2; text-align: center; position: relative; z-index: 1; }
  .lv .rsvp-card { max-width: 480px; margin: 0 auto; background: rgba(255,253,251,0.95); padding: 84px 42px 46px; text-align: left; border-radius: 260px 260px 18px 18px; border: 1px solid var(--lv-hydrangea); box-shadow: 0 34px 70px -36px rgba(154,43,52,0.45); }
  @media (max-width: 900px) {
    .lv .rsvp-section { display: block; min-height: 0; padding: 0 20px 76px; }
    .lv .lv-bouquet { position: relative; display: block; width: calc(100% + 40px); max-width: none; height: auto; margin: 0 -20px -90px;
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 68%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 68%, transparent 100%); }
    .lv .rsvp-card { padding: 70px 24px 36px; }
  }

  .lv .gallery-tile { overflow: hidden; border-radius: 14px; }

  /* registry, on the roses */
  .lv .registry-wrap { position: relative; width: 100%; min-height: 400px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 72px 20px; }
  .lv .registry-overlay { background: rgba(255,253,251,0.92); padding: 70px 60px 50px; text-align: center; max-width: 540px; border-radius: 260px 260px 18px 18px; box-shadow: 0 30px 60px -36px rgba(154,43,52,0.45); }
  @media (max-width: 640px) { .lv .registry-overlay { padding: 60px 26px 36px; } }
  .lv .registry-title { font-family: var(--lv-font-script); font-size: 54px; color: var(--lv-raspberry); margin: 0 0 8px; font-weight: 400; line-height: 1; }
  .lv .registry-description { font-size: 15px; color: var(--lv-dark-leaf); margin: 0 auto 26px; line-height: 1.8; max-width: 400px; }
  .lv .registry-button { display: inline-block; padding: 16px 34px; border-radius: 999px; background: var(--lv-raspberry); color: var(--lv-cream); text-decoration: none; font-family: var(--lv-font-sans); font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; }
  .lv .registry-button:hover { background: var(--lv-deep-rose); }

  /* songs */
  .lv .song-section { background: var(--lv-blush); padding: 108px 28px; text-align: center; }
  .lv .song-section .song-list { border-top: 1px solid var(--lv-dusty-rose); max-width: 540px; margin: 0 auto; }
  .lv .song-section .song-row { border-bottom: 1px solid var(--lv-hydrangea); padding: 12px 0; }
  .lv .song-section .song-row .title { color: var(--lv-dark-leaf); font-family: var(--lv-font-display); }
  .lv .song-section .song-row .artist { color: var(--lv-olive); }

  /* share */
  .lv .share-band { padding: 100px 24px; background: var(--lv-blush); text-align: center; }
  .lv .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .lv .share-hashtag { font-family: var(--lv-font-script); font-size: clamp(48px, 7vw, 72px); color: var(--lv-raspberry); margin: 0 0 28px; font-weight: 400; line-height: 1; overflow-wrap: anywhere; }

  /* footer: raspberry, with the line-art rose */
  .lv .footer { padding: 96px 24px 70px; background: var(--lv-raspberry); text-align: center; }
  .lv .footer p { font-size: 15px; color: rgba(246,234,222,0.88); margin: 0 0 4px; }
  .lv .footer-signoff { font-family: var(--lv-font-script); font-size: clamp(46px, 7vw, 66px) !important; font-weight: 400; color: var(--lv-cream) !important; margin: 30px 0 0 !important; line-height: 1.05; }
  .lv .footer-credit { font-size: 11px; letter-spacing: 1px; color: rgba(246,234,222,0.55) !important; margin-top: 30px !important; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const HERO_EYEBROW_DEFAULT = { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' };

export default function Love({
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
  const heroSrc = bannerImage || HERO_DEFAULTS.love;

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--lv-font-sans)', fontSize: 17, lineHeight: 1.95, color: 'var(--lv-dark-leaf)' };

  return (
    <div className="lv">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Allura&family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Raleway:wght@400;500;600&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes={demo} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt="" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        <div className="hero-overlay" />
        {HERO_HEARTS.map((h) => (
          <Heart key={h.left} className="lv-heart-float" size={h.size} fill={h.fill} style={{ left: h.left, animationDelay: h.delay }} />
        ))}
        <div className="hero-content">
          <Rings />
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}>{heading}</h1>}
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date" style={heroTextStyle(heroStyle?.text.date)}>{heroDateText}</p>)}
          <div className="hero-actions">
            <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            <HeroButton id="story" href="#story" className="btn btn-outline" label={t.ourStoryBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            {isPaid && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
          </div>
        </div>
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <HeartRule />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
              {editSlots?.description ?? (
                <p style={{ ...textStyle, maxWidth: 580, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* COUNTDOWN */}
      {eventDate && (
        <div className="countdown-shell" style={{ backgroundImage: `url(${IMG}/aisle.jpeg)` }}>
          {COUNTDOWN_HEARTS.map((h) => (
            <Heart key={h.left} className="lv-heart-rise" size={h.size} fill={HYDRANGEA} style={{ left: h.left, animationDelay: h.delay, opacity: 0.8 }} />
          ))}
          <Countdown
            eventDate={eventDate}
            eventTime={eventTime}
            eyebrow={t.countingDown}
            heading={t.untilWeSayIDo}
            todayHeading={t.todayIsTheDay}
            unitLabels={{ days: t.days, hours: t.hours, mins: t.mins, secs: t.secs }}
            sectionText={sectionTextCtx}
          />
        </div>
      )}

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <Reveal>
          <div className="section section-blush section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <HeartRule />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 600, color: 'var(--lv-raspberry)' }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p style={{ marginTop: 12 }}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lv-raspberry)', textDecoration: 'none', borderBottom: '1px solid var(--lv-rose)' }}>{t.joinOnline}</a></p>
                  )}
                </div>
                {mapSrc ? (
                  <div className="map-frame">
                    <iframe title="Venue map" src={mapSrc} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                ) : (
                  <div className="details-card">
                    <p className="label">{t.reception}</p>
                    {city && <p>{[city, country].filter(Boolean).join(', ')}</p>}
                  </div>
                )}
              </div>
              {mapsUrl && (
                <div className="directions-link">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* LIVE STREAM (Plus) */}
      {isPaid && livestream && (
        <Reveal>
          <div id="livestream" className="section section-blush section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <HeartRule />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--lv-dark-leaf)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-center">
            <div className="wrap">
              <HeartRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
              <HeartRule />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" fallback={t.eventProgram} />
              {groupEventProgramByDate(eventProgram).map((group) => (
                <div className="schedule-day" key={group.date}>
                  <p className="schedule-day-title">{formatProgramDate(group.date, t.dateLocale)}</p>
                  <div className="schedule-list">
                    {group.items.map((item) => (
                      <div className="schedule-row" key={item.id}>
                        <div className="schedule-time">{formatProgramTime(item, t.dateLocale) || '—'}</div>
                        <div className="schedule-info">
                          <p className="name">{item.name}</p>
                          {item.location && <p className="loc">{item.location}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* RSVP — beside the round bouquet */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lv-bouquet" src={`${IMG}/bouquet.jpeg`} alt="" />
          <Reveal className="rsvp-panel">
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <HeartRule />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </div>
          </Reveal>
        </div>
      )}
      {/* POTLUCK (Plus, off by default) */}
      {isPaid && potluck && (
        <div id="potluck" className="rsvp-section">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lv-bouquet" src={`${IMG}/bouquet.jpeg`} alt="" />
          <Reveal className="rsvp-panel">
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
                <HeartRule />
                <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              </div>
              <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
            </div>
          </Reveal>
        </div>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) */}
      {isPaid && giftExchange && (
        <div id="gift-exchange" className="rsvp-section">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lv-bouquet" src={`${IMG}/bouquet.jpeg`} alt="" />
          <Reveal className="rsvp-panel">
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <HeartRule />
                <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              </div>
              <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
            </div>
          </Reveal>
        </div>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <HeartRule />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* REGISTRY */}
      {(registryDescription || registryButtonLink) && (
        <Reveal>
          <div className="registry-wrap" style={{ backgroundImage: `url(${registryImage || `${IMG}/registry.jpeg`})` }}>
            <div className="registry-overlay">
              <p className="registry-title">{t.registry}</p>
              {registryDescription && <p className="registry-description" style={{ whiteSpace: 'pre-line' }}>{registryDescription}</p>}
              {registryButtonLink && (
                <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                  {registryButtonText || t.viewRegistry}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* SPONSORS (Plus) */}
      {isPaid && sponsors && sponsors.length > 0 && (
        <Reveal>
          <div className="section section-blush section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <HeartRule />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 18, border: `1px solid ${HYDRANGEA}` }} textStyle={{ color: 'var(--lv-dark-leaf)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-white section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <HeartRule />
              <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
              <GuestPhotoSection
                userPageId={galleryToken}
                initialPhotos={guestPhotos ?? []}
                initialHasMore={guestPhotosHasMore ?? false}
                labels={{ shareYourPhoto: t.shareYourPhoto, loadMore: t.loadMore, beFirstToShare: t.beFirstToShare, photoUploaded: t.photoUploaded, photoUploadError: t.photoUploadError, uploading: t.sending }}
                btnClassName="btn"
                disabled={formsDisabled}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* SONG REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <Reveal>
          <div className="song-section">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" fallback={t.buildOurPlaylist} />
              <HeartRule />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" fallback={t.songRequests} />
              <SongRequestSection
                userPageId={galleryToken}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn"
                disabled={formsDisabled}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow" buttonClassName="btn btn-outline" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <Rose />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 12 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--lv-hydrangea)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--lv-hydrangea)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
