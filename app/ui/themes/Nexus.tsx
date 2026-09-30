import type { ThemeProps, ThemePreviewProps } from './types';
import type { Translations } from '@/app/lib/translations';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import { Reveal } from './Reveal';
import { PreviewTopBar } from './PreviewTopBar';
import { HERO_DEFAULTS } from './hero-defaults';
import { getTranslations, localizeDate, pickByLanguage } from '@/app/lib/translations';
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

// Exclusive to Nexus — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'nx-default-1', user_page_id: 0, image_path: '/images/themes/nexus/celebration-1.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'nx-default-2', user_page_id: 0, image_path: '/images/themes/nexus/celebration-2.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'nx-default-3', user_page_id: 0, image_path: '/images/themes/nexus/celebration-3.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'nx-default-4', user_page_id: 0, image_path: '/images/themes/nexus/celebration-4.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'nx-default-5', user_page_id: 0, image_path: '/images/themes/nexus/celebration-5.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'nx-default-6', user_page_id: 0, image_path: '/images/themes/nexus/celebration-6.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'nx-default-7', user_page_id: 0, image_path: '/images/themes/nexus/celebration-7.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'nx-default-8', user_page_id: 0, image_path: '/images/themes/nexus/celebration-8.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
];

type IconName = 'link' | 'calendar' | 'list' | 'users' | 'image' | 'external' | 'camera' | 'music' | 'mail';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'link':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="12" r="3" />
          <circle cx="17" cy="12" r="3" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="2.5" x2="8" y2="6.5" />
          <line x1="16" y1="2.5" x2="16" y2="6.5" />
        </svg>
      );
    case 'list':
      return (
        <svg {...common} aria-hidden="true">
          <line x1="9" y1="7" x2="20" y2="7" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="17" x2="20" y2="17" />
          <circle cx="4.5" cy="7" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="17" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20c0-3.5 2.7-6 5.5-6s5.5 2.5 5.5 6" />
          <circle cx="17.5" cy="9" r="2.2" />
          <path d="M15.8 20c0-2.6 1.8-4.6 4-5" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.6" />
          <path d="M3 16l5-5 4 4 3-3 6 6" />
        </svg>
      );
    case 'external':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M14 4h6v6" />
          <path d="M20 4L10 14" />
          <path d="M18 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h6" />
        </svg>
      );
    case 'camera':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
          <circle cx="12" cy="14" r="3.4" />
        </svg>
      );
    case 'music':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M9 18V6l11-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="17.5" cy="16" r="2.5" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
  }
}

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#1D2124', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS.nexus} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(29,33,36,0.15) 0%, rgba(29,33,36,0.75) 55%, rgba(29,33,36,0.94) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 280 }}>
        <p style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: '#E1A360', fontWeight: 700, margin: '0 0 10px', fontFamily: "'JetBrains Mono', monospace" }}>You&apos;re invited</p>
        <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px', letterSpacing: -0.5 }}>{heading || 'Your Team Event'}</h2>
        {date && <p style={{ fontSize: 12, letterSpacing: 1, color: '#4FB6A8', margin: 0, fontWeight: 600 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --nx-bg: #1D2124;
    --nx-bg-soft: #262B2F;
    --nx-bg-softer: #2F353A;
    --nx-line: rgba(255,255,255,0.12);
    --nx-accent: #E1A360;
    --nx-accent-deep: #C6863F;
    --nx-teal: #4FB6A8;
    --nx-text: #FFFFFF;
    --nx-text-soft: rgba(255,255,255,0.65);
    --nx-font-display: 'Sora', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --nx-font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --nx-font-mono: 'JetBrains Mono', ui-monospace, monospace;
  }
  .nx * { box-sizing: border-box; }
  .nx { margin: 0; background: var(--nx-bg); color: var(--nx-text); font-family: var(--nx-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .nx img { max-width: 100%; }

  .nx .eyebrow { display: inline-flex; align-items: center; gap: 7px; font-family: var(--nx-font-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--nx-accent); font-weight: 600; margin: 0 0 14px; }
  .nx .eyebrow svg { color: var(--nx-accent); flex-shrink: 0; }
  .nx .eyebrow.teal, .nx .eyebrow.teal svg { color: var(--nx-teal); }
  .nx .section-title { font-family: var(--nx-font-display); font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: var(--nx-text); margin: 0 0 24px; letter-spacing: -0.5px; line-height: 1.1; }

  .nx .wrap { max-width: 780px; margin: 0 auto; padding: 0 28px; }
  .nx .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .nx .section { padding: 88px 28px; }
  .nx .section-center { text-align: center; }
  .nx .section-soft { background: var(--nx-bg-soft); }
  @media (max-width: 640px) { .nx .section { padding: 60px 20px; } }

  /* transition divider: a full-width border between sections, with small
     connected nodes (echoing the hero art) sitting on top of the seam. */
  .nx .nx-divider { position: relative; width: 100%; height: 1px; background: var(--nx-line); }
  .nx .nx-divider-node { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; line-height: 0; background: var(--nx-bg); padding: 0 14px; }

  .nx .btn { font-family: var(--nx-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 0.3px; padding: 14px 30px; border-radius: 6px; border: none; background: var(--nx-accent); color: #1D2124; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .nx .btn:hover { background: var(--nx-accent-deep); transform: translateY(-1px); }
  .nx .btn-outline { background: transparent; color: #FFFFFF; border: 1.5px solid var(--nx-teal); }
  .nx .btn-outline:hover { background: rgba(79,182,168,0.12); }

  .nx .hero { position: relative; min-height: 94vh; display: flex; align-items: center; justify-content: flex-end; text-align: right; padding: 96px 48px 88px; background: var(--nx-bg); overflow: hidden; }
  .nx .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.85; }
  .nx .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(29,33,36,0.15) 0%, rgba(29,33,36,0.72) 55%, rgba(29,33,36,0.94) 100%); z-index: 0; }
  .nx .hero-content { position: relative; z-index: 1; max-width: 560px; }
  @keyframes nx-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .nx .hero-eyebrow { animation: nx-rise 0.9s ease both; }
  .nx .hero-name { animation: nx-rise 0.9s ease 0.15s both; font-family: var(--nx-font-display); font-size: clamp(40px, 7.5vw, 76px); font-weight: 700; color: #fff; margin: 0 0 18px; line-height: 1.05; letter-spacing: -1px; }
  .nx .hero-date { animation: nx-rise 0.9s ease 0.3s both; font-family: var(--nx-font-mono); font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--nx-teal); font-weight: 600; margin: 0 0 32px; }
  .nx .hero-actions { animation: nx-rise 0.9s ease 0.45s both; display: flex; gap: 14px; justify-content: flex-end; flex-wrap: wrap; }

  .nx .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 12px; }
  @media (max-width: 640px) { .nx .details-grid { grid-template-columns: 1fr; } }
  .nx .details-card { background: var(--nx-bg-softer); border: 1px solid var(--nx-line); border-radius: 10px; padding: 30px 28px; text-align: left; }
  .nx .details-card .label { font-family: var(--nx-font-mono); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--nx-accent); font-weight: 600; margin: 0 0 12px; }
  .nx .details-card .time { font-family: var(--nx-font-display); font-size: 28px; font-weight: 700; line-height: 1.2; margin: 0 0 6px; color: #fff; }
  .nx .details-card p { font-size: 14px; color: var(--nx-text-soft); margin: 0 0 3px; }
  .nx .map-frame { border-radius: 10px; overflow: hidden; min-height: 220px; border: 1px solid var(--nx-line); }
  .nx .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; filter: grayscale(0.3) invert(0.92) contrast(0.9); }
  .nx .directions-link { text-align: center; margin-top: 20px; }
  .nx .directions-link a { font-size: 13px; color: var(--nx-teal); font-weight: 700; text-decoration: none; letter-spacing: 0.3px; }

  .nx .schedule-day { max-width: 640px; margin: 0 auto 40px; text-align: left; }
  .nx .schedule-day:last-child { margin-bottom: 0; }
  .nx .schedule-day-title { font-family: var(--nx-font-mono); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--nx-teal); font-weight: 600; margin: 0 0 16px; }
  .nx .schedule-list { border-top: 1px solid var(--nx-line); }
  .nx .schedule-row { display: flex; gap: 20px; padding: 18px 0; border-bottom: 1px solid var(--nx-line); align-items: baseline; }
  .nx .schedule-time { font-family: var(--nx-font-display); font-size: 15px; font-weight: 700; color: var(--nx-accent); min-width: 130px; flex-shrink: 0; }
  .nx .schedule-info .name { font-size: 15px; color: #fff; font-weight: 600; margin: 0 0 3px; }
  .nx .schedule-info .loc { font-size: 13px; color: var(--nx-text-soft); margin: 0; }

  .nx .rsvp-card { max-width: 460px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 36px 32px; text-align: left; box-shadow: 0 12px 40px rgba(0,0,0,0.35); }
  .nx .rsvp-card, .nx .rsvp-card input, .nx .rsvp-card textarea, .nx .rsvp-card select, .nx .rsvp-card label, .nx .rsvp-card .radio-label, .nx .rsvp-card .check-label { color: #1D2124; }
  .nx input, .nx textarea, .nx select { font-family: var(--nx-font-sans); font-size: 15px; padding: 10px 0; border-radius: 0; border: none; border-bottom: 1.5px solid #E4E1DB; outline: none; background: transparent; color: #1D2124; width: 100%; display: block; transition: border-color 0.2s ease; }
  .nx input:focus, .nx textarea:focus, .nx select:focus { border-bottom-color: var(--nx-accent); }
  .nx label.field-label { font-family: var(--nx-font-mono); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--nx-accent-deep); display: block; margin-bottom: 4px; font-weight: 600; }
  .nx .radio-label, .nx .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; cursor: pointer; }
  .nx .radio-label input, .nx .check-label input { width: auto; border: none; border-bottom: none; padding: 0; accent-color: var(--nx-accent); }
  .nx .check-hint { font-family: var(--nx-font-sans); font-size: 12px; color: #6B6470; margin: 4px 0 0; }
  .nx .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .nx .rsvp-error { color: #C1443A; font-size: 13px; margin: 0; font-family: var(--nx-font-sans); }
  .nx .rsvp-success { text-align: center; padding: 16px 0; }
  .nx .rsvp-headline { font-family: var(--nx-font-display); font-size: 26px; color: #1D2124; margin: 0 0 10px; font-weight: 700; }
  .nx .rsvp-sub { font-size: 14px; color: #6B6470; margin: 0; }
  .nx .rsvp-form { display: flex; flex-direction: column; gap: 20px; }

  .nx .gallery-tile { overflow: hidden; border-radius: 8px; border: 1px solid var(--nx-line); }

  .nx .registry-wrap { position: relative; width: 100%; min-height: 260px; display: flex; align-items: center; justify-content: center; background: var(--nx-bg-softer); border-top: 1px solid var(--nx-line); border-bottom: 1px solid var(--nx-line); }
  .nx .registry-overlay { padding: 48px 60px; text-align: center; }
  .nx .registry-title { font-family: var(--nx-font-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--nx-accent); margin: 0 0 14px; font-weight: 600; }
  .nx .registry-description { font-size: 15px; color: rgba(255,255,255,0.85); margin: 0 0 24px; line-height: 1.6; max-width: 400px; }
  .nx .registry-button { display: inline-block; padding: 13px 30px; border-radius: 6px; border: 1.5px solid var(--nx-teal); color: var(--nx-teal); text-decoration: none; font-family: var(--nx-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; transition: background 0.2s ease; }
  .nx .registry-button:hover { background: rgba(79,182,168,0.12); }

  .nx .song-section .song-list { border-top: 1px solid var(--nx-line); max-width: 560px; margin: 0 auto; text-align: left; }
  .nx .song-section .song-row { border-bottom: 1px solid var(--nx-line); padding: 10px 0; display: flex; justify-content: space-between; }
  .nx .song-section .song-row .title { color: #fff; }
  .nx .song-section .song-row .artist { color: var(--nx-text-soft); }
  .nx .song-section input { color: #fff; border-bottom-color: rgba(255,255,255,0.25); }
  .nx .song-section input::placeholder { color: rgba(255,255,255,0.4); }
  .nx .song-section input:focus { border-bottom-color: var(--nx-accent); }
  .nx .song-section label.field-label { color: rgba(255,255,255,0.7); }

  .nx .footer { padding: 88px 24px 68px; background: var(--nx-bg-soft); text-align: center; border-top: 1px solid var(--nx-line); }
  .nx .footer p { font-size: 14px; color: var(--nx-text-soft); margin: 0 0 4px; }
  .nx .footer-rule { width: 40px; height: 1px; background: var(--nx-accent); margin: 24px auto; border: none; }
  .nx .footer-signoff { font-family: var(--nx-font-display); font-size: 18px; font-weight: 700; color: var(--nx-accent); margin: 0; }
  .nx .footer-credit { font-family: var(--nx-font-sans); font-size: 11px; color: var(--nx-text-soft); opacity: 0.7; margin-top: 24px; letter-spacing: 0.3px; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US'): string {
  const formatted = localizeDate(dateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'The Mission',
    ourStoryLabel: 'The mission',
    howWeGotHere: "Why we're gathering",
    theDetails: 'The details',
    dateAndLocation: 'When & where',
    eventProgram: 'Agenda',
    theSchedule: "What's on deck",
    kindlyRespond: 'Confirm your spot',
    registry: 'Resources',
    viewRegistry: 'View resource',
    noteForCouple: 'A note for the organizers',
    noteForCouplePlaceholder: 'Dietary needs, accessibility, questions…',
    songRequests: 'Music Requests',
    buildOurPlaylist: 'Set the mood',
    withLove: 'See you there,',
    theCouple: 'the team',
  },
  fr: {
    ourStoryBtn: 'La mission',
    ourStoryLabel: 'La mission',
    howWeGotHere: 'Pourquoi nous nous réunissons',
    theDetails: 'Les détails',
    dateAndLocation: 'Quand et où',
    eventProgram: 'Programme',
    theSchedule: 'Au programme',
    kindlyRespond: 'Confirmez votre présence',
    registry: 'Ressources',
    viewRegistry: 'Voir la ressource',
    noteForCouple: 'Un mot pour les organisateurs',
    noteForCouplePlaceholder: 'Besoins alimentaires, accessibilité, questions…',
    songRequests: 'Demandes musicales',
    buildOurPlaylist: "Composez l'ambiance",
    withLove: 'À bientôt,',
    theCouple: "l'équipe",
  },
  es: {
    ourStoryBtn: 'La misión',
    ourStoryLabel: 'La misión',
    howWeGotHere: 'Por qué nos reunimos',
    theDetails: 'Los detalles',
    dateAndLocation: 'Cuándo y dónde',
    eventProgram: 'Agenda',
    theSchedule: 'Qué esperar',
    kindlyRespond: 'Confirma tu lugar',
    registry: 'Recursos',
    viewRegistry: 'Ver recurso',
    noteForCouple: 'Una nota para los organizadores',
    noteForCouplePlaceholder: 'Necesidades alimentarias, accesibilidad, preguntas…',
    songRequests: 'Solicitudes de música',
    buildOurPlaylist: 'Elige el ambiente',
    withLove: 'Nos vemos allí,',
    theCouple: 'el equipo',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };

const NexusDivider = () => (
  <div className="nx-divider" aria-hidden="true">
    <span className="nx-divider-node">
      <svg width="30" height="10" viewBox="0 0 30 10" fill="none">
        <circle cx="2" cy="5" r="2" fill="#E1A360" />
        <line x1="4" y1="5" x2="13" y2="5" stroke="#E1A360" strokeWidth="1" />
        <circle cx="15" cy="5" r="2.6" fill="#4FB6A8" />
        <line x1="17.5" y1="5" x2="26" y2="5" stroke="#E1A360" strokeWidth="1" />
        <circle cx="28" cy="5" r="2" fill="#E1A360" />
      </svg>
    </span>
  </div>
);

export default function Nexus({
  heading,
  description,
  eventDate,
  eventTime,
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
  isLoggedIn,
}: ThemeProps) {
  const base = getTranslations(language);
  // Nexus reuses every shared form/section component as-is — only the copy
  // that's inherently bride/groom-flavored is overridden here.
  const t: Translations = { ...base, ...pickByLanguage(OVERRIDES, language) };
  const isPreview = !!editSlots;
  const heroDateText = eventDate ? formatDate(eventDate, city, country, t.dateLocale) : '';

  const formattedTime = eventTime
    ? new Date(`1970-01-01T${eventTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '';

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
    <div className="nx">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(bannerImage || HERO_DEFAULTS.nexus) ? (
            <video className="hero-bg" src={bannerImage || HERO_DEFAULTS.nexus} autoPlay muted loop playsInline style={{ objectFit: heroObjectFit }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage || HERO_DEFAULTS.nexus} alt="" style={{ objectFit: heroObjectFit }} />
          )
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="eyebrow hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
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
        <>
          <Reveal>
            <div id="story" className="section section-center">
              <div className="wrap">
                <p className="eyebrow"><Icon name="link" />{t.ourStoryLabel}</p>
                <h2 className="section-title">{t.howWeGotHere}</h2>
                {editSlots?.description ?? (
                  <p style={{ fontFamily: 'var(--nx-font-sans)', fontSize: 17, lineHeight: 1.85, color: 'var(--nx-text-soft)', maxWidth: 600, margin: '0 auto' }}>
                    {description}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
          <NexusDivider />
        </>
      )}

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <>
          <Reveal from="right">
            <div className="section section-center section-soft">
              <div className="wrap-wide">
                <p className="eyebrow teal"><Icon name="calendar" />{t.theDetails}</p>
                <h2 className="section-title">{t.dateAndLocation}</h2>
                <div className="details-grid">
                  <div className="details-card">
                    <p className="label">{t.ceremony}</p>
                    {formattedTime && <p className="time">{formattedTime}</p>}
                    {eventDate && <p>{localizeDate(eventDate, t.dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                    {venueName && <p style={{ fontWeight: 600, color: '#fff' }}>{venueName}</p>}
                    {streetAddress && <p>{streetAddress}</p>}
                    {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                    {showVirtual && (
                      <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nx-teal)', textDecoration: 'none', fontWeight: 700 }}>{t.joinOnline}</a></p>
                    )}
                  </div>
                  {mapSrc ? (
                    <div className="map-frame">
                      <iframe title="Venue map" src={mapSrc} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                  ) : (
                    <div className="details-card">
                      <p className="label">{t.venue}</p>
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
          <NexusDivider />
        </>
      )}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <>
          <Reveal>
            <div className="section section-center">
              <div className="wrap">
                <p className="eyebrow"><Icon name="list" />{t.theSchedule}</p>
                <h2 className="section-title">{t.eventProgram}</h2>
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
          <NexusDivider />
        </>
      )}

      {/* RSVP */}
      {showRsvp !== false && (
        <>
          <Reveal>
            <div id="rsvp" className="section section-center section-soft">
              <div className="wrap">
                <p className="eyebrow teal"><Icon name="users" />{t.kindlyRespond}</p>
                <h2 className="section-title">{t.rsvp}</h2>
                <div className="rsvp-card">
                  <RsvpForm userPageId={userPageId} translations={t} disabled={isPreview} />
                </div>
              </div>
            </div>
          </Reveal>
          <NexusDivider />
        </>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <p className="eyebrow"><Icon name="image" />{t.gallery}</p>
            <h2 className="section-title">{t.memoriesSoFar}</h2>
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* RESOURCES (registry section, reframed) */}
      {(registryImage || registryDescription) && (
        <>
          <NexusDivider />
          <Reveal>
            <div
              className="registry-wrap"
              style={registryImage ? { backgroundImage: `url(${registryImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              <div className="registry-overlay">
                <p className="registry-title"><Icon name="external" size={14} />{' '}{t.registry}</p>
                {registryDescription && <p className="registry-description">{registryDescription}</p>}
                {registryButtonLink && (
                  <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                    {registryButtonText || t.viewRegistry}
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <>
          <NexusDivider />
          <Reveal>
            <div id="photos" className="section section-center">
              <div className="wrap">
                <p className="eyebrow"><Icon name="camera" />{t.guestPhotos}</p>
                <h2 className="section-title">{t.shareYourPhoto}</h2>
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
        </>
      )}

      {/* MUSIC REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <>
          <NexusDivider />
          <Reveal>
            <div className="section section-center section-soft song-section">
              <div className="wrap">
                <p className="eyebrow teal"><Icon name="music" />{t.buildOurPlaylist}</p>
                <h2 className="section-title">{t.songRequests}</h2>
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
        </>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p className="eyebrow" style={{ justifyContent: 'center' }}><Icon name="mail" />{t.questions}</p>
        <h2 className="section-title" style={{ marginBottom: 14 }}>{t.getInTouch}</h2>
        {editSlots?.footerContact ?? (
          <>
            {heading && <p>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--nx-text-soft)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--nx-text-soft)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <hr className="footer-rule" />
        <p className="footer-signoff">{t.withLove} {heading || t.theCouple}</p>
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
