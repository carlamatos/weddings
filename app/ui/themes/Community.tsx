import type { ThemeProps, ThemePreviewProps } from './types';
import type { Translations } from '@/app/lib/translations';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import { Reveal } from './Reveal';
import { PreviewTopBar } from './PreviewTopBar';
import { Countdown } from './Countdown';
import { GradientHeroPlaceholder } from './GradientHeroPlaceholder';
import { HERO_DEFAULTS } from './hero-defaults';
import { getTranslations, pickByLanguage } from '@/app/lib/translations';
import { eventWhen, formatDateRange } from './event-when';
import ShareSection from './ShareSection';
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

// Exclusive to Community — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'cm-default-1', user_page_id: 0, image_path: '/images/themes/community/celebration-1.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'cm-default-2', user_page_id: 0, image_path: '/images/themes/community/celebration-2.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'cm-default-5', user_page_id: 0, image_path: '/images/themes/community/celebration-5.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'cm-default-6', user_page_id: 0, image_path: '/images/themes/community/celebration-6.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'cm-default-7', user_page_id: 0, image_path: '/images/themes/community/celebration-7.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'cm-default-8', user_page_id: 0, image_path: '/images/themes/community/celebration-8.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'cm-default-9', user_page_id: 0, image_path: '/images/themes/community/celebration-9.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'cm-default-10', user_page_id: 0, image_path: '/images/themes/community/celebration-10.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
];

const PALETTE: [string, string, string] = ['#F6E0BD', '#B33314', '#1A5B91'];

// The garland of pennants used between sections — six community colors
// strung along a soft hand-drawn sag, like real street-fair bunting.
const BUNTING_COLORS = ['#B33314', '#EDB044', '#405518', '#29534A', '#1A5B91', '#7F5D27'];

