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

const IMG = '/images/themes/merry';

// Merry's own five photos, then three from the other Christmas themes.
const GALLERY_PATHS = [
  `${IMG}/photo-1.jpeg`, `${IMG}/photo-2.jpeg`, `${IMG}/photo-3.jpeg`, '/images/themes/christmas-party/photo-1.jpeg',
  `${IMG}/photo-4.jpeg`, '/images/themes/white-christmas/photo-2.jpeg', `${IMG}/photo-5.jpeg`, '/images/themes/christmas-party/photo-3.jpeg',
];
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `mr-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// Midnight blues and snowflake gold, snow white, warm cream and sand, with
// a red satin ribbon.
const MIDNIGHT = '#101A25';
const NAVY = '#192835';
const TEAL = '#19374A';
const GOLD = '#D3B560';
const GOLD_BRIGHT = '#E7CA6A';
const SNOW = '#F3F6F9';
const CREAM = '#E3E1D9';
const SAND = '#D6CDB9';
const RIBBON = '#DC3E36';
const RIBBON_DEEP = '#A4191F';

// ─── SVG ornaments ───────────────────────────────────────

// A slim four-pointed star, the theme's mark.
function Star({ size = 22, fill = GOLD, className, style }: { size?: number; fill?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 C 13 8, 16 11, 24 12 C 16 13, 13 16, 12 24 C 11 16, 8 13, 0 12 C 8 11, 11 8, 12 0 Z" fill={fill} />
    </svg>
  );
}

// Two fine gold lines and a twinkling star between them — the section rule.
function StarRule({ align = 'center' }: { align?: 'center' | 'left' }) {
  return (
    <div className={`mr-rule${align === 'left' ? ' mr-rule-left' : ''}`} aria-hidden="true">
      <span className="mr-rule-line" />
      <Star size={18} className="mr-twinkle" />
      <span className="mr-rule-line" />
    </div>
  );
}

// Glass baubles swinging on gold threads behind the RSVP card. Fixed
// positions so the server and client render alike.
const ORNAMENTS = [
  { side: 'left', at: '4%', h: 520, delay: '0s', dur: '6.5s', depth: 1 },
  { side: 'left', at: '17%', h: 330, delay: '-2.2s', dur: '5.2s', depth: 2 },
  { side: 'left', at: '27%', h: 210, delay: '-1.1s', dur: '4.6s', depth: 3 },
  { side: 'right', at: '25%', h: 260, delay: '-3.4s', dur: '5s', depth: 3 },
  { side: 'right', at: '13%', h: 420, delay: '-0.6s', dur: '6s', depth: 2 },
  { side: 'right', at: '3%', h: 300, delay: '-4s', dur: '5.6s', depth: 1 },
] as const;

const HERO_SPARKLES = [
  { left: '9%', top: '58%', size: 16, delay: '0s' }, { left: '22%', top: '74%', size: 11, delay: '-1.4s' },
  { left: '15%', top: '38%', size: 9, delay: '-2.6s' }, { left: '84%', top: '62%', size: 15, delay: '-0.8s' },
  { left: '76%', top: '80%', size: 10, delay: '-2s' }, { left: '91%', top: '42%', size: 12, delay: '-3.1s' },
  { left: '33%', top: '88%', size: 8, delay: '-1s' }, { left: '66%', top: '90%', size: 9, delay: '-2.4s' },
];

// Gold snow falling over the banner: flakes and soft dots, each with its
// own size, speed and sway. Fixed values so the server and client agree.
const GOLD_SNOW = Array.from({ length: 64 }, (_, i) => ({
  left: `${(i * 7.3 + 1.5) % 100}%`,
  size: i % 2 === 0 ? 12 + (i % 7) * 3 : 4 + (i % 4) * 2,
  flake: i % 2 === 0,
  delay: `-${(i * 1.9) % 16}s`,
  dur: `${11 + (i % 6) * 2.5}s`,
  opacity: 0.55 + (i % 4) * 0.15,
  // Where it rests when motion is reduced.
  still: `${(i * 37 + 8) % 92}%`,
}));

// A six-armed gold snowflake.
function Snowflake({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD_BRIGHT} strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      {[0, 60, 120].map((r) => (
        <g key={r} transform={`rotate(${r} 12 12)`}>
          <path d="M12 1 V23" />
          <path d="M12 5 L9.5 2.5 M12 5 L14.5 2.5 M12 19 L9.5 21.5 M12 19 L14.5 21.5" />
        </g>
      ))}
    </svg>
  );
}

function GoldSnow() {
  return (
    <div className="mr-gold-snow" aria-hidden="true">
      {GOLD_SNOW.map((f) => (
        <span key={f.left} className={f.flake ? 'mr-gflake' : 'mr-gdot'} style={{ left: f.left, animationDelay: f.delay, animationDuration: f.dur, opacity: f.opacity, ['--mr-still' as string]: f.still, ...(f.flake ? {} : { width: f.size, height: f.size }) } as React.CSSProperties}>
          {f.flake && <Snowflake size={f.size} />}
        </span>
      ))}
    </div>
  );
}

// The banner when the host hasn't added a photo: a deep blue night (the
// gold snow falls over it). Also what the editor shows behind the banner.
export function MerryDefaultHero() {
  return <div className="hero-bg" style={{ background: `radial-gradient(ellipse 120% 90% at 50% 15%, #24506B 0%, ${TEAL} 30%, ${NAVY} 70%, ${MIDNIGHT} 100%)` }} />;
}

