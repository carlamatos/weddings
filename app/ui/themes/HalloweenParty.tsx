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

const IMG = '/images/themes/halloween-party';
const HAND = `${IMG}/hand.webp`;

// Exclusive to Halloween Party — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `hw-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// Colours taken from the hero (charcoal paper, pumpkins, bone) and the
// witch's hand (green skin, blood-red claws).
const INK = '#121012';
const CHARCOAL = '#1F1D1E';
const STONE = '#2B2829';
const PUMPKIN = '#F28A22';
const EMBER = '#FEA132';
const WITCH = '#57C13B';
const BLOOD = '#B3162B';
const BONE = '#EDE4D3';
const HEX = '#6A3FA0';

// ─── SVG decorations ─────────────────────────────────────

// A bat: the wings flap (scaleY) while the whole bat flies across its path.
function Bat({ size = 46, color = '#0B0A0B' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size / 2} viewBox="0 0 64 32" aria-hidden="true" style={{ overflow: 'visible' }}>
      <path className="hw-wing" fill={color} d="M32 14 C 26 6, 16 4, 2 8 C 8 10, 10 14, 9 18 C 13 15, 17 16, 19 20 C 22 16, 26 16, 32 20 C 38 16, 42 16, 45 20 C 47 16, 51 15, 55 18 C 54 14, 56 10, 62 8 C 48 4, 38 6, 32 14 Z" />
      <ellipse cx="32" cy="16" rx="4" ry="6" fill={color} />
      <path d="M28.6 11 L29.6 5.5 L31.4 9.6 L32.6 9.6 L34.4 5.5 L35.4 11 Z" fill={color} />
      <circle cx="30.4" cy="13.2" r="0.9" fill={EMBER} />
      <circle cx="33.6" cy="13.2" r="0.9" fill={EMBER} />
    </svg>
  );
}

const BATS = [
  { top: '14%', size: 44, duration: '14s', delay: '-2s', bob: '1.6s' },
  { top: '26%', size: 30, duration: '19s', delay: '-9s', bob: '1.2s' },
  { top: '8%', size: 24, duration: '23s', delay: '-15s', bob: '1s' },
  { top: '40%', size: 36, duration: '17s', delay: '-6s', bob: '1.4s' },
  { top: '20%', size: 20, duration: '26s', delay: '-20s', bob: '0.9s' },
];

function BatFlight({ color, count = BATS.length, scale = 1 }: { color?: string; count?: number; scale?: number }) {
  return (
    <div className="hw-bats" aria-hidden="true">
      {BATS.slice(0, count).map((b, i) => (
        <span key={i} className="hw-bat" style={{ top: b.top, animationDuration: b.duration, animationDelay: b.delay }}>
          <span className="hw-bat-bob" style={{ animationDuration: b.bob }}>
            <Bat size={b.size * scale} color={color} />
          </span>
        </span>
      ))}
    </div>
  );
}

// A spider lowering itself on its thread, then climbing back up.
function Spider({ left, length = 160, delay = '0s', className }: { left: string; length?: number; delay?: string; className?: string }) {
  return (
    <div className={`hw-spider ${className ?? ''}`} style={{ left, ['--hw-thread' as string]: `${length}px`, animationDelay: delay }} aria-hidden="true">
      <span className="hw-thread" />
      <svg width="34" height="34" viewBox="0 0 40 40">
        <g stroke="#0B0A0B" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M16 18 C 10 12, 6 12, 2 16" /><path d="M16 21 C 9 18, 5 20, 2 24" />
          <path d="M16 24 C 10 24, 7 28, 5 33" /><path d="M17 26 C 13 30, 12 34, 12 38" />
          <path d="M24 18 C 30 12, 34 12, 38 16" /><path d="M24 21 C 31 18, 35 20, 38 24" />
          <path d="M24 24 C 30 24, 33 28, 35 33" /><path d="M23 26 C 27 30, 28 34, 28 38" />
        </g>
        <circle cx="20" cy="16" r="5" fill="#0B0A0B" />
        <ellipse cx="20" cy="25" rx="6.5" ry="7.5" fill="#0B0A0B" />
        <circle cx="18.2" cy="15.4" r="1.2" fill={BLOOD} />
        <circle cx="21.8" cy="15.4" r="1.2" fill={BLOOD} />
      </svg>
    </div>
  );
}

// A little ghost that floats and fades.
function Ghost({ size = 54, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden="true">
      <path d="M20 2 C 9 2, 4 11, 4 22 L4 44 L10 39 L16 44 L22 39 L28 44 L34 39 L36 44 L36 22 C 36 11, 31 2, 20 2 Z" fill={BONE} />
      <ellipse cx="14.5" cy="19" rx="2.6" ry="3.6" fill={INK} />
      <ellipse cx="25.5" cy="19" rx="2.6" ry="3.6" fill={INK} />
      <ellipse cx="20" cy="28" rx="3" ry="4" fill={INK} />
    </svg>
  );
}

