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
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

const IMG = '/images/themes/christmas-party';

// Exclusive to Christmas Party — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `xm-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// The cozy living-room palette: forest-green walls and gift wrap, bauble
// reds, warm golden light, honey wood and kraft paper.
const FOREST = '#1A2618';
const GLOW_WALL = '#32391A';
const WRAP_GREEN = '#2A462F';
const WRAP_LIGHT = '#416247';
const SATIN = '#1D2C25';
const BAUBLE_RED = '#B3251B';
const WRAP_RED = '#A21704';
const RIBBON_RED = '#7E0B0E';
const OXBLOOD = '#7B140B';
const BULB = '#FEFFF1';
const GLOW = '#F8C166';
const AMBER = '#AD6F1A';
const GOLD = '#BF9563';
const SHINE = '#FADFB2';
const HONEY = '#C18D51';
const REINDEER = '#875425';
const KRAFT = '#866347';
const MAUVE = '#724234';
const STAR_BOX = '#202018';

// ─── SVG decorations (animated in CSS; all motion stops for reduced-motion users) ───

// A six-armed snowflake.
function Snowflake({ size = 14, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a} 12 12)`} stroke={BULB} strokeWidth="1.4" strokeLinecap="round">
          <line x1="12" y1="1.5" x2="12" y2="22.5" />
          <line x1="12" y1="5" x2="9.5" y2="2.8" /><line x1="12" y1="5" x2="14.5" y2="2.8" />
          <line x1="12" y1="19" x2="9.5" y2="21.2" /><line x1="12" y1="19" x2="14.5" y2="21.2" />
        </g>
      ))}
    </svg>
  );
}

// Gentle snowfall: soft dots with a few real snowflakes among them.
const SNOW = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 3 + ((i * 7) % 5),
  duration: `${9 + ((i * 13) % 9)}s`,
  delay: `${-((i * 1.7) % 14).toFixed(1)}s`,
  drift: (i % 2 ? 1 : -1) * (10 + ((i * 11) % 30)),
  flake: i % 6 === 0,
}));

function Snowfall() {
  return (
    <div className="xm-snow" aria-hidden="true">
      {SNOW.map((s, i) =>
        s.flake ? (
          <Snowflake key={i} className="xm-flake" size={s.size * 3}
            style={{ left: s.left, animationDuration: s.duration, animationDelay: s.delay, ['--drift' as string]: `${s.drift}px` }} />
        ) : (
          <span key={i} className="xm-dot"
            style={{ left: s.left, width: s.size, height: s.size, animationDuration: s.duration, animationDelay: s.delay, ['--drift' as string]: `${s.drift}px` }} />
        ),
      )}
    </div>
  );
}

// A string of Christmas lights, twinkling — the divider between sections.
const BULB_COLORS = [BAUBLE_RED, GLOW, WRAP_LIGHT, SHINE, WRAP_RED, GOLD];
const SWAGS = 5;
const BULBS_PER_SWAG = 6;

function StringLights({ background = FOREST }: { background?: string }) {
  const total = SWAGS * BULBS_PER_SWAG;
  const wire = Array.from({ length: SWAGS }, (_, i) => {
    const x0 = (i * 1000) / SWAGS;
    const x1 = ((i + 1) * 1000) / SWAGS;
    return `${i === 0 ? `M${x0} 8` : ''} Q ${(x0 + x1) / 2} 44 ${x1} 8`;
  }).join(' ');
  return (
    <div className="xm-lights" aria-hidden="true" style={{ background }}>
      <svg className="xm-wire" viewBox="0 0 1000 60" preserveAspectRatio="none">
        <path d={wire} stroke={SATIN} strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: total }, (_, i) => {
        const frac = ((i + 0.5) / BULBS_PER_SWAG) % 1;
        const top = 8 + 36 * 4 * frac * (1 - frac) * 0.5; // follows the swag's curve
        const color = BULB_COLORS[i % BULB_COLORS.length];
        return (
          <span key={i} className="xm-bulb" style={{ left: `${((i + 0.5) / total) * 100}%`, top: `${top}px`, animationDelay: `${-(i % 7) * 0.45}s` }}>
            <svg width="12" height="22" viewBox="0 0 12 22" style={{ transform: `rotate(${(frac - 0.5) * 40}deg)` }}>
              <rect x="3.5" y="0" width="5" height="5" rx="1" fill={SATIN} />
              <path d="M6 4 C 11 7, 11 15, 6 21 C 1 15, 1 7, 6 4 Z" fill={color} />
              <ellipse cx="4.5" cy="10" rx="1.2" ry="2.6" fill={BULB} opacity="0.6" />
            </svg>
            <span className="xm-bulb-glow" style={{ background: color }} />
          </span>
        );
      })}
    </div>
  );
}

// A little Christmas tree with a twinkling star — the ornament above each section title.
function LittleTree() {
  return (
    <svg className="xm-tree" width="46" height="56" viewBox="0 0 46 56" aria-hidden="true">
      <path className="xm-tree-star" d="M23 1 L25.2 6.2 L30.8 6.6 L26.5 10.2 L27.9 15.6 L23 12.7 L18.1 15.6 L19.5 10.2 L15.2 6.6 L20.8 6.2 Z" fill={GLOW} />
      <path d="M23 12 L36 30 L10 30 Z" fill={WRAP_LIGHT} />
      <path d="M23 20 L40 42 L6 42 Z" fill={WRAP_GREEN} />
      <path d="M23 29 L43 52 L3 52 Z" fill={WRAP_LIGHT} />
      <rect x="20" y="51" width="6" height="5" rx="1" fill={REINDEER} />
      <circle cx="18" cy="27" r="1.8" fill={BAUBLE_RED} />
      <circle cx="28" cy="36" r="1.8" fill={GOLD} />
      <circle cx="16" cy="44" r="1.8" fill={GOLD} />
      <circle cx="31" cy="47" r="1.8" fill={BAUBLE_RED} />
      <circle cx="24" cy="40" r="1.4" fill={SHINE} />
    </svg>
  );
}

// Snow-covered hills with little pines — the top edge of the footer.
function SnowyHills() {
  const pines = [8, 14, 22, 70, 78, 91];
  return (
    <svg className="xm-hills" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 70 C 120 30, 260 40, 380 66 S 640 100, 780 60 S 940 36, 1000 52 V 120 H 0 Z" fill="#E9ECE4" opacity="0.5" />
      <path d="M0 88 C 160 56, 300 70, 460 86 S 760 108, 1000 78 V 120 H 0 Z" fill={BULB} />
      {pines.map((p) => (
        <g key={p} transform={`translate(${p * 10} ${p < 50 ? 58 : 50})`}>
          <path d="M0 0 L12 22 L-12 22 Z M0 12 L15 34 L-15 34 Z" fill={WRAP_GREEN} />
          <path d="M-4 6 L4 6 L0 0 Z" fill={BULB} />
        </g>
      ))}
    </svg>
  );
}

function Moon() {
  return (
    <svg className="xm-moon" width="56" height="56" viewBox="0 0 54 54" aria-hidden="true">
      <path d="M36 4 A 24 24 0 1 0 50 38 A 19 19 0 1 1 36 4 Z" fill={SHINE} />
    </svg>
  );
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#2C3138', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&display=swap" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['christmas-party']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 22px 30px' }}>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: GLOW, fontWeight: 800, margin: '0 0 4px' }}>You&apos;re invited</p>
        <h2 style={{ fontFamily: "'Mountains of Christmas', cursive", fontWeight: 700, fontSize: 'clamp(30px, 5.6vw, 44px)', color: BULB, margin: '0 0 4px', lineHeight: 1, textShadow: `0 0 18px rgba(248,193,102,0.55)` }}>{heading || 'Christmas Party'}</h2>
        {date && <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: SHINE, fontWeight: 700, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .xm {
    --xm-forest: ${FOREST};
    --xm-glow-wall: ${GLOW_WALL};
    --xm-wrap-green: ${WRAP_GREEN};
    --xm-wrap-light: ${WRAP_LIGHT};
    --xm-satin: ${SATIN};
    --xm-red: ${BAUBLE_RED};
    --xm-wrap-red: ${WRAP_RED};
    --xm-ribbon: ${RIBBON_RED};
    --xm-oxblood: ${OXBLOOD};
    --xm-bulb: ${BULB};
    --xm-glow: ${GLOW};
    --xm-amber: ${AMBER};
    --xm-gold: ${GOLD};
    --xm-shine: ${SHINE};
    --xm-honey: ${HONEY};
    --xm-reindeer: ${REINDEER};
    --xm-kraft: ${KRAFT};
    --xm-mauve: ${MAUVE};
    --xm-star-box: ${STAR_BOX};
    --xm-font-display: 'Mountains of Christmas', 'Georgia', cursive;
    --xm-font-sans: 'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .xm * { box-sizing: border-box; }
  .xm { margin: 0; background: var(--xm-forest); color: var(--xm-bulb); font-family: var(--xm-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .xm img { max-width: 100%; }

  /* ─ animation ─ */
  @keyframes xm-fall { 0% { transform: translate(0, -10vh); opacity: 0; } 10% { opacity: 0.9; } 100% { transform: translate(var(--drift, 20px), 110vh); opacity: 0.2; } }
  @keyframes xm-spin { to { rotate: 360deg; } }
  @keyframes xm-twinkle { 0%, 100% { opacity: 1; } 45% { opacity: 0.45; } 55% { opacity: 0.95; } }
  @keyframes xm-glow { 0%, 100% { opacity: 0.55; transform: scale(1); } 45% { opacity: 0.15; transform: scale(0.7); } }
  @keyframes xm-star { 0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 2px ${GLOW}); } 50% { transform: scale(1.18) rotate(8deg); filter: drop-shadow(0 0 7px ${GLOW}); } }
  @keyframes xm-swing { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
  @keyframes xm-sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
  @keyframes xm-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .xm .xm-snow, .xm .xm-bulb-glow { display: none; }
    .xm .xm-bulb, .xm .xm-tree-star, .xm .countdown-block, .xm .xm-tree, .xm .hero-content > *, .xm .details-card { animation: none !important; }
  }

  .xm .xm-snow { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
  .xm .xm-dot { position: absolute; top: 0; border-radius: 50%; background: ${BULB}; box-shadow: 0 0 6px rgba(254,255,241,0.8); animation: xm-fall linear infinite; }
  .xm .xm-flake { position: absolute; top: 0; opacity: 0.9; animation: xm-fall linear infinite, xm-spin 6s linear infinite; }

  .xm .xm-lights { position: relative; height: 62px; overflow: hidden; }
  .xm .xm-wire { position: absolute; left: 0; top: 0; width: 100%; height: 60px; }
  .xm .xm-bulb { position: absolute; width: 12px; height: 22px; margin-left: -6px; animation: xm-twinkle 2.4s ease-in-out infinite; }
  .xm .xm-bulb svg { position: relative; z-index: 1; display: block; transform-origin: 50% 0; }
  .xm .xm-bulb-glow { position: absolute; left: 50%; top: 14px; width: 26px; height: 26px; margin: -13px 0 0 -13px; border-radius: 50%; filter: blur(8px); animation: xm-glow 2.4s ease-in-out infinite; animation-delay: inherit; }

  .xm .xm-tree { display: block; margin: 0 auto 10px; transform-origin: 50% 100%; animation: xm-sway 4s ease-in-out infinite; }
  .xm .xm-tree-star { transform-box: fill-box; transform-origin: center; animation: xm-star 2.2s ease-in-out infinite; }

  .xm .eyebrow { font-family: var(--xm-font-sans); font-size: 12px; font-weight: 800; letter-spacing: 3.5px; text-transform: uppercase; color: var(--xm-glow); margin: 0 0 10px; }
  .xm .eyebrow.on-light { color: var(--xm-red); }
  .xm .section-title { font-family: var(--xm-font-display); font-size: clamp(42px, 5.6vw, 66px); font-weight: 700; color: var(--xm-bulb); margin: 0 0 18px; line-height: 1.05; text-shadow: 0 0 22px rgba(248,193,102,0.35); }
  .xm .section-title.on-light { color: var(--xm-wrap-green); text-shadow: none; }

  .xm .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .xm .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .xm .section { position: relative; padding: 96px 28px; background: var(--xm-forest); overflow: hidden; }
  .xm .section-green { background: var(--xm-wrap-green); }
  .xm .section-cozy { background: radial-gradient(ellipse at top, ${GLOW_WALL} 0%, ${FOREST} 70%); }
  .xm .section-cream { background: linear-gradient(to bottom, #FFF8EA 0%, ${SHINE} 100%); color: var(--xm-forest); }
  .xm .section-center { text-align: center; }
  @media (max-width: 640px) { .xm .section { padding: 70px 20px; } }

  .xm .btn { font-family: var(--xm-font-sans); font-size: 14px; font-weight: 800; letter-spacing: 1px; padding: 15px 32px; border-radius: 999px; border: 2px solid var(--xm-red); background: var(--xm-red); color: var(--xm-bulb); cursor: pointer; transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; text-decoration: none; display: inline-block; line-height: 1; box-shadow: 0 6px 18px -6px rgba(179,37,27,0.7); }
  .xm .btn:hover { background: var(--xm-wrap-red); border-color: var(--xm-wrap-red); transform: translateY(-2px); }
  .xm .btn-outline { background: rgba(26,38,24,0.35); color: var(--xm-shine); border-color: var(--xm-gold); box-shadow: none; }
  .xm .btn-outline:hover { background: var(--xm-gold); border-color: var(--xm-gold); color: var(--xm-forest); }

  .xm input, .xm textarea, .xm select { font-family: var(--xm-font-sans); font-size: 15px; padding: 12px 15px; border-radius: 12px; border: 1.5px solid #E6D3B1; outline: none; background: #FFFDF6; color: var(--xm-forest); width: 100%; display: block; transition: border-color 0.2s ease; }
  .xm input:focus, .xm textarea:focus, .xm select:focus { border-color: var(--xm-red); }
  .xm label.field-label { font-family: var(--xm-font-sans); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--xm-red); display: block; margin-bottom: 6px; font-weight: 800; }
  .xm .radio-label, .xm .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--xm-forest); cursor: pointer; }
  .xm .radio-label input, .xm .check-label input { width: auto; border: none; padding: 0; accent-color: var(--xm-red); }
  .xm .check-hint { font-family: var(--xm-font-sans); font-size: 12px; color: var(--xm-mauve); margin: 4px 0 0; }
  .xm .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .xm .rsvp-error { color: var(--xm-wrap-red); font-size: 13px; margin: 0; font-family: var(--xm-font-sans); }
  .xm .rsvp-success { text-align: center; padding: 18px 0; }
  .xm .rsvp-headline { font-family: var(--xm-font-display); font-size: 40px; color: var(--xm-red); margin: 0 0 8px; font-weight: 700; }
  .xm .rsvp-sub { font-size: 14px; color: var(--xm-forest); margin: 0; }
  .xm .rsvp-form { display: flex; flex-direction: column; gap: 17px; }

  /* hero: the garland runs along the top, so the invitation sits below it */
  .xm .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 30vh 24px 90px; background: #2C3138; overflow: hidden; }
  .xm .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; z-index: 0; }
  .xm .hero-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 65%, rgba(26,38,24,0.35) 0%, rgba(26,38,24,0) 60%), linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(26,38,24,0.55) 100%); z-index: 0; pointer-events: none; }
  .xm .hero-content { position: relative; z-index: 2; max-width: 780px; }
  .xm .hero-eyebrow { animation: xm-in 1s ease both; display: inline-block; font-family: var(--xm-font-sans); font-size: 13px; letter-spacing: 4px; text-transform: uppercase; font-weight: 800; color: var(--xm-forest); background: var(--xm-glow); border-radius: 999px; padding: 8px 22px; margin: 0 0 18px; box-shadow: 0 0 24px rgba(248,193,102,0.45); }
  .xm .hero-name { animation: xm-in 1s ease 0.15s both; font-family: var(--xm-font-display); font-size: clamp(60px, 10vw, 128px); font-weight: 700; color: var(--xm-bulb); margin: 0 0 14px; line-height: 0.95; text-shadow: 0 0 30px rgba(248,193,102,0.55), 0 4px 14px rgba(0,0,0,0.4); }
  .xm .hero-date { animation: xm-in 1s ease 0.3s both; font-family: var(--xm-font-sans); font-size: 15px; letter-spacing: 3px; text-transform: uppercase; color: var(--xm-shine); font-weight: 800; margin: 0 0 30px; }
  .xm .hero-actions { animation: xm-in 1s ease 0.45s both; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  @media (max-width: 720px) { .xm .hero { padding: 34vh 20px 80px; } }

  /* countdown: bokeh lights, with the numbers in swinging baubles */
  .xm .countdown-shell { position: relative; background: var(--xm-forest); background-size: cover; background-position: center; overflow: hidden; }
  .xm .countdown-shell::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(26,38,24,0.82) 0%, rgba(26,38,24,0.6) 50%, rgba(26,38,24,0.88) 100%); }
  .xm .countdown-wrap { position: relative; z-index: 1; padding: 96px 24px 110px; text-align: center; }
  .xm .countdown-heading { font-family: var(--xm-font-display); font-size: clamp(44px, 6vw, 70px); color: var(--xm-bulb); margin: 0 0 30px; font-weight: 700; text-shadow: 0 0 26px rgba(248,193,102,0.5); }
  .xm .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 3vw, 30px); padding-top: 44px; }
  .xm .countdown-block { position: relative; width: clamp(76px, 15vw, 116px); height: clamp(76px, 15vw, 116px); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transform-origin: 50% -44px; animation: xm-swing 3.4s ease-in-out infinite;
    background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 22%), radial-gradient(circle at 50% 50%, ${BAUBLE_RED} 0%, ${OXBLOOD} 100%); box-shadow: 0 10px 24px -8px rgba(0,0,0,0.6), inset -6px -8px 16px rgba(0,0,0,0.25); }
  .xm .countdown-block:nth-child(2) { animation-delay: -0.8s; background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 22%), radial-gradient(circle at 50% 50%, ${GOLD} 0%, ${AMBER} 100%); }
  .xm .countdown-block:nth-child(3) { animation-delay: -1.6s; background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 22%), radial-gradient(circle at 50% 50%, ${WRAP_LIGHT} 0%, ${WRAP_GREEN} 100%); }
  .xm .countdown-block:nth-child(4) { animation-delay: -2.4s; }
  .xm .countdown-block::before { content: ''; position: absolute; top: -9px; left: 50%; width: 22px; height: 11px; margin-left: -11px; border-radius: 3px 3px 2px 2px; background: linear-gradient(to bottom, ${SHINE}, ${GOLD}); }
  .xm .countdown-block::after { content: ''; position: absolute; top: -44px; left: 50%; width: 1.5px; height: 35px; margin-left: -0.75px; background: ${SHINE}; opacity: 0.7; }
  .xm .countdown-value { font-family: var(--xm-font-sans); font-size: clamp(24px, 4.4vw, 38px); color: var(--xm-bulb); font-weight: 800; line-height: 1; text-shadow: 0 1px 4px rgba(0,0,0,0.35); }
  .xm .countdown-label { font-family: var(--xm-font-sans); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--xm-bulb); margin-top: 4px; font-weight: 800; opacity: 0.9; }

  /* details: kraft-paper gift tags tied with twine */
  .xm .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; margin-top: 40px; }
  @media (max-width: 720px) { .xm .details-grid { grid-template-columns: 1fr; } }
  .xm .details-card { position: relative; background: repeating-linear-gradient(105deg, rgba(255,255,255,0.03) 0 2px, rgba(0,0,0,0.02) 2px 5px), ${KRAFT}; color: var(--xm-bulb); padding: 52px 30px 34px; border-radius: 14px; box-shadow: 0 18px 34px -16px rgba(0,0,0,0.6); transform-origin: 50% -30px; animation: xm-sway 6s ease-in-out infinite; }
  .xm .details-card:nth-child(2) { animation-delay: -3s; }
  .xm .details-card::before { content: ''; position: absolute; top: 16px; left: 50%; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: var(--xm-wrap-green); box-shadow: 0 0 0 3px ${SHINE}; }
  .xm .details-card::after { content: ''; position: absolute; top: -30px; left: 50%; width: 2px; height: 50px; margin-left: -1px; background: repeating-linear-gradient(to bottom, ${BULB} 0 4px, ${BAUBLE_RED} 4px 8px); }
  .xm .details-card .label { font-family: var(--xm-font-sans); font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--xm-shine); margin: 0 0 12px; font-weight: 800; }
  .xm .details-card .time { font-family: var(--xm-font-display); font-size: 40px; line-height: 1.05; color: var(--xm-bulb); font-weight: 700; margin-bottom: 8px; }
  .xm .details-card p { font-size: 15px; color: rgba(254,255,241,0.92); margin: 0 0 4px; }
  .xm .map-frame { overflow: hidden; min-height: 260px; border-radius: 14px; border: 6px solid ${KRAFT}; box-shadow: 0 18px 34px -16px rgba(0,0,0,0.6); }
  .xm .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 260px; }
  .xm .directions-link { text-align: center; margin-top: 26px; }
  .xm .directions-link a { font-family: var(--xm-font-sans); font-size: 14px; font-weight: 800; color: var(--xm-glow); text-decoration: none; }

  /* program, on a warm cream "card" section */
  .xm .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .xm .schedule-day:last-child { margin-bottom: 0; }
  .xm .schedule-day-title { font-family: var(--xm-font-display); font-size: 32px; color: var(--xm-red); margin: 0 0 12px; font-weight: 700; }
  .xm .schedule-list { border-top: 2px dashed var(--xm-gold); text-align: left; }
  .xm .schedule-row { display: flex; gap: 22px; padding: 16px 0; border-bottom: 2px dashed rgba(191,149,99,0.5); align-items: baseline; }
  .xm .schedule-time { font-family: var(--xm-font-sans); font-size: 15px; font-weight: 800; color: var(--xm-red); min-width: 110px; flex-shrink: 0; }
  .xm .schedule-info .name { font-family: var(--xm-font-display); font-size: 26px; font-weight: 700; color: var(--xm-wrap-green); margin: 0 0 2px; line-height: 1.1; }
  .xm .schedule-info .loc { font-size: 14px; color: var(--xm-mauve); margin: 0; }

  /* rsvp: the lit tree and reindeer, the card on the green wall */
  .xm .rsvp-section { position: relative; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: center; min-height: 820px; background: var(--xm-forest) center left / cover no-repeat; padding: 90px 6vw; overflow: hidden; }
  .xm .rsvp-section::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, rgba(26,38,24,0) 40%, rgba(26,38,24,0.45) 100%); pointer-events: none; }
  .xm .rsvp-panel { grid-column: 2; position: relative; z-index: 1; }
  .xm .rsvp-card { position: relative; max-width: 470px; margin: 0 auto; background: #FFFDF6; padding: 46px 36px 38px; border-radius: 20px; text-align: left; box-shadow: 0 0 0 6px ${BAUBLE_RED}, 0 0 0 9px ${SHINE}, 0 30px 60px -20px rgba(0,0,0,0.65); }
  .xm .rsvp-card .section-title { color: var(--xm-wrap-green); text-shadow: none; }
  .xm .rsvp-card .eyebrow { color: var(--xm-red); }
  .xm .rsvp-bow { position: absolute; top: -34px; left: 50%; margin-left: -40px; }
  @media (max-width: 900px) {
    .xm .rsvp-section { display: block; min-height: 0; padding: 0 18px 76px; background-image: none !important; }
    .xm .rsvp-section::before { display: none; }
    .xm .rsvp-photo { display: block; width: calc(100% + 36px); max-width: none; margin: 0 -18px 60px;
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%); mask-image: linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%); }
    .xm .rsvp-card { padding: 42px 22px 32px; }
  }
  @media (min-width: 901px) { .xm .rsvp-photo { display: none; } }

  .xm .gallery-tile { overflow: hidden; border-radius: 14px; }

  /* registry, over the red gifts */
  .xm .registry-wrap { position: relative; width: 100%; min-height: 400px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; padding: 70px 20px; }
  .xm .registry-overlay { position: relative; background: #FFFDF6; padding: 54px 52px 44px; text-align: center; max-width: 520px; border-radius: 20px; box-shadow: 0 0 0 6px ${WRAP_GREEN}, 0 0 0 9px ${SHINE}, 0 30px 60px -24px rgba(0,0,0,0.55); }
  @media (max-width: 640px) { .xm .registry-overlay { padding: 46px 24px 34px; } }
  .xm .registry-title { font-family: var(--xm-font-display); font-size: 48px; color: var(--xm-red); margin: 0 0 10px; font-weight: 700; line-height: 1; }
  .xm .registry-description { font-size: 15px; color: var(--xm-forest); margin: 0 auto 24px; line-height: 1.7; max-width: 400px; }
  .xm .registry-button { display: inline-block; padding: 15px 32px; border-radius: 999px; background: var(--xm-red); color: var(--xm-bulb); text-decoration: none; font-family: var(--xm-font-sans); font-size: 14px; font-weight: 800; }
  .xm .registry-button:hover { background: var(--xm-wrap-red); }

  /* songs */
  .xm .song-section { background: radial-gradient(ellipse at top, ${GLOW_WALL} 0%, ${FOREST} 70%); padding: 96px 28px; text-align: center; }
  .xm .song-section .song-list { border-top: 2px dashed rgba(191,149,99,0.6); max-width: 540px; margin: 0 auto; }
  .xm .song-section .song-row { border-bottom: 2px dashed rgba(191,149,99,0.3); padding: 10px 0; }
  .xm .song-section .song-row .title { color: var(--xm-bulb); }
  .xm .song-section .song-row .artist { color: var(--xm-shine); }

  /* share */
  .xm .share-band { padding: 90px 24px; background: radial-gradient(ellipse at center, ${BAUBLE_RED} 0%, ${RIBBON_RED} 100%); text-align: center; }
  .xm .share-band .eyebrow { color: var(--xm-shine); }
  .xm .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .xm .share-hashtag { font-family: var(--xm-font-display); font-size: clamp(42px, 6vw, 64px); color: var(--xm-bulb); margin: 0 0 26px; font-weight: 700; overflow-wrap: anywhere; text-shadow: 0 0 22px rgba(248,193,102,0.4); }
  .xm .share-band .btn-outline { background: transparent; color: var(--xm-bulb); border-color: var(--xm-shine); }
  .xm .share-band .btn-outline:hover { background: var(--xm-bulb); color: var(--xm-red); }

  /* footer: snowy hills under a moonlit sky */
  .xm .footer { position: relative; padding: 60px 24px 0; background: linear-gradient(to bottom, ${FOREST} 0%, #22331F 100%); text-align: center; overflow: hidden; }
  .xm .footer-inner { position: relative; z-index: 2; padding-bottom: 20px; }
  .xm .footer p { font-size: 15px; color: rgba(254,255,241,0.88); margin: 0 0 4px; }
  .xm .xm-moon { display: block; margin: 0 auto 14px; filter: drop-shadow(0 0 14px rgba(250,223,178,0.6)); }
  .xm .footer-signoff { font-family: var(--xm-font-display); font-size: clamp(38px, 6vw, 56px) !important; font-weight: 700; color: var(--xm-glow) !important; margin: 26px 0 0 !important; text-shadow: 0 0 22px rgba(248,193,102,0.4); }
  .xm .xm-hills { position: relative; z-index: 2; display: block; width: calc(100% + 48px); max-width: none; height: 120px; margin: 10px -24px 0; }
  .xm .footer-credit { position: relative; z-index: 2; font-size: 11px; letter-spacing: 1px; color: ${WRAP_GREEN} !important; background: ${BULB}; margin: 0 -24px !important; padding: 0 24px 26px; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'The party',
    ourStoryLabel: "'Tis the season",
    howWeGotHere: 'Join us for a cozy celebration',
    theDetails: 'The details',
    dateAndLocation: 'Date & location',
    ceremony: 'Party time',
    reception: 'Location',
    theSchedule: "What's on",
    eventProgram: 'Party program',
    kindlyRespond: 'Will you join us?',
    memoriesSoFar: 'Merry moments',
    ourMoments: 'Festive memories',
    registry: 'Gift exchange',
    viewRegistry: 'See the details',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'The holiday party',
    todayIsTheDay: "It's party time!",
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, a song request, holiday wishes…',
    buildOurPlaylist: 'Holiday tunes',
    withLove: 'Merry Christmas,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La fête',
    ourStoryLabel: "C'est la saison",
    howWeGotHere: 'Joignez-vous à une fête chaleureuse',
    theDetails: 'Les détails',
    dateAndLocation: 'Date et lieu',
    ceremony: 'Heure de la fête',
    reception: 'Lieu',
    theSchedule: 'Au programme',
    eventProgram: 'Programme de la fête',
    kindlyRespond: 'Serez-vous des nôtres ?',
    memoriesSoFar: 'Joyeux moments',
    ourMoments: 'Souvenirs des fêtes',
    registry: 'Échange de cadeaux',
    viewRegistry: 'Voir les détails',
    countingDown: 'Compte à rebours jusqu’à',
    untilWeSayIDo: 'La fête de Noël',
    todayIsTheDay: "C'est l'heure de la fête !",
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Restrictions alimentaires, une chanson, vos vœux…',
    buildOurPlaylist: 'Chansons des fêtes',
    withLove: 'Joyeux Noël,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La fiesta',
    ourStoryLabel: 'Es temporada',
    howWeGotHere: 'Acompáñanos en una celebración acogedora',
    theDetails: 'Los detalles',
    dateAndLocation: 'Fecha y lugar',
    ceremony: 'Hora de la fiesta',
    reception: 'Lugar',
    theSchedule: 'Qué habrá',
    eventProgram: 'Programa de la fiesta',
    kindlyRespond: '¿Nos acompañas?',
    memoriesSoFar: 'Momentos felices',
    ourMoments: 'Recuerdos festivos',
    registry: 'Intercambio de regalos',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Cuenta regresiva para',
    untilWeSayIDo: 'La fiesta navideña',
    todayIsTheDay: '¡Hoy es la fiesta!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Restricciones alimentarias, una canción, buenos deseos…',
    buildOurPlaylist: 'Canciones navideñas',
    withLove: '¡Feliz Navidad!',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };

export default function ChristmasParty({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['christmas-party'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--xm-font-sans)', fontSize: 17, lineHeight: 1.85, color: 'rgba(254,255,241,0.88)' };

  return (
    <div className="xm">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap" />
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
        <Snowfall />
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

      <StringLights />

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-cozy section-center">
            <div className="wrap">
              <LittleTree />
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
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
        <div className="countdown-shell" style={{ backgroundImage: `url(${IMG}/bokeh.jpeg)` }}>
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
          <div className="section section-green section-center">
            <div className="wrap-wide">
              <LittleTree />
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 800, color: SHINE }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p style={{ marginTop: 10 }}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: GLOW, fontWeight: 800, textDecoration: 'none' }}>{t.joinOnline}</a></p>
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

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-center">
            <div className="wrap">
              <LittleTree />
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
              <LittleTree />
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow on-light" fallback={t.theSchedule} />
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

      <StringLights />

      {/* RSVP — the card on the green wall beside the lit tree */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section" style={{ backgroundImage: `url(${IMG}/rsvp.jpeg)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rsvp-photo" src={`${IMG}/rsvp.jpeg`} alt="" />
          <Reveal className="rsvp-panel">
            <div className="rsvp-card">
              <svg className="rsvp-bow" width="80" height="44" viewBox="0 0 80 44" aria-hidden="true">
                <path d="M40 22 C 26 4, 4 6, 8 20 C 10 30, 28 30, 40 22 Z" fill={BAUBLE_RED} />
                <path d="M40 22 C 54 4, 76 6, 72 20 C 70 30, 52 30, 40 22 Z" fill={BAUBLE_RED} />
                <path d="M36 24 L28 44 L36 40 L40 26 Z M44 24 L52 44 L44 40 L40 26 Z" fill={RIBBON_RED} />
                <ellipse cx="40" cy="22" rx="7" ry="6" fill={OXBLOOD} />
                <path d="M16 16 C 20 12, 28 14, 32 18" stroke={SHINE} strokeWidth="1.4" fill="none" opacity="0.6" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </div>
          </Reveal>
        </div>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <LittleTree />
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* REGISTRY (gift exchange) */}
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
          <div className="section section-green section-center">
            <div className="wrap-wide">
              <LittleTree />
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 16, background: '#FFFDF6', border: `2px solid ${GOLD}` }} textStyle={{ color: FOREST }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-green section-center">
            <div className="wrap">
              <LittleTree />
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
              <LittleTree />
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
        <Snowfall />
        <div className="footer-inner">
          <Moon />
          <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow" style={{ marginBottom: 10 }} fallback={t.questions} />
          <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
          {editSlots?.footerContact ?? (
            <>
              {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
              {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: GLOW, textDecoration: 'none' }}>{userEmail}</a></p>}
              {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: GLOW, textDecoration: 'none' }}>{userPhone}</a></p>}
            </>
          )}
          <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        </div>
        <SnowyHills />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