// Snow falling over the paper village in the footer.
const SNOWFLAKES = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 4.6 + 2) % 100}%`,
  size: 3 + (i % 4),
  delay: `-${(i * 1.7) % 14}s`,
  dur: `${11 + (i % 5) * 2}s`,
}));

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: MIDNIGHT, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...previewImage(bannerImage)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 90% 80% at 50% 0%, ${TEAL} 0%, ${NAVY} 55%, ${MIDNIGHT} 100%)` }}>
          {[['8%', '18%', 16], ['20%', '58%', 9], ['30%', '24%', 7], ['72%', '16%', 12], ['84%', '52%', 18], ['92%', '28%', 8], ['14%', '82%', 11], ['88%', '84%', 10]].map(([l, t, z]) => (
            <span key={`${l}-${t}`} style={{ position: 'absolute', left: l, top: t, opacity: 0.8 }}><Snowflake size={z as number} /></span>
          ))}
        </div>
      )}
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own display face */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@1,400&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, width: '62%', minWidth: 220, padding: '64px 18px 26px', textAlign: 'center', borderRadius: '999px 999px 0 0', border: `1px solid ${GOLD}`, borderBottom: 'none', background: 'linear-gradient(to bottom, rgba(16,26,37,0.35), rgba(16,26,37,0.85))' }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: GOLD_BRIGHT, fontWeight: 600, margin: '0 0 6px' }}>You&rsquo;re invited</p>
        <h2 style={{ fontFamily: "'Bodoni Moda', Didot, Georgia, serif", fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(24px, 4vw, 34px)', color: SNOW, margin: '0 0 8px', lineHeight: 1.05 }}>{heading || 'Merry'}</h2>
        {date && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: CREAM, fontWeight: 500, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .mr {
    --mr-midnight: ${MIDNIGHT};
    --mr-navy: ${NAVY};
    --mr-teal: ${TEAL};
    --mr-gold: ${GOLD};
    --mr-gold-bright: ${GOLD_BRIGHT};
    --mr-snow: ${SNOW};
    --mr-cream: ${CREAM};
    --mr-sand: ${SAND};
    --mr-ribbon: ${RIBBON};
    --mr-ribbon-deep: ${RIBBON_DEEP};
    --mr-font-display: 'Bodoni Moda', Didot, 'Bodoni 72', Georgia, serif;
    --mr-font-script: 'Great Vibes', 'Pinyon Script', cursive;
    --mr-font-sans: 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .mr * { box-sizing: border-box; }
  .mr { margin: 0; background: var(--mr-snow); color: var(--mr-midnight); font-family: var(--mr-font-sans); font-weight: 400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .mr img { max-width: 100%; }

  /* ─ motion: swinging baubles, drifting stars, twinkles, falling snow ─ */
  @keyframes mr-swing { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  @keyframes mr-twinkle { 0%, 100% { transform: scale(0.75) rotate(0deg); opacity: 0.55; } 50% { transform: scale(1.12) rotate(45deg); opacity: 1; } }
  @keyframes mr-sparkle { 0%, 100% { transform: scale(0.2); opacity: 0; } 45%, 55% { transform: scale(1); opacity: 1; } }
  @keyframes mr-swoosh { 0% { transform: translate3d(-6%, 0, 0); } 100% { transform: translate3d(4%, -10px, 0); } }
  @keyframes mr-shimmer { 0%, 100% { opacity: 0.55; filter: brightness(1); } 50% { opacity: 0.95; filter: brightness(1.18); } }
  @keyframes mr-snow { 0% { transform: translate3d(0, -20px, 0); opacity: 0; } 10% { opacity: 0.9; } 50% { transform: translate3d(14px, 50vh, 0); } 100% { transform: translate3d(-10px, 105vh, 0); opacity: 0; } }
  @keyframes mr-gsnow { 0% { transform: translate3d(0, -40px, 0) rotate(0deg); } 25% { transform: translate3d(18px, 25vh, 0) rotate(90deg); } 50% { transform: translate3d(-12px, 52vh, 0) rotate(180deg); } 75% { transform: translate3d(14px, 78vh, 0) rotate(270deg); } 100% { transform: translate3d(-6px, 108vh, 0) rotate(360deg); } }
  @keyframes mr-push { from { transform: scale(1.08); } to { transform: scale(1); } }
  @keyframes mr-drift { 0%, 100% { transform: scale(1.04) translate(0, 0); } 50% { transform: scale(1.1) translate(-1.2%, 1%); } }
  @keyframes mr-rise { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes mr-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes mr-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @media (prefers-reduced-motion: reduce) {
    .mr .mr-ornament, .mr .mr-twinkle, .mr .mr-sparkle, .mr .mr-stars, .mr .mr-flake, .mr .hero-bg, .mr .hero-arch, .mr .hero-arch-inner > *, .mr .mr-photo-bg, .mr .mr-seal, .mr .mr-gflake, .mr .mr-gdot { animation: none !important; }
    .mr .mr-flake, .mr .mr-sparkle { display: none; }
    .mr .mr-gflake, .mr .mr-gdot { top: var(--mr-still, 30%); }
  }
  .mr .mr-twinkle { display: block; animation: mr-twinkle 3.6s ease-in-out infinite; transform-origin: center; }
  .mr .mr-rule { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 0 auto 22px; }
  .mr .mr-rule-left { justify-content: flex-start; }
  .mr .mr-rule-line { width: 64px; height: 1px; background: linear-gradient(to right, rgba(211,181,96,0), var(--mr-gold), rgba(211,181,96,0)); }
  .mr .mr-rule-left .mr-rule-line:first-child { display: none; }

  .mr .eyebrow { font-family: var(--mr-font-sans); font-size: 11px; font-weight: 600; letter-spacing: 5px; text-transform: uppercase; color: var(--mr-teal); margin: 0 0 14px; }
  .mr .eyebrow.on-dark { color: var(--mr-gold-bright); }
  .mr .section-title { font-family: var(--mr-font-display); font-size: clamp(34px, 4.6vw, 56px); font-weight: 400; color: var(--mr-midnight); margin: 0 0 18px; line-height: 1.1; letter-spacing: -0.5px; }
  .mr .section-title em, .mr .section-title.italic { font-style: italic; }
  .mr .section-title.on-dark { color: var(--mr-snow); }

  .mr .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; }
  .mr .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 28px; }
  .mr .section { position: relative; padding: 112px 28px; background: var(--mr-snow); overflow: hidden; }
  .mr .section-cream { background: var(--mr-cream); }
  .mr .section-sand { background: var(--mr-sand); }
  .mr .section-center { text-align: center; }
  @media (max-width: 640px) { .mr .section { padding: 78px 20px; } }

  .mr .btn { font-family: var(--mr-font-sans); font-size: 11px; font-weight: 600; letter-spacing: 3.5px; text-transform: uppercase; padding: 17px 34px; border-radius: 2px; border: 1px solid var(--mr-gold); background: var(--mr-gold); color: var(--mr-midnight); cursor: pointer; transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease; text-decoration: none; display: inline-block; line-height: 1; height: auto; }
  @supports (text-box: trim-both cap alphabetic) { .mr .btn { text-box: trim-both cap alphabetic; padding-top: calc(17px + (1em - 1cap) / 2); padding-bottom: calc(17px + (1em - 1cap) / 2); } }
  .mr .btn:hover { background: var(--mr-gold-bright); border-color: var(--mr-gold-bright); transform: translateY(-2px); box-shadow: 0 10px 26px -12px rgba(231,202,106,0.8); }
  .mr .btn-outline { background: transparent; color: var(--mr-midnight); border-color: var(--mr-midnight); }
  .mr .btn-outline:hover { background: var(--mr-midnight); border-color: var(--mr-midnight); color: var(--mr-snow); box-shadow: none; }
  .mr .btn-outline.on-dark { color: var(--mr-snow); border-color: rgba(231,202,106,0.7); }
  .mr .btn-outline.on-dark:hover { background: var(--mr-gold-bright); border-color: var(--mr-gold-bright); color: var(--mr-midnight); }

  .mr input, .mr textarea, .mr select { font-family: var(--mr-font-sans); font-size: 15px; padding: 13px 16px; border: 1px solid var(--mr-sand); border-radius: 2px; outline: none; background: #fff; color: var(--mr-midnight); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .mr input:focus, .mr textarea:focus, .mr select:focus { border-color: var(--mr-gold); box-shadow: 0 0 0 3px rgba(211,181,96,0.22); }
  .mr input::placeholder, .mr textarea::placeholder { color: rgba(16,26,37,0.4); }
  .mr label.field-label { font-family: var(--mr-font-sans); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--mr-teal); display: block; margin-bottom: 7px; font-weight: 600; }
  .mr .radio-label, .mr .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--mr-midnight); cursor: pointer; }
  .mr .radio-label input, .mr .check-label input { width: auto; border: none; padding: 0; accent-color: var(--mr-ribbon-deep); box-shadow: none; }
  .mr .check-hint { font-family: var(--mr-font-sans); font-size: 12px; color: rgba(16,26,37,0.62); margin: 4px 0 0; }
  .mr .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .mr .rsvp-error { color: var(--mr-ribbon-deep); font-size: 13px; margin: 0; font-family: var(--mr-font-sans); }
  .mr .rsvp-success { text-align: center; padding: 20px 0; }
  .mr .rsvp-headline { font-family: var(--mr-font-script); font-size: 54px; color: var(--mr-ribbon-deep); margin: 0 0 8px; font-weight: 400; line-height: 1.1; }
  .mr .rsvp-sub { font-size: 14px; color: var(--mr-midnight); margin: 0; }
  .mr .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the night sky full of hanging stars, and a gold-framed arch
     window rising from the bottom edge with the invitation inside */
  .mr .hero { position: relative; min-height: 100vh; display: flex; align-items: flex-end; justify-content: center; padding: 120px 20px 0; background: var(--mr-midnight); overflow: hidden; text-align: center; }
  .mr .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; z-index: 0; animation: mr-push 16s cubic-bezier(0.2, 0.6, 0.3, 1) both; transform-origin: 50% 0%; }
  .mr .mr-gold-snow { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
  .mr .mr-gflake, .mr .mr-gdot { position: absolute; top: 0; animation: mr-gsnow 16s linear infinite; will-change: transform; }
  .mr .mr-gflake svg { display: block; filter: drop-shadow(0 0 5px rgba(231,202,106,0.55)); }
  .mr .mr-gdot { border-radius: 50%; background: radial-gradient(circle, #FFF3C4 0%, ${GOLD_BRIGHT} 45%, rgba(211,181,96,0) 72%); }
  .mr .hero-overlay { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(to bottom, rgba(16,26,37,0) 35%, rgba(16,26,37,0.55) 100%); }
  .mr .mr-sparkle { position: absolute; z-index: 1; pointer-events: none; animation: mr-sparkle 4.2s ease-in-out infinite; filter: drop-shadow(0 0 6px rgba(231,202,106,0.9)); }
  .mr .hero-arch { position: relative; z-index: 2; width: min(600px, 100%); min-height: min(76vh, 720px); display: flex; align-items: flex-end; border-radius: 999px 999px 0 0; border: 1px solid var(--mr-gold); border-bottom: none;
    background: linear-gradient(to bottom, rgba(16,26,37,0.18) 0%, rgba(16,26,37,0.62) 38%, rgba(16,26,37,0.9) 100%); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
    animation: mr-rise 1.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.1s both; }
  .mr .hero-arch::before { content: ''; position: absolute; inset: 12px 12px 0; border-radius: 999px 999px 0 0; border: 1px solid rgba(211,181,96,0.45); border-bottom: none; pointer-events: none; }
  .mr .hero-arch-inner { position: relative; width: 100%; padding: 0 48px 76px; }
  .mr .hero-arch-inner > * { animation: mr-in 1.2s ease both; }
  .mr .hero-star { display: flex; justify-content: center; margin: 0 0 26px; animation-delay: 0.6s !important; }
  .mr .hero-eyebrow { animation-delay: 0.75s !important; font-family: var(--mr-font-sans); font-size: 11px; letter-spacing: 6px; text-transform: uppercase; font-weight: 600; color: var(--mr-gold-bright); margin: 0 0 18px; }
  .mr .hero-name { animation-delay: 0.95s !important; font-family: var(--mr-font-display); font-style: italic; font-size: clamp(54px, 7.4vw, 104px); font-weight: 400; color: var(--mr-snow); margin: 0 0 20px; line-height: 1; letter-spacing: -1px; text-shadow: 0 4px 30px rgba(16,26,37,0.6); }
  .mr .hero-line { display: block; width: 160px; height: 1px; margin: 0 auto 20px; background: linear-gradient(to right, rgba(211,181,96,0), var(--mr-gold), rgba(211,181,96,0)); transform-origin: center; animation: mr-line 1.4s ease 1.2s both !important; }
  .mr .hero-date { animation-delay: 1.1s !important; font-family: var(--mr-font-sans); font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--mr-cream); font-weight: 500; margin: 0 0 36px; }
  .mr .hero-actions { animation-delay: 1.3s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .mr .hero .btn-outline { background: rgba(16,26,37,0.3); border-color: rgba(231,202,106,0.65); color: var(--mr-snow); }
  .mr .hero .btn-outline:hover { background: var(--mr-gold-bright); border-color: var(--mr-gold-bright); color: var(--mr-midnight); }
  @media (max-width: 640px) {
    .mr .hero { padding: 96px 14px 0; }
    .mr .hero-arch { min-height: 78vh; }
    .mr .hero-arch-inner { padding: 0 22px 56px; }
    .mr .hero-name { font-size: clamp(46px, 13vw, 64px); }
    .mr .hero-date { letter-spacing: 3px; margin-bottom: 28px; }
  }

  /* story: warm cream, a ribbon of gold stars drifting across */
  .mr .story { background: var(--mr-cream); padding-top: 220px; padding-bottom: 170px; }
  .mr .mr-stars { position: absolute; height: auto; pointer-events: none; z-index: 0; }
  .mr .mr-stars.top { top: 14px; right: -40px; width: min(980px, 80%); animation: mr-swoosh 18s ease-in-out infinite alternate, mr-shimmer 5s ease-in-out infinite; }
  .mr .mr-stars.bottom { bottom: -36px; left: -60px; width: min(720px, 60%); opacity: 0.45; animation: mr-shimmer 7s ease-in-out infinite; }
  .mr .story-grid { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 64px; align-items: start; max-width: 1040px; margin: 0 auto; }
  .mr .story-grid .section-title { font-style: italic; font-size: clamp(40px, 5vw, 64px); }
  .mr .story-text { font-size: 17px; line-height: 1.95; color: rgba(16,26,37,0.82); margin: 0; padding-top: 10px; border-top: 1px solid rgba(211,181,96,0.6); }
  .mr .story-text::first-letter { font-family: var(--mr-font-display); font-style: italic; float: left; font-size: 4.6em; line-height: 0.82; margin: 10px 14px 0 0; color: var(--mr-ribbon-deep); }
  @media (max-width: 820px) {
    .mr .story { padding-top: 130px; padding-bottom: 110px; }
    .mr .mr-stars.top { width: 130%; right: -15%; }
    .mr .mr-stars.bottom { width: 110%; left: -20%; }
    .mr .story-grid { grid-template-columns: 1fr; gap: 26px; text-align: center; }
    .mr .story-grid .mr-rule-left { justify-content: center; }
    .mr .story-grid .mr-rule-left .mr-rule-line:first-child { display: block; }
    .mr .story-text { text-align: left; }
  }

  /* countdown: the gold stars hang over the night, the numbers sit in
     arched windows like the doors of an advent calendar */
  .mr .countdown-shell { position: relative; overflow: hidden; background: radial-gradient(ellipse 90% 110% at 50% 20%, #24506B 0%, ${TEAL} 40%, ${NAVY} 100%); }
  .mr .mr-photo-bg { position: absolute; inset: -4%; background-size: cover; background-position: center top; animation: mr-drift 28s ease-in-out infinite; }
    .mr .countdown-wrap { position: relative; z-index: 2; padding: 120px 24px 120px; text-align: center; }
  .mr .countdown-heading { font-family: var(--mr-font-display); font-style: italic; font-size: clamp(42px, 6vw, 76px); color: var(--mr-snow); margin: 0 0 44px; font-weight: 400; line-height: 1.05; text-shadow: 0 2px 24px rgba(16,26,37,0.8); }
  .mr .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 2.6vw, 26px); }
  .mr .countdown-block { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: clamp(72px, 14vw, 132px); aspect-ratio: 3 / 4; padding-bottom: clamp(14px, 2.4vw, 24px); border-radius: 999px 999px 3px 3px; border: 1px solid var(--mr-gold); background: linear-gradient(to bottom, rgba(25,55,74,0.35), rgba(16,26,37,0.8)); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); box-shadow: 0 30px 50px -30px rgba(0,0,0,0.8); }
  .mr .countdown-block::before { content: ''; position: absolute; inset: 6px 6px 6px; border-radius: 999px 999px 2px 2px; border: 1px solid rgba(211,181,96,0.35); pointer-events: none; }
  .mr .countdown-value { font-family: var(--mr-font-display); font-size: clamp(30px, 5vw, 58px); color: var(--mr-snow); font-weight: 400; line-height: 1; }
  .mr .countdown-label { font-family: var(--mr-font-sans); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--mr-gold-bright); margin-top: 10px; font-weight: 600; }
  @media (max-width: 480px) {
    .mr .countdown-wrap { padding: 90px 14px 90px; }
    .mr .countdown-heading { font-size: 40px; margin-bottom: 30px; }
    .mr .countdown-row { gap: 8px; }
    .mr .countdown-block { width: 74px; }
    .mr .countdown-value { font-size: 28px; }
    .mr .countdown-label { font-size: 8px; letter-spacing: 1.5px; margin-top: 6px; }
  }

  /* details: an invitation ticket with a midnight stub and a perforated edge */
  .mr .ticket { display: grid; grid-template-columns: 260px minmax(0, 1fr); max-width: 860px; margin: 18px auto 0; text-align: left; filter: drop-shadow(0 30px 40px rgba(16,26,37,0.18)); }
  .mr .ticket-stub { position: relative; background: var(--mr-midnight); color: var(--mr-snow); padding: 40px 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border-radius: 4px 0 0 4px;
    -webkit-mask: radial-gradient(circle at 100% 12px, transparent 5px, #000 5.5px) right top / 100% 24px repeat-y; mask: radial-gradient(circle at 100% 12px, transparent 5px, #000 5.5px) right top / 100% 24px repeat-y; }
  .mr .ticket-stub::after { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(211,181,96,0.4); pointer-events: none; }
  .mr .ticket-weekday { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--mr-gold-bright); font-weight: 600; margin: 0 0 6px; }
  .mr .ticket-day { font-family: var(--mr-font-display); font-size: 92px; line-height: 0.95; margin: 0; color: var(--mr-snow); }
  .mr .ticket-month { font-family: var(--mr-font-display); font-style: italic; font-size: 22px; margin: 6px 0 0; color: var(--mr-cream); }
  .mr .ticket-body { background: #fff; padding: 46px 44px 40px; border-radius: 0 4px 4px 0; border-left: 2px dashed rgba(211,181,96,0.7); }
  .mr .ticket-body .label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--mr-teal); margin: 0 0 12px; font-weight: 600; }
  .mr .ticket-body .time { font-family: var(--mr-font-display); font-size: 36px; line-height: 1.1; color: var(--mr-midnight); margin: 0 0 12px; }
  .mr .ticket-body p { font-size: 15px; color: rgba(16,26,37,0.75); margin: 0 0 4px; }
  .mr .ticket-body .venue { font-family: var(--mr-font-display); font-style: italic; font-size: 22px; color: var(--mr-ribbon-deep); margin: 14px 0 6px; }
  .mr .ticket-links { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 22px; }
  .mr .ticket-links a { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--mr-midnight); text-decoration: none; border-bottom: 1px solid var(--mr-gold); padding-bottom: 4px; }
  .mr .map-frame { max-width: 860px; margin: 34px auto 0; overflow: hidden; border-radius: 4px; outline: 1px solid var(--mr-gold); outline-offset: 8px; }
  .mr .map-frame iframe { border: 0; display: block; width: 100%; height: 340px; }
  @media (max-width: 680px) {
    .mr .ticket { grid-template-columns: 1fr; }
    .mr .ticket-stub { border-radius: 4px 4px 0 0; padding: 34px 20px; -webkit-mask: radial-gradient(circle at 12px 100%, transparent 5px, #000 5.5px) left bottom / 24px 100% repeat-x; mask: radial-gradient(circle at 12px 100%, transparent 5px, #000 5.5px) left bottom / 24px 100% repeat-x; }
    .mr .ticket-day { font-size: 72px; }
    .mr .ticket-body { border-left: none; border-top: 2px dashed rgba(211,181,96,0.7); border-radius: 0 0 4px 4px; padding: 34px 24px 30px; text-align: center; }
    .mr .ticket-links { justify-content: center; }
  }

  /* program: a menu card on deep teal */
  .mr .program-section { background: var(--mr-teal); background-image: radial-gradient(rgba(211,181,96,0.16) 1px, transparent 1.5px); background-size: 26px 26px; }
  .mr .menu-card { position: relative; max-width: 620px; margin: 0 auto; background: var(--mr-snow); padding: 74px 54px 64px; text-align: center; border-radius: 3px; box-shadow: 0 40px 70px -40px rgba(0,0,0,0.7); }
  .mr .menu-card::before { content: ''; position: absolute; inset: 14px; border: 1px solid var(--mr-gold); pointer-events: none; }
  .mr .menu-card::after { content: ''; position: absolute; inset: 19px; border: 1px solid rgba(211,181,96,0.4); pointer-events: none; }
  .mr .schedule-day { margin: 0 0 40px; }
  .mr .schedule-day:last-child { margin-bottom: 0; }
  .mr .schedule-day-title { font-family: var(--mr-font-script); font-size: 42px; color: var(--mr-ribbon-deep); margin: 0 0 16px; line-height: 1.1; }
  .mr .schedule-row { padding: 0; }
  .mr .schedule-row + .schedule-row::before { content: '✦'; display: block; color: var(--mr-gold); font-size: 11px; margin: 16px 0; }
  .mr .schedule-time { font-family: var(--mr-font-display); font-style: italic; font-size: 19px; color: var(--mr-teal); margin: 0 0 4px; }
  .mr .schedule-info .name { font-family: var(--mr-font-sans); font-size: 14px; font-weight: 600; letter-spacing: 3.5px; text-transform: uppercase; color: var(--mr-midnight); margin: 0 0 4px; }
  .mr .schedule-info .loc { font-size: 14px; color: rgba(16,26,37,0.6); margin: 0; }
  @media (max-width: 560px) { .mr .menu-card { padding: 60px 28px 52px; } }

  /* the card shared by RSVP, Potluck and Gift Exchange: snow white, a gold
     double frame and a ribbon-red seal */
  .mr .mr-card { position: relative; max-width: 560px; margin: 0 auto; background: var(--mr-snow); padding: 70px 48px 48px; text-align: left; border-radius: 3px; box-shadow: 0 50px 90px -40px rgba(0,0,0,0.75); }
  .mr .mr-card::before { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(211,181,96,0.75); pointer-events: none; }
  .mr .mr-card > * { position: relative; }
  .mr .mr-seal { position: absolute !important; top: -36px; left: 50%; width: 72px; height: 72px; margin-left: -36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at 35% 30%, ${RIBBON} 0%, ${RIBBON_DEEP} 70%); box-shadow: 0 10px 22px -8px rgba(164,25,31,0.7), inset 0 0 0 4px rgba(255,255,255,0.08), inset 0 0 0 6px rgba(164,25,31,0.9), inset 0 0 0 7px rgba(231,202,106,0.6); }
  .mr .mr-seal svg { animation: mr-twinkle 4s ease-in-out infinite; }
  @media (max-width: 560px) { .mr .mr-card { padding: 62px 24px 36px; } }

  /* rsvp: glass baubles swinging in the dark around the card */
  .mr .rsvp-section { position: relative; padding: 170px 20px 120px; overflow: hidden; background: radial-gradient(ellipse 70% 60% at 50% 45%, ${TEAL} 0%, ${NAVY} 45%, ${MIDNIGHT} 100%); }
  .mr .rsvp-section .mr-card { z-index: 2; }
  .mr .mr-ornament { position: absolute; top: 0; z-index: 1; transform-origin: 50% 0; animation: mr-swing 6s ease-in-out infinite; pointer-events: none; }
  .mr .mr-ornament img { display: block; height: 100%; width: auto; filter: drop-shadow(0 0 28px rgba(231,202,106,0.28)); }
  .mr .mr-ornament.depth-2 { opacity: 0.8; }
  .mr .mr-ornament.depth-3 { opacity: 0.55; filter: blur(1px); }
  .mr .rsvp-glow { position: absolute; left: 50%; top: 50%; width: 900px; height: 900px; margin: -450px 0 0 -450px; border-radius: 50%; background: radial-gradient(circle, rgba(231,202,106,0.16) 0%, rgba(231,202,106,0) 60%); pointer-events: none; }
  @media (max-width: 900px) {
    .mr .mr-ornament { height: auto !important; }
    .mr .mr-ornament img { height: var(--mr-oh); }
    .mr .mr-ornament.depth-3 { display: none; }
    .mr .rsvp-section { padding-top: 200px; }
  }

  /* potluck: plain deep teal */
  .mr #potluck.rsvp-section { background: var(--mr-teal); padding: 130px 20px 100px; }

  /* gift exchange: midnight wrapping paper tied with the red ribbon */
  .mr .gift-section { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: end; min-height: 900px; padding: 140px 6vw 110px; overflow: hidden;
    background-color: var(--mr-navy); background-image: radial-gradient(rgba(231,202,106,0.35) 1.2px, transparent 1.8px), radial-gradient(rgba(231,202,106,0.18) 1px, transparent 1.6px); background-size: 34px 34px, 34px 34px; background-position: 0 0, 17px 17px; }
  .mr .gift-ribbon { position: absolute; inset: 0; background: url(${IMG}/ribbon.webp) left top / cover no-repeat; pointer-events: none; filter: drop-shadow(0 18px 24px rgba(0,0,0,0.45)); }
  .mr .gift-section .gift-panel { grid-column: 2; position: relative; z-index: 2; padding-top: 60px; }
  @media (max-width: 900px) {
    .mr .gift-section { display: block; min-height: 0; padding: 74vw 18px 76px; }
    .mr .gift-ribbon { background-size: 190% auto; background-position: 8% 0; }
    .mr .gift-section .gift-panel { padding-top: 0; }
  }

  /* gallery: arched frames, like windows */
  .mr .mr-gallery > div { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 22px !important; }
  .mr .mr-gallery button[style*="zoom-in"] { aspect-ratio: 3 / 4 !important; border-radius: 999px 999px 3px 3px !important; outline: 1px solid var(--mr-gold); outline-offset: 5px; }
  @media (max-width: 760px) { .mr .mr-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 16px !important; } }

  /* registry: a gift tag on a gold thread */
  .mr .registry-wrap { position: relative; padding: 110px 24px; background: var(--mr-sand); overflow: hidden; display: flex; justify-content: center; }
  .mr .registry-wrap .mr-photo-bg { animation-duration: 32s; }
  .mr .registry-wrap.has-photo::before { content: ''; position: absolute; inset: 0; z-index: 0; background: rgba(16,26,37,0.35); }
  .mr .gift-tag { position: relative; z-index: 1; width: min(620px, 100%); background: var(--mr-snow); padding: 54px 60px 50px 108px; text-align: center; clip-path: polygon(64px 0, 100% 0, 100% 100%, 64px 100%, 0 50%); filter: drop-shadow(0 20px 30px rgba(16,26,37,0.25)); }
  .mr .gift-tag::before { content: ''; position: absolute; left: 34px; top: 50%; width: 18px; height: 18px; margin-top: -9px; border-radius: 50%; background: var(--mr-sand); box-shadow: inset 0 0 0 2px var(--mr-gold); }
  .mr .gift-tag::after { content: ''; position: absolute; inset: 12px 12px 12px 72px; border: 1px solid rgba(211,181,96,0.6); pointer-events: none; }
  .mr .registry-title { font-family: var(--mr-font-script); font-size: 60px; color: var(--mr-ribbon-deep); margin: 0 0 8px; font-weight: 400; line-height: 1.05; }
  .mr .registry-description { font-size: 15px; color: rgba(16,26,37,0.75); margin: 0 auto 26px; line-height: 1.8; max-width: 400px; }
  .mr .registry-button { display: inline-block; padding: 16px 32px; border-radius: 2px; background: var(--mr-midnight); color: var(--mr-snow); text-decoration: none; font-family: var(--mr-font-sans); font-size: 11px; font-weight: 600; letter-spacing: 3.5px; text-transform: uppercase; transition: background 0.3s ease, color 0.3s ease; position: relative; z-index: 1; }
  .mr .registry-button:hover { background: var(--mr-gold); color: var(--mr-midnight); }
  @media (max-width: 560px) {
    .mr .gift-tag { padding: 96px 26px 40px; clip-path: polygon(0 56px, 50% 0, 100% 56px, 100% 100%, 0 100%); }
    .mr .gift-tag::before { left: 50%; top: 30px; margin: 0 0 0 -9px; }
    .mr .gift-tag::after { inset: 64px 12px 12px; }
  }

  /* songs: warm cream */
  .mr .song-section { background: var(--mr-cream); padding: 112px 28px; text-align: center; }
  .mr .song-section .song-list { border-top: 1px solid var(--mr-gold); max-width: 540px; margin: 0 auto; }
  .mr .song-section .song-row { border-bottom: 1px solid rgba(211,181,96,0.45); padding: 12px 0; }
  .mr .song-section .song-row .title { color: var(--mr-midnight); font-family: var(--mr-font-display); font-style: italic; }
  .mr .song-section .song-row .artist { color: rgba(16,26,37,0.6); }

  /* share: ribbon red satin */
  .mr .share-band { padding: 104px 24px; text-align: center; background: radial-gradient(ellipse 80% 120% at 30% 0%, ${RIBBON} 0%, ${RIBBON_DEEP} 65%); }
  .mr .share-band .eyebrow.on-dark { color: var(--mr-gold-bright); }
  .mr .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .mr .share-hashtag { font-family: var(--mr-font-script); font-size: clamp(38px, 7vw, 80px); color: var(--mr-snow); margin: 0 0 30px; font-weight: 400; line-height: 1.05; overflow-wrap: anywhere; }
  .mr .share-band .btn-outline.on-dark { border-color: rgba(243,246,249,0.7); }
  .mr .share-band .btn-outline.on-dark:hover { background: var(--mr-snow); border-color: var(--mr-snow); color: var(--mr-ribbon-deep); }

  /* footer: the paper village under a starry sky, snow falling */
  .mr .footer { position: relative; min-height: 860px; padding: 100px 24px 0; text-align: center; overflow: hidden; background: var(--mr-midnight) url(${IMG}/footer.jpeg) center bottom / cover no-repeat; }
  .mr .footer > *:not(.mr-flake) { position: relative; z-index: 2; }
  .mr .footer p { font-size: 15px; color: rgba(243,246,249,0.85); margin: 0 0 4px; }
  .mr .footer-signoff { font-family: var(--mr-font-script); font-size: clamp(48px, 7vw, 72px) !important; font-weight: 400; color: var(--mr-gold-bright) !important; margin: 26px 0 0 !important; line-height: 1.1; }
  .mr .footer-credit { position: absolute !important; left: 0; right: 0; bottom: 18px; font-size: 11px !important; letter-spacing: 1px; color: rgba(16,26,37,0.55) !important; }
  .mr .mr-flake { position: absolute; top: 0; z-index: 1; border-radius: 50%; background: #fff; pointer-events: none; box-shadow: 0 0 6px rgba(255,255,255,0.8); animation: mr-snow 14s linear infinite; }
  @media (max-width: 640px) { .mr .footer { min-height: 640px; padding-top: 84px; background-size: 200% auto; background-color: ${MIDNIGHT}; } }
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
    ourStoryBtn: 'The evening',
    ourStoryLabel: 'Merry & bright',
    howWeGotHere: 'A night to remember',
    theDetails: 'The details',
    dateAndLocation: 'When & where',
    ceremony: 'The celebration',
    reception: 'Location',
    theSchedule: 'The evening ahead',
    eventProgram: 'Programme',
    kindlyRespond: 'Kindly reply',
    memoriesSoFar: 'Merry moments',
    ourMoments: 'Season’s memories',
    registry: 'Gifts',
    viewRegistry: 'See the details',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'Christmas together',
    todayIsTheDay: 'Merry Christmas — tonight’s the night!',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, holiday wishes…',
    buildOurPlaylist: 'Carols & classics',
    withLove: 'Merry Christmas,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La soirée',
    ourStoryLabel: 'Joie et lumière',
    howWeGotHere: 'Une soirée inoubliable',
    theDetails: 'Les détails',
    dateAndLocation: 'Quand et où',
    ceremony: 'La fête',
    reception: 'Lieu',
    theSchedule: 'Au programme',
    eventProgram: 'Programme',
    kindlyRespond: 'Merci de répondre',
    memoriesSoFar: 'Moments joyeux',
    ourMoments: 'Souvenirs des fêtes',
    registry: 'Cadeaux',
    viewRegistry: 'Voir les détails',
    countingDown: 'Compte à rebours jusqu’à',
    untilWeSayIDo: 'Noël ensemble',
    todayIsTheDay: 'Joyeux Noël — c’est ce soir !',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Restrictions alimentaires, vœux des fêtes…',
    buildOurPlaylist: 'Chants et classiques',
    withLove: 'Joyeux Noël,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La velada',
    ourStoryLabel: 'Alegría y luz',
    howWeGotHere: 'Una noche para recordar',
    theDetails: 'Los detalles',
    dateAndLocation: 'Cuándo y dónde',
    ceremony: 'La celebración',
    reception: 'Lugar',
    theSchedule: 'El programa',
    eventProgram: 'Programa',
    kindlyRespond: 'Por favor, confirma',
    memoriesSoFar: 'Momentos felices',
    ourMoments: 'Recuerdos de la temporada',
    registry: 'Regalos',
    viewRegistry: 'Ver los detalles',
    countingDown: 'Cuenta regresiva para',
    untilWeSayIDo: 'Navidad juntos',
    todayIsTheDay: '¡Feliz Navidad, es esta noche!',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Restricciones alimentarias, buenos deseos…',
    buildOurPlaylist: 'Villancicos y clásicos',
    withLove: '¡Feliz Navidad!',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };

// The ribbon-red seal with a gold star, on top of each form card.
function Seal() {
  return (
    <span className="mr-seal" aria-hidden="true">
      <Star size={26} fill={GOLD_BRIGHT} />
    </span>
  );
}

export default function Merry({
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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--mr-font-sans)', fontSize: 17, lineHeight: 1.95, color: 'rgba(16,26,37,0.8)' };

  return (
    <div className="mr">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Great+Vibes&family=Montserrat:wght@400;500;600&display=swap" />
      <style>{css}</style>
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO — the invitation in a gold arch, gold snow falling */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          !heroSrc ? <MerryDefaultHero /> : isVideoUrl(heroSrc) ? (
            <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroSrc} alt="" fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
        <div className="hero-overlay" />
        <GoldSnow />
        {HERO_SPARKLES.map((s) => (
          <Star key={`${s.left}-${s.top}`} size={s.size} fill={GOLD_BRIGHT} className="mr-sparkle" style={{ left: s.left, top: s.top, animationDelay: s.delay }} />
        ))}
        <div className="hero-arch">
          <div className="hero-arch-inner">
            <div className="hero-star"><Star size={34} fill={GOLD_BRIGHT} className="mr-twinkle" /></div>
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
      </div>

      {/* STORY — gold stars drifting over warm cream */}
      {(description || editSlots?.description) && (
        <div id="story" className="section story">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mr-stars top" src={`${IMG}/stars.webp`} alt="" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mr-stars bottom" src={`${IMG}/stars.webp`} alt="" aria-hidden="true" />
          <Reveal className="story-grid">
            <div>
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <StarRule align="left" />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
            </div>
            {editSlots?.description ?? <p data-story-text className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
          </Reveal>
        </div>
      )}

      {/* COUNTDOWN — advent-calendar windows on deep blue */}
      {eventDate && (
        <div className="countdown-shell">
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

      {/* DATE / LOCATION — the invitation ticket */}
      {(showVenue || showVirtual) && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="ticket">
                <div className="ticket-stub">
                  {stub ? (
                    <>
                      <p className="ticket-weekday">{stub.weekday}</p>
                      <p className="ticket-day">{stub.day}</p>
                      <p className="ticket-month">{stub.month}</p>
                    </>
                  ) : <Star size={40} fill={GOLD_BRIGHT} />}
                </div>
                <div className="ticket-body">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p className="venue">{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
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
            </div>
          </div>
        </Reveal>
      )}

      {/* LIVE STREAM (Plus) */}
      {isPaid && livestream && (
        <Reveal>
          <div id="livestream" className="section section-cream section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'rgba(16,26,37,0.75)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section, i) => (
        <Reveal key={`custom-${section.position}`}>
          <div className={`section section-center${i % 2 ? '' : ' section-cream'}`}>
            <div className="wrap">
              <StarRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM — a menu card */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <div className="section program-section section-center">
          <Reveal className="menu-card">
            <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
            <StarRule />
            <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" style={{ marginBottom: 34 }} fallback={t.eventProgram} />
            {groupEventProgramByDate(eventProgram).map((group) => (
              <div className="schedule-day" key={group.date}>
                <p className="schedule-day-title">{formatProgramDate(group.date, t.dateLocale)}</p>
                {group.items.map((item) => (
                  <div className="schedule-row" key={item.id}>
                    {formatProgramTime(item, t.dateLocale) && <p className="schedule-time">{formatProgramTime(item, t.dateLocale)}</p>}
                    <div className="schedule-info">
                      <p className="name">{item.name}</p>
                      {item.location && <p className="loc">{item.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Reveal>
        </div>
      )}

      {/* RSVP — glass baubles swinging around the card */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          <span className="rsvp-glow" aria-hidden="true" />
          {ORNAMENTS.map((o) => (
            <span
              key={`${o.side}-${o.at}`}
              className={`mr-ornament depth-${o.depth}`}
              style={{ [o.side]: o.at, height: o.h, animationDelay: o.delay, animationDuration: o.dur, ['--mr-oh' as string]: `${Math.round(o.h * 0.42)}px` } as React.CSSProperties}
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${IMG}/ornament.webp`} alt="" loading="lazy" />
            </span>
          ))}
          <Reveal className="mr-card">
            <Seal />
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
            </div>
            <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
          </Reveal>
        </div>
      )}

      {/* POTLUCK (Plus, off by default) — plain deep teal */}
      {isPaid && potluck && (
        <div id="potluck" className="rsvp-section">
          <Reveal className="mr-card">
            <Seal />
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
            </div>
            <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
          </Reveal>
        </div>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default), wrapped in the red ribbon */}
      {isPaid && giftExchange && (
        <div id="gift-exchange" className="gift-section">
          <span className="gift-ribbon" aria-hidden="true" />
          <div className="gift-panel">
            <Reveal className="mr-card">
              <Seal />
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
                <StarRule />
                <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              </div>
              <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
            </Reveal>
          </div>
        </div>
      )}

      {/* GALLERY — arched frames. Hidden on a live page until there are
          some; theme previews show the theme's own sample photos. */}
      {(() => {
        const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
        return (editSlots?.gallery || gallery.length > 0) && (
          <Reveal>
            <div className="section section-center">
              <div className="wrap-wide">
                <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
                <StarRule />
                <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" style={{ marginBottom: 40 }} fallback={t.ourMoments} />
                {editSlots?.gallery ?? <div className="mr-gallery"><GalleryGrid images={gallery} /></div>}
              </div>
            </div>
          </Reveal>
        );
      })()}

      {/* REGISTRY — a gift tag */}
      {(registryDescription || registryButtonLink) && (
        <div className={`registry-wrap${registryImage ? ' has-photo' : ''}`}>
          {registryImage && <div className="mr-photo-bg" style={{ backgroundImage: `url(${registryImage})`, backgroundPosition: 'center' }} aria-hidden="true" />}
          <Reveal className="gift-tag">
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
          <div className="section section-cream section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <StarRule />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 3, border: `1px solid ${GOLD}`, background: SNOW }} textStyle={{ color: 'rgba(16,26,37,0.75)' }} />
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

      {/* SHARE / HASHTAG — ribbon red */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER — the paper village, snow falling */}
      <footer className="footer">
        {SNOWFLAKES.map((f) => (
          <span key={f.left} className="mr-flake" style={{ left: f.left, width: f.size, height: f.size, animationDelay: f.delay, animationDuration: f.dur }} aria-hidden="true" />
        ))}
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 12 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--mr-gold-bright)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--mr-gold-bright)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
