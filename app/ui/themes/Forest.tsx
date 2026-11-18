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
import { eventWhen } from './event-when';
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

const IMG = '/images/themes/forest';

// Woodland and garden moments from the other wedding themes.
const GALLERY_PATHS = [
  '/images/themes/nature/photo-1.jpeg', '/images/themes/love/photo-1.jpeg', '/images/themes/the-day/photo-6.jpeg', '/images/themes/nature/photo-4.jpeg',
  '/images/themes/love/photo-5.jpeg', '/images/themes/the-day/photo-5.jpeg', '/images/themes/love/photo-2.jpeg', '/images/themes/love/photo-8.jpeg',
];
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = GALLERY_PATHS.map((image_path, i) => ({
  id: `fr-default-${i + 1}`,
  user_page_id: 0,
  image_path,
  image_name: '',
  image_type: 'image/jpeg',
  created_at: '',
}));

// Paper white and mist wash, sage and eucalyptus greens, a forest shadow.
const PAPER = '#FEFEFE';
const MIST = '#F3F5F0';
const PALE_SAGE = '#DEE6C2';
const SOFT_SAGE = '#C6D3AD';
const EUCALYPTUS = '#B0C4A3';
const BACKDROP = '#D8DCDD';
const SAGE_LEAF = '#96B28F';
const OLIVE_LEAF = '#AAB27D';
const MUTED_GREEN = '#7E987E';
const DEEP_EUCALYPTUS = '#5E7165';
const FOREST_SHADOW = '#39473A';
const CHARCOAL = '#2F3532';

// ─── decorations ─────────────────────────────────────────

// Watercolour eucalyptus, berries and grasses, lifted from the paper of a
// pair of printed invitations (their white made transparent). Each is
// anchored to the corner or edge it was cut from, and sways from there.
type Deco = 'cascade-left' | 'cascade-right' | 'corner-berries' | 'grass-tall' | 'grass-low' | 'spray-berries';
const DECO_SIZE: Record<Deco, [number, number]> = {
  'cascade-left': [523, 900],
  'cascade-right': [488, 900],
  'corner-berries': [499, 900],
  'grass-tall': [325, 900],
  'grass-low': [900, 282],
  'spray-berries': [251, 900],
};
function Leaves({ name, className }: { name: Deco; className: string }) {
  const [width, height] = DECO_SIZE[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`fr-deco ${className}`} src={`${IMG}/${name}.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" width={width} height={height} />
  );
}

// A small eucalyptus sprig between two hairlines — the section rule.
function Sprig() {
  return (
    <div className="fr-rule" aria-hidden="true">
      <svg width="168" height="34" viewBox="0 0 168 34">
        <path d="M0 17 H58" stroke={MUTED_GREEN} strokeOpacity="0.55" strokeWidth="1" />
        <path d="M110 17 H168" stroke={MUTED_GREEN} strokeOpacity="0.55" strokeWidth="1" />
        <g className="fr-rule-sprig">
          <path d="M62 22 C 72 19, 86 16, 104 11" fill="none" stroke={DEEP_EUCALYPTUS} strokeWidth="1.1" strokeLinecap="round" />
          <ellipse cx="68" cy="15.5" rx="5.2" ry="3.4" transform="rotate(-28 68 15.5)" fill={SAGE_LEAF} />
          <ellipse cx="74" cy="25" rx="5.2" ry="3.4" transform="rotate(24 74 25)" fill={EUCALYPTUS} />
          <ellipse cx="82" cy="12" rx="5" ry="3.3" transform="rotate(-32 82 12)" fill={MUTED_GREEN} />
          <ellipse cx="88" cy="21.5" rx="4.8" ry="3.2" transform="rotate(20 88 21.5)" fill={SAGE_LEAF} />
          <ellipse cx="96" cy="8.5" rx="4.4" ry="3" transform="rotate(-36 96 8.5)" fill={OLIVE_LEAF} />
          <ellipse cx="101" cy="16" rx="4" ry="2.7" transform="rotate(18 101 16)" fill={EUCALYPTUS} />
        </g>
      </svg>
    </div>
  );
}

// Watercolour blooming on wet paper: soft sage blots that spread slowly,
// change shape and fade, one after another.
function Blooms() {
  return (
    <div className="fr-blooms" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => <i key={i} />)}
    </div>
  );
}

// Late sun through the forest: a warm glow at the top left, where the sun is
// in the photo, and soft beams slanting down between the trees.
function Sunlight() {
  return (
    <div className="fr-sun" aria-hidden="true">
      <span className="fr-sun-glow" />
      {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} />)}
    </div>
  );
}

// ─── the date, set like the invitation's ─────────────────
//      JULY
//  WEDNESDAY | 28 | AT 5 PM
//      2027

type DateParts = { month: string; weekday: string; day: string; year: string; time: string };

function dateParts(eventDate: string | undefined, eventTime: string | undefined, locale: string): DateParts | null {
  if (!eventDate || !/^\d{4}-\d{2}-\d{2}/.test(eventDate)) return null;
  const d = new Date(eventDate.slice(0, 10) + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, o).format(d);
  let time = '';
  if (eventTime && /^\d{1,2}:\d{2}/.test(eventTime)) {
    const [h, m] = eventTime.split(':').map(Number);
    const at = new Date(2000, 0, 1, h, m);
    time = new Intl.DateTimeFormat(locale, m ? { hour: 'numeric', minute: '2-digit' } : { hour: 'numeric' }).format(at);
  }
  return { month: fmt({ month: 'long' }), weekday: fmt({ weekday: 'long' }), day: fmt({ day: 'numeric' }), year: fmt({ year: 'numeric' }), time };
}

function DateBlock({ parts, small }: { parts: DateParts; small?: boolean }) {
  return (
    <div className={`fr-date${small ? ' small' : ''}`}>
      <p className="fr-date-month">{parts.month}</p>
      <div className="fr-date-row">
        <span className="fr-date-side">{parts.weekday}</span>
        <span className="fr-date-day">{parts.day}</span>
        <span className="fr-date-side">{parts.time || parts.year}</span>
      </div>
      {parts.time && <p className="fr-date-year">{parts.year}</p>}
    </div>
  );
}

// ─── dashboard card preview ──────────────────────────────

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: PAPER, overflow: 'hidden', display: 'grid', gridTemplateColumns: '56% 44%' }}>
      <PreviewFont href="https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Alex+Brush&display=swap" />
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...previewImage(bannerImage || HERO_DEFAULTS.forest)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(57,71,58,0.7), rgba(57,71,58,0) 60%)' }} />
        <h2 style={{ position: 'absolute', left: 16, right: 12, bottom: 16, margin: 0, fontFamily: "'Cormorant', Georgia, serif", fontWeight: 300, fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.05, letterSpacing: 1.5, textTransform: 'uppercase', color: PAPER }}>{heading || 'Forest'}</h2>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 14px', background: `radial-gradient(ellipse 70% 40% at 60% 20%, rgba(198,211,173,0.35), rgba(198,211,173,0) 70%), ${PAPER}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/cascade-right.webp`} alt="" style={{ position: 'absolute', top: 0, right: 0, width: '52%', height: 'auto' }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${IMG}/corner-berries.webp`} alt="" style={{ position: 'absolute', bottom: 0, left: 0, width: '32%', height: 'auto' }} />
        <p style={{ position: 'relative', fontFamily: "'Alex Brush', cursive", fontSize: 26, color: DEEP_EUCALYPTUS, margin: '0 0 6px' }}>Save the date</p>
        {date && <p style={{ position: 'relative', fontFamily: 'system-ui, sans-serif', fontSize: 9, letterSpacing: 2.5, textTransform: 'uppercase', color: CHARCOAL, fontWeight: 600, margin: '0 0 4px' }}>{date}</p>}
        {loc && <p style={{ position: 'relative', fontFamily: 'system-ui, sans-serif', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: MUTED_GREEN, margin: 0 }}>{loc}</p>}
      </div>
    </div>
  );
}

