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

const IMG = '/images/themes/wild-flores';

// Garden and wildflower moments from the other wedding themes.
const GALLERY_PATHS = [
  '/images/themes/love/photo-1.jpeg', '/images/themes/the-day/photo-6.jpeg', '/images/themes/nature/photo-1.jpeg', '/images/themes/love/photo-5.jpeg',
  '/images/themes/the-day/photo-5.jpeg', '/images/themes/love/photo-2.jpeg', '/images/themes/nature/photo-4.jpeg', '/images/themes/love/photo-8.jpeg',
];
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `wf-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// A meadow on linen: linen, oatmeal, sand and clover white; sage green;
// dandelion, marigold and lilac.
const LINEN = '#E4D5CC';
const OATMEAL = '#D4C2B4';
const SAND = '#BCA992';
const CLOVER = '#EEE3DD';
const SAGE = '#82974C';
const DANDELION = '#E9B407';
const MARIGOLD = '#BE7922';
const LILAC = '#CE9BC8';
// Pastel tints of the flower colours, for the countdown blooms.
const PASTEL_LILAC = '#EBD7E8';
const PASTEL_BUTTER = '#F6E9B8';
const PASTEL_SAGE = '#DCE4C6';
const PASTEL_PEACH = '#F2DCC8';
// Warm dark brown for body text, and a paper white for cards.
const INK = '#3E3A2C';
const PAPER = '#F7F1EC';

// ─── decorations ─────────────────────────────────────────

// A five-petal bloom with a golden centre.
function Bloom({ size = 28, color = LILAC, center = DANDELION, className, style }: { size?: number; color?: string; center?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} d="M20 20 C 13 14, 14 3, 20 2 C 26 3, 27 14, 20 20 Z" fill={color} transform={`rotate(${r} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="5" fill={center} />
    </svg>
  );
}

