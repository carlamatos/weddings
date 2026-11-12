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

const IMG = '/images/themes/new-years-eve';

const GALLERY_PATHS = [1, 2, 3, 4, 5, 6].map((n) => `${IMG}/photo-${n}.jpeg`);
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `ny-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// Espresso night and bronze, champagne and gold: the colours of gold
// streamers and bokeh lights on a dark background.
const NIGHT = '#0C0902';
const ESPRESSO = '#181509';
const UMBER = '#262013';
const BRONZE = '#342D1D';
const TAUPE = '#777062';
const CHAMPAGNE = '#D0BFA0';
const IVORY = '#F7F1E6';
const GOLD = '#C59F5E';
const GOLD_BRIGHT = '#E8BC76';
const AMBER = '#AD741E';

// ─── SVG ornaments ───────────────────────────────────────

// A slim four-pointed sparkle, the theme's mark.
function Sparkle({ size = 22, fill = GOLD_BRIGHT, className, style }: { size?: number; fill?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 C 13 8, 16 11, 24 12 C 16 13, 13 16, 12 24 C 11 16, 8 13, 0 12 C 8 11, 11 8, 12 0 Z" fill={fill} />
    </svg>
  );
}

// Fine gold lines with a diamond between them, Art Deco style — the section rule.
function DecoRule({ align = 'center' }: { align?: 'center' | 'left' }) {
  return (
    <div className={`ny-rule${align === 'left' ? ' ny-rule-left' : ''}`} aria-hidden="true">
      <span className="ny-rule-line" />
      <svg width="34" height="14" viewBox="0 0 34 14"><path d="M17 1 L23 7 L17 13 L11 7 Z" fill="none" stroke={GOLD} strokeWidth="1.2" /><path d="M17 4.5 L19.5 7 L17 9.5 L14.5 7 Z" fill={GOLD_BRIGHT} /><path d="M1 7 H8 M26 7 H33" stroke={GOLD} strokeWidth="1" /></svg>
      <span className="ny-rule-line" />
    </div>
  );
}

// A champagne coupe, on the RSVP card's seal.
function Coupe({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={ESPRESSO} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8 H27 C27 13, 22 16, 16 16 C10 16, 5 13, 5 8 Z" fill={ESPRESSO} fillOpacity="0.18" />
      <path d="M16 16 V26 M10 27 H22" />
      <circle cx="13" cy="5" r="0.9" fill={ESPRESSO} /><circle cx="18" cy="3" r="0.9" fill={ESPRESSO} /><circle cx="21" cy="6" r="0.7" fill={ESPRESSO} />
    </svg>
  );
}

// Gold confetti falling over the banner and the footer: thin strips and
// little squares in gold, champagne and amber, each with its own size, speed
// and spin. Fixed values so the server and client render alike.
const CONFETTI_COLORS = [GOLD_BRIGHT, GOLD, CHAMPAGNE, AMBER, '#FFF1CF'];
const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 8.3 + 2) % 100}%`,
  w: i % 3 === 0 ? 5 : 8 + (i % 4) * 2,
  h: i % 3 === 0 ? 5 : 3,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `-${(i * 1.37) % 12}s`,
  dur: `${9 + (i % 5) * 2.2}s`,
  // Where it rests when motion is reduced.
  still: `${(i * 29 + 6) % 90}%`,
}));

function Confetti({ count = CONFETTI.length }: { count?: number }) {
  return (
    <div className="ny-confetti" aria-hidden="true">
      {CONFETTI.slice(0, count).map((c) => (
        <span key={c.left} style={{ left: c.left, width: c.w, height: c.h, background: c.color, animationDelay: c.delay, animationDuration: c.dur, ['--ny-still' as string]: c.still } as React.CSSProperties} />
      ))}
    </div>
  );
}

const HERO_SPARKLES = [
  { left: '10%', top: '24%', size: 16, delay: '0s' }, { left: '21%', top: '70%', size: 11, delay: '-1.4s' },
  { left: '6%', top: '52%', size: 9, delay: '-2.6s' }, { left: '86%', top: '30%', size: 15, delay: '-0.8s' },
  { left: '78%', top: '76%', size: 10, delay: '-2s' }, { left: '93%', top: '56%', size: 12, delay: '-3.1s' },
];