// Data-URI leaves for the program's markers.
const LEAF_A = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cpath d='M20 2 C 35 9, 36 29, 20 38 C 4 29, 5 9, 20 2 Z' fill='%2396B28F' fill-opacity='0.85'/%3E%3Cpath d='M20 5 V36' stroke='%237E987E' stroke-width='1'/%3E%3C/svg%3E")`;
const LEAF_B = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cellipse cx='20' cy='20' rx='15' ry='17' fill='%23B0C4A3' fill-opacity='0.85'/%3E%3Cpath d='M20 4 V36' stroke='%235E7165' stroke-opacity='0.6' stroke-width='1'/%3E%3C/svg%3E")`;
// A soft watercolour wash, like the invitation's paper. Every blob fades out
// well inside the section, so its top and bottom edges are the plain paper
// and two sections of the same colour run into each other without a seam.
const WASH = `radial-gradient(ellipse 42% 24% at 18% 32%, rgba(198,211,173,0.38), rgba(198,211,173,0) 70%), radial-gradient(ellipse 38% 22% at 84% 68%, rgba(176,196,163,0.3), rgba(176,196,163,0) 70%), radial-gradient(ellipse 30% 18% at 70% 24%, rgba(222,230,194,0.5), rgba(222,230,194,0) 70%)`;

