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

const IMG = '/images/themes/dia-de-los-muertos';
const SKULL = `${IMG}/skull.webp`;

// Exclusive to Día de los Muertos — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `dm-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

const PLUM = '#351040';
const AUBERGINE = '#3D164F';
const CREAM = '#EEE0B5';
const MARIGOLD = '#F69222';
const TEAL = '#1AA79B';
const RED_ORANGE = '#F0562C';
const SKY = '#25A7DF';
const HOT_PINK = '#EB247B';
const GOLDEN = '#FBB813';
const GREEN = '#2AB474';
const CRIMSON = '#DA1E5D';
const LIME = '#8CC441';
const VIOLET = '#652F8F';
const MAGENTA = '#8F2889';
const RED = '#BE202E';
const YELLOW = '#FCDE11';
const OFF_WHITE = '#EBECEE';

// ─── SVG decorations ─────────────────────────────────────

// Papel picado: a string of cut-paper flags, each with its own cut-out
// pattern, swaying gently in the breeze.
const FLAG_COLORS = [HOT_PINK, MARIGOLD, TEAL, GOLDEN, MAGENTA, GREEN, RED_ORANGE, SKY];

function PicadoFlag({ color, variant }: { color: string; variant: number }) {
  // Cut-outs are drawn as holes with an even-odd fill.
  const holes = [
    'M30 22 a8 8 0 1 0 0.1 0 Z M18 46 l6 -6 l6 6 l-6 6 Z M36 46 l6 -6 l6 6 l-6 6 Z',
    'M30 16 l10 14 l-10 14 l-10 -14 Z M14 54 a4 4 0 1 0 0.1 0 Z M46 54 a4 4 0 1 0 0.1 0 Z',
    'M20 22 a5 5 0 1 0 0.1 0 Z M40 22 a5 5 0 1 0 0.1 0 Z M30 34 a7 7 0 1 0 0.1 0 Z M22 52 h16 v4 h-16 Z',
    'M30 18 c 8 6, 8 16, 0 22 c -8 -6, -8 -16, 0 -22 Z M16 48 l4 6 l-4 6 l-4 -6 Z M44 48 l4 6 l-4 6 l-4 -6 Z',
  ][variant % 4];
  const zigzag = 'M0 0 H60 V58 l-5 6 l-5 -6 l-5 6 l-5 -6 l-5 6 l-5 -6 l-5 6 l-5 -6 l-5 6 l-5 -6 l-5 6 l-5 -6 Z';
  return (
    <svg width="60" height="66" viewBox="0 0 60 66" aria-hidden="true">
      <path d={`${zigzag} ${holes}`} fill={color} fillRule="evenodd" />
      <path d="M0 4 H60" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
    </svg>
  );
}

function PapelPicado({ count = 40 }: { count?: number }) {
  return (
    <div className="dm-picado" aria-hidden="true">
      <div className="dm-picado-string" />
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="dm-flag" style={{ animationDelay: `${-(i % 5) * 0.6}s` }}>
          <PicadoFlag color={FLAG_COLORS[i % FLAG_COLORS.length]} variant={i} />
        </span>
      ))}
    </div>
  );
}

// A cempasúchil (marigold) bloom: rings of ruffled petals.
function Marigold({ size = 34, color = MARIGOLD, center = YELLOW, className, style }: { size?: number; color?: string; center?: string; className?: string; style?: React.CSSProperties }) {
  const ring = (r: number, n: number, len: number, fill: string, offset = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = (360 / n) * i + offset;
      return <ellipse key={`${r}-${i}`} cx="20" cy={20 - r} rx={len * 0.55} ry={len} fill={fill} transform={`rotate(${a} 20 20)`} />;
    });
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {ring(11, 14, 5.5, color)}
      {ring(7, 12, 4.4, RED_ORANGE, 15)}
      {ring(3.5, 9, 3.2, color, 8)}
      <circle cx="20" cy="20" r="3.4" fill={center} />
    </svg>
  );
}

