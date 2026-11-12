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
import { JsonLd } from '@/app/ui/marketing/json-ld';
import { eventJsonLd } from './event-json-ld';

const IMG = '/images/themes/fireworks';
// The default banner: a glowing tree spiralling up through falling snow. Its first frame is the
// poster, so the page paints at once; the still in HERO_DEFAULTS is for previews and cards.
const HERO_VIDEO = `${IMG}/hero.mp4`;
const NYE = '/images/themes/new-years-eve';

// Fireworks' own two photos, and four parties from New Year's Eve.
const GALLERY_PATHS = [`${IMG}/photo-1.jpeg`, `${NYE}/photo-2.jpeg`, `${IMG}/photo-2.jpeg`, `${NYE}/photo-1.jpeg`, `${NYE}/photo-4.jpeg`, `${NYE}/photo-3.jpeg`];
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `fw-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// A night sky lit by fireworks: deep violet, ember and rose, peach and
// champagne gold, with pops of coral, mint and lilac.
const NIGHT = '#0E0B14';
const VIOLET = '#1B1626';
const PLUM = '#2A2236';
const DUSK = '#5F577D';
const LILAC = '#837397';
const EMBER = '#634640';
const ROSE = '#CD7364';
const CORAL = '#EF9488';
const PEACH = '#D49775';
const GOLD = '#D9B997';
const GOLD_PALE = '#FDE0A6';
const MINT = '#82B593';
const SPARK = '#FCF7EB';
const PAPER = '#FBF6EE';

// The burst colours, in the order the page cycles through them.
const POPS = [GOLD_PALE, CORAL, MINT, LILAC, PEACH];

// ─── ornaments ───────────────────────────────────────────

// Fireworks over the banner, drawn in CSS: a rocket climbs, then bursts into glowing sparks
// that fly out, slow down, drop a little and fade, each burst on its own timing. They sit
// above the tree and the words. Fixed values so the server and client render alike.
const BURSTS = [
  { left: '58%', top: '16%', r: 120, color: GOLD_PALE, delay: '0.4s', dur: '4.6s' },
  { left: '86%', top: '12%', r: 140, color: CORAL, delay: '2.1s', dur: '5.2s' },
  { left: '72%', top: '6%', r: 90, color: MINT, delay: '3.4s', dur: '4.9s' },
  { left: '40%', top: '9%', r: 100, color: LILAC, delay: '1.3s', dur: '5.6s' },
];
// A fixed scatter (not random) so the sparks spread like a real shell, not in a pattern.
const scatter = (n: number) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };
const SPARKS = Array.from({ length: 52 }, (_, i) => {
  const a = (i / 52) * Math.PI * 2 + (scatter(i + 1) - 0.5) * 0.2;
  const d = 0.4 + Math.sqrt(scatter(i + 101)) * 0.6;
  return { x: Math.round(Math.cos(a) * d * 100) / 100, y: Math.round(Math.sin(a) * d * 100) / 100, white: i % 4 === 0 };
});

function Bursts() {
  return (
    <div className="fw-bursts" aria-hidden="true">
      {BURSTS.map((b) => (
        <span key={`${b.left}-${b.top}`} className="fw-burst" style={{ left: b.left, top: b.top, color: b.color, ['--fw-r' as string]: `${b.r}px`, ['--fw-delay' as string]: b.delay, ['--fw-dur' as string]: b.dur } as React.CSSProperties}>
          <b className="fw-rocket" />
          {SPARKS.map((p, i) => <i key={i} className={p.white ? 'fw-white' : undefined} style={{ ['--fw-x' as string]: p.x, ['--fw-y' as string]: p.y } as React.CSSProperties} />)}
        </span>
      ))}
    </div>
  );
}

// A little starburst, the theme's mark.
function Burst({ size = 24, color = GOLD_PALE, className, style }: { size?: number; color?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => <path key={r} d="M12 4.5 V1.5" transform={`rotate(${r} 12 12)`} />)}
      {[22.5, 112.5, 202.5, 292.5].map((r) => <circle key={r} cx="12" cy="5.5" r="0.9" fill={color} stroke="none" transform={`rotate(${r} 12 12)`} />)}
      <circle cx="12" cy="12" r="2.2" fill={color} stroke="none" />
    </svg>
  );
}

// Fine lines with a burst between them in the theme's colours — the section rule.
function BurstRule({ align = 'center', i = 0 }: { align?: 'center' | 'left'; i?: number }) {
  return (
    <div className={`fw-rule${align === 'left' ? ' fw-rule-left' : ''}`} aria-hidden="true">
      <span className="fw-rule-line" />
      <Burst size={22} color={POPS[i % POPS.length]} className="fw-twinkle" />
      <span className="fw-rule-line" />
    </div>
  );
}

// Confetti drifting down over the footer, in every colour of the night.
const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 11.3 + 3) % 100}%`,
  w: i % 3 === 0 ? 5 : 8 + (i % 4) * 2,
  h: i % 3 === 0 ? 5 : 3,
  color: POPS[i % POPS.length],
  delay: `-${(i * 1.37) % 12}s`,
  dur: `${9 + (i % 5) * 2.2}s`,
  still: `${(i * 29 + 6) % 90}%`,
}));

function Confetti() {
  return (
    <div className="fw-confetti" aria-hidden="true">
      {CONFETTI.map((c) => (
        <span key={c.left} style={{ left: c.left, width: c.w, height: c.h, background: c.color, animationDelay: c.delay, animationDuration: c.dur, ['--fw-still' as string]: c.still } as React.CSSProperties} />
      ))}
    </div>
  );
}