const css = `
  .fr {
    --fr-paper: ${PAPER};
    --fr-mist: ${MIST};
    --fr-pale: ${PALE_SAGE};
    --fr-soft: ${SOFT_SAGE};
    --fr-euc: ${EUCALYPTUS};
    --fr-backdrop: ${BACKDROP};
    --fr-leaf: ${SAGE_LEAF};
    --fr-olive: ${OLIVE_LEAF};
    --fr-muted: ${MUTED_GREEN};
    --fr-deep: ${DEEP_EUCALYPTUS};
    --fr-forest: ${FOREST_SHADOW};
    --fr-ink: ${CHARCOAL};
    --fr-font-display: 'Cormorant', 'Cormorant Garamond', Georgia, serif;
    --fr-font-script: 'Alex Brush', 'Great Vibes', cursive;
    --fr-font-sans: 'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --fr-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .fr * { box-sizing: border-box; }
  .fr { margin: 0; background: var(--fr-paper); color: var(--fr-ink); font-family: var(--fr-font-sans); font-weight: 400; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .fr img { max-width: 100%; }

  /* ─ motion: leaves swaying from where they hang, watercolour blooming,
       the banner photo settling, the mist moving through the trees ─ */
  @keyframes fr-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fr-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fr-settle { from { transform: scale(1.09); } to { transform: scale(1); } }
  @keyframes fr-sway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(var(--fr-sway, -1.8deg)); } }
  @keyframes fr-breathe { 0%, 100% { transform: rotate(-6deg) scale(1); } 50% { transform: rotate(-3deg) scale(1.03); } }
  @keyframes fr-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
  @keyframes fr-bloom {
    0% { opacity: 0; transform: scale(0.35) rotate(0deg); border-radius: 58% 42% 55% 45% / 48% 58% 42% 52%; }
    25% { opacity: 1; }
    60% { opacity: 0.75; transform: scale(1) rotate(22deg); border-radius: 42% 58% 46% 54% / 56% 42% 58% 44%; }
    100% { opacity: 0; transform: scale(1.3) rotate(40deg); border-radius: 52% 48% 38% 62% / 42% 54% 46% 58%; }
  }

  .fr .fr-deco { position: absolute; height: auto; pointer-events: none; z-index: 1; animation: fr-fade 2.2s var(--fr-ease) both, fr-sway 12s ease-in-out 2.2s infinite; }
  .fr .fr-deco.tl { top: 0; left: 0; transform-origin: top left; --fr-sway: 1.8deg; }
  .fr .fr-deco.tr { top: 0; right: 0; transform-origin: top right; }
  .fr .fr-deco.bl { bottom: 0; left: 0; transform-origin: bottom left; --fr-sway: -1.4deg; animation-duration: 2.2s, 14s; }
  .fr .fr-deco.br { bottom: 0; right: 0; transform-origin: bottom right; --fr-sway: 1.4deg; animation-duration: 2.2s, 13s; }
  .fr .fr-deco.r { right: 0; transform-origin: right center; --fr-sway: 2deg; animation-duration: 2.2s, 10s; }
  .fr .fr-deco.b { bottom: 0; left: 50%; margin-left: calc(var(--fr-w) / -2); width: var(--fr-w); transform-origin: bottom center; --fr-sway: 1deg; }

  .fr .fr-blooms { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .fr .fr-blooms i { position: absolute; width: var(--fr-s, 340px); aspect-ratio: 1; opacity: 0; filter: blur(26px);
    background: radial-gradient(circle at 46% 44%, rgba(176,196,163,0.34), rgba(198,211,173,0.18) 45%, rgba(222,230,194,0) 72%);
    animation: fr-bloom 20s ease-in-out infinite; }
  .fr .fr-blooms i:nth-child(1) { --fr-s: 400px; left: -12%; top: 4%; animation-delay: 0s; }
  .fr .fr-blooms i:nth-child(2) { --fr-s: 300px; right: -2%; top: 42%; animation-delay: -5s; animation-duration: 23s; }
  .fr .fr-blooms i:nth-child(3) { --fr-s: 440px; left: 24%; bottom: -18%; animation-delay: -10s; animation-duration: 26s; }
  .fr .fr-blooms i:nth-child(4) { --fr-s: 260px; left: 6%; top: 50%; animation-delay: -14s; animation-duration: 19s; background: radial-gradient(circle at 46% 44%, rgba(170,178,125,0.28), rgba(222,230,194,0.14) 45%, rgba(222,230,194,0) 72%); }
  .fr .fr-blooms i:nth-child(5) { --fr-s: 320px; right: 16%; top: -10%; animation-delay: -8s; animation-duration: 22s; }

  /* sunlight in the footer forest */
  @keyframes fr-beam { 0%, 100% { opacity: 0.2; transform: rotate(-30deg) translateX(0); } 50% { opacity: 1; transform: rotate(-27deg) translateX(24px); } }
  @keyframes fr-sun-glow { 0%, 100% { opacity: 0.65; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
  .fr .fr-sun { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; mix-blend-mode: screen; }
  .fr .fr-sun-glow { position: absolute; left: -14%; top: -40%; width: 64%; height: 110%; background: radial-gradient(ellipse at 32% 32%, rgba(247,240,198,0.42), rgba(247,240,198,0.12) 38%, rgba(247,240,198,0) 66%); animation: fr-sun-glow 12s ease-in-out infinite; }
  .fr .fr-sun i { position: absolute; top: -40%; height: 190%; transform-origin: top center; filter: blur(12px); opacity: 0.2;
    background: linear-gradient(to bottom, rgba(247,240,198,0.24), rgba(247,240,198,0.07) 55%, rgba(247,240,198,0));
    animation: fr-beam 14s ease-in-out infinite; }
  .fr .fr-sun i:nth-child(2) { left: 4%; width: 70px; animation-delay: 0s; }
  .fr .fr-sun i:nth-child(3) { left: 13%; width: 28px; animation-delay: -3s; animation-duration: 11s; }
  .fr .fr-sun i:nth-child(4) { left: 21%; width: 110px; animation-delay: -7s; animation-duration: 17s; }
  .fr .fr-sun i:nth-child(5) { left: 33%; width: 40px; animation-delay: -5s; animation-duration: 13s; }
  .fr .fr-sun i:nth-child(6) { left: 42%; width: 84px; animation-delay: -10s; animation-duration: 19s; }
  .fr .fr-sun i:nth-child(7) { left: 55%; width: 34px; animation-delay: -2s; animation-duration: 15s; opacity: 0.1; }
  @media (max-width: 640px) { .fr .fr-sun-glow { width: 110%; left: -40%; } .fr .fr-sun i { filter: blur(8px); } }

  @media (prefers-reduced-motion: reduce) {
    .fr *, .fr *::before, .fr *::after { animation: none !important; transition: none !important; }
    .fr .fr-blooms, .fr .fr-sun i { display: none; }
    /* the forest scrolls with the page instead of staying fixed behind it */
    .fr .fr-mist-photo > div { position: absolute !important; }
  }

  .fr .fr-rule { display: flex; justify-content: center; margin: 4px auto 26px; }
  .fr .fr-rule svg { display: block; overflow: visible; }
  .fr .fr-rule-sprig { transform-origin: 62px 22px; animation: fr-sway 7s ease-in-out infinite; --fr-sway: -4deg; }

  .fr .eyebrow { font-family: var(--fr-font-sans); font-size: 11px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: var(--fr-deep); margin: 0 0 6px; line-height: 1.6; }
  .fr .eyebrow.on-dark { color: var(--fr-pale); }
  .fr .section-title { font-family: var(--fr-font-script); font-size: clamp(54px, 6.6vw, 86px); font-weight: 400; color: var(--fr-ink); margin: 0 0 6px; line-height: 1.15; }
  .fr .section-title.on-dark { color: var(--fr-paper); }

  .fr .wrap { max-width: 720px; margin: 0 auto; padding: 0 26px; position: relative; z-index: 2; }
  .fr .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 26px; position: relative; z-index: 2; }
  .fr .section { position: relative; padding: 120px 26px; background: ${WASH}, var(--fr-paper); overflow: hidden; }
  .fr .section-mist { background: ${WASH}, var(--fr-mist); }
  .fr .section-center { text-align: center; }
  @media (max-width: 640px) { .fr .section { padding: 88px 20px; } }

  .fr .btn { font-family: var(--fr-font-sans); font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; padding: 17px 34px; border-radius: 8px; border: 1px solid var(--fr-deep); background: var(--fr-deep); color: var(--fr-paper); cursor: pointer; transition: background 0.5s var(--fr-ease), color 0.5s var(--fr-ease), border-color 0.5s var(--fr-ease), transform 0.5s var(--fr-ease), box-shadow 0.5s var(--fr-ease); text-decoration: none; display: inline-block; line-height: 1; height: auto; }
  @supports (text-box: trim-both cap alphabetic) { .fr .btn { text-box: trim-both cap alphabetic; padding-top: calc(17px + (1em - 1cap) / 2); padding-bottom: calc(17px + (1em - 1cap) / 2); } }
  .fr .btn:hover { background: var(--fr-forest); border-color: var(--fr-forest); transform: translateY(-2px); box-shadow: 0 14px 26px -16px rgba(57,71,58,0.7); }
  .fr .btn-outline { background: transparent; color: var(--fr-deep); border-color: var(--fr-deep); }
  .fr .btn-outline:hover { background: var(--fr-deep); border-color: var(--fr-deep); color: var(--fr-paper); }
  .fr .btn-outline.on-dark { color: var(--fr-paper); border-color: rgba(254,254,254,0.7); }
  .fr .btn-outline.on-dark:hover { background: var(--fr-paper); border-color: var(--fr-paper); color: var(--fr-forest); }

  .fr input, .fr textarea, .fr select { font-family: var(--fr-font-sans); font-size: 15px; padding: 13px 16px; border: 1px solid var(--fr-soft); border-radius: 2px; outline: none; background: #fff; color: var(--fr-ink); width: 100%; display: block; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
  .fr input:focus, .fr textarea:focus, .fr select:focus { border-color: var(--fr-muted); box-shadow: 0 0 0 4px rgba(150,178,143,0.2); }
  .fr input::placeholder, .fr textarea::placeholder { color: rgba(47,53,50,0.4); }
  .fr label.field-label { font-family: var(--fr-font-sans); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--fr-deep); display: block; margin-bottom: 8px; font-weight: 600; }
  .fr .radio-label, .fr .check-label { display: flex; align-items: center; gap: 10px; font-size: 15px; color: var(--fr-ink); cursor: pointer; }
  .fr .radio-label input, .fr .check-label input { width: auto; border: none; padding: 0; accent-color: var(--fr-deep); box-shadow: none; }
  .fr .check-hint { font-size: 12px; color: rgba(47,53,50,0.62); margin: 4px 0 0; }
  .fr .attend-options { display: flex; gap: 22px; margin-top: 8px; flex-wrap: wrap; }
  .fr .rsvp-error { color: #9A3B2C; font-size: 13px; margin: 0; }
  .fr .rsvp-success { text-align: center; padding: 20px 0; }
  .fr .rsvp-headline { font-family: var(--fr-font-script); font-size: 60px; color: var(--fr-deep); margin: 0 0 8px; font-weight: 400; line-height: 1.1; }
  .fr .rsvp-sub { font-size: 14px; color: var(--fr-ink); margin: 0; }
  .fr .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  /* the date, set like the invitation's */
  .fr .fr-date { display: inline-flex; flex-direction: column; align-items: center; color: var(--fr-ink); }
  .fr .fr-date-month, .fr .fr-date-year { font-family: var(--fr-font-sans); font-size: 15px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
  .fr .fr-date-month { margin-bottom: 8px; }
  .fr .fr-date-year { margin-top: 10px; }
  .fr .fr-date-row { display: flex; align-items: center; }
  .fr .fr-date-side { min-width: 118px; padding: 7px 6px; border-top: 1px solid rgba(47,53,50,0.45); border-bottom: 1px solid rgba(47,53,50,0.45); font-size: 11px; font-weight: 500; letter-spacing: 2.5px; text-transform: uppercase; text-align: center; white-space: nowrap; }
  .fr .fr-date-day { font-family: var(--fr-font-sans); font-weight: 600; font-size: clamp(50px, 5vw, 66px); line-height: 1; padding: 0 16px; letter-spacing: 1px; }
  .fr .fr-date.small .fr-date-side { min-width: 100px; font-size: 10px; letter-spacing: 2px; }
  .fr .fr-date.small .fr-date-day { font-size: 46px; padding: 0 12px; }
  @media (max-width: 420px) { .fr .fr-date-side { min-width: 92px; font-size: 9.5px; letter-spacing: 1.6px; } .fr .fr-date-day { font-size: 44px; padding: 0 10px; } }

  /* hero: the photo on the left with the names on it; the invitation on the
     right, eucalyptus hanging into its corner */
  .fr .hero { position: relative; display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); min-height: 100vh; background: var(--fr-paper); }
  .fr .hero-photo { position: relative; overflow: hidden; min-height: 100vh; background: var(--fr-forest); }
  .fr .hero-photo .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; animation: fr-settle 3.6s var(--fr-ease) both; }
  .fr .hero-shade { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(to top, rgba(57,71,58,0.72) 0%, rgba(57,71,58,0.25) 34%, rgba(57,71,58,0) 58%); }
  .fr .hero-names { position: absolute; left: 7%; right: 7%; bottom: 9%; z-index: 2; color: var(--fr-paper); }
  .fr .hero-names > * { animation: fr-in 1.4s var(--fr-ease) both; }
  .fr .hero-name { animation-delay: 0.5s !important; font-family: var(--fr-font-display); font-weight: 300; font-size: clamp(46px, 5.6vw, 88px); line-height: 1.02; letter-spacing: 3px; text-transform: uppercase; color: var(--fr-paper); margin: 0 0 14px; text-shadow: 0 2px 24px rgba(57,71,58,0.35); }
  .fr .hero-eyebrow { animation-delay: 0.8s !important; font-family: var(--fr-font-display); font-style: italic; font-weight: 400; font-size: clamp(20px, 1.9vw, 26px); color: rgba(254,254,254,0.92); margin: 0; line-height: 1.35; }

  .fr .hero-panel { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; padding: 140px 40px 110px; background: ${WASH}, var(--fr-paper); }
  .fr .hero-panel .fr-deco.tr { width: clamp(190px, 21vw, 330px); }
  .fr .hero-panel .fr-deco.bl { width: clamp(110px, 11vw, 180px); }
  .fr .hero-card { position: relative; z-index: 2; max-width: 420px; display: flex; flex-direction: column; align-items: center; }
  .fr .hero-card > * { animation: fr-in 1.3s var(--fr-ease) both; }
  .fr .hero-kicker { animation-delay: 0.9s !important; font-family: var(--fr-font-script); font-size: clamp(40px, 3.6vw, 54px); color: var(--fr-deep); margin: 0 0 22px; line-height: 1.1; }
  .fr .hero-card .fr-date { animation-delay: 1.1s !important; }
  .fr .hero-loc, .fr .hero-card .hero-date { animation-delay: 1.3s !important; font-family: var(--fr-font-sans); font-size: 11.5px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--fr-deep); margin: 26px 0 0; line-height: 1.8; }
  .fr .hero-actions { animation-delay: 1.5s !important; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 36px; }
  .fr .hero-more { animation-delay: 1.8s !important; margin-top: 34px; display: inline-flex; flex-direction: column; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--fr-muted); text-decoration: none; transition: color 0.4s ease; }
  .fr .hero-more:hover { color: var(--fr-forest); }
  .fr .hero-more svg { animation: fr-bob 2.6s ease-in-out infinite; }
  @media (max-width: 1080px) and (min-width: 861px) { .fr .hero { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); } }
  /* phones and small tablets: the photo first, with the names on it, then the invitation */
  @media (max-width: 860px) {
    .fr .hero { display: block; min-height: 0; }
    .fr .hero-photo { min-height: 0; height: 84svh; max-height: 760px; }
    .fr .hero-names { bottom: 7%; text-align: center; }
    .fr .hero-name { font-size: clamp(40px, 11vw, 64px); letter-spacing: 2px; }
    .fr .hero-panel { padding: 96px 22px 90px; }
    .fr .hero-panel .fr-deco.tr { width: 46vw; max-width: 260px; }
    .fr .hero-panel .fr-deco.bl { width: 26vw; max-width: 150px; }
    /* the photo melts into the paper below it */
    .fr .hero-photo::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 54px; z-index: 2; background: linear-gradient(to bottom, rgba(254,254,254,0), var(--fr-paper)); }
    .fr .hero-names { bottom: calc(7% + 30px); }
  }

  /* story: the paper and its watercolour wash, eucalyptus hanging in */
  .fr .story { padding: 130px 26px 140px; }
  .fr .story .fr-deco.tr { width: clamp(150px, 19vw, 300px); }
  .fr .story .fr-deco.bl { width: clamp(90px, 10vw, 170px); }
  .fr .story-text { font-family: var(--fr-font-display); font-size: clamp(20px, 2vw, 23px); line-height: 1.75; color: rgba(47,53,50,0.86); margin: 0 auto; max-width: 600px; }
  @media (max-width: 640px) { .fr .story { padding: 150px 22px 110px; } .fr .story .fr-deco.tr { width: 130px; } .fr .story .fr-deco.bl { width: 80px; } }

  /* countdown: the forest, fixed behind the page; clean edges above and below */
  .fr .countdown-shell { position: relative; overflow: hidden; background: var(--fr-mist); }
  /* the photo stays put while the page scrolls past, like a window onto the
     forest: a fixed layer clipped to the section (works on phones too, where
     background-attachment: fixed is ignored) */
  .fr .fr-mist-photo { position: absolute; inset: 0; overflow: hidden; clip-path: inset(0); }
  .fr .fr-mist-photo > div { position: fixed; inset: 0; background-size: cover; background-position: center; }
  .fr .fr-mist-photo::before { content: ''; position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom, rgba(57,71,58,0.35), rgba(57,71,58,0.62)); }
  .fr .countdown-wrap { position: relative; z-index: 2; padding: 190px 24px; text-align: center; }
  .fr .countdown-heading { font-family: var(--fr-font-script); font-size: clamp(54px, 6.6vw, 88px); color: var(--fr-paper); margin: 0 0 46px; font-weight: 400; line-height: 1.1; text-shadow: 0 2px 30px rgba(57,71,58,0.5); }
  .fr .countdown-row { display: flex; justify-content: center; gap: clamp(10px, 2.4vw, 26px); }
  .fr .countdown-block { display: flex; flex-direction: column; align-items: center; justify-content: center; width: clamp(76px, 12vw, 124px); aspect-ratio: 3 / 4; border: 1px solid rgba(254,254,254,0.5); border-radius: 999px 999px 3px 3px; background: rgba(254,254,254,0.08); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); transition: background 0.6s ease, transform 0.6s var(--fr-ease); }
  .fr .countdown-block:hover { background: rgba(254,254,254,0.16); transform: translateY(-4px); }
  .fr .countdown-value { font-family: var(--fr-font-display); font-weight: 300; font-size: clamp(32px, 4.8vw, 56px); color: var(--fr-paper); line-height: 1; margin-top: 10px; }
  .fr .countdown-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--fr-pale); margin-top: 8px; font-weight: 600; }
  @media (max-width: 480px) {
    .fr .countdown-wrap { padding: 150px 14px; }
    .fr .countdown-row { gap: 8px; }
    .fr .countdown-block { width: 72px; }
    .fr .countdown-value { font-size: 28px; }
    .fr .countdown-label { font-size: 8px; letter-spacing: 1.5px; }
  }

  /* details: an invitation card with its leaves, the map in an arch */
  .fr .details-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 56px; align-items: center; margin-top: 22px; }
  .fr .details-grid.single { grid-template-columns: minmax(0, 480px); justify-content: center; }
  .fr .fr-invite { position: relative; overflow: hidden; background: ${WASH}, var(--fr-paper); padding: 110px 40px 120px; text-align: center; box-shadow: 0 30px 60px -34px rgba(57,71,58,0.45), 0 2px 6px rgba(57,71,58,0.06); }
  .fr .fr-invite .fr-deco.tl { width: 44%; }
  .fr .fr-invite .fr-deco.r { top: 30%; width: 15%; }
  .fr .fr-invite .fr-deco.b { --fr-w: 72%; }
  .fr .fr-invite > :not(.fr-deco) { position: relative; z-index: 2; }
  .fr .fr-invite .label { font-family: var(--fr-font-script); font-size: 52px; color: var(--fr-ink); margin: 0 0 18px; line-height: 1.1; }
  .fr .fr-invite .time { font-family: var(--fr-font-display); font-size: 22px; font-style: italic; color: var(--fr-deep); margin: 16px 0 0; }
  .fr .fr-invite .venue { font-size: 13px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: var(--fr-ink); margin: 24px 0 4px; }
  .fr .fr-invite .addr { font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: rgba(47,53,50,0.72); margin: 0 0 3px; line-height: 1.7; }
  .fr .fr-invite .directions { display: inline-block; margin-top: 22px; font-size: 10.5px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--fr-deep); text-decoration: none; border-bottom: 1px solid var(--fr-leaf); padding-bottom: 4px; transition: color 0.4s ease, border-color 0.4s ease; }
  .fr .fr-invite .directions:hover { color: var(--fr-forest); border-color: var(--fr-forest); }
  .fr .map-arch { position: relative; aspect-ratio: 4 / 5; overflow: hidden; border-radius: 999px 999px 4px 4px; box-shadow: 0 0 0 10px var(--fr-paper), 0 0 0 11px var(--fr-soft), 0 34px 60px -34px rgba(57,71,58,0.55); }
  .fr .map-arch iframe { border: 0; display: block; width: 100%; height: 100%; }
  @media (max-width: 760px) { .fr .details-grid { grid-template-columns: 1fr; gap: 60px; } .fr .map-arch { max-width: 340px; margin: 0 auto; width: 100%; } .fr .fr-invite { padding: 100px 22px 110px; } }
  @media (max-width: 480px) { .fr .fr-invite { padding: 96px 14px 110px; } .fr .fr-invite .fr-deco.r { width: 11%; opacity: 0.75; } .fr .fr-date.small .fr-date-side { min-width: 78px; font-size: 9px; letter-spacing: 1.4px; } .fr .fr-date.small .fr-date-day { font-size: 40px; padding: 0 8px; } }

  /* program: a fine line through the day, a leaf at each moment */
  .fr .program .fr-deco.br { width: clamp(80px, 9vw, 150px); }
  .fr .program .fr-deco.bl { width: clamp(90px, 10vw, 160px); }
  .fr .tl-list { position: relative; max-width: 680px; margin: 10px auto 0; }
  .fr .tl-list::before { content: ''; position: absolute; top: 6px; bottom: 6px; left: 50%; width: 1px; background: linear-gradient(to bottom, rgba(126,152,126,0), var(--fr-muted) 12%, var(--fr-muted) 88%, rgba(126,152,126,0)); }
  .fr .tl-row { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 54px minmax(0, 1fr); align-items: center; padding: 16px 0; }
  .fr .tl-leaf { grid-column: 2; display: flex; justify-content: center; }
  .fr .tl-leaf span { width: 18px; height: 18px; background: ${LEAF_A} center / contain no-repeat; transform: rotate(45deg); transition: transform 0.8s var(--fr-ease); }
  .fr .tl-row:hover .tl-leaf span { transform: rotate(225deg); }
  .fr .tl-row:nth-child(even) .tl-leaf span { background-image: ${LEAF_B}; }
  .fr .tl-time { grid-column: 1; text-align: right; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: var(--fr-deep); margin: 0; }
  .fr .tl-body { grid-column: 3; text-align: left; }
  .fr .tl-body .name { font-family: var(--fr-font-display); font-size: 25px; font-weight: 500; color: var(--fr-ink); margin: 0; line-height: 1.2; }
  .fr .tl-body .loc { font-size: 13px; color: rgba(47,53,50,0.65); margin: 2px 0 0; }
  .fr .schedule-day-title { font-family: var(--fr-font-script); font-size: 44px; color: var(--fr-deep); margin: 0 0 8px; }
  .fr .schedule-day { margin-bottom: 44px; }
  .fr .schedule-day:last-child { margin-bottom: 0; }
  @media (max-width: 640px) {
    .fr .tl-list::before { left: 20px; }
    .fr .tl-row { grid-template-columns: 40px minmax(0, 1fr); grid-template-rows: auto auto; row-gap: 2px; }
    .fr .tl-leaf { grid-column: 1; grid-row: 1 / span 2; }
    .fr .tl-time, .fr .tl-body { grid-column: 2; text-align: left; }
    .fr .schedule-day-title { font-size: 34px; }
  }

  /* the card shared by RSVP, Potluck and Gift Exchange: paper with a fine
     inner frame, a white rose tucked into the corner, eucalyptus opposite */
  .fr .fr-card { position: relative; max-width: 560px; margin: 0 auto; background: ${WASH}, var(--fr-paper); padding: 84px 48px 56px; text-align: left; box-shadow: 0 40px 80px -40px rgba(57,71,58,0.55); }
  .fr .fr-card::after { content: ''; position: absolute; inset: 12px; border: 1px solid rgba(126,152,126,0.35); pointer-events: none; z-index: 3; }
  .fr .fr-card-clip { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
  .fr .fr-card-clip .fr-deco.tr { width: 40%; }
  .fr .fr-card-rose { position: absolute; top: -54px; left: -44px; width: 150px; height: auto; z-index: 4; pointer-events: none; filter: drop-shadow(0 14px 18px rgba(57,71,58,0.28)); animation: fr-breathe 9s ease-in-out infinite; }
  .fr .fr-card > *:not(.fr-card-rose):not(.fr-card-clip) { position: relative; z-index: 2; }
  @media (max-width: 560px) { .fr .fr-card { padding: 80px 24px 40px; } .fr .fr-card-rose { width: 108px; left: -14px; top: -46px; } }

  /* rsvp: the paper and its wash, like the section before it */
  .fr .rsvp-section { position: relative; padding: 170px 18px 160px; overflow: hidden; background: ${WASH}, var(--fr-paper); }
  /* after the program, the same paper carries on: no new band, a shorter gap */
  .fr .program + #rsvp { padding-top: 70px; }
  .fr .rsvp-section .fr-card { z-index: 2; }
  .fr #potluck.rsvp-section { background: var(--fr-soft); }
  .fr #gift-exchange.rsvp-section { background: var(--fr-euc); }
  @media (max-width: 640px) { .fr .rsvp-section { padding: 130px 16px 110px; } .fr .program + #rsvp { padding-top: 60px; } }

  /* gallery: square photos with rounded corners */
  .fr .fr-gallery > div { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 20px !important; }
  .fr .fr-gallery button[style*="zoom-in"] { aspect-ratio: 1 !important; border-radius: 14px !important; transition: transform 0.7s var(--fr-ease), box-shadow 0.7s var(--fr-ease) !important; }
  .fr .fr-gallery button[style*="zoom-in"]:hover { transform: translateY(-6px); box-shadow: 0 26px 40px -26px rgba(57,71,58,0.6); }
  /* the photo viewer: soft mist instead of black, green buttons */
  .fr .gallery-lightbox { background: rgba(243,245,240,0.96) !important; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); animation: fr-fade 0.4s ease both; }
  .fr .gallery-lightbox-img { border-radius: 14px !important; box-shadow: 0 30px 70px -30px rgba(57,71,58,0.55) !important; }
  .fr .gallery-lightbox-btn { background: var(--fr-deep) !important; color: var(--fr-paper) !important; }
  .fr .gallery-lightbox-btn:hover { background: var(--fr-forest) !important; }
  .fr .gallery-lightbox-count { color: var(--fr-deep) !important; font-family: var(--fr-font-sans) !important; letter-spacing: 3px !important; }
  @media (max-width: 760px) { .fr .fr-gallery > div { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 14px !important; } }

  /* registry: a full-width card with berries and eucalyptus in its corners */
  .fr .registry-wrap { position: relative; padding: 120px 6vw; background: ${WASH}, var(--fr-mist); overflow: hidden; }
  .fr .registry-grid { position: relative; z-index: 2; max-width: 1000px; margin: 0 auto; }
  .fr .registry-card { position: relative; overflow: hidden; background: var(--fr-paper); padding: 70px 44px 80px; text-align: center; box-shadow: 0 30px 60px -34px rgba(57,71,58,0.45); }
  .fr .registry-card .fr-deco.bl { width: clamp(110px, 17%, 180px); }
  .fr .registry-card .fr-deco.tr { width: clamp(120px, 20%, 210px); }
  .fr .registry-card > :not(.fr-deco) { position: relative; z-index: 2; }
  .fr .registry-title { font-family: var(--fr-font-script); font-size: 64px; color: var(--fr-ink); margin: 0 0 4px; font-weight: 400; line-height: 1.1; }
  .fr .registry-description { font-size: 15px; color: rgba(47,53,50,0.78); margin: 0 auto 28px; line-height: 1.85; max-width: 520px; }
  .fr .registry-button { display: inline-block; padding: 17px 34px; border-radius: 8px; background: var(--fr-deep); color: var(--fr-paper); text-decoration: none; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; transition: background 0.5s var(--fr-ease), transform 0.5s var(--fr-ease); }
  .fr .registry-button:hover { background: var(--fr-forest); transform: translateY(-2px); }
  @media (max-width: 760px) { .fr .registry-card { padding: 60px 24px 80px; } .fr .registry-wrap { padding: 100px 20px; } }

  /* songs: deep eucalyptus */
  .fr .song-section { position: relative; background: var(--fr-deep); padding: 120px 26px; text-align: center; overflow: hidden; }
  .fr .song-section .eyebrow { color: var(--fr-pale); }
  .fr .song-section .section-title { color: var(--fr-paper); }
  .fr .song-section .song-list { background: var(--fr-paper); border-radius: 2px; padding: 6px 24px; max-width: 560px; margin: 0 auto; }
  .fr .song-section .song-row { border-bottom: 1px solid ${PALE_SAGE}; padding: 12px 0; }
  .fr .song-section .song-row:last-child { border-bottom: none; }
  .fr .song-section .song-row .title { color: var(--fr-ink); font-family: var(--fr-font-display); font-size: 19px; }
  .fr .song-section .song-row .artist { color: rgba(47,53,50,0.62); }

  /* share: paper, grasses growing up from the bottom */
  .fr .share-wrap { position: relative; overflow: hidden; background: ${WASH}, var(--fr-paper); }
  .fr .share-wrap .fr-deco.b { --fr-w: min(560px, 86vw); opacity: 0.95; }
  .fr .share-band { position: relative; z-index: 2; padding: 120px 24px 170px; text-align: center; }
  .fr .share-band .eyebrow.on-dark { color: var(--fr-deep); }
  .fr .share-band .btn-outline.on-dark { color: var(--fr-deep); border-color: var(--fr-deep); background: rgba(254,254,254,0.7); }
  .fr .share-band .btn-outline.on-dark:hover { background: var(--fr-deep); border-color: var(--fr-deep); color: var(--fr-paper); }
  .fr .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .fr .share-hashtag { font-family: var(--fr-font-display); font-weight: 300; font-size: clamp(28px, 5.6vw, 62px); letter-spacing: 1px; color: var(--fr-ink); margin: 0 0 30px; line-height: 1.1; overflow-wrap: anywhere; }

  /* footer: the forest at dusk, a white rose, sunlight through the trees */
  .fr .footer { position: relative; padding: 130px 24px 70px; background: var(--fr-forest); text-align: center; overflow: hidden; }
  .fr .footer .fr-footer-photo { position: absolute; inset: 0; background-size: cover; background-position: center 40%; opacity: 0.3; -webkit-mask-image: linear-gradient(to bottom, #000, transparent 85%); mask-image: linear-gradient(to bottom, #000, transparent 85%); }
  .fr .footer > *:not(.fr-footer-photo):not(.fr-sun) { position: relative; z-index: 2; }
  .fr .footer-rose { display: block; width: 92px; height: auto; margin: 0 auto 18px; filter: drop-shadow(0 12px 18px rgba(0,0,0,0.35)); animation: fr-breathe 9s ease-in-out infinite; }
  .fr .footer p { font-size: 14px; color: rgba(254,254,254,0.82); margin: 0 0 4px; }
  .fr .footer a { color: var(--fr-pale); text-decoration: none; }
  .fr .footer-signoff { font-family: var(--fr-font-script); font-size: clamp(50px, 6.6vw, 74px) !important; color: var(--fr-pale) !important; margin: 30px 0 0 !important; line-height: 1.15; }
  .fr .footer-credit { font-size: 11px !important; letter-spacing: 1px; color: rgba(254,254,254,0.45) !important; margin-top: 36px !important; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

const HERO_EYEBROW_DEFAULT = { en: 'We can’t wait to celebrate with you', fr: 'Nous avons hâte de célébrer avec vous', es: 'Estamos deseando celebrarlo con ustedes' };
const SAVE_THE_DATE = { en: 'Save the date', fr: 'Réservez la date', es: 'Reserva la fecha' };
const VIEW_DETAILS = { en: 'View details', fr: 'Voir les détails', es: 'Ver los detalles' };

// The form card, with a white rose tucked into its corner.
function RoseCard({ children }: { children: React.ReactNode }) {
  return (
    <Reveal className="fr-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="fr-card-rose" src={`${IMG}/rose.webp`} alt="" aria-hidden="true" loading="lazy" width={600} height={601} />
      <div className="fr-card-clip"><Leaves name="cascade-right" className="tr" /></div>
      {children}
    </Reveal>
  );
}

export default function Forest({
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
  const heroSrc = bannerImage || HERO_DEFAULTS.forest;
  const parts = dateParts(eventDate, eventTime, t.dateLocale);
  const place = [city, country].filter(Boolean).join(', ');

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
  const hasStory = !!(description || editSlots?.description);
  const moreHref = showVenue || showVirtual ? '#details' : hasStory ? '#story' : null;
  const textStyle: React.CSSProperties = { fontFamily: 'var(--fr-font-sans)', fontSize: 16, lineHeight: 1.9, color: 'rgba(47,53,50,0.82)' };

  return (
    <div className="fr">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant:ital,wght@0,300;0,400;0,500;1,400&family=Montserrat:wght@400;500;600&display=swap" />
      <style>{css}</style>
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO — the photo with the names, the invitation beside it */}
      <div className="hero">
        <div className="hero-photo">
          {editSlots?.heroBg ?? (
            isVideoUrl(heroSrc) ? (
              <video className="hero-bg" src={heroSrc} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="hero-bg" src={heroSrc} alt="" fetchPriority="high" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
            )
          )}
          {!editSlots?.heroBg && <HeroOverlay overlay={heroOverlay} />}
          <div className="hero-shade" />
          <div className="hero-names">
            {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.name) }}>{heading}</h1>}
            {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line', ...heroTextStyle(heroStyle?.text.eyebrow) }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          </div>
        </div>

        <div className="hero-panel">
          <Leaves name="cascade-right" className="tr" />
          <Leaves name="corner-berries" className="bl" />
          <Blooms />
          <div className="hero-card">
            <p className="hero-kicker">{pickByLanguage(SAVE_THE_DATE, language)}</p>
            {parts && <DateBlock parts={parts} />}
            {/* In the editor the line opens the date and place editor; on the page it names the place. */}
            {editSlots?.heroDate
              ? (eventDate ? editSlots.heroDate : null)
              : place && <p className="hero-loc" style={heroTextStyle(heroStyle?.text.date)}>{place}</p>}
            <div className="hero-actions">
              {showRsvp !== false && <HeroButton id="rsvp" href="#rsvp" className="btn" label={t.rsvpBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
              {hasStory && <HeroButton id="story" href="#story" className="btn btn-outline" label={t.ourStoryBtn} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
              {galleryToken && showGuestPhotos !== false && <HeroButton id="photos" href="#photos" className="btn btn-outline" label={t.shareYourPhoto} heroStyle={heroStyle} editPageId={editSlots?.heroEditPageId} />}
            </div>
            {moreHref && (
              <a className="hero-more" href={moreHref}>
                {pickByLanguage(VIEW_DETAILS, language)}
                <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true"><path d="M1 1 L11 8 L21 1" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* STORY — the paper with its wash, eucalyptus hanging in from the right
          (the banner's berries are just above on the left) */}
      {hasStory && (
        <div id="story" className="section story section-center">
          <Leaves name="cascade-right" className="tr" />
          <Leaves name="corner-berries" className="bl" />
          <Reveal className="wrap">
            <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
            <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
            <Sprig />
            {editSlots?.description ?? <p data-story-text className="story-text" style={{ whiteSpace: 'pre-line' }}>{description}</p>}
          </Reveal>
        </div>
      )}

      {/* COUNTDOWN — mist through the forest */}
      {eventDate && (
        <div className="countdown-shell">
          <div className="fr-mist-photo" aria-hidden="true"><div style={{ backgroundImage: `url(${IMG}/misty-forest.jpeg)` }} /></div>
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

      {/* DATE / LOCATION — an invitation card, the map in an arch */}
      {(showVenue || showVirtual) && (
        <div id="details" className="section section-mist section-center">
          <Reveal className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
            <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
            <Sprig />
            <div className={`details-grid${mapSrc ? '' : ' single'}`}>
              <div className="fr-invite">
                <Leaves name="cascade-left" className="tl" />
                <Leaves name="spray-berries" className="r" />
                <Leaves name="grass-low" className="b" />
                <p className="label">{t.ceremony}</p>
                {parts && <DateBlock parts={parts} small />}
                {formattedTime && <p className="time">{formattedTime}</p>}
                {venueName && <p className="venue">{venueName}</p>}
                {streetAddress && <p className="addr">{streetAddress}</p>}
                {city && <p className="addr">{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                {mapsUrl && <a className="directions" href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>}
                {showVirtual && <a className="directions" href={url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: mapsUrl ? 18 : 0 }}>{t.joinOnline}</a>}
              </div>
              {mapSrc && (
                <div className="map-arch">
                  <iframe title="Venue map" src={mapSrc} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      )}

      {/* LIVE STREAM (Plus) */}
      {isPaid && livestream && (
        <div id="livestream" className="section section-center">
          <Reveal className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
            <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
            <Sprig />
            <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'rgba(47,53,50,0.8)' }} />
          </Reveal>
        </div>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {customSections?.map((section, i) => (
        <div key={`custom-${section.position}`} className={`section section-center${i % 2 ? ' section-mist' : ''}`}>
          <Reveal className="wrap">
            <Sprig />
            <CustomSectionContent section={section} titleClassName="section-title" textStyle={textStyle} />
          </Reveal>
        </div>
      ))}

      {/* EVENT PROGRAM — a fine line through the day, a leaf at each moment */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <div className="section program section-center">
          <Leaves name="grass-tall" className="br" />
          <Leaves name="corner-berries" className="bl" />
          <Reveal className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule} />
            <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" fallback={t.eventProgram} />
            <Sprig />
            {groupEventProgramByDate(eventProgram).map((group) => (
              <div className="schedule-day" key={group.date}>
                <p className="schedule-day-title">{formatProgramDate(group.date, t.dateLocale)}</p>
                <div className="tl-list">
                  {group.items.map((item) => {
                    const time = formatProgramTime(item, t.dateLocale);
                    return (
                      <div className="tl-row" key={item.id}>
                        <p className="tl-time">{time}</p>
                        <span className="tl-leaf" aria-hidden="true"><span /></span>
                        <div className="tl-body">
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

      {/* RSVP — the paper carries on from the section before */}
      {showRsvp !== false && (
        <div id="rsvp" className="rsvp-section">
          <RoseCard>
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
              <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              <Sprig />
            </div>
            <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
          </RoseCard>
        </div>
      )}

      {/* POTLUCK (Plus, off by default) — soft sage */}
      {potluck && (
        <div id="potluck" className="rsvp-section">
          <RoseCard>
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
              <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              <Sprig />
            </div>
            <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
          </RoseCard>
        </div>
      )}

      {/* GIFT EXCHANGE (Plus, off by default) — eucalyptus */}
      {giftExchange && (
        <div id="gift-exchange" className="rsvp-section">
          <RoseCard>
            <div style={{ textAlign: 'center' }}>
              <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
              <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              <Sprig />
            </div>
            <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
          </RoseCard>
        </div>
      )}

      {/* GALLERY — square photos with rounded corners. Hidden on a live page until there are
          some; theme previews show sample photos. */}
      {(() => {
        const gallery = galleryImages?.length ? galleryImages : demo ? DEFAULT_GALLERY_IMAGES : [];
        return (editSlots?.gallery || gallery.length > 0) && (
          <div className="section section-center">
            <Reveal className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
              <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
              <Sprig />
              <div style={{ height: 14 }} />
              {editSlots?.gallery ?? <div className="fr-gallery"><GalleryGrid images={gallery} /></div>}
            </Reveal>
          </div>
        );
      })()}

      {/* REGISTRY — a full-width card with berries and eucalyptus in its corners */}
      {(registryDescription || registryButtonLink) && (
        <div className="registry-wrap">
          <div className="registry-grid">
            <Reveal className="registry-card">
              <Leaves name="corner-berries" className="bl" />
              <Leaves name="cascade-right" className="tr" />
              <p className="registry-title">{t.registry}</p>
              <Sprig />
              {registryDescription && <p className="registry-description" style={{ whiteSpace: 'pre-line' }}>{registryDescription}</p>}
              {registryButtonLink && (
                <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                  {registryButtonText || t.viewRegistry}
                </a>
              )}
            </Reveal>
          </div>
        </div>
      )}

      {/* SPONSORS (Plus) */}
      {isPaid && sponsors && sponsors.length > 0 && (
        <div className="section section-center">
          <Reveal className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
            <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
            <Sprig />
            <SponsorGrid sponsors={sponsors} cardStyle={{ borderRadius: 2, border: `1px solid ${SOFT_SAGE}`, background: '#fff' }} textStyle={{ color: 'rgba(47,53,50,0.8)' }} />
          </Reveal>
        </div>
      )}

      {/* GUEST PHOTOS */}
      {galleryToken && showGuestPhotos !== false && (
        <div id="photos" className="section section-mist section-center">
          <Reveal className="wrap">
            <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" fallback={t.guestPhotos} />
            <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
            <Sprig />
            <GuestPhotoSection
              userPageId={galleryToken}
              initialPhotos={guestPhotos ?? []}
              initialHasMore={guestPhotosHasMore ?? false}
              labels={{ shareYourPhoto: t.shareYourPhoto, loadMore: t.loadMore, beFirstToShare: t.beFirstToShare, photoUploaded: t.photoUploaded, photoUploadError: t.photoUploadError, uploading: t.sending }}
              btnClassName="btn"
              disabled={formsDisabled}
            />
          </Reveal>
        </div>
      )}

      {/* SONG REQUESTS — deep eucalyptus */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <div className="song-section">
          <Reveal className="wrap">
            <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" fallback={t.buildOurPlaylist} />
            <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" fallback={t.songRequests} />
            <SongRequestSection
              userPageId={galleryToken}
              initialSongs={guestSongs ?? []}
              initialHasMore={guestSongsHasMore ?? false}
              labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
              btnClassName="btn btn-outline on-dark"
              disabled={formsDisabled}
            />
          </Reveal>
        </div>
      )}

      {/* SHARE / HASHTAG — paper, grasses growing up from the bottom */}
      {showShare !== false && shareUrl && (
        <div className="share-wrap">
          <Leaves name="grass-low" className="b" />
          <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
        </div>
      )}

      {/* FOOTER — the forest at dusk, a white rose, sunlight through the trees */}
      <footer className="footer">
        <div className="fr-footer-photo" style={{ backgroundImage: `url(${IMG}/misty-forest.jpeg)` }} aria-hidden="true" />
        <Sunlight />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="footer-rose" src={`${IMG}/rose.webp`} alt="" aria-hidden="true" loading="lazy" width={600} height={601} />
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 10 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
