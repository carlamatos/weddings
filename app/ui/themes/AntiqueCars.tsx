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
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

// Exclusive to Antique Cars — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `ac-default-${i + 1}`,
  user_page_id: 0,
  image_path: `/images/themes/antique-cars/car-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

const TEAL = '#57C0B9';
const PURPLE = '#4E3D99';
const GOLD = '#FFCF01';
const WHITE = '#FFFFFF';

// ─── SVG decorations ─────────────────────────────────────

// Side view of a 1950s two-tone sedan with whitewall tyres and chrome bumpers.
function ClassicCar({ body = PURPLE, trim = GOLD, glass = TEAL, width = 240, className }: {
  body?: string; trim?: string; glass?: string; width?: number; className?: string;
}) {
  return (
    <svg className={className} width={width} viewBox="0 0 240 92" fill="none" aria-hidden="true">
      {/* body, with a rear fin */}
      <path
        d="M8 64 C8 55 13 50 24 48 L14 38 L34 46 L66 44 C78 29 94 21 118 21 L146 21 C164 21 176 29 190 42 L218 46 C229 48 234 55 234 63 L234 68 C234 71 232 72 229 72 L11 72 C9 72 8 70 8 68 Z"
        fill={body}
      />
      {/* windows */}
      <path d="M84 43 C93 31 104 27 118 27 L130 27 L130 43 Z" fill={glass} />
      <path d="M137 27 L148 27 C161 27 170 33 180 43 L137 43 Z" fill={glass} />
      {/* chrome side spear and door line */}
      <path d="M30 55 L200 52" stroke={trim} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M133 44 L133 68" stroke={WHITE} strokeOpacity="0.35" strokeWidth="1.5" />
      {/* bumpers, headlight and tail light */}
      <rect x="3" y="63" width="18" height="6" rx="3" fill={trim} />
      <rect x="222" y="63" width="16" height="6" rx="3" fill={trim} />
      <circle cx="229" cy="55" r="3.5" fill={trim} />
      <rect x="10" y="52" width="5" height="6" rx="2" fill={trim} />
      {/* whitewall wheels */}
      {[58, 190].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="72" r="17" fill="#241F2B" />
          <circle cx={cx} cy="72" r="11" fill={WHITE} />
          <circle cx={cx} cy="72" r="6.5" fill={trim} />
          <circle cx={cx} cy="72" r="2" fill={body} />
        </g>
      ))}
    </svg>
  );
}

// Two crossed checkered flags — the section ornament above each title.
function CrossedFlags({ color = PURPLE, light = WHITE }: { color?: string; light?: string }) {
  const flag = (flip: boolean) => {
    const squares = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        squares.push(
          <rect key={`${r}-${c}`} x={c * 6} y={r * 6} width="6" height="6" fill={(r + c) % 2 === 0 ? color : light} />,
        );
      }
    }
    return (
      <g transform={flip ? 'translate(64 4) scale(-1 1) rotate(-28)' : 'translate(0 4) rotate(-28)'}>
        <line x1="2" y1="0" x2="2" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <g transform="translate(3 1)">
          {squares}
          <rect width="24" height="18" fill="none" stroke={color} strokeWidth="1" />
        </g>
      </g>
    );
  };
  return (
    <svg className="ac-flags" width="64" height="44" viewBox="0 -4 64 48" aria-hidden="true">
      {flag(false)}
      {flag(true)}
    </svg>
  );
}

// A spoked wire wheel, used large and faint as a background ornament.
function WireWheel({ className, color = WHITE }: { className?: string; color?: string }) {
  const spokes = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="94" stroke={color} strokeWidth="10" />
      <circle cx="100" cy="100" r="78" stroke={color} strokeWidth="3" />
      {spokes.map((a) => (
        <line key={a} x1="100" y1="100" x2="100" y2="24" stroke={color} strokeWidth="2" transform={`rotate(${a} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="20" fill={color} />
      <circle cx="100" cy="100" r="8" stroke={PURPLE} strokeWidth="3" />
    </svg>
  );
}