// The new year the party rings in: an event in late December counts down to
// the next year, otherwise its own year.
function newYear(eventDate?: string): string | null {
  if (!eventDate) return null;
  const d = new Date(eventDate + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return String(d.getMonth() === 11 && d.getDate() >= 20 ? d.getFullYear() + 1 : d.getFullYear());
}

// A full-bleed background photo that loads only as its section comes near
// (a CSS background would load with the page).
function Bg({ src, className = '', position = 'center' }: { src: string; className?: string; position?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`ny-bg ${className}`} src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" style={{ objectPosition: position }} />;
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  const year = newYear(eventDate) ?? '2027';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: ESPRESSO, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...previewImage(bannerImage || HERO_DEFAULTS['new-years-eve'])} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(24,21,9,0.55), rgba(12,9,2,0.85))' }} />
      {[['8%', '20%', 14], ['18%', '72%', 9], ['82%', '24%', 12], ['90%', '66%', 16], ['30%', '14%', 7], ['70%', '84%', 8]].map(([l, t, z]) => (
        <span key={`${l}-${t}`} style={{ position: 'absolute', left: l, top: t }}><Sparkle size={z as number} /></span>
      ))}
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own faces */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500&family=Cormorant+Garamond:ital,wght@1,500&display=swap" />
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Cinzel', serif", fontSize: 128, lineHeight: 1, color: 'transparent', WebkitTextStroke: `1px rgba(232,188,118,0.35)`, letterSpacing: 6 }}>{year}</span>
      <div style={{ position: 'relative', zIndex: 1, padding: '0 18px' }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: GOLD_BRIGHT, margin: '0 0 8px' }}>You&rsquo;re invited</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(28px, 4.4vw, 40px)', color: IVORY, margin: '0 0 10px', lineHeight: 1.05 }}>{heading || 'New Year’s Eve'}</h2>
        {date && <p style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: 2.5, textTransform: 'uppercase', color: CHAMPAGNE, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .ny {
    --ny-night: ${NIGHT};
    --ny-espresso: ${ESPRESSO};
    --ny-umber: ${UMBER};
    --ny-bronze: ${BRONZE};
    --ny-taupe: ${TAUPE};
    --ny-champagne: ${CHAMPAGNE};
    --ny-ivory: ${IVORY};
    --ny-gold: ${GOLD};
    --ny-gold-bright: ${GOLD_BRIGHT};
    --ny-amber: ${AMBER};
    --ny-font-display: 'Cormorant Garamond', Garamond, Georgia, serif;
    --ny-font-deco: 'Cinzel', 'Trajan Pro', Georgia, serif;
    --ny-font-sans: 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .ny * { box-sizing: border-box; }
  .ny { margin: 0; background: var(--ny-espresso); color: var(--ny-champagne); font-family: var(--ny-font-sans); font-weight: 400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .ny img { max-width: 100%; }
  .ny .ny-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; }

  /* ─ motion: falling confetti, twinkles, shimmering gold ─ */
  @keyframes ny-fall { 0% { transform: translate3d(0, -30px, 0) rotate(0deg) rotateY(0deg); } 25% { transform: translate3d(16px, 25vh, 0) rotate(160deg) rotateY(180deg); } 50% { transform: translate3d(-10px, 52vh, 0) rotate(320deg) rotateY(360deg); } 75% { transform: translate3d(12px, 78vh, 0) rotate(480deg) rotateY(540deg); } 100% { transform: translate3d(-4px, 108vh, 0) rotate(640deg) rotateY(720deg); } }
  @keyframes ny-twinkle { 0%, 100% { transform: scale(0.7) rotate(0deg); opacity: 0.5; } 50% { transform: scale(1.12) rotate(45deg); opacity: 1; } }
  @keyframes ny-sparkle { 0%, 100% { transform: scale(0.2); opacity: 0; } 45%, 55% { transform: scale(1); opacity: 1; } }
  @keyframes ny-push { from { transform: scale(1.1); } to { transform: scale(1); } }
  @keyframes ny-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ny-year { from { opacity: 0; transform: translate(-50%, -50%) scale(0.92); letter-spacing: 0.02em; } to { opacity: 1; transform: translate(-50%, -50%) scale(1); letter-spacing: 0.08em; } }
  @keyframes ny-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes ny-shine { 0% { background-position: -160% 0; } 60%, 100% { background-position: 260% 0; } }
  @keyframes ny-glow { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .ny .ny-confetti span, .ny .ny-twinkle, .ny .ny-sparkle, .ny .hero-bg, .ny .hero-inner > *, .ny .hero-year, .ny .btn::after, .ny .ny-seal, .ny .ny-glitter { animation: none !important; }
    .ny .ny-confetti span { top: var(--ny-still, 30%); }
    .ny .ny-sparkle, .ny .hero-sparkle-video { display: none; }
  }
  .ny .ny-twinkle { display: block; animation: ny-twinkle 3.4s ease-in-out infinite; transform-origin: center; }
  .ny .ny-rule { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0 auto 22px; }
  .ny .ny-rule svg { flex: none; }
  .ny .ny-rule-left { justify-content: flex-start; }
  .ny .ny-rule-line { width: 56px; height: 1px; background: linear-gradient(to right, rgba(197,159,94,0), var(--ny-gold), rgba(197,159,94,0)); }
  .ny .ny-rule-left .ny-rule-line:first-child { display: none; }

  .ny .eyebrow { font-family: var(--ny-font-deco); font-size: 12px; font-weight: 500; letter-spacing: 5px; text-transform: uppercase; color: var(--ny-gold); margin: 0 0 14px; }
  .ny .eyebrow.on-dark { color: var(--ny-gold-bright); }
  .ny .section-title { font-family: var(--ny-font-display); font-size: clamp(38px, 5vw, 62px); font-weight: 500; font-style: italic; color: var(--ny-ivory); margin: 0 0 18px; line-height: 1.05; }
  .ny .section-title.on-light, .ny .on-light .section-title { color: var(--ny-espresso); }
  .ny .on-light .eyebrow { color: var(--ny-amber); }
  .ny .section-title.on-dark { color: var(--ny-ivory); }

  .ny .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1; }
  .ny .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1; }
  .ny .section { position: relative; padding: 112px 28px; background: var(--ny-espresso); overflow: hidden; }
  .ny .section-umber { background: var(--ny-umber); }
  .ny .section-bronze { background: var(--ny-bronze); }
  .ny .section-center { text-align: center; }
  .ny .section-dots { background-image: radial-gradient(rgba(197,159,94,0.16) 1px, transparent 1.6px); background-size: 28px 28px; }
  @media (max-width: 640px) { .ny .section { padding: 80px 20px; } }

  /* buttons: gold, with a light that sweeps across now and then */
  .ny .btn { position: relative; overflow: hidden; font-family: var(--ny-font-deco); font-size: 12px; font-weight: 600; letter-spacing: 3.5px; text-transform: uppercase; padding: 17px 34px; border-radius: 2px; border: 1px solid var(--ny-gold); background: linear-gradient(135deg, ${GOLD_BRIGHT} 0%, ${GOLD} 55%, ${AMBER} 100%); color: var(--ny-night); cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease, border-color 0.3s ease; text-decoration: none; display: inline-block; line-height: 1; height: auto; }
  .ny .btn::after { content: ''; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 30%, rgba(255,248,226,0.65) 50%, transparent 70%) no-repeat; background-size: 60% 100%; background-position: -160% 0; animation: ny-shine 5.5s ease-in-out infinite; pointer-events: none; }
  @supports (text-box: trim-both cap alphabetic) { .ny .btn { text-box: trim-both cap alphabetic; padding-top: calc(17px + (1em - 1cap) / 2); padding-bottom: calc(17px + (1em - 1cap) / 2); } }
  .ny .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -12px rgba(232,188,118,0.85); }
  .ny .btn-outline { background: transparent; color: var(--ny-ivory); border-color: rgba(232,188,118,0.7); }
  .ny .btn-outline::after { display: none; }
  .ny .btn-outline:hover { background: var(--ny-gold-bright); border-color: var(--ny-gold-bright); color: var(--ny-night); box-shadow: none; }
  .ny .btn-outline.on-dark { color: var(--ny-ivory); }

  .ny input, .ny textarea, .ny select { font-family: var(--ny-font-sans); font-size: 15px; padding: 13px 16px; border: 1px solid #DCCFB7; border-radius: 2px; outline: none; background: #fff; color: var(--ny-espresso); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .ny input:focus, .ny textarea:focus, .ny select:focus { border-color: var(--ny-gold); box-shadow: 0 0 0 3px rgba(197,159,94,0.25); }
  .ny input::placeholder, .ny textarea::placeholder { color: rgba(24,21,9,0.4); }
  .ny label.field-label { font-family: var(--ny-font-deco); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--ny-amber); display: block; margin-bottom: 7px; font-weight: 600; }
  .ny .radio-label, .ny .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--ny-espresso); cursor: pointer; }
  .ny .radio-label input, .ny .check-label input { width: auto; border: none; padding: 0; accent-color: var(--ny-amber); box-shadow: none; }
  .ny .check-hint { font-family: var(--ny-font-sans); font-size: 12px; color: rgba(24,21,9,0.62); margin: 4px 0 0; }
  .ny .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .ny .rsvp-error { color: #9A3B1E; font-size: 13px; margin: 0; font-family: var(--ny-font-sans); }
  .ny .rsvp-success { text-align: center; padding: 20px 0; }
  .ny .rsvp-headline { font-family: var(--ny-font-display); font-style: italic; font-size: 50px; color: var(--ny-amber); margin: 0 0 8px; font-weight: 500; line-height: 1.1; }
  .ny .rsvp-sub { font-size: 14px; color: var(--ny-espresso); margin: 0; }
  .ny .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: sparklers in the dark, a sweep of gold sparkles, confetti falling
     and the new year in tall gold outline behind the invitation */
  .ny .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 20px 100px; background: var(--ny-night); overflow: hidden; text-align: center; }
  .ny .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: 0; animation: ny-push 14s cubic-bezier(0.2, 0.6, 0.3, 1) both; }
  .ny .hero-overlay { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(24,21,9,0.5) 0%, rgba(12,9,2,0.72) 70%, rgba(12,9,2,0.9) 100%); }
  /* the gold sweep is on black: screen blending drops the black and keeps the light */
  .ny .hero-sparkle-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; mix-blend-mode: screen; pointer-events: none;
    -webkit-mask-image: radial-gradient(ellipse 38% 30% at 50% 52%, rgba(0,0,0,0.3) 0%, #000 100%); mask-image: radial-gradient(ellipse 38% 30% at 50% 52%, rgba(0,0,0,0.3) 0%, #000 100%); }
  .ny .ny-confetti { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
  .ny .ny-confetti span { position: absolute; top: 0; border-radius: 1px; animation: ny-fall 12s linear infinite; will-change: transform; box-shadow: 0 0 6px rgba(232,188,118,0.35); }
  .ny .ny-sparkle { position: absolute; z-index: 1; pointer-events: none; animation: ny-sparkle 4.2s ease-in-out infinite; filter: drop-shadow(0 0 6px rgba(232,188,118,0.9)); }
  .ny .hero-year { position: absolute; left: 50%; top: 50%; z-index: 1; transform: translate(-50%, -50%); font-family: var(--ny-font-deco); font-weight: 500; font-size: clamp(150px, 30vw, 440px); line-height: 1; letter-spacing: 0.08em; color: transparent; -webkit-text-stroke: 1.5px rgba(232,188,118,0.32); white-space: nowrap; pointer-events: none; user-select: none; animation: ny-year 2.4s cubic-bezier(0.2, 0.7, 0.2, 1) 0.2s both; }
  .ny .hero-inner { position: relative; z-index: 2; width: 100%; max-width: 860px; }
  .ny .hero-inner > * { animation: ny-in 1.2s ease both; }
  .ny .hero-star { display: flex; justify-content: center; margin: 0 0 24px; animation-delay: 0.5s !important; }
  .ny .hero-eyebrow { animation-delay: 0.7s !important; font-family: var(--ny-font-deco); font-size: 13px; letter-spacing: 7px; text-transform: uppercase; font-weight: 500; color: var(--ny-gold-bright); margin: 0 0 18px; }
  .ny .hero-name { animation-delay: 0.9s !important; font-family: var(--ny-font-display); font-style: italic; font-size: clamp(60px, 9vw, 128px); font-weight: 500; color: var(--ny-ivory); margin: 0 0 22px; line-height: 0.95; text-shadow: 0 4px 34px rgba(12,9,2,0.8); }
  .ny .hero-line { display: block; width: 180px; height: 1px; margin: 0 auto 22px; background: linear-gradient(to right, rgba(197,159,94,0), var(--ny-gold-bright), rgba(197,159,94,0)); transform-origin: center; animation: ny-line 1.4s ease 1.2s both !important; }
  .ny .hero-date { animation-delay: 1.1s !important; font-family: var(--ny-font-deco); font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: var(--ny-champagne); font-weight: 500; margin: 0 0 38px; }
  .ny .hero-actions { animation-delay: 1.3s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .ny .hero .btn-outline { background: rgba(12,9,2,0.35); }
  @media (max-width: 640px) {
    .ny .hero { padding: 100px 16px 80px; }
    .ny .hero-name { font-size: clamp(50px, 14vw, 72px); }
    .ny .hero-eyebrow { letter-spacing: 5px; font-size: 12px; }
    .ny .hero-date { letter-spacing: 3px; font-size: 12px; margin-bottom: 30px; }
    .ny .hero-year { font-size: 40vw; top: 46%; }
  }

  /* story: the champagne toast in a gold arch beside the invitation */
  .ny .story { padding-top: 130px; padding-bottom: 130px; }
  .ny .story-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 72px; align-items: center; max-width: 1060px; margin: 0 auto; }
  .ny .story-arch { position: relative; aspect-ratio: 4 / 5; border-radius: 999px 999px 4px 4px; overflow: hidden; outline: 1px solid var(--ny-gold); outline-offset: 10px; box-shadow: 0 40px 70px -40px rgba(0,0,0,0.9); }
  .ny .story-arch img { width: 100%; height: 100%; object-fit: cover; object-position: 30% center; display: block; }
  .ny .story-arch-spark { position: absolute; z-index: 2; }
  .ny .story-text { font-size: 17px; line-height: 1.95; color: rgba(208,191,160,0.92); margin: 0; }
  .ny .story-text::first-letter { font-family: var(--ny-font-display); font-style: italic; float: left; font-size: 4.4em; line-height: 0.8; margin: 10px 14px 0 0; color: var(--ny-gold-bright); }
  @media (max-width: 820px) {
    .ny .story { padding-top: 90px; padding-bottom: 90px; }
    .ny .story-grid { grid-template-columns: 1fr; gap: 50px; text-align: center; }
    .ny .story-arch { width: min(320px, 78%); margin: 0 auto; }
    .ny .story-grid .ny-rule-left { justify-content: center; }
    .ny .story-grid .ny-rule-left .ny-rule-line:first-child { display: block; }
    .ny .story-text { text-align: left; }
  }

  /* countdown: to midnight, on gold glitter */
  .ny .countdown-shell { position: relative; overflow: hidden; background: ${UMBER}; }
  .ny .countdown-shell::before { content: ''; position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse 70% 80% at 50% 45%, rgba(12,9,2,0.45) 0%, rgba(12,9,2,0.8) 100%); }
  .ny .countdown-wrap { position: relative; z-index: 2; padding: 130px 24px; text-align: center; }
  .ny .countdown-heading { font-family: var(--ny-font-display); font-style: italic; font-size: clamp(44px, 6.4vw, 84px); color: var(--ny-ivory); margin: 0 0 46px; font-weight: 500; line-height: 1.02; text-shadow: 0 2px 28px rgba(12,9,2,0.9); }
  .ny .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 2.6vw, 26px); }
  .ny .countdown-block { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; width: clamp(74px, 14vw, 140px); aspect-ratio: 4 / 5; border: 1px solid var(--ny-gold); background: linear-gradient(to bottom, rgba(38,32,19,0.75), rgba(12,9,2,0.88)); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); box-shadow: 0 30px 50px -28px rgba(0,0,0,0.9);
    clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px); }
  .ny .countdown-block::before { content: ''; position: absolute; inset: 6px; border: 1px solid rgba(197,159,94,0.35); pointer-events: none;
    clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px); }
  .ny .countdown-value { font-family: var(--ny-font-deco); font-size: clamp(30px, 5.2vw, 60px); color: var(--ny-gold-bright); font-weight: 500; line-height: 1; }
  .ny .countdown-label { font-family: var(--ny-font-deco); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--ny-champagne); margin-top: 12px; font-weight: 500; }
  @media (max-width: 480px) {
    .ny .countdown-wrap { padding: 96px 14px; }
    .ny .countdown-heading { font-size: 42px; margin-bottom: 32px; }
    .ny .countdown-row { gap: 8px; }
    .ny .countdown-block { width: 74px; }
    .ny .countdown-value { font-size: 28px; }
    .ny .countdown-label { font-size: 8px; letter-spacing: 1.5px; margin-top: 8px; }
  }

  /* details: a ticket on white wood with gold stars */
  .ny .light-section { position: relative; padding: 112px 28px; background: ${IVORY}; overflow: hidden; color: var(--ny-espresso); }
  .ny .light-section .ny-bg { object-position: left center; }
  @media (max-width: 640px) { .ny .light-section { padding: 80px 18px; } .ny .light-section .ny-bg { opacity: 0.55; } }
  .ny .ticket { display: grid; grid-template-columns: 250px minmax(0, 1fr); max-width: 860px; margin: 18px auto 0; text-align: left; filter: drop-shadow(0 30px 40px rgba(24,21,9,0.22)); }
  .ny .ticket-stub { position: relative; background: var(--ny-espresso); color: var(--ny-ivory); padding: 40px 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
    -webkit-mask: radial-gradient(circle at 100% 12px, transparent 5px, #000 5.5px) right top / 100% 24px repeat-y; mask: radial-gradient(circle at 100% 12px, transparent 5px, #000 5.5px) right top / 100% 24px repeat-y; }
  .ny .ticket-stub::after { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(197,159,94,0.45); pointer-events: none; }
  .ny .ticket-weekday { font-family: var(--ny-font-deco); font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--ny-gold-bright); margin: 0 0 6px; }
  .ny .ticket-day { font-family: var(--ny-font-deco); font-size: 88px; line-height: 0.95; margin: 0; color: var(--ny-ivory); }
  .ny .ticket-month { font-family: var(--ny-font-display); font-style: italic; font-size: 23px; margin: 6px 0 0; color: var(--ny-champagne); }
  .ny .ticket-body { background: #fff; padding: 46px 44px 40px; border-left: 2px dashed rgba(197,159,94,0.75); }
  .ny .ticket-body .label { font-family: var(--ny-font-deco); font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--ny-amber); margin: 0 0 12px; }
  .ny .ticket-body .time { font-family: var(--ny-font-display); font-size: 38px; font-weight: 500; line-height: 1.1; color: var(--ny-espresso); margin: 0 0 12px; }
  .ny .ticket-body p { font-size: 15px; color: rgba(24,21,9,0.75); margin: 0 0 4px; }
  .ny .ticket-body address { font-style: normal; }
  .ny .ticket-body .venue { font-family: var(--ny-font-display); font-style: italic; font-size: 24px; color: var(--ny-espresso); margin: 14px 0 6px; }
  .ny .ticket-links { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 22px; }
  .ny .ticket-links a { font-family: var(--ny-font-deco); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--ny-espresso); text-decoration: none; border-bottom: 1px solid var(--ny-gold); padding-bottom: 4px; }
  .ny .map-frame { max-width: 860px; margin: 34px auto 0; overflow: hidden; outline: 1px solid var(--ny-gold); outline-offset: 8px; }
  .ny .map-frame iframe { border: 0; display: block; width: 100%; height: 340px; }
  @media (max-width: 680px) {
    .ny .ticket { grid-template-columns: 1fr; }
    .ny .ticket-stub { padding: 34px 20px; -webkit-mask: radial-gradient(circle at 12px 100%, transparent 5px, #000 5.5px) left bottom / 24px 100% repeat-x; mask: radial-gradient(circle at 12px 100%, transparent 5px, #000 5.5px) left bottom / 24px 100% repeat-x; }
    .ny .ticket-day { font-size: 70px; }
    .ny .ticket-body { border-left: none; border-top: 2px dashed rgba(197,159,94,0.75); padding: 34px 24px 30px; text-align: center; }
    .ny .ticket-links { justify-content: center; }
  }

  /* program: the night's timeline, a sparkle at each moment */
  .ny .timeline { position: relative; max-width: 620px; margin: 10px auto 0; text-align: left; }
  .ny .schedule-day { margin: 0 0 44px; }
  .ny .schedule-day:last-child { margin-bottom: 0; }
  .ny .schedule-day-title { font-family: var(--ny-font-deco); font-size: 15px; letter-spacing: 4px; text-transform: uppercase; color: var(--ny-gold-bright); margin: 0 0 22px; text-align: center; }
  .ny .schedule-list { position: relative; list-style: none; margin: 0; padding: 0 0 0 44px; }
  .ny .schedule-list::before { content: ''; position: absolute; left: 13px; top: 6px; bottom: 6px; width: 1px; background: linear-gradient(to bottom, rgba(197,159,94,0), var(--ny-gold) 12%, var(--ny-gold) 88%, rgba(197,159,94,0)); }
  .ny .schedule-row { position: relative; padding: 0 0 28px; }
  .ny .schedule-row:last-child { padding-bottom: 0; }
  .ny .schedule-row .ny-dot { position: absolute; left: -44px; top: 0; width: 27px; height: 27px; display: flex; align-items: center; justify-content: center; background: var(--ny-umber); }
  .ny .schedule-time { font-family: var(--ny-font-display); font-style: italic; font-size: 21px; color: var(--ny-gold-bright); margin: 0 0 2px; }
  .ny .schedule-info .name { font-family: var(--ny-font-deco); font-size: 15px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--ny-ivory); margin: 0 0 3px; }
  .ny .schedule-info .loc { font-size: 14px; color: rgba(208,191,160,0.75); margin: 0; }

  /* the card shared by RSVP, Potluck and Gift Exchange: ivory, a gold double
     frame and a gold seal with a champagne coupe */
  .ny .ny-card { position: relative; max-width: 560px; margin: 0 auto; background: var(--ny-ivory); padding: 72px 48px 48px; text-align: left; border-radius: 2px; box-shadow: 0 50px 90px -40px rgba(0,0,0,0.9); color: var(--ny-espresso); }
  .ny .ny-card::before { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(197,159,94,0.8); pointer-events: none; }
  .ny .ny-card::after { content: ''; position: absolute; inset: 17px; border: 1px solid rgba(197,159,94,0.35); pointer-events: none; }
  .ny .ny-card > * { position: relative; z-index: 1; }
  .ny .ny-card .section-title { color: var(--ny-espresso); }
  .ny .ny-card .eyebrow { color: var(--ny-amber); }
  .ny .ny-seal { position: absolute !important; top: -38px; left: 50%; width: 76px; height: 76px; margin-left: -38px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 35% 30%, #F6D9A0 0%, ${GOLD_BRIGHT} 30%, ${GOLD} 65%, ${AMBER} 100%); box-shadow: 0 12px 24px -8px rgba(173,116,30,0.7), inset 0 0 0 5px rgba(255,255,255,0.18), inset 0 0 0 6px rgba(104,73,21,0.5); animation: ny-glow 3s ease-in-out infinite; }
  @media (max-width: 560px) { .ny .ny-card { padding: 64px 24px 36px; } }

  /* rsvp: gold glitter raining down over the dark */
  .ny .rsvp-section { position: relative; padding: 230px 20px 120px; overflow: hidden; background: var(--ny-espresso); }
  .ny .rsvp-section .ny-glitter { position: absolute; left: 0; right: 0; top: 0; width: 100%; height: auto; max-height: 70%; object-fit: cover; object-position: center top; z-index: 0; pointer-events: none; animation: ny-glow 4s ease-in-out infinite; -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 100%); mask-image: linear-gradient(to bottom, #000 55%, transparent 100%); }
  .ny .rsvp-section .ny-card { z-index: 2; }
  .ny .rsvp-glow { position: absolute; left: 50%; top: 58%; width: 900px; height: 900px; margin: -450px 0 0 -450px; border-radius: 50%; background: radial-gradient(circle, rgba(232,188,118,0.14) 0%, rgba(232,188,118,0) 60%); pointer-events: none; }
  @media (max-width: 640px) { .ny .rsvp-section { padding-top: 150px; } .ny .rsvp-section .ny-glitter { width: 200%; max-width: none; left: -50%; } }
  .ny #potluck.rsvp-section { background: var(--ny-bronze); padding: 130px 20px 100px; }
  .ny .gift-section { padding: 130px 20px 100px; background-color: var(--ny-umber); }

  /* gallery: photos in fine gold frames */
  .ny .ny-gallery > div { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 22px !important; }
  .ny .ny-gallery button[style*="zoom-in"] { aspect-ratio: 4 / 5 !important; border-radius: 2px !important; outline: 1px solid var(--ny-gold); outline-offset: 6px; }
  @media (max-width: 760px) { .ny .ny-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 16px !important; } }

  /* registry: a dark gift tag on the white wood */
  .ny .registry-wrap { position: relative; padding: 110px 24px; background: ${IVORY}; overflow: hidden; display: flex; justify-content: center; }
  .ny .registry-wrap .ny-bg { object-position: left center; }
  .ny .registry-wrap.has-photo::after { content: ''; position: absolute; inset: 0; z-index: 0; background: rgba(12,9,2,0.35); }
  .ny .gift-tag { position: relative; z-index: 1; width: min(620px, 100%); background: var(--ny-espresso); padding: 54px 60px 50px 108px; text-align: center; clip-path: polygon(64px 0, 100% 0, 100% 100%, 64px 100%, 0 50%); filter: drop-shadow(0 20px 30px rgba(24,21,9,0.3)); }
  .ny .gift-tag::before { content: ''; position: absolute; left: 34px; top: 50%; width: 18px; height: 18px; margin-top: -9px; border-radius: 50%; background: ${IVORY}; box-shadow: inset 0 0 0 2px var(--ny-gold); }
  .ny .gift-tag::after { content: ''; position: absolute; inset: 12px 12px 12px 72px; border: 1px solid rgba(197,159,94,0.55); pointer-events: none; }
  .ny .registry-title { font-family: var(--ny-font-display); font-style: italic; font-size: 54px; color: var(--ny-gold-bright); margin: 0 0 8px; font-weight: 500; line-height: 1.05; }
  .ny .registry-description { font-size: 15px; color: rgba(208,191,160,0.92); margin: 0 auto 26px; line-height: 1.8; max-width: 400px; }
  .ny .registry-button { display: inline-block; padding: 16px 32px; border-radius: 2px; background: var(--ny-gold); color: var(--ny-night); text-decoration: none; font-family: var(--ny-font-deco); font-size: 12px; font-weight: 600; letter-spacing: 3.5px; text-transform: uppercase; transition: background 0.3s ease; position: relative; z-index: 1; }
  .ny .registry-button:hover { background: var(--ny-gold-bright); }
  @media (max-width: 560px) {
    .ny .gift-tag { padding: 96px 26px 40px; clip-path: polygon(0 56px, 50% 0, 100% 56px, 100% 100%, 0 100%); }
    .ny .gift-tag::before { left: 50%; top: 30px; margin: 0 0 0 -9px; }
    .ny .gift-tag::after { inset: 64px 12px 12px; }
  }

  /* guest photos, songs and custom sections on the dark */
  .ny .section p, .ny .song-section p { color: rgba(208,191,160,0.9); }
  .ny .song-section { background: var(--ny-bronze); padding: 112px 28px; text-align: center; }
  .ny .song-section .song-list { border-top: 1px solid var(--ny-gold); max-width: 540px; margin: 0 auto; }
  .ny .song-section .song-row { border-bottom: 1px solid rgba(197,159,94,0.4); padding: 12px 0; }
  .ny .song-section .song-row .title { color: var(--ny-ivory); font-family: var(--ny-font-display); font-style: italic; font-size: 19px; }
  .ny .song-section .song-row .artist { color: rgba(208,191,160,0.7); }

  /* share: a band of polished gold */
  .ny .share-band { padding: 104px 24px; text-align: center; background: linear-gradient(120deg, ${AMBER} 0%, ${GOLD} 28%, ${GOLD_BRIGHT} 50%, ${GOLD} 72%, ${AMBER} 100%); }
  .ny .share-band .eyebrow.on-dark { color: var(--ny-night); }
  .ny .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .ny .share-hashtag { font-family: var(--ny-font-display); font-style: italic; font-size: clamp(40px, 7vw, 82px); color: var(--ny-night); margin: 0 0 30px; font-weight: 500; line-height: 1.05; overflow-wrap: anywhere; }
  .ny .share-band .btn-outline.on-dark { color: var(--ny-night); border-color: rgba(12,9,2,0.65); background: transparent; }
  .ny .share-band .btn-outline.on-dark:hover { background: var(--ny-night); border-color: var(--ny-night); color: var(--ny-gold-bright); }

  /* footer: gold bokeh and a curling ribbon, confetti still falling */
  .ny .footer { position: relative; padding: 140px 24px 90px; text-align: center; overflow: hidden; background: var(--ny-night); }
  .ny .footer .ny-bg { object-position: left center; }
  .ny .footer::after { content: ''; position: absolute; inset: 0; z-index: 0; background: radial-gradient(ellipse 60% 70% at 50% 50%, rgba(12,9,2,0.6), rgba(12,9,2,0.15) 80%); pointer-events: none; }
  .ny .footer > *:not(.ny-bg):not(.ny-confetti) { position: relative; z-index: 2; }
  .ny .footer p { font-size: 15px; color: rgba(208,191,160,0.88); margin: 0 0 4px; }
  .ny .footer address { font-style: normal; }
  .ny .footer-signoff { font-family: var(--ny-font-display); font-style: italic; font-size: clamp(40px, 6vw, 64px) !important; font-weight: 500; color: var(--ny-gold-bright) !important; margin: 30px 0 0 !important; line-height: 1.1; }
  .ny .footer-credit { margin-top: 70px !important; font-size: 11px !important; letter-spacing: 1px; color: rgba(208,191,160,0.55) !important; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

// New Year's Eve wording in place of the wedding defaults.
const OVERRIDES = {
  en: {
    ourStoryBtn: 'The evening',
    ourStoryLabel: 'Ring in the new year',
    howWeGotHere: 'A night to remember',
    theDetails: 'The details',
    dateAndLocation: 'When & where',
    ceremony: 'The celebration',
    reception: 'Location',
    theSchedule: 'Until midnight',
    eventProgram: 'The night ahead',
    kindlyRespond: 'Kindly reply',
    memoriesSoFar: 'Golden moments',
    ourMoments: 'Cheers to memories',
    registry: 'Gifts',
    viewRegistry: 'See the details',
    countingDown: 'Counting down',
    untilWeSayIDo: 'Countdown to midnight',
    todayIsTheDay: 'Tonight’s the night — cheers!',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, a song for midnight…',
    buildOurPlaylist: 'Midnight anthems',
    withLove: 'Happy New Year,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La soirée',
    ourStoryLabel: 'Fêtons la nouvelle année',
    howWeGotHere: 'Une soirée inoubliable',
    theDetails: 'Les détails',
    dateAndLocation: 'Quand et où',
    ceremony: 'La fête',
    reception: 'Lieu',
    theSchedule: 'Jusqu’à minuit',
    eventProgram: 'Au programme',
    kindlyRespond: 'Merci de répondre',
    memoriesSoFar: 'Moments dorés',
    ourMoments: 'Santé aux souvenirs',
    registry: 'Cadeaux',
    viewRegistry: 'Voir les détails',
    countingDown: 'Compte à rebours',
    untilWeSayIDo: 'Jusqu’à minuit',
    todayIsTheDay: 'C’est ce soir — santé !',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Restrictions alimentaires, une chanson pour minuit…',
    buildOurPlaylist: 'Les hymnes de minuit',
    withLove: 'Bonne année,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La velada',
    ourStoryLabel: 'Recibamos el año nuevo',
    howWeGotHere: 'Una noche para recordar',
    theDetails: 'Los detalles',
    dateAndLocation: 'Cuándo y dónde',
    ceremony: 'La celebración',
    reception: 'Lugar',
    theSchedule: 'Hasta la medianoche',
    eventProgram: 'La noche',
    kindlyRespond: 'Por favor, confirma',
    memoriesSoFar: 'Momentos dorados',
    ourMoments: 'Brindemos por los recuerdos',
    registry: 'Regalos',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Cuenta regresiva',
    untilWeSayIDo: 'Hasta la medianoche',
    todayIsTheDay: '¡Es esta noche, salud!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Restricciones alimentarias, una canción para la medianoche…',
    buildOurPlaylist: 'Himnos de medianoche',
    withLove: '¡Feliz Año Nuevo!',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

// The footer's toast.
const SIGNOFF = { en: 'Cheers to the new year!', fr: 'Santé à la nouvelle année !', es: '¡Salud por el año nuevo!' };
const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };
const HERO_ALT = { en: 'Friends holding lit sparklers', fr: 'Des amis tenant des cierges magiques', es: 'Amigos con bengalas encendidas' };
const STORY_ALT = { en: 'Two glasses of champagne with gold streamers', fr: 'Deux coupes de champagne et des serpentins dorés', es: 'Dos copas de champán con serpentinas doradas' };

// The gold seal with a champagne coupe, on top of each form card.
function Seal() {
  return (
    <span className="ny-seal" aria-hidden="true">
      <Coupe />
    </span>
  );
}

export default function NewYearsEve({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['new-years-eve'];
  const year = newYear(eventDate);

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--ny-font-sans)', fontSize: 17, lineHeight: 1.95, color: 'rgba(208,191,160,0.9)' };

  // Event details for search engines and AI assistants, on guests' pages only.
  const structuredData = !isPreview && !demo
    ? eventJsonLd({ heading, description, eventDate, eventTime, eventEndDate, eventEndTime, location, url, venueName, streetAddress, city, postalCode, country, image: heroSrc, pageUrl: shareUrl, language })
    : null;

  return (
    <div className="ny">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Montserrat:wght@400;500;600&display=swap" />
      <style>{css}</style>
      {structuredData && <JsonLd data={structuredData} />}
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO — sparklers, a sweep of gold, confetti and the new year in gold outline */}
      <header className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt={bannerImage ? '' : pickByLanguage(HERO_ALT, language)} fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        <div className="hero-overlay" />
        {/* The gold sweep plays once as the page opens (screen-blended, so its black disappears) */}
        <video className="hero-sparkle-video" src={`${IMG}/sparkle.mp4`} autoPlay muted playsInline preload="auto" aria-hidden="true" />
        {year && <span className="hero-year" aria-hidden="true">{year}</span>}
        <Confetti />
        {HERO_SPARKLES.map((s) => (
          <Sparkle key={`${s.left}-${s.top}`} size={s.size} className="ny-sparkle" style={{ left: s.left, top: s.top, animationDelay: s.delay }} />
        ))}
        <div className="hero-inner">
          <div className="hero-star"><Sparkle size={30} className="ny-twinkle" /></div>
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
        {/* STORY — the champagne toast in a gold arch */}
        {(description || editSlots?.description) && (
          <section id="story" className="section story">
            <Reveal className="story-grid">
              <div className="story-arch">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${IMG}/champagne.webp`} alt={pickByLanguage(STORY_ALT, language)} loading="lazy" decoding="async" width={1100} height={731} />
              </div>
              <div>
                <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
                <DecoRule align="left" />
                <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
                {editSlots?.description ?? <p data-story-text className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
              </div>
            </Reveal>
          </section>
        )}

        {/* COUNTDOWN — to midnight, on gold glitter */}
        {eventDate && (
          <section className="countdown-shell" aria-label={t.untilWeSayIDo}>
            <Bg src={`${IMG}/glitter.webp`} />
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

        {/* DATE / LOCATION — a ticket on white wood and gold stars */}
        {(showVenue || showVirtual) && (
          <section className="light-section section-center on-light">
            <Bg src={`${IMG}/wood.webp`} />
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <DecoRule />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="ticket">
                <div className="ticket-stub">
                  {stub ? (
                    <>
                      <p className="ticket-weekday">{stub.weekday}</p>
                      <p className="ticket-day">{stub.day}</p>
                      <p className="ticket-month">{stub.month}</p>
                    </>
                  ) : <Sparkle size={40} />}
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
          <section id="livestream" className="section section-umber section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <DecoRule />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'rgba(208,191,160,0.9)' }} />
            </Reveal>
          </section>
        )}

        {/* CUSTOM SECTIONS (Plus) */}
        {customSections?.map((section, i) => (
          <section key={`custom-${section.position}`} className={`section section-center${i % 2 ? '' : ' section-umber'}`}>
            <Reveal className="wrap">
              <DecoRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </Reveal>
          </section>
        ))}

        {/* EVENT PROGRAM — the night's timeline */}
        {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
          <section className="section section-umber section-dots section-center">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
              <DecoRule />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" style={{ marginBottom: 44 }} fallback={t.eventProgram} />
              <div className="timeline">
                {groupEventProgramByDate(eventProgram).map((group) => (
                  <div className="schedule-day" key={group.date}>
                    <p className="schedule-day-title"><time dateTime={group.date}>{formatProgramDate(group.date, t.dateLocale)}</time></p>
                    <ol className="schedule-list">
                      {group.items.map((item) => (
                        <li className="schedule-row" key={item.id}>
                          <span className="ny-dot" aria-hidden="true"><Sparkle size={18} /></span>
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

        {/* RSVP — gold glitter raining over the card */}
        {showRsvp !== false && (
          <section id="rsvp" className="rsvp-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ny-glitter" src={`${IMG}/rsvp.jpeg`} alt="" aria-hidden="true" loading="lazy" decoding="async" width={1600} height={747} />
            <span className="rsvp-glow" aria-hidden="true" />
            <Reveal className="ny-card">
              <Seal />
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <DecoRule />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* POTLUCK (Plus, off by default) — plain bronze */}
        {potluck && (
          <section id="potluck" className="rsvp-section">
            <Reveal className="ny-card">
              <Seal />
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
                <DecoRule />
                <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              </div>
              <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* GIFT EXCHANGE (Plus, off by default) — on gold-dotted umber */}
        {giftExchange && (
          <section id="gift-exchange" className="gift-section section-dots">
            <Reveal className="ny-card">
              <Seal />
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <DecoRule />
                <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              </div>
              <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
            </Reveal>
          </section>
        )}

        {/* GALLERY — gold frames. Hidden on a live page until there are
            some; theme previews show the theme's own sample photos. */}
        {(() => {
          const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
          return (editSlots?.gallery || gallery.length > 0) && (
            <section className="section section-center">
              <Reveal className="wrap-wide">
                <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
                <DecoRule />
                <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" style={{ marginBottom: 44 }} fallback={t.ourMoments} />
                {editSlots?.gallery ?? <div className="ny-gallery"><GalleryGrid images={gallery} /></div>}
              </Reveal>
            </section>
          );
        })()}

        {/* REGISTRY — a dark gift tag on the white wood */}
        {(registryDescription || registryButtonLink) && (
          <section className={`registry-wrap${registryImage ? ' has-photo' : ''}`}>
            <Bg src={registryImage || `${IMG}/wood.webp`} />
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
          <section className="section section-umber section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <DecoRule />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 2, border: `1px solid ${GOLD}`, background: IVORY }} textStyle={{ color: 'rgba(24,21,9,0.75)' }} />
            </Reveal>
          </section>
        )}

        {/* GUEST PHOTOS */}
        {galleryToken && showGuestPhotos !== false && (
          <section id="photos" className="section section-center">
            <Reveal className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <DecoRule />
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
              <DecoRule />
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

        {/* SHARE / HASHTAG — polished gold */}
        {showShare !== false && shareUrl && (
          <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
        )}
      </main>

      {/* FOOTER — gold bokeh and a curling ribbon, confetti still falling */}
      <footer className="footer">
        <Bg src={`${IMG}/footer.webp`} />
        <Confetti count={16} />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 12 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <address>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--ny-gold-bright)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--ny-gold-bright)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </address>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={pickByLanguage(SIGNOFF, language)} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
