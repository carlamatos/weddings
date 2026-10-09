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

const IMG = '/images/themes/baby-shower-boy';

// Exclusive to Boy Baby Shower — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 3 }, (_, i) => ({
  id: `bsb-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The teddy-and-balloons illustration's palette: sky blues and warm caramels.
const BLUE_DEEP = '#65B1E3';
const BLUE_MID = '#8DC8F0';
const BLUE_BIRD = '#B6DFFF';
const BLUE_LIGHT = '#D0E9FE';
const BLUE_PALE = '#E4F4FF';
const CLOUD = '#F4F9FE';
const TERRACOTTA = '#C26C51';
const CARAMEL = '#EBAC8D';
const FUR = '#F5C1AB';
const PEACH = '#FFE4D8';
const BLUSH = '#F39A7F';
const STAR = '#D67845';
const STRING = '#8C4239';
const NOSE = '#4F120F';
const MUZZLE = '#FEF9F6';

// ─── SVG decorations (animated in CSS; all motion stops for reduced-motion users) ───

function Balloon({ color, shade, scale = 1, className, style }: { color: string; shade: string; scale?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={56 * scale} height={120 * scale} viewBox="0 0 56 120" fill="none" aria-hidden="true">
      <path d="M28 64 C 22 80, 34 92, 26 104 S 32 116, 28 120" stroke={STRING} strokeWidth="1.1" opacity="0.7" />
      <circle cx="28" cy="32" r="27" fill={color} />
      <path d="M28 5 A 27 27 0 0 1 55 32 A 27 27 0 0 1 28 59 A 22 27 0 0 0 28 5 Z" fill={shade} opacity="0.55" />
      <ellipse cx="19" cy="21" rx="6" ry="9" fill={MUZZLE} opacity="0.75" transform="rotate(-25 19 21)" />
      <path d="M24 58 L32 58 L29.5 64 L26.5 64 Z" fill={shade} />
    </svg>
  );
}

function Cloud({ width = 140, className, style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={width} height={(width * 64) / 150} viewBox="0 0 150 64" aria-hidden="true">
      <path d="M22 62 C 6 62, 0 50, 8 40 C 4 26, 22 18, 34 26 C 38 10, 62 4, 74 18 C 84 6, 110 8, 112 28 C 130 24, 146 36, 140 50 C 146 58, 138 62, 128 62 Z" fill={CLOUD} />
    </svg>
  );
}

// A little sailboat rocking on a wave — the ornament above each section title.
function Boat() {
  return (
    <svg className="bb-boat" width="58" height="50" viewBox="0 0 58 50" fill="none" aria-hidden="true">
      <path d="M28 4 L28 32 L8 32 Z" fill={BLUE_LIGHT} stroke={BLUE_DEEP} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 10 L31 32 L46 32 Z" fill={PEACH} stroke={CARAMEL} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="29.5" y1="2" x2="29.5" y2="35" stroke={STRING} strokeWidth="2" strokeLinecap="round" />
      <path d="M6 35 L52 35 L45 44 L13 44 Z" fill={CARAMEL} stroke={TERRACOTTA} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 48 Q 9 44 16 48 T 30 48 T 44 48 T 56 48" stroke={BLUE_MID} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// A band of rolling waves between sections.
function Waves({ from = CLOUD, to = BLUE_PALE }: { from?: string; to?: string }) {
  return (
    <div className="bb-waves" aria-hidden="true" style={{ background: from }}>
      <svg className="bb-wave bb-wave-back" viewBox="0 0 2400 60" preserveAspectRatio="none">
        <path d="M0 30 Q 75 10 150 30 T 300 30 T 450 30 T 600 30 T 750 30 T 900 30 T 1050 30 T 1200 30 T 1350 30 T 1500 30 T 1650 30 T 1800 30 T 1950 30 T 2100 30 T 2250 30 T 2400 30 V 60 H 0 Z" fill={BLUE_LIGHT} />
      </svg>
      <svg className="bb-wave bb-wave-front" viewBox="0 0 2400 60" preserveAspectRatio="none">
        <path d="M0 38 Q 100 22 200 38 T 400 38 T 600 38 T 800 38 T 1000 38 T 1200 38 T 1400 38 T 1600 38 T 1800 38 T 2000 38 T 2200 38 T 2400 38 V 60 H 0 Z" fill={to} />
      </svg>
    </div>
  );
}

// A little blue bird with flapping wings, flying across the countdown.
function Bird() {
  return (
    <svg className="bb-bird" width="64" height="44" viewBox="0 0 64 44" aria-hidden="true">
      <ellipse cx="30" cy="26" rx="17" ry="12" fill={BLUE_BIRD} />
      <circle cx="46" cy="18" r="9" fill={BLUE_BIRD} />
      <path d="M54 18 L62 20 L54 22 Z" fill={CARAMEL} />
      <circle cx="48" cy="16" r="1.6" fill={NOSE} />
      <circle cx="45" cy="21" r="2" fill={BLUSH} opacity="0.6" />
      <path d="M14 24 L2 18 L8 28 Z" fill={BLUE_MID} />
      <path className="bb-wing" d="M26 22 C 20 6, 34 2, 38 20 Z" fill={BLUE_MID} />
    </svg>
  );
}

function Bubble({ size, className, style }: { size: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill={BLUE_PALE} fillOpacity="0.5" stroke={BLUE_MID} strokeWidth="1.2" />
      <circle cx="7" cy="7" r="2" fill="#FFFFFF" />
    </svg>
  );
}

function Star({ size = 16, fill = CARAMEL, className, style }: { size?: number; fill?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.2 L18.5 21.7 L12 17.7 L5.5 21.7 L7.3 14.2 L1.5 9.2 L9.1 8.6 Z" fill={fill} stroke={fill} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Moon() {
  return (
    <svg className="bb-moon" width="56" height="56" viewBox="0 0 54 54" aria-hidden="true">
      <path d="M36 4 A 24 24 0 1 0 50 38 A 19 19 0 1 1 36 4 Z" fill={PEACH} />
    </svg>
  );
}

const HERO_BALLOONS = [
  { left: '6%', color: BLUE_LIGHT, shade: BLUE_MID, delay: '-3s', duration: '18s', scale: 0.9 },
  { left: '18%', color: CARAMEL, shade: TERRACOTTA, delay: '-11s', duration: '21s', scale: 0.75 },
  { left: '80%', color: BLUE_MID, shade: BLUE_DEEP, delay: '0s', duration: '17s', scale: 1 },
  { left: '90%', color: PEACH, shade: CARAMEL, delay: '-7s', duration: '20s', scale: 0.8 },
  { left: '70%', color: BLUE_PALE, shade: BLUE_LIGHT, delay: '-14s', duration: '23s', scale: 0.7 },
];
const HERO_CLOUDS = [
  { top: '8%', width: 160, duration: '60s', delay: '-12s' },
  { top: '26%', width: 110, duration: '76s', delay: '-44s' },
];
const BUBBLES = [
  { right: '6%', size: 16, delay: '0s' }, { right: '12%', size: 10, delay: '-1.4s' }, { right: '18%', size: 13, delay: '-2.8s' },
  { right: '9%', size: 8, delay: '-3.6s' }, { right: '15%', size: 11, delay: '-0.7s' },
];
const FOOTER_STARS = [
  { top: '16%', left: '10%', size: 14, delay: '0s', fill: CARAMEL }, { top: '34%', left: '22%', size: 9, delay: '-1.2s', fill: STAR },
  { top: '14%', left: '76%', size: 12, delay: '-0.6s', fill: STAR }, { top: '42%', left: '88%', size: 16, delay: '-1.8s', fill: CARAMEL },
  { top: '66%', left: '7%', size: 10, delay: '-2.4s', fill: CARAMEL }, { top: '70%', left: '93%', size: 10, delay: '-0.9s', fill: STAR },
];

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: BLUE_MID, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['baby-shower-boy']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '26px 24px 0', maxWidth: '80%' }}>
        <p style={{ display: 'inline-block', fontFamily: "'Nunito', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#2A6FA6', background: 'rgba(255,255,255,0.8)', borderRadius: 999, fontWeight: 800, padding: '4px 12px', margin: '0 0 8px' }}>It&apos;s a boy!</p>
        <h2 style={{ fontFamily: "'Comfortaa', sans-serif", fontSize: 'clamp(22px, 4.4vw, 34px)', fontWeight: 700, color: NOSE, margin: '0 0 6px', lineHeight: 1.1 }}>{heading || 'Baby Shower'}</h2>
        {date && <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: STRING, fontWeight: 800, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .bb {
    --bb-blue-deep: ${BLUE_DEEP};
    --bb-blue-mid: ${BLUE_MID};
    --bb-blue-bird: ${BLUE_BIRD};
    --bb-blue-light: ${BLUE_LIGHT};
    --bb-blue-pale: ${BLUE_PALE};
    --bb-cloud: ${CLOUD};
    --bb-terracotta: ${TERRACOTTA};
    --bb-caramel: ${CARAMEL};
    --bb-fur: ${FUR};
    --bb-peach: ${PEACH};
    --bb-blush: ${BLUSH};
    --bb-star: ${STAR};
    --bb-string: ${STRING};
    --bb-nose: ${NOSE};
    --bb-muzzle: ${MUZZLE};
    /* Text: the nose and string browns read well; a deeper blue for labels and buttons */
    --bb-ink: ${NOSE};
    --bb-ink-soft: ${STRING};
    --bb-navy: #2A6FA6;
    --bb-navy-deep: #1F5684;
    --bb-font-display: 'Comfortaa', 'Nunito', system-ui, sans-serif;
    --bb-font-sans: 'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .bb * { box-sizing: border-box; }
  .bb { margin: 0; background: var(--bb-cloud); color: var(--bb-ink); font-family: var(--bb-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .bb img { max-width: 100%; }

  /* ─ animations ─ */
  @keyframes bb-rise { from { transform: translateY(0); } to { transform: translateY(-135vh); } }
  @keyframes bb-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
  @keyframes bb-drift { from { transform: translateX(-180px); } to { transform: translateX(calc(100vw + 180px)); } }
  @keyframes bb-rock { 0%, 100% { transform: rotate(-7deg) translateY(0); } 50% { transform: rotate(7deg) translateY(-3px); } }
  @keyframes bb-roll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes bb-fly { 0% { transform: translate(-90px, 0); } 25% { transform: translate(25vw, -14px); } 50% { transform: translate(50vw, 4px); } 75% { transform: translate(75vw, -10px); } 100% { transform: translate(calc(100vw + 90px), 0); } }
  @keyframes bb-flap { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(38deg); } }
  @keyframes bb-bubble { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-240px) scale(1.1); opacity: 0; } }
  @keyframes bb-swim { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-8px, -10px) rotate(-3deg); } 50% { transform: translate(0, -16px) rotate(0deg); } 75% { transform: translate(8px, -8px) rotate(3deg); } }
  @keyframes bb-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes bb-swing { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
  @keyframes bb-twinkle { 0%, 100% { transform: scale(0.6) rotate(0deg); opacity: 0.45; } 50% { transform: scale(1.1) rotate(20deg); opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .bb .bb-balloon, .bb .bb-balloon svg, .bb .bb-cloud, .bb .bb-boat, .bb .bb-wave, .bb .bb-bird-path, .bb .bb-wing,
    .bb .bb-bubble, .bb .bb-whale, .bb .bb-float, .bb .bb-bunting img, .bb .bb-star { animation: none !important; }
    .bb .bb-bubble { opacity: 0.8; }
    .bb .bb-bird-path { left: 6%; }
  }

  .bb .bb-balloon { position: absolute; bottom: -140px; z-index: 0; pointer-events: none; opacity: 0.95; animation: bb-rise linear infinite; }
  .bb .bb-balloon svg { display: block; transform-origin: 50% 100%; animation: bb-sway 4s ease-in-out infinite; }
  .bb .bb-cloud { position: absolute; left: 0; pointer-events: none; z-index: 0; animation: bb-drift linear infinite; }
  .bb .bb-boat { display: block; margin: 0 auto 12px; transform-origin: 50% 90%; animation: bb-rock 3.2s ease-in-out infinite; }
  .bb .bb-waves { position: relative; height: 54px; overflow: hidden; line-height: 0; }
  .bb .bb-wave { position: absolute; bottom: 0; left: 0; width: 200%; height: 100%; animation: bb-roll linear infinite; }
  .bb .bb-wave-back { animation-duration: 14s; opacity: 0.8; }
  .bb .bb-wave-front { animation-duration: 9s; animation-direction: reverse; }
  .bb .bb-bunting { line-height: 0; overflow: hidden; background: var(--bb-cloud); padding-top: 6px; }
  .bb .bb-bunting img { display: block; width: min(820px, 100%); margin: 0 auto; transform-origin: 50% 0; animation: bb-swing 5s ease-in-out infinite; }
  .bb .bb-float { animation: bb-bob 5s ease-in-out infinite; }
  .bb .bb-star { position: absolute; pointer-events: none; animation: bb-twinkle 3s ease-in-out infinite; }

  .bb .eyebrow { font-family: var(--bb-font-sans); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--bb-navy); font-weight: 800; margin: 0 0 8px; }
  .bb .eyebrow.on-dark { color: var(--bb-peach); }
  .bb .section-title { font-family: var(--bb-font-display); font-size: clamp(30px, 4.2vw, 44px); font-weight: 700; color: var(--bb-ink); margin: 0 0 20px; line-height: 1.2; }
  .bb .section-title.on-dark { color: #FFFFFF; }

  .bb .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .bb .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .bb .section { position: relative; padding: 88px 28px; background: var(--bb-cloud); overflow: hidden; }
  .bb .section-pale { background: var(--bb-blue-pale); }
  .bb .section-peach { background: linear-gradient(to bottom, #FFF1EA 0%, var(--bb-peach) 100%); }
  .bb .section-white { background: #FFFFFF; }
  .bb .section-center { text-align: center; }
  @media (max-width: 640px) { .bb .section { padding: 60px 20px; } }

  .bb .btn { font-family: var(--bb-font-sans); font-size: 14px; font-weight: 800; letter-spacing: 0.6px; padding: 14px 30px; border-radius: 999px; border: 2px solid var(--bb-navy); background: var(--bb-navy); color: #FFFFFF; cursor: pointer; transition: background 0.15s ease, transform 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .bb .btn:hover { background: var(--bb-navy-deep); border-color: var(--bb-navy-deep); transform: translateY(-1px); }
  .bb .btn-outline { background: rgba(255,255,255,0.8); color: var(--bb-string); border-color: var(--bb-string); }
  .bb .btn-outline:hover { background: #FFFFFF; color: var(--bb-nose); border-color: var(--bb-nose); }
  .bb .btn-outline.on-dark { background: transparent; color: #FFFFFF; border-color: rgba(255,255,255,0.7); }

  .bb input, .bb textarea, .bb select { font-family: var(--bb-font-sans); font-size: 15px; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--bb-blue-light); outline: none; background: #FFFFFF; color: var(--bb-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .bb input:focus, .bb textarea:focus, .bb select:focus { border-color: var(--bb-blue-deep); }
  .bb label.field-label { font-family: var(--bb-font-sans); font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--bb-navy); display: block; margin-bottom: 5px; font-weight: 800; }
  .bb .radio-label, .bb .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--bb-ink); cursor: pointer; }
  .bb .radio-label input, .bb .check-label input { width: auto; border: none; padding: 0; accent-color: var(--bb-navy); }
  .bb .check-hint { font-family: var(--bb-font-sans); font-size: 12px; color: var(--bb-ink-soft); margin: 4px 0 0; }
  .bb .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .bb .rsvp-error { color: #B3261E; font-size: 13px; margin: 0; font-family: var(--bb-font-sans); }
  .bb .rsvp-success { text-align: center; padding: 16px 0; }
  .bb .rsvp-headline { font-family: var(--bb-font-display); font-size: 28px; color: var(--bb-navy); margin: 0 0 10px; font-weight: 700; }
  .bb .rsvp-sub { font-size: 14px; color: var(--bb-ink-soft); margin: 0; }
  .bb .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the toys and gift line the bottom of the photo, so the text sits centred in the sky above */
  .bb .hero { position: relative; min-height: 92vh; display: flex; align-items: flex-start; justify-content: center; text-align: center; padding: 11vh 28px 96px; background: var(--bb-blue-mid); overflow: hidden; }
  .bb .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center bottom; z-index: 0; }
  .bb .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(244,249,254,0.5) 0%, rgba(244,249,254,0.2) 40%, rgba(244,249,254,0) 60%); z-index: 0; pointer-events: none; }
  .bb .hero-content { position: relative; z-index: 1; max-width: 720px; }
  @keyframes bb-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .bb .hero-eyebrow { animation: bb-in 0.9s ease both; display: inline-block; font-family: var(--bb-font-sans); font-size: 13px; letter-spacing: 3px; text-transform: uppercase; font-weight: 800; color: var(--bb-navy); background: rgba(255,255,255,0.85); border-radius: 999px; padding: 8px 20px; margin: 0 0 18px; }
  .bb .hero-name { animation: bb-in 0.9s ease 0.15s both; font-family: var(--bb-font-display); font-size: clamp(42px, 6.6vw, 80px); font-weight: 700; color: var(--bb-ink); margin: 0 0 14px; line-height: 1.08; text-shadow: 0 2px 18px rgba(244,249,254,0.8); }
  .bb .hero-date { animation: bb-in 0.9s ease 0.3s both; font-family: var(--bb-font-sans); font-size: 15px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--bb-ink-soft); font-weight: 800; margin: 0 0 28px; }
  .bb .hero-actions { animation: bb-in 0.9s ease 0.45s both; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  @media (max-width: 720px) {
    .bb .hero { padding: 64px 20px 96px; }
    .bb .hero-overlay { background: linear-gradient(to bottom, rgba(244,249,254,0.75) 0%, rgba(244,249,254,0.45) 55%, rgba(244,249,254,0) 80%); }
  }

  /* countdown: an open sky with the little bird flying across */
  .bb .countdown-sky { position: relative; background: linear-gradient(to bottom, var(--bb-blue-light) 0%, var(--bb-blue-pale) 100%); overflow: hidden; }
  .bb .bb-bird-path { position: absolute; top: 34px; left: 0; pointer-events: none; animation: bb-fly 20s linear infinite; }
  .bb .bb-wing { transform-box: fill-box; transform-origin: 50% 100%; animation: bb-flap 0.45s ease-in-out infinite; }
  .bb .countdown-wrap { position: relative; z-index: 1; padding: 120px 24px 80px; text-align: center; }
  .bb .countdown-wrap .eyebrow { color: var(--bb-navy); }
  .bb .countdown-heading { font-family: var(--bb-font-display); font-size: clamp(30px, 4.2vw, 42px); color: var(--bb-ink); margin: 0 0 30px; font-weight: 700; }
  .bb .countdown-row { display: flex; justify-content: center; gap: clamp(12px, 4vw, 34px); }
  .bb .countdown-block { text-align: center; min-width: 76px; padding: 16px 10px 12px; background: rgba(255,255,255,0.85); border-radius: 20px; box-shadow: 0 6px 18px rgba(101,177,227,0.25); }
  .bb .countdown-value { font-family: var(--bb-font-display); font-size: clamp(28px, 5vw, 44px); color: var(--bb-navy); font-weight: 700; line-height: 1; }
  .bb .countdown-label { font-family: var(--bb-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bb-ink-soft); font-weight: 800; margin-top: 8px; }

  /* details */
  .bb .bb-elephant { position: absolute; top: 46px; right: max(12px, calc(50% - 640px)); width: 170px; pointer-events: none; }
  @media (max-width: 900px) { .bb .bb-elephant { width: 100px; top: 16px; right: 6px; opacity: 0.6; } }
  .bb .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; position: relative; }
  @media (max-width: 640px) { .bb .details-grid { grid-template-columns: 1fr; } }
  .bb .details-card { background: #FFFFFF; border-radius: 22px; padding: 28px 26px; box-shadow: 0 10px 28px rgba(101,177,227,0.2); }
  .bb .details-card .label { font-family: var(--bb-font-sans); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--bb-terracotta); font-weight: 800; margin: 0 0 10px; }
  .bb .details-card .time { font-family: var(--bb-font-display); font-size: 28px; line-height: 1.2; color: var(--bb-ink); font-weight: 700; }
  .bb .details-card p { font-size: 14px; color: var(--bb-ink-soft); margin: 0 0 3px; }
  .bb .map-frame { border-radius: 22px; overflow: hidden; min-height: 220px; border: 5px solid #FFFFFF; box-shadow: 0 10px 28px rgba(101,177,227,0.2); }
  .bb .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .bb .directions-link { text-align: center; margin-top: 20px; }
  .bb .directions-link a { font-family: var(--bb-font-sans); font-size: 14px; color: var(--bb-navy); font-weight: 800; text-decoration: none; }

  /* program */
  .bb .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .bb .schedule-day:last-child { margin-bottom: 0; }
  .bb .schedule-day-title { font-family: var(--bb-font-sans); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: var(--bb-terracotta); font-weight: 800; margin: 0 0 18px; }
  .bb .schedule-list { border-top: 2px dotted var(--bb-caramel); text-align: left; }
  .bb .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 2px dotted var(--bb-fur); align-items: baseline; }
  .bb .schedule-time { font-family: var(--bb-font-display); font-size: 16px; color: var(--bb-navy); min-width: 110px; flex-shrink: 0; font-weight: 700; }
  .bb .schedule-info .name { font-size: 15px; color: var(--bb-ink); font-weight: 700; margin: 0 0 3px; }
  .bb .schedule-info .loc { font-size: 13px; color: var(--bb-ink-soft); margin: 0; }

  /* rsvp, with the whale swimming in the bottom-right corner */
  .bb .rsvp-section { position: relative; background: linear-gradient(to bottom, var(--bb-blue-pale) 0%, var(--bb-blue-light) 100%); padding: 88px 28px 110px; text-align: center; overflow: hidden; }
  .bb .bb-whale { position: absolute; right: max(0px, calc(50% - 640px)); bottom: 10px; height: 340px; width: auto; pointer-events: none; z-index: 0; animation: bb-swim 7s ease-in-out infinite; }
  .bb .bb-bubble { position: absolute; bottom: 120px; pointer-events: none; z-index: 0; animation: bb-bubble 5s ease-in infinite; }
  @media (max-width: 900px) { .bb .bb-whale { height: 220px; right: -16px; opacity: 0.9; } .bb .bb-bubble { bottom: 70px; } }
  @media (max-width: 560px) { .bb .bb-whale { height: 150px; right: -20px; } }
  .bb .rsvp-card { position: relative; z-index: 1; max-width: 460px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 34px 30px; text-align: left; box-shadow: 0 14px 40px rgba(101,177,227,0.25); }

  .bb .gallery-tile { overflow: hidden; border-radius: 18px; }

  /* registry, on the watercolour baby frame */
  .bb .registry-wrap { position: relative; width: 100%; min-height: 340px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 56px 20px; }
  .bb .registry-overlay { background: rgba(255,255,255,0.88); padding: 44px 56px; text-align: center; border-radius: 26px; box-shadow: 0 10px 30px rgba(101,177,227,0.25); }
  @media (max-width: 640px) { .bb .registry-overlay { padding: 34px 24px; } }
  .bb .registry-title { font-family: var(--bb-font-display); font-size: 30px; color: var(--bb-ink); margin: 0 0 12px; font-weight: 700; }
  .bb .registry-description { font-size: 15px; color: var(--bb-ink-soft); margin: 0 auto 24px; line-height: 1.6; max-width: 390px; }
  .bb .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; background: var(--bb-navy); color: #FFFFFF; text-decoration: none; font-family: var(--bb-font-sans); font-size: 14px; font-weight: 800; }
  .bb .registry-button:hover { background: var(--bb-navy-deep); }

  /* songs */
  .bb .song-section { background: var(--bb-blue-pale); padding: 88px 28px; text-align: center; }
  .bb .song-section .song-list { border-top: 2px dotted var(--bb-blue-mid); max-width: 540px; margin: 0 auto; }
  .bb .song-section .song-row { border-bottom: 2px dotted var(--bb-blue-light); padding: 10px 0; }
  .bb .song-section .song-row .title { color: var(--bb-ink); }
  .bb .song-section .song-row .artist { color: var(--bb-ink-soft); }

  /* share */
  .bb .share-band { padding: 84px 24px; background: var(--bb-peach); text-align: center; }
  .bb .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .bb .share-hashtag { font-family: var(--bb-font-display); font-size: clamp(30px, 4.2vw, 42px); color: var(--bb-ink); margin: 0 0 26px; font-weight: 700; overflow-wrap: anywhere; }

  /* footer: a deep blue night sky with caramel stars */
  .bb .footer { position: relative; padding: 64px 24px 60px; background: var(--bb-navy-deep); text-align: center; overflow: hidden; }
  .bb .footer p { font-size: 14px; color: rgba(255,255,255,0.9); margin: 0 0 4px; position: relative; }
  .bb .bb-moon { display: block; margin: 0 auto 14px; position: relative; }
  .bb .footer .section-title { position: relative; }
  .bb .footer-signoff { font-family: var(--bb-font-display); font-size: clamp(26px, 5vw, 36px) !important; font-weight: 700; color: var(--bb-peach) !important; margin: 24px 0 0 !important; position: relative; }
  .bb .footer-credit { font-size: 11px; color: rgba(255,255,255,0.6) !important; margin-top: 24px !important; letter-spacing: 0.5px; position: relative; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'About baby',
    ourStoryLabel: 'Welcome, little one',
    howWeGotHere: 'A little prince is on the way',
    theDetails: 'The details',
    dateAndLocation: 'Date & location',
    ceremony: 'Shower time',
    reception: 'Location',
    theSchedule: 'The celebration',
    eventProgram: 'Shower program',
    kindlyRespond: 'Please join us',
    memoriesSoFar: 'Sweet moments',
    ourMoments: 'Little memories',
    registry: 'Baby registry',
    viewRegistry: 'View registry',
    countingDown: 'Counting down',
    untilWeSayIDo: 'Until the baby shower',
    noteForCouple: 'A note for the parents-to-be',
    noteForCouplePlaceholder: 'Wishes for baby, words of wisdom…',
    buildOurPlaylist: 'Lullabies & party songs',
    withLove: 'With love,',
    theCouple: 'the parents-to-be',
  },
  fr: {
    ourStoryBtn: 'Bébé',
    ourStoryLabel: 'Bienvenue, petit',
    howWeGotHere: 'Un petit prince est en route',
    theDetails: 'Les détails',
    dateAndLocation: 'Date et lieu',
    ceremony: 'Heure de la fête',
    reception: 'Lieu',
    theSchedule: 'La fête',
    eventProgram: 'Programme',
    kindlyRespond: 'Joignez-vous à nous',
    memoriesSoFar: 'Doux moments',
    ourMoments: 'Petits souvenirs',
    registry: 'Liste de naissance',
    viewRegistry: 'Voir la liste',
    countingDown: 'Compte à rebours',
    untilWeSayIDo: 'Avant la fête prénatale',
    noteForCouple: 'Un mot pour les futurs parents',
    noteForCouplePlaceholder: 'Vœux pour bébé, conseils…',
    buildOurPlaylist: 'Berceuses et chansons',
    withLove: 'Avec amour,',
    theCouple: 'les futurs parents',
  },
  es: {
    ourStoryBtn: 'Sobre el bebé',
    ourStoryLabel: 'Bienvenido, pequeño',
    howWeGotHere: 'Un pequeño príncipe está en camino',
    theDetails: 'Los detalles',
    dateAndLocation: 'Fecha y lugar',
    ceremony: 'Hora del baby shower',
    reception: 'Lugar',
    theSchedule: 'La celebración',
    eventProgram: 'Programa',
    kindlyRespond: 'Acompáñanos',
    memoriesSoFar: 'Dulces momentos',
    ourMoments: 'Pequeños recuerdos',
    registry: 'Lista de regalos',
    viewRegistry: 'Ver la lista',
    countingDown: 'Cuenta regresiva',
    untilWeSayIDo: 'Hasta el baby shower',
    noteForCouple: 'Una nota para los futuros papás',
    noteForCouplePlaceholder: 'Deseos para el bebé, consejos…',
    buildOurPlaylist: 'Canciones de cuna y fiesta',
    withLove: 'Con cariño,',
    theCouple: 'los futuros papás',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "It's a boy!", fr: "C'est un garçon !", es: '¡Es niño!' };

export default function BabyShowerBoy({
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
  const base = getTranslations(language);
  const t: Translations = { ...base, ...pickByLanguage(OVERRIDES, language) };
  const isPreview = !!editSlots;
  // Forms are shown but can't be submitted in the editor or a showcase preview.
  const formsDisabled = isPreview || !!demo;
  const sectionTextCtx = { values: sectionText, pageId: sectionTextPageId };
  const heroDateText = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';
  const heroSrc = bannerImage || HERO_DEFAULTS['baby-shower-boy'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--bb-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--bb-ink-soft)' };

  return (
    <div className="bb">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@600;700&family=Nunito:wght@400;600;700;800&display=swap" />
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
        {HERO_CLOUDS.map((c) => (
          <Cloud key={c.top} className="bb-cloud" width={c.width} style={{ top: c.top, animationDuration: c.duration, animationDelay: c.delay }} />
        ))}
        {HERO_BALLOONS.map((b) => (
          <div key={b.left} className="bb-balloon" style={{ left: b.left, animationDuration: b.duration, animationDelay: b.delay }}>
            <Balloon color={b.color} shade={b.shade} scale={b.scale} style={{ animationDelay: b.delay }} />
          </div>
        ))}
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line' }}>{heading}</h1>}
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date">{heroDateText}</p>)}
          <div className="hero-actions">
            <a href="#rsvp" className="btn">{t.rsvpBtn}</a>
            <a href="#story" className="btn btn-outline">{t.ourStoryBtn}</a>
            {isPaid && <a href="#photos" className="btn btn-outline">{t.shareYourPhoto}</a>}
          </div>
        </div>
      </div>

      {/* Bunting, swinging gently */}
      <div className="bb-bunting" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/bunting.webp`} alt="" />
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-white section-center">
            <div className="wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bb-float" src={`${IMG}/bear-balloons.jpeg`} alt="" style={{ display: 'block', width: 220, margin: '0 auto 14px' }} />
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
              {editSlots?.description ?? (
                <p style={{ ...textStyle, maxWidth: 560, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* COUNTDOWN */}
      {eventDate && (
        <div className="countdown-sky">
          <Cloud className="bb-cloud" width={150} style={{ top: 18, animationDuration: '50s', animationDelay: '-8s' }} />
          <Cloud className="bb-cloud" width={100} style={{ bottom: 30, animationDuration: '64s', animationDelay: '-34s' }} />
          <div className="bb-bird-path"><Bird /></div>
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
        <Reveal from="right">
          <div className="section section-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bb-elephant bb-float" src={`${IMG}/elephant-balloon.webp`} alt="" />
            <div className="wrap-wide" style={{ position: 'relative' }}>
              <Boat />
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 700 }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bb-navy)', textDecoration: 'none', fontWeight: 800 }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-peach section-center">
            <div className="wrap-wide">
              <Boat />
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--bb-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-white section-center">
            <div className="wrap">
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
              <Boat />
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
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

      <Waves from={CLOUD} to={BLUE_PALE} />

      {/* RSVP — the whale swims in the bottom-right corner, blowing bubbles */}
      {showRsvp !== false && (
        <Reveal>
          <div id="rsvp" className="rsvp-section">
            {BUBBLES.map((b) => (
              <Bubble key={b.right} className="bb-bubble" size={b.size} style={{ right: b.right, animationDelay: b.delay }} />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bb-whale" src={`${IMG}/whale.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Boat />
              <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
              <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              <div className="rsvp-card">
                <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
              </div>
            </div>
          </div>
        </Reveal>
      )}
      {/* POTLUCK (Plus, off by default) */}
      {isPaid && potluck && (
        <Reveal>
          <div id="potluck" className="rsvp-section">
            {BUBBLES.map((b) => (
              <Bubble key={b.right} className="bb-bubble" size={b.size} style={{ right: b.right, animationDelay: b.delay }} />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bb-whale" src={`${IMG}/whale.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Boat />
              <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
              <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              <div className="rsvp-card">
                <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) */}
      {isPaid && giftExchange && (
        <Reveal>
          <div id="gift-exchange" className="rsvp-section">
            {BUBBLES.map((b) => (
              <Bubble key={b.right} className="bb-bubble" size={b.size} style={{ right: b.right, animationDelay: b.delay }} />
            ))}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bb-whale" src={`${IMG}/whale.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Boat />
              <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
              <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              <div className="rsvp-card">
                <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <Boat />
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* REGISTRY */}
      {(registryDescription || registryButtonLink) && (
        <Reveal>
          <div
            className="registry-wrap"
            // A soft sky blue by default; an uploaded registry image replaces it.
            style={registryImage ? { backgroundImage: `url(${registryImage})` } : { backgroundColor: '#E4F4FF' }}
          >
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
          <div className="section section-peach section-center">
            <div className="wrap-wide">
              <Boat />
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 20 }} textStyle={{ color: 'var(--bb-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-white section-center">
            <div className="wrap">
              <Boat />
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
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
              <Boat />
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" fallback={t.buildOurPlaylist} />
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

      <Waves from={PEACH} to="#1F5684" />

      {/* FOOTER */}
      <footer className="footer">
        {FOOTER_STARS.map((s) => (
          <Star key={`${s.top}-${s.left}`} className="bb-star" size={s.size} fill={s.fill} style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
        ))}
        <Moon />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 10, position: 'relative' }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 0 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--bb-blue-light)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--bb-blue-light)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
