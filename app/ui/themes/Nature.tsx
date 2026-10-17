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

const IMG = '/images/themes/nature';

// Exclusive to Nature — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `nt-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The woodland palette: walnut and oak bark, burlap, candlelight and coral
// blooms, deep leaf green, daisy gold and a cool linen.
const WALNUT = '#2A231E';
const OAK = '#4F3F32';
const BURLAP = '#9D8C77';
const CANDLELIGHT = '#C4936E';
const CORAL = '#C8857A';
const LEAF = '#2D4130';
const DAISY = '#BFA55B';
const LINEN = '#DADEDF';
// Lighter steps of linen for the page and its cards.
const LINEN_SOFT = '#ECEEEE';
const LINEN_PALE = '#F7F7F6';

// ─── SVG ornaments ───────────────────────────────────────

const LEAF_PATH = 'M12 1 C 20 7, 22 17, 12 29 C 2 17, 4 7, 12 1 Z';

function FallingLeaf({ fill, size, className, style }: { fill: string; size: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={style} aria-hidden="true">
      <svg width={size} height={size * 1.25} viewBox="0 0 24 30">
        <path d={LEAF_PATH} fill={fill} />
        <path d="M12 3 L12 28" stroke="rgba(42,35,30,0.35)" strokeWidth="0.9" />
      </svg>
    </span>
  );
}

// A small branch with paired leaves and a daisy-gold bud — swaying gently
// between two hairlines, the section ornament.
function SprigRule({ light }: { light?: boolean }) {
  const line = light ? 'rgba(218,222,223,0.5)' : BURLAP;
  const leaf = light ? LINEN : LEAF;
  return (
    <div className="nt-rule" aria-hidden="true">
      <svg className="nt-rule-lines" width="220" height="24" viewBox="0 0 220 24" fill="none">
        <line x1="0" y1="12" x2="80" y2="12" stroke={line} strokeWidth="0.8" />
        <line x1="140" y1="12" x2="220" y2="12" stroke={line} strokeWidth="0.8" />
      </svg>
      <svg className="nt-sway" width="56" height="24" viewBox="0 0 56 24" fill="none">
        <path d="M4 14 C 18 10, 38 10, 52 14" stroke={light ? BURLAP : OAK} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M14 12 C 12 5, 16 2, 20 3 C 21 7, 18 11, 14 12 Z" fill={leaf} />
        <path d="M14 13 C 12 19, 16 22, 20 21 C 21 17, 18 14, 14 13 Z" fill={leaf} opacity="0.75" />
        <path d="M26 11 C 25 4, 29 1, 33 2 C 34 6, 31 10, 26 11 Z" fill={leaf} />
        <path d="M27 12 C 26 18, 30 21, 34 20 C 35 16, 32 13, 27 12 Z" fill={leaf} opacity="0.75" />
        <path d="M38 12 C 38 6, 42 4, 46 5 C 46 9, 43 12, 38 12 Z" fill={leaf} opacity="0.9" />
        <circle cx="52" cy="14" r="2.4" fill={DAISY} />
      </svg>
    </div>
  );
}

// Two leafy branches curving into an open wreath — the footer emblem.
function Wreath() {
  const leaves = [
    { x: 30, y: 74, r: -60 }, { x: 22, y: 60, r: -40 }, { x: 18, y: 45, r: -20 }, { x: 20, y: 30, r: 5 }, { x: 28, y: 17, r: 30 },
  ];
  return (
    <svg className="nt-wreath" width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      <path d="M52 88 C 24 78, 12 52, 22 28 C 26 18, 32 12, 38 8" stroke={BURLAP} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M68 88 C 96 78, 108 52, 98 28 C 94 18, 88 12, 82 8" stroke={BURLAP} strokeWidth="1.3" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <g key={i}>
          <path d={LEAF_PATH} fill={i % 2 ? CANDLELIGHT : LINEN} opacity="0.9" transform={`translate(${l.x - 6} ${l.y - 7}) rotate(${l.r} 6 7) scale(0.5)`} />
          <path d={LEAF_PATH} fill={i % 2 ? LINEN : CANDLELIGHT} opacity="0.9" transform={`translate(${120 - l.x - 6} ${l.y - 7}) rotate(${-l.r} 6 7) scale(0.5)`} />
        </g>
      ))}
      <circle cx="60" cy="88" r="3.2" fill={CORAL} />
      <circle cx="53" cy="86" r="2.2" fill={DAISY} />
      <circle cx="67" cy="86" r="2.2" fill={DAISY} />
    </svg>
  );
}

