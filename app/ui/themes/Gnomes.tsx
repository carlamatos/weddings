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

const IMG = '/images/themes/gnomes';

// Cozy holiday photos from the other Christmas themes.
const GALLERY_PATHS = [
  '/images/themes/merry/photo-2.jpeg', '/images/themes/christmas-party/photo-2.jpeg', '/images/themes/merry/photo-1.jpeg', '/images/themes/white-christmas/photo-1.jpeg',
  '/images/themes/merry/photo-5.jpeg', '/images/themes/christmas-party/photo-5.jpeg', '/images/themes/merry/photo-4.jpeg', '/images/themes/christmas-party/photo-3.jpeg',
];
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `gn-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The watercolour gnomes' palette: hat reds and pink, pine, holly and sage
// greens, gift gold, nose peach and blush, beard cream and silver, kraft
// tan and satchel brown.
const HAT_DEEP = '#D91D1A';
const HAT = '#EA3633';
const CORAL = '#F05450';
const PINK = '#F57774';
const PINE = '#476735';
const HOLLY = '#688958';
const SAGE = '#8EA58B';
const GOLD = '#FABA61';
const PEACH = '#EEAD99';
const BLUSH = '#F6CFBD';
const CREAM = '#F0E5DD';
const KRAFT = '#CB8F6D';
const SATCHEL = '#B26341';
const SILVER = '#C1C8BB';
// A paper white a step lighter than the beard cream, for cards.
const PAPER = '#FBF6F1';

// ─── decorations ─────────────────────────────────────────

// A holly sprig — two leaves and three berries — the section rule.
function HollyRule({ light }: { light?: boolean }) {
  return (
    <div className="gn-rule" aria-hidden="true">
      <span className="gn-rule-line" style={light ? { background: 'rgba(240,229,221,0.5)' } : undefined} />
      <svg className="gn-holly" width="54" height="30" viewBox="0 0 54 30">
        <path d="M27 17 C 22 9, 14 6, 4 8 C 7 10, 6 13, 9 14 C 7 16, 9 19, 12 18 C 13 21, 17 21, 18 19 C 21 21, 25 20, 27 17 Z" fill={light ? SAGE : HOLLY} />
        <path d="M27 17 C 32 9, 40 6, 50 8 C 47 10, 48 13, 45 14 C 47 16, 45 19, 42 18 C 41 21, 37 21, 36 19 C 33 21, 29 20, 27 17 Z" fill={light ? HOLLY : PINE} />
        <circle cx="23.5" cy="19" r="3.4" fill={HAT} />
        <circle cx="30.5" cy="19" r="3.4" fill={HAT_DEEP} />
        <circle cx="27" cy="13.5" r="3.4" fill={CORAL} />
        <circle cx="26" cy="12.4" r="1" fill="#fff" opacity="0.7" />
      </svg>
      <span className="gn-rule-line" style={light ? { background: 'rgba(240,229,221,0.5)' } : undefined} />
    </div>
  );
}

// A string of fairy lights draped across the top of the banner.
const BULB_COLORS = [HAT, GOLD, HOLLY, PINK, HAT_DEEP, GOLD, SAGE, CORAL];
function StringLights() {
  const bulbs = Array.from({ length: 22 }, (_, i) => {
    const x = 36 + i * 75;
    const y = 24 + Math.sin((x / 1600) * Math.PI * 4) * 16 + 14;
    return { x, y, color: BULB_COLORS[i % BULB_COLORS.length], delay: `${(i % 5) * -0.6}s` };
  });
  const wire = Array.from({ length: 81 }, (_, i) => {
    const x = i * 20;
    return `${i ? 'L' : 'M'}${x} ${24 + Math.sin((x / 1600) * Math.PI * 4) * 16}`;
  }).join(' ');
  return (
    <svg className="gn-lights" viewBox="0 0 1600 90" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <path d={wire} fill="none" stroke={PINE} strokeWidth="2" />
      {bulbs.map((b) => (
        <g key={b.x} transform={`translate(${b.x} ${b.y - 14})`}>
          <rect x="-3.5" y="0" width="7" height="7" rx="1.5" fill={PINE} />
          <ellipse className="gn-bulb" cx="0" cy="17" rx="7" ry="11" fill={b.color} style={{ animationDelay: b.delay }} />
          <ellipse cx="-2.2" cy="13" rx="1.8" ry="3.4" fill="#fff" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

// A little wrapped present, for the programme.
function Present({ color, ribbon }: { color: string; ribbon: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <rect x="4" y="13" width="26" height="18" rx="2" fill={color} />
      <rect x="2" y="9" width="30" height="6" rx="1.5" fill={color} />
      <rect x="15" y="9" width="4" height="22" fill={ribbon} />
      <path d="M17 9 C 12 2, 6 5, 9 9 Z M17 9 C 22 2, 28 5, 25 9 Z" fill={ribbon} />
    </svg>
  );
}
const PRESENTS = [[HAT, GOLD], [HOLLY, CREAM], [GOLD, HAT_DEEP], [PINK, PINE], [KRAFT, HAT]] as const;

// A bow for the top of the gift-box registry card.
function Bow() {
  return (
    <svg className="gn-bow" width="110" height="60" viewBox="0 0 110 60" aria-hidden="true">
      <path d="M55 32 C 34 6, 8 8, 12 30 C 15 46, 38 42, 55 32 Z" fill={HAT} />
      <path d="M55 32 C 76 6, 102 8, 98 30 C 95 46, 72 42, 55 32 Z" fill={HAT} />
      <path d="M55 32 C 40 18, 24 18, 22 28 C 32 26, 44 30, 55 32 Z M55 32 C 70 18, 86 18, 88 28 C 78 26, 66 30, 55 32 Z" fill={HAT_DEEP} opacity="0.55" />
      <path d="M50 34 L 38 58 L 46 54 L 50 60 L 55 36 Z M60 34 L 72 58 L 64 54 L 60 60 L 55 36 Z" fill={HAT_DEEP} />
      <ellipse cx="55" cy="32" rx="9" ry="8" fill={HAT_DEEP} />
    </svg>
  );
}

// A small heart, floating up from the gnome.
function Heart({ fill }: { fill: string }) {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">
      <path d="M9 15 C 2 10, 0 7, 0 4.5 C 0 2, 2 0, 4.5 0 C 6.5 0, 8 1.2, 9 3 C 10 1.2, 11.5 0, 13.5 0 C 16 0, 18 2, 18 4.5 C 18 7, 16 10, 9 15 Z" fill={fill} />
    </svg>
  );
}
const HEARTS = [
  { left: '18%', delay: '0s', fill: PINK }, { left: '62%', delay: '-1.6s', fill: HAT }, { left: '40%', delay: '-3.1s', fill: CORAL },
  { left: '78%', delay: '-4.4s', fill: PEACH }, { left: '28%', delay: '-5.6s', fill: HAT_DEEP },
];

// Falling snow: fixed values so the server and client render alike.
const SNOW = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 9.7 + 3) % 100}%`,
  size: 4 + (i % 5) * 2,
  delay: `-${(i * 1.3) % 15}s`,
  dur: `${10 + (i % 6) * 2.4}s`,
  still: `${(i * 31 + 6) % 92}%`,
}));
function Snow({ count = SNOW.length, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`gn-snow ${className}`} aria-hidden="true">
      {SNOW.slice(0, count).map((f) => (
        <span key={f.left} style={{ left: f.left, width: f.size, height: f.size, animationDelay: f.delay, animationDuration: f.dur, ['--gn-still' as string]: f.still } as React.CSSProperties} />
      ))}
    </div>
  );
}