// A jack-o'-lantern whose face flickers like a candle inside.
function JackOLantern({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 9 C 24 5, 26 3, 29 2" stroke={WITCH} strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="15" cy="28" rx="12" ry="16" fill="#D9701A" />
      <ellipse cx="33" cy="28" rx="12" ry="16" fill="#D9701A" />
      <ellipse cx="24" cy="28" rx="11" ry="17" fill={PUMPKIN} />
      <g className="hw-flicker" fill={EMBER}>
        <path d="M13 22 L19 22 L16 16 Z" />
        <path d="M29 22 L35 22 L32 16 Z" />
        <path d="M11 30 C 16 38, 32 38, 37 30 L33 32 L31 29 L28 33 L24 30 L20 33 L17 29 L15 32 Z" />
      </g>
    </svg>
  );
}

// A jack-o'-lantern between two hairlines — the ornament under each section label.
function PumpkinRule() {
  return (
    <div className="hw-rule" aria-hidden="true">
      <span className="hw-rule-line" style={{ background: `linear-gradient(to left, ${PUMPKIN}, transparent)` }} />
      <JackOLantern size={34} />
      <span className="hw-rule-line" style={{ background: `linear-gradient(to right, ${PUMPKIN}, transparent)` }} />
    </div>
  );
}

// A cobweb tucked into a corner of a section.
function Cobweb({ corner, size = 170 }: { corner: 'tl' | 'tr'; size?: number }) {
  const spokes = [0, 18, 36, 54, 72, 90].map((a) => {
    const r = (a * Math.PI) / 180;
    return `M0 0 L${(Math.cos(r) * 100).toFixed(1)} ${(Math.sin(r) * 100).toFixed(1)}`;
  });
  const arcs = [22, 42, 62, 82].map((d) => {
    const pts = [0, 18, 36, 54, 72, 90].map((a) => {
      const r = (a * Math.PI) / 180;
      return [Math.cos(r) * d, Math.sin(r) * d];
    });
    return pts.slice(1).reduce((acc, [x, y], i) => {
      const [px, py] = pts[i];
      // sag each strand slightly toward the corner
      const mx = (px + x) / 2 * 0.86, my = (py + y) / 2 * 0.86;
      return `${acc} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`);
  });
  return (
    <svg className={`hw-web hw-web-${corner}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="0.8" fill="none">
        {spokes.map((d, i) => <path key={`s${i}`} d={d} />)}
        {arcs.map((d, i) => <path key={`a${i}`} d={d} />)}
      </g>
    </svg>
  );
}

// The witch's hand creeping in from the edge of the screen, grabbing at the
// air, then slinking back out.
function CreepingHand({ className }: { className?: string }) {
  return (
    <div className={`hw-creep ${className ?? ''}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={HAND} alt="" />
    </div>
  );
}

// The same hand turned upright, rising out of the ground.
function RisingHand() {
  return (
    <div className="hw-rise" aria-hidden="true">
      <div className="hw-rise-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HAND} alt="" />
      </div>
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
    <div style={{ position: 'relative', width: '100%', height: 280, background: CHARCOAL, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Creepster&family=Outfit:wght@600&display=swap" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['halloween-party']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 22px', maxWidth: '66%' }}>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: WITCH, fontWeight: 600, margin: '0 0 8px' }}>You&rsquo;re invited… if you dare</p>
        <h2 style={{ fontFamily: "'Creepster', 'Georgia', serif", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 44px)', color: PUMPKIN, margin: '0 0 8px', lineHeight: 1, letterSpacing: 1, textShadow: '0 0 18px rgba(242,138,34,0.45)' }}>{heading || 'Halloween Party'}</h2>
        {date && <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: BONE, fontWeight: 600, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .hw {
    --hw-ink: ${INK};
    --hw-charcoal: ${CHARCOAL};
    --hw-stone: ${STONE};
    --hw-pumpkin: ${PUMPKIN};
    --hw-ember: ${EMBER};
    --hw-witch: ${WITCH};
    --hw-blood: ${BLOOD};
    --hw-bone: ${BONE};
    --hw-hex: ${HEX};
    --hw-font-display: 'Creepster', Georgia, serif;
    --hw-font-sans: 'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .hw * { box-sizing: border-box; }
  .hw { margin: 0; background: var(--hw-ink); color: var(--hw-bone); font-family: var(--hw-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .hw img { max-width: 100%; }

  /* ─ animation ─ */
  @keyframes hw-fly { 0% { transform: translateX(-12vw); } 100% { transform: translateX(112vw); } }
  @keyframes hw-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  @keyframes hw-flap { 0%, 100% { transform: scaleY(1); } 45% { transform: scaleY(-0.6); } }
  @keyframes hw-dangle { 0%, 100% { transform: translateY(calc(var(--hw-thread) * -1)); } 40%, 60% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes hw-ghost { 0%, 100% { transform: translateY(0) rotate(-4deg); opacity: 0.55; } 50% { transform: translateY(-22px) rotate(4deg); opacity: 0.95; } }
  @keyframes hw-flicker { 0%, 100% { opacity: 1; } 8% { opacity: 0.55; } 12% { opacity: 1; } 40% { opacity: 0.85; } 44% { opacity: 0.4; } 47% { opacity: 1; } 70% { opacity: 0.9; } }
  @keyframes hw-title { 0%, 88%, 100% { opacity: 1; text-shadow: 0 0 28px rgba(242,138,34,0.55), 0 0 2px rgba(254,161,50,0.9); } 90% { opacity: 0.35; text-shadow: none; } 91% { opacity: 1; } 93% { opacity: 0.5; text-shadow: none; } 95% { opacity: 1; } }
  @keyframes hw-fog { 0% { transform: translateX(-25%); } 100% { transform: translateX(0%); } }
  @keyframes hw-creep {
    0%, 12% { transform: translateX(-102%) rotate(0deg); }
    30% { transform: translateX(-38%) rotate(-2deg); }
    37% { transform: translateX(-42%) rotate(3deg); }
    44% { transform: translateX(-34%) rotate(-4deg); }
    52% { transform: translateX(-37%) rotate(1deg); }
    68%, 100% { transform: translateX(-102%) rotate(0deg); }
  }
  @keyframes hw-rise {
    0%, 15% { transform: translateY(100%) rotate(0deg); }
    34% { transform: translateY(38%) rotate(-5deg); }
    42% { transform: translateY(40%) rotate(4deg); }
    50% { transform: translateY(36%) rotate(-3deg); }
    58% { transform: translateY(39%) rotate(2deg); }
    76%, 100% { transform: translateY(100%) rotate(0deg); }
  }
  @keyframes hw-glow { 0%, 100% { box-shadow: 0 0 0 1px rgba(242,138,34,0.6), 0 0 18px -4px rgba(242,138,34,0.35); } 50% { box-shadow: 0 0 0 1px rgba(242,138,34,0.9), 0 0 34px 2px rgba(242,138,34,0.55); } }
  @keyframes hw-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .hw .hw-bats, .hw .hw-fog, .hw .hw-spider, .hw .hw-creep, .hw .hw-rise { display: none; }
    .hw .hw-flicker, .hw .hw-ghost, .hw .hero-name, .hw .countdown-block, .hw .hero-content > * { animation: none !important; }
  }

  /* bats */
  .hw .hw-bats { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
  .hw .hw-bat { position: absolute; left: 0; display: block; animation: hw-fly linear infinite; }
  .hw .hw-bat-bob { display: block; animation: hw-bob ease-in-out infinite; }
  .hw .hero .hw-bat svg { filter: drop-shadow(0 0 5px rgba(242,138,34,0.55)); }
  .hw .hw-wing { transform-box: fill-box; transform-origin: 50% 62%; animation: hw-flap 0.38s ease-in-out infinite; }

  /* spiders, ghosts, cobwebs, jack-o'-lanterns */
  .hw .hw-spider { position: absolute; top: 0; z-index: 1; display: flex; flex-direction: column; align-items: center; pointer-events: none; animation: hw-dangle 9s ease-in-out infinite; }
  .hw .hw-thread { display: block; width: 1px; height: var(--hw-thread); background: rgba(237,228,211,0.45); margin-bottom: -6px; }
  .hw .hw-spider-light .hw-thread { background: rgba(18,16,18,0.4); }
  .hw .hw-ghost { animation: hw-ghost 5s ease-in-out infinite; filter: drop-shadow(0 0 14px rgba(237,228,211,0.35)); }
  .hw .hw-web { position: absolute; top: 0; color: rgba(237,228,211,0.22); pointer-events: none; z-index: 0; }
  .hw .hw-web-tl { left: 0; }
  .hw .hw-web-tr { right: 0; transform: scaleX(-1); }
  .hw .section-bone .hw-web { color: rgba(18,16,18,0.18); }
  .hw .hw-flicker { animation: hw-flicker 2.6s linear infinite; }
  .hw .hw-rule { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0 auto 22px; }
  .hw .hw-rule-line { display: block; width: 80px; height: 1px; }

  /* the witch's hand */
  .hw .hw-creep { position: absolute; left: 0; bottom: 34px; width: clamp(280px, 40vw, 560px); z-index: 1; pointer-events: none; transform: translateX(-102%); animation: hw-creep 10s ease-in-out infinite; filter: drop-shadow(0 16px 18px rgba(0,0,0,0.55)); }
  .hw .hw-creep img { display: block; width: 100%; height: auto; }
  .hw .hw-rise { --hw-len: 400px; position: absolute; bottom: 0; left: 6%; width: calc(var(--hw-len) * 0.395); height: var(--hw-len); overflow: hidden; pointer-events: none; z-index: 1; }
  .hw .hw-rise-inner { position: absolute; inset: 0; transform: translateY(100%); transform-origin: 50% 100%; animation: hw-rise 11s ease-in-out infinite; animation-delay: -3s; }
  .hw .hw-rise img { position: absolute; left: 0; top: 0; width: var(--hw-len); max-width: none; transform-origin: top left; transform: translate(0, var(--hw-len)) rotate(-90deg); filter: drop-shadow(0 0 22px rgba(87,193,59,0.25)); }
  @media (max-width: 640px) { .hw .hw-rise { --hw-len: 240px; left: 2%; } .hw .hw-creep { bottom: 18px; } }

  .hw .eyebrow { font-family: var(--hw-font-sans); font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: var(--hw-witch); font-weight: 600; margin: 0 0 12px; }
  .hw .eyebrow.on-light { color: var(--hw-blood); }
  .hw .section-title { font-family: var(--hw-font-display); font-size: clamp(42px, 6vw, 72px); font-weight: 400; letter-spacing: 1.5px; color: var(--hw-pumpkin); margin: 0 0 18px; line-height: 1.05; text-shadow: 0 0 26px rgba(242,138,34,0.35); }
  .hw .section-title.on-light { color: var(--hw-ink); text-shadow: none; }

  .hw .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .hw .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .hw .section { position: relative; padding: 108px 28px; background: var(--hw-ink); overflow: hidden; }
  .hw .section-charcoal { background: radial-gradient(ellipse at top, #2A2526 0%, ${CHARCOAL} 45%, ${INK} 100%); }
  .hw .section-bone { background: var(--hw-bone); color: var(--hw-ink); }
  .hw .section-center { text-align: center; }
  .hw .above { position: relative; z-index: 2; }
  @media (max-width: 640px) { .hw .section { padding: 76px 20px; } }

  .hw .btn { font-family: var(--hw-font-sans); font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 16px 32px; border-radius: 4px; border: 1px solid var(--hw-pumpkin); background: var(--hw-pumpkin); color: var(--hw-ink); cursor: pointer; transition: background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .hw .btn:hover { background: var(--hw-ember); box-shadow: 0 0 26px rgba(242,138,34,0.55); }
  .hw .btn-outline { background: transparent; color: var(--hw-bone); border-color: rgba(237,228,211,0.55); }
  .hw .btn-outline:hover { background: transparent; color: var(--hw-pumpkin); border-color: var(--hw-pumpkin); }

  .hw input, .hw textarea, .hw select { font-family: var(--hw-font-sans); font-size: 15px; padding: 13px 15px; border-radius: 4px; border: 1px solid #3D3839; outline: none; background: #171517; color: var(--hw-bone); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .hw input::placeholder, .hw textarea::placeholder { color: rgba(237,228,211,0.35); }
  .hw input:focus, .hw textarea:focus, .hw select:focus { border-color: var(--hw-pumpkin); box-shadow: 0 0 0 3px rgba(242,138,34,0.18); }
  .hw label.field-label { font-family: var(--hw-font-sans); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--hw-witch); display: block; margin-bottom: 6px; font-weight: 600; }
  .hw .radio-label, .hw .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--hw-bone); cursor: pointer; }
  .hw .radio-label input, .hw .check-label input { width: auto; border: none; padding: 0; accent-color: var(--hw-pumpkin); }
  .hw .check-hint { font-size: 12px; color: rgba(237,228,211,0.55); margin: 4px 0 0; }
  .hw .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .hw .rsvp-error { color: #FF5A6E; font-size: 13px; margin: 0; }
  .hw .rsvp-success { text-align: center; padding: 18px 0; }
  .hw .rsvp-headline { font-family: var(--hw-font-display); font-size: 40px; color: var(--hw-pumpkin); margin: 0 0 8px; font-weight: 400; letter-spacing: 1px; }
  .hw .rsvp-sub { font-size: 14px; color: var(--hw-bone); margin: 0; }
  .hw .rsvp-form { display: flex; flex-direction: column; gap: 17px; }

  /* hero: pumpkins and the skeleton hand on the left, the invitation on the dark paper to the right */
  .hw .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: flex-end; text-align: right; padding: 96px 8vw; background: ${CHARCOAL}; overflow: hidden; }
  .hw .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: left center; z-index: 0; }
  .hw .hero::before { content: ''; position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse at 72% 50%, rgba(106,63,160,0.22) 0%, transparent 55%); pointer-events: none; }
  .hw .hero-content { position: relative; z-index: 3; max-width: 600px; }
  .hw .hero-eyebrow { animation: hw-in 1s ease both; font-family: var(--hw-font-sans); font-size: 14px; letter-spacing: 5px; text-transform: uppercase; font-weight: 600; color: var(--hw-witch); margin: 0 0 18px; }
  .hw .hero-name { animation: hw-in 1s ease 0.15s both, hw-title 7s linear 1.5s infinite; font-family: var(--hw-font-display); font-size: clamp(64px, 10vw, 136px); font-weight: 400; letter-spacing: 2px; color: var(--hw-pumpkin); margin: 0 0 18px; line-height: 0.95; }
  .hw .hero-date { animation: hw-in 1s ease 0.3s both; font-family: var(--hw-font-sans); font-size: 15px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--hw-bone); font-weight: 600; margin: 0 0 32px; }
  .hw .hero-actions { animation: hw-in 1s ease 0.45s both; display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
  /* low fog rolling across the bottom of the hero */
  .hw .hw-fog { position: absolute; left: 0; right: 0; bottom: 0; height: 42%; z-index: 2; pointer-events: none; overflow: hidden; }
  .hw .hw-fog span { position: absolute; bottom: -30%; left: 0; width: 200%; height: 100%; background:
      radial-gradient(ellipse 18% 40% at 10% 70%, rgba(237,228,211,0.10), transparent 70%),
      radial-gradient(ellipse 22% 36% at 32% 80%, rgba(237,228,211,0.08), transparent 70%),
      radial-gradient(ellipse 20% 44% at 55% 72%, rgba(237,228,211,0.10), transparent 70%),
      radial-gradient(ellipse 24% 38% at 78% 82%, rgba(237,228,211,0.08), transparent 70%);
    animation: hw-fog 38s linear infinite alternate; }
  .hw .hw-fog span + span { bottom: -40%; animation-duration: 52s; animation-direction: alternate-reverse; opacity: 0.8; }
  @media (max-width: 760px) {
    .hw .hero { align-items: flex-end; padding: 72px 20px 80px; }
    .hw .hero-bg { object-position: 8% center; }
    .hw .hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(18,16,18,0.97) 0%, rgba(18,16,18,0.85) 50%, rgba(18,16,18,0.15) 85%); z-index: 1; }
  }

  /* countdown: through the crack of the haunted door */
  .hw .countdown-shell { position: relative; background: ${INK} center / cover no-repeat; overflow: hidden; }
  .hw .countdown-shell::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, rgba(18,16,18,0.9) 0%, rgba(18,16,18,0.55) 50%, rgba(18,16,18,0.9) 100%); }
  .hw .countdown-wrap { position: relative; z-index: 2; padding: 116px 24px; text-align: center; }
  .hw .countdown-heading { font-family: var(--hw-font-display); font-size: clamp(44px, 6vw, 72px); color: var(--hw-pumpkin); margin: 0 0 40px; font-weight: 400; letter-spacing: 1.5px; text-shadow: 0 0 26px rgba(242,138,34,0.4); }
  .hw .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 3vw, 26px); }
  .hw .countdown-block { text-align: center; width: clamp(76px, 14vw, 120px); padding: 22px 8px 16px; border-radius: 4px; background: rgba(18,16,18,0.75); animation: hw-glow 3.4s ease-in-out infinite; }
  .hw .countdown-block:nth-child(2) { animation-delay: -0.85s; }
  .hw .countdown-block:nth-child(3) { animation-delay: -1.7s; }
  .hw .countdown-block:nth-child(4) { animation-delay: -2.55s; }
  .hw .countdown-value { font-family: var(--hw-font-display); font-size: clamp(36px, 5.4vw, 60px); color: var(--hw-bone); line-height: 1; letter-spacing: 1px; }
  .hw .countdown-label { font-family: var(--hw-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--hw-witch); margin-top: 8px; font-weight: 600; }
  .hw .countdown-ghost { position: absolute; z-index: 1; }

  /* details: tombstones */
  .hw .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 16px; align-items: stretch; }
  @media (max-width: 720px) { .hw .details-grid { grid-template-columns: 1fr; } }
  .hw .details-card { position: relative; background: linear-gradient(to bottom, #3A3536 0%, ${STONE} 60%, #221F20 100%); color: var(--hw-bone); padding: 70px 32px 40px; border-radius: 140px 140px 6px 6px; box-shadow: inset 0 2px 0 rgba(255,255,255,0.06), 0 24px 40px -20px rgba(0,0,0,0.8); text-align: center; }
  .hw .details-card::before { content: 'R.I.P.'; position: absolute; top: 30px; left: 0; right: 0; font-family: var(--hw-font-display); font-size: 18px; letter-spacing: 6px; color: rgba(237,228,211,0.25); }
  .hw .details-card .label { font-family: var(--hw-font-sans); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--hw-witch); margin: 0 0 12px; font-weight: 600; }
  .hw .details-card .time { font-family: var(--hw-font-display); font-size: 44px; letter-spacing: 1px; line-height: 1.05; color: var(--hw-pumpkin); margin-bottom: 10px; }
  .hw .details-card p { font-size: 15px; color: rgba(237,228,211,0.8); margin: 0 0 4px; }
  .hw .map-frame { overflow: hidden; min-height: 280px; border-radius: 140px 140px 6px 6px; border: 1px solid #3D3839; filter: grayscale(0.4) contrast(1.05); }
  .hw .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 280px; }
  .hw .directions-link { text-align: center; margin-top: 26px; }
  .hw .directions-link a { font-family: var(--hw-font-sans); font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--hw-pumpkin); text-decoration: none; }

  /* program, on bone */
  .hw .schedule-day { max-width: 600px; margin: 0 auto 44px; position: relative; z-index: 2; }
  .hw .schedule-day:last-child { margin-bottom: 0; }
  .hw .schedule-day-title { font-family: var(--hw-font-display); font-size: 32px; letter-spacing: 1px; color: var(--hw-blood); margin: 0 0 14px; }
  .hw .schedule-list { border-top: 1px solid rgba(18,16,18,0.3); text-align: left; }
  .hw .schedule-row { display: flex; gap: 22px; padding: 18px 0; border-bottom: 1px solid rgba(18,16,18,0.18); align-items: baseline; }
  .hw .schedule-time { font-family: var(--hw-font-sans); font-size: 15px; font-weight: 600; letter-spacing: 0.5px; color: var(--hw-blood); min-width: 112px; flex-shrink: 0; }
  .hw .schedule-info .name { font-family: var(--hw-font-display); font-size: 28px; letter-spacing: 0.8px; color: var(--hw-ink); margin: 0 0 2px; line-height: 1.1; }
  .hw .schedule-info .loc { font-size: 14px; color: #5A5254; margin: 0; }
  @media (max-width: 560px) { .hw .schedule-row { flex-direction: column; gap: 4px; } .hw .schedule-time { min-width: 0; } }

  /* rsvp: the paper bats on orange, the card on the empty right side */
  .hw .rsvp-section { position: relative; display: flex; align-items: center; justify-content: flex-end; min-height: 820px; background: ${PUMPKIN} url(${IMG}/rsvp.jpeg) left center / cover no-repeat; padding: 90px 8vw; overflow: hidden; }
  .hw .rsvp-card { position: relative; background: rgba(18,16,18,0.94); padding: 48px 38px 40px; border-radius: 6px; text-align: left; box-shadow: 0 0 0 1px rgba(242,138,34,0.5), 0 40px 80px -28px rgba(0,0,0,0.75); }
  .hw .rsvp-card .eyebrow { color: var(--hw-witch); }
  @media (max-width: 900px) {
    .hw .rsvp-section { justify-content: center; padding: 260px 16px 70px; min-height: 0; background-position: 30% top; background-size: auto 520px; }
    .hw .rsvp-card { padding: 42px 22px 32px; }
  }

  .hw .gallery-tile { overflow: hidden; border-radius: 4px; }

  /* registry: costume & treats note over the costumed crew */
  .hw .registry-wrap { position: relative; width: 100%; min-height: 420px; display: flex; align-items: center; justify-content: flex-start; background-size: cover; background-position: right center; padding: 72px 8vw; }
  .hw .registry-overlay { background: rgba(18,16,18,0.94); padding: 52px 50px 44px; text-align: center; max-width: 520px; border-radius: 6px; box-shadow: 0 0 0 1px rgba(242,138,34,0.5), 0 30px 60px -24px rgba(0,0,0,0.6); }
  @media (max-width: 760px) { .hw .registry-wrap { justify-content: center; padding: 60px 20px; } .hw .registry-overlay { padding: 42px 24px 34px; } }
  .hw .registry-title { font-family: var(--hw-font-display); font-size: 48px; letter-spacing: 1px; color: var(--hw-pumpkin); margin: 0 0 12px; font-weight: 400; line-height: 1; }
  .hw .registry-description { font-size: 15px; color: rgba(237,228,211,0.85); margin: 0 auto 26px; line-height: 1.75; max-width: 400px; }
  .hw .registry-button { display: inline-block; padding: 16px 32px; border-radius: 4px; background: var(--hw-pumpkin); color: var(--hw-ink); text-decoration: none; font-family: var(--hw-font-sans); font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
  .hw .registry-button:hover { background: var(--hw-ember); }

  /* songs */
  .hw .song-section { position: relative; background: radial-gradient(ellipse at top, #2A2526 0%, ${CHARCOAL} 45%, ${INK} 100%); padding: 108px 28px; text-align: center; overflow: hidden; }
  .hw .song-section .song-list { border-top: 1px solid rgba(242,138,34,0.4); max-width: 540px; margin: 0 auto; }
  .hw .song-section .song-row { border-bottom: 1px solid rgba(242,138,34,0.2); padding: 10px 0; }
  .hw .song-section .song-row .title { color: var(--hw-bone); }
  .hw .song-section .song-row .artist { color: var(--hw-pumpkin); }

  /* share */
  .hw .share-band { position: relative; padding: 100px 24px; background: linear-gradient(135deg, ${EMBER} 0%, ${PUMPKIN} 50%, #D9661A 100%); text-align: center; overflow: hidden; }
  .hw .share-band .eyebrow { color: var(--hw-ink); }
  .hw .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .hw .share-hashtag { font-family: var(--hw-font-display); font-size: clamp(42px, 6.4vw, 70px); letter-spacing: 1.5px; color: var(--hw-ink); margin: 0 0 28px; font-weight: 400; overflow-wrap: anywhere; }
  @media (max-width: 560px) { .hw .share-hashtag { font-size: 30px; letter-spacing: 0.5px; } }
  .hw .share-band .btn-outline { background: transparent; color: var(--hw-ink); border-color: var(--hw-ink); }
  .hw .share-band .btn-outline:hover { background: var(--hw-ink); color: var(--hw-pumpkin); }

  /* footer: a graveyard night, the witch's hand rising from the ground */
  .hw .footer { position: relative; padding: 110px 24px 70px; background: linear-gradient(to bottom, ${INK} 0%, #0A090A 100%); text-align: center; overflow: hidden; }
  .hw .footer-inner { position: relative; z-index: 2; }
  .hw .footer p { font-size: 15px; color: rgba(237,228,211,0.85); margin: 0 0 4px; }
  .hw .footer-signoff { font-family: var(--hw-font-display); font-size: clamp(40px, 6vw, 60px) !important; font-weight: 400; letter-spacing: 1.5px; color: var(--hw-pumpkin) !important; margin: 30px 0 0 !important; text-shadow: 0 0 26px rgba(242,138,34,0.4); }
  .hw .footer-credit { font-size: 11px; letter-spacing: 1px; color: rgba(237,228,211,0.45) !important; margin-top: 30px !important; }
  .hw .footer-ghost { display: block; margin: 0 auto 22px; }
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
    ourStoryLabel: 'Enter if you dare',
    howWeGotHere: 'A night of tricks & treats',
    theDetails: 'Where the spirits gather',
    dateAndLocation: 'Date & location',
    ceremony: 'The party',
    reception: 'Location',
    theSchedule: 'The haunting hours',
    eventProgram: 'Spooky schedule',
    kindlyRespond: 'Dare to join us?',
    memoriesSoFar: 'Caught on camera',
    ourMoments: 'Frightful moments',
    registry: 'Costumes & treats',
    viewRegistry: 'See the details',
    countingDown: 'The witching hour approaches',
    untilWeSayIDo: 'Halloween Party',
    todayIsTheDay: 'Tonight we haunt!',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Your costume, a spooky song request…',
    buildOurPlaylist: 'Monster mash',
    withLove: 'Spookily yours,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La fête',
    ourStoryLabel: 'Entrez si vous l’osez',
    howWeGotHere: 'Une nuit de bonbons et de frissons',
    theDetails: 'Là où les esprits se réunissent',
    dateAndLocation: 'Date et lieu',
    ceremony: 'La fête',
    reception: 'Lieu',
    theSchedule: 'Les heures hantées',
    eventProgram: 'Programme effrayant',
    kindlyRespond: 'Oserez-vous venir ?',
    memoriesSoFar: 'Pris sur le vif',
    ourMoments: 'Moments terrifiants',
    registry: 'Costumes et friandises',
    viewRegistry: 'Voir les détails',
    countingDown: 'L’heure des sorcières approche',
    untilWeSayIDo: 'Fête d’Halloween',
    todayIsTheDay: 'Ce soir, on hante !',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Votre costume, une chanson qui fait peur…',
    buildOurPlaylist: 'La danse des monstres',
    withLove: 'Effroyablement vôtre,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La fiesta',
    ourStoryLabel: 'Entra si te atreves',
    howWeGotHere: 'Una noche de dulces y sustos',
    theDetails: 'Donde se reúnen los espíritus',
    dateAndLocation: 'Fecha y lugar',
    ceremony: 'La fiesta',
    reception: 'Lugar',
    theSchedule: 'Las horas embrujadas',
    eventProgram: 'Programa escalofriante',
    kindlyRespond: '¿Te atreves a venir?',
    memoriesSoFar: 'Capturados en cámara',
    ourMoments: 'Momentos de miedo',
    registry: 'Disfraces y dulces',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Se acerca la hora de las brujas',
    untilWeSayIDo: 'Fiesta de Halloween',
    todayIsTheDay: '¡Esta noche asustamos!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Tu disfraz, una canción de miedo…',
    buildOurPlaylist: 'El baile de los monstruos',
    withLove: 'Escalofriantemente,',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: 'You’re invited… if you dare', fr: 'Vous êtes invités… si vous l’osez', es: 'Estás invitado… si te atreves' };

export default function HalloweenParty({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['halloween-party'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--hw-font-sans)', fontSize: 17, lineHeight: 1.85, color: 'rgba(237,228,211,0.88)' };

  return (
    <div className="hw">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Creepster&family=Outfit:wght@300;400;600&display=swap" />
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
        <BatFlight color="#0B0A0B" scale={1.6} />
        <Spider left="62%" length={150} />
        <div className="hw-fog" aria-hidden="true"><span /><span /></div>
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

      {/* STORY — the witch's hand creeps in from the left */}
      {(description || editSlots?.description) && (
        <div id="story" className="section section-charcoal section-center" style={{ paddingBottom: 230 }}>
          <Cobweb corner="tl" />
          <Cobweb corner="tr" size={130} />
          <CreepingHand />
          <Reveal style={{ position: 'relative', zIndex: 2 }}>
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <PumpkinRule />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
              {editSlots?.description ?? (
                <p style={{ ...textStyle, maxWidth: 580, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      )}

      {/* COUNTDOWN */}
      {eventDate && (
        <div className="countdown-shell" style={{ backgroundImage: `url(${IMG}/countdown.jpeg)` }}>
          <Ghost className="hw-ghost countdown-ghost" size={58} style={{ left: '8%', top: '22%' }} />
          <Ghost className="hw-ghost countdown-ghost" size={40} style={{ right: '9%', top: '58%', animationDelay: '-2.5s' }} />
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
        <div className="section section-center">
          <Spider left="10%" length={120} delay="-3s" />
          <Spider left="88%" length={200} delay="-7s" />
          <Reveal style={{ position: 'relative', zIndex: 2 }}>
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <PumpkinRule />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 600, color: BONE }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p style={{ marginTop: 10 }}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: PUMPKIN, fontWeight: 600, textDecoration: 'none' }}>{t.joinOnline}</a></p>
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
          </Reveal>
        </div>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-charcoal section-center">
            <div className="wrap">
              <PumpkinRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <div className="section section-bone section-center">
          <Cobweb corner="tl" size={150} />
          <Cobweb corner="tr" size={190} />
          <Spider left="84%" length={130} delay="-4s" className="hw-spider-light" />
          <Reveal style={{ position: 'relative', zIndex: 2 }}>
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow on-light" fallback={t.theSchedule} />
              <PumpkinRule />
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
          </Reveal>
        </div>
      )}

      {/* RSVP — over the paper bats, with a few real ones flying past */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          <BatFlight color="#141215" count={3} />
          <Reveal style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 480 }}>
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <PumpkinRule />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </div>
          </Reveal>
        </div>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <div className="section section-charcoal section-center">
        <Cobweb corner="tl" size={140} />
        <Reveal style={{ position: 'relative', zIndex: 2 }}>
          <div className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <PumpkinRule />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </Reveal>
      </div>

      {/* REGISTRY (costumes & treats) */}
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
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <PumpkinRule />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 4, background: STONE, border: '1px solid #3D3839' }} textStyle={{ color: 'rgba(237,228,211,0.8)' }} />
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
              <PumpkinRule />
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
        <div className="song-section">
          <BatFlight color="#2E2A2C" count={2} />
          <Reveal style={{ position: 'relative', zIndex: 2 }}>
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" fallback={t.buildOurPlaylist} />
              <PumpkinRule />
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
          </Reveal>
        </div>
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow" buttonClassName="btn btn-outline" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <RisingHand />
        <BatFlight color="#2E2A2C" count={2} />
        <div className="footer-inner">
          <Ghost className="hw-ghost footer-ghost" size={60} />
          <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow" style={{ marginBottom: 10 }} fallback={t.questions} />
          <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
          {editSlots?.footerContact ?? (
            <>
              {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
              {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: PUMPKIN, textDecoration: 'none' }}>{userEmail}</a></p>}
              {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: PUMPKIN, textDecoration: 'none' }}>{userPhone}</a></p>}
            </>
          )}
          <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
          <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
        </div>
      </footer>
    </div>
  );
}
