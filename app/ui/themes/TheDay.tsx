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

const IMG = '/images/themes/the-day';

// Exclusive to The Day — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `td-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The white bouquet's palette: ivory petals and linen, sage-to-evergreen
// leaves, buttery stamens and an earthy twig.
const IVORY = '#F6F2E9';
const SILK = '#EFEEEA';
const CREAM = '#E9E3D7';
const LINEN = '#E4DDD7';
const LINEN_SHADE = '#D9D4CE';
const PETAL_SHADOW = '#DDCDB3';
const PALE_GREEN = '#CBDAB1';
const SAGE = '#B5BC93';
const LEAF = '#698B58';
const FOREST = '#395036';
const EVERGREEN = '#20371D';
const STAMEN = '#CEB978';
const TWIG = '#55432D';

// ─── SVG ornaments ───────────────────────────────────────

// A slender sprig between two hairlines — the ornament under each section label.
function Sprig({ light }: { light?: boolean }) {
  const rule = light ? 'rgba(246,242,233,0.55)' : STAMEN;
  const stem = light ? PALE_GREEN : SAGE;
  const leaf = light ? PALE_GREEN : LEAF;
  return (
    <svg className="td-sprig" width="190" height="26" viewBox="0 0 190 26" fill="none" aria-hidden="true">
      <line x1="0" y1="13" x2="64" y2="13" stroke={rule} strokeWidth="0.8" />
      <line x1="126" y1="13" x2="190" y2="13" stroke={rule} strokeWidth="0.8" />
      <path d="M72 13 C 84 13, 96 13, 118 13" stroke={stem} strokeWidth="1" strokeLinecap="round" />
      {[78, 88, 98, 108].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={i % 2 ? 9 : 17} rx="4.6" ry="1.9" fill={leaf} opacity={0.85 - i * 0.08} transform={`rotate(${i % 2 ? -28 : 28} ${x} ${i % 2 ? 9 : 17})`} />
          <ellipse cx={x + 4} cy={i % 2 ? 17 : 9} rx="3.6" ry="1.6" fill={leaf} opacity={0.6 - i * 0.06} transform={`rotate(${i % 2 ? 28 : -28} ${x + 4} ${i % 2 ? 17 : 9})`} />
        </g>
      ))}
      <circle cx="120" cy="13" r="2.4" fill={STAMEN} />
    </svg>
  );
}

// A line-art branch with leaves, curling into a corner of the hero.
function CornerBranch({ className }: { className?: string }) {
  const leaves = [
    { x: 40, y: 150, r: -50 }, { x: 62, y: 120, r: 20 }, { x: 78, y: 96, r: -40 }, { x: 102, y: 74, r: 30 },
    { x: 124, y: 58, r: -30 }, { x: 152, y: 44, r: 40 }, { x: 178, y: 36, r: -10 },
  ];
  return (
    <svg className={className} width="240" height="210" viewBox="0 0 240 210" fill="none" aria-hidden="true">
      <path d="M8 206 C 30 150, 70 90, 130 56 S 210 26, 236 30" stroke={SAGE} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M70 108 C 60 84, 64 64, 80 48" stroke={SAGE} strokeWidth="0.9" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <path
          key={i}
          d={`M${l.x} ${l.y} c 6 -10, 18 -12, 24 -8 c -6 10, -18 12, -24 8 Z`}
          fill={i % 3 === 0 ? PALE_GREEN : 'none'}
          stroke={i % 3 === 0 ? 'none' : LEAF}
          strokeWidth="0.9"
          opacity={0.75}
          transform={`rotate(${l.r} ${l.x} ${l.y})`}
        />
      ))}
      <circle cx="80" cy="46" r="3.2" fill={STAMEN} opacity="0.8" />
      <circle cx="236" cy="30" r="2.6" fill={STAMEN} opacity="0.8" />
    </svg>
  );
}

// A single soft petal, drifting down through the hero.
function Petal({ className, style, fill = IVORY }: { className?: string; style?: React.CSSProperties; fill?: string }) {
  return (
    <svg className={className} style={style} width="18" height="22" viewBox="0 0 18 22" aria-hidden="true">
      <path d="M9 1 C 15 5, 18 12, 13 19 C 11 21, 7 21, 5 19 C 0 12, 3 5, 9 1 Z" fill={fill} stroke={PETAL_SHADOW} strokeWidth="0.6" />
      <path d="M9 4 C 10 9, 10 14, 9 18" stroke={PETAL_SHADOW} strokeWidth="0.5" fill="none" opacity="0.7" />
    </svg>
  );
}