function bezierY(t: number, y0: number, y1: number, y2: number) {
  return (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
}

function CommunityBunting({ stringColor = '#0C2F46' }: { stringColor?: string }) {
  const count = 16;
  const flags = Array.from({ length: count }, (_, i) => BUNTING_COLORS[i % BUNTING_COLORS.length]);
  return (
    <div className="cm-bunting" aria-hidden="true">
      <svg viewBox="0 0 1400 60" preserveAspectRatio="none" className="cm-bunting-svg">
        <path d="M0 6 Q 700 54 1400 6" stroke={stringColor} strokeWidth="1.5" fill="none" opacity="0.3" />
        {flags.map((color, i) => {
          const x = (1400 / (count - 1)) * i;
          const t = x / 1400;
          const y = bezierY(t, 6, 54, 6);
          return <polygon key={i} points={`${x - 8},${y} ${x + 8},${y} ${x},${y + 22}`} fill={color} />;
        })}
      </svg>
    </div>
  );
}

// A simple two-circle "coming together" mark for the hero.
function CommunityMark() {
  return (
    <svg width="40" height="32" viewBox="0 0 40 32" fill="none" aria-hidden="true" style={{ margin: '0 auto 16px', display: 'block' }}>
      <circle cx="15" cy="16" r="9" stroke="#EDB044" strokeWidth="1.4" />
      <circle cx="25" cy="16" r="9" stroke="#EDB044" strokeWidth="1.4" opacity="0.6" />
    </svg>
  );
}

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#F6E0BD', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', textAlign: 'left' }}>
      {bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <GradientHeroPlaceholder colors={PALETTE} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,47,70,0.75) 0%, rgba(12,47,70,0.05) 60%)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 22px 20px' }}>
        <p style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: '#EDB044', fontWeight: 600, margin: '0 0 8px' }}>You&apos;re part of it</p>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px' }}>{heading || 'Community Day'}</h2>
        {date && <p style={{ fontFamily: "'Work Sans', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --cm-cream: #F6E0BD;
    --cm-cream-deep: #F0D2A0;
    --cm-navy: #0C2F46;
    --cm-navy-soft: rgba(12,47,70,0.68);
    --cm-red: #B33314;
    --cm-gold: #EDB044;
    --cm-olive: #405518;
    --cm-teal: #29534A;
    --cm-blue: #1A5B91;
    --cm-brown: #7F5D27;
    --cm-line: rgba(12,47,70,0.15);
    --cm-font-display: 'Fraunces', Georgia, serif;
    --cm-font-sans: 'Work Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .cm * { box-sizing: border-box; }
  .cm { margin: 0; background: var(--cm-cream); color: var(--cm-navy); font-family: var(--cm-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .cm img { max-width: 100%; }

  .cm .cm-bunting { width: 100%; line-height: 0; }
  .cm .cm-bunting-svg { display: block; width: 100%; height: 32px; }

  .cm .eyebrow { font-family: var(--cm-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--cm-red); font-weight: 600; margin: 0 0 12px; }
  .cm .eyebrow.on-dark { color: var(--cm-gold); }
  .cm .section-title { font-family: var(--cm-font-display); font-size: clamp(30px, 4vw, 44px); font-weight: 600; color: var(--cm-navy); margin: 0 0 20px; line-height: 1.2; }
  .cm .section-title.on-dark { color: #FFFFFF; }

  .cm .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .cm .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .cm .section { padding: 88px 28px; background: var(--cm-cream); }
  .cm .section-alt { background: var(--cm-cream-deep); }
  .cm .section-center { text-align: center; }
  @media (max-width: 640px) { .cm .section { padding: 60px 20px; } }

  .cm .btn { font-family: var(--cm-font-sans); font-size: 13px; font-weight: 600; letter-spacing: 0.6px; padding: 13px 30px; border-radius: 999px; border: none; background: var(--cm-red); color: #FFFFFF; cursor: pointer; transition: background 0.15s ease, transform 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .cm .btn:hover { background: #94290F; transform: translateY(-1px); }
  .cm .btn-outline { background: transparent; color: var(--cm-navy); border: 1.5px solid var(--cm-navy); }
  .cm .btn-outline:hover { background: rgba(12,47,70,0.08); }
  .cm .btn-outline.on-dark { color: #FFFFFF; border-color: rgba(255,255,255,0.6); }
  .cm .btn-outline.on-dark:hover { background: rgba(255,255,255,0.12); }

  .cm input, .cm textarea, .cm select { font-family: var(--cm-font-sans); font-size: 15px; padding: 11px 14px; border-radius: 10px; border: 1.5px solid rgba(12,47,70,0.18); outline: none; background: #FFFFFF; color: var(--cm-navy); width: 100%; display: block; transition: border-color 0.2s ease; }
  .cm input:focus, .cm textarea:focus, .cm select:focus { border-color: var(--cm-blue); }
  .cm label.field-label { font-family: var(--cm-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--cm-red); display: block; margin-bottom: 5px; font-weight: 600; }
  .cm .radio-label, .cm .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--cm-navy); cursor: pointer; }
  .cm .radio-label input, .cm .check-label input { width: auto; border: none; padding: 0; accent-color: var(--cm-red); }
  .cm .check-hint { font-family: var(--cm-font-sans); font-size: 12px; color: var(--cm-navy-soft); margin: 4px 0 0; }
  .cm .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .cm .rsvp-error { color: #B33314; font-size: 13px; margin: 0; font-family: var(--cm-font-sans); }
  .cm .rsvp-success { text-align: center; padding: 16px 0; }
  .cm .rsvp-headline { font-family: var(--cm-font-display); font-size: 30px; color: var(--cm-red); margin: 0 0 10px; font-weight: 600; }
  .cm .rsvp-sub { font-size: 14px; color: var(--cm-navy-soft); margin: 0; }
  .cm .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  .cm .hero { position: relative; min-height: 92vh; display: flex; align-items: flex-end; text-align: left; padding: 72px 48px 84px; background: var(--cm-navy); overflow: hidden; }
  .cm .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .cm .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(12,47,70,0.88) 0%, rgba(12,47,70,0.15) 55%, rgba(12,47,70,0.05) 100%); z-index: 0; }
  .cm .hero-bunting-top { position: absolute; top: 0; left: 0; right: 0; z-index: 1; }
  .cm .hero-content { position: relative; z-index: 1; max-width: 620px; }
  @keyframes cm-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .cm .hero-eyebrow { animation: cm-rise 0.9s ease both; color: #FFFFFF; }
  .cm .hero-name { animation: cm-rise 0.9s ease 0.15s both; font-family: var(--cm-font-display); font-size: clamp(42px, 7vw, 76px); font-weight: 600; color: #FFFFFF; margin: 0 0 22px; line-height: 1.05; text-shadow: 0 2px 24px rgba(0,0,0,0.3); }
  .cm .hero-date { animation: cm-rise 0.9s ease 0.3s both; font-family: var(--cm-font-sans); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.85); margin: 0 0 28px; }
  .cm .hero-actions { animation: cm-rise 0.9s ease 0.45s both; display: flex; gap: 14px; flex-wrap: wrap; }

  .cm .countdown-wrap { padding: 68px 24px; background: var(--cm-navy); text-align: center; }
  .cm .countdown-heading { font-family: var(--cm-font-display); font-size: 38px; color: #fff; margin: 0 0 32px; font-weight: 600; }
  .cm .countdown-row { display: flex; justify-content: center; gap: clamp(18px, 5vw, 48px); }
  .cm .countdown-block { text-align: center; min-width: 56px; }
  .cm .countdown-value { font-family: var(--cm-font-display); font-size: clamp(32px, 5vw, 58px); color: var(--cm-gold); font-weight: 600; line-height: 1; }
  .cm .countdown-label { font-family: var(--cm-font-sans); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-top: 8px; }

  .cm .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 12px; }
  @media (max-width: 640px) { .cm .details-grid { grid-template-columns: 1fr; } }
  .cm .details-card { background: #FFFFFF; border-radius: 16px; padding: 28px 26px; box-shadow: 0 8px 24px rgba(12,47,70,0.08); }
  .cm .details-card .label { font-family: var(--cm-font-sans); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--cm-blue); font-weight: 700; margin: 0 0 10px; }
  .cm .details-card .time { font-family: var(--cm-font-display); font-size: 30px; line-height: 1.2; color: var(--cm-navy); }
  .cm .details-card p { font-size: 14px; color: var(--cm-navy-soft); margin: 0 0 3px; }
  .cm .map-frame { border-radius: 16px; overflow: hidden; min-height: 220px; box-shadow: 0 8px 24px rgba(12,47,70,0.08); }
  .cm .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .cm .directions-link { text-align: center; margin-top: 18px; }
  .cm .directions-link a { font-family: var(--cm-font-sans); font-size: 13px; color: var(--cm-blue); font-weight: 700; text-decoration: none; }

  .cm .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .cm .schedule-day:last-child { margin-bottom: 0; }
  .cm .schedule-day-title { font-family: var(--cm-font-sans); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--cm-olive); font-weight: 700; margin: 0 0 18px; }
  .cm .schedule-list { border-top: 1.5px solid var(--cm-line); text-align: left; }
  .cm .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--cm-line); align-items: baseline; }
  .cm .schedule-time { font-family: var(--cm-font-display); font-size: 19px; color: var(--cm-red); min-width: 110px; flex-shrink: 0; font-weight: 600; }
  .cm .schedule-info .name { font-family: var(--cm-font-sans); font-size: 15px; color: var(--cm-navy); font-weight: 600; margin: 0 0 3px; }
  .cm .schedule-info .loc { font-family: var(--cm-font-sans); font-size: 13px; color: var(--cm-navy-soft); margin: 0; }

  .cm .rsvp-section { background: var(--cm-teal); padding: 88px 28px; text-align: center; }
  .cm .rsvp-card { max-width: 460px; margin: 0 auto; background: #FFFFFF; border-radius: 18px; padding: 34px 30px; text-align: left; box-shadow: 0 12px 40px rgba(12,47,70,0.25); }

  .cm .gallery-tile { overflow: hidden; border-radius: 14px; }

  .cm .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .cm .registry-overlay { background: rgba(12,47,70,0.68); padding: 48px 60px; text-align: center; border-radius: 16px; }
  .cm .registry-title { font-family: var(--cm-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--cm-gold); margin: 0 0 14px; font-weight: 700; }
  .cm .registry-description { font-size: 15px; color: rgba(255,255,255,0.9); margin: 0 0 24px; line-height: 1.6; max-width: 390px; }
  .cm .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; border: 1.5px solid var(--cm-gold); color: var(--cm-gold); text-decoration: none; font-family: var(--cm-font-sans); font-size: 13px; font-weight: 600; transition: background 0.2s ease; }
  .cm .registry-button:hover { background: rgba(237,176,68,0.15); }

  .cm .song-section { background: var(--cm-cream-deep); padding: 88px 28px; text-align: center; }
  .cm .song-section .song-list { border-top: 1.5px solid var(--cm-line); max-width: 540px; margin: 0 auto; }
  .cm .song-section .song-row { border-bottom: 1px solid var(--cm-line); padding: 10px 0; }
  .cm .song-section .song-row .title { color: var(--cm-navy); }
  .cm .song-section .song-row .artist { color: var(--cm-navy-soft); }

  .cm .footer { padding: 20px 24px 68px; background: var(--cm-navy); text-align: center; }
  .cm .footer p { font-size: 14px; color: rgba(255,255,255,0.85); margin: 0 0 4px; }
  .cm .footer-inner { padding-top: 64px; }
  .cm .footer-signoff { font-family: var(--cm-font-display); font-size: 38px !important; font-weight: 600; color: #FFFFFF; margin: 22px 0 0; }
  .cm .footer-credit { font-family: var(--cm-font-sans); font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 24px; letter-spacing: 0.5px; }
  /* share / hashtag band (ShareSection) */
  .cm .share-band { padding: 84px 24px; background: var(--cm-teal); text-align: center; }
  .cm .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .cm .share-hashtag { font-family: var(--cm-font-display); font-size: clamp(28px, 4vw, 38px); color: var(--cm-cream); margin: 0 0 28px; font-weight: 600; overflow-wrap: anywhere; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'The Gathering',
    ourStoryLabel: 'About',
    howWeGotHere: 'Why we come together',
    theDetails: 'The details',
    dateAndLocation: 'Date & location',
    theSchedule: "What's happening",
    eventProgram: 'Program',
    kindlyRespond: "Let us know you're coming",
    memoriesSoFar: 'Together so far',
    ourMoments: 'Community moments',
    registry: 'Ways to help',
    viewRegistry: 'Get involved',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'Until we gather',
    noteForCouple: 'A note for the organizers',
    noteForCouplePlaceholder: 'Questions, ideas, anything we should know…',
    buildOurPlaylist: 'Set the mood',
    withLove: 'See you there,',
    theCouple: 'the organizers',
  },
  fr: {
    ourStoryBtn: 'Le rassemblement',
    ourStoryLabel: 'À propos',
    howWeGotHere: 'Pourquoi nous nous réunissons',
    theDetails: 'Les détails',
    dateAndLocation: 'Date et lieu',
    theSchedule: 'Au programme',
    eventProgram: 'Programme',
    kindlyRespond: 'Confirmez votre présence',
    memoriesSoFar: 'Déjà de beaux moments',
    ourMoments: 'Moments communautaires',
    registry: 'Comment aider',
    viewRegistry: "S'impliquer",
    countingDown: "Compte à rebours jusqu'à",
    untilWeSayIDo: 'Avant le rassemblement',
    noteForCouple: 'Un mot pour les organisateurs',
    noteForCouplePlaceholder: 'Questions, idées, autre chose à savoir…',
    buildOurPlaylist: "Composez l'ambiance",
    withLove: 'À bientôt,',
    theCouple: 'les organisateurs',
  },
  es: {
    ourStoryBtn: 'La reunión',
    ourStoryLabel: 'Sobre',
    howWeGotHere: 'Por qué nos reunimos',
    theDetails: 'Los detalles',
    dateAndLocation: 'Fecha y lugar',
    theSchedule: 'Qué está pasando',
    eventProgram: 'Programa',
    kindlyRespond: 'Confirma tu asistencia',
    memoriesSoFar: 'Momentos hasta ahora',
    ourMoments: 'Momentos comunitarios',
    registry: 'Cómo ayudar',
    viewRegistry: 'Participar',
    countingDown: 'Cuenta regresiva hasta',
    untilWeSayIDo: 'Hasta que nos reunamos',
    noteForCouple: 'Una nota para los organizadores',
    noteForCouplePlaceholder: 'Preguntas, ideas, algo más que debamos saber…',
    buildOurPlaylist: 'Elige el ambiente',
    withLove: 'Nos vemos allí,',
    theCouple: 'los organizadores',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're part of it", fr: 'Vous en faites partie', es: 'Eres parte de esto' };

export default function Community({
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
  isLoggedIn,
}: ThemeProps) {
  const base = getTranslations(language);
  const t: Translations = { ...base, ...pickByLanguage(OVERRIDES, language) };
  const isPreview = !!editSlots;
  const heroDateText = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';

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
    <div className="cm">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600;700&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(bannerImage || HERO_DEFAULTS.community) ? (
            <video className="hero-bg" src={bannerImage || HERO_DEFAULTS.community} autoPlay muted loop playsInline style={{ objectFit: heroObjectFit }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage || HERO_DEFAULTS.community} alt="" style={{ objectFit: heroObjectFit }} />
          )
        )}
        <div className="hero-overlay" />
        <div className="hero-bunting-top"><CommunityBunting /></div>
        <div className="hero-content">
          <CommunityMark />
          {editSlots?.heroEyebrow ?? <p className="eyebrow hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line' }}>{heading}</h1>}
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date">{heroDateText}</p>)}
          <div className="hero-actions">
            <a href="#rsvp" className="btn">{t.rsvpBtn}</a>
            <a href="#story" className="btn btn-outline on-dark">{t.ourStoryBtn}</a>
            {isPaid && <a href="#photos" className="btn btn-outline on-dark">{t.shareYourPhoto}</a>}
          </div>
        </div>
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <Reveal>
          <div id="story" className="section section-center">
            <div className="wrap">
              <p className="eyebrow">{t.ourStoryLabel}</p>
              <h2 className="section-title">{t.howWeGotHere}</h2>
              {editSlots?.description ?? (
                <p style={{ fontFamily: 'var(--cm-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--cm-navy-soft)', maxWidth: 560, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      <CommunityBunting />

      {/* COUNTDOWN */}
      {eventDate && !editSlots && (
        <Countdown
          eventDate={eventDate}
          eventTime={eventTime}
          eyebrow={t.countingDown}
          heading={t.untilWeSayIDo}
          todayHeading={t.todayIsTheDay}
          unitLabels={{ days: t.days, hours: t.hours, mins: t.mins, secs: t.secs }}
        />
      )}

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <Reveal from="right">
          <div className="section section-alt section-center">
            <div className="wrap-wide">
              <p className="eyebrow">{t.theDetails}</p>
              <h2 className="section-title">{t.dateAndLocation}</h2>
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 600 }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cm-blue)', textDecoration: 'none', fontWeight: 700 }}>{t.joinOnline}</a></p>
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
              <p className="eyebrow">{t.theSchedule}</p>
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
      )}

      {/* RSVP */}
      {showRsvp !== false && (
        <Reveal>
          <div id="rsvp" className="rsvp-section">
            <p className="eyebrow on-dark">{t.kindlyRespond}</p>
            <h2 className="section-title on-dark">{t.rsvp}</h2>
            <div className="rsvp-card">
              <RsvpForm userPageId={userPageId} translations={t} disabled={isPreview} />
            </div>
          </div>
        </Reveal>
      )}

      <CommunityBunting />

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-alt section-center">
          <div className="wrap-wide">
            <p className="eyebrow">{t.memoriesSoFar}</p>
            <h2 className="section-title">{t.ourMoments}</h2>
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* WAYS TO HELP (registry section, reframed) */}
      {(registryImage || registryDescription) && (
        <Reveal>
          <div
            className="registry-wrap"
            style={{ backgroundImage: `url(${registryImage || '/images/themes/wedding/registry.png'})` }}
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
          <div id="photos" className="section section-center">
            <div className="wrap">
              <p className="eyebrow">{t.guestPhotos}</p>
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
      )}

      {/* SONG REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <Reveal>
          <div className="song-section">
            <div className="wrap">
              <p className="eyebrow">{t.buildOurPlaylist}</p>
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
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <CommunityBunting stringColor="#FFFFFF" />
        <div className="footer-inner">
          <p className="eyebrow on-dark" style={{ marginBottom: 14 }}>{t.questions}</p>
          <h2 className="section-title on-dark" style={{ marginBottom: 0 }}>{t.getInTouch}</h2>
          {editSlots?.footerContact ?? (
            <>
              {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
              {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>{userEmail}</a></p>}
              {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>{userPhone}</a></p>}
            </>
          )}
          <p className="footer-signoff">{t.withLove} {heading || t.theCouple}</p>
          <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
        </div>
      </footer>
    </div>
  );
}