// A full-bleed background photo that loads only as its section comes near
// (a CSS background would load with the page).
function Bg({ src, className = '', position = 'center' }: { src: string; className?: string; position?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`fw-bg ${className}`} src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" style={{ objectPosition: position }} />;
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: NIGHT, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...previewImage(bannerImage || HERO_DEFAULTS.fireworks)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 55%, rgba(14,11,20,0.5), rgba(14,11,20,0.85))' }} />
      {[['10%', '16%', 30, GOLD_PALE], ['84%', '14%', 34, CORAL], ['18%', '70%', 20, MINT], ['88%', '66%', 22, LILAC], ['52%', '8%', 18, PEACH]].map(([l, t, z, c]) => (
        <span key={`${l}-${t}`} style={{ position: 'absolute', left: l, top: t }}><Burst size={z as number} color={c as string} /></span>
      ))}
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own faces */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Jost:wght@500&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 18px' }}>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 500, letterSpacing: 4, textTransform: 'uppercase', color: GOLD_PALE, margin: '0 0 8px' }}>You&rsquo;re invited</p>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(28px, 4.4vw, 40px)', color: SPARK, margin: '0 0 10px', lineHeight: 1.05 }}>{heading || 'Fireworks'}</h2>
        {date && <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 8, fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase', color: GOLD, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .fw {
    --fw-night: ${NIGHT};
    --fw-violet: ${VIOLET};
    --fw-plum: ${PLUM};
    --fw-dusk: ${DUSK};
    --fw-lilac: ${LILAC};
    --fw-ember: ${EMBER};
    --fw-rose: ${ROSE};
    --fw-coral: ${CORAL};
    --fw-peach: ${PEACH};
    --fw-gold: ${GOLD};
    --fw-gold-pale: ${GOLD_PALE};
    --fw-mint: ${MINT};
    --fw-spark: ${SPARK};
    --fw-paper: ${PAPER};
    --fw-font-display: 'DM Serif Display', Georgia, serif;
    --fw-font-sans: 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .fw * { box-sizing: border-box; }
  .fw { margin: 0; background: var(--fw-night); color: var(--fw-gold); font-family: var(--fw-font-sans); font-weight: 400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .fw img { max-width: 100%; }
  .fw .fw-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; }

  /* ─ motion: bursting fireworks, twinkles, confetti ─ */
  /* each spark is a streak from the centre: its head flies out, then its tail follows and it fades */
  @keyframes fw-fall { 0% { transform: translate3d(0, -30px, 0) rotate(0deg) rotateY(0deg); } 50% { transform: translate3d(-10px, 52vh, 0) rotate(320deg) rotateY(360deg); } 100% { transform: translate3d(-4px, 108vh, 0) rotate(640deg) rotateY(720deg); } }
  @keyframes fw-twinkle { 0%, 100% { transform: scale(0.75) rotate(0deg); opacity: 0.6; } 50% { transform: scale(1.1) rotate(22deg); opacity: 1; } }
  @keyframes fw-push { from { transform: scale(1.08); } to { transform: scale(1); } }
  @keyframes fw-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fw-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes fw-shine { 0% { background-position: -160% 0; } 60%, 100% { background-position: 260% 0; } }
  @keyframes fw-glow { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .fw .fw-burst > *, .fw .fw-burst::after, .fw .fw-confetti span, .fw .fw-twinkle, .fw .hero-bg, .fw .hero-inner > *, .fw .btn::after, .fw .fw-seal, .fw .fw-sky { animation: none !important; }
    .fw .fw-bursts { display: none; }
    .fw .fw-confetti span { top: var(--fw-still, 30%); }
  }
  .fw .fw-twinkle { display: block; animation: fw-twinkle 3.4s ease-in-out infinite; transform-origin: center; }
  .fw .fw-rule { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0 auto 22px; }
  .fw .fw-rule svg { flex: none; }
  .fw .fw-rule-left { justify-content: flex-start; }
  .fw .fw-rule-line { width: 56px; height: 1px; background: linear-gradient(to right, rgba(217,185,151,0), var(--fw-gold), rgba(217,185,151,0)); }
  .fw .fw-rule-left .fw-rule-line:first-child { display: none; }

  .fw .eyebrow { font-family: var(--fw-font-sans); font-size: 12px; font-weight: 500; letter-spacing: 5px; text-transform: uppercase; color: var(--fw-coral); margin: 0 0 14px; }
  .fw .eyebrow.on-dark { color: var(--fw-gold-pale); }
  .fw .section-title { font-family: var(--fw-font-display); font-size: clamp(38px, 5vw, 60px); font-weight: 400; font-style: italic; color: var(--fw-spark); margin: 0 0 18px; line-height: 1.06; }
  .fw .section-title.on-dark { color: var(--fw-spark); }
  .fw .on-light .section-title { color: var(--fw-night); }
  .fw .on-light .eyebrow { color: var(--fw-rose); }

  .fw .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1; }
  .fw .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1; }
  .fw .section { position: relative; padding: 112px 28px; background: var(--fw-night); overflow: hidden; }
  .fw .section-violet { background: var(--fw-violet); }
  .fw .section-plum { background: var(--fw-plum); }
  .fw .section-center { text-align: center; }
  /* confetti dots in every colour */
  .fw .section-dots { background-image: radial-gradient(rgba(253,224,166,0.22) 1.2px, transparent 1.8px), radial-gradient(rgba(239,148,136,0.2) 1.2px, transparent 1.8px), radial-gradient(rgba(130,181,147,0.2) 1.2px, transparent 1.8px); background-size: 46px 46px, 46px 46px, 46px 46px; background-position: 0 0, 23px 15px, 11px 31px; }
  @media (max-width: 640px) { .fw .section { padding: 80px 20px; } }
  /* where a dark section meets a paper-white one, its edge melts softly into the paper
     (inside its padding, so the words stay clear) instead of stopping at a hard line */
  .fw { --fw-melt-h: 32px; --fw-melt-top: none; --fw-melt-bottom: none; }
  .fw .hero:has(+ main > .story:first-child),
  .fw main > :has(+ :is(.story, .details-section, .registry-wrap:not(.has-photo))) { --fw-melt-bottom: linear-gradient(to top, ${PAPER} 0, rgba(251,246,238,0.72) calc(var(--fw-melt-h) * 0.25), rgba(251,246,238,0.36) calc(var(--fw-melt-h) * 0.55), rgba(251,246,238,0.1) calc(var(--fw-melt-h) * 0.8), rgba(251,246,238,0) var(--fw-melt-h)); }
  .fw main > :is(.story, .details-section, .registry-wrap:not(.has-photo)) + * { --fw-melt-top: linear-gradient(to bottom, ${PAPER} 0, rgba(251,246,238,0.72) calc(var(--fw-melt-h) * 0.25), rgba(251,246,238,0.36) calc(var(--fw-melt-h) * 0.55), rgba(251,246,238,0.1) calc(var(--fw-melt-h) * 0.8), rgba(251,246,238,0) var(--fw-melt-h)); }
  .fw .hero:has(+ main > .story:first-child)::after,
  .fw main > :has(+ :is(.story, .details-section, .registry-wrap:not(.has-photo)))::after,
  .fw main > :is(.story, .details-section, .registry-wrap:not(.has-photo)) + *::after { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; background-image: var(--fw-melt-top), var(--fw-melt-bottom); background-repeat: no-repeat; }
  .fw .hero:has(+ main > .story:first-child), .fw main > :has(+ :is(.story, .details-section, .registry-wrap:not(.has-photo))), .fw main > :is(.story, .details-section, .registry-wrap:not(.has-photo)) + * { position: relative; }
  @media (max-width: 640px) { .fw { --fw-melt-h: 22px; } }

  /* buttons: peach to gold, with a light sweeping across now and then */
  .fw .btn { position: relative; overflow: hidden; font-family: var(--fw-font-sans); font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 17px 34px; border-radius: 999px; border: 1px solid transparent; background: linear-gradient(120deg, ${CORAL} 0%, ${PEACH} 45%, ${GOLD_PALE} 100%); color: var(--fw-night); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease, border-color 0.3s ease; text-decoration: none; display: inline-block; line-height: 1; height: auto; }
  .fw .btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 30%, rgba(255,252,240,0.7) 50%, transparent 70%) no-repeat; background-size: 60% 100%; background-position: -160% 0; animation: fw-shine 5.5s ease-in-out infinite; pointer-events: none; }
  @supports (text-box: trim-both cap alphabetic) { .fw .btn { text-box: trim-both cap alphabetic; padding-top: calc(17px + (1em - 1cap) / 2); padding-bottom: calc(17px + (1em - 1cap) / 2); } }
  .fw .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -12px rgba(239,148,136,0.85); }
  .fw .btn-outline { background: transparent; color: var(--fw-spark); border-color: rgba(253,224,166,0.7); }
  .fw .btn-outline::after { display: none; }
  .fw .btn-outline:hover { background: var(--fw-gold-pale); border-color: var(--fw-gold-pale); color: var(--fw-night); box-shadow: none; }
  .fw .btn-outline.on-dark { color: var(--fw-spark); }

  .fw input, .fw textarea, .fw select { font-family: var(--fw-font-sans); font-size: 15px; padding: 13px 16px; border: 1px solid #E3D6C6; border-radius: 10px; outline: none; background: #fff; color: var(--fw-night); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .fw input:focus, .fw textarea:focus, .fw select:focus { border-color: var(--fw-coral); box-shadow: 0 0 0 3px rgba(239,148,136,0.25); }
  .fw input::placeholder, .fw textarea::placeholder { color: rgba(14,11,20,0.4); }
  .fw label.field-label { font-family: var(--fw-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--fw-rose); display: block; margin-bottom: 7px; font-weight: 600; }
  .fw .radio-label, .fw .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--fw-night); cursor: pointer; }
  .fw .radio-label input, .fw .check-label input { width: auto; border: none; padding: 0; accent-color: var(--fw-rose); box-shadow: none; }
  .fw .check-hint { font-family: var(--fw-font-sans); font-size: 12px; color: rgba(14,11,20,0.62); margin: 4px 0 0; }
  .fw .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .fw .rsvp-error { color: #A8392D; font-size: 13px; margin: 0; font-family: var(--fw-font-sans); }
  .fw .rsvp-success { text-align: center; padding: 20px 0; }
  .fw .rsvp-headline { font-family: var(--fw-font-display); font-style: italic; font-size: 48px; color: var(--fw-rose); margin: 0 0 8px; font-weight: 400; line-height: 1.1; }
  .fw .rsvp-sub { font-size: 14px; color: var(--fw-night); margin: 0; }
  .fw .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: a glowing tree in the snow (or the host's banner), fireworks going off above */
  .fw .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 20px 100px; background: var(--fw-night); overflow: hidden; text-align: center; }
  .fw .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: 0; animation: fw-push 14s cubic-bezier(0.2, 0.6, 0.3, 1) both; }
  .fw .hero-overlay { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 70% 60% at 50% 52%, rgba(14,11,20,0.62) 0%, rgba(14,11,20,0.5) 55%, rgba(14,11,20,0.8) 100%); }
  /* the default tree banner: the tree glows on the left, so the words sit on the right */
  .fw .hero--tree .hero-overlay { background: linear-gradient(90deg, rgba(14,11,20,0.15) 0%, rgba(14,11,20,0.3) 45%, rgba(14,11,20,0.62) 75%, rgba(14,11,20,0.72) 100%); }
  @media (min-width: 900px) {
    .fw .hero--tree { justify-content: flex-end; padding-right: 5vw; }
    .fw .hero--tree .hero-inner { width: 50%; max-width: 640px; }
    .fw .hero--tree .hero-name { font-size: clamp(56px, 6.6vw, 112px); }
  }
  @media (max-width: 899px) {
    .fw .hero--tree .hero-bg { object-position: 30% center; }
    .fw .hero--tree .hero-overlay { background: radial-gradient(ellipse 90% 60% at 50% 50%, rgba(14,11,20,0.6) 0%, rgba(14,11,20,0.45) 60%, rgba(14,11,20,0.75) 100%); }
  }
  /* fireworks: the rocket climbs (0–20%), bursts, the sparks spread, slow, fall and fade */
  .fw .fw-bursts { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
  .fw .fw-burst { position: absolute; width: 0; height: 0; }
  .fw .fw-burst > * { animation-duration: var(--fw-dur); animation-delay: var(--fw-delay); animation-iteration-count: infinite; animation-fill-mode: both; }
  .fw .fw-rocket { position: absolute; left: -1px; top: 0; width: 2px; height: 26px; border-radius: 2px; background: linear-gradient(to bottom, #fff, currentColor 30%, transparent); opacity: 0; animation-name: fw-rise; animation-timing-function: cubic-bezier(0.3, 0.6, 0.4, 1); }
  .fw .fw-burst::after { content: ''; position: absolute; left: 0; top: 0; width: calc(var(--fw-r) * 1.6); height: calc(var(--fw-r) * 1.6); border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, #fff 50%, currentColor) 0%, color-mix(in srgb, currentColor 18%, transparent) 25%, transparent 60%); opacity: 0; animation: fw-flash var(--fw-dur) ease-out var(--fw-delay) infinite both; }
  .fw .fw-burst i { position: absolute; left: -1.5px; top: -1.5px; width: 3px; height: 3px; border-radius: 50%; background: currentColor; box-shadow: 0 0 5px 1px currentColor, 0 0 12px 2px color-mix(in srgb, currentColor 40%, transparent); opacity: 0; animation-name: fw-spark; }
  .fw .fw-burst i.fw-white { background: #fff8e8; box-shadow: 0 0 6px 1px #fff3d0; }
  @keyframes fw-rise {
    0% { transform: translateY(260px); opacity: 0; }
    3% { opacity: 0.9; }
    19% { transform: translateY(0); opacity: 0.9; }
    20%, 100% { transform: translateY(0); opacity: 0; }
  }
  @keyframes fw-spark {
    0%, 19% { transform: translate(0, 0) scale(1); opacity: 0; }
    20% { transform: translate(0, 0) scale(1.3); opacity: 1; animation-timing-function: cubic-bezier(0.1, 0.8, 0.3, 1); }
    50% { transform: translate(calc(var(--fw-x) * var(--fw-r)), calc(var(--fw-y) * var(--fw-r))) scale(1); opacity: 0.95; animation-timing-function: ease-in; }
    78% { transform: translate(calc(var(--fw-x) * var(--fw-r) * 1.05), calc(var(--fw-y) * var(--fw-r) + 46px)) scale(0.5); opacity: 0; }
    100% { opacity: 0; }
  }
  @keyframes fw-flash { 0%, 19% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; } 20.5% { opacity: 0.55; } 30% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; } 100% { opacity: 0; } }
  .fw .hero-inner { position: relative; z-index: 2; width: 100%; max-width: 860px; }
  .fw .hero-inner > * { animation: fw-in 1.2s ease both; }
  .fw .hero-star { display: flex; justify-content: center; margin: 0 0 22px; animation-delay: 0.5s !important; }
  .fw .hero-eyebrow { animation-delay: 0.7s !important; font-family: var(--fw-font-sans); font-size: 13px; letter-spacing: 7px; text-transform: uppercase; font-weight: 500; color: var(--fw-gold-pale); margin: 0 0 18px; }
  .fw .hero-name { animation-delay: 0.9s !important; font-family: var(--fw-font-display); font-style: italic; font-size: clamp(60px, 9vw, 128px); font-weight: 400; color: var(--fw-spark); margin: 0 0 24px; line-height: 0.98; text-shadow: 0 4px 34px rgba(14,11,20,0.85); }
  /* a ribbon of every firework colour */
  .fw .hero-line { display: block; width: 220px; height: 2px; margin: 0 auto 22px; border-radius: 2px; background: linear-gradient(to right, rgba(239,148,136,0), ${CORAL} 18%, ${GOLD_PALE} 40%, ${MINT} 62%, ${LILAC} 82%, rgba(131,115,151,0)); transform-origin: center; animation: fw-line 1.4s ease 1.2s both !important; }
  .fw .hero-date { animation-delay: 1.1s !important; font-family: var(--fw-font-sans); font-size: 15px; letter-spacing: 4px; text-transform: uppercase; color: var(--fw-gold); font-weight: 500; margin: 0 0 38px; }
  .fw .hero-actions { animation-delay: 1.3s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .fw .hero .btn-outline { background: rgba(14,11,20,0.35); }
  @media (max-width: 640px) {
    .fw .hero { padding: 100px 16px 80px; }
    .fw .hero-name { font-size: clamp(50px, 14vw, 72px); }
    .fw .hero-eyebrow { letter-spacing: 5px; font-size: 12px; }
    .fw .hero-date { letter-spacing: 3px; font-size: 13px; margin-bottom: 30px; }
    .fw .fw-burst { transform: scale(0.65); }
    .fw .fw-burst:nth-child(1) { left: 22% !important; }
    .fw .fw-burst:nth-child(4) { display: none; }
  }

  /* story: on paper white, beside the champagne popping into streamers */
  .fw .story { position: relative; overflow: hidden; background: var(--fw-paper); color: var(--fw-night); padding: 120px 28px; }
  .fw .story-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: 64px; align-items: center; max-width: 1080px; margin: 0 auto; }
  .fw .story-photo { position: relative; aspect-ratio: 4 / 3; border-radius: 26px; overflow: hidden; box-shadow: 0 40px 70px -40px rgba(14,11,20,0.45); }
  .fw .story-photo img { width: 100%; height: 100%; object-fit: cover; object-position: 20% center; display: block; }
  .fw .story-text { font-size: 18px; line-height: 1.9; color: rgba(14,11,20,0.78); margin: 0; }
  @media (max-width: 820px) {
    .fw .story { padding: 84px 20px; }
    .fw .story-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
    .fw .story-grid .fw-rule-left { justify-content: center; }
    .fw .story-grid .fw-rule-left .fw-rule-line:first-child { display: block; }
    .fw .story-text { text-align: left; }
  }

  /* countdown: beside the clock about to strike midnight, a colour per number */
  .fw .countdown-shell { position: relative; overflow: hidden; background: ${EMBER}; }
  .fw .countdown-shell::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(14,11,20,0) 0%, rgba(14,11,20,0.15) 18%, rgba(14,11,20,0.7) 42%, rgba(14,11,20,0.78) 100%); }
  .fw .countdown-wrap { position: relative; z-index: 2; padding: 130px 24px; text-align: center; }
  @media (min-width: 900px) { .fw .countdown-wrap { padding-left: calc(24px + 20vw); } }
  .fw .countdown-heading { font-family: var(--fw-font-display); font-style: italic; font-size: clamp(44px, 6.4vw, 82px); color: var(--fw-spark); margin: 0 0 46px; font-weight: 400; line-height: 1.02; text-shadow: 0 2px 28px rgba(14,11,20,0.9); }
  .fw .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 2.6vw, 26px); }
  .fw .countdown-block { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: clamp(74px, 14vw, 138px); aspect-ratio: 1; border-radius: 50%; border: 2px solid var(--fw-pop, ${GOLD_PALE}); background: radial-gradient(circle at 50% 30%, rgba(42,34,54,0.8), rgba(14,11,20,0.92)); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); box-shadow: 0 0 0 6px rgba(14,11,20,0.35), 0 0 34px -6px var(--fw-pop, ${GOLD_PALE}); }
  .fw .countdown-block:nth-child(1) { --fw-pop: ${CORAL}; }
  .fw .countdown-block:nth-child(2) { --fw-pop: ${GOLD_PALE}; }
  .fw .countdown-block:nth-child(3) { --fw-pop: ${MINT}; }
  .fw .countdown-block:nth-child(4) { --fw-pop: ${LILAC}; }
  .fw .countdown-value { font-family: var(--fw-font-display); font-size: clamp(32px, 5.4vw, 60px); color: var(--fw-spark); line-height: 1; }
  .fw .countdown-label { font-family: var(--fw-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--fw-pop, ${GOLD}); margin-top: 8px; font-weight: 600; }
  @media (max-width: 640px) { .fw .countdown-shell::before { background: linear-gradient(180deg, rgba(14,11,20,0.55), rgba(14,11,20,0.78)); } }
  @media (max-width: 480px) {
    .fw .countdown-wrap { padding: 96px 12px; }
    .fw .countdown-heading { font-size: 42px; margin-bottom: 32px; }
    .fw .countdown-row { gap: 8px; }
    .fw .countdown-block { width: 76px; box-shadow: 0 0 22px -6px var(--fw-pop, ${GOLD_PALE}); }
    .fw .countdown-value { font-size: 28px; }
    .fw .countdown-label { font-size: 8px; letter-spacing: 1.5px; margin-top: 4px; }
  }

  /* details: a ticket on paper white, like the story above */
  .fw .details-section { position: relative; padding: 120px 28px; background: var(--fw-paper); color: var(--fw-night); overflow: hidden; }
  .fw .details-section .ticket { box-shadow: 0 40px 70px -36px rgba(14,11,20,0.45); }
  .fw .details-section .ticket-body { background: #fff; }
  @media (max-width: 640px) { .fw .details-section { padding: 80px 18px; } }
  .fw .ticket { display: grid; grid-template-columns: 240px minmax(0, 1fr); max-width: 820px; margin: 18px auto 0; text-align: left; border-radius: 22px; overflow: hidden; box-shadow: 0 40px 70px -30px rgba(0,0,0,0.85); }
  .fw .ticket-stub { position: relative; background: linear-gradient(160deg, ${ROSE} 0%, ${EMBER} 100%); color: var(--fw-spark); padding: 40px 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .fw .ticket-weekday { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--fw-gold-pale); margin: 0 0 6px; font-weight: 600; }
  .fw .ticket-day { font-family: var(--fw-font-display); font-size: 92px; line-height: 0.95; margin: 0; color: var(--fw-spark); }
  .fw .ticket-month { font-family: var(--fw-font-display); font-style: italic; font-size: 22px; margin: 6px 0 0; color: var(--fw-spark); }
  .fw .ticket-body { background: var(--fw-paper); padding: 44px 44px 38px; border-left: 2px dashed rgba(205,115,100,0.55); }
  .fw .ticket-body .label { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--fw-rose); margin: 0 0 12px; font-weight: 600; }
  .fw .ticket-body .time { font-family: var(--fw-font-display); font-size: 40px; line-height: 1.1; color: var(--fw-night); margin: 0 0 12px; }
  .fw .ticket-body p { font-size: 15px; color: rgba(14,11,20,0.75); margin: 0 0 4px; }
  .fw .ticket-body address { font-style: normal; }
  .fw .ticket-body .venue { font-family: var(--fw-font-display); font-style: italic; font-size: 24px; color: var(--fw-night); margin: 14px 0 6px; }
  .fw .ticket-links { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 22px; }
  .fw .ticket-links a { font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--fw-night); text-decoration: none; border-bottom: 2px solid var(--fw-coral); padding-bottom: 4px; }
  .fw .map-frame { max-width: 820px; margin: 34px auto 0; overflow: hidden; border-radius: 22px; }
  .fw .map-frame iframe { border: 0; display: block; width: 100%; height: 340px; }
  @media (max-width: 680px) {
    .fw .ticket { grid-template-columns: 1fr; }
    .fw .ticket-stub { padding: 30px 20px; }
    .fw .ticket-day { font-size: 70px; }
    .fw .ticket-body { border-left: none; border-top: 2px dashed rgba(205,115,100,0.55); padding: 32px 22px 28px; text-align: center; }
    .fw .ticket-links { justify-content: center; }
  }

  /* program: the night's timeline, a burst of a new colour at each moment */
  .fw .timeline { position: relative; max-width: 620px; margin: 10px auto 0; text-align: left; }
  .fw .schedule-day { margin: 0 0 44px; }
  .fw .schedule-day:last-child { margin-bottom: 0; }
  .fw .schedule-day-title { font-size: 14px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--fw-gold-pale); margin: 0 0 22px; text-align: center; }
  .fw .schedule-list { position: relative; list-style: none; margin: 0; padding: 0 0 0 48px; }
  .fw .schedule-list::before { content: ''; position: absolute; left: 15px; top: 8px; bottom: 8px; width: 2px; border-radius: 2px; background: linear-gradient(to bottom, ${CORAL}, ${GOLD_PALE}, ${MINT}, ${LILAC}); opacity: 0.6; }
  .fw .schedule-row { position: relative; padding: 0 0 30px; }
  .fw .schedule-row:last-child { padding-bottom: 0; }
  .fw .schedule-row .fw-dot { position: absolute; left: -48px; top: -2px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--fw-plum); }
  .fw .schedule-time { font-family: var(--fw-font-display); font-style: italic; font-size: 22px; color: var(--fw-gold-pale); margin: 0 0 2px; }
  .fw .schedule-info .name { font-size: 15px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--fw-spark); margin: 0 0 3px; }
  .fw .schedule-info .loc { font-size: 15px; color: rgba(217,185,151,0.8); margin: 0; }

  /* the card shared by RSVP, Potluck and Gift Exchange: paper white with
     rounded corners and a seal like a burst of light */
  .fw .fw-card { position: relative; max-width: 560px; margin: 0 auto; background: var(--fw-paper); padding: 72px 48px 48px; text-align: left; border-radius: 26px; box-shadow: 0 50px 90px -40px rgba(0,0,0,0.9); color: var(--fw-night); }
  .fw .fw-card > * { position: relative; z-index: 1; }
  .fw .fw-card .section-title { color: var(--fw-night); }
  .fw .fw-card .eyebrow { color: var(--fw-rose); }
  .fw .fw-seal { position: absolute !important; top: -38px; left: 50%; width: 76px; height: 76px; margin-left: -38px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 35% 30%, ${GOLD_PALE} 0%, ${PEACH} 45%, ${ROSE} 100%); box-shadow: 0 12px 26px -8px rgba(205,115,100,0.75), inset 0 0 0 5px rgba(255,255,255,0.25); animation: fw-glow 3s ease-in-out infinite; }
  @media (max-width: 560px) { .fw .fw-card { padding: 64px 22px 34px; } }

  /* rsvp: the fireworks fill the sky above the card */
  .fw .rsvp-section { position: relative; padding: 300px 20px 120px; overflow: hidden; background: var(--fw-night); }
  .fw .rsvp-section .fw-sky { position: absolute; left: 0; right: 0; top: 0; width: 100%; height: auto; max-height: 82%; object-fit: cover; object-position: center top; z-index: 0; pointer-events: none; animation: fw-glow 4s ease-in-out infinite; -webkit-mask-image: linear-gradient(to bottom, #000 60%, transparent 100%); mask-image: linear-gradient(to bottom, #000 60%, transparent 100%); }
  .fw .rsvp-section .fw-card { z-index: 2; }
  @media (max-width: 640px) { .fw .rsvp-section { padding-top: 170px; } .fw .rsvp-section .fw-sky { width: 220%; max-width: none; left: -60%; } }
  .fw #potluck.rsvp-section { background: var(--fw-plum); padding: 130px 20px 100px; }
  .fw .gift-section { padding: 130px 20px 100px; background-color: var(--fw-violet); }

  /* gallery: rounded photos, each with a glow of its own colour */
  .fw .fw-gallery > div { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 24px !important; }
  .fw .fw-gallery button[style*="zoom-in"] { aspect-ratio: 4 / 5 !important; border-radius: 20px !important; box-shadow: 0 0 0 2px var(--fw-pop, ${GOLD_PALE}), 0 20px 40px -20px var(--fw-pop, ${GOLD_PALE}); }
  .fw .fw-gallery button[style*="zoom-in"]:nth-of-type(5n+1) { --fw-pop: ${CORAL}; }
  .fw .fw-gallery button[style*="zoom-in"]:nth-of-type(5n+2) { --fw-pop: ${GOLD_PALE}; }
  .fw .fw-gallery button[style*="zoom-in"]:nth-of-type(5n+3) { --fw-pop: ${MINT}; }
  .fw .fw-gallery button[style*="zoom-in"]:nth-of-type(5n+4) { --fw-pop: ${LILAC}; }
  .fw .fw-gallery button[style*="zoom-in"]:nth-of-type(5n) { --fw-pop: ${PEACH}; }
  @media (max-width: 760px) { .fw .fw-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 16px !important; } }

  /* registry: a night-violet tag on paper white, like the details */
  .fw .registry-wrap { position: relative; padding: 110px 24px; background-color: var(--fw-paper); overflow: hidden; display: flex; justify-content: center; }
  .fw .registry-wrap.has-photo::after { content: ''; position: absolute; inset: 0; z-index: 0; background: rgba(14,11,20,0.35); }
  .fw .gift-tag { position: relative; z-index: 1; width: min(620px, 100%); background: var(--fw-violet); padding: 54px 60px 50px 108px; text-align: center; border-radius: 0 22px 22px 0; clip-path: polygon(64px 0, 100% 0, 100% 100%, 64px 100%, 0 50%); }
  .fw .gift-tag::before { content: ''; position: absolute; left: 34px; top: 50%; width: 18px; height: 18px; margin-top: -9px; border-radius: 50%; background: var(--fw-paper); box-shadow: inset 0 0 0 2px var(--fw-coral); }
  .fw .registry-title { font-family: var(--fw-font-display); font-style: italic; font-size: 54px; color: var(--fw-gold-pale); margin: 0 0 8px; font-weight: 400; line-height: 1.05; }
  .fw .registry-description { font-size: 16px; color: rgba(217,185,151,0.92); margin: 0 auto 26px; line-height: 1.8; max-width: 400px; }
  .fw .registry-button { display: inline-block; padding: 16px 32px; border-radius: 999px; background: linear-gradient(120deg, ${CORAL}, ${PEACH} 45%, ${GOLD_PALE}); color: var(--fw-night); text-decoration: none; font-family: var(--fw-font-sans); font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; transition: transform 0.3s ease; position: relative; z-index: 1; }
  .fw .registry-button:hover { transform: translateY(-2px); }
  @media (max-width: 560px) {
    .fw .gift-tag { padding: 96px 26px 40px; border-radius: 0 0 22px 22px; clip-path: polygon(0 56px, 50% 0, 100% 56px, 100% 100%, 0 100%); }
    .fw .gift-tag::before { left: 50%; top: 30px; margin: 0 0 0 -9px; }
  }

  /* guest photos, songs and custom sections on the night */
  .fw .section p, .fw .song-section p { color: rgba(217,185,151,0.9); }
  .fw .song-section { background: var(--fw-violet); padding: 112px 28px; text-align: center; }
  .fw .song-section .song-list { border-top: 1px solid var(--fw-gold); max-width: 540px; margin: 0 auto; }
  .fw .song-section .song-row { border-bottom: 1px solid rgba(217,185,151,0.35); padding: 12px 0; }
  .fw .song-section .song-row .title { color: var(--fw-spark); font-family: var(--fw-font-display); font-style: italic; font-size: 19px; }
  .fw .song-section .song-row .artist { color: rgba(217,185,151,0.7); }

  /* share: coral, peach and gold like a burst at its brightest */
  .fw .share-band { padding: 104px 24px; text-align: center; background: linear-gradient(120deg, ${ROSE} 0%, ${CORAL} 30%, ${PEACH} 58%, ${GOLD_PALE} 100%); }
  .fw .share-band .eyebrow.on-dark { color: var(--fw-night); }
  .fw .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .fw .share-hashtag { font-family: var(--fw-font-display); font-style: italic; font-size: clamp(40px, 7vw, 82px); color: var(--fw-night); margin: 0 0 30px; font-weight: 400; line-height: 1.05; overflow-wrap: anywhere; }
  .fw .share-band .btn-outline.on-dark { color: var(--fw-night); border-color: rgba(14,11,20,0.6); background: transparent; }
  .fw .share-band .btn-outline.on-dark:hover { background: var(--fw-night); border-color: var(--fw-night); color: var(--fw-gold-pale); }

  /* footer: a glittering night of colour, confetti drifting down */
  .fw .footer { position: relative; padding: 140px 24px 90px; text-align: center; overflow: hidden; background: var(--fw-night); }
  .fw .footer::after { content: ''; position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse 60% 70% at 50% 45%, rgba(14,11,20,0.7), rgba(14,11,20,0.2) 80%); pointer-events: none; }
  .fw .footer > *:not(.fw-bg):not(.fw-confetti) { position: relative; z-index: 2; }
  .fw .fw-confetti { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
  .fw .fw-confetti span { position: absolute; top: 0; border-radius: 1px; animation: fw-fall 12s linear infinite; will-change: transform; }
  .fw .footer p { font-size: 16px; color: rgba(217,185,151,0.88); margin: 0 0 4px; }
  .fw .footer address { font-style: normal; }
  .fw .footer-signoff { font-family: var(--fw-font-display); font-style: italic; font-size: clamp(40px, 6vw, 64px) !important; font-weight: 400; color: var(--fw-gold-pale) !important; margin: 30px 0 0 !important; line-height: 1.1; }
  .fw .footer-credit { margin-top: 70px !important; font-size: 11px !important; letter-spacing: 1px; color: rgba(217,185,151,0.55) !important; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

// Celebration wording in place of the wedding defaults (New Year's Eve
// first, but it works for any night with fireworks).
const OVERRIDES = {
  en: {
    ourStoryBtn: 'The night',
    ourStoryLabel: 'Let’s celebrate',
    howWeGotHere: 'A night to light up',
    theDetails: 'The details',
    dateAndLocation: 'When & where',
    ceremony: 'The celebration',
    reception: 'Location',
    theSchedule: 'The night ahead',
    eventProgram: 'Programme',
    kindlyRespond: 'Kindly reply',
    memoriesSoFar: 'Bright moments',
    ourMoments: 'Memories in colour',
    registry: 'Gifts',
    viewRegistry: 'See the details',
    countingDown: 'Counting down',
    untilWeSayIDo: 'Until the sky lights up',
    todayIsTheDay: 'Tonight’s the night!',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, a song for the countdown…',
    buildOurPlaylist: 'Party anthems',
    withLove: 'Let’s celebrate,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La soirée',
    ourStoryLabel: 'On célèbre',
    howWeGotHere: 'Une soirée qui brille',
    theDetails: 'Les détails',
    dateAndLocation: 'Quand et où',
    ceremony: 'La fête',
    reception: 'Lieu',
    theSchedule: 'Au programme',
    eventProgram: 'Programme',
    kindlyRespond: 'Merci de répondre',
    memoriesSoFar: 'Moments lumineux',
    ourMoments: 'Souvenirs en couleurs',
    registry: 'Cadeaux',
    viewRegistry: 'Voir les détails',
    countingDown: 'Compte à rebours',
    untilWeSayIDo: 'Avant que le ciel s’illumine',
    todayIsTheDay: 'C’est ce soir !',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Restrictions alimentaires, une chanson pour le compte à rebours…',
    buildOurPlaylist: 'Les hymnes de la fête',
    withLove: 'On célèbre,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La noche',
    ourStoryLabel: 'A celebrar',
    howWeGotHere: 'Una noche para brillar',
    theDetails: 'Los detalles',
    dateAndLocation: 'Cuándo y dónde',
    ceremony: 'La celebración',
    reception: 'Lugar',
    theSchedule: 'La noche',
    eventProgram: 'Programa',
    kindlyRespond: 'Por favor, confirma',
    memoriesSoFar: 'Momentos brillantes',
    ourMoments: 'Recuerdos a todo color',
    registry: 'Regalos',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Cuenta regresiva',
    untilWeSayIDo: 'Hasta que el cielo se ilumine',
    todayIsTheDay: '¡Es esta noche!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Restricciones alimentarias, una canción para la cuenta regresiva…',
    buildOurPlaylist: 'Himnos de la fiesta',
    withLove: 'A celebrar,',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

// The footer's toast.
const SIGNOFF = { en: 'Here’s to a night to remember!', fr: 'À une soirée inoubliable !', es: '¡Por una noche inolvidable!' };
const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };
const HERO_ALT = { en: 'A glowing tree spiralling up through falling snow', fr: 'Un sapin lumineux qui s’élève en spirale sous la neige', es: 'Un árbol luminoso que sube en espiral bajo la nieve' };
const STORY_ALT = { en: 'A champagne bottle popping with streamers and confetti', fr: 'Une bouteille de champagne qui éclate en serpentins et confettis', es: 'Una botella de champán que estalla en serpentinas y confeti' };

// The burst seal, on top of each form card.
function Seal() {
  return (
    <span className="fw-seal" aria-hidden="true">
      <Burst size={34} color={NIGHT} />
    </span>
  );
}

export default function Fireworks({
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
  const heroSrc = bannerImage || HERO_DEFAULTS.fireworks;

  const when = eventWhen({ eventDate, eventTime, eventEndDate, eventEndTime }, t.dateLocale);
  const formattedTime = when.time;
  // The ticket stub: weekday, the day in large type, month and year.
  const day = eventDate ? new Date(eventDate + 'T00:00:00') : null;
  const stub = day && !isNaN(day.getTime())
    ? {
      weekday: day.toLocaleDateString(t.dateLocale, { weekday: 'long' }),
      day: day.toLocaleDateString(t.dateLocale, { day: 'numeric' }),
      month: day.toLocaleDateString(t.dateLocale, { month: 'long', year: 'numeric' }),
    }
    : null;

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--fw-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'rgba(217,185,151,0.9)' };

  // Event details for search engines and AI assistants, on guests' pages only.
  const structuredData = !isPreview && !demo
    ? eventJsonLd({ heading, description, eventDate, eventTime, eventEndDate, eventEndTime, location, url, venueName, streetAddress, city, postalCode, country, image: heroSrc, pageUrl: shareUrl, language })
    : null;

  return (
    <div className="fw">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Jost:wght@400;500;600&display=swap" />
      <style>{css}</style>
      {structuredData && <JsonLd data={structuredData} />}
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO — a glowing tree spiralling up through the snow, fireworks going off above */}
      <header className={bannerImage || editSlots?.heroBg ? 'hero' : 'hero hero--tree'}>
        {editSlots?.heroBg ?? (
          !bannerImage ? (
            <video className="hero-bg" src={HERO_VIDEO} poster={`${IMG}/hero-start.jpeg`} autoPlay muted loop playsInline preload="auto" aria-label={pickByLanguage(HERO_ALT, language)} style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt={bannerImage ? '' : pickByLanguage(HERO_ALT, language)} fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        <div className="hero-overlay" />
        <Bursts />
        <div className="hero-inner">
          <div className="hero-star"><Burst size={34} className="fw-twinkle" /></div>
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}>{heading}</h1>}
          <span className="hero-line" aria-hidden="true" />
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date" style={heroTextStyle(heroStyle?.text.date)}><time dateTime={eventDate}>{heroDateText}</time></p>)}
          <div className="hero-actions">
            <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            <HeroButton id="story" href="#story" className="btn btn-outline" label={t.ourStoryBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            {galleryToken && showGuestPhotos !== false && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
          </div>
        </div>
      </header>

      <main>
        {/* STORY — on paper white, beside the champagne popping */}
        {(description || editSlots?.description) && (
          <section id="story" className="story on-light">
            <Reveal className="story-grid">
              <div>
                <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
                <BurstRule align="left" i={1} />
                <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
                {editSlots?.description ?? <p data-story-text className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
              </div>
              <div className="story-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/champagne.webp`} alt={pickByLanguage(STORY_ALT, language)} loading="lazy" decoding="async" width={1400} height={933} />
              </div>
            </Reveal>
          </section>
        )}

        {/* COUNTDOWN — beside the clock about to strike midnight */}
        {eventDate && (
          <section className="countdown-shell" aria-label={t.untilWeSayIDo}>
            <Bg src={`${IMG}/clock.webp`} position="left center" />
            <Countdown
              eventDate={eventDate}
              eventTime={eventTime}
              eyebrow={t.countingDown}
              heading={t.untilWeSayIDo}
              todayHeading={t.todayIsTheDay}
              unitLabels={{ days: t.days, hours: t.hours, mins: t.mins, secs: t.secs }}
              sectionText={sectionTextCtx}
            />
          </section>
        )}

        {/* DATE / LOCATION — a ticket on paper white */}
        {(showVenue || showVirtual) && (
          <section className="details-section section-center on-light">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <BurstRule i={2} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="ticket">
                <div className="ticket-stub">
                  {stub ? (
                    <>
                      <p className="ticket-weekday">{stub.weekday}</p>
                      <p className="ticket-day">{stub.day}</p>
                      <p className="ticket-month">{stub.month}</p>
                    </>
                  ) : <Burst size={44} color={SPARK} />}
                </div>
                <div className="ticket-body">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p><time dateTime={eventDate}>{when.date}</time></p>}
                  {venueName && <p className="venue">{venueName}</p>}
                  {(streetAddress || city) && (
                    <address>
                      {streetAddress && <p>{streetAddress}</p>}
                      {city && <p>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                    </address>
                  )}
                  {(mapsUrl || showVirtual) && (
                    <div className="ticket-links">
                      {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>}
                      {showVirtual && <a href={url} target="_blank" rel="noopener noreferrer">{t.joinOnline}</a>}
                    </div>
                  )}
                </div>
              </div>
              {mapSrc && (
                <div className="map-frame">
                  <iframe title="Venue map" src={mapSrc} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </Reveal>
          </section>
        )}

        {/* LIVE STREAM (Plus) */}
        {isPaid && livestream && (
          <section id="livestream" className="section section-violet section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <BurstRule i={3} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'rgba(217,185,151,0.9)' }} />
            </Reveal>
          </section>
        )}

        {/* CUSTOM SECTIONS (Plus) */}
        {isPaid && customSections?.map((section, i) => (
          <section key={`custom-${section.position}`} className={`section section-center${i % 2 ? '' : ' section-violet'}`}>
            <Reveal className="wrap">
              <BurstRule i={i} />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </Reveal>
          </section>
        ))}

        {/* EVENT PROGRAM — the night's timeline */}
        {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
          <section className="section section-plum section-dots section-center">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
              <BurstRule i={4} />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" style={{ marginBottom: 44 }} fallback={t.eventProgram} />
              <div className="timeline">
                {groupEventProgramByDate(eventProgram).map((group) => (
                  <div className="schedule-day" key={group.date}>
                    <p className="schedule-day-title"><time dateTime={group.date}>{formatProgramDate(group.date, t.dateLocale)}</time></p>
                    <ol className="schedule-list">
                      {group.items.map((item, i) => (
                        <li className="schedule-row" key={item.id}>
                          <span className="fw-dot" aria-hidden="true"><Burst size={22} color={POPS[i % POPS.length]} /></span>
                          {formatProgramTime(item, t.dateLocale) && <p className="schedule-time">{formatProgramTime(item, t.dateLocale)}</p>}
                          <div className="schedule-info">
                            <p className="name">{item.name}</p>
                            {item.location && <p className="loc">{item.location}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {/* RSVP — the fireworks fill the sky above the card */}
        {showRsvp !== false && (
          <section id="rsvp" className="rsvp-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fw-sky" src={`${IMG}/fireworks.jpeg`} alt="" aria-hidden="true" loading="lazy" decoding="async" width={1600} height={747} />
            <Reveal className="fw-card">
              <Seal />
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <BurstRule i={1} />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* POTLUCK (Plus, off by default) — plain plum */}
        {isPaid && potluck && (
          <section id="potluck" className="rsvp-section">
            <Reveal className="fw-card">
              <Seal />
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
                <BurstRule i={2} />
                <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              </div>
              <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* GIFT EXCHANGE (Plus, off by default) — on confetti-dotted violet */}
        {giftExchange && (
          <section id="gift-exchange" className="gift-section section-dots">
            <Reveal className="fw-card">
              <Seal />
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <BurstRule i={3} />
                <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              </div>
              <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* GALLERY — rounded photos, each glowing its own colour. Hidden on a
            live page until there are some; theme previews show samples. */}
        {(() => {
          const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
          return (editSlots?.gallery || gallery.length > 0) && (
            <section className="section section-center">
              <Reveal className="wrap-wide">
                <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
                <BurstRule i={2} />
                <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" style={{ marginBottom: 44 }} fallback={t.ourMoments} />
                {editSlots?.gallery ?? <div className="fw-gallery"><GalleryGrid images={gallery} /></div>}
              </Reveal>
            </section>
          );
        })()}

        {/* REGISTRY — a night-violet tag on confetti-dotted paper */}
        {(registryDescription || registryButtonLink) && (
          <section className={`registry-wrap${registryImage ? ' has-photo' : ''}`}>
            {registryImage && <Bg src={registryImage} />}
            <Reveal className="gift-tag">
              <h2 className="registry-title">{t.registry}</h2>
              {registryDescription && <p className="registry-description" style={{ whiteSpace: 'pre-line' }}>{registryDescription}</p>}
              {registryButtonLink && (
                <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                  {registryButtonText || t.viewRegistry}
                </a>
              )}
            </Reveal>
          </section>
        )}

        {/* SPONSORS (Plus) */}
        {isPaid && sponsors && sponsors.length > 0 && (
          <section className="section section-violet section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <BurstRule i={4} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 18, border: `1px solid ${GOLD}`, background: PAPER }} textStyle={{ color: 'rgba(14,11,20,0.75)' }} />
            </Reveal>
          </section>
        )}

        {/* GUEST PHOTOS */}
        {galleryToken && showGuestPhotos !== false && (
          <section id="photos" className="section section-center">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <BurstRule i={0} />
              <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
              <GuestPhotoSection
                userPageId={galleryToken}
                initialPhotos={guestPhotos ?? []}
                initialHasMore={guestPhotosHasMore ?? false}
                labels={{ shareYourPhoto: t.shareYourPhoto, loadMore: t.loadMore, beFirstToShare: t.beFirstToShare, photoUploaded: t.photoUploaded, photoUploadError: t.photoUploadError, uploading: t.sending }}
                btnClassName="btn"
                disabled={formsDisabled}
              />
            </Reveal>
          </section>
        )}

        {/* SONG REQUESTS */}
        {isPaid && galleryToken && showSongRequests !== false && (
          <section id="songs" className="song-section">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" fallback={t.buildOurPlaylist} />
              <BurstRule i={3} />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" fallback={t.songRequests} />
              <SongRequestSection
                userPageId={galleryToken}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn"
                disabled={formsDisabled}
              />
            </Reveal>
          </section>
        )}

        {/* SHARE / HASHTAG — coral, peach and gold */}
        {showShare !== false && shareUrl && (
          <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
        )}
      </main>

      {/* FOOTER — a glittering night of colour, confetti drifting down */}
      <footer className="footer">
        <Bg src={`${IMG}/footer.webp`} position="center bottom" />
        <Confetti />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 12 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <address>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--fw-gold-pale)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--fw-gold-pale)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </address>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={pickByLanguage(SIGNOFF, language)} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
