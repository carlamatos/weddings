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
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

const IMG = '/images/themes/white-christmas';

// Exclusive to White Christmas — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
  id: `wx-default-${i + 1}`,
  user_page_id: 0,
  image_path: `${IMG}/photo-${i + 1}.jpeg`,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// Taken from the hero photo: an icy winter sky, gold and champagne stars,
// silver and blush bottle-brush trees, pine and bark.
const SKY = '#DAE4F0';
const SKY_PALE = '#EEF3F9';
const FROST = '#C7CBD7';
const GOLD_LIGHT = '#EBC595';
const GOLD = '#D6AB7C';
const GOLD_DEEP = '#AA8164';
const BLUSH = '#C09C93';
const SILVER = '#979296';
const PINE = '#3B3E3D';
const PINE_SOFT = '#616154';
const BARK = '#58362D';
const SNOW = '#FFFFFF';

// ─── SVG ornaments ───────────────────────────────────────

// An eight-pointed gold star, like the ones on the hero garland.
function GoldStar({ size = 30, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  const outer = 15;
  const inner = 6.2;
  const pts = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    return `${(16 + r * Math.cos(a)).toFixed(2)},${(16 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <polygon points={pts} fill={GOLD} stroke={GOLD_DEEP} strokeWidth="0.6" strokeLinejoin="round" />
      <polygon points={pts} fill={GOLD_LIGHT} transform="translate(16 16) scale(0.45) translate(-16 -16)" opacity="0.9" />
    </svg>
  );
}

function Snowflake({ size = 14, color = SNOW, className, style }: { size?: number; color?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a} 12 12)`} stroke={color} strokeWidth="1.3" strokeLinecap="round">
          <line x1="12" y1="1.5" x2="12" y2="22.5" />
          <line x1="12" y1="5" x2="9.5" y2="2.8" /><line x1="12" y1="5" x2="14.5" y2="2.8" />
          <line x1="12" y1="19" x2="9.5" y2="21.2" /><line x1="12" y1="19" x2="14.5" y2="21.2" />
        </g>
      ))}
    </svg>
  );
}

// Gentle snowfall of soft flakes and a few crystal snowflakes.
const SNOWFALL = Array.from({ length: 40 }, (_, i) => ({
  left: `${(i * 29 + 7) % 100}%`,
  size: 3 + ((i * 7) % 5),
  duration: `${11 + ((i * 13) % 10)}s`,
  delay: `${-((i * 1.9) % 16).toFixed(1)}s`,
  drift: (i % 2 ? 1 : -1) * (12 + ((i * 11) % 34)),
  flake: i % 5 === 0,
}));

function Snowfall() {
  return (
    <div className="wx-snow" aria-hidden="true">
      {SNOWFALL.map((s, i) =>
        s.flake ? (
          <Snowflake key={i} className="wx-flake" size={s.size * 3}
            style={{ left: s.left, animationDuration: s.duration, animationDelay: s.delay, ['--drift' as string]: `${s.drift}px` }} />
        ) : (
          <span key={i} className="wx-dot"
            style={{ left: s.left, width: s.size, height: s.size, animationDuration: s.duration, animationDelay: s.delay, ['--drift' as string]: `${s.drift}px` }} />
        ),
      )}
    </div>
  );
}