// Three little wildflowers on swaying stems — the section rule.
function MeadowRule() {
  return (
    <div className="wf-rule" aria-hidden="true">
      <span className="wf-rule-line" />
      <svg width="76" height="40" viewBox="0 0 76 40" fill="none">
        <g className="wf-sway" style={{ transformOrigin: '20px 40px' }}>
          <path d="M20 40 C 19 30, 22 22, 18 12" stroke={SAGE} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M20 30 C 15 28, 12 24, 12 20 C 16 21, 19 25, 20 30 Z" fill={SAGE} />
          {[0, 60, 120, 180, 240, 300].map((r) => <ellipse key={r} cx="18" cy="7" rx="2" ry="5" fill={DANDELION} transform={`rotate(${r} 18 11)`} />)}
          <circle cx="18" cy="11" r="2.4" fill={MARIGOLD} />
        </g>
        <g className="wf-sway" style={{ transformOrigin: '38px 40px', animationDelay: '-1.4s' }}>
          <path d="M38 40 C 38 30, 37 20, 39 8" stroke={SAGE} strokeWidth="1.4" strokeLinecap="round" />
          {[8, 12, 16, 20].map((y, i) => (
            <g key={y}><circle cx={36 - (i % 2)} cy={y} r="2.4" fill={i % 2 ? SAND : LILAC} /><circle cx={41 + (i % 2)} cy={y + 1.5} r="2.2" fill={i % 2 ? LILAC : SAND} /></g>
          ))}
        </g>
        <g className="wf-sway" style={{ transformOrigin: '56px 40px', animationDelay: '-2.6s' }}>
          <path d="M56 40 C 57 31, 54 22, 58 14" stroke={SAGE} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M57 32 C 62 30, 65 26, 65 22 C 61 23, 58 27, 57 32 Z" fill={SAGE} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => <path key={r} d="M58 6 L 56.6 11 L 59.4 11 Z" fill={MARIGOLD} transform={`rotate(${r} 58 12)`} />)}
          <circle cx="58" cy="12" r="1.8" fill={INK} />
        </g>
      </svg>
      <span className="wf-rule-line" />
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
    <div style={{ position: 'relative', width: '100%', height: 280, background: LINEN, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...previewImage(bannerImage || HERO_DEFAULTS['wild-flores'])} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 45% at 50% 50%, rgba(238,227,221,0.85) 0%, rgba(238,227,221,0) 100%)' }} />
      {/* The card is shown outside the theme (dashboard, homepage), so it loads its own faces */}
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Sacramento&display=swap" />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px' }}>
        <p style={{ fontFamily: "'Sacramento', cursive", fontSize: 22, color: MARIGOLD, margin: '0 0 2px' }}>Together with their families</p>
        <h2 style={{ fontFamily: "'Young Serif', Georgia, serif", fontWeight: 400, fontSize: 'clamp(26px, 4.4vw, 36px)', color: SAGE, margin: '0 0 6px', lineHeight: 1.05 }}>{heading || 'Wild Flores'}</h2>
        {date && <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: MARIGOLD, fontWeight: 700, margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .wf {
    --wf-linen: ${LINEN};
    --wf-oatmeal: ${OATMEAL};
    --wf-sand: ${SAND};
    --wf-clover: ${CLOVER};
    --wf-sage: ${SAGE};
    --wf-dandelion: ${DANDELION};
    --wf-marigold: ${MARIGOLD};
    --wf-lilac: ${LILAC};
    --wf-ink: ${INK};
    --wf-paper: ${PAPER};
    --wf-font-display: 'Young Serif', Georgia, serif;
    --wf-font-script: 'Sacramento', 'Pinyon Script', cursive;
    --wf-font-sans: 'Karla', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .wf * { box-sizing: border-box; }
  .wf { margin: 0; background: var(--wf-clover); color: var(--wf-ink); font-family: var(--wf-font-sans); font-weight: 400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .wf img { max-width: 100%; }
  .wf .wf-hang, .wf .wf-breath, .wf .wf-card-poppy, .wf .wf-foot-sprig, .wf .packet-art img { height: auto; }

  /* ─ motion: swaying stems, turning poppies, morphing blooms ─ */
  @keyframes wf-sway { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
  @keyframes wf-spin { to { transform: rotate(360deg); } }
  @keyframes wf-blob { 0%, 100% { border-radius: 58% 42% 55% 45% / 48% 58% 42% 52%; } 33% { border-radius: 42% 58% 46% 54% / 56% 42% 58% 44%; } 66% { border-radius: 52% 48% 38% 62% / 42% 54% 46% 58%; } }
  @keyframes wf-push { from { transform: scale(1.08); } to { transform: scale(1); } }
  @keyframes wf-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes wf-bloom { from { transform: scale(0) rotate(-90deg); } to { transform: scale(1) rotate(0deg); } }
  @media (prefers-reduced-motion: reduce) {
    .wf .wf-sway, .wf .wf-spin, .wf .countdown-block, .wf .hero-bg, .wf .hero-content > *, .wf .wf-photo-bg, .wf .wf-hero-bloom { animation: none !important; }
  }
  .wf .wf-sway { animation: wf-sway 4.6s ease-in-out infinite; }
  .wf .wf-spin { animation: wf-spin 40s linear infinite; }
  .wf .wf-rule { display: flex; align-items: flex-end; justify-content: center; gap: 12px; margin: 0 auto 22px; }
  .wf .wf-rule-line { width: 60px; height: 1px; margin-bottom: 6px; background: linear-gradient(to right, rgba(130,151,76,0), var(--wf-sage), rgba(130,151,76,0)); }

  .wf .eyebrow { font-family: var(--wf-font-script); font-size: 36px; font-weight: 400; color: var(--wf-marigold); margin: 0 0 4px; line-height: 1.1; }
  .wf .eyebrow.on-dark { color: var(--wf-dandelion); }
  .wf .section-title { font-family: var(--wf-font-display); font-size: clamp(34px, 4.6vw, 54px); font-weight: 400; color: var(--wf-sage); margin: 0 0 18px; line-height: 1.1; }
  .wf .section-title.on-dark { color: var(--wf-clover); }

  .wf .wrap { max-width: 720px; margin: 0 auto; padding: 0 26px; }
  .wf .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 26px; }
  .wf .section { position: relative; padding: 112px 26px; background: var(--wf-clover); overflow: hidden; }
  .wf .section-linen { background: var(--wf-linen); }
  .wf .section-oatmeal { background: var(--wf-oatmeal); }
  .wf .section-center { text-align: center; }
  @media (max-width: 640px) { .wf .section { padding: 80px 20px; } }

  .wf .btn { font-family: var(--wf-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; padding: 16px 32px; border-radius: 999px; border: 1.5px solid var(--wf-sage); background: var(--wf-sage); color: var(--wf-paper); cursor: pointer; transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease; text-decoration: none; display: inline-block; line-height: 1; height: auto; }
  @supports (text-box: trim-both cap alphabetic) { .wf .btn { text-box: trim-both cap alphabetic; padding-top: calc(16px + (1em - 1cap) / 2); padding-bottom: calc(16px + (1em - 1cap) / 2); } }
  .wf .btn:hover { background: var(--wf-marigold); border-color: var(--wf-marigold); transform: translateY(-2px) rotate(-1deg); box-shadow: 0 10px 22px -12px rgba(190,121,34,0.7); }
  .wf .btn-outline { background: rgba(247,241,236,0.7); color: var(--wf-sage); border-color: var(--wf-sage); }
  .wf .btn-outline:hover { background: var(--wf-sage); border-color: var(--wf-sage); color: var(--wf-paper); }
  .wf .btn-outline.on-dark { background: transparent; color: var(--wf-paper); border-color: rgba(247,241,236,0.75); }
  .wf .btn-outline.on-dark:hover { background: var(--wf-dandelion); border-color: var(--wf-dandelion); color: var(--wf-ink); }

  .wf input, .wf textarea, .wf select { font-family: var(--wf-font-sans); font-size: 15px; padding: 13px 18px; border: 1.5px solid ${OATMEAL}; border-radius: 18px; outline: none; background: #fff; color: var(--wf-ink); width: 100%; display: block; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .wf input:focus, .wf textarea:focus, .wf select:focus { border-color: var(--wf-sage); box-shadow: 0 0 0 4px rgba(130,151,76,0.18); }
  .wf input::placeholder, .wf textarea::placeholder { color: rgba(62,58,44,0.42); }
  .wf label.field-label { font-family: var(--wf-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--wf-sage); display: block; margin-bottom: 7px; font-weight: 700; }
  .wf .radio-label, .wf .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--wf-ink); cursor: pointer; }
  .wf .radio-label input, .wf .check-label input { width: auto; border: none; padding: 0; accent-color: var(--wf-sage); box-shadow: none; }
  .wf .check-hint { font-size: 12px; color: rgba(62,58,44,0.65); margin: 4px 0 0; }
  .wf .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .wf .rsvp-error { color: #9A3B2C; font-size: 13px; margin: 0; }
  .wf .rsvp-success { text-align: center; padding: 20px 0; }
  .wf .rsvp-headline { font-family: var(--wf-font-script); font-size: 58px; color: var(--wf-marigold); margin: 0 0 8px; font-weight: 400; line-height: 1.05; }
  .wf .rsvp-sub { font-size: 14px; color: var(--wf-ink); margin: 0; }
  .wf .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* hero: the meadow frames the linen; the names sit in the clearing */
  .wf .hero { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 24px; background: var(--wf-linen); overflow: hidden; text-align: center; }
  .wf .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; animation: wf-push 14s cubic-bezier(0.2, 0.6, 0.3, 1) both; }
  .wf .hero-overlay { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse 46% 42% at 50% 52%, rgba(238,227,221,0.82) 0%, rgba(238,227,221,0.35) 60%, rgba(238,227,221,0) 100%); }
  .wf .hero-content { position: relative; z-index: 2; max-width: 680px; }
  .wf .hero-content > * { animation: wf-in 1.2s ease both; }
  .wf .wf-hero-bloom { display: inline-block; margin-bottom: 8px; animation: wf-bloom 1.4s cubic-bezier(0.3, 1.4, 0.5, 1) 0.1s both !important; }
  .wf .hero-eyebrow { animation-delay: 0.3s !important; font-family: var(--wf-font-script); font-size: clamp(34px, 3.6vw, 46px); color: var(--wf-marigold); margin: 0; line-height: 1.1; }
  .wf .hero-name { animation-delay: 0.45s !important; font-family: var(--wf-font-display); font-size: clamp(54px, 8vw, 112px); font-weight: 400; color: var(--wf-sage); margin: 0 0 16px; line-height: 1; letter-spacing: -1px; }
  .wf .hero-date { animation-delay: 0.7s !important; font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: var(--wf-marigold); font-weight: 700; margin: 0 0 34px; }
  .wf .hero-actions { animation-delay: 0.9s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  @media (max-width: 640px) {
    .wf .hero { padding: 110px 20px; }
    .wf .hero-overlay { background: radial-gradient(ellipse 85% 46% at 50% 50%, rgba(238,227,221,0.9) 0%, rgba(238,227,221,0.45) 65%, rgba(238,227,221,0) 100%); }
    .wf .hero-name { font-size: clamp(48px, 13vw, 66px); }
    .wf .hero-date { letter-spacing: 2.5px; font-size: 12px; }
  }

  /* story: a solid linen */
  .wf .story { padding: 100px 26px 120px; background: var(--wf-linen); }
  .wf .wf-hang { position: absolute; top: -20px; left: 2%; width: clamp(150px, 17vw, 250px); pointer-events: none; }
  .wf .wf-breath { position: absolute; right: -40px; bottom: -60px; width: clamp(220px, 28vw, 420px); pointer-events: none; opacity: 0.9; }
  .wf .story-text { font-size: 18px; line-height: 1.95; color: rgba(62,58,44,0.86); margin: 0 auto; max-width: 600px; }
  @media (max-width: 640px) { .wf .story { padding: 70px 20px 90px; } }

  /* countdown: clover white, lilac hanging from the top and baby's breath
     in the corner; the numbers in pastel blooms that keep changing shape */
  .wf .countdown-shell { position: relative; background: var(--wf-clover); overflow: hidden; }
  .wf .wf-photo-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
  .wf .countdown-wrap .eyebrow.on-dark { color: var(--wf-marigold); }
  .wf .countdown-wrap { position: relative; z-index: 2; padding: 140px 24px; text-align: center; }
  .wf .countdown-heading { font-family: var(--wf-font-display); font-size: clamp(40px, 5.6vw, 68px); color: var(--wf-sage); margin: 0 0 44px; font-weight: 400; line-height: 1.05; }
  .wf .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 2.6vw, 28px); }
  .wf .countdown-block { display: flex; flex-direction: column; align-items: center; justify-content: center; width: clamp(78px, 14vw, 132px); aspect-ratio: 1; background: ${PASTEL_LILAC}; border-radius: 58% 42% 55% 45% / 48% 58% 42% 52%; animation: wf-blob 9s ease-in-out infinite; box-shadow: 0 18px 30px -20px rgba(62,58,44,0.35); }
  .wf .countdown-block:nth-child(2) { background: ${PASTEL_BUTTER}; animation-delay: -2.5s; }
  .wf .countdown-block:nth-child(3) { background: ${PASTEL_SAGE}; animation-delay: -5s; }
  .wf .countdown-block:nth-child(4) { background: ${PASTEL_PEACH}; animation-delay: -7s; }
  .wf .countdown-value { font-family: var(--wf-font-display); font-size: clamp(28px, 4.8vw, 52px); color: var(--wf-ink); line-height: 1; }
  .wf .countdown-label { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--wf-ink); margin-top: 6px; font-weight: 700; }
  @media (max-width: 760px) {
    .wf .countdown-wrap { padding-top: 240px; }
    .wf .wf-hang { width: 92px; }
    .wf .wf-breath { width: 200px; right: -50px; bottom: -70px; opacity: 0.6; }
  }
  @media (max-width: 480px) {
    .wf .countdown-wrap { padding: 240px 14px 100px; }
    .wf .countdown-row { gap: 8px; }
    .wf .countdown-block { width: 76px; }
    .wf .countdown-value { font-size: 26px; }
    .wf .countdown-label { font-size: 8px; letter-spacing: 1.5px; }
  }

  /* details: a seed packet, the map in an organic frame */
  .wf .details-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 46px; align-items: center; margin-top: 18px; text-align: left; }
  .wf .details-grid.single { grid-template-columns: minmax(0, 460px); justify-content: center; }
  .wf .packet { position: relative; background: var(--wf-paper); padding: 22px 0 34px; margin: 12px 0; filter: drop-shadow(0 22px 26px rgba(62,58,44,0.18)); transform: rotate(-1.2deg); }
  /* pinked edges, top and bottom, like a paper seed packet */
  .wf .packet::before, .wf .packet::after { content: ''; position: absolute; left: 0; right: 0; height: 10px; background-size: 14px 10px; background-repeat: repeat-x; }
  .wf .packet::before { top: -10px; background-image: linear-gradient(-45deg, ${PAPER} 5px, transparent 0), linear-gradient(45deg, ${PAPER} 5px, transparent 0); background-position: 0 5px; }
  .wf .packet::after { bottom: -10px; background-image: linear-gradient(-135deg, ${PAPER} 5px, transparent 0), linear-gradient(135deg, ${PAPER} 5px, transparent 0); background-position: 0 0; }
  .wf .packet-art { position: relative; height: 190px; margin: 0 22px; border-radius: 0 0 140px 140px / 0 0 60px 60px; background: radial-gradient(circle at 30% 30%, rgba(206,155,200,0.45), rgba(206,155,200,0) 55%), radial-gradient(circle at 75% 70%, rgba(233,180,7,0.35), rgba(233,180,7,0) 55%), var(--wf-linen); overflow: hidden; display: flex; align-items: center; justify-content: center; }
  .wf .packet-art img { width: 150px; }
  .wf .packet-tag { position: absolute; top: 18px; left: 18px; font-family: var(--wf-font-sans); font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--wf-sage); background: rgba(247,241,236,0.85); padding: 6px 10px; border-radius: 999px; }
  .wf .packet-body { padding: 26px 34px 0; }
  .wf .packet-body .label { font-family: var(--wf-font-script); font-size: 34px; color: var(--wf-marigold); margin: 0 0 2px; line-height: 1.1; }
  .wf .packet-body .time { font-family: var(--wf-font-display); font-size: 34px; color: var(--wf-sage); margin: 0 0 8px; line-height: 1.1; }
  .wf .packet-body p { font-size: 15px; color: rgba(62,58,44,0.8); margin: 0 0 4px; }
  .wf .packet-body .venue { font-weight: 700; color: var(--wf-ink); margin-top: 12px; }
  .wf .packet-body .directions { display: inline-block; margin-top: 18px; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--wf-sage); text-decoration: none; border-bottom: 2px solid var(--wf-dandelion); padding-bottom: 3px; }
  .wf .map-blob { position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 58% 42% 55% 45% / 48% 58% 42% 52%; box-shadow: 0 0 0 10px var(--wf-paper), 0 30px 50px -30px rgba(62,58,44,0.5); }
  .wf .map-blob iframe { border: 0; display: block; width: 100%; height: 100%; }
  @media (max-width: 760px) { .wf .details-grid { grid-template-columns: 1fr; gap: 50px; } .wf .map-blob { max-width: 360px; margin: 0 auto; width: 100%; } }

  /* program: a meadow stem with a bloom at each moment */
  .wf .stem-list { position: relative; max-width: 760px; margin: 18px auto 0; }
  .wf .stem-list::before { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 24px; margin-left: -12px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='120' viewBox='0 0 24 120'%3E%3Cpath d='M12 0 C 20 20, 4 40, 12 60 C 20 80, 4 100, 12 120' fill='none' stroke='%2382974C' stroke-width='2'/%3E%3Cpath d='M14 30 C 22 24, 26 28, 24 34 C 20 36, 16 34, 14 30 Z M10 90 C 2 84, -2 88, 0 94 C 4 96, 8 94, 10 90 Z' fill='%2382974C'/%3E%3C/svg%3E") center top / 24px 120px repeat-y; }
  .wf .stem-row { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 70px minmax(0, 1fr); align-items: center; padding: 14px 0; }
  .wf .stem-bloom { grid-column: 2; display: flex; justify-content: center; }
  .wf .stem-card { background: var(--wf-paper); border-radius: 24px 24px 24px 6px; padding: 20px 24px; box-shadow: 0 16px 30px -24px rgba(62,58,44,0.6); text-align: left; }
  .wf .stem-row:nth-child(odd) .stem-card { grid-column: 1; grid-row: 1; text-align: right; border-radius: 24px 24px 6px 24px; }
  .wf .stem-row:nth-child(even) .stem-card { grid-column: 3; grid-row: 1; }
  .wf .stem-row .stem-bloom { grid-row: 1; }
  .wf .schedule-day-title { font-family: var(--wf-font-script); font-size: 42px; color: var(--wf-marigold); margin: 0 0 6px; }
  .wf .schedule-day { margin-bottom: 40px; }
  .wf .schedule-day:last-child { margin-bottom: 0; }
  .wf .schedule-time { font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--wf-marigold); margin: 0 0 4px; }
  .wf .stem-card .name { font-family: var(--wf-font-display); font-size: 21px; color: var(--wf-sage); margin: 0 0 2px; }
  .wf .stem-card .loc { font-size: 14px; color: rgba(62,58,44,0.68); margin: 0; }
  @media (max-width: 640px) {
    .wf .stem-list::before { left: 26px; }
    .wf .stem-row { grid-template-columns: 52px minmax(0, 1fr); }
    .wf .stem-row .stem-bloom { grid-column: 1; }
    .wf .stem-row:nth-child(odd) .stem-card, .wf .stem-row:nth-child(even) .stem-card { grid-column: 2; text-align: left; border-radius: 24px 24px 24px 6px; }
  }

  /* the card shared by RSVP, Potluck and Gift Exchange: soft organic
     corners with a poppy tucked into the top */
  .wf .wf-card { position: relative; max-width: 540px; margin: 0 auto; background: var(--wf-paper); padding: 62px 44px 46px; border-radius: 120px 36px 120px 36px / 70px 36px 70px 36px; text-align: left; box-shadow: 0 40px 80px -36px rgba(0,0,0,0.55); }
  .wf .wf-card-poppy { position: absolute; top: -46px; right: -26px; width: 120px; z-index: 2; pointer-events: none; filter: drop-shadow(0 10px 12px rgba(62,58,44,0.25)); }
  .wf .wf-card > *:not(.wf-card-poppy) { position: relative; }
  @media (max-width: 560px) { .wf .wf-card { padding: 58px 24px 36px; border-radius: 70px 26px 70px 26px / 50px 26px 50px 26px; } .wf .wf-card-poppy { width: 90px; right: -10px; top: -40px; } }

  /* rsvp: the wildflower table, the card on the right */
  .wf .rsvp-section { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; min-height: 880px; padding: 110px 6vw; overflow: hidden; background: var(--wf-ink); }
  .wf .rsvp-section .wf-photo-bg { background-position: 20% center; }
  .wf .rsvp-section::before { content: ''; position: absolute; inset: 0; z-index: 0; background: linear-gradient(to right, rgba(62,58,44,0) 30%, rgba(62,58,44,0.45) 100%); }
  .wf .rsvp-col { grid-column: 2; position: relative; z-index: 1; }
  @media (max-width: 900px) {
    .wf .rsvp-section { display: block; min-height: 0; padding: 0 18px 80px; background: var(--wf-linen); }
    .wf .rsvp-section .wf-photo-bg { position: relative; inset: auto; display: block; height: 70vw; margin: 0 -18px -40px; -webkit-mask-image: linear-gradient(to bottom, #000 60%, transparent); mask-image: linear-gradient(to bottom, #000 60%, transparent); }
    .wf .rsvp-section::before { display: none; }
  }
  .wf #potluck.rsvp-section, .wf #gift-exchange.rsvp-section { display: block; min-height: 0; padding: 130px 18px 100px; }
  .wf #potluck.rsvp-section { background: var(--wf-sage); }
  .wf #gift-exchange.rsvp-section { background: var(--wf-lilac); }
  .wf #potluck.rsvp-section::before, .wf #gift-exchange.rsvp-section::before { display: none; }

  /* gallery: photos in petal-soft shapes, each a little different */
  .wf .wf-gallery > div { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 22px !important; }
  .wf .wf-gallery button[style*="zoom-in"] { border-radius: 58% 42% 55% 45% / 48% 58% 42% 52% !important; }
  .wf .wf-gallery button[style*="zoom-in"]:nth-child(2n) { border-radius: 42% 58% 46% 54% / 56% 42% 58% 44% !important; }
  .wf .wf-gallery button[style*="zoom-in"]:nth-child(3n) { border-radius: 52% 48% 38% 62% / 42% 54% 46% 58% !important; }
  .wf .wf-gallery button[style*="zoom-in"]:nth-child(4n) { border-radius: 46% 54% 60% 40% / 52% 46% 54% 48% !important; }
  @media (max-width: 760px) { .wf .wf-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 14px !important; } }

  /* registry: the card box on the lawn, the card on the left */
  .wf .registry-wrap { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; min-height: 620px; padding: 90px 6vw; overflow: hidden; background: var(--wf-sage); }
  .wf .registry-wrap .wf-photo-bg { background-position: 70% center; }
  .wf .registry-wrap::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(to right, rgba(130,151,76,0.55) 0%, rgba(130,151,76,0) 60%); }
  .wf .registry-card { position: relative; z-index: 2; background: var(--wf-paper); padding: 54px 46px 46px; text-align: center; max-width: 480px; border-radius: 36px 120px 36px 120px / 36px 70px 36px 70px; box-shadow: 0 30px 60px -30px rgba(0,0,0,0.6); }
  .wf .registry-title { font-family: var(--wf-font-script); font-size: 64px; color: var(--wf-marigold); margin: 0 0 6px; font-weight: 400; line-height: 1; }
  .wf .registry-description { font-size: 15px; color: rgba(62,58,44,0.8); margin: 0 auto 26px; line-height: 1.8; max-width: 380px; }
  .wf .registry-button { display: inline-block; padding: 16px 32px; border-radius: 999px; background: var(--wf-sage); color: var(--wf-paper); text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; transition: background 0.3s ease; }
  .wf .registry-button:hover { background: var(--wf-marigold); }
  @media (max-width: 760px) {
    .wf .registry-wrap { display: block; min-height: 0; padding: 62vw 18px 70px; }
    .wf .registry-wrap .wf-photo-bg { bottom: auto; height: 80vw; background-position: 65% center; }
    .wf .registry-wrap::before { background: linear-gradient(to bottom, rgba(130,151,76,0) 30%, ${SAGE} 72vw); }
    .wf .registry-card { margin: 0 auto; padding: 46px 24px 36px; }
  }

  /* songs: lilac */
  .wf .song-section { background: var(--wf-lilac); padding: 112px 26px; text-align: center; }
  .wf .song-section .eyebrow { color: var(--wf-paper); }
  .wf .song-section .song-list { background: var(--wf-paper); border-radius: 26px; padding: 6px 24px; max-width: 560px; margin: 0 auto; }
  .wf .song-section .song-row { border-bottom: 1px solid ${OATMEAL}; padding: 12px 0; }
  .wf .song-section .song-row:last-child { border-bottom: none; }
  .wf .song-section .song-row .title { color: var(--wf-sage); font-family: var(--wf-font-display); }
  .wf .song-section .song-row .artist { color: rgba(62,58,44,0.65); }

  /* share: dandelion, the hashtag in dark ink */
  .wf .share-band { position: relative; padding: 104px 24px; text-align: center; background: var(--wf-dandelion); overflow: hidden; }
  .wf .share-band .eyebrow.on-dark { color: var(--wf-paper); }
  .wf .share-band .btn-outline.on-dark { color: var(--wf-ink); border-color: var(--wf-ink); }
  .wf .share-band .btn-outline.on-dark:hover { background: var(--wf-ink); border-color: var(--wf-ink); color: var(--wf-paper); }
  .wf .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .wf .share-hashtag { font-family: var(--wf-font-display); font-size: clamp(26px, 6vw, 66px); color: var(--wf-ink); margin: 0 0 30px; font-weight: 400; line-height: 1.05; overflow-wrap: anywhere; }

  /* every section after the banner rises over the one above on a soft wave
     (the section's own top edge is cut into a wave, whatever is behind it) */
  .wf { --wf-wave: 56px; }
  .wf .section, .wf .countdown-shell, .wf .rsvp-section, .wf .registry-wrap, .wf .song-section, .wf .share-band, .wf .footer {
    position: relative; margin-top: calc(var(--wf-wave) * -1);
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60' preserveAspectRatio='none'%3E%3Cpath d='M0 34 C 200 6, 420 58, 720 30 C 1000 4, 1220 52, 1440 22 V60 H0 Z'/%3E%3C/svg%3E") top / 100% calc(var(--wf-wave) + 1px) no-repeat, linear-gradient(#000 0 0) 0 var(--wf-wave) / 100% calc(100% - var(--wf-wave)) no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60' preserveAspectRatio='none'%3E%3Cpath d='M0 34 C 200 6, 420 58, 720 30 C 1000 4, 1220 52, 1440 22 V60 H0 Z'/%3E%3C/svg%3E") top / 100% calc(var(--wf-wave) + 1px) no-repeat, linear-gradient(#000 0 0) 0 var(--wf-wave) / 100% calc(100% - var(--wf-wave)) no-repeat; }
  .wf .countdown-shell, .wf .rsvp-section, .wf .song-section, .wf .footer {
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60' preserveAspectRatio='none'%3E%3Cpath d='M0 20 C 260 54, 520 4, 800 32 C 1060 58, 1260 10, 1440 38 V60 H0 Z'/%3E%3C/svg%3E") top / 100% calc(var(--wf-wave) + 1px) no-repeat, linear-gradient(#000 0 0) 0 var(--wf-wave) / 100% calc(100% - var(--wf-wave)) no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 60' preserveAspectRatio='none'%3E%3Cpath d='M0 20 C 260 54, 520 4, 800 32 C 1060 58, 1260 10, 1440 38 V60 H0 Z'/%3E%3C/svg%3E") top / 100% calc(var(--wf-wave) + 1px) no-repeat, linear-gradient(#000 0 0) 0 var(--wf-wave) / 100% calc(100% - var(--wf-wave)) no-repeat; }
  @media (max-width: 640px) { .wf { --wf-wave: 34px; } }

  /* footer: sage green, baby's breath at both sides */
  .wf .footer { position: relative; padding: 120px 24px 80px; background: var(--wf-sage); text-align: center; overflow: hidden; }
  .wf .footer > *:not(.wf-foot-sprig) { position: relative; z-index: 2; }
  .wf .footer p { font-size: 15px; color: rgba(238,227,221,0.88); margin: 0 0 4px; }
  .wf .footer p.eyebrow { font-size: 36px; color: var(--wf-dandelion); }
  .wf .footer-signoff { font-family: var(--wf-font-script); font-size: clamp(52px, 7vw, 76px) !important; color: var(--wf-lilac) !important; margin: 26px 0 0 !important; line-height: 1.05; }
  .wf .footer-credit { font-size: 11px !important; letter-spacing: 1px; color: rgba(238,227,221,0.5) !important; margin-top: 30px !important; }
  .wf .wf-foot-sprig { position: absolute; bottom: -40px; width: clamp(200px, 26vw, 380px); z-index: 1; pointer-events: none; opacity: 0.85; }
  .wf .wf-foot-sprig.left { left: -60px; transform: scaleX(-1); }
  .wf .wf-foot-sprig.right { right: -60px; }
  @media (max-width: 640px) { .wf .wf-foot-sprig { width: 170px; opacity: 0.5; } }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const HERO_EYEBROW_DEFAULT = { en: 'Together with their families', fr: 'Avec leurs familles', es: 'Junto a sus familias' };
// The seed packet's little label, and the bloom colours down the program stem.
const PACKET_TAG = { en: 'Wild & in love', fr: 'Fous amoureux', es: 'Locos de amor' };
const STEM_BLOOMS = [[LILAC, DANDELION], [DANDELION, MARIGOLD], [SAGE, DANDELION], [MARIGOLD, DANDELION], [PAPER, DANDELION]] as const;

// The form card, with a slowly turning poppy tucked into the corner.
function PoppyCard({ children }: { children: React.ReactNode }) {
  return (
    <Reveal className="wf-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="wf-card-poppy wf-spin" src={`${IMG}/poppy.webp`} alt="" aria-hidden="true" loading="lazy" width={300} height={289} />
      {children}
    </Reveal>
  );
}

export default function WildFlores({
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
  const heroSrc = bannerImage || HERO_DEFAULTS['wild-flores'];

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
  const textStyle: React.CSSProperties = { fontFamily: 'var(--wf-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'rgba(62,58,44,0.82)' };

  return (
    <div className="wf">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Sacramento&family=Karla:wght@400;500;700&display=swap" />
      <style>{css}</style>
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO — the names in the clearing of a wildflower frame */}
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
        <div className="hero-content">
          <span className="wf-hero-bloom"><Bloom size={40} color={LILAC} center={DANDELION} /></span>
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}>{heading}</h1>}
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date" style={heroTextStyle(heroStyle?.text.date)}>{heroDateText}</p>)}
          <div className="hero-actions">
            <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            <HeroButton id="story" href="#story" className="btn btn-outline" label={t.ourStoryBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />
            {galleryToken && showGuestPhotos !== false && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
          </div>
        </div>
      </div>

      {/* STORY — solid linen, flowing out of the banner */}
      {(description || editSlots?.description) && (
        <div id="story" className="section story section-center">
          <Reveal className="wrap">
            <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
            <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
            <MeadowRule />
            {editSlots?.description ?? <p className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
          </Reveal>
        </div>
      )}

      {/* COUNTDOWN — lilac from the top, baby's breath in the corner, pastel blooms */}
      {eventDate && (
        <div className="countdown-shell">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wf-hang" src={`${IMG}/lilac.webp`} alt="" aria-hidden="true" loading="lazy" width={420} height={991} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="wf-breath" src={`${IMG}/breath.webp`} alt="" aria-hidden="true" loading="lazy" width={800} height={872} />
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

      {/* DATE / LOCATION — a seed packet and the map in an organic frame */}
      {(showVenue || showVirtual) && (
        <Reveal>
          <div className="section section-linen section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <MeadowRule />
              <div className={`details-grid${mapSrc ? '' : ' single'}`}>
                <div className="packet">
                  <div className="packet-art">
                    <span className="packet-tag">{pickByLanguage(PACKET_TAG, language)}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="wf-spin" src={`${IMG}/poppy.webp`} alt="" aria-hidden="true" loading="lazy" width={300} height={289} />
                  </div>
                  <div className="packet-body">
                    <p className="label">{t.ceremony}</p>
                    {formattedTime && <p className="time">{formattedTime}</p>}
                    {eventDate && <p>{when.date}</p>}
                    {venueName && <p className="venue">{venueName}</p>}
                    {streetAddress && <p>{streetAddress}</p>}
                    {city && <p>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                    {mapsUrl && <a className="directions" href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>}
                    {showVirtual && <a className="directions" href={url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: mapsUrl ? 18 : 0 }}>{t.joinOnline}</a>}
                  </div>
                </div>
                {mapSrc && (
                  <div className="map-blob">
                    <iframe title="Venue map" src={mapSrc} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
              </div>
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
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <MeadowRule />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'rgba(62,58,44,0.8)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section, i) => (
        <Reveal key={`custom-${section.position}`}>
          <div className={`section section-center${i % 2 ? ' section-linen' : ''}`}>
            <div className="wrap">
              <MeadowRule />
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM — a meadow stem with a bloom at each moment */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" fallback={t.eventProgram} />
              <MeadowRule />
              {groupEventProgramByDate(eventProgram).map((group) => (
                <div className="schedule-day" key={group.date}>
                  <p className="schedule-day-title">{formatProgramDate(group.date, t.dateLocale)}</p>
                  <div className="stem-list">
                    {group.items.map((item, i) => {
                      const [color, center] = STEM_BLOOMS[i % STEM_BLOOMS.length];
                      return (
                        <div className="stem-row" key={item.id}>
                          <span className="stem-bloom"><Bloom size={40} color={color} center={center} className="wf-spin" style={{ animationDuration: `${24 + i * 4}s` }} /></span>
                          <div className="stem-card">
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
            </div>
          </div>
        </Reveal>
      )}

      {/* RSVP — at the wildflower table */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          <div className="wf-photo-bg" style={{ backgroundImage: `url(${IMG}/rsvp.jpeg)` }} aria-hidden="true" />
          <div className="rsvp-col">
            <PoppyCard>
              <div style={{ textAlign: 'center' }}>
                <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
                <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
                <MeadowRule />
              </div>
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </PoppyCard>
          </div>
        </div>
      )}

      {/* POTLUCK (Plus, off by default) — plain sage */}
      {isPaid && potluck && (
        <div id="potluck" className="rsvp-section">
          <PoppyCard>
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
              <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              <MeadowRule />
            </div>
            <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
          </PoppyCard>
        </div>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) — plain lilac */}
      {isPaid && giftExchange && (
        <div id="gift-exchange" className="rsvp-section">
          <PoppyCard>
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
              <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              <MeadowRule />
            </div>
            <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
          </PoppyCard>
        </div>
      )}

      {/* GALLERY — petal-soft shapes. Hidden on a live page until there are
          some; theme previews show sample photos. */}
      {(() => {
        const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
        return (editSlots?.gallery || gallery.length > 0) && (
          <Reveal>
            <div className="section section-linen section-center">
              <div className="wrap-wide">
                <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
                <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
                <MeadowRule />
                <div style={{ height: 18 }} />
                {editSlots?.gallery ?? <div className="wf-gallery"><GalleryGrid images={gallery} /></div>}
              </div>
            </div>
          </Reveal>
        );
      })()}

      {/* REGISTRY — beside the card box on the lawn */}
      {(registryDescription || registryButtonLink) && (
        <div className="registry-wrap">
          <div className="wf-photo-bg" style={{ backgroundImage: `url(${registryImage || `${IMG}/registry.jpeg`})` }} aria-hidden="true" />
          <Reveal className="registry-card">
            <p className="registry-title">{t.registry}</p>
            <MeadowRule />
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
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <MeadowRule />
              <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 24, border: `1.5px solid ${OATMEAL}`, background: '#fff' }} textStyle={{ color: 'rgba(62,58,44,0.8)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-oatmeal section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
              <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
              <MeadowRule />
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
              <MeadowRule />
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

      {/* SHARE / HASHTAG — dandelion */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER — sage green, baby's breath at both sides */}
      <footer className="footer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wf-foot-sprig left" src={`${IMG}/breath.webp`} alt="" aria-hidden="true" loading="lazy" width={800} height={872} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wf-foot-sprig right" src={`${IMG}/breath.webp`} alt="" aria-hidden="true" loading="lazy" width={800} height={872} />
        <Bloom size={36} color={DANDELION} center={MARIGOLD} className="wf-spin" style={{ display: 'block', margin: '0 auto 16px' }} />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--wf-dandelion)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--wf-dandelion)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