// Speedometer arc with ticks, shown above the countdown.
function Speedometer() {
  const ticks = Array.from({ length: 13 }, (_, i) => -120 + i * 20);
  return (
    <svg className="ac-speedo" width="150" height="86" viewBox="0 0 150 86" fill="none" aria-hidden="true">
      <path d="M12 80 A63 63 0 0 1 138 80" stroke={WHITE} strokeOpacity="0.35" strokeWidth="2" />
      {ticks.map((a, i) => (
        <line
          key={a}
          x1="75" y1="22" x2="75" y2={i % 3 === 0 ? 34 : 29}
          stroke={i >= 10 ? GOLD : WHITE}
          strokeWidth={i % 3 === 0 ? 3 : 1.5}
          strokeLinecap="round"
          transform={`rotate(${a} 75 80)`}
        />
      ))}
      <line x1="75" y1="80" x2="75" y2="30" stroke={GOLD} strokeWidth="3" strokeLinecap="round" transform="rotate(48 75 80)" />
      <circle cx="75" cy="80" r="6" fill={GOLD} />
    </svg>
  );
}

// A stretch of road with a dashed centre line and the car driving along it.
function RoadDivider() {
  return (
    <div className="ac-road" aria-hidden="true">
      <svg className="ac-road-line" viewBox="0 0 1200 12" preserveAspectRatio="none">
        <line x1="0" y1="6" x2="1200" y2="6" stroke={GOLD} strokeWidth="4" strokeDasharray="36 26" />
      </svg>
      <ClassicCar className="ac-road-car" width={150} body={WHITE} trim={GOLD} glass={TEAL} />
    </div>
  );
}