// A fine gold rule with a twinkling star — the ornament under each section label.
function StarRule({ light }: { light?: boolean }) {
  const line = light ? 'rgba(235,197,149,0.6)' : GOLD;
  return (
    <div className="wx-rule" aria-hidden="true">
      <svg width="220" height="20" viewBox="0 0 220 20" fill="none">
        <line x1="0" y1="10" x2="92" y2="10" stroke={line} strokeWidth="0.8" />
        <line x1="128" y1="10" x2="220" y2="10" stroke={line} strokeWidth="0.8" />
        <circle cx="84" cy="10" r="1.5" fill={line} />
        <circle cx="136" cy="10" r="1.5" fill={line} />
      </svg>
      <GoldStar className="wx-twinkle" size={22} />
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
    <div style={{ position: 'relative', width: '100%', height: 280, background: SKY, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Cinzel:wght@500&display=swap" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['white-christmas']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '34px 24px 0' }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: GOLD_DEEP, margin: '0 0 6px' }}>You&apos;re invited</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(30px, 5.6vw, 46px)', color: PINE, margin: '0 0 6px', lineHeight: 1 }}>{heading || 'White Christmas'}</h2>
        {date && <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: PINE_SOFT, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .wx {
    --wx-sky: ${SKY};
    --wx-sky-pale: ${SKY_PALE};
    --wx-frost: ${FROST};
    --wx-gold-light: ${GOLD_LIGHT};
    --wx-gold: ${GOLD};
    --wx-gold-deep: ${GOLD_DEEP};
    --wx-blush: ${BLUSH};
    --wx-silver: ${SILVER};
    --wx-pine: ${PINE};
    --wx-pine-soft: ${PINE_SOFT};
    --wx-bark: ${BARK};
    --wx-font-display: 'Cormorant Garamond', Georgia, serif;
    --wx-font-caps: 'Cinzel', Georgia, serif;
    --wx-font-sans: 'Lato', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .wx * { box-sizing: border-box; }
  .wx { margin: 0; background: var(--wx-sky-pale); color: var(--wx-pine); font-family: var(--wx-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .wx img { max-width: 100%; }

  /* ─ snow & sparkle ─ */
  @keyframes wx-fall { 0% { transform: translate(0, -10vh); opacity: 0; } 10% { opacity: 1; } 100% { transform: translate(var(--drift, 20px), 110vh); opacity: 0.25; } }
  @keyframes wx-spin { to { rotate: 360deg; } }
  @keyframes wx-twinkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(1.15) rotate(22deg); opacity: 0.8; } }
  @keyframes wx-snowlayer { from { background-position: 0 0; } to { background-position: 0 var(--wx-layer-h, 402px); } }
  @keyframes wx-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @media (prefers-reduced-motion: reduce) {
    .wx .wx-snow { display: none; }
    .wx .wx-twinkle, .wx .wx-snow-layer, .wx .hero-content > * { animation: none !important; }
  }
  .wx .wx-snow { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
  .wx .wx-dot { position: absolute; top: 0; border-radius: 50%; background: ${SNOW}; box-shadow: 0 0 4px rgba(120,140,170,0.45); animation: wx-fall linear infinite; }
  .wx .wx-flake { position: absolute; top: 0; filter: drop-shadow(0 0 2px rgba(120,140,170,0.55)); animation: wx-fall linear infinite, wx-spin 7s linear infinite; }
  .wx .wx-on-dark .wx-dot { box-shadow: 0 0 6px rgba(255,255,255,0.7); }
  /* the snowflake image layers, scrolling down endlessly at two speeds */
  .wx .wx-snow-layer { position: absolute; inset: 0; pointer-events: none; z-index: 1; background-image: url(${IMG}/snow-layer.webp); background-repeat: repeat; animation: wx-snowlayer linear infinite; }
  .wx .wx-snow-layer.near { background-size: 900px auto; --wx-layer-h: 402px; animation-duration: 18s; opacity: 0.95; }
  .wx .wx-snow-layer.far { background-size: 560px auto; --wx-layer-h: 250px; animation-duration: 30s; opacity: 0.6; background-position: 200px 0; }
  .wx .wx-rule { position: relative; width: 220px; height: 22px; margin: 0 auto 22px; display: flex; align-items: center; justify-content: center; }
  .wx .wx-rule > svg:first-child { position: absolute; inset: 0; margin: auto; }
  .wx .wx-twinkle { position: relative; animation: wx-twinkle 4s ease-in-out infinite; }

  .wx .eyebrow { font-family: var(--wx-font-caps); font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: var(--wx-gold-deep); margin: 0 0 12px; font-weight: 500; }
  .wx .eyebrow.on-dark { color: var(--wx-gold-light); }
  .wx .section-title { font-family: var(--wx-font-display); font-style: italic; font-size: clamp(40px, 5.2vw, 62px); font-weight: 500; color: var(--wx-pine); margin: 0 0 18px; line-height: 1.08; }
  .wx .section-title.on-dark { color: #FFFFFF; }

  .wx .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; }
  .wx .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .wx .section { position: relative; padding: 108px 28px; background: var(--wx-sky-pale); overflow: hidden; }
  .wx .section-white { background: #FFFFFF; }
  .wx .section-frost { background: linear-gradient(to bottom, ${SKY_PALE} 0%, ${SKY} 100%); }
  .wx .section-center { text-align: center; }
  @media (max-width: 640px) { .wx .section { padding: 74px 22px; } }

  .wx .btn { font-family: var(--wx-font-caps); font-size: 12px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; padding: 16px 34px; border-radius: 2px; border: 1px solid var(--wx-pine); background: var(--wx-pine); color: #FFFFFF; cursor: pointer; transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .wx .btn:hover { background: var(--wx-bark); border-color: var(--wx-bark); }
  .wx .btn-outline { background: rgba(255,255,255,0.6); color: var(--wx-pine); border-color: var(--wx-gold-deep); }
  .wx .btn-outline:hover { background: var(--wx-gold); border-color: var(--wx-gold); color: var(--wx-pine); }

  .wx input, .wx textarea, .wx select { font-family: var(--wx-font-sans); font-size: 15px; padding: 12px 2px; border: none; border-bottom: 1px solid var(--wx-frost); border-radius: 0; outline: none; background: transparent; color: var(--wx-pine); width: 100%; display: block; transition: border-color 0.2s ease; }
  .wx textarea { border: 1px solid var(--wx-frost); padding: 12px 14px; }
  .wx input:focus, .wx textarea:focus, .wx select:focus { border-color: var(--wx-gold-deep); }
  .wx label.field-label { font-family: var(--wx-font-caps); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--wx-gold-deep); display: block; margin-bottom: 2px; font-weight: 500; }
  .wx .radio-label, .wx .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--wx-pine); cursor: pointer; }
  .wx .radio-label input, .wx .check-label input { width: auto; border: none; padding: 0; accent-color: var(--wx-pine); }
  .wx .check-hint { font-size: 12px; color: var(--wx-pine-soft); margin: 4px 0 0; }
  .wx .attend-options { display: flex; gap: 24px; margin-top: 10px; flex-wrap: wrap; }
  .wx .rsvp-error { color: #8A2C1F; font-size: 13px; margin: 0; }
  .wx .rsvp-success { text-align: center; padding: 20px 0; }
  .wx .rsvp-headline { font-family: var(--wx-font-display); font-style: italic; font-size: 38px; color: var(--wx-pine); margin: 0 0 10px; font-weight: 500; }
  .wx .rsvp-sub { font-size: 14px; color: var(--wx-pine-soft); margin: 0; }
  .wx .rsvp-form { display: flex; flex-direction: column; gap: 20px; }

  /* hero: the garland lines the bottom of the photo, so the invitation sits in the sky above */
  .wx .hero { position: relative; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; text-align: center; padding: 14vh 24px 30vh; background: var(--wx-sky); overflow: hidden; }
  .wx .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center bottom; z-index: 0; }
  .wx .hero-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, rgba(238,243,249,0.55) 0%, rgba(238,243,249,0) 60%); z-index: 0; pointer-events: none; }
  .wx .hero-content { position: relative; z-index: 2; max-width: 780px; }
  .wx .hero-star { animation: wx-in 1.2s ease both; display: block; margin: 0 auto 14px; }
  .wx .hero-eyebrow { animation: wx-in 1.2s ease 0.1s both; font-family: var(--wx-font-caps); font-size: 14px; letter-spacing: 6px; text-transform: uppercase; color: var(--wx-gold-deep); margin: 0 0 14px; }
  .wx .hero-name { animation: wx-in 1.2s ease 0.25s both; font-family: var(--wx-font-display); font-style: italic; font-size: clamp(60px, 10vw, 128px); font-weight: 500; color: var(--wx-pine); margin: 0 0 18px; line-height: 0.98; text-shadow: 0 2px 22px rgba(255,255,255,0.8); }
  .wx .hero-date { animation: wx-in 1.2s ease 0.4s both; font-family: var(--wx-font-caps); font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: var(--wx-pine-soft); margin: 0 0 32px; }
  .wx .hero-actions { animation: wx-in 1.2s ease 0.55s both; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
  @media (max-width: 720px) { .wx .hero { padding: 12vh 20px 34vh; } }

  /* countdown: the glass bauble under a pine veil, with gold numerals */
  .wx .countdown-shell { position: relative; background: var(--wx-pine); background-size: cover; background-position: center; overflow: hidden; }
  .wx .countdown-shell::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(59,62,61,0.82) 0%, rgba(59,62,61,0.66) 50%, rgba(59,62,61,0.86) 100%); }
  .wx .countdown-wrap { position: relative; z-index: 2; padding: 116px 24px; text-align: center; }
  .wx .countdown-wrap .eyebrow { color: var(--wx-gold-light); }
  .wx .countdown-heading { font-family: var(--wx-font-display); font-style: italic; font-size: clamp(42px, 5.4vw, 64px); color: #FFFFFF; margin: 0 0 42px; font-weight: 500; }
  .wx .countdown-row { display: flex; justify-content: center; }
  .wx .countdown-block { text-align: center; min-width: 108px; padding: 0 clamp(14px, 3vw, 32px); border-left: 1px solid rgba(235,197,149,0.45); }
  .wx .countdown-block:first-child { border-left: none; }
  .wx .countdown-value { font-family: var(--wx-font-display); font-size: clamp(46px, 6vw, 78px); color: var(--wx-gold-light); font-weight: 500; line-height: 1; }
  .wx .countdown-label { font-family: var(--wx-font-caps); font-size: 11px; letter-spacing: 3.5px; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-top: 12px; }
  @media (max-width: 520px) { .wx .countdown-block { min-width: 0; padding: 0 12px; } }

  /* details: frosted cards with a gold double frame */
  .wx .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 14px; }
  @media (max-width: 720px) { .wx .details-grid { grid-template-columns: 1fr; } }
  .wx .details-card { background: #FFFFFF; padding: 48px 34px; box-shadow: inset 0 0 0 1px ${FROST}, inset 0 0 0 8px #FFFFFF, inset 0 0 0 9px rgba(214,171,124,0.55), 0 22px 44px -30px rgba(59,62,61,0.4); }
  .wx .details-card .label { font-family: var(--wx-font-caps); font-size: 12px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--wx-gold-deep); margin: 0 0 14px; }
  .wx .details-card .time { font-family: var(--wx-font-display); font-style: italic; font-size: 40px; line-height: 1.1; color: var(--wx-pine); font-weight: 500; margin-bottom: 10px; }
  .wx .details-card p { font-size: 15px; color: var(--wx-pine-soft); margin: 0 0 4px; }
  .wx .map-frame { overflow: hidden; min-height: 260px; padding: 9px; background: #FFFFFF; box-shadow: inset 0 0 0 1px ${FROST}, 0 22px 44px -30px rgba(59,62,61,0.4); }
  .wx .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 260px; }
  .wx .directions-link { text-align: center; margin-top: 28px; }
  .wx .directions-link a { font-family: var(--wx-font-caps); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--wx-pine); text-decoration: none; border-bottom: 1px solid var(--wx-gold); padding-bottom: 4px; }

  /* program */
  .wx .schedule-day { max-width: 600px; margin: 0 auto 50px; }
  .wx .schedule-day:last-child { margin-bottom: 0; }
  .wx .schedule-day-title { font-family: var(--wx-font-display); font-style: italic; font-size: 28px; color: var(--wx-gold-deep); margin: 0 0 16px; }
  .wx .schedule-list { border-top: 1px solid var(--wx-gold); text-align: left; }
  .wx .schedule-row { display: flex; gap: 26px; padding: 18px 0; border-bottom: 1px solid ${FROST}; align-items: baseline; }
  .wx .schedule-time { font-family: var(--wx-font-caps); font-size: 13px; letter-spacing: 2px; color: var(--wx-gold-deep); min-width: 120px; flex-shrink: 0; }
  .wx .schedule-info .name { font-family: var(--wx-font-display); font-size: 24px; color: var(--wx-pine); margin: 0 0 2px; }
  .wx .schedule-info .loc { font-size: 14px; color: var(--wx-pine-soft); margin: 0; }

  /* rsvp: a snowy white room with snowflakes drifting down over it */
  .wx .rsvp-section { position: relative; padding: 110px 24px; background: var(--wx-sky) center / cover no-repeat; overflow: hidden; text-align: center; }
  .wx .rsvp-section::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(218,228,240,0.78) 0%, rgba(218,228,240,0.55) 50%, rgba(218,228,240,0.85) 100%); z-index: 0; }
  .wx .rsvp-card { position: relative; z-index: 2; max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.94); padding: 52px 44px 44px; text-align: left; box-shadow: inset 0 0 0 1px ${FROST}, inset 0 0 0 8px rgba(255,255,255,0.94), inset 0 0 0 9px rgba(214,171,124,0.55), 0 34px 70px -36px rgba(59,62,61,0.5); }
  @media (max-width: 640px) { .wx .rsvp-card { padding: 42px 24px 34px; } }

  .wx .gallery-tile { overflow: hidden; border-radius: 2px; }

  /* registry, over the tree and gifts */
  .wx .registry-wrap { position: relative; width: 100%; min-height: 400px; display: flex; align-items: center; justify-content: flex-end; background-size: cover; background-position: left center; padding: 72px 8vw; }
  .wx .registry-overlay { background: rgba(255,255,255,0.94); padding: 52px 56px; text-align: center; max-width: 520px; box-shadow: inset 0 0 0 1px ${FROST}, inset 0 0 0 8px rgba(255,255,255,0.94), inset 0 0 0 9px rgba(214,171,124,0.55), 0 30px 60px -36px rgba(59,62,61,0.45); }
  @media (max-width: 760px) { .wx .registry-wrap { justify-content: center; padding: 60px 20px; } .wx .registry-overlay { padding: 40px 24px; } }
  .wx .registry-title { font-family: var(--wx-font-display); font-style: italic; font-size: 44px; color: var(--wx-pine); margin: 0 0 12px; font-weight: 500; }
  .wx .registry-description { font-size: 15px; color: var(--wx-pine-soft); margin: 0 auto 26px; line-height: 1.8; max-width: 400px; }
  .wx .registry-button { display: inline-block; padding: 16px 34px; background: var(--wx-pine); color: #FFFFFF; text-decoration: none; font-family: var(--wx-font-caps); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; }
  .wx .registry-button:hover { background: var(--wx-bark); }

  /* songs */
  .wx .song-section { background: linear-gradient(to bottom, ${SKY_PALE} 0%, ${SKY} 100%); padding: 108px 28px; text-align: center; }
  .wx .song-section .song-list { border-top: 1px solid var(--wx-gold); max-width: 540px; margin: 0 auto; }
  .wx .song-section .song-row { border-bottom: 1px solid ${FROST}; padding: 12px 0; }
  .wx .song-section .song-row .title { color: var(--wx-pine); font-family: var(--wx-font-display); font-size: 19px; }
  .wx .song-section .song-row .artist { color: var(--wx-pine-soft); }

  /* share */
  .wx .share-band { padding: 100px 24px; background: #FFFFFF; text-align: center; }
  .wx .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .wx .share-hashtag { font-family: var(--wx-font-display); font-style: italic; font-size: clamp(40px, 5.6vw, 60px); color: var(--wx-pine); margin: 0 0 30px; font-weight: 500; overflow-wrap: anywhere; }

  /* footer: a snowy pine night with a gold star */
  .wx .footer { position: relative; padding: 96px 24px 72px; background: linear-gradient(to bottom, ${PINE} 0%, #2B2D2C 100%); text-align: center; overflow: hidden; }
  .wx .footer-inner { position: relative; z-index: 2; }
  .wx .footer p { font-size: 15px; color: rgba(255,255,255,0.85); margin: 0 0 4px; }
  .wx .footer-star { display: block; margin: 0 auto 20px; filter: drop-shadow(0 0 10px rgba(235,197,149,0.6)); }
  .wx .footer-signoff { font-family: var(--wx-font-display); font-style: italic; font-size: clamp(36px, 5.6vw, 54px) !important; font-weight: 500; color: var(--wx-gold-light) !important; margin: 32px 0 0 !important; }
  .wx .footer-credit { font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,0.5) !important; margin-top: 28px !important; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'The evening',
    ourStoryLabel: 'The season of joy',
    howWeGotHere: 'An evening of winter magic',
    theDetails: 'The details',
    dateAndLocation: 'Date & location',
    ceremony: 'The evening',
    reception: 'Location',
    theSchedule: 'The evening ahead',
    eventProgram: 'Programme',
    kindlyRespond: 'Kindly reply',
    memoriesSoFar: 'Season’s moments',
    ourMoments: 'Winter memories',
    registry: 'Gift exchange',
    viewRegistry: 'See the details',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'Our Christmas celebration',
    todayIsTheDay: 'Merry Christmas — tonight’s the night!',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, holiday wishes…',
    buildOurPlaylist: 'Carols & classics',
    withLove: 'Season’s greetings,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La soirée',
    ourStoryLabel: 'La saison de la joie',
    howWeGotHere: 'Une soirée de magie hivernale',
    theDetails: 'Les détails',
    dateAndLocation: 'Date et lieu',
    ceremony: 'La soirée',
    reception: 'Lieu',
    theSchedule: 'Au programme',
    eventProgram: 'Programme',
    kindlyRespond: 'Merci de répondre',
    memoriesSoFar: 'Moments de saison',
    ourMoments: 'Souvenirs d’hiver',
    registry: 'Échange de cadeaux',
    viewRegistry: 'Voir les détails',
    countingDown: 'Compte à rebours jusqu’à',
    untilWeSayIDo: 'Notre fête de Noël',
    todayIsTheDay: 'Joyeux Noël — c’est ce soir !',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Restrictions alimentaires, vœux des fêtes…',
    buildOurPlaylist: 'Chants et classiques',
    withLove: 'Joyeuses fêtes,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La velada',
    ourStoryLabel: 'La época de alegría',
    howWeGotHere: 'Una velada de magia invernal',
    theDetails: 'Los detalles',
    dateAndLocation: 'Fecha y lugar',
    ceremony: 'La velada',
    reception: 'Lugar',
    theSchedule: 'El programa',
    eventProgram: 'Programa',
    kindlyRespond: 'Por favor, confirma',
    memoriesSoFar: 'Momentos de la temporada',
    ourMoments: 'Recuerdos de invierno',
    registry: 'Intercambio de regalos',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Cuenta regresiva para',
    untilWeSayIDo: 'Nuestra celebración navideña',
    todayIsTheDay: '¡Feliz Navidad, es esta noche!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Restricciones alimentarias, buenos deseos…',
    buildOurPlaylist: 'Villancicos y clásicos',
    withLove: '¡Felices fiestas!',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };

export default function WhiteChristmas({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['white-christmas'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--wx-font-sans)', fontSize: 17, lineHeight: 1.95, color: 'var(--wx-pine-soft)' };

  return (
    <div className="wx">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Lato:wght@400;700&display=swap" />
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
          <GoldStar className="hero-star wx-twinkle" size={38} />
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
          <div id="story" className="section section-white section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <StarRule />
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
        <div className="countdown-shell wx-on-dark" style={{ backgroundImage: `url(${IMG}/bauble.jpeg)` }}>
          <Snowfall />
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
          <div className="section section-frost section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 700, color: 'var(--wx-pine)' }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p style={{ marginTop: 12 }}><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wx-pine)', textDecoration: 'none', borderBottom: `1px solid ${GOLD}` }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-frost section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--wx-pine-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-white section-center">
            <div className="wrap">
              <StarRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-white section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
              <StarRule />
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

      {/* RSVP — snowflakes drifting over a snowy white room */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section" style={{ backgroundImage: `url(${IMG}/rsvp-room.jpeg)` }}>
          <div className="wx-snow-layer far" aria-hidden="true" />
          <div className="wx-snow-layer near" aria-hidden="true" />
          {/* Reveal animates with a transform, which starts a new stacking
              context — lift it so the snow falls behind the card, not over it */}
          <Reveal style={{ position: 'relative', zIndex: 2 }}>
            <div className="rsvp-card">
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <StarRule />
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
        <div className="section section-white section-center">
          <div className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <StarRule />
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
          <div className="section section-frost section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 2, border: `1px solid ${FROST}` }} textStyle={{ color: 'var(--wx-pine-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-frost section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <StarRule />
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
              <StarRule />
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
      <footer className="footer wx-on-dark">
        <Snowfall />
        <div className="footer-inner">
          <GoldStar className="footer-star wx-twinkle" size={44} />
          <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 10 }} fallback={t.questions} />
          <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
          {editSlots?.footerContact ?? (
            <>
              {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
              {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: GOLD_LIGHT, textDecoration: 'none' }}>{userEmail}</a></p>}
              {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: GOLD_LIGHT, textDecoration: 'none' }}>{userPhone}</a></p>}
            </>
          )}
          <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
          <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
        </div>
      </footer>
    </div>
  );
}