// A laurel wreath framing an ampersand — the footer emblem.
function Wreath() {
  const side = (mirror: boolean) =>
    Array.from({ length: 9 }, (_, i) => {
      const a = ((200 - i * 17) * Math.PI) / 180;
      const x = 60 + 44 * Math.cos(a);
      const y = 58 + 44 * Math.sin(a);
      const rot = 200 - i * 17 + 90;
      return (
        <ellipse key={`${mirror}-${i}`} cx={mirror ? 120 - x : x} cy={y} rx="7" ry="2.8" fill={i % 2 ? SAGE : PALE_GREEN}
          opacity="0.9" transform={`rotate(${mirror ? 180 - rot : rot} ${mirror ? 120 - x : x} ${y})`} />
      );
    });
  return (
    <svg className="td-wreath" width="120" height="112" viewBox="0 0 120 112" fill="none" aria-hidden="true">
      <path d="M60 104 C 30 100, 14 80, 16 50" stroke={SAGE} strokeWidth="0.9" />
      <path d="M60 104 C 90 100, 106 80, 104 50" stroke={SAGE} strokeWidth="0.9" />
      {side(false)}
      {side(true)}
      <text x="60" y="70" textAnchor="middle" fontFamily="'Cormorant', Georgia, serif" fontStyle="italic" fontSize="38" fill={IVORY}>&amp;</text>
      <circle cx="60" cy="104" r="2.4" fill={STAMEN} />
    </svg>
  );
}

