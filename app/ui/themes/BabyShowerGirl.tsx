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
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

const IMG = '/images/themes/baby-shower-girl';

// Exclusive to Girl Baby Shower — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 4 }, (_, i) => ({
  id: `bsg-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The elephant's palette: soft greys and pinks.
const GREY = '#EDECEA';
const GREY_LIGHT = '#F6F5F4';
const GREY_MID = '#D7D5D1';
const GREY_DARK = '#C2BFB8';
const PINK = '#F5D7DF';
const PINK_SHADOW = '#F5CCD7';
const PINK_HIGHLIGHT = '#F7DEE5';
const PINK_SHINE = '#F7EAEE';
const BLUSH = '#EC9CCC';

// ─── SVG decorations (animated in CSS; all motion stops for reduced-motion users) ───

function Balloon({ color, scale = 1, className, style }: { color: string; scale?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={60 * scale} height={120 * scale} viewBox="0 0 60 120" fill="none" aria-hidden="true">
      <path d="M30 70 C 24 84, 36 94, 28 106 S 34 116, 30 120" stroke={GREY_DARK} strokeWidth="1.2" />
      <ellipse cx="30" cy="34" rx="25" ry="31" fill={color} stroke={PINK_SHADOW} strokeWidth="1.5" />
      <ellipse cx="21" cy="22" rx="6" ry="10" fill={PINK_SHINE} opacity="0.8" transform="rotate(-20 21 22)" />
      <path d="M26 64 L34 64 L31 70 L29 70 Z" fill={color} />
    </svg>
  );
}

// A little heart, used rising through the countdown.
function Heart({ color = BLUSH, size = 18, className, style }: { color?: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 21 C 5 15, 0 11, 0 6 A 6 6 0 0 1 12 4 A 6 6 0 0 1 24 6 C 24 11, 19 15, 12 21 Z" fill={color} />
    </svg>
  );
}

// A baby rattle that wiggles — the ornament above each section title.
function Rattle() {
  return (
    <svg className="bs-rattle" width="46" height="58" viewBox="0 0 46 58" fill="none" aria-hidden="true">
      <circle cx="23" cy="17" r="15" fill={PINK} stroke={PINK_SHADOW} strokeWidth="2" />
      <path d="M11 11 Q 23 6 35 11" stroke={GREY_LIGHT} strokeWidth="3" strokeLinecap="round" />
      <path d="M9 19 Q 23 14 37 19" stroke={BLUSH} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <circle cx="17" cy="12" r="3" fill={PINK_SHINE} />
      <rect x="20" y="31" width="6" height="15" rx="3" fill={GREY_MID} />
      <circle cx="23" cy="50" r="6.5" stroke={PINK_SHADOW} strokeWidth="3" />
    </svg>
  );
}

// A soft cloud that drifts across the countdown.
function Cloud({ width = 150, className, style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={width} height={(width * 64) / 150} viewBox="0 0 150 64" aria-hidden="true">
      <path d="M22 62 C 6 62, 0 50, 8 40 C 4 26, 22 18, 34 26 C 38 10, 62 4, 74 18 C 84 6, 110 8, 112 28 C 130 24, 146 36, 140 50 C 146 58, 138 62, 128 62 Z" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}

// A four-point sparkle, twinkling in the footer sky.
function Sparkle({ size = 14, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 0 C 11 7, 13 9, 20 10 C 13 11, 11 13, 10 20 C 9 13, 7 11, 0 10 C 7 9, 9 7, 10 0 Z" fill="#FFFFFF" />
    </svg>
  );
}

function Moon() {
  return (
    <svg className="bs-moon" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <path d="M36 4 A 24 24 0 1 0 50 38 A 19 19 0 1 1 36 4 Z" fill={BLUSH} opacity="0.85" />
      <circle cx="20" cy="30" r="2" fill={BLUSH} opacity="0.5" />
    </svg>
  );
}

const HERO_BALLOONS: Array<{ left: string; color: string; delay: string; duration: string; scale: number }> = [
  { left: '52%', color: '#FFFFFF', delay: '0s', duration: '16s', scale: 1 },
  { left: '64%', color: BLUSH, delay: '-5s', duration: '19s', scale: 0.8 },
  { left: '76%', color: '#FFFFFF', delay: '-9s', duration: '15s', scale: 1.1 },
  { left: '88%', color: BLUSH, delay: '-2s', duration: '21s', scale: 0.7 },
  { left: '94%', color: '#FFFFFF', delay: '-13s', duration: '18s', scale: 0.9 },
];

const RISING_HEARTS = [
  { left: '8%', delay: '0s', size: 16 }, { left: '22%', delay: '-3s', size: 12 }, { left: '37%', delay: '-6s', size: 18 },
  { left: '63%', delay: '-1.5s', size: 14 }, { left: '78%', delay: '-4.5s', size: 20 }, { left: '91%', delay: '-7s', size: 12 },
];

const SPARKLES = [
  { top: '18%', left: '12%', size: 14, delay: '0s' }, { top: '36%', left: '26%', size: 9, delay: '-1.2s' },
  { top: '14%', left: '72%', size: 12, delay: '-0.6s' }, { top: '40%', left: '86%', size: 16, delay: '-1.8s' },
  { top: '62%', left: '8%', size: 10, delay: '-2.4s' }, { top: '66%', left: '92%', size: 10, delay: '-0.9s' },
];

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: PINK, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['baby-shower-girl']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: '55%' }}>
        <p style={{ display: 'inline-block', fontFamily: "'Quicksand', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#B8578E', background: 'rgba(255,255,255,0.75)', borderRadius: 999, fontWeight: 700, padding: '4px 12px', margin: '0 0 8px' }}>It&apos;s a girl!</p>
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 700, color: '#5C5752', margin: '0 0 6px', lineHeight: 1.05 }}>{heading || 'Baby Shower'}</h2>
        {date && <p style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#7F7A73', fontWeight: 600, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .bs {
    --bs-grey: ${GREY};
    --bs-grey-light: ${GREY_LIGHT};
    --bs-grey-2: #E4E2DF;
    --bs-grey-3: #DDDCD8;
    --bs-grey-mid: ${GREY_MID};
    --bs-grey-4: #CECCC6;
    --bs-grey-dark: ${GREY_DARK};
    --bs-pink: ${PINK};
    --bs-pink-shadow: ${PINK_SHADOW};
    --bs-pink-highlight: ${PINK_HIGHLIGHT};
    --bs-pink-shine: ${PINK_SHINE};
    --bs-pink-pale: #FBEBEB;
    --bs-blush: ${BLUSH};
    /* Readable text colours, deepened from the palette's greys and blush */
    --bs-ink: #5C5752;
    --bs-ink-soft: #7F7A73;
    --bs-rose: #B8578E;
    --bs-rose-deep: #9E4677;
    --bs-font-display: 'Dancing Script', 'Brush Script MT', cursive;
    --bs-font-sans: 'Quicksand', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .bs * { box-sizing: border-box; }
  .bs { margin: 0; background: var(--bs-grey-light); color: var(--bs-ink); font-family: var(--bs-font-sans); font-weight: 500; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .bs img { max-width: 100%; }

  /* ─ animations ─ */
  @keyframes bs-rise { from { transform: translateY(0); } to { transform: translateY(-135vh); } }
  @keyframes bs-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
  @keyframes bs-wiggle { 0%, 70%, 100% { transform: rotate(0); } 76% { transform: rotate(-16deg); } 84% { transform: rotate(14deg); } 92% { transform: rotate(-8deg); } }
  @keyframes bs-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes bs-heart { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-260px) scale(1.1); opacity: 0; } }
  @keyframes bs-drift { from { transform: translateX(-180px); } to { transform: translateX(calc(100vw + 180px)); } }
  @keyframes bs-fly { 0% { transform: translate(-260px, 0); } 25% { transform: translate(25vw, -10px); } 50% { transform: translate(50vw, 6px); } 75% { transform: translate(75vw, -8px); } 100% { transform: translate(calc(100vw + 60px), 0); } }
  @keyframes bs-twinkle { 0%, 100% { transform: scale(0.6); opacity: 0.4; } 50% { transform: scale(1.1); opacity: 1; } }
  @keyframes bs-garland { 0%, 100% { transform: rotate(-0.6deg); } 50% { transform: rotate(0.6deg); } }
  @media (prefers-reduced-motion: reduce) {
    .bs .bs-balloon, .bs .bs-balloon svg, .bs .bs-rattle, .bs .bs-float, .bs .bs-heart, .bs .bs-cloud,
    .bs .bs-stork, .bs .bs-sparkle, .bs .bs-garland img { animation: none !important; }
    .bs .bs-heart { opacity: 0.8; }
    .bs .bs-stork { left: 6%; }
  }

  .bs .bs-balloon { position: absolute; bottom: -140px; z-index: 0; pointer-events: none; opacity: 0.9; animation: bs-rise linear infinite; }
  .bs .bs-balloon svg { display: block; transform-origin: 50% 100%; animation: bs-sway 4s ease-in-out infinite; }
  .bs .bs-rattle { display: block; margin: 0 auto 12px; transform-origin: 50% 85%; animation: bs-wiggle 3.6s ease-in-out infinite; }
  .bs .bs-float { animation: bs-bob 5s ease-in-out infinite; }
  .bs .bs-garland { line-height: 0; overflow: hidden; background: var(--bs-pink-pale); }
  .bs .bs-garland img { display: block; width: min(820px, 100%); margin: 0 auto; mix-blend-mode: multiply; transform-origin: 50% 0; animation: bs-garland 6s ease-in-out infinite; }

  .bs .eyebrow { font-family: var(--bs-font-sans); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--bs-rose); font-weight: 700; margin: 0 0 8px; }
  .bs .section-title { font-family: var(--bs-font-display); font-size: clamp(38px, 5vw, 56px); font-weight: 700; color: var(--bs-ink); margin: 0 0 20px; line-height: 1.1; }

  .bs .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .bs .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .bs .section { position: relative; padding: 88px 28px; background: var(--bs-grey-light); overflow: hidden; }
  .bs .section-pink { background: var(--bs-pink-pale); }
  .bs .section-grey { background: var(--bs-grey); }
  .bs .section-center { text-align: center; }
  @media (max-width: 640px) { .bs .section { padding: 60px 20px; } }

  .bs .btn { font-family: var(--bs-font-sans); font-size: 14px; font-weight: 700; letter-spacing: 0.6px; padding: 14px 30px; border-radius: 999px; border: 2px solid var(--bs-rose); background: var(--bs-rose); color: #FFFFFF; cursor: pointer; transition: background 0.15s ease, transform 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .bs .btn:hover { background: var(--bs-rose-deep); border-color: var(--bs-rose-deep); transform: translateY(-1px); }
  .bs .btn-outline { background: rgba(255,255,255,0.7); color: var(--bs-rose); }
  .bs .btn-outline:hover { background: #FFFFFF; color: var(--bs-rose-deep); }

  .bs input, .bs textarea, .bs select { font-family: var(--bs-font-sans); font-size: 15px; font-weight: 500; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--bs-grey-mid); outline: none; background: #FFFFFF; color: var(--bs-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .bs input:focus, .bs textarea:focus, .bs select:focus { border-color: var(--bs-blush); }
  .bs label.field-label { font-family: var(--bs-font-sans); font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--bs-rose); display: block; margin-bottom: 5px; font-weight: 700; }
  .bs .radio-label, .bs .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--bs-ink); cursor: pointer; }
  .bs .radio-label input, .bs .check-label input { width: auto; border: none; padding: 0; accent-color: var(--bs-rose); }
  .bs .check-hint { font-family: var(--bs-font-sans); font-size: 12px; color: var(--bs-ink-soft); margin: 4px 0 0; }
  .bs .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .bs .rsvp-error { color: #B3261E; font-size: 13px; margin: 0; font-family: var(--bs-font-sans); }
  .bs .rsvp-success { text-align: center; padding: 16px 0; }
  .bs .rsvp-headline { font-family: var(--bs-font-display); font-size: 34px; color: var(--bs-rose); margin: 0 0 10px; font-weight: 700; }
  .bs .rsvp-sub { font-size: 14px; color: var(--bs-ink-soft); margin: 0; }
  .bs .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the gifts fill the left of the photo, so everything sits on the right */
  .bs .hero { position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: flex-end; text-align: right; padding: 72px 64px 96px; background: var(--bs-pink); overflow: hidden; }
  .bs .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: left center; z-index: 0; }
  .bs .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to left, rgba(251,235,235,0.55) 0%, rgba(251,235,235,0.2) 40%, rgba(251,235,235,0) 62%); z-index: 0; pointer-events: none; }
  .bs .hero-content { position: relative; z-index: 1; max-width: 560px; }
  @keyframes bs-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .bs .hero-eyebrow { animation: bs-in 0.9s ease both; display: inline-block; font-family: var(--bs-font-sans); font-size: 14px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; color: var(--bs-rose); background: rgba(255,255,255,0.75); border-radius: 999px; padding: 8px 20px; margin: 0 0 16px; }
  .bs .hero-name { animation: bs-in 0.9s ease 0.15s both; font-family: var(--bs-font-display); font-size: clamp(54px, 8vw, 96px); font-weight: 700; color: var(--bs-ink); margin: 0 0 14px; line-height: 1; text-shadow: 0 2px 18px rgba(255,255,255,0.7); }
  .bs .hero-date { animation: bs-in 0.9s ease 0.3s both; font-family: var(--bs-font-sans); font-size: 15px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--bs-ink-soft); font-weight: 700; margin: 0 0 30px; }
  .bs .hero-actions { animation: bs-in 0.9s ease 0.45s both; display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
  @media (max-width: 720px) {
    .bs .hero { padding: 72px 22px 88px; align-items: flex-end; }
    .bs .hero-overlay { background: linear-gradient(to top, rgba(251,235,235,0.92) 0%, rgba(251,235,235,0.6) 50%, rgba(251,235,235,0.05) 100%); }
  }

  /* countdown: soft pink sky with drifting clouds, rising hearts and the stork */
  .bs .countdown-sky { position: relative; background: linear-gradient(to bottom, var(--bs-pink) 0%, var(--bs-pink-pale) 100%); overflow: hidden; }
  .bs .bs-cloud { position: absolute; left: 0; pointer-events: none; animation: bs-drift linear infinite; }
  .bs .bs-heart { position: absolute; bottom: -24px; pointer-events: none; animation: bs-heart 7s ease-in infinite; }
  .bs .bs-stork { position: absolute; top: 18px; left: 0; width: 170px; pointer-events: none; animation: bs-fly 22s linear infinite; }
  @media (max-width: 640px) { .bs .bs-stork { width: 110px; } }
  .bs .countdown-wrap { position: relative; z-index: 1; padding: 150px 24px 80px; text-align: center; }
  .bs .countdown-wrap .eyebrow { color: var(--bs-rose); }
  .bs .countdown-heading { font-family: var(--bs-font-display); font-size: clamp(38px, 5vw, 52px); color: var(--bs-ink); margin: 0 0 30px; font-weight: 700; }
  .bs .countdown-row { display: flex; justify-content: center; gap: clamp(12px, 4vw, 34px); }
  .bs .countdown-block { text-align: center; min-width: 76px; padding: 16px 10px 12px; background: rgba(255,255,255,0.75); border-radius: 20px; box-shadow: 0 6px 18px rgba(236,156,204,0.25); }
  .bs .countdown-value { font-family: var(--bs-font-sans); font-size: clamp(30px, 5vw, 48px); color: var(--bs-rose); font-weight: 700; line-height: 1; }
  .bs .countdown-label { font-family: var(--bs-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bs-ink-soft); font-weight: 700; margin-top: 8px; }

  /* details */
  .bs .bs-teddy { position: absolute; top: 40px; left: max(12px, calc(50% - 640px)); width: 190px; pointer-events: none; opacity: 0.95; }
  @media (max-width: 900px) { .bs .bs-teddy { width: 120px; top: 16px; left: 8px; opacity: 0.6; } }
  .bs .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; position: relative; }
  @media (max-width: 640px) { .bs .details-grid { grid-template-columns: 1fr; } }
  .bs .details-card { background: #FFFFFF; border-radius: 22px; padding: 28px 26px; box-shadow: 0 10px 28px rgba(194,191,184,0.35); }
  .bs .details-card .label { font-family: var(--bs-font-sans); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--bs-rose); font-weight: 700; margin: 0 0 10px; }
  .bs .details-card .time { font-family: var(--bs-font-display); font-size: 34px; line-height: 1.2; color: var(--bs-ink); font-weight: 700; }
  .bs .details-card p { font-size: 14px; color: var(--bs-ink-soft); margin: 0 0 3px; }
  .bs .map-frame { border-radius: 22px; overflow: hidden; min-height: 220px; border: 5px solid #FFFFFF; box-shadow: 0 10px 28px rgba(194,191,184,0.35); }
  .bs .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .bs .directions-link { text-align: center; margin-top: 20px; }
  .bs .directions-link a { font-family: var(--bs-font-sans); font-size: 14px; color: var(--bs-rose); font-weight: 700; text-decoration: none; }

  /* program */
  .bs .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .bs .schedule-day:last-child { margin-bottom: 0; }
  .bs .schedule-day-title { font-family: var(--bs-font-sans); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: var(--bs-rose); font-weight: 700; margin: 0 0 18px; }
  .bs .schedule-list { border-top: 2px dotted var(--bs-blush); text-align: left; }
  .bs .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 2px dotted var(--bs-pink-shadow); align-items: baseline; }
  .bs .schedule-time { font-family: var(--bs-font-sans); font-size: 16px; color: var(--bs-rose); min-width: 110px; flex-shrink: 0; font-weight: 700; }
  .bs .schedule-info .name { font-size: 15px; color: var(--bs-ink); font-weight: 700; margin: 0 0 3px; }
  .bs .schedule-info .loc { font-size: 13px; color: var(--bs-ink-soft); margin: 0; }

  /* rsvp, with the elephant in the bottom-right corner */
  /* Pink, not grey: the elephant's body is the palette grey and would disappear on it */
  .bs .rsvp-section { position: relative; background: linear-gradient(to bottom, var(--bs-pink-pale) 0%, var(--bs-pink-highlight) 100%); padding: 88px 28px 110px; text-align: center; overflow: hidden; }
  .bs .bs-elephant { position: absolute; right: max(0px, calc(50% - 620px)); bottom: -6px; height: 400px; width: auto; pointer-events: none; z-index: 0; }
  @media (max-width: 900px) { .bs .bs-elephant { height: 250px; right: -20px; opacity: 0.85; } }
  @media (max-width: 560px) { .bs .bs-elephant { height: 170px; right: -24px; } }
  .bs .rsvp-card { position: relative; z-index: 1; max-width: 460px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 34px 30px; text-align: left; box-shadow: 0 14px 40px rgba(194,191,184,0.45); }

  .bs .gallery-tile { overflow: hidden; border-radius: 18px; }

  /* registry */
  .bs .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 40px 20px; }
  .bs .registry-overlay { background: rgba(255,255,255,0.88); padding: 44px 56px; text-align: center; border-radius: 26px; box-shadow: 0 10px 30px rgba(194,191,184,0.35); }
  @media (max-width: 640px) { .bs .registry-overlay { padding: 34px 24px; } }
  .bs .registry-title { font-family: var(--bs-font-display); font-size: 36px; color: var(--bs-ink); margin: 0 0 12px; font-weight: 700; }
  .bs .registry-description { font-size: 15px; color: var(--bs-ink-soft); margin: 0 auto 24px; line-height: 1.6; max-width: 390px; }
  .bs .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; background: var(--bs-rose); color: #FFFFFF; text-decoration: none; font-family: var(--bs-font-sans); font-size: 14px; font-weight: 700; }
  .bs .registry-button:hover { background: var(--bs-rose-deep); }

  /* songs */
  .bs .song-section { background: var(--bs-pink-pale); padding: 88px 28px; text-align: center; }
  .bs .song-section .song-list { border-top: 2px dotted var(--bs-blush); max-width: 540px; margin: 0 auto; }
  .bs .song-section .song-row { border-bottom: 2px dotted var(--bs-pink-shadow); padding: 10px 0; }
  .bs .song-section .song-row .title { color: var(--bs-ink); }
  .bs .song-section .song-row .artist { color: var(--bs-ink-soft); }

  /* share */
  .bs .share-band { padding: 84px 24px; background: var(--bs-pink); text-align: center; }
  .bs .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .bs .share-hashtag { font-family: var(--bs-font-display); font-size: clamp(36px, 5vw, 50px); color: var(--bs-ink); margin: 0 0 26px; font-weight: 700; overflow-wrap: anywhere; }

  /* footer: a night sky in pink with a twinkling moon and stars */
  .bs .footer { position: relative; padding: 72px 24px 64px; background: var(--bs-grey-3); text-align: center; overflow: hidden; }
  .bs .footer p { font-size: 14px; color: var(--bs-ink); margin: 0 0 4px; }
  .bs .bs-moon { display: block; margin: 0 auto 14px; }
  .bs .bs-sparkle { position: absolute; pointer-events: none; animation: bs-twinkle 2.6s ease-in-out infinite; }
  .bs .footer .section-title { position: relative; }
  .bs .footer-signoff { font-family: var(--bs-font-display); font-size: clamp(32px, 6vw, 44px) !important; font-weight: 700; color: var(--bs-rose) !important; margin: 24px 0 0 !important; position: relative; }
  .bs .footer-credit { font-size: 11px; color: var(--bs-ink-soft) !important; margin-top: 24px !important; letter-spacing: 0.5px; position: relative; }
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
    howWeGotHere: 'A little miracle is on the way',
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
    ourStoryLabel: 'Bienvenue, petite',
    howWeGotHere: 'Un petit miracle est en route',
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
    ourStoryLabel: 'Bienvenida, pequeña',
    howWeGotHere: 'Un pequeño milagro está en camino',
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

const HERO_EYEBROW_DEFAULT = { en: "It's a girl!", fr: "C'est une fille !", es: '¡Es niña!' };

export default function BabyShowerGirl({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['baby-shower-girl'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--bs-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--bs-ink-soft)' };

  return (
    <div className="bs">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Quicksand:wght@500;600;700&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes={demo} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={{ objectFit: heroObjectFit }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt="" style={{ objectFit: heroObjectFit }} />
          )
        )}
        <div className="hero-overlay" />
        {HERO_BALLOONS.map((b) => (
          <div key={b.left} className="bs-balloon" style={{ left: b.left, animationDuration: b.duration, animationDelay: b.delay }}>
            <Balloon color={b.color} scale={b.scale} style={{ animationDelay: b.delay }} />
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

      {/* A little clothesline of baby clothes, swaying */}
      <div className="bs-garland" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/clothesline.jpeg`} alt="" />
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-pink section-center">
            <div className="wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bs-float" src={`${IMG}/teddy-hearts.webp`} alt="" style={{ display: 'block', width: 150, margin: '0 auto 18px' }} />
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
          <Cloud className="bs-cloud" style={{ top: 20, animationDuration: '46s', animationDelay: '-8s' }} />
          <Cloud className="bs-cloud" width={105} style={{ top: 110, animationDuration: '60s', animationDelay: '-30s' }} />
          <Cloud className="bs-cloud" style={{ bottom: 40, animationDuration: '52s', animationDelay: '-20s' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="bs-stork" src={`${IMG}/stork.webp`} alt="" />
          {RISING_HEARTS.map((h) => (
            <Heart key={h.left} className="bs-heart" size={h.size} color={h.size > 15 ? BLUSH : PINK_SHADOW} style={{ left: h.left, animationDelay: h.delay }} />
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
        <Reveal from="right">
          <div className="section section-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bs-teddy bs-float" src={`${IMG}/teddy-balloons.webp`} alt="" />
            <div className="wrap-wide" style={{ position: 'relative' }}>
              <Rattle />
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
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bs-rose)', textDecoration: 'none', fontWeight: 700 }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-pink section-center">
            <div className="wrap-wide">
              <Rattle />
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--bs-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-center">
            <div className="wrap">
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-grey section-center">
            <div className="wrap">
              <Rattle />
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

      {/* RSVP — the elephant with her balloon sits in the bottom-right corner */}
      {showRsvp !== false && (
        <Reveal>
          <div id="rsvp" className="rsvp-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bs-elephant bs-float" src={`${IMG}/elephant.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Rattle />
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bs-elephant bs-float" src={`${IMG}/elephant.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Rattle />
              <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
              <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              <div className="rsvp-card">
                <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
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
            <Rattle />
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
            style={{ backgroundImage: `url(${registryImage || `${IMG}/photo-3.jpeg`})` }}
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
          <div className="section section-pink section-center">
            <div className="wrap-wide">
              <Rattle />
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 20 }} textStyle={{ color: 'var(--bs-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-grey section-center">
            <div className="wrap">
              <Rattle />
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
              <Rattle />
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

      {/* FOOTER */}
      <footer className="footer">
        {SPARKLES.map((s) => (
          <Sparkle key={`${s.top}-${s.left}`} className="bs-sparkle" size={s.size} style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
        ))}
        <Moon />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow" style={{ marginBottom: 10, position: 'relative' }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title" style={{ marginBottom: 0 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18, position: 'relative' }}>{heading}</p>}
            {userEmail && <p style={{ position: 'relative' }}><a href={`mailto:${userEmail}`} style={{ color: 'var(--bs-rose)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p style={{ position: 'relative' }}><a href={`tel:${userPhone}`} style={{ color: 'var(--bs-rose)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