// A marigold flanked by hairlines — the ornament under each section label.
function FlowerRule() {
  return (
    <div className="dm-rule" aria-hidden="true">
      <span className="dm-rule-line" style={{ background: `linear-gradient(to left, ${MARIGOLD}, transparent)` }} />
      <Marigold className="dm-spin" size={30} />
      <span className="dm-rule-line" style={{ background: `linear-gradient(to right, ${MARIGOLD}, transparent)` }} />
    </div>
  );
}

// Falling marigold petals.
const PETALS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 31 + 5) % 100}%`,
  size: 8 + ((i * 5) % 8),
  duration: `${10 + ((i * 7) % 9)}s`,
  delay: `${-((i * 1.6) % 14).toFixed(1)}s`,
  drift: (i % 2 ? 1 : -1) * (20 + ((i * 13) % 40)),
  color: [MARIGOLD, GOLDEN, RED_ORANGE, HOT_PINK][i % 4],
}));

function PetalFall() {
  return (
    <div className="dm-petals" aria-hidden="true">
      {PETALS.map((p, i) => (
        <svg key={i} className="dm-petal" width={p.size} height={p.size * 1.4} viewBox="0 0 10 14"
          style={{ left: p.left, animationDuration: p.duration, animationDelay: p.delay, ['--drift' as string]: `${p.drift}px` }}>
          <path d="M5 0 C 10 4, 9 11, 5 14 C 1 11, 0 4, 5 0 Z" fill={p.color} />
        </svg>
      ))}
    </div>
  );
}

// The sugar-skull image, animated: a row of skulls bobbing in a wave.
function SkullParade({ count = 7 }: { count?: number }) {
  return (
    <div className="dm-parade" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} className="dm-parade-skull" src={SKULL} alt="" style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: GOLDEN, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sancreek&display=swap" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['dia-de-los-muertos']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 22px', maxWidth: '50%' }}>
        <p style={{ display: 'inline-block', fontFamily: "'Nunito', sans-serif", fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: CREAM, background: PLUM, borderRadius: 999, fontWeight: 800, padding: '4px 10px', margin: '0 0 6px' }}>Celebrate with us</p>
        <h2 style={{ fontFamily: "'Sancreek', 'Georgia', serif", fontWeight: 400, fontSize: 'clamp(24px, 4.4vw, 36px)', color: PLUM, margin: '0 0 6px', lineHeight: 1.05 }}>{heading || 'Día de los Muertos'}</h2>
        {date && <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: PLUM, fontWeight: 800, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .dm {
    --dm-plum: ${PLUM};
    --dm-aubergine: ${AUBERGINE};
    --dm-cream: ${CREAM};
    --dm-marigold: ${MARIGOLD};
    --dm-teal: ${TEAL};
    --dm-red-orange: ${RED_ORANGE};
    --dm-sky: ${SKY};
    --dm-hot-pink: ${HOT_PINK};
    --dm-golden: ${GOLDEN};
    --dm-green: ${GREEN};
    --dm-crimson: ${CRIMSON};
    --dm-lime: ${LIME};
    --dm-violet: ${VIOLET};
    --dm-magenta: ${MAGENTA};
    --dm-red: ${RED};
    --dm-yellow: ${YELLOW};
    --dm-off-white: ${OFF_WHITE};
    --dm-font-display: 'Sancreek', Georgia, serif;
    --dm-font-sans: 'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .dm * { box-sizing: border-box; }
  .dm { margin: 0; background: var(--dm-plum); color: var(--dm-cream); font-family: var(--dm-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .dm img { max-width: 100%; }

  /* ─ animation ─ */
  @keyframes dm-sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  @keyframes dm-spin { to { transform: rotate(360deg); } }
  @keyframes dm-fall { 0% { transform: translate(0, -10vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate(var(--drift, 30px), 110vh) rotate(540deg); opacity: 0.3; } }
  @keyframes dm-wave { 0%, 100% { transform: translateY(0) rotate(-6deg); } 50% { transform: translateY(-16px) rotate(6deg); } }
  @keyframes dm-dance { 0%, 100% { transform: translateY(0) rotate(-8deg) scale(1); } 25% { transform: translateY(-18px) rotate(4deg) scale(1.04); } 50% { transform: translateY(0) rotate(8deg) scale(1); } 75% { transform: translateY(-10px) rotate(-3deg) scale(1.02); } }
  @keyframes dm-peek { 0%, 55%, 100% { transform: translateY(100%) rotate(0deg); } 65%, 90% { transform: translateY(18%) rotate(-8deg); } 78% { transform: translateY(14%) rotate(6deg); } }
  @keyframes dm-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(246,146,34,0.0); } 50% { box-shadow: 0 0 28px 6px rgba(246,146,34,0.45); } }
  @keyframes dm-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .dm .dm-petals { display: none; }
    .dm .dm-flag, .dm .dm-spin, .dm .dm-parade-skull, .dm .dm-peek, .dm .countdown-block, .dm .hero-content > * { animation: none !important; }
    .dm .dm-peek { transform: translateY(18%); }
  }

  .dm .dm-picado { position: relative; display: flex; justify-content: center; flex-wrap: nowrap; gap: 4px; padding-top: 6px; height: 80px; overflow: hidden; background: var(--dm-plum); }
  .dm .dm-picado-string { position: absolute; top: 8px; left: 0; right: 0; height: 2px; background: ${CREAM}; opacity: 0.6; }
  .dm .dm-flag { display: block; flex-shrink: 0; transform-origin: 50% 0; animation: dm-sway 3s ease-in-out infinite; }
  .dm .dm-petals { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
  .dm .dm-petal { position: absolute; top: 0; animation: dm-fall linear infinite; }
  .dm .dm-rule { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0 auto 22px; }
  .dm .dm-rule-line { display: block; width: 80px; height: 2px; border-radius: 2px; }
  .dm .dm-spin { animation: dm-spin 16s linear infinite; }

  .dm .dm-parade { display: flex; justify-content: center; gap: clamp(8px, 3vw, 34px); padding: 34px 20px 26px; background: linear-gradient(to bottom, ${PLUM} 0%, ${AUBERGINE} 100%); overflow: hidden; }
  .dm .dm-parade-skull { width: clamp(46px, 8vw, 84px); height: auto; filter: drop-shadow(0 8px 10px rgba(0,0,0,0.35)); animation: dm-wave 1.8s ease-in-out infinite; }

  .dm .eyebrow { font-family: var(--dm-font-sans); font-size: 13px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--dm-teal); font-weight: 800; margin: 0 0 12px; }
  .dm .eyebrow.on-light { color: var(--dm-magenta); }
  .dm .section-title { font-family: var(--dm-font-display); font-size: clamp(38px, 5.4vw, 64px); font-weight: 400; color: var(--dm-marigold); margin: 0 0 18px; line-height: 1.1; text-shadow: 0 3px 0 rgba(0,0,0,0.25); }
  .dm .section-title.on-light { color: var(--dm-plum); text-shadow: none; }

  .dm .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .dm .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .dm .section { position: relative; padding: 104px 28px; background: var(--dm-plum); overflow: hidden; }
  .dm .section-glow { background: radial-gradient(ellipse at top, ${AUBERGINE} 0%, ${PLUM} 70%); }
  .dm .section-cream { background: var(--dm-cream); color: var(--dm-plum); }
  .dm .section-center { text-align: center; }
  @media (max-width: 640px) { .dm .section { padding: 72px 20px; } }

  .dm .btn { font-family: var(--dm-font-sans); font-size: 14px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 15px 32px; border-radius: 999px; border: 2px solid var(--dm-hot-pink); background: var(--dm-hot-pink); color: #FFFFFF; cursor: pointer; transition: background 0.2s ease, transform 0.2s ease; text-decoration: none; display: inline-block; line-height: 1; box-shadow: 0 6px 0 ${MAGENTA}; }
  .dm .btn:hover { transform: translateY(-2px); background: ${CRIMSON}; border-color: ${CRIMSON}; }
  .dm .btn-outline { background: rgba(53,16,64,0.08); color: var(--dm-plum); border-color: var(--dm-plum); box-shadow: none; }
  .dm .btn-outline:hover { background: var(--dm-plum); color: var(--dm-cream); border-color: var(--dm-plum); }
  .dm .on-dark .btn-outline, .dm .btn-outline.on-dark { color: var(--dm-cream); border-color: var(--dm-cream); background: transparent; }
  .dm .on-dark .btn-outline:hover { background: var(--dm-cream); color: var(--dm-plum); }

  .dm input, .dm textarea, .dm select { font-family: var(--dm-font-sans); font-size: 15px; padding: 12px 15px; border-radius: 12px; border: 2px solid #E3D3A4; outline: none; background: #FFFBEE; color: var(--dm-plum); width: 100%; display: block; transition: border-color 0.2s ease; }
  .dm input:focus, .dm textarea:focus, .dm select:focus { border-color: var(--dm-hot-pink); }
  .dm label.field-label { font-family: var(--dm-font-sans); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--dm-magenta); display: block; margin-bottom: 6px; font-weight: 800; }
  .dm .radio-label, .dm .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--dm-plum); cursor: pointer; }
  .dm .radio-label input, .dm .check-label input { width: auto; border: none; padding: 0; accent-color: var(--dm-hot-pink); }
  .dm .check-hint { font-size: 12px; color: var(--dm-violet); margin: 4px 0 0; }
  .dm .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .dm .rsvp-error { color: var(--dm-red); font-size: 13px; margin: 0; }
  .dm .rsvp-success { text-align: center; padding: 18px 0; }
  .dm .rsvp-headline { font-family: var(--dm-font-display); font-size: 36px; color: var(--dm-hot-pink); margin: 0 0 8px; font-weight: 400; }
  .dm .rsvp-sub { font-size: 14px; color: var(--dm-plum); margin: 0; }
  .dm .rsvp-form { display: flex; flex-direction: column; gap: 17px; }

  /* hero: she fills the left of the photo, so the invitation sits on the golden right side */
  .dm .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: flex-end; text-align: right; padding: 96px 7vw; background: ${GOLDEN}; overflow: hidden; }
  .dm .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: left center; z-index: 0; }
  .dm .hero-content { position: relative; z-index: 2; max-width: 540px; }
  .dm .hero-eyebrow { animation: dm-in 1s ease both; display: inline-block; font-family: var(--dm-font-sans); font-size: 13px; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 800; color: var(--dm-cream); background: var(--dm-plum); border-radius: 999px; padding: 9px 22px; margin: 0 0 18px; }
  .dm .hero-name { animation: dm-in 1s ease 0.15s both; font-family: var(--dm-font-display); font-size: clamp(54px, 8.6vw, 116px); font-weight: 400; color: var(--dm-plum); margin: 0 0 16px; line-height: 0.98; text-shadow: 0 4px 0 rgba(246,146,34,0.6); }
  .dm .hero-date { animation: dm-in 1s ease 0.3s both; font-family: var(--dm-font-sans); font-size: 15px; letter-spacing: 3px; text-transform: uppercase; color: var(--dm-plum); font-weight: 800; margin: 0 0 30px; }
  .dm .hero-actions { animation: dm-in 1s ease 0.45s both; display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
  @media (max-width: 760px) {
    .dm .hero { align-items: flex-end; padding: 72px 20px 80px; }
    .dm .hero-bg { object-position: 22% center; }
    .dm .hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(251,184,19,0.95) 0%, rgba(251,184,19,0.7) 45%, rgba(251,184,19,0) 75%); z-index: 1; }
  }

  /* countdown: over the flowered skull on orange, under a plum veil on the left */
  .dm .countdown-shell { position: relative; background: ${RED_ORANGE} center right / cover no-repeat; overflow: hidden; }
  .dm .countdown-shell::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, rgba(53,16,64,0.95) 0%, rgba(53,16,64,0.85) 45%, rgba(53,16,64,0.25) 100%); }
  .dm .countdown-wrap { position: relative; z-index: 2; padding: 110px 24px; text-align: center; }
  .dm .countdown-wrap .eyebrow { color: var(--dm-golden); }
  .dm .countdown-heading { font-family: var(--dm-font-display); font-size: clamp(40px, 5.6vw, 66px); color: var(--dm-cream); margin: 0 0 38px; font-weight: 400; text-shadow: 0 3px 0 rgba(0,0,0,0.3); }
  .dm .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 3vw, 26px); }
  .dm .countdown-block { text-align: center; width: clamp(76px, 14vw, 116px); padding: 20px 8px 14px; border-radius: 18px; background: rgba(53,16,64,0.6); border: 2px solid var(--dm-marigold); animation: dm-glow 3s ease-in-out infinite; }
  .dm .countdown-block:nth-child(2) { border-color: var(--dm-hot-pink); animation-delay: -0.75s; }
  .dm .countdown-block:nth-child(3) { border-color: var(--dm-teal); animation-delay: -1.5s; }
  .dm .countdown-block:nth-child(4) { border-color: var(--dm-golden); animation-delay: -2.25s; }
  .dm .countdown-value { font-family: var(--dm-font-display); font-size: clamp(32px, 5vw, 56px); color: var(--dm-cream); line-height: 1; }
  .dm .countdown-label { font-family: var(--dm-font-sans); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--dm-golden); margin-top: 8px; font-weight: 800; }

  /* details: cream cards with a papel-picado scallop */
  .dm .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 16px; }
  @media (max-width: 720px) { .dm .details-grid { grid-template-columns: 1fr; } }
  .dm .details-card { position: relative; background: var(--dm-cream); color: var(--dm-plum); padding: 50px 32px 36px; border-radius: 22px; border-top: 10px solid var(--dm-hot-pink); box-shadow: 0 20px 40px -20px rgba(0,0,0,0.6); }
  .dm .details-card:nth-child(2) { border-top-color: var(--dm-teal); }
  .dm .details-card .label { font-family: var(--dm-font-sans); font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--dm-magenta); margin: 0 0 12px; font-weight: 800; }
  .dm .details-card .time { font-family: var(--dm-font-display); font-size: 40px; line-height: 1.05; color: var(--dm-plum); margin-bottom: 10px; }
  .dm .details-card p { font-size: 15px; color: var(--dm-violet); margin: 0 0 4px; }
  .dm .map-frame { overflow: hidden; min-height: 260px; border-radius: 22px; border: 6px solid var(--dm-cream); box-shadow: 0 20px 40px -20px rgba(0,0,0,0.6); }
  .dm .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 260px; }
  .dm .directions-link { text-align: center; margin-top: 26px; }
  .dm .directions-link a { font-family: var(--dm-font-sans); font-size: 14px; font-weight: 800; letter-spacing: 1px; color: var(--dm-golden); text-decoration: none; }

  /* program, on cream */
  .dm .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .dm .schedule-day:last-child { margin-bottom: 0; }
  .dm .schedule-day-title { font-family: var(--dm-font-display); font-size: 30px; color: var(--dm-hot-pink); margin: 0 0 14px; }
  .dm .schedule-list { border-top: 3px dotted var(--dm-marigold); text-align: left; }
  .dm .schedule-row { display: flex; gap: 22px; padding: 16px 0; border-bottom: 3px dotted rgba(246,146,34,0.45); align-items: baseline; }
  .dm .schedule-time { font-family: var(--dm-font-sans); font-size: 15px; font-weight: 800; color: var(--dm-magenta); min-width: 112px; flex-shrink: 0; }
  .dm .schedule-info .name { font-family: var(--dm-font-display); font-size: 26px; color: var(--dm-plum); margin: 0 0 2px; line-height: 1.1; }
  .dm .schedule-info .loc { font-size: 14px; color: var(--dm-violet); margin: 0; }

  /* rsvp: the sugar-skull artwork on its own plum, the card beside it */
  .dm .rsvp-section { position: relative; display: flex; align-items: center; justify-content: flex-end; min-height: 820px; background: #340F40; padding: 90px 7vw; overflow: hidden; }
  /* the artwork's own plum melts into the section: only its top and right edges fade */
  .dm .rsvp-art { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: min(58vw, 880px); height: auto; max-width: none; z-index: 0; -webkit-mask-image: linear-gradient(to right, #000 92%, transparent), linear-gradient(to top, #000 82%, transparent); -webkit-mask-composite: source-in; mask-image: linear-gradient(to right, #000 92%, transparent), linear-gradient(to top, #000 82%, transparent); mask-composite: intersect; }
  .dm .rsvp-card { position: relative; max-width: 480px; background: var(--dm-cream); padding: 46px 36px 38px; border-radius: 24px; text-align: left; box-shadow: 0 0 0 4px var(--dm-marigold), 0 0 0 8px var(--dm-hot-pink), 0 34px 70px -24px rgba(0,0,0,0.7); }
  .dm .rsvp-card .section-title { color: var(--dm-plum); text-shadow: none; }
  .dm .rsvp-card .eyebrow { color: var(--dm-magenta); }
  /* a skull peeking over the top of the card */
  .dm .dm-peek-wrap { position: absolute; top: -66px; right: 30px; width: 76px; height: 66px; overflow: hidden; pointer-events: none; }
  .dm .dm-peek { display: block; width: 76px; animation: dm-peek 7s ease-in-out infinite; }
  @media (max-width: 1150px) { .dm .rsvp-art { width: 44vw; } }
  @media (max-width: 900px) {
    .dm .rsvp-section { display: block; min-height: 0; padding: 0 18px 76px; }
    .dm .rsvp-art { position: relative; display: block; width: calc(100% + 36px); height: auto; margin: 0 -18px 70px; left: 0; top: auto; transform: none; -webkit-mask-image: linear-gradient(to bottom, #000 80%, transparent); mask-image: linear-gradient(to bottom, #000 80%, transparent); }
    .dm .rsvp-card { margin: 0 auto; padding: 42px 22px 32px; }
  }

  .dm .gallery-tile { overflow: hidden; border-radius: 16px; }

  /* registry, over the candlelit table */
  .dm .registry-wrap { position: relative; width: 100%; min-height: 400px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 70px 20px; }
  .dm .registry-overlay { background: var(--dm-cream); padding: 50px 50px 42px; text-align: center; max-width: 520px; border-radius: 24px; box-shadow: 0 0 0 4px var(--dm-teal), 0 0 0 8px var(--dm-golden), 0 30px 60px -24px rgba(0,0,0,0.6); }
  @media (max-width: 640px) { .dm .registry-overlay { padding: 42px 24px 34px; } }
  .dm .registry-title { font-family: var(--dm-font-display); font-size: 44px; color: var(--dm-hot-pink); margin: 0 0 10px; font-weight: 400; line-height: 1; }
  .dm .registry-description { font-size: 15px; color: var(--dm-plum); margin: 0 auto 24px; line-height: 1.7; max-width: 400px; }
  .dm .registry-button { display: inline-block; padding: 15px 32px; border-radius: 999px; background: var(--dm-plum); color: var(--dm-cream); text-decoration: none; font-family: var(--dm-font-sans); font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
  .dm .registry-button:hover { background: var(--dm-magenta); }

  /* songs */
  .dm .song-section { background: radial-gradient(ellipse at top, ${AUBERGINE} 0%, ${PLUM} 70%); padding: 104px 28px; text-align: center; }
  .dm .song-section .song-list { border-top: 3px dotted rgba(246,146,34,0.6); max-width: 540px; margin: 0 auto; }
  .dm .song-section .song-row { border-bottom: 3px dotted rgba(246,146,34,0.3); padding: 10px 0; }
  .dm .song-section .song-row .title { color: var(--dm-cream); }
  .dm .song-section .song-row .artist { color: var(--dm-golden); }

  /* share */
  .dm .share-band { padding: 96px 24px; background: linear-gradient(135deg, ${MAGENTA} 0%, ${HOT_PINK} 100%); text-align: center; }
  .dm .share-band .eyebrow { color: var(--dm-golden); }
  .dm .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .dm .share-hashtag { font-family: var(--dm-font-display); font-size: clamp(40px, 6vw, 64px); color: var(--dm-cream); margin: 0 0 26px; font-weight: 400; overflow-wrap: anywhere; text-shadow: 0 3px 0 rgba(0,0,0,0.25); }
  .dm .share-band .btn-outline { background: transparent; color: var(--dm-cream); border-color: var(--dm-cream); }
  .dm .share-band .btn-outline:hover { background: var(--dm-cream); color: var(--dm-magenta); }

  /* footer: plum, petals falling, a skull swaying under the papel picado */
  .dm .footer { position: relative; padding: 0 24px 64px; background: var(--dm-plum); text-align: center; overflow: hidden; }
  .dm .footer .dm-picado { margin: 0 -24px; }
  .dm .footer-inner { position: relative; z-index: 2; padding-top: 50px; }
  .dm .footer p { font-size: 15px; color: rgba(238,224,181,0.9); margin: 0 0 4px; }
  .dm .footer-skull { display: block; width: 110px; margin: 0 auto 20px; transform-origin: 50% 10%; animation: dm-dance 3.4s ease-in-out infinite; filter: drop-shadow(0 10px 12px rgba(0,0,0,0.4)); }
  .dm .footer-signoff { font-family: var(--dm-font-display); font-size: clamp(36px, 5.6vw, 54px) !important; font-weight: 400; color: var(--dm-marigold) !important; margin: 28px 0 0 !important; text-shadow: 0 3px 0 rgba(0,0,0,0.3); }
  .dm .footer-credit { font-size: 11px; letter-spacing: 1px; color: rgba(238,224,181,0.5) !important; margin-top: 28px !important; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'The celebration',
    ourStoryLabel: 'Remembering with joy',
    howWeGotHere: 'A night to honour those we love',
    theDetails: 'The details',
    dateAndLocation: 'Date & location',
    ceremony: 'The celebration',
    reception: 'Location',
    theSchedule: 'The evening',
    eventProgram: 'Programa',
    kindlyRespond: 'Will you join us?',
    memoriesSoFar: 'Recuerdos',
    ourMoments: 'Colourful memories',
    registry: 'The ofrenda',
    viewRegistry: 'See the details',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'Día de los Muertos',
    todayIsTheDay: '¡Hoy celebramos!',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'A memory to share, a name for the ofrenda…',
    buildOurPlaylist: 'La música',
    withLove: 'Con cariño,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La fête',
    ourStoryLabel: 'Se souvenir avec joie',
    howWeGotHere: 'Une nuit pour honorer ceux que nous aimons',
    theDetails: 'Les détails',
    dateAndLocation: 'Date et lieu',
    ceremony: 'La fête',
    reception: 'Lieu',
    theSchedule: 'La soirée',
    eventProgram: 'Programme',
    kindlyRespond: 'Serez-vous des nôtres ?',
    memoriesSoFar: 'Souvenirs',
    ourMoments: 'Souvenirs en couleurs',
    registry: 'L’ofrenda',
    viewRegistry: 'Voir les détails',
    countingDown: 'Compte à rebours jusqu’au',
    untilWeSayIDo: 'Día de los Muertos',
    todayIsTheDay: 'C’est aujourd’hui la fête !',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Un souvenir à partager, un nom pour l’ofrenda…',
    buildOurPlaylist: 'La musique',
    withLove: 'Avec tendresse,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La celebración',
    ourStoryLabel: 'Recordar con alegría',
    howWeGotHere: 'Una noche para honrar a quienes amamos',
    theDetails: 'Los detalles',
    dateAndLocation: 'Fecha y lugar',
    ceremony: 'La celebración',
    reception: 'Lugar',
    theSchedule: 'La noche',
    eventProgram: 'Programa',
    kindlyRespond: '¿Nos acompañas?',
    memoriesSoFar: 'Recuerdos',
    ourMoments: 'Recuerdos de colores',
    registry: 'La ofrenda',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Cuenta regresiva para el',
    untilWeSayIDo: 'Día de los Muertos',
    todayIsTheDay: '¡Hoy celebramos!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Un recuerdo para compartir, un nombre para la ofrenda…',
    buildOurPlaylist: 'La música',
    withLove: 'Con cariño,',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: 'Celebrate with us', fr: 'Célébrez avec nous', es: 'Celebra con nosotros' };

export default function DiaDeLosMuertos({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['dia-de-los-muertos'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--dm-font-sans)', fontSize: 17, lineHeight: 1.85, color: 'var(--dm-cream)' };

  return (
    <div className="dm">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sancreek&family=Nunito:wght@400;600;700;800&display=swap" />
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

      <PapelPicado />

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-glow section-center">
            <PetalFall />
            <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <FlowerRule />
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
        <div className="countdown-shell" style={{ backgroundImage: `url(${IMG}/countdown.jpeg)` }}>
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

      <SkullParade />

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <Reveal>
          <div className="section section-center on-dark">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <FlowerRule />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 800, color: PLUM }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p style={{ marginTop: 10 }}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: HOT_PINK, fontWeight: 800, textDecoration: 'none' }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <FlowerRule />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: PLUM }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-glow section-center">
            <div className="wrap">
              <FlowerRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-cream section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow on-light" fallback={t.theSchedule} />
              <FlowerRule />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title on-light" fallback={t.eventProgram} />
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

      <PapelPicado />

      {/* RSVP — the sugar-skull artwork beside the reply card */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rsvp-art" src={`${IMG}/rsvp.jpeg`} alt="" />
          <Reveal style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480 }}>
            <div className="rsvp-card">
              <div className="dm-peek-wrap" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="dm-peek" src={SKULL} alt="" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <FlowerRule />
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
          <img className="rsvp-art" src={`${IMG}/rsvp.jpeg`} alt="" />
          <Reveal style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480 }}>
            <div className="rsvp-card">
              <div className="dm-peek-wrap" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="dm-peek" src={SKULL} alt="" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
                <FlowerRule />
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
          <img className="rsvp-art" src={`${IMG}/rsvp.jpeg`} alt="" />
          <Reveal style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480 }}>
            <div className="rsvp-card">
              <div className="dm-peek-wrap" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="dm-peek" src={SKULL} alt="" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <FlowerRule />
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
        <div className="section section-glow section-center">
          <div className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <FlowerRule />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* REGISTRY (the ofrenda) */}
      {(registryDescription || registryButtonLink) && (
        <Reveal>
          {/* Same magenta-to-pink gradient as the Tag your posts band; an uploaded image replaces it. */}
          <div className="registry-wrap" style={registryImage ? { backgroundImage: `url(${registryImage})` } : { background: `linear-gradient(135deg, ${MAGENTA} 0%, ${HOT_PINK} 100%)` }}>
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
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <FlowerRule />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 18, background: CREAM, border: `3px solid ${MARIGOLD}` }} textStyle={{ color: PLUM }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-center on-dark">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <FlowerRule />
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
              <FlowerRule />
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
        <PapelPicado />
        <PetalFall />
        <div className="footer-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="footer-skull" src={SKULL} alt="" />
          <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow" style={{ marginBottom: 10 }} fallback={t.questions} />
          <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
          {editSlots?.footerContact ?? (
            <>
              {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
              {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: GOLDEN, textDecoration: 'none' }}>{userEmail}</a></p>}
              {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: GOLDEN, textDecoration: 'none' }}>{userPhone}</a></p>}
            </>
          )}
          <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
          <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
        </div>
      </footer>
    </div>
  );
}