function CheckerBand() {
  return <div className="ac-checker" aria-hidden="true" />;
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: TEAL, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['antique-cars']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '15% center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0) 60%)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 22px', maxWidth: '52%' }}>
        <p style={{ display: 'inline-block', fontFamily: "'Oswald', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: PURPLE, background: GOLD, fontWeight: 600, padding: '4px 12px', margin: '0 0 10px' }}>Antique &amp; Classic</p>
        <h2 style={{ fontFamily: "'Abril Fatface', Georgia, serif", fontSize: 'clamp(24px, 4.6vw, 38px)', fontWeight: 400, color: PURPLE, margin: '0 0 8px', lineHeight: 1.05 }}>{heading || 'Classic Car Show'}</h2>
        {date && <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: PURPLE, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .ac {
    --ac-teal: ${TEAL};
    --ac-teal-deep: #3FA59E;
    --ac-teal-soft: #E6F5F4;
    --ac-purple: ${PURPLE};
    --ac-purple-deep: #3A2D78;
    --ac-purple-soft: rgba(78,61,153,0.72);
    --ac-gold: ${GOLD};
    --ac-white: ${WHITE};
    --ac-line: rgba(78,61,153,0.18);
    --ac-font-display: 'Abril Fatface', Georgia, serif;
    --ac-font-label: 'Oswald', 'Arial Narrow', system-ui, sans-serif;
    --ac-font-sans: 'Libre Franklin', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .ac * { box-sizing: border-box; }
  .ac { margin: 0; background: var(--ac-white); color: var(--ac-purple); font-family: var(--ac-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .ac img { max-width: 100%; }

  /* decorations */
  .ac .ac-flags { display: block; margin: 0 auto 14px; }
  .ac .ac-checker { height: 16px; background: repeating-conic-gradient(var(--ac-purple) 0 25%, var(--ac-white) 0 50%) 0 0 / 16px 16px; }
  .ac .ac-road { position: relative; height: 64px; background: var(--ac-purple); overflow: hidden; }
  .ac .ac-road-line { position: absolute; left: 0; right: 0; top: 50%; width: 100%; height: 12px; transform: translateY(-50%); }
  .ac .ac-road-car { position: absolute; bottom: 20px; left: -160px; animation: ac-drive 18s linear infinite; }
  @keyframes ac-drive { from { transform: translateX(0); } to { transform: translateX(calc(100vw + 320px)); } }
  @media (prefers-reduced-motion: reduce) { .ac .ac-road-car { animation: none; left: 8%; } }
  .ac .ac-wheel { position: absolute; width: 260px; height: 260px; opacity: 0.12; pointer-events: none; animation: ac-spin 40s linear infinite; }
  @keyframes ac-spin { to { transform: rotate(360deg); } }
  .ac .ac-wheel-right { top: -70px; right: -80px; }
  .ac .ac-wheel-left { bottom: -80px; left: -70px; }
  @media (max-width: 640px) { .ac .ac-wheel { width: 180px; height: 180px; } }
  @media (prefers-reduced-motion: reduce) { .ac .ac-wheel { animation: none; } }

  .ac .eyebrow { font-family: var(--ac-font-label); font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: var(--ac-teal-deep); font-weight: 600; margin: 0 0 10px; }
  .ac .eyebrow.on-dark { color: var(--ac-gold); }
  .ac .eyebrow.on-teal { color: var(--ac-purple); }
  .ac .section-title { font-family: var(--ac-font-display); font-size: clamp(32px, 4.4vw, 48px); font-weight: 400; color: var(--ac-purple); margin: 0 0 22px; line-height: 1.12; }
  .ac .section-title.on-dark { color: var(--ac-white); }

  .ac .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .ac .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .ac .section { position: relative; padding: 88px 28px; background: var(--ac-white); overflow: hidden; }
  .ac .section-teal { background: var(--ac-teal); }
  .ac .section-soft { background: var(--ac-teal-soft); }
  .ac .section-center { text-align: center; }
  @media (max-width: 640px) { .ac .section { padding: 60px 20px; } }

  .ac .btn { font-family: var(--ac-font-label); font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 14px 30px; border-radius: 4px; border: 2px solid var(--ac-purple); background: var(--ac-purple); color: var(--ac-white); cursor: pointer; transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .ac .btn:hover { background: var(--ac-purple-deep); border-color: var(--ac-purple-deep); transform: translateY(-1px); }
  .ac .btn-gold { background: var(--ac-gold); border-color: var(--ac-gold); color: var(--ac-purple); }
  .ac .btn-gold:hover { background: #F2C200; border-color: #F2C200; }
  .ac .btn-outline { background: transparent; color: var(--ac-purple); }
  .ac .btn-outline:hover { background: rgba(78,61,153,0.08); border-color: var(--ac-purple); }
  .ac .btn-outline.on-dark { color: var(--ac-white); border-color: rgba(255,255,255,0.75); }
  .ac .btn-outline.on-dark:hover { background: rgba(255,255,255,0.12); }

  .ac input, .ac textarea, .ac select { font-family: var(--ac-font-sans); font-size: 15px; padding: 11px 14px; border-radius: 4px; border: 1.5px solid var(--ac-line); outline: none; background: var(--ac-white); color: var(--ac-purple); width: 100%; display: block; transition: border-color 0.2s ease; }
  .ac input:focus, .ac textarea:focus, .ac select:focus { border-color: var(--ac-teal-deep); }
  .ac label.field-label { font-family: var(--ac-font-label); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ac-purple); display: block; margin-bottom: 5px; font-weight: 600; }
  .ac .radio-label, .ac .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--ac-purple); cursor: pointer; }
  .ac .radio-label input, .ac .check-label input { width: auto; border: none; padding: 0; accent-color: var(--ac-purple); }
  .ac .check-hint { font-family: var(--ac-font-sans); font-size: 12px; color: var(--ac-purple-soft); margin: 4px 0 0; }
  .ac .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .ac .rsvp-error { color: #B3261E; font-size: 13px; margin: 0; font-family: var(--ac-font-sans); }
  .ac .rsvp-success { text-align: center; padding: 16px 0; }
  .ac .rsvp-headline { font-family: var(--ac-font-display); font-size: 30px; color: var(--ac-purple); margin: 0 0 10px; font-weight: 400; }
  .ac .rsvp-sub { font-size: 14px; color: var(--ac-purple-soft); margin: 0; }
  .ac .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the car fills the left of the photo, so everything sits on the right */
  .ac .hero { position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: flex-end; text-align: right; padding: 72px 56px 96px; background: var(--ac-teal); overflow: hidden; }
  .ac .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: left center; z-index: 0; }
  .ac .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to left, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.4) 42%, rgba(255,255,255,0) 68%); z-index: 0; pointer-events: none; }
  .ac .hero-content { position: relative; z-index: 1; max-width: 560px; }
  .ac .hero-checker { position: absolute; left: 0; right: 0; bottom: 0; z-index: 1; }
  @keyframes ac-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .ac .hero-eyebrow { animation: ac-rise 0.9s ease both; display: inline-block; font-family: var(--ac-font-label); font-size: 14px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; color: var(--ac-purple); background: var(--ac-gold); padding: 8px 22px; margin: 0 0 18px; clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 0 100%, 12px 50%); }
  .ac .hero-name { animation: ac-rise 0.9s ease 0.15s both; font-family: var(--ac-font-display); font-size: clamp(46px, 7.4vw, 88px); font-weight: 400; color: var(--ac-purple); margin: 0 0 18px; line-height: 1.02; text-shadow: 0 2px 18px rgba(255,255,255,0.55); }
  .ac .hero-date { animation: ac-rise 0.9s ease 0.3s both; font-family: var(--ac-font-label); font-size: 16px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--ac-purple); font-weight: 500; margin: 0 0 30px; }
  .ac .hero-actions { animation: ac-rise 0.9s ease 0.45s both; display: flex; gap: 12px; flex-wrap: wrap; justify-content: flex-end; }
  @media (max-width: 720px) {
    .ac .hero { padding: 72px 22px 88px; align-items: flex-end; }
    .ac .hero-overlay { background: linear-gradient(to top, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.1) 100%); }
  }

  /* countdown */
  .ac .countdown-shell { background: var(--ac-purple); text-align: center; padding-top: 56px; }
  .ac .ac-speedo { display: block; margin: 0 auto; }
  .ac .countdown-wrap { padding: 16px 24px 68px; background: var(--ac-purple); text-align: center; }
  .ac .countdown-heading { font-family: var(--ac-font-display); font-size: clamp(32px, 4vw, 42px); color: var(--ac-white); margin: 0 0 32px; font-weight: 400; }
  .ac .countdown-row { display: flex; justify-content: center; gap: clamp(14px, 4vw, 40px); }
  .ac .countdown-block { text-align: center; min-width: 72px; padding: 16px 10px 12px; border: 2px solid rgba(255,207,1,0.5); border-radius: 8px; }
  .ac .countdown-value { font-family: var(--ac-font-label); font-size: clamp(32px, 5vw, 54px); color: var(--ac-gold); font-weight: 600; line-height: 1; }
  .ac .countdown-label { font-family: var(--ac-font-label); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.75); margin-top: 8px; }

  /* details */
  .ac .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; }
  @media (max-width: 640px) { .ac .details-grid { grid-template-columns: 1fr; } }
  .ac .details-card { background: var(--ac-white); border-radius: 8px; border-top: 6px solid var(--ac-gold); padding: 28px 26px; box-shadow: 0 10px 28px rgba(58,45,120,0.18); }
  .ac .details-card .label { font-family: var(--ac-font-label); font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--ac-teal-deep); font-weight: 600; margin: 0 0 10px; }
  .ac .details-card .time { font-family: var(--ac-font-display); font-size: 32px; line-height: 1.2; color: var(--ac-purple); }
  .ac .details-card p { font-size: 14px; color: var(--ac-purple-soft); margin: 0 0 3px; }
  .ac .map-frame { border-radius: 8px; overflow: hidden; min-height: 220px; border: 4px solid var(--ac-white); box-shadow: 0 10px 28px rgba(58,45,120,0.18); }
  .ac .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .ac .directions-link { text-align: center; margin-top: 20px; }
  .ac .directions-link a { font-family: var(--ac-font-label); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ac-purple); font-weight: 600; text-decoration: none; }

  /* program */
  .ac .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .ac .schedule-day:last-child { margin-bottom: 0; }
  .ac .schedule-day-title { font-family: var(--ac-font-label); font-size: 13px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--ac-teal-deep); font-weight: 600; margin: 0 0 18px; }
  .ac .schedule-list { border-top: 2px solid var(--ac-purple); text-align: left; }
  .ac .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--ac-line); align-items: baseline; }
  .ac .schedule-time { font-family: var(--ac-font-label); font-size: 18px; color: var(--ac-purple); min-width: 110px; flex-shrink: 0; font-weight: 600; }
  .ac .schedule-info .name { font-family: var(--ac-font-sans); font-size: 15px; color: var(--ac-purple); font-weight: 600; margin: 0 0 3px; }
  .ac .schedule-info .loc { font-family: var(--ac-font-sans); font-size: 13px; color: var(--ac-purple-soft); margin: 0; }

  /* rsvp */
  .ac .rsvp-section { position: relative; background: var(--ac-teal); padding: 88px 28px; text-align: center; overflow: hidden; }
  .ac .rsvp-card { position: relative; max-width: 460px; margin: 0 auto; background: var(--ac-white); border-radius: 8px; border-top: 6px solid var(--ac-gold); padding: 34px 30px; text-align: left; box-shadow: 0 14px 40px rgba(58,45,120,0.28); }

  .ac .gallery-tile { overflow: hidden; border-radius: 6px; }

  /* registry, reframed as sponsors */
  .ac .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .ac .registry-overlay { background: rgba(58,45,120,0.86); padding: 48px 60px; text-align: center; border-radius: 8px; border: 2px solid var(--ac-gold); }
  .ac .registry-title { font-family: var(--ac-font-label); font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: var(--ac-gold); margin: 0 0 14px; font-weight: 600; }
  .ac .registry-description { font-size: 15px; color: rgba(255,255,255,0.92); margin: 0 0 24px; line-height: 1.6; max-width: 390px; }
  .ac .registry-button { display: inline-block; padding: 13px 30px; border-radius: 4px; background: var(--ac-gold); color: var(--ac-purple); text-decoration: none; font-family: var(--ac-font-label); font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }
  .ac .registry-button:hover { background: #F2C200; }

  /* songs */
  .ac .song-section { background: var(--ac-teal-soft); padding: 88px 28px; text-align: center; }
  .ac .song-section .song-list { border-top: 2px solid var(--ac-purple); max-width: 540px; margin: 0 auto; }
  .ac .song-section .song-row { border-bottom: 1px solid var(--ac-line); padding: 10px 0; }
  .ac .song-section .song-row .title { color: var(--ac-purple); }
  .ac .song-section .song-row .artist { color: var(--ac-purple-soft); }

  /* share */
  .ac .share-band { padding: 84px 24px; background: var(--ac-teal); text-align: center; }
  .ac .share-band .eyebrow { color: var(--ac-purple); }
  .ac .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .ac .share-hashtag { font-family: var(--ac-font-display); font-size: clamp(30px, 4vw, 42px); color: var(--ac-purple); margin: 0 0 28px; font-weight: 400; overflow-wrap: anywhere; }

  /* footer */
  .ac .footer { position: relative; padding: 64px 24px 64px; background: var(--ac-purple); text-align: center; overflow: hidden; }
  .ac .footer p { font-size: 14px; color: rgba(255,255,255,0.88); margin: 0 0 4px; }
  .ac .footer-car { display: block; margin: 0 auto 26px; }
  .ac .footer-signoff { font-family: var(--ac-font-display); font-size: clamp(28px, 6vw, 38px) !important; font-weight: 400; color: var(--ac-white) !important; margin: 24px 0 0 !important; }
  .ac .footer-credit { font-family: var(--ac-font-sans); font-size: 11px; color: rgba(255,255,255,0.6) !important; margin-top: 24px !important; letter-spacing: 0.5px; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'About the show',
    ourStoryLabel: 'About the show',
    howWeGotHere: 'Chrome, curves & classics',
    theDetails: 'The details',
    dateAndLocation: 'Date & location',
    ceremony: 'Show time',
    reception: 'Location',
    theSchedule: 'On the schedule',
    eventProgram: 'Show program',
    kindlyRespond: 'Save your spot',
    memoriesSoFar: 'From the show floor',
    ourMoments: 'Classics on display',
    registry: 'Sponsors & support',
    viewRegistry: 'Learn more',
    countingDown: 'Start your engines',
    untilWeSayIDo: 'Until the show rolls in',
    noteForCouple: 'A note for the organizers',
    noteForCouplePlaceholder: 'Showing a car? Tell us the year, make and model…',
    buildOurPlaylist: 'Cruisin’ tunes',
    withLove: 'See you on the lot,',
    theCouple: 'the organizers',
  },
  fr: {
    ourStoryBtn: 'Le salon',
    ourStoryLabel: 'À propos du salon',
    howWeGotHere: 'Chrome, courbes et classiques',
    theDetails: 'Les détails',
    dateAndLocation: 'Date et lieu',
    ceremony: 'Horaire',
    reception: 'Lieu',
    theSchedule: 'Au programme',
    eventProgram: 'Programme du salon',
    kindlyRespond: 'Réservez votre place',
    memoriesSoFar: 'Sur le terrain',
    ourMoments: 'Les classiques exposés',
    registry: 'Commanditaires',
    viewRegistry: 'En savoir plus',
    countingDown: 'Faites chauffer les moteurs',
    untilWeSayIDo: 'Avant le salon',
    noteForCouple: 'Un mot pour les organisateurs',
    noteForCouplePlaceholder: 'Vous exposez une voiture ? Indiquez l’année, la marque et le modèle…',
    buildOurPlaylist: 'La musique de la route',
    withLove: 'À bientôt sur le terrain,',
    theCouple: 'les organisateurs',
  },
  es: {
    ourStoryBtn: 'La exhibición',
    ourStoryLabel: 'Sobre la exhibición',
    howWeGotHere: 'Cromo, curvas y clásicos',
    theDetails: 'Los detalles',
    dateAndLocation: 'Fecha y lugar',
    ceremony: 'Horario',
    reception: 'Lugar',
    theSchedule: 'En el programa',
    eventProgram: 'Programa de la exhibición',
    kindlyRespond: 'Reserva tu lugar',
    memoriesSoFar: 'Desde la exhibición',
    ourMoments: 'Clásicos en exhibición',
    registry: 'Patrocinadores',
    viewRegistry: 'Más información',
    countingDown: 'Enciendan los motores',
    untilWeSayIDo: 'Hasta que llegue la exhibición',
    noteForCouple: 'Una nota para los organizadores',
    noteForCouplePlaceholder: '¿Vas a exhibir un auto? Cuéntanos el año, la marca y el modelo…',
    buildOurPlaylist: 'Música para la ruta',
    withLove: 'Nos vemos en la exhibición,',
    theCouple: 'los organizadores',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: 'Antique & Classic', fr: 'Antiques et classiques', es: 'Antiguos y clásicos' };

export default function AntiqueCars({
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
  isLoggedIn,
}: ThemeProps) {
  const base = getTranslations(language);
  const t: Translations = { ...base, ...pickByLanguage(OVERRIDES, language) };
  const isPreview = !!editSlots;
  const sectionTextCtx = { values: sectionText, pageId: sectionTextPageId };
  const heroDateText = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';
  const heroSrc = bannerImage || HERO_DEFAULTS['antique-cars'];

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

  return (
    <div className="ac">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Libre+Franklin:wght@400;500;600;700&family=Oswald:wght@500;600&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} />}

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
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line' }}>{heading}</h1>}
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date">{heroDateText}</p>)}
          <div className="hero-actions">
            <a href="#rsvp" className="btn btn-gold">{t.rsvpBtn}</a>
            <a href="#story" className="btn btn-outline">{t.ourStoryBtn}</a>
            {isPaid && <a href="#photos" className="btn btn-outline">{t.shareYourPhoto}</a>}
          </div>
        </div>
        <div className="hero-checker"><CheckerBand /></div>
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-center">
            <div className="wrap">
              <CrossedFlags />
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
              {editSlots?.description ?? (
                <p style={{ fontFamily: 'var(--ac-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--ac-purple-soft)', maxWidth: 560, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* COUNTDOWN */}
      {eventDate && (
        <div className="countdown-shell">
          <Speedometer />
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

      <RoadDivider />

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <Reveal from="right">
          <div className="section section-teal section-center">
            <WireWheel className="ac-wheel ac-wheel-right" />
            <div className="wrap-wide" style={{ position: 'relative' }}>
              <CrossedFlags light={TEAL} />
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow on-teal" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 600 }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ac-purple)', textDecoration: 'none', fontWeight: 700 }}>{t.joinOnline}</a></p>
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

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap">
              <CrossedFlags />
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

      {/* RSVP */}
      {showRsvp !== false && (
        <Reveal>
          <div id="rsvp" className="rsvp-section">
            <WireWheel className="ac-wheel ac-wheel-left" />
            <div style={{ position: 'relative' }}>
              <CrossedFlags light={TEAL} />
              <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow on-teal" fallback={t.kindlyRespond} />
              <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              <div className="rsvp-card">
                <RsvpForm userPageId={userPageId} translations={t} disabled={isPreview} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <CheckerBand />

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <CrossedFlags />
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* SPONSORS (registry section, reframed) */}
      {(registryImage || registryDescription) && (
        <Reveal>
          <div
            className="registry-wrap"
            style={{ backgroundImage: `url(${registryImage || '/images/themes/antique-cars/car-1.jpeg'})` }}
          >
            <div className="registry-overlay">
              <p className="registry-title">{t.registry}</p>
              {registryDescription && <p className="registry-description">{registryDescription}</p>}
              {registryButtonLink && (
                <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                  {registryButtonText || t.viewRegistry}
                </a>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-soft section-center">
            <div className="wrap">
              <CrossedFlags light={WHITE} />
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
              <GuestPhotoSection
                userPageId={galleryToken}
                initialPhotos={guestPhotos ?? []}
                initialHasMore={guestPhotosHasMore ?? false}
                labels={{ shareYourPhoto: t.shareYourPhoto, loadMore: t.loadMore, beFirstToShare: t.beFirstToShare, photoUploaded: t.photoUploaded, photoUploadError: t.photoUploadError, uploading: t.sending }}
                btnClassName="btn"
                disabled={isPreview}
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
              <CrossedFlags light={WHITE} />
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" fallback={t.buildOurPlaylist} />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" fallback={t.songRequests} />
              <SongRequestSection
                userPageId={galleryToken}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn"
                disabled={isPreview}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-teal" buttonClassName="btn btn-outline" sectionText={sectionTextCtx} />
      )}

      <RoadDivider />

      {/* FOOTER */}
      <footer className="footer">
        <ClassicCar className="footer-car" width={200} body={GOLD} trim={WHITE} glass={PURPLE} />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 14 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 0 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'rgba(255,255,255,0.88)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <p className="footer-signoff">{t.withLove} {heading || t.theCouple}</p>
        <SectionText ctx={sectionTextCtx} k="footer.credit" className="footer-credit" fallback={t.madeWithMygala}
          defaultContent={<>{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></>} />
      </footer>
    </div>
  );
}