const PETALS = [
  { left: '12%', delay: '0s', duration: '19s', fill: IVORY },
  { left: '28%', delay: '-7s', duration: '23s', fill: CREAM },
  { left: '47%', delay: '-13s', duration: '21s', fill: IVORY },
  { left: '66%', delay: '-4s', duration: '25s', fill: CREAM },
  { left: '82%', delay: '-10s', duration: '20s', fill: IVORY },
  { left: '92%', delay: '-16s', duration: '24s', fill: CREAM },
];

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: IVORY, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['the-day']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(246,242,233,0.78) 0%, rgba(246,242,233,0.35) 55%, rgba(246,242,233,0) 80%)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '76%', padding: '20px 26px', border: `1px solid ${STAMEN}`, outline: `1px solid ${STAMEN}`, outlineOffset: 4, background: 'rgba(246,242,233,0.4)' }}>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: 3.5, textTransform: 'uppercase', color: TWIG, margin: '0 0 6px' }}>Together with their families</p>
        <h2 style={{ fontFamily: "'Cormorant', Georgia, serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(24px, 4.4vw, 36px)', color: EVERGREEN, margin: '0 0 8px', lineHeight: 1.05 }}>{heading || 'The Day'}</h2>
        {date && <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: FOREST, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .td {
    --td-ivory: ${IVORY};
    --td-silk: ${SILK};
    --td-cream: ${CREAM};
    --td-linen: ${LINEN};
    --td-linen-shade: ${LINEN_SHADE};
    --td-petal-shadow: ${PETAL_SHADOW};
    --td-pale-green: ${PALE_GREEN};
    --td-sage: ${SAGE};
    --td-leaf: ${LEAF};
    --td-forest: ${FOREST};
    --td-evergreen: ${EVERGREEN};
    --td-stamen: ${STAMEN};
    --td-twig: ${TWIG};
    /* The bouquet photo's own linen backdrop, so its edges disappear */
    --td-bouquet-bg: #D2CEC3;
    --td-font-display: 'Cormorant', 'Cormorant Garamond', Georgia, serif;
    --td-font-sans: 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .td * { box-sizing: border-box; }
  .td { margin: 0; background: var(--td-ivory); color: var(--td-twig); font-family: var(--td-font-sans); font-weight: 300; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .td img { max-width: 100%; }

  /* ─ motion: slow and quiet ─ */
  @keyframes td-fall { 0% { transform: translate(0, -40px) rotate(0deg); opacity: 0; } 10% { opacity: 0.9; } 50% { transform: translate(40px, 50vh) rotate(160deg); } 90% { opacity: 0.8; } 100% { transform: translate(-10px, 105vh) rotate(320deg); opacity: 0; } }
  @keyframes td-sway { 0%, 100% { transform: rotate(-1.2deg); } 50% { transform: rotate(1.2deg); } }
  @keyframes td-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .td .td-petal, .td .td-corner, .td .hero-frame > * { animation: none !important; }
    .td .td-petal { display: none; }
  }
  .td .td-petal { position: absolute; top: 0; z-index: 1; pointer-events: none; animation: td-fall linear infinite; }
  .td .td-corner { position: absolute; z-index: 1; pointer-events: none; opacity: 0.85; animation: td-sway 9s ease-in-out infinite; }
  .td .td-corner-tl { top: 18px; left: 18px; transform-origin: 0 100%; }
  .td .td-corner-br { bottom: 18px; right: 18px; transform-origin: 100% 0; }
  .td .td-corner-br svg { transform: scale(-1, -1); }
  @media (max-width: 720px) { .td .td-corner { width: 140px; opacity: 0.6; } .td .td-corner svg { width: 140px; height: auto; } }
  .td .td-sprig { display: block; margin: 0 auto 26px; max-width: 100%; }

  .td .eyebrow { font-family: var(--td-font-sans); font-size: 12px; font-weight: 400; letter-spacing: 5px; text-transform: uppercase; color: var(--td-leaf); margin: 0 0 14px; }
  .td .eyebrow.on-dark { color: var(--td-pale-green); }
  .td .section-title { font-family: var(--td-font-display); font-size: clamp(38px, 5vw, 60px); font-weight: 400; color: var(--td-evergreen); margin: 0 0 18px; line-height: 1.08; letter-spacing: -0.3px; }
  .td .section-title.on-dark { color: var(--td-ivory); }
  .td .section-title em { font-style: italic; }

  .td .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; }
  .td .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .td .section { position: relative; padding: 112px 28px; background: var(--td-ivory); overflow: hidden; }
  .td .section-silk { background: var(--td-silk); }
  .td .section-cream { background: var(--td-cream); }
  .td .section-center { text-align: center; }
  @media (max-width: 640px) { .td .section { padding: 76px 22px; } }

  .td .btn { font-family: var(--td-font-sans); font-size: 12px; font-weight: 400; letter-spacing: 3.5px; text-transform: uppercase; padding: 17px 36px; border-radius: 0; border: 1px solid var(--td-forest); background: var(--td-forest); color: var(--td-ivory); cursor: pointer; transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .td .btn:hover { background: var(--td-evergreen); border-color: var(--td-evergreen); }
  .td .btn-outline { background: transparent; color: var(--td-forest); }
  .td .btn-outline:hover { background: var(--td-forest); color: var(--td-ivory); }
  .td .btn-outline.on-dark { color: var(--td-ivory); border-color: rgba(246,242,233,0.6); }
  .td .btn-outline.on-dark:hover { background: var(--td-ivory); color: var(--td-evergreen); }

  .td input, .td textarea, .td select { font-family: var(--td-font-sans); font-size: 15px; font-weight: 300; padding: 12px 2px; border: none; border-bottom: 1px solid var(--td-sage); border-radius: 0; outline: none; background: transparent; color: var(--td-evergreen); width: 100%; display: block; transition: border-color 0.2s ease; }
  .td textarea { border: 1px solid var(--td-sage); padding: 12px 14px; }
  .td input:focus, .td textarea:focus, .td select:focus { border-color: var(--td-forest); }
  .td input::placeholder, .td textarea::placeholder { color: rgba(85,67,45,0.5); }
  .td label.field-label { font-family: var(--td-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--td-leaf); display: block; margin-bottom: 2px; font-weight: 400; }
  .td .radio-label, .td .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--td-evergreen); cursor: pointer; }
  .td .radio-label input, .td .check-label input { width: auto; border: none; padding: 0; accent-color: var(--td-forest); }
  .td .check-hint { font-family: var(--td-font-sans); font-size: 12px; color: var(--td-twig); opacity: 0.75; margin: 4px 0 0; }
  .td .attend-options { display: flex; gap: 24px; margin-top: 10px; flex-wrap: wrap; }
  .td .rsvp-error { color: #8A2C1F; font-size: 13px; margin: 0; font-family: var(--td-font-sans); }
  .td .rsvp-success { text-align: center; padding: 20px 0; }
  .td .rsvp-headline { font-family: var(--td-font-display); font-style: italic; font-size: 36px; color: var(--td-evergreen); margin: 0 0 10px; font-weight: 400; }
  .td .rsvp-sub { font-size: 14px; color: var(--td-twig); margin: 0; }
  .td .rsvp-form { display: flex; flex-direction: column; gap: 22px; }

  /* hero: white peonies edge to edge, the names inside an invitation frame */
  .td .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 96px 24px; background: var(--td-silk); overflow: hidden; }
  .td .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .td .hero-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(246,242,233,0.72) 0%, rgba(246,242,233,0.4) 45%, rgba(246,242,233,0.05) 80%); z-index: 0; pointer-events: none; }
  .td .hero-frame { position: relative; z-index: 2; max-width: 760px; padding: 64px 72px 58px; border: 1px solid rgba(206,185,120,0.75); outline: 1px solid rgba(206,185,120,0.75); outline-offset: 7px; background: rgba(246,242,233,0.35); }
  .td .hero-frame::before, .td .hero-frame::after { content: ''; position: absolute; width: 9px; height: 9px; background: var(--td-stamen); transform: rotate(45deg); left: 50%; margin-left: -4.5px; }
  .td .hero-frame::before { top: -13px; }
  .td .hero-frame::after { bottom: -13px; }
  @media (max-width: 640px) { .td .hero-frame { padding: 44px 26px 40px; outline-offset: 5px; } }
  .td .hero-eyebrow { animation: td-in 1.2s ease both; font-family: var(--td-font-sans); font-size: 12px; letter-spacing: 5px; text-transform: uppercase; font-weight: 400; color: var(--td-twig); margin: 0 0 22px; }
  .td .hero-name { animation: td-in 1.2s ease 0.2s both; font-family: var(--td-font-display); font-style: italic; font-size: clamp(54px, 9vw, 116px); font-weight: 300; color: var(--td-evergreen); margin: 0 0 22px; line-height: 0.98; letter-spacing: -1px; }
  .td .hero-date { animation: td-in 1.2s ease 0.4s both; font-family: var(--td-font-sans); font-size: 13px; letter-spacing: 4.5px; text-transform: uppercase; color: var(--td-forest); font-weight: 400; margin: 0 0 34px; }
  .td .hero-actions { animation: td-in 1.2s ease 0.6s both; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }

  /* countdown: the floral arch under an evergreen veil */
  .td .countdown-shell { position: relative; background: var(--td-evergreen); background-size: cover; background-position: center 40%; overflow: hidden; }
  .td .countdown-shell::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(32,55,29,0.82) 0%, rgba(32,55,29,0.72) 50%, rgba(32,55,29,0.86) 100%); }
  .td .countdown-wrap { position: relative; z-index: 1; padding: 120px 24px; text-align: center; }
  .td .countdown-heading { font-family: var(--td-font-display); font-style: italic; font-size: clamp(38px, 5vw, 58px); color: var(--td-ivory); margin: 0 0 44px; font-weight: 300; }
  .td .countdown-row { display: flex; justify-content: center; gap: 0; }
  .td .countdown-block { text-align: center; min-width: 110px; padding: 0 clamp(14px, 3vw, 34px); border-left: 1px solid rgba(206,185,120,0.5); }
  .td .countdown-block:first-child { border-left: none; }
  .td .countdown-value { font-family: var(--td-font-display); font-size: clamp(44px, 6vw, 76px); color: var(--td-ivory); font-weight: 300; line-height: 1; }
  .td .countdown-label { font-family: var(--td-font-sans); font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--td-stamen); margin-top: 12px; }
  @media (max-width: 520px) { .td .countdown-block { min-width: 0; padding: 0 12px; } }

  /* details: framed cards */
  .td .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 14px; }
  @media (max-width: 720px) { .td .details-grid { grid-template-columns: 1fr; } }
  .td .details-card { position: relative; background: var(--td-ivory); padding: 48px 36px; box-shadow: inset 0 0 0 1px rgba(181,188,147,0.7), inset 0 0 0 8px var(--td-ivory), inset 0 0 0 9px rgba(206,185,120,0.45); }
  .td .details-card .label { font-family: var(--td-font-sans); font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--td-leaf); margin: 0 0 16px; }
  .td .details-card .time { font-family: var(--td-font-display); font-size: 40px; line-height: 1.1; color: var(--td-evergreen); font-weight: 400; margin-bottom: 10px; }
  .td .details-card p { font-size: 15px; color: var(--td-twig); margin: 0 0 4px; }
  .td .map-frame { overflow: hidden; min-height: 260px; box-shadow: inset 0 0 0 1px rgba(181,188,147,0.7); padding: 9px; background: var(--td-ivory); }
  .td .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 260px; filter: saturate(0.6); }
  .td .directions-link { text-align: center; margin-top: 28px; }
  .td .directions-link a { font-family: var(--td-font-sans); font-size: 12px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--td-forest); text-decoration: none; border-bottom: 1px solid var(--td-stamen); padding-bottom: 4px; }

  /* program */
  .td .schedule-day { max-width: 600px; margin: 0 auto 54px; }
  .td .schedule-day:last-child { margin-bottom: 0; }
  .td .schedule-day-title { font-family: var(--td-font-display); font-style: italic; font-size: 26px; color: var(--td-forest); margin: 0 0 18px; }
  .td .schedule-list { border-top: 1px solid var(--td-stamen); text-align: left; }
  .td .schedule-row { display: flex; gap: 28px; padding: 20px 0; border-bottom: 1px solid rgba(181,188,147,0.6); align-items: baseline; }
  .td .schedule-time { font-family: var(--td-font-sans); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--td-leaf); min-width: 120px; flex-shrink: 0; }
  .td .schedule-info .name { font-family: var(--td-font-display); font-size: 24px; color: var(--td-evergreen); margin: 0 0 2px; }
  .td .schedule-info .loc { font-size: 14px; color: var(--td-twig); margin: 0; }

  /* rsvp: the bouquet on its own linen, the reply card beside it */
  .td .rsvp-section { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; min-height: 780px; background: var(--td-bouquet-bg); padding: 96px 6vw; overflow: hidden; }
  /* The photo is brighter in the middle than at its edges, so its edges fade into the matching linen */
  .td .td-bouquet { position: absolute; left: 0; top: 0; bottom: 0; width: 58%; height: 100%; object-fit: cover; object-position: center 36%;
    -webkit-mask-image: linear-gradient(to right, #000 0%, #000 72%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
    -webkit-mask-composite: source-in; mask-image: linear-gradient(to right, #000 0%, #000 72%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%); mask-composite: intersect; }
  .td .rsvp-panel { grid-column: 2; text-align: center; position: relative; z-index: 1; }
  .td .rsvp-card { max-width: 480px; margin: 0 auto; background: rgba(246,242,233,0.94); padding: 52px 44px; text-align: left; box-shadow: inset 0 0 0 1px rgba(181,188,147,0.7), inset 0 0 0 8px rgba(246,242,233,0.94), inset 0 0 0 9px rgba(206,185,120,0.45), 0 30px 60px -30px rgba(32,55,29,0.35); }
  @media (max-width: 900px) {
    .td .rsvp-section { display: block; min-height: 0; padding: 0 20px 76px; }
    .td .td-bouquet { position: relative; display: block; width: calc(100% + 40px); max-width: none; height: auto; max-height: 620px; margin: 0 -20px -110px;
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%); }
    .td .rsvp-card { padding: 40px 26px; }
  }

  .td .gallery-tile { overflow: hidden; border-radius: 0; }

  /* registry, on the fabric roses */
  .td .registry-wrap { position: relative; width: 100%; min-height: 380px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 72px 20px; }
  .td .registry-overlay { background: rgba(246,242,233,0.92); padding: 54px 64px; text-align: center; max-width: 560px; box-shadow: inset 0 0 0 1px rgba(181,188,147,0.7), inset 0 0 0 8px rgba(246,242,233,0.92), inset 0 0 0 9px rgba(206,185,120,0.45); }
  @media (max-width: 640px) { .td .registry-overlay { padding: 40px 26px; } }
  .td .registry-title { font-family: var(--td-font-display); font-style: italic; font-size: 40px; color: var(--td-evergreen); margin: 0 0 14px; font-weight: 400; }
  .td .registry-description { font-size: 15px; color: var(--td-twig); margin: 0 auto 28px; line-height: 1.8; max-width: 400px; }
  .td .registry-button { display: inline-block; padding: 16px 34px; background: var(--td-forest); color: var(--td-ivory); text-decoration: none; font-family: var(--td-font-sans); font-size: 12px; letter-spacing: 3.5px; text-transform: uppercase; }
  .td .registry-button:hover { background: var(--td-evergreen); }

  /* songs */
  .td .song-section { background: var(--td-silk); padding: 112px 28px; text-align: center; }
  .td .song-section .song-list { border-top: 1px solid var(--td-stamen); max-width: 540px; margin: 0 auto; }
  .td .song-section .song-row { border-bottom: 1px solid rgba(181,188,147,0.6); padding: 12px 0; }
  .td .song-section .song-row .title { color: var(--td-evergreen); font-family: var(--td-font-display); font-size: 20px; }
  .td .song-section .song-row .artist { color: var(--td-twig); }

  /* share */
  .td .share-band { padding: 100px 24px; background: var(--td-cream); text-align: center; }
  .td .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .td .share-hashtag { font-family: var(--td-font-display); font-style: italic; font-size: clamp(36px, 5vw, 56px); color: var(--td-evergreen); margin: 0 0 32px; font-weight: 400; overflow-wrap: anywhere; }

  /* footer: evergreen, with the laurel wreath */
  .td .footer { padding: 100px 24px 72px; background: var(--td-evergreen); text-align: center; }
  .td .footer p { font-size: 15px; color: rgba(246,242,233,0.85); margin: 0 0 4px; }
  .td .td-wreath { display: block; margin: 0 auto 26px; }
  .td .footer-signoff { font-family: var(--td-font-display); font-style: italic; font-size: clamp(34px, 5vw, 50px) !important; font-weight: 300; color: var(--td-ivory) !important; margin: 34px 0 0 !important; line-height: 1.15; }
  .td .footer-credit { font-size: 11px; letter-spacing: 1px; color: rgba(246,242,233,0.5) !important; margin-top: 30px !important; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const HERO_EYEBROW_DEFAULT = { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' };

export default function TheDay({
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
  const t: Translations = getTranslations(language);
  const isPreview = !!editSlots;
  // Forms are shown but can't be submitted in the editor or a showcase preview.
  const formsDisabled = isPreview || !!demo;
  const sectionTextCtx = { values: sectionText, pageId: sectionTextPageId };
  const heroDateText = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';
  const heroSrc = bannerImage || HERO_DEFAULTS['the-day'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--td-font-sans)', fontSize: 17, fontWeight: 300, lineHeight: 2, color: 'var(--td-twig)' };

  return (
    <div className="td">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" />
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
        <div className="td-corner td-corner-tl"><CornerBranch /></div>
        <div className="td-corner td-corner-br"><CornerBranch /></div>
        {PETALS.map((p) => (
          <Petal key={p.left} className="td-petal" fill={p.fill} style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }} />
        ))}
        <div className="hero-frame">
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

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <Sprig />
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
        <div className="countdown-shell" style={{ backgroundImage: `url(${IMG}/arch.jpeg)` }}>
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
          <div className="section section-silk section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <Sprig />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 400, color: 'var(--td-evergreen)' }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p style={{ marginTop: 12 }}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--td-forest)', textDecoration: 'none', borderBottom: '1px solid var(--td-stamen)' }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-silk section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <Sprig />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--td-twig)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-center">
            <div className="wrap">
              <Sprig />
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
              <Sprig />
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

      {/* RSVP — over the white bouquet */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="td-bouquet" src={`${IMG}/bouquet.jpeg`} alt="" />
          <Reveal className="rsvp-panel">
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <Sprig />
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
          <img className="td-bouquet" src={`${IMG}/bouquet.jpeg`} alt="" />
          <Reveal className="rsvp-panel">
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
                <Sprig />
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
          <img className="td-bouquet" src={`${IMG}/bouquet.jpeg`} alt="" />
          <Reveal className="rsvp-panel">
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <Sprig />
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
            <Sprig />
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
          <div className="section section-silk section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <Sprig />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 0, border: 'none', boxShadow: 'inset 0 0 0 1px rgba(181,188,147,0.7)' }} textStyle={{ color: 'var(--td-twig)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <Sprig />
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
              <Sprig />
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
        <Wreath />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 12 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--td-pale-green)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--td-pale-green)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