// The santa hats peeking out of the snow, each cut from the sage artwork
// (x, y, width, height in the 2576 × 620 crop), standing in the snow.
const HATS = [
  { x: 125, y: 190, w: 282 },
  { x: 474, y: 32, w: 206 },
  { x: 812, y: 161, w: 221 },
  { x: 1157, y: 152, w: 240 },
  { x: 1572, y: 170, w: 230 },
  { x: 1906, y: 68, w: 200 },
  { x: 2235, y: 136, w: 248 },
];
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
function SantaHats() {
  return (
    <div className="gn-hats" aria-hidden="true">
      {HATS.map((h, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={h.x} className="gn-hat" src={`${IMG}/hat-${i + 1}.webp`} alt="" loading="lazy"
          style={{ left: pct(h.x, 2576), top: pct(h.y, 620), width: pct(h.w, 2576) }} />
      ))}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="gn-hats-snow" src={`${IMG}/hats-snow.webp`} alt="" loading="lazy" />
    </div>
  );
}

// ─── banner ──────────────────────────────────────────────

// The banner when the host hasn't added a photo: beard cream with soft
// watercolour washes. Also what the editor shows behind the banner.
export function GnomesDefaultHero() {
  return (
    <div className="hero-bg" style={{
      background: `radial-gradient(ellipse 40% 45% at 8% 20%, rgba(246,207,189,0.85) 0%, rgba(246,207,189,0) 70%),
        radial-gradient(ellipse 45% 40% at 92% 30%, rgba(142,165,139,0.35) 0%, rgba(142,165,139,0) 70%),
        radial-gradient(ellipse 50% 40% at 50% 100%, rgba(250,186,97,0.18) 0%, rgba(250,186,97,0) 70%), ${CREAM}`,
    }} />
  );
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: CREAM, overflow: 'hidden', textAlign: 'center' }}>
      {bannerImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...previewImage(bannerImage)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(240,229,221,0.6)' }} />
        </>
      ) : <GnomesDefaultHero />}
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own faces */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Grandstander:wght@700&family=Caveat:wght@700&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '34px 18px 0' }}>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: PINE, fontWeight: 700, margin: '0 0 2px' }}>You&rsquo;re invited</p>
        <h2 style={{ fontFamily: "'Grandstander', 'Comic Sans MS', sans-serif", fontWeight: 700, fontSize: 'clamp(26px, 4.4vw, 36px)', color: HAT_DEEP, margin: '0 0 6px', lineHeight: 1.05 }}>{heading || 'Gnomes'}</h2>
        {date && <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: SATCHEL, fontWeight: 600, margin: 0 }}>{date}</p>}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${IMG}/gnome-row.jpeg`} alt="" style={{ position: 'absolute', left: '50%', bottom: 0, width: '92%', transform: 'translateX(-50%)', borderRadius: '50% 50% 0 0 / 30% 30% 0 0', background: '#fff' }} />
    </div>
  );
}

const css = `
  .gn {
    --gn-hat-deep: ${HAT_DEEP};
    --gn-hat: ${HAT};
    --gn-coral: ${CORAL};
    --gn-pink: ${PINK};
    --gn-pine: ${PINE};
    --gn-holly: ${HOLLY};
    --gn-sage: ${SAGE};
    --gn-gold: ${GOLD};
    --gn-peach: ${PEACH};
    --gn-blush: ${BLUSH};
    --gn-cream: ${CREAM};
    --gn-kraft: ${KRAFT};
    --gn-satchel: ${SATCHEL};
    --gn-silver: ${SILVER};
    --gn-paper: ${PAPER};
    --gn-ink: #3B2A22;
    --gn-font-display: 'Grandstander', 'Comic Sans MS', system-ui, sans-serif;
    --gn-font-hand: 'Caveat', 'Segoe Print', cursive;
    --gn-font-sans: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .gn * { box-sizing: border-box; }
  .gn { margin: 0; background: var(--gn-cream); color: var(--gn-ink); font-family: var(--gn-font-sans); font-weight: 300; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .gn img { max-width: 100%; }

  /* ─ motion ─ */
  @keyframes gn-fall { 0% { transform: translate3d(0, -20px, 0); } 30% { transform: translate3d(16px, 30vh, 0); } 60% { transform: translate3d(-12px, 62vh, 0); } 100% { transform: translate3d(8px, 108vh, 0); } }
  @keyframes gn-glow { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); } 50% { opacity: 0.55; filter: none; } }
  @keyframes gn-wiggle { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
  @keyframes gn-rock { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  @keyframes gn-hop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes gn-heart { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-220px) scale(1.1) rotate(12deg); opacity: 0; } }
  @keyframes gn-footer-peek { 0%, 55%, 100% { transform: translateY(100%); } 68%, 88% { transform: translateY(14%); } 76% { transform: translateY(14%) rotate(-4deg); } 82% { transform: translateY(14%) rotate(3deg); } }
  @keyframes gn-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes gn-rise { from { opacity: 0; transform: translate(-50%, 40px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @media (prefers-reduced-motion: reduce) {
    .gn .gn-snow span, .gn .gn-bulb, .gn .gn-holly, .gn .gn-gnome, .gn .gn-heart, .gn .gn-peeker, .gn .hero-content > *, .gn .gn-row, .gn .gn-present { animation: none !important; }
    .gn .gn-snow span { top: var(--gn-still, 30%) !important; }
    .gn .gn-heart { display: none; }
    .gn .gn-peeker img { transform: translateY(14%) !important; }
  }

  .gn .gn-snow { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
  .gn .gn-snow span { position: absolute; top: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 4px rgba(255,255,255,0.9); animation: gn-fall 14s linear infinite; will-change: transform; }
  .gn .gn-snow.on-light span { background: #fff; box-shadow: 0 1px 3px rgba(71,103,53,0.35), 0 0 0 1px rgba(193,200,187,0.55); }
  .gn .gn-bulb { animation: gn-glow 2.4s ease-in-out infinite; color: inherit; }
  .gn .gn-rule { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0 auto 20px; }
  .gn .gn-rule-line { width: 56px; height: 2px; border-radius: 2px; background: rgba(104,137,88,0.4); }
  .gn .gn-holly { animation: gn-wiggle 4s ease-in-out infinite; transform-origin: 50% 70%; }

  .gn .eyebrow { font-family: var(--gn-font-hand); font-size: 28px; font-weight: 700; color: var(--gn-hat); margin: 0 0 6px; line-height: 1.1; }
  .gn .eyebrow.on-dark { color: var(--gn-gold); }
  .gn .section-title { font-family: var(--gn-font-display); font-size: clamp(34px, 4.6vw, 54px); font-weight: 700; color: var(--gn-pine); margin: 0 0 18px; line-height: 1.08; }
  .gn .section-title.on-dark { color: var(--gn-cream); }

  .gn .wrap { max-width: 720px; margin: 0 auto; padding: 0 26px; }
  .gn .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
  .gn .section { position: relative; padding: 110px 26px; background: var(--gn-cream); overflow: hidden; }
  .gn .section-paper { background: var(--gn-paper); }
  .gn .section-blush { background: var(--gn-blush); }
  .gn .section-sage { background: var(--gn-sage); }
  .gn .section-center { text-align: center; }
  @media (max-width: 640px) { .gn .section { padding: 78px 20px; } }

  .gn .btn { font-family: var(--gn-font-display); font-size: 16px; font-weight: 700; letter-spacing: 0.5px; padding: 14px 30px; border-radius: 999px; border: 2px solid var(--gn-hat); background: var(--gn-hat); color: #fff; cursor: pointer; transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease; text-decoration: none; display: inline-block; line-height: 1.1; height: auto; box-shadow: 0 5px 0 var(--gn-hat-deep); }
  .gn .btn:hover { transform: translateY(-2px); box-shadow: 0 7px 0 var(--gn-hat-deep); background: var(--gn-coral); border-color: var(--gn-coral); }
  .gn .btn:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--gn-hat-deep); }
  .gn .btn-outline { background: var(--gn-paper); color: var(--gn-pine); border-color: var(--gn-pine); box-shadow: 0 5px 0 var(--gn-pine); }
  .gn .btn-outline:hover { background: var(--gn-pine); border-color: var(--gn-pine); color: var(--gn-paper); box-shadow: 0 7px 0 #34502A; }
  .gn .btn-outline.on-dark { background: transparent; color: var(--gn-cream); border-color: var(--gn-cream); box-shadow: 0 5px 0 rgba(0,0,0,0.25); }
  .gn .btn-outline.on-dark:hover { background: var(--gn-cream); color: var(--gn-hat-deep); }

  .gn input, .gn textarea, .gn select { font-family: var(--gn-font-sans); font-size: 15px; padding: 12px 16px; border: 2px solid ${SILVER}; border-radius: 14px; outline: none; background: #fff; color: var(--gn-ink); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .gn input:focus, .gn textarea:focus, .gn select:focus { border-color: var(--gn-holly); box-shadow: 0 0 0 4px rgba(104,137,88,0.18); }
  .gn input::placeholder, .gn textarea::placeholder { color: rgba(59,42,34,0.4); }
  .gn label.field-label { font-family: var(--gn-font-display); font-size: 14px; font-weight: 500; color: var(--gn-pine); display: block; margin-bottom: 6px; }
  .gn .radio-label, .gn .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--gn-ink); cursor: pointer; }
  .gn .radio-label input, .gn .check-label input { width: auto; border: none; padding: 0; accent-color: var(--gn-hat); box-shadow: none; }
  .gn .check-hint { font-size: 12px; color: rgba(59,42,34,0.65); margin: 4px 0 0; }
  .gn .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .gn .rsvp-error { color: var(--gn-hat-deep); font-size: 13px; margin: 0; }
  .gn .rsvp-success { text-align: center; padding: 20px 0; }
  .gn .rsvp-headline { font-family: var(--gn-font-hand); font-size: 50px; color: var(--gn-hat); margin: 0 0 8px; font-weight: 700; line-height: 1.05; }
  .gn .rsvp-sub { font-size: 14px; color: var(--gn-ink); margin: 0; }
  .gn .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: fairy lights across the top, the greeting, and the gnomes standing
     on a snowbank along the bottom */
  .gn .hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 110px 20px 0; overflow: hidden; text-align: center; background: var(--gn-cream); }
  .gn .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .gn .hero-veil { position: absolute; inset: 0; z-index: 0; background: linear-gradient(to bottom, rgba(240,229,221,0.75), rgba(240,229,221,0.35) 60%, rgba(240,229,221,0)); pointer-events: none; }
  .gn .gn-lights { position: absolute; top: 0; left: 0; width: 100%; height: 90px; z-index: 2; }
  .gn .hero-content { position: relative; z-index: 3; max-width: 860px; padding-bottom: clamp(220px, 26vw, 380px); }
  .gn .hero-content > * { animation: gn-in 1s ease both; }
  .gn .hero-eyebrow { animation-delay: 0.15s !important; font-family: var(--gn-font-hand); font-size: clamp(30px, 3.4vw, 40px); font-weight: 700; color: var(--gn-pine); margin: 0 0 4px; }
  .gn .hero-name { animation-delay: 0.3s !important; font-family: var(--gn-font-display); font-weight: 700; font-size: clamp(56px, 8.4vw, 118px); line-height: 0.98; color: var(--gn-hat-deep); margin: 0 0 18px; text-shadow: 3px 4px 0 rgba(246,207,189,0.9); }
  .gn .hero-rule { animation-delay: 0.45s !important; }
  .gn .hero-date { animation-delay: 0.55s !important; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: var(--gn-satchel); font-weight: 500; margin: 0 0 30px; }
  .gn .hero-actions { animation-delay: 0.7s !important; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
  .gn .gn-snowbank { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(170px, 19vw, 280px); z-index: 2; }
  .gn .gn-snowbank svg { position: absolute; left: 0; bottom: 0; width: 100%; height: 100%; }
  .gn .gn-row { position: absolute; left: 50%; bottom: clamp(30px, 4vw, 60px); width: min(1180px, 94vw); z-index: 3; max-width: none; transform: translateX(-50%); animation: gn-rise 1.3s cubic-bezier(0.2, 0.7, 0.2, 1) 0.5s both; mix-blend-mode: multiply; }
  @media (max-width: 640px) {
    .gn .hero { padding-top: 96px; }
    .gn .hero-content { padding-bottom: 210px; }
    .gn .hero-date { letter-spacing: 2px; font-size: 12px; }
    .gn .gn-row { width: 230vw; bottom: 20px; }
    .gn .gn-snowbank { height: 190px; }
  }

  /* story: the watercolour gnome rocking, hearts floating up */
  .gn .story { background: var(--gn-blush); }
  .gn .story-grid { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 6fr); gap: 60px; align-items: center; max-width: 1040px; margin: 0 auto; }
  .gn .gnome-stage { position: relative; display: flex; justify-content: center; }
  .gn .gnome-stage::after { content: ''; position: absolute; left: 14%; right: 14%; bottom: -6px; height: 26px; border-radius: 50%; background: rgba(178,99,65,0.18); filter: blur(4px); }
  .gn .gn-gnome { position: relative; z-index: 1; width: min(340px, 80%); transform-origin: 50% 96%; animation: gn-rock 4.2s ease-in-out infinite; }
  .gn .gn-heart { position: absolute; bottom: 55%; z-index: 2; animation: gn-heart 6.5s ease-out infinite; }
  .gn .story-card { position: relative; background: var(--gn-paper); padding: 50px 44px 44px; border-radius: 26px; box-shadow: 0 24px 50px -30px rgba(178,99,65,0.6); }
  .gn .story-card::before { content: ''; position: absolute; top: -14px; left: 50%; width: 120px; height: 30px; margin-left: -60px; background: rgba(142,165,139,0.55); transform: rotate(-3deg); border-radius: 3px; }
  .gn .story-text { font-size: 17px; line-height: 1.9; color: rgba(59,42,34,0.86); margin: 0; }
  @media (max-width: 820px) {
    .gn .story-grid { grid-template-columns: 1fr; gap: 30px; }
    .gn .gn-gnome { width: 220px; }
    .gn .story-card { padding: 44px 26px 36px; text-align: center; }
  }

  /* countdown: sage, the santa hats standing in the snow, snow falling */
  .gn .countdown-shell { position: relative; overflow: hidden; background: var(--gn-sage); }
  .gn .countdown-wrap { position: relative; z-index: 2; padding: 110px 24px 20px; text-align: center; }
  .gn .countdown-heading { font-family: var(--gn-font-display); font-size: clamp(40px, 5.6vw, 66px); color: var(--gn-paper); margin: 0 0 36px; font-weight: 700; line-height: 1.05; text-shadow: 3px 3px 0 rgba(71,103,53,0.55); }
  .gn .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 2.4vw, 24px); }
  .gn .countdown-block { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: clamp(76px, 13vw, 124px); aspect-ratio: 1; border-radius: 50%; background: var(--gn-paper); box-shadow: inset 0 0 0 6px var(--gn-paper), inset 0 0 0 8px var(--gn-hat), 0 10px 0 rgba(71,103,53,0.35); }
  .gn .countdown-block::before { content: ''; position: absolute; inset: 12px; border-radius: 50%; border: 2px dashed rgba(234,54,51,0.45); }
  .gn .countdown-block:nth-child(2) { box-shadow: inset 0 0 0 6px var(--gn-paper), inset 0 0 0 8px var(--gn-holly), 0 10px 0 rgba(71,103,53,0.35); }
  .gn .countdown-block:nth-child(2)::before { border-color: rgba(104,137,88,0.5); }
  .gn .countdown-block:nth-child(4) { box-shadow: inset 0 0 0 6px var(--gn-paper), inset 0 0 0 8px var(--gn-gold), 0 10px 0 rgba(71,103,53,0.35); }
  .gn .countdown-block:nth-child(4)::before { border-color: rgba(250,186,97,0.7); }
  .gn .countdown-value { position: relative; font-family: var(--gn-font-display); font-size: clamp(28px, 4.6vw, 48px); color: var(--gn-hat-deep); font-weight: 700; line-height: 1; }
  .gn .countdown-label { position: relative; font-family: var(--gn-font-hand); font-size: clamp(15px, 1.8vw, 20px); color: var(--gn-pine); margin-top: 2px; font-weight: 700; }
  .gn .gn-hats { position: relative; z-index: 1; width: 100%; aspect-ratio: 2576 / 620; margin-top: -2%; }
  .gn .gn-hat { position: absolute; height: auto; }
  .gn .gn-hats-snow { position: absolute; left: 0; top: 66.9%; width: 100%; height: 33.1%; display: block; }
  @media (max-width: 640px) {
    .gn .countdown-wrap { padding: 84px 14px 30px; }
    .gn .countdown-row { gap: 8px; }
    .gn .countdown-block { width: 74px; }
    .gn .gn-hats { width: 150%; margin-left: -25%; }
  }

  /* details: a postcard, with a gnome stamp and a postmark */
  .gn .postcard { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); max-width: 900px; margin: 16px auto 0; background: var(--gn-paper); border-radius: 10px; padding: 46px 0; text-align: left; box-shadow: 0 30px 60px -36px rgba(59,42,34,0.55), 0 0 0 10px rgba(255,255,255,0.6); transform: rotate(-0.6deg); }
  .gn .postcard::before { content: ''; position: absolute; inset: 0; border-radius: 10px; border: 8px solid transparent; border-image: repeating-linear-gradient(45deg, ${HAT} 0 14px, ${PAPER} 14px 24px, ${PINE} 24px 38px, ${PAPER} 38px 48px) 8; pointer-events: none; }
  .gn .postcard-note { padding: 10px 40px; border-right: 2px solid rgba(203,143,109,0.35); }
  .gn .postcard-note .postcard-hello { font-family: var(--gn-font-hand); font-size: 34px; font-weight: 700; color: var(--gn-hat); margin: 0 0 6px; line-height: 1.05; }
  .gn .postcard-note .postcard-time { font-family: var(--gn-font-display); font-size: 40px; font-weight: 700; color: var(--gn-pine); margin: 0 0 6px; line-height: 1.05; }
  .gn .postcard-note p { font-size: 15px; color: rgba(59,42,34,0.8); margin: 0 0 4px; }
  .gn .postcard-address { position: relative; padding: 10px 40px; }
  .gn .stamp { position: relative; float: right; width: 96px; height: 114px; margin: 0 0 16px 16px; padding: 8px; background: #fff; transform: rotate(4deg); filter: drop-shadow(0 2px 3px rgba(59,42,34,0.3));
    -webkit-mask: linear-gradient(#000 0 0) content-box, radial-gradient(circle 3.5px, transparent 96%, #000) -4.5px -4.5px / 9px 9px;
    mask: linear-gradient(#000 0 0) content-box, radial-gradient(circle 3.5px, transparent 96%, #000) -4.5px -4.5px / 9px 9px; }
  .gn .stamp-inner { width: 100%; height: 100%; background: ${BLUSH} url(${IMG}/gnome.webp) center 30% / 82% auto no-repeat; }
  .gn .postmark { position: absolute; top: 34px; right: 96px; width: 86px; height: 86px; border-radius: 50%; border: 2px solid rgba(178,99,65,0.55); display: flex; align-items: center; justify-content: center; text-align: center; font-family: var(--gn-font-display); font-size: 10px; letter-spacing: 1px; line-height: 1.2; text-transform: uppercase; color: rgba(178,99,65,0.75); transform: rotate(-12deg); }
  .gn .postcard-line { clear: right; font-family: var(--gn-font-hand); font-size: 26px; font-weight: 700; color: var(--gn-ink); padding: 4px 0; border-bottom: 2px dotted rgba(203,143,109,0.6); margin: 0; min-height: 44px; }
  .gn .postcard-line.venue { color: var(--gn-hat-deep); }
  .gn .postcard-links { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 20px; }
  .gn .postcard-links a { font-family: var(--gn-font-display); font-size: 15px; font-weight: 700; color: var(--gn-pine); text-decoration: none; border-bottom: 3px solid var(--gn-gold); }
  .gn .polaroid { max-width: 780px; margin: 46px auto 0; background: #fff; padding: 14px 14px 48px; box-shadow: 0 24px 46px -30px rgba(59,42,34,0.6); transform: rotate(0.8deg); position: relative; }
  .gn .polaroid iframe { border: 0; display: block; width: 100%; height: 320px; }
  .gn .polaroid figcaption { position: absolute; left: 0; right: 0; bottom: 8px; font-family: var(--gn-font-hand); font-size: 26px; font-weight: 700; color: var(--gn-pine); }
  .gn .polaroid::before { content: ''; position: absolute; top: -14px; left: 50%; width: 130px; height: 30px; margin-left: -65px; background: rgba(245,119,116,0.45); transform: rotate(2deg); }
  @media (max-width: 720px) {
    .gn .postcard { grid-template-columns: 1fr; padding: 34px 0; transform: none; }
    .gn .postcard-note { border-right: none; border-bottom: 2px solid rgba(203,143,109,0.35); padding: 6px 26px 26px; text-align: center; }
    .gn .postcard-address { padding: 24px 26px 6px; }
    .gn .postmark { right: 100px; top: 30px; width: 70px; height: 70px; font-size: 8px; }
    .gn .polaroid iframe { height: 260px; }
  }

  /* program: presents down a candy-cane card on pine */
  .gn .program-section { background: var(--gn-pine); }
  .gn .program-card { position: relative; max-width: 640px; margin: 0 auto; background: var(--gn-paper); border-radius: 24px; padding: 64px 46px 50px; text-align: center; overflow: hidden; box-shadow: 0 30px 60px -30px rgba(0,0,0,0.5); }
  .gn .program-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 16px; background: repeating-linear-gradient(-45deg, ${HAT} 0 14px, ${PAPER} 14px 26px); }
  .gn .schedule-day { margin: 0 0 34px; }
  .gn .schedule-day:last-child { margin-bottom: 0; }
  .gn .schedule-day-title { font-family: var(--gn-font-hand); font-size: 34px; font-weight: 700; color: var(--gn-hat); margin: 0 0 14px; }
  .gn .schedule-list { text-align: left; }
  .gn .schedule-row { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 16px; align-items: start; padding: 16px 0; border-bottom: 2px dashed rgba(193,200,187,0.9); }
  .gn .schedule-row:last-child { border-bottom: none; }
  .gn .gn-present { display: block; animation: gn-hop 2.8s ease-in-out infinite; }
  .gn .schedule-time { font-family: var(--gn-font-hand); font-size: 22px; font-weight: 700; color: var(--gn-satchel); margin: 0; line-height: 1.1; }
  .gn .schedule-info .name { font-family: var(--gn-font-display); font-size: 20px; font-weight: 700; color: var(--gn-pine); margin: 0 0 2px; }
  .gn .schedule-info .loc { font-size: 14px; color: rgba(59,42,34,0.65); margin: 0; }
  @media (max-width: 560px) { .gn .program-card { padding: 56px 22px 40px; } }

  /* the card shared by RSVP, Potluck and Gift Exchange: a knitted hat brim
     across the top with a pompom, stitched edges */
  .gn .gn-card { position: relative; max-width: 540px; margin: 0 auto; background: var(--gn-paper); padding: 84px 42px 42px; border-radius: 26px; text-align: left; box-shadow: 0 40px 80px -36px rgba(0,0,0,0.6); overflow: visible; }
  .gn .gn-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 46px; border-radius: 26px 26px 0 0;
    background: repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 12px), linear-gradient(to bottom, ${HAT} 0 30px, ${PAPER} 30px 34px, ${HAT} 34px 46px); }
  .gn .gn-card::after { content: ''; position: absolute; inset: 56px 12px 12px; border: 2px dashed rgba(193,200,187,0.9); border-radius: 18px; pointer-events: none; }
  .gn .gn-card > * { position: relative; z-index: 1; }
  .gn .gn-pompom { position: absolute !important; top: -26px; left: 50%; width: 52px; height: 52px; margin-left: -26px; border-radius: 50%; z-index: 2 !important;
    background: radial-gradient(circle at 35% 30%, #fff 0%, ${CREAM} 55%, ${SILVER} 100%); box-shadow: 0 6px 12px -4px rgba(59,42,34,0.35); }
  @media (max-width: 560px) { .gn .gn-card { padding: 78px 22px 32px; } }

  /* rsvp: the little knitted gnome on whitewashed wood, the card beside him */
  .gn .rsvp-section { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; min-height: 880px; padding: 110px 6vw; overflow: hidden; background: #D9D0C6 url(${IMG}/rsvp.jpeg) 18% center / cover no-repeat; }
  .gn .rsvp-section .gn-card-col { grid-column: 2; }
  @media (max-width: 900px) {
    .gn .rsvp-section { display: block; min-height: 0; padding: 330px 18px 76px; background-size: auto 470px; background-position: 4% -60px; background-color: #E6DED6; }
  }
  .gn #potluck.rsvp-section { display: block; min-height: 0; padding: 120px 18px 96px; background: var(--gn-holly); }
  .gn #gift-exchange.rsvp-section { display: block; min-height: 0; padding: 120px 18px 96px; background: var(--gn-hat-deep); }

  /* gallery: polaroids with washi tape */
  .gn .gn-gallery > div { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 26px !important; }
  .gn .gn-gallery button[style*="zoom-in"] { position: relative; overflow: visible !important; background: #fff !important; padding: 10px 10px 34px !important; aspect-ratio: 4 / 5 !important; box-shadow: 0 16px 30px -20px rgba(59,42,34,0.65); transform: rotate(-2deg); transition: transform 0.3s ease; }
  .gn .gn-gallery button[style*="zoom-in"]:nth-child(even) { transform: rotate(2deg); }
  .gn .gn-gallery button[style*="zoom-in"]:nth-child(3n) { transform: rotate(-1deg) translateY(8px); }
  .gn .gn-gallery button[style*="zoom-in"]:hover { transform: rotate(0deg) scale(1.03); z-index: 2; }
  .gn .gn-gallery button[style*="zoom-in"]::before { content: ''; position: absolute; top: -10px; left: 50%; width: 70px; height: 22px; margin-left: -35px; background: rgba(142,165,139,0.6); transform: rotate(-4deg); z-index: 1; }
  .gn .gn-gallery button[style*="zoom-in"]:nth-child(even)::before { background: rgba(245,119,116,0.5); transform: rotate(3deg); }
  .gn .gn-gallery button[style*="zoom-in"] img { overflow: hidden; }
  @media (max-width: 760px) { .gn .gn-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 22px !important; } }

  /* registry: a wrapped present with a red bow, on kraft paper */
  .gn .registry-wrap { position: relative; padding: 120px 24px 100px; overflow: hidden; display: flex; justify-content: center;
    background-color: var(--gn-kraft); background-image: radial-gradient(rgba(255,255,255,0.35) 2px, transparent 2.5px), radial-gradient(rgba(255,255,255,0.2) 1.5px, transparent 2px); background-size: 46px 46px, 46px 46px; background-position: 0 0, 23px 23px; }
  .gn .registry-wrap.has-photo { background: var(--gn-kraft); }
  .gn .registry-photo { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.35; }
  .gn .gift-box { position: relative; z-index: 1; width: min(560px, 100%); background: var(--gn-paper); border-radius: 18px; padding: 70px 46px 46px; text-align: center; box-shadow: 0 30px 60px -30px rgba(59,42,34,0.65); }
  .gn .gift-box::before { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 22px; margin-left: -11px; background: rgba(234,54,51,0.14); }
  .gn .gift-box::after { content: ''; position: absolute; top: 26px; left: 0; right: 0; height: 18px; background: var(--gn-hat); }
  .gn .gift-box > * { position: relative; z-index: 1; }
  .gn .gn-bow { position: absolute !important; top: -12px; left: 50%; margin-left: -55px; z-index: 2 !important; }
  .gn .registry-title { font-family: var(--gn-font-display); font-size: 46px; font-weight: 700; color: var(--gn-hat-deep); margin: 16px 0 10px; line-height: 1.05; }
  .gn .registry-description { font-size: 15px; color: rgba(59,42,34,0.8); margin: 0 auto 26px; line-height: 1.8; max-width: 400px; }
  .gn .registry-button { display: inline-block; font-family: var(--gn-font-display); font-size: 16px; font-weight: 700; padding: 14px 30px; border-radius: 999px; background: var(--gn-pine); color: var(--gn-paper); text-decoration: none; box-shadow: 0 5px 0 #34502A; transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .gn .registry-button:hover { transform: translateY(-2px); box-shadow: 0 7px 0 #34502A; }
  @media (max-width: 560px) { .gn .gift-box { padding: 66px 22px 36px; } }

  /* songs: sage */
  .gn .song-section { background: var(--gn-sage); padding: 110px 26px; text-align: center; }
  .gn .song-section .eyebrow { color: var(--gn-paper); }
  .gn .song-section .section-title { color: var(--gn-paper); text-shadow: 3px 3px 0 rgba(71,103,53,0.45); }
  .gn .song-section .song-list { background: var(--gn-paper); border-radius: 20px; padding: 6px 22px; max-width: 560px; margin: 0 auto; }
  .gn .song-section .song-row { border-bottom: 2px dashed rgba(193,200,187,0.9); padding: 12px 0; }
  .gn .song-section .song-row:last-child { border-bottom: none; }
  .gn .song-section .song-row .title { color: var(--gn-pine); font-family: var(--gn-font-display); font-weight: 700; }
  .gn .song-section .song-row .artist { color: rgba(59,42,34,0.65); }

  /* share: hat red with snowy polka dots */
  .gn .share-band { padding: 100px 24px; text-align: center; background-color: var(--gn-hat); background-image: radial-gradient(rgba(255,255,255,0.22) 3px, transparent 3.5px); background-size: 40px 40px; }
  .gn .share-row { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; }
  .gn .share-hashtag { font-family: var(--gn-font-hand); font-size: clamp(34px, 7vw, 78px); font-weight: 700; color: var(--gn-paper); margin: 0 0 30px; line-height: 1.05; overflow-wrap: anywhere; }

  /* footer: pine green, snow, and a gnome who keeps peeking up */
  .gn .footer { position: relative; padding: 110px 24px 150px; background: var(--gn-pine); text-align: center; overflow: hidden; }
  .gn .footer > *:not(.gn-snow):not(.gn-peeker) { position: relative; z-index: 2; }
  .gn .footer p { font-size: 15px; color: rgba(240,229,221,0.88); margin: 0 0 4px; }
  .gn .footer p.eyebrow { font-size: 28px; color: var(--gn-gold); margin-bottom: 4px; }
  .gn .footer-signoff { font-family: var(--gn-font-hand); font-size: clamp(46px, 6.6vw, 68px) !important; font-weight: 700; color: var(--gn-gold) !important; margin: 26px 0 0 !important; line-height: 1.05; }
  .gn .footer-credit { font-size: 11px; letter-spacing: 1px; color: rgba(240,229,221,0.55) !important; margin-top: 30px !important; }
  .gn .gn-peeker { position: absolute; bottom: 0; right: 8%; width: 170px; height: 200px; overflow: hidden; z-index: 1; pointer-events: none; }
  .gn .gn-peeker img { display: block; width: 100%; height: auto; transform: translateY(100%); animation: gn-footer-peek 9s ease-in-out infinite; transform-origin: 50% 100%; }
  @media (max-width: 640px) { .gn .gn-peeker { width: 110px; height: 130px; right: 3%; } .gn .footer { padding-bottom: 150px; } }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

// Holiday wording in place of the wedding defaults.
const OVERRIDES = {
  en: {
    ourStoryBtn: 'The party',
    ourStoryLabel: 'Gnome for the holidays',
    howWeGotHere: 'There’s no place like gnome',
    theDetails: 'The details',
    dateAndLocation: 'When & where',
    ceremony: 'The party',
    reception: 'Location',
    theSchedule: 'The plan',
    eventProgram: 'What’s happening',
    kindlyRespond: 'Will you join us?',
    memoriesSoFar: 'Cozy moments',
    ourMoments: 'Holiday memories',
    registry: 'Gifts',
    viewRegistry: 'See the details',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'Christmas fun',
    todayIsTheDay: 'Merry Christmas — it’s party day!',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, holiday wishes…',
    buildOurPlaylist: 'Carols & classics',
    withLove: 'Merry Christmas,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La fête',
    ourStoryLabel: 'Les lutins sont là',
    howWeGotHere: 'Rien ne vaut un Noël entre amis',
    theDetails: 'Les détails',
    dateAndLocation: 'Quand et où',
    ceremony: 'La fête',
    reception: 'Lieu',
    theSchedule: 'Le programme',
    eventProgram: 'Au programme',
    kindlyRespond: 'Serez-vous des nôtres ?',
    memoriesSoFar: 'Moments douillets',
    ourMoments: 'Souvenirs des fêtes',
    registry: 'Cadeaux',
    viewRegistry: 'Voir les détails',
    countingDown: 'Compte à rebours jusqu’à',
    untilWeSayIDo: 'La fête de Noël',
    todayIsTheDay: 'Joyeux Noël — c’est jour de fête !',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Restrictions alimentaires, vœux des fêtes…',
    buildOurPlaylist: 'Chants et classiques',
    withLove: 'Joyeux Noël,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La fiesta',
    ourStoryLabel: 'Llegaron los gnomos',
    howWeGotHere: 'No hay nada como Navidad en casa',
    theDetails: 'Los detalles',
    dateAndLocation: 'Cuándo y dónde',
    ceremony: 'La fiesta',
    reception: 'Lugar',
    theSchedule: 'El plan',
    eventProgram: 'Qué va a pasar',
    kindlyRespond: '¿Nos acompañas?',
    memoriesSoFar: 'Momentos acogedores',
    ourMoments: 'Recuerdos navideños',
    registry: 'Regalos',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Cuenta regresiva para',
    untilWeSayIDo: 'La fiesta de Navidad',
    todayIsTheDay: '¡Feliz Navidad, hoy es la fiesta!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Restricciones alimentarias, buenos deseos…',
    buildOurPlaylist: 'Villancicos y clásicos',
    withLove: '¡Feliz Navidad!',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };

// The form card: a knitted brim with a pompom.
function HatCard({ children }: { children: React.ReactNode }) {
  return (
    <Reveal className="gn-card">
      <span className="gn-pompom" aria-hidden="true" />
      {children}
    </Reveal>
  );
}

export default function Gnomes({
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
  const base = getTranslations(language);
  const t: Translations = { ...base, ...pickByLanguage(OVERRIDES, language) };
  const isPreview = !!editSlots;
  // Forms are shown but can't be submitted in the editor or a showcase preview.
  const formsDisabled = isPreview || !!demo;
  const sectionTextCtx = { values: sectionText, pageId: sectionTextPageId };
  const heroDateText = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';
  const heroSrc = bannerImage;

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--gn-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'rgba(59,42,34,0.82)' };
  const postmark = eventDate ? new Date(eventDate + 'T00:00:00').toLocaleDateString(t.dateLocale, { month: 'short', day: 'numeric' }) : '';

  return (
    <div className="gn">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Grandstander:wght@500;700&family=Caveat:wght@500;700&family=Lexend:wght@300;400;500&display=swap" />
      <style>{css}</style>
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO — fairy lights, the greeting, the gnomes on a snowbank */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          !heroSrc ? <GnomesDefaultHero /> : isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt="" fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        {heroSrc && <div className="hero-veil" />}
        <StringLights />
        <Snow className="on-light" />
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}>{heading}</h1>}
          <div className="hero-rule"><HollyRule /></div>
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date" style={heroTextStyle(heroStyle?.text.date)}>{heroDateText}</p>)}
          <div className="hero-actions">
            <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            <HeroButton id="story" href="#story" className="btn btn-outline" label={t.ourStoryBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            {galleryToken && showGuestPhotos !== false && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
          </div>
        </div>
        <div className="gn-snowbank" aria-hidden="true">
          <svg viewBox="0 0 1440 280" preserveAspectRatio="none">
            <path d="M0 120 C 160 70, 300 90, 440 110 C 600 132, 720 60, 900 80 C 1060 98, 1200 130, 1440 90 L1440 280 L0 280 Z" fill="#fff" opacity="0.6" />
            <path d="M0 150 C 180 110, 340 120, 520 140 C 700 160, 860 110, 1040 120 C 1200 130, 1320 150, 1440 130 L1440 280 L0 280 Z" fill="#fff" />
          </svg>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="gn-row" src={`${IMG}/gnome-row.jpeg`} alt="" aria-hidden="true" />
      </div>

      {/* STORY — the watercolour gnome rocking, hearts floating up */}
      {(description || editSlots?.description) && (
        <div id="story" className="section story">
          <div className="story-grid">
            <div className="gnome-stage" aria-hidden="true">
              {HEARTS.map((h) => (
                <span key={h.left} className="gn-heart" style={{ left: h.left, animationDelay: h.delay }}><Heart fill={h.fill} /></span>
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="gn-gnome" src={`${IMG}/gnome.webp`} alt="" loading="lazy" />
            </div>
            <Reveal className="story-card">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
              <HollyRule />
              {editSlots?.description ?? <p className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
            </Reveal>
          </div>
        </div>
      )}

      {/* COUNTDOWN — santa hats in the snow, snow falling */}
      {eventDate && (
        <div className="countdown-shell">
          <Snow count={20} />
          <Countdown
            eventDate={eventDate}
            eventTime={eventTime}
            eyebrow={t.countingDown}
            heading={t.untilWeSayIDo}
            todayHeading={t.todayIsTheDay}
            unitLabels={{ days: t.days, hours: t.hours, mins: t.mins, secs: t.secs }}
            sectionText={sectionTextCtx}
          />
          <SantaHats />
        </div>
      )}

      {/* DATE / LOCATION — a postcard */}
      {(showVenue || showVirtual) && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <HollyRule />
              <div className="postcard">
                <div className="postcard-note">
                  <p className="postcard-hello">{t.ceremony}</p>
                  {formattedTime && <p className="postcard-time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                </div>
                <div className="postcard-address">
                  <span className="stamp" aria-hidden="true"><span className="stamp-inner" style={{ display: 'block' }} /></span>
                  {postmark && <span className="postmark" aria-hidden="true">{postmark}<br />✶</span>}
                  {venueName && <p className="postcard-line venue">{venueName}</p>}
                  {streetAddress && <p className="postcard-line">{streetAddress}</p>}
                  {city && <p className="postcard-line">{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {(mapsUrl || showVirtual) && (
                    <div className="postcard-links">
                      {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>}
                      {showVirtual && <a href={url} target="_blank" rel="noopener noreferrer">{t.joinOnline}</a>}
                    </div>
                  )}
                </div>
              </div>
              {mapSrc && (
                <figure className="polaroid">
                  <iframe title="Venue map" src={mapSrc} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                  <figcaption>{t.getDirections}</figcaption>
                </figure>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* LIVE STREAM (Plus) */}
      {isPaid && livestream && (
        <Reveal>
          <div id="livestream" className="section section-paper section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <HollyRule />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'rgba(59,42,34,0.8)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section, i) => (
        <Reveal key={`custom-${section.position}`}>
          <div className={`section section-center${i % 2 ? '' : ' section-paper'}`}>
            <div className="wrap">
              <HollyRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM — presents down a candy-cane card */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <div className="section program-section section-center">
          <Snow count={16} />
          <Reveal className="program-card">
            <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
            <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" fallback={t.eventProgram} />
            <HollyRule />
            {groupEventProgramByDate(eventProgram).map((group) => (
              <div className="schedule-day" key={group.date}>
                <p className="schedule-day-title">{formatProgramDate(group.date, t.dateLocale)}</p>
                <div className="schedule-list">
                  {group.items.map((item, i) => {
                    const [color, ribbon] = PRESENTS[i % PRESENTS.length];
                    return (
                      <div className="schedule-row" key={item.id}>
                        <span className="gn-present" style={{ animationDelay: `${-i * 0.5}s` }}><Present color={color} ribbon={ribbon} /></span>
                        <div className="schedule-info">
                          {formatProgramTime(item, t.dateLocale) && <p className="schedule-time">{formatProgramTime(item, t.dateLocale)}</p>}
                          <p className="name">{item.name}</p>
                          {item.location && <p className="loc">{item.location}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      )}

      {/* RSVP — the knitted gnome on whitewashed wood */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          <div className="gn-card-col">
            <HatCard>
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
                <HollyRule />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </HatCard>
          </div>
        </div>
      )}

      {/* POTLUCK (Plus, off by default) — plain holly green */}
      {isPaid && potluck && (
        <div id="potluck" className="rsvp-section">
          <HatCard>
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
              <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              <HollyRule />
            </div>
            <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
          </HatCard>
        </div>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) — plain hat red */}
      {isPaid && giftExchange && (
        <div id="gift-exchange" className="rsvp-section">
          <HatCard>
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
              <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              <HollyRule />
            </div>
            <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
          </HatCard>
        </div>
      )}

      {/* GALLERY — polaroids with washi tape. Hidden on a live page until
          there are some; theme previews show sample photos. */}
      {(() => {
        const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
        return (editSlots?.gallery || gallery.length > 0) && (
          <Reveal>
            <div className="section section-center">
              <div className="wrap-wide">
                <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
                <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
                <HollyRule />
                <div style={{ height: 24 }} />
                {editSlots?.gallery ?? <div className="gn-gallery"><GalleryGrid images={gallery} /></div>}
              </div>
            </div>
          </Reveal>
        );
      })()}

      {/* REGISTRY — a wrapped present on kraft paper */}
      {(registryDescription || registryButtonLink) && (
        <div className={`registry-wrap${registryImage ? ' has-photo' : ''}`}>
          {registryImage && <div className="registry-photo" style={{ backgroundImage: `url(${registryImage})` }} aria-hidden="true" />}
          <Reveal className="gift-box">
            <Bow />
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
          <div className="section section-paper section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <HollyRule />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 18, border: `2px solid ${SILVER}`, background: '#fff' }} textStyle={{ color: 'rgba(59,42,34,0.8)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-blush section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
              <HollyRule />
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
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" fallback={t.songRequests} />
              <HollyRule light />
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

      {/* SHARE / HASHTAG — hat red with snowy dots */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER — pine, snow, and a gnome peeking up */}
      <footer className="footer">
        <Snow count={18} />
        <HollyRule light />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--gn-gold)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--gn-gold)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
        <div className="gn-peeker" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/gnome.webp`} alt="" loading="lazy" />
        </div>
      </footer>
    </div>
  );
}
