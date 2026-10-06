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

const IMG = '/images/themes/baby-shower-neutral';

// Exclusive to Neutral Baby Shower — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 3 }, (_, i) => ({
  id: `bsn-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The hero photo's palette: whitewashed wood, the pacifier's blues and
// lavender, the beech teether, and the bunny's white and rust embroidery.
const SURFACE = '#E3E5E8';
const WOOD_WARM = '#DFD3C3';
const WOOD_GRAIN = '#CBBDB1';
const WOOD_DEEP = '#AB9682';
const BLUE = '#55A1DC';
const BLUE_LIGHT = '#84B9ED';
const LAVENDER = '#CED5F8';
const BEECH = '#DEBB96';
const BUNNY = '#E4ECF4';
const ORANGE = '#E17332';
const RUST = '#B84B15';
const STITCH = '#BB5340';

// ─── SVG decorations (animated in CSS; all motion stops for reduced-motion users) ───

function Cloud({ width = 140, fill = LAVENDER, className, style }: { width?: number; fill?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={width} height={(width * 64) / 150} viewBox="0 0 150 64" aria-hidden="true">
      <path d="M22 62 C 6 62, 0 50, 8 40 C 4 26, 22 18, 34 26 C 38 10, 62 4, 74 18 C 84 6, 110 8, 112 28 C 130 24, 146 36, 140 50 C 146 58, 138 62, 128 62 Z" fill={fill} />
    </svg>
  );
}

function Star({ size = 16, fill = BEECH, className, style }: { size?: number; fill?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.5 L14.9 8.6 L22.5 9.2 L16.7 14.2 L18.5 21.7 L12 17.7 L5.5 21.7 L7.3 14.2 L1.5 9.2 L9.1 8.6 Z" fill={fill} stroke={fill} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// A wooden ABC block that hops — the ornament above each section title.
function Block({ letter = 'A' }: { letter?: string }) {
  return (
    <svg className="bn-block" width="46" height="50" viewBox="0 0 46 50" aria-hidden="true">
      <path d="M8 10 L30 4 L42 12 L20 18 Z" fill={WOOD_WARM} stroke={WOOD_DEEP} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 18 L42 12 L42 38 L20 46 Z" fill={BEECH} stroke={WOOD_DEEP} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 10 L20 18 L20 46 L8 36 Z" fill={WOOD_GRAIN} stroke={WOOD_DEEP} strokeWidth="1.5" strokeLinejoin="round" />
      <text x="31" y="35" textAnchor="middle" fontFamily="Fredoka, system-ui, sans-serif" fontWeight="600" fontSize="16" fill={BLUE}>{letter}</text>
      <circle cx="14" cy="27" r="2.4" fill={ORANGE} />
    </svg>
  );
}

// A crib mobile — a moon, a star and a cloud hanging from a wooden bar,
// swinging gently above the countdown.
function CribMobile() {
  return (
    <svg className="bn-mobile" width="220" height="150" viewBox="0 0 220 150" fill="none" aria-hidden="true">
      <line x1="110" y1="0" x2="110" y2="18" stroke={WOOD_DEEP} strokeWidth="2" />
      <path d="M20 26 Q 110 10 200 26" stroke={WOOD_DEEP} strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="18" r="5" fill={BEECH} stroke={WOOD_DEEP} strokeWidth="1.5" />
      <g className="bn-dangle" style={{ animationDelay: '0s' }}>
        <line x1="34" y1="24" x2="34" y2="78" stroke={WOOD_GRAIN} strokeWidth="1.4" />
        <path d="M44 80 A 16 16 0 1 1 30 102 A 12 12 0 1 0 44 80 Z" fill={BEECH} />
      </g>
      <g className="bn-dangle" style={{ animationDelay: '-1.3s' }}>
        <line x1="110" y1="22" x2="110" y2="100" stroke={WOOD_GRAIN} strokeWidth="1.4" />
        <path d="M110 98 L114.8 109.6 L127.4 110.6 L117.8 118.8 L120.8 131.2 L110 124.6 L99.2 131.2 L102.2 118.8 L92.6 110.6 L105.2 109.6 Z" fill={BLUE_LIGHT} />
      </g>
      <g className="bn-dangle" style={{ animationDelay: '-2.1s' }}>
        <line x1="186" y1="24" x2="186" y2="70" stroke={WOOD_GRAIN} strokeWidth="1.4" />
        <path d="M172 92 C 164 92, 162 84, 167 80 C 166 72, 176 68, 181 73 C 184 64, 198 64, 199 74 C 207 73, 211 82, 205 88 C 207 92, 203 93, 199 92 Z" fill={LAVENDER} />
      </g>
    </svg>
  );
}

// Little baby footprints that "walk" across between sections.
function Footprint({ flip, className, style }: { flip?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="24" height="36" viewBox="0 0 20 30" aria-hidden="true">
      <g transform={flip ? 'translate(20 0) scale(-1 1)' : undefined} fill={WOOD_DEEP}>
        <ellipse cx="10" cy="20" rx="6.5" ry="9" />
        <circle cx="4.2" cy="7" r="2.2" />
        <circle cx="8.4" cy="4.6" r="2" />
        <circle cx="12.4" cy="4.4" r="1.8" />
        <circle cx="15.6" cy="6.2" r="1.6" />
        <circle cx="17.6" cy="9.4" r="1.4" />
      </g>
    </svg>
  );
}

function Footsteps() {
  return (
    <div className="bn-steps" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <Footprint key={i} flip={i % 2 === 1} className="bn-step" style={{ animationDelay: `${i * 0.35}s`, transform: `translateY(${i % 2 ? 8 : -8}px) rotate(90deg)` }} />
      ))}
    </div>
  );
}

function Moon() {
  return (
    <svg className="bn-moon" width="56" height="56" viewBox="0 0 54 54" aria-hidden="true">
      <path d="M36 4 A 24 24 0 1 0 50 38 A 19 19 0 1 1 36 4 Z" fill={BEECH} />
    </svg>
  );
}

const HERO_CLOUDS = [
  { top: '14%', width: 150, duration: '58s', delay: '-10s', fill: LAVENDER },
  { top: '30%', width: 100, duration: '72s', delay: '-40s', fill: BUNNY },
  { top: '64%', width: 120, duration: '64s', delay: '-25s', fill: LAVENDER },
];
const HERO_STARS = [
  { top: '20%', left: '8%', size: 16, delay: '0s', fill: BEECH }, { top: '34%', left: '38%', size: 12, delay: '-0.8s', fill: BLUE_LIGHT },
  { top: '72%', left: '6%', size: 14, delay: '-1.6s', fill: BLUE_LIGHT }, { top: '80%', left: '34%', size: 18, delay: '-2.2s', fill: BEECH },
  { top: '12%', left: '30%', size: 10, delay: '-1.1s', fill: LAVENDER },
];
const FOOTER_STARS = [
  { top: '16%', left: '10%', size: 12, delay: '0s' }, { top: '34%', left: '22%', size: 8, delay: '-1.2s' },
  { top: '14%', left: '76%', size: 11, delay: '-0.6s' }, { top: '42%', left: '88%', size: 14, delay: '-1.8s' },
  { top: '66%', left: '7%', size: 9, delay: '-2.4s' }, { top: '70%', left: '93%', size: 9, delay: '-0.9s' },
];

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: SURFACE, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['baby-shower-neutral']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 22px', maxWidth: '46%' }}>
        <p style={{ display: 'inline-block', fontFamily: "'Nunito', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#2E7BB8', background: 'rgba(255,255,255,0.75)', borderRadius: 999, fontWeight: 800, padding: '4px 12px', margin: '0 0 8px' }}>Baby on the way!</p>
        <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 'clamp(20px, 3.8vw, 30px)', fontWeight: 600, color: '#5A4A3C', margin: '0 0 6px', lineHeight: 1.05 }}>{heading || 'Baby Shower'}</h2>
        {date && <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#7A6858', fontWeight: 700, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .bn {
    --bn-surface: ${SURFACE};
    --bn-wood-warm: ${WOOD_WARM};
    --bn-wood-grain: ${WOOD_GRAIN};
    --bn-wood-deep: ${WOOD_DEEP};
    --bn-blue: ${BLUE};
    --bn-blue-light: ${BLUE_LIGHT};
    --bn-lavender: ${LAVENDER};
    --bn-beech: ${BEECH};
    --bn-bunny: ${BUNNY};
    --bn-orange: ${ORANGE};
    --bn-rust: ${RUST};
    --bn-stitch: ${STITCH};
    /* Readable text and button colours, deepened from the palette */
    --bn-ink: #5A4A3C;
    --bn-ink-soft: #7A6858;
    --bn-blue-deep: #2E7BB8;
    --bn-rust-deep: #963C10;
    --bn-font-display: 'Fredoka', 'Nunito', system-ui, sans-serif;
    --bn-font-sans: 'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .bn * { box-sizing: border-box; }
  .bn { margin: 0; background: var(--bn-surface); color: var(--bn-ink); font-family: var(--bn-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .bn img { max-width: 100%; }

  /* ─ animations ─ */
  @keyframes bn-drift { from { transform: translateX(-180px); } to { transform: translateX(calc(100vw + 180px)); } }
  @keyframes bn-twinkle { 0%, 100% { transform: scale(0.6) rotate(0deg); opacity: 0.45; } 50% { transform: scale(1.1) rotate(20deg); opacity: 1; } }
  @keyframes bn-hop { 0%, 60%, 100% { transform: translateY(0) rotate(0); } 70% { transform: translateY(-10px) rotate(-8deg); } 80% { transform: translateY(0) rotate(4deg); } 88% { transform: translateY(-4px) rotate(0); } }
  @keyframes bn-swing { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
  @keyframes bn-dangle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
  @keyframes bn-step { 0%, 10% { opacity: 0; } 20%, 70% { opacity: 0.75; } 85%, 100% { opacity: 0; } }
  @keyframes bn-bob { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-2deg); } }
  @media (prefers-reduced-motion: reduce) {
    .bn .bn-cloud, .bn .bn-star, .bn .bn-block, .bn .bn-mobile, .bn .bn-dangle, .bn .bn-step, .bn .bn-float { animation: none !important; }
    .bn .bn-step { opacity: 0.75; }
  }

  .bn .bn-cloud { position: absolute; left: 0; pointer-events: none; z-index: 0; opacity: 0.9; animation: bn-drift linear infinite; }
  .bn .bn-star { position: absolute; pointer-events: none; animation: bn-twinkle 3s ease-in-out infinite; }
  .bn .bn-block { display: block; margin: 0 auto 12px; transform-origin: 50% 100%; animation: bn-hop 3.4s ease-in-out infinite; }
  .bn .bn-mobile { display: block; margin: 0 auto -10px; transform-origin: 50% 0; animation: bn-swing 5s ease-in-out infinite; overflow: visible; }
  .bn .bn-dangle { animation: bn-dangle 2.6s ease-in-out infinite; }
  .bn .bn-float { animation: bn-bob 5s ease-in-out infinite; }
  .bn .bn-steps { display: flex; justify-content: center; align-items: center; gap: 26px; height: 76px; background: var(--bn-surface); overflow: hidden; }
  .bn .bn-step { opacity: 0; animation: bn-step 3.2s ease-in-out infinite; }
  .bn .bn-toys { background: var(--bn-surface); padding: 30px 20px 0; line-height: 0; }
  .bn .bn-toys img { display: block; width: min(1000px, 100%); margin: 0 auto; }

  .bn .eyebrow { font-family: var(--bn-font-sans); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--bn-blue-deep); font-weight: 800; margin: 0 0 8px; }
  .bn .eyebrow.on-dark { color: var(--bn-lavender); }
  .bn .section-title { font-family: var(--bn-font-display); font-size: clamp(32px, 4.4vw, 46px); font-weight: 600; color: var(--bn-ink); margin: 0 0 20px; line-height: 1.15; }
  .bn .section-title.on-dark { color: #FFFFFF; }

  .bn .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .bn .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .bn .section { position: relative; padding: 88px 28px; background: var(--bn-surface); overflow: hidden; }
  .bn .section-warm { background: linear-gradient(to bottom, #EDE6DC 0%, var(--bn-wood-warm) 100%); }
  .bn .section-cool { background: var(--bn-bunny); }
  .bn .section-white { background: #FFFFFF; }
  .bn .section-center { text-align: center; }
  @media (max-width: 640px) { .bn .section { padding: 60px 20px; } }

  .bn .btn { font-family: var(--bn-font-sans); font-size: 14px; font-weight: 800; letter-spacing: 0.6px; padding: 14px 30px; border-radius: 999px; border: 2px solid var(--bn-rust); background: var(--bn-rust); color: #FFFFFF; cursor: pointer; transition: background 0.15s ease, transform 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .bn .btn:hover { background: var(--bn-rust-deep); border-color: var(--bn-rust-deep); transform: translateY(-1px); }
  .bn .btn-outline { background: rgba(255,255,255,0.75); color: var(--bn-blue-deep); border-color: var(--bn-blue-deep); }
  .bn .btn-outline:hover { background: #FFFFFF; color: var(--bn-blue-deep); border-color: var(--bn-blue-deep); }
  .bn .btn-outline.on-dark { background: transparent; color: #FFFFFF; border-color: rgba(255,255,255,0.7); }
  .bn .btn-outline.on-dark:hover { background: rgba(255,255,255,0.12); }

  .bn input, .bn textarea, .bn select { font-family: var(--bn-font-sans); font-size: 15px; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--bn-wood-grain); outline: none; background: #FFFFFF; color: var(--bn-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .bn input:focus, .bn textarea:focus, .bn select:focus { border-color: var(--bn-blue); }
  .bn label.field-label { font-family: var(--bn-font-sans); font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--bn-blue-deep); display: block; margin-bottom: 5px; font-weight: 800; }
  .bn .radio-label, .bn .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--bn-ink); cursor: pointer; }
  .bn .radio-label input, .bn .check-label input { width: auto; border: none; padding: 0; accent-color: var(--bn-blue-deep); }
  .bn .check-hint { font-family: var(--bn-font-sans); font-size: 12px; color: var(--bn-ink-soft); margin: 4px 0 0; }
  .bn .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .bn .rsvp-error { color: #B3261E; font-size: 13px; margin: 0; font-family: var(--bn-font-sans); }
  .bn .rsvp-success { text-align: center; padding: 16px 0; }
  .bn .rsvp-headline { font-family: var(--bn-font-display); font-size: 30px; color: var(--bn-blue-deep); margin: 0 0 10px; font-weight: 600; }
  .bn .rsvp-sub { font-size: 14px; color: var(--bn-ink-soft); margin: 0; }
  .bn .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the bunny, pacifier and teether fill the right, so everything sits on the left */
  .bn .hero { position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: flex-start; text-align: left; padding: 72px 64px 96px; background: var(--bn-surface); overflow: hidden; }
  .bn .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: right center; z-index: 0; }
  .bn .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(227,229,232,0.7) 0%, rgba(227,229,232,0.35) 42%, rgba(227,229,232,0) 62%); z-index: 0; pointer-events: none; }
  .bn .hero-content { position: relative; z-index: 1; max-width: 560px; }
  @keyframes bn-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .bn .hero-eyebrow { animation: bn-in 0.9s ease both; display: inline-block; font-family: var(--bn-font-sans); font-size: 13px; letter-spacing: 3px; text-transform: uppercase; font-weight: 800; color: var(--bn-blue-deep); background: rgba(255,255,255,0.8); border-radius: 999px; padding: 8px 20px; margin: 0 0 16px; }
  .bn .hero-name { animation: bn-in 0.9s ease 0.15s both; font-family: var(--bn-font-display); font-size: clamp(46px, 7vw, 84px); font-weight: 600; color: var(--bn-ink); margin: 0 0 14px; line-height: 1.02; text-shadow: 0 2px 16px rgba(255,255,255,0.65); }
  .bn .hero-date { animation: bn-in 0.9s ease 0.3s both; font-family: var(--bn-font-sans); font-size: 15px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--bn-ink-soft); font-weight: 800; margin: 0 0 30px; }
  .bn .hero-actions { animation: bn-in 0.9s ease 0.45s both; display: flex; gap: 12px; flex-wrap: wrap; }
  @media (max-width: 720px) {
    .bn .hero { padding: 72px 22px 88px; align-items: flex-end; }
    .bn .hero-overlay { background: linear-gradient(to top, rgba(227,229,232,0.93) 0%, rgba(227,229,232,0.6) 50%, rgba(227,229,232,0.05) 100%); }
  }

  /* countdown: a warm wood band with the crib mobile */
  .bn .countdown-band { position: relative; background: linear-gradient(to bottom, var(--bn-wood-warm) 0%, #EDE6DC 100%); padding-top: 0; overflow: hidden; text-align: center; }
  .bn .countdown-wrap { position: relative; z-index: 1; padding: 18px 24px 78px; text-align: center; }
  .bn .countdown-wrap .eyebrow { color: var(--bn-blue-deep); }
  .bn .countdown-heading { font-family: var(--bn-font-display); font-size: clamp(32px, 4.4vw, 44px); color: var(--bn-ink); margin: 0 0 30px; font-weight: 600; }
  .bn .countdown-row { display: flex; justify-content: center; gap: clamp(12px, 4vw, 34px); }
  .bn .countdown-block { text-align: center; min-width: 76px; padding: 16px 10px 12px; background: rgba(255,255,255,0.8); border-radius: 18px; border: 2px dashed var(--bn-wood-grain); }
  .bn .countdown-value { font-family: var(--bn-font-display); font-size: clamp(30px, 5vw, 46px); color: var(--bn-blue-deep); font-weight: 600; line-height: 1; }
  .bn .countdown-label { font-family: var(--bn-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bn-ink-soft); font-weight: 800; margin-top: 8px; }

  /* details */
  .bn .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; position: relative; }
  @media (max-width: 640px) { .bn .details-grid { grid-template-columns: 1fr; } }
  .bn .details-card { background: #FFFFFF; border-radius: 22px; padding: 28px 26px; box-shadow: 0 10px 28px rgba(171,150,130,0.25); }
  .bn .details-card .label { font-family: var(--bn-font-sans); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--bn-rust); font-weight: 800; margin: 0 0 10px; }
  .bn .details-card .time { font-family: var(--bn-font-display); font-size: 30px; line-height: 1.2; color: var(--bn-ink); font-weight: 600; }
  .bn .details-card p { font-size: 14px; color: var(--bn-ink-soft); margin: 0 0 3px; }
  .bn .map-frame { border-radius: 22px; overflow: hidden; min-height: 220px; border: 5px solid #FFFFFF; box-shadow: 0 10px 28px rgba(171,150,130,0.25); }
  .bn .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .bn .directions-link { text-align: center; margin-top: 20px; }
  .bn .directions-link a { font-family: var(--bn-font-sans); font-size: 14px; color: var(--bn-blue-deep); font-weight: 800; text-decoration: none; }

  /* program */
  .bn .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .bn .schedule-day:last-child { margin-bottom: 0; }
  .bn .schedule-day-title { font-family: var(--bn-font-sans); font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: var(--bn-rust); font-weight: 800; margin: 0 0 18px; }
  .bn .schedule-list { border-top: 2px dashed var(--bn-wood-grain); text-align: left; }
  .bn .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 2px dashed var(--bn-wood-warm); align-items: baseline; }
  .bn .schedule-time { font-family: var(--bn-font-display); font-size: 17px; color: var(--bn-blue-deep); min-width: 110px; flex-shrink: 0; font-weight: 600; }
  .bn .schedule-info .name { font-size: 15px; color: var(--bn-ink); font-weight: 700; margin: 0 0 3px; }
  .bn .schedule-info .loc { font-size: 13px; color: var(--bn-ink-soft); margin: 0; }

  /* rsvp, with the elephant in the bottom-right corner */
  .bn .rsvp-section { position: relative; background: linear-gradient(to bottom, var(--bn-bunny) 0%, var(--bn-lavender) 100%); padding: 88px 28px 110px; text-align: center; overflow: hidden; }
  .bn .bn-elephant { position: absolute; right: max(0px, calc(50% - 640px)); bottom: 0; height: 330px; width: auto; pointer-events: none; z-index: 0; transform-origin: 50% 100%; }
  @media (max-width: 900px) { .bn .bn-elephant { height: 220px; right: -16px; opacity: 0.9; } }
  @media (max-width: 560px) { .bn .bn-elephant { height: 150px; right: -20px; } }
  .bn .rsvp-card { position: relative; z-index: 1; max-width: 460px; margin: 0 auto; background: #FFFFFF; border-radius: 24px; padding: 34px 30px; text-align: left; box-shadow: 0 14px 40px rgba(85,161,220,0.18); }

  .bn .gallery-tile { overflow: hidden; border-radius: 18px; }

  /* registry, on the watercolour baby frame */
  .bn .registry-wrap { position: relative; width: 100%; min-height: 320px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 48px 20px; }
  .bn .registry-overlay { background: rgba(255,255,255,0.9); padding: 44px 56px; text-align: center; border-radius: 26px; box-shadow: 0 10px 30px rgba(171,150,130,0.25); }
  @media (max-width: 640px) { .bn .registry-overlay { padding: 34px 24px; } }
  .bn .registry-title { font-family: var(--bn-font-display); font-size: 32px; color: var(--bn-ink); margin: 0 0 12px; font-weight: 600; }
  .bn .registry-description { font-size: 15px; color: var(--bn-ink-soft); margin: 0 auto 24px; line-height: 1.6; max-width: 390px; }
  .bn .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; background: var(--bn-rust); color: #FFFFFF; text-decoration: none; font-family: var(--bn-font-sans); font-size: 14px; font-weight: 800; }
  .bn .registry-button:hover { background: var(--bn-rust-deep); }

  /* songs */
  .bn .song-section { background: var(--bn-bunny); padding: 88px 28px; text-align: center; }
  .bn .song-section .song-list { border-top: 2px dashed var(--bn-wood-grain); max-width: 540px; margin: 0 auto; }
  .bn .song-section .song-row { border-bottom: 2px dashed var(--bn-wood-warm); padding: 10px 0; }
  .bn .song-section .song-row .title { color: var(--bn-ink); }
  .bn .song-section .song-row .artist { color: var(--bn-ink-soft); }

  /* share */
  .bn .share-band { padding: 84px 24px; background: var(--bn-wood-warm); text-align: center; }
  .bn .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .bn .share-hashtag { font-family: var(--bn-font-display); font-size: clamp(32px, 4.4vw, 44px); color: var(--bn-ink); margin: 0 0 26px; font-weight: 600; overflow-wrap: anywhere; }

  /* footer: a warm wood night sky with a moon and twinkling stars */
  .bn .footer { position: relative; padding: 64px 24px 60px; background: var(--bn-ink); text-align: center; overflow: hidden; }
  .bn .footer p { font-size: 14px; color: rgba(255,255,255,0.88); margin: 0 0 4px; position: relative; }
  .bn .bn-moon { display: block; margin: 0 auto 14px; position: relative; }
  .bn .footer .section-title { position: relative; }
  .bn .footer-signoff { font-family: var(--bn-font-display); font-size: clamp(28px, 5vw, 38px) !important; font-weight: 600; color: var(--bn-beech) !important; margin: 24px 0 0 !important; position: relative; }
  .bn .footer-credit { font-size: 11px; color: rgba(255,255,255,0.6) !important; margin-top: 24px !important; letter-spacing: 0.5px; position: relative; }
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
    ourStoryLabel: 'Oh, baby!',
    howWeGotHere: 'A little one is on the way',
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
    noteForCouplePlaceholder: 'Wishes for baby, words of wisdom… or your guess: boy or girl?',
    buildOurPlaylist: 'Lullabies & party songs',
    withLove: 'With love,',
    theCouple: 'the parents-to-be',
  },
  fr: {
    ourStoryBtn: 'Bébé',
    ourStoryLabel: 'Oh, bébé !',
    howWeGotHere: 'Un petit bout arrive bientôt',
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
    noteForCouplePlaceholder: 'Vœux pour bébé, conseils… ou votre pari : fille ou garçon ?',
    buildOurPlaylist: 'Berceuses et chansons',
    withLove: 'Avec amour,',
    theCouple: 'les futurs parents',
  },
  es: {
    ourStoryBtn: 'Sobre el bebé',
    ourStoryLabel: '¡Oh, bebé!',
    howWeGotHere: 'Un pequeño está en camino',
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
    noteForCouplePlaceholder: 'Deseos para el bebé, consejos… ¿o tu apuesta: niño o niña?',
    buildOurPlaylist: 'Canciones de cuna y fiesta',
    withLove: 'Con cariño,',
    theCouple: 'los futuros papás',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: 'Baby on the way!', fr: 'Bébé arrive !', es: '¡Bebé en camino!' };

export default function BabyShowerNeutral({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['baby-shower-neutral'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--bn-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--bn-ink-soft)' };

  return (
    <div className="bn">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;600;700;800&display=swap" />
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
        <div className="hero-overlay" />
        {HERO_CLOUDS.map((c) => (
          <Cloud key={c.top} className="bn-cloud" width={c.width} fill={c.fill} style={{ top: c.top, animationDuration: c.duration, animationDelay: c.delay }} />
        ))}
        {HERO_STARS.map((s) => (
          <Star key={`${s.top}-${s.left}`} className="bn-star" size={s.size} fill={s.fill} style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
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

      <Footsteps />

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-white section-center">
            <div className="wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bn-float" src={`${IMG}/baby-icons.jpeg`} alt="" style={{ display: 'block', width: 200, margin: '0 auto 10px', mixBlendMode: 'multiply' }} />
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
        <div className="countdown-band">
          <CribMobile />
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
            <div className="wrap-wide" style={{ position: 'relative' }}>
              <Block letter="A" />
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
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bn-blue-deep)', textDecoration: 'none', fontWeight: 800 }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-warm section-center">
            <div className="wrap-wide">
              <Block letter="E" />
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--bn-ink-soft)' }} />
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
          <div className="section section-warm section-center">
            <div className="wrap">
              <Block letter="B" />
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

      {/* RSVP — the elephant sits in the bottom-right corner, bobbing gently */}
      {showRsvp !== false && (
        <Reveal>
          <div id="rsvp" className="rsvp-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bn-elephant bn-float" src={`${IMG}/elephant.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Block letter="C" />
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
            <img className="bn-elephant bn-float" src={`${IMG}/elephant.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Block letter="C" />
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bn-elephant bn-float" src={`${IMG}/elephant.webp`} alt="" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Block letter="C" />
              <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
              <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              <div className="rsvp-card">
                <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <Footsteps />

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <Block letter="D" />
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
            style={{ backgroundImage: `url(${registryImage || `${IMG}/watercolor-frame.jpeg`})` }}
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
          <div className="section section-warm section-center">
            <div className="wrap-wide">
              <Block letter="E" />
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 20 }} textStyle={{ color: 'var(--bn-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-white section-center">
            <div className="wrap">
              <Block letter="F" />
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
              <Block letter="G" />
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

      {/* A row of wooden toys before the footer */}
      <div className="bn-toys" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/wooden-toys.webp`} alt="" />
      </div>

      {/* FOOTER */}
      <footer className="footer">
        {FOOTER_STARS.map((s) => (
          <Star key={`${s.top}-${s.left}`} className="bn-star" size={s.size} fill={LAVENDER} style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
        ))}
        <Moon />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 10, position: 'relative' }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 0 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--bn-lavender)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--bn-lavender)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