// Positions are fixed (not random) so the server and client render alike.
const HERO_LEAVES = [
  { left: '6%', delay: '0s', dur: '17s', size: 22, fill: CANDLELIGHT },
  { left: '18%', delay: '-6s', dur: '21s', size: 17, fill: DAISY },
  { left: '31%', delay: '-11s', dur: '19s', size: 20, fill: CORAL },
  { left: '47%', delay: '-3s', dur: '23s', size: 15, fill: BURLAP },
  { left: '62%', delay: '-14s', dur: '18s', size: 21, fill: CANDLELIGHT },
  { left: '74%', delay: '-8s', dur: '22s', size: 17, fill: CORAL },
  { left: '86%', delay: '-1s', dur: '20s', size: 19, fill: DAISY },
  { left: '94%', delay: '-16s', dur: '24s', size: 14, fill: BURLAP },
];
const FIREFLIES = [
  { left: '7%', top: '22%', delay: '0s' }, { left: '15%', top: '68%', delay: '-2.4s' }, { left: '24%', top: '40%', delay: '-4.1s' },
  { left: '33%', top: '80%', delay: '-1.2s' }, { left: '42%', top: '18%', delay: '-5.3s' }, { left: '55%', top: '72%', delay: '-3.3s' },
  { left: '63%', top: '30%', delay: '-0.7s' }, { left: '71%', top: '58%', delay: '-4.8s' }, { left: '80%', top: '16%', delay: '-2s' },
  { left: '88%', top: '76%', delay: '-3.8s' }, { left: '93%', top: '44%', delay: '-1.6s' }, { left: '50%', top: '50%', delay: '-6s' },
];
const FOOTER_LEAVES = [
  { left: '10%', delay: '-2s', dur: '20s', size: 12, fill: CANDLELIGHT },
  { left: '28%', delay: '-9s', dur: '24s', size: 10, fill: DAISY },
  { left: '72%', delay: '-5s', dur: '22s', size: 13, fill: CORAL },
  { left: '90%', delay: '-13s', dur: '19s', size: 10, fill: BURLAP },
];

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: WALNUT, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...previewImage(bannerImage || HERO_DEFAULTS.nature)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(42,35,30,0.82) 0%, rgba(42,35,30,0.45) 45%, rgba(42,35,30,0) 75%)' }} />
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own script face */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: '58%' }}>
        <p style={{ fontFamily: "'Mulish', sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: DAISY, fontWeight: 700, margin: '0 0 6px' }}>Together with their families</p>
        <h2 style={{ fontFamily: "'Pinyon Script', 'Brush Script MT', cursive", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 42px)', color: LINEN_PALE, margin: '0 0 8px', lineHeight: 1.05 }}>{heading || 'Nature'}</h2>
        {date && <p style={{ fontFamily: "'Mulish', sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: LINEN, fontWeight: 600, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .nt {
    --nt-walnut: ${WALNUT};
    --nt-oak: ${OAK};
    --nt-burlap: ${BURLAP};
    --nt-candle: ${CANDLELIGHT};
    --nt-coral: ${CORAL};
    --nt-leaf: ${LEAF};
    --nt-daisy: ${DAISY};
    --nt-linen: ${LINEN};
    --nt-linen-soft: ${LINEN_SOFT};
    --nt-linen-pale: ${LINEN_PALE};
    --nt-font-script: 'Pinyon Script', 'Great Vibes', cursive;
    --nt-font-display: 'Marcellus', Georgia, serif;
    --nt-font-sans: 'Mulish', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .nt * { box-sizing: border-box; }
  .nt { margin: 0; background: var(--nt-linen-soft); color: var(--nt-walnut); font-family: var(--nt-font-sans); font-weight: 400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .nt img { max-width: 100%; }

  /* ─ motion: leaves drifting down, fireflies, a slow push-in on the photos ─ */
  @keyframes nt-fall {
    0% { transform: translate3d(0, -40px, 0) rotate(0deg); opacity: 0; }
    10% { opacity: 0.95; }
    25% { transform: translate3d(28px, 22vh, 0) rotate(70deg); }
    50% { transform: translate3d(-18px, 48vh, 0) rotate(160deg); }
    75% { transform: translate3d(24px, 74vh, 0) rotate(250deg); }
    90% { opacity: 0.85; }
    100% { transform: translate3d(-8px, 104vh, 0) rotate(330deg); opacity: 0; }
  }
  @keyframes nt-firefly {
    0%, 100% { transform: translate(0, 0); opacity: 0.15; }
    25% { transform: translate(14px, -18px); opacity: 1; }
    50% { transform: translate(-10px, -32px); opacity: 0.35; }
    75% { transform: translate(-18px, -8px); opacity: 0.95; }
  }
  @keyframes nt-sway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
  @keyframes nt-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
  @keyframes nt-push { from { transform: scale(1.1); } to { transform: scale(1); } }
  @keyframes nt-drift { 0%, 100% { transform: scale(1.06) translate(0, 0); } 50% { transform: scale(1.12) translate(-1.5%, -1%); } }
  @keyframes nt-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes nt-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: reduce) {
    .nt .nt-leaf, .nt .nt-firefly, .nt .nt-sway, .nt .nt-wreath, .nt .hero-bg, .nt .hero-content > *, .nt .nt-photo-bg, .nt .hero-line { animation: none !important; }
    .nt .nt-leaf, .nt .nt-firefly { display: none; }
  }
  .nt .nt-leaf { position: absolute; top: 0; z-index: 1; pointer-events: none; animation: nt-fall 20s linear infinite; will-change: transform; filter: drop-shadow(0 2px 3px rgba(42,35,30,0.25)); }
  .nt .nt-firefly { position: absolute; z-index: 1; width: 7px; height: 7px; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, #FFF3C9 0%, ${DAISY} 45%, rgba(191,165,91,0) 72%); box-shadow: 0 0 12px 4px rgba(191,165,91,0.45);
    animation: nt-firefly 7s ease-in-out infinite; }
  .nt .nt-rule { position: relative; width: 220px; height: 24px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
  .nt .nt-rule-lines { position: absolute; inset: 0; }
  .nt .nt-sway { position: relative; transform-origin: 50% 60%; animation: nt-sway 5s ease-in-out infinite; }
  .nt .nt-wreath { display: block; margin: 0 auto 20px; animation: nt-breathe 6s ease-in-out infinite; }

  .nt .eyebrow { font-family: var(--nt-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--nt-candle); margin: 0 0 14px; }
  .nt .eyebrow.on-dark { color: var(--nt-daisy); }
  .nt .section-title { font-family: var(--nt-font-display); font-size: clamp(32px, 4.4vw, 50px); font-weight: 400; color: var(--nt-walnut); margin: 0 0 18px; line-height: 1.15; letter-spacing: 0.5px; }
  .nt .section-title.on-dark { color: var(--nt-linen-pale); }

  .nt .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; }
  .nt .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .nt .section { position: relative; padding: 108px 28px; background: var(--nt-linen-soft); overflow: hidden; }
  .nt .section-linen { background: var(--nt-linen); }
  .nt .section-pale { background: var(--nt-linen-pale); }
  .nt .section-center { text-align: center; }
  @media (max-width: 640px) { .nt .section { padding: 74px 22px; } }

  .nt .btn { font-family: var(--nt-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 16px 34px; border-radius: 4px; border: 1px solid var(--nt-leaf); background: var(--nt-leaf); color: var(--nt-linen-pale); cursor: pointer; transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease; text-decoration: none; display: inline-block; line-height: 1; height: auto; }
  @supports (text-box: trim-both cap alphabetic) { .nt .btn { text-box: trim-both cap alphabetic; padding-top: calc(16px + (1em - 1cap) / 2); padding-bottom: calc(16px + (1em - 1cap) / 2); } }
  .nt .btn:hover { background: var(--nt-oak); border-color: var(--nt-oak); transform: translateY(-2px); }
  .nt .btn-outline { background: transparent; color: var(--nt-leaf); }
  .nt .btn-outline:hover { background: var(--nt-leaf); border-color: var(--nt-leaf); color: var(--nt-linen-pale); }
  .nt .btn-outline.on-dark { color: var(--nt-linen-pale); border-color: rgba(218,222,223,0.7); }
  .nt .btn-outline.on-dark:hover { background: var(--nt-linen-pale); color: var(--nt-walnut); }

  .nt input, .nt textarea, .nt select { font-family: var(--nt-font-sans); font-size: 15px; padding: 12px 16px; border: 1px solid ${BURLAP}88; border-radius: 4px; outline: none; background: var(--nt-linen-pale); color: var(--nt-walnut); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .nt input:focus, .nt textarea:focus, .nt select:focus { border-color: var(--nt-leaf); box-shadow: 0 0 0 3px rgba(45,65,48,0.12); }
  .nt input::placeholder, .nt textarea::placeholder { color: rgba(42,35,30,0.45); }
  .nt label.field-label { font-family: var(--nt-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--nt-oak); display: block; margin-bottom: 6px; font-weight: 700; }
  .nt .radio-label, .nt .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--nt-walnut); cursor: pointer; }
  .nt .radio-label input, .nt .check-label input { width: auto; border: none; padding: 0; accent-color: var(--nt-leaf); box-shadow: none; }
  .nt .check-hint { font-family: var(--nt-font-sans); font-size: 12px; color: var(--nt-oak); margin: 4px 0 0; }
  .nt .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .nt .rsvp-error { color: #9C4A3F; font-size: 13px; margin: 0; font-family: var(--nt-font-sans); }
  .nt .rsvp-success { text-align: center; padding: 20px 0; }
  .nt .rsvp-headline { font-family: var(--nt-font-script); font-size: 48px; color: var(--nt-leaf); margin: 0 0 8px; font-weight: 400; }
  .nt .rsvp-sub { font-size: 14px; color: var(--nt-walnut); margin: 0; }
  .nt .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the couple stands in the middle of the forest, so the names sit to
     their left under a walnut shade */
  .nt .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: flex-start; text-align: left; padding: 96px 7vw; background: var(--nt-walnut); overflow: hidden; }
  .nt .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 60% center; z-index: 0; animation: nt-push 14s cubic-bezier(0.2, 0.6, 0.3, 1) both; transform-origin: 55% 60%; }
  .nt .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(42,35,30,0.82) 0%, rgba(42,35,30,0.5) 32%, rgba(42,35,30,0) 58%), linear-gradient(to top, rgba(42,35,30,0.45) 0%, rgba(42,35,30,0) 30%); z-index: 0; pointer-events: none; }
  .nt .hero-content { position: relative; z-index: 2; max-width: 520px; }
  .nt .hero-eyebrow { animation: nt-in 1.3s ease 0.2s both; font-family: var(--nt-font-sans); font-size: 12px; letter-spacing: 5px; text-transform: uppercase; font-weight: 700; color: var(--nt-daisy); margin: 0 0 16px; }
  .nt .hero-name { animation: nt-in 1.3s ease 0.45s both; font-family: var(--nt-font-script); font-size: clamp(64px, 8.6vw, 124px); font-weight: 400; color: var(--nt-linen-pale); margin: 0 0 14px; line-height: 1.05; text-shadow: 0 2px 24px rgba(42,35,30,0.55); }
  .nt .hero-line { display: block; width: 120px; height: 1px; margin: 0 0 18px; background: linear-gradient(to right, var(--nt-daisy), rgba(191,165,91,0)); transform-origin: left center; animation: nt-line 1.4s ease 0.9s both; }
  .nt .hero-date { animation: nt-in 1.3s ease 0.7s both; font-family: var(--nt-font-sans); font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: var(--nt-linen); font-weight: 600; margin: 0 0 34px; }
  .nt .hero-actions { animation: nt-in 1.3s ease 0.95s both; display: flex; gap: 12px; flex-wrap: wrap; }
  .nt .hero .btn { background: var(--nt-candle); border-color: var(--nt-candle); color: var(--nt-walnut); }
  .nt .hero .btn:hover { background: var(--nt-linen-pale); border-color: var(--nt-linen-pale); }
  .nt .hero .btn-outline { background: rgba(42,35,30,0.25); border-color: rgba(218,222,223,0.75); color: var(--nt-linen-pale); }
  .nt .hero .btn-outline:hover { background: var(--nt-linen-pale); color: var(--nt-walnut); }
  @media (max-width: 760px) {
    /* the couple stands in the lower half, so the names go above them */
    .nt .hero { padding: 64px 22px 72px; align-items: flex-start; }
    .nt .hero-bg { object-position: 50% bottom; }
    .nt .hero-overlay { background: linear-gradient(to bottom, rgba(42,35,30,0.9) 0%, rgba(42,35,30,0.62) 40%, rgba(42,35,30,0) 62%); }
    .nt .hero-name { font-size: clamp(52px, 15vw, 72px); }
    .nt .hero-date { margin-bottom: 26px; }
  }

  /* countdown: candles among the trees, with fireflies */
  .nt .countdown-shell { position: relative; background: var(--nt-walnut); overflow: hidden; }
  .nt .nt-photo-bg { position: absolute; inset: -4%; background-size: cover; background-position: center; animation: nt-drift 26s ease-in-out infinite; }
  .nt .countdown-shell::before { content: ''; position: absolute; inset: 0; z-index: 0; background: linear-gradient(to bottom, rgba(42,35,30,0.82) 0%, rgba(42,35,30,0.66) 50%, rgba(42,35,30,0.88) 100%); }
  .nt .countdown-wrap { position: relative; z-index: 2; padding: 120px 24px; text-align: center; }
  .nt .countdown-heading { font-family: var(--nt-font-script); font-size: clamp(52px, 7vw, 86px); color: var(--nt-linen-pale); margin: 0 0 40px; font-weight: 400; line-height: 1.05; }
  .nt .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 3vw, 28px); }
  /* each number on a wood-slice: rings within rings */
  .nt .countdown-block { display: flex; flex-direction: column; align-items: center; justify-content: center; width: clamp(74px, 14vw, 124px); aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(191,165,91,0.75); box-shadow: inset 0 0 0 6px rgba(42,35,30,0.35), inset 0 0 0 7px rgba(196,147,110,0.45); background: rgba(42,35,30,0.35); }
  .nt .countdown-value { font-family: var(--nt-font-display); font-size: clamp(28px, 4.6vw, 50px); color: var(--nt-linen-pale); font-weight: 400; line-height: 1; }
  .nt .countdown-label { font-family: var(--nt-font-sans); font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--nt-daisy); margin-top: 8px; font-weight: 700; }
  @media (max-width: 480px) {
    .nt .countdown-wrap { padding: 96px 16px; }
    .nt .countdown-heading { font-size: 46px; margin-bottom: 30px; }
    .nt .countdown-row { gap: 8px; }
    .nt .countdown-block { width: 76px; }
    .nt .countdown-value { font-size: 24px; }
    .nt .countdown-label { font-size: 8px; letter-spacing: 1.5px; margin-top: 6px; }
  }

  /* details: cards with a leaf-green top edge */
  .nt .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 14px; }
  @media (max-width: 720px) { .nt .details-grid { grid-template-columns: 1fr; } }
  .nt .details-card { position: relative; background: var(--nt-linen-pale); padding: 48px 34px 40px; border-radius: 6px; border-top: 4px solid var(--nt-leaf); box-shadow: 0 24px 50px -34px rgba(42,35,30,0.55); transition: transform 0.4s ease, box-shadow 0.4s ease; }
  .nt .details-card:hover { transform: translateY(-4px); box-shadow: 0 30px 60px -34px rgba(42,35,30,0.6); }
  .nt .details-card .label { font-family: var(--nt-font-sans); font-size: 11px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--nt-candle); margin: 0 0 14px; font-weight: 700; }
  .nt .details-card .time { font-family: var(--nt-font-display); font-size: 34px; line-height: 1.15; color: var(--nt-walnut); font-weight: 400; margin-bottom: 10px; }
  .nt .details-card p { font-size: 15px; color: var(--nt-oak); margin: 0 0 4px; }
  .nt .map-frame { overflow: hidden; min-height: 300px; border-radius: 6px; border: 6px solid var(--nt-linen-pale); box-shadow: 0 24px 50px -34px rgba(42,35,30,0.55); }
  .nt .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 300px; }
  .nt .directions-link { text-align: center; margin-top: 28px; }
  .nt .directions-link a { font-family: var(--nt-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--nt-leaf); text-decoration: none; border-bottom: 1px solid var(--nt-candle); padding-bottom: 4px; }

  /* program: a vine down the left with a leaf at each stop */
  .nt .schedule-day { max-width: 600px; margin: 0 auto 50px; }
  .nt .schedule-day:last-child { margin-bottom: 0; }
  .nt .schedule-day-title { font-family: var(--nt-font-script); font-size: 40px; color: var(--nt-leaf); margin: 0 0 18px; }
  .nt .schedule-list { position: relative; text-align: left; padding-left: 34px; }
  .nt .schedule-list::before { content: ''; position: absolute; left: 9px; top: 8px; bottom: 8px; width: 1px; background: linear-gradient(to bottom, var(--nt-burlap), var(--nt-leaf), var(--nt-burlap)); }
  .nt .schedule-row { position: relative; display: flex; gap: 26px; padding: 16px 0; border-bottom: 1px solid ${BURLAP}55; align-items: baseline; }
  .nt .schedule-row:last-child { border-bottom: none; }
  .nt .schedule-row::before { content: ''; position: absolute; left: -31px; top: 21px; width: 12px; height: 12px; border-radius: 0 60% 0 60%; background: var(--nt-leaf); transform: rotate(-12deg); box-shadow: 0 0 0 4px var(--nt-linen-soft); }
  .nt .schedule-row:nth-child(even)::before { background: var(--nt-candle); }
  .nt .schedule-time { font-family: var(--nt-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--nt-candle); min-width: 110px; flex-shrink: 0; }
  .nt .schedule-info .name { font-family: var(--nt-font-display); font-size: 22px; color: var(--nt-walnut); margin: 0 0 2px; }
  .nt .schedule-info .loc { font-size: 14px; color: var(--nt-oak); margin: 0; }
  @media (max-width: 520px) { .nt .schedule-row { flex-direction: column; gap: 4px; } }

  /* rsvp: the wedding flat lay on dark wood, the card resting on the right */
  .nt .rsvp-section { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; min-height: 860px; background: var(--nt-walnut); padding: 96px 6vw; overflow: hidden; }
  .nt .rsvp-section .nt-photo-bg { animation-duration: 32s; }
  .nt .rsvp-section::before { content: ''; position: absolute; inset: 0; z-index: 0; background: linear-gradient(to right, rgba(42,35,30,0) 0%, rgba(42,35,30,0.15) 45%, rgba(42,35,30,0.55) 100%); }
  .nt .rsvp-panel { grid-column: 2; position: relative; z-index: 1; }
  .nt .rsvp-card { max-width: 480px; margin: 0 auto; background: rgba(247,247,246,0.95); padding: 54px 42px 46px; text-align: left; border-radius: 6px; border-top: 4px solid var(--nt-leaf); box-shadow: 0 40px 80px -30px rgba(0,0,0,0.6); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  @media (max-width: 900px) {
    .nt .rsvp-section { display: block; min-height: 0; padding: 0 20px 76px; }
    .nt .rsvp-section .nt-photo-bg { position: relative; inset: auto; display: block; height: 62vw; margin: 0 -20px -70px; animation: none; -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 65%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 65%, transparent 100%); }
    .nt .rsvp-section::before { display: none; }
    .nt .rsvp-card { padding: 46px 24px 36px; }
  }

  /* registry, under the hanging bottles */
  .nt .registry-wrap { position: relative; width: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; padding: 80px 20px; overflow: hidden; background: var(--nt-walnut); }
  .nt .registry-wrap .nt-photo-bg { animation-duration: 30s; }
  .nt .registry-overlay { position: relative; z-index: 1; background: rgba(247,247,246,0.93); padding: 54px 60px 48px; text-align: center; max-width: 540px; border-radius: 6px; border-top: 4px solid var(--nt-candle); box-shadow: 0 30px 60px -30px rgba(0,0,0,0.55); }
  @media (max-width: 640px) { .nt .registry-overlay { padding: 46px 26px 36px; } }
  .nt .registry-title { font-family: var(--nt-font-script); font-size: 58px; color: var(--nt-leaf); margin: 0 0 8px; font-weight: 400; line-height: 1.05; }
  .nt .registry-description { font-size: 15px; color: var(--nt-oak); margin: 0 auto 26px; line-height: 1.8; max-width: 400px; }
  .nt .registry-button { display: inline-block; padding: 16px 34px; border-radius: 4px; background: var(--nt-leaf); color: var(--nt-linen-pale); text-decoration: none; font-family: var(--nt-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; transition: background 0.3s ease; }
  .nt .registry-button:hover { background: var(--nt-oak); }

  /* songs */
  .nt .song-section { background: var(--nt-linen); padding: 108px 28px; text-align: center; }
  .nt .song-section .song-list { border-top: 1px solid var(--nt-burlap); max-width: 540px; margin: 0 auto; }
  .nt .song-section .song-row { border-bottom: 1px solid ${BURLAP}66; padding: 12px 0; }
  .nt .song-section .song-row .title { color: var(--nt-walnut); font-family: var(--nt-font-display); }
  .nt .song-section .song-row .artist { color: var(--nt-oak); }

  /* share: deep leaf green */
  .nt .share-band { padding: 100px 24px; background: var(--nt-leaf); text-align: center; }
  .nt .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .nt .share-hashtag { font-family: var(--nt-font-script); font-size: clamp(48px, 7vw, 74px); color: var(--nt-linen-pale); margin: 0 0 28px; font-weight: 400; line-height: 1.05; overflow-wrap: anywhere; }

  /* footer: walnut, with the wreath and a few leaves still falling */
  .nt .footer { position: relative; padding: 96px 24px 70px; background: var(--nt-walnut); text-align: center; overflow: hidden; }
  .nt .footer > *:not(.nt-leaf) { position: relative; z-index: 2; }
  .nt .footer p { font-size: 15px; color: rgba(218,222,223,0.85); margin: 0 0 4px; }
  .nt .footer-signoff { font-family: var(--nt-font-script); font-size: clamp(46px, 7vw, 68px) !important; font-weight: 400; color: var(--nt-linen-pale) !important; margin: 30px 0 0 !important; line-height: 1.1; }
  .nt .footer-credit { font-size: 11px; letter-spacing: 1px; color: rgba(218,222,223,0.5) !important; margin-top: 30px !important; }
  /* Potluck and Secret Santa: a plain colour each, so only the RSVP has
     the special background. */
  .nt #potluck.rsvp-section, .nt #gift-exchange.rsvp-section { background: none; background-image: none !important; display: block; min-height: 0; padding: 90px 20px; }
  .nt #potluck.rsvp-section { background-color: #3E5A3A; }
  .nt #gift-exchange.rsvp-section { background-color: #7A5A3A; }
  .nt #potluck.rsvp-section::before, .nt #gift-exchange.rsvp-section::before { display: none; }
  .nt #potluck .rsvp-panel, .nt #gift-exchange .rsvp-panel { max-width: 520px; margin: 0 auto; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const HERO_EYEBROW_DEFAULT = { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' };

// The RSVP, Potluck and Gift Exchange sections share this layout; only the
// RSVP has the flat-lay photo behind it (photo={false}: a plain colour).
function FlatLaySection({ id, photo = true, children }: { id: string; photo?: boolean; children: React.ReactNode }) {
  return (
    <div id={id} className="rsvp-section">
      {photo && <div className="nt-photo-bg" style={{ backgroundImage: `url(${IMG}/rsvp.jpeg)`, backgroundPosition: '30% center' }} aria-hidden="true" />}
      <Reveal className="rsvp-panel">
        <div className="rsvp-card">{children}</div>
      </Reveal>
    </div>
  );
}

export default function Nature({
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
  const heroSrc = bannerImage || HERO_DEFAULTS.nature;

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--nt-font-sans)', fontSize: 17, lineHeight: 1.95, color: 'var(--nt-oak)' };

  return (
    <div className="nt">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Marcellus&family=Mulish:wght@400;600;700&display=swap" />
      <style>{css}</style>
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt="" fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        <div className="hero-overlay" />
        {HERO_LEAVES.map((l) => (
          <FallingLeaf key={l.left} className="nt-leaf" size={l.size} fill={l.fill} style={{ left: l.left, animationDelay: l.delay, animationDuration: l.dur }} />
        ))}
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}>{heading}</h1>}
          <span className="hero-line" aria-hidden="true" />
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date" style={heroTextStyle(heroStyle?.text.date)}>{heroDateText}</p>)}
          <div className="hero-actions">
            <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            <HeroButton id="story" href="#story" className="btn btn-outline" label={t.ourStoryBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            {galleryToken && showGuestPhotos !== false && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
          </div>
        </div>
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <SprigRule />
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

      {/* COUNTDOWN — candlelight among the trees, fireflies drifting */}
      {eventDate && (
        <div className="countdown-shell">
          <div className="nt-photo-bg" style={{ backgroundImage: `url(${IMG}/countdown.jpeg)` }} aria-hidden="true" />
          {FIREFLIES.map((f) => (
            <span key={`${f.left}-${f.top}`} className="nt-firefly" style={{ left: f.left, top: f.top, animationDelay: f.delay }} aria-hidden="true" />
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
          <div className="section section-linen section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SprigRule />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 700, color: 'var(--nt-leaf)' }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p style={{ marginTop: 12 }}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nt-leaf)', textDecoration: 'none', borderBottom: '1px solid var(--nt-candle)' }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-linen section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SprigRule />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--nt-oak)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-center">
            <div className="wrap">
              <SprigRule />
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
              <SprigRule />
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

      {/* RSVP — on the wedding flat lay */}
      {showRsvp !== false && (
        <FlatLaySection id="rsvp">
          <div style={{ textAlign: 'center' }}>
            <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
            <SprigRule />
            <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
          </div>
          <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
        </FlatLaySection>
      )}
      {/* POTLUCK (Plus, off by default) */}
      {isPaid && potluck && (
        <FlatLaySection id="potluck" photo={false}>
          <div style={{ textAlign: 'center' }}>
            <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
            <SprigRule />
            <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
          </div>
          <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
        </FlatLaySection>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) */}
      {isPaid && giftExchange && (
        <FlatLaySection id="gift-exchange" photo={false}>
          <div style={{ textAlign: 'center' }}>
            <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
            <SprigRule />
            <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
          </div>
          <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
        </FlatLaySection>
      )}

      {/* GALLERY — the host's photos. Hidden on a live page until there
          are some; theme previews show the theme's own sample photos. */}
      {(() => {
        const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
        return (editSlots?.gallery || gallery.length > 0) && (
          <Reveal>
            <div className="section section-pale section-center">
              <div className="wrap-wide">
                <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
                <SprigRule />
                <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
                {editSlots?.gallery ?? <GalleryGrid images={gallery} />}
              </div>
            </div>
          </Reveal>
        );
      })()}

      {/* REGISTRY — under the hanging bottles */}
      {(registryDescription || registryButtonLink) && (
        <div className="registry-wrap">
          <div className="nt-photo-bg" style={{ backgroundImage: `url(${registryImage || `${IMG}/registry.jpeg`})` }} aria-hidden="true" />
          <Reveal className="registry-overlay">
            <p className="registry-title">{t.registry}</p>
            {registryDescription && <p className="registry-description" style={{ whiteSpace: 'pre-line' }}>{registryDescription}</p>}
            {registryButtonLink && (
              <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                {registryButtonText || t.viewRegistry}
              </a>
            )}
          </Reveal>
        </div>
      )}

      {/* SPONSORS (Plus) */}
      {isPaid && sponsors && sponsors.length > 0 && (
        <Reveal>
          <div className="section section-linen section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SprigRule />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 6, border: `1px solid ${BURLAP}66` }} textStyle={{ color: 'var(--nt-oak)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <SprigRule />
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
              <SprigRule />
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
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer">
        {FOOTER_LEAVES.map((l) => (
          <FallingLeaf key={l.left} className="nt-leaf" size={l.size} fill={l.fill} style={{ left: l.left, animationDelay: l.delay, animationDuration: l.dur, opacity: 0.7 }} />
        ))}
        <Wreath />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 12 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--nt-candle)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--nt-candle)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
