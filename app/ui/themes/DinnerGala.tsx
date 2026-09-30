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
import { getTranslations, localizeDate, pickByLanguage } from '@/app/lib/translations';
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

// Exclusive to Dinner Gala — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'dg-default-1', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-1.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'dg-default-2', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-2.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'dg-default-3', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-3.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'dg-default-4', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-4.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'dg-default-5', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-5.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'dg-default-6', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-6.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'dg-default-7', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-7.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'dg-default-8', user_page_id: 0, image_path: '/images/themes/dinner-gala/celebration-8.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
];

const GalaDivider = () => <div className="dg-divider" aria-hidden="true" />;

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#0a1420', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/images/themes/dinner-gala/gala-banner.svg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: 28, height: 1, background: '#d8b35a', margin: '0 auto 14px', opacity: 0.7 }} />
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#d8b35a', fontWeight: 500, margin: '0 0 12px' }}>You&apos;re cordially invited</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 5.5vw, 46px)', fontWeight: 600, color: '#F3ECDD', margin: '0 0 12px' }}>{heading || 'The Annual Gala'}</h2>
        {date && <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(243,236,221,0.65)', margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --dg-bg: #0a1420;
    --dg-bg-alt: #101f30;
    --dg-gold: #d8b35a;
    --dg-gold-soft: #c9a96e;
    --dg-cream: #F3ECDD;
    --dg-ink-soft: rgba(243,236,221,0.68);
    --dg-line: rgba(216,179,90,0.25);
    --dg-font-display: 'Cormorant Garamond', Georgia, serif;
    --dg-font-sans: 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .dg * { box-sizing: border-box; }
  .dg { margin: 0; background: var(--dg-bg); color: var(--dg-cream); font-family: var(--dg-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .dg img { max-width: 100%; }

  .dg .dg-divider { width: 100%; height: 1px; background: var(--dg-line); }
  .dg .dg-rule { width: 34px; height: 1px; background: var(--dg-gold); border: none; margin: 0 auto 22px; opacity: 0.75; }

  .dg .eyebrow { font-family: var(--dg-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--dg-gold); font-weight: 500; margin: 0 0 14px; }
  .dg .section-title { font-family: var(--dg-font-display); font-size: clamp(32px, 4vw, 46px); font-weight: 600; color: var(--dg-cream); margin: 0 0 20px; line-height: 1.2; letter-spacing: 0.3px; }

  .dg .wrap { max-width: 720px; margin: 0 auto; padding: 0 28px; }
  .dg .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .dg .section { padding: 96px 28px; background: var(--dg-bg); }
  .dg .section-alt { background: var(--dg-bg-alt); }
  .dg .section-center { text-align: center; }
  @media (max-width: 640px) { .dg .section { padding: 64px 20px; } }

  .dg .btn { font-family: var(--dg-font-sans); font-size: 12px; font-weight: 500; letter-spacing: 1.6px; text-transform: uppercase; padding: 13px 32px; border-radius: 0; border: 1px solid var(--dg-gold); background: transparent; color: var(--dg-gold); cursor: pointer; transition: background 0.2s ease, color 0.2s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .dg .btn:hover { background: var(--dg-gold); color: var(--dg-bg); }
  .dg .btn-outline { border-color: rgba(243,236,221,0.4); color: var(--dg-cream); }
  .dg .btn-outline:hover { background: var(--dg-cream); color: var(--dg-bg); border-color: var(--dg-cream); }

  .dg input, .dg textarea, .dg select { font-family: var(--dg-font-sans); font-size: 15px; padding: 10px 2px; border-radius: 0; border: none; border-bottom: 1px solid rgba(216,179,90,0.3); outline: none; background: transparent; color: var(--dg-cream); width: 100%; display: block; transition: border-color 0.2s ease; }
  .dg input::placeholder, .dg textarea::placeholder { color: rgba(243,236,221,0.4); }
  .dg input:focus, .dg textarea:focus, .dg select:focus { border-bottom-color: var(--dg-gold); }
  .dg label.field-label { font-family: var(--dg-font-sans); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--dg-gold); display: block; margin-bottom: 6px; font-weight: 500; }
  .dg .radio-label, .dg .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--dg-cream); cursor: pointer; }
  .dg .radio-label input, .dg .check-label input { width: auto; border: none; border-bottom: none; padding: 0; accent-color: var(--dg-gold); }
  .dg .check-hint { font-family: var(--dg-font-sans); font-size: 12px; color: var(--dg-ink-soft); margin: 4px 0 0; }
  .dg .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .dg .rsvp-error { color: #E2A15A; font-size: 13px; margin: 0; font-family: var(--dg-font-sans); }
  .dg .rsvp-success { text-align: center; padding: 16px 0; }
  .dg .rsvp-headline { font-family: var(--dg-font-display); font-size: 32px; color: var(--dg-gold); margin: 0 0 10px; font-weight: 600; }
  .dg .rsvp-sub { font-size: 14px; color: var(--dg-ink-soft); margin: 0; }
  .dg .rsvp-form { display: flex; flex-direction: column; gap: 20px; }

  .dg .hero { position: relative; min-height: 96vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 72px 32px 96px; background: var(--dg-bg); overflow: hidden; }
  .dg .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .dg .hero-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(10,20,32,0.25) 0%, rgba(10,20,32,0.65) 100%); z-index: 0; }
  .dg .hero-content { position: relative; z-index: 1; max-width: 620px; margin: 0 auto; }
  @keyframes dg-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .dg .hero-eyebrow { animation: dg-rise 1s ease both; }
  .dg .hero-name { animation: dg-rise 1s ease 0.2s both; font-family: var(--dg-font-display); font-size: clamp(46px, 7.6vw, 84px); font-weight: 600; color: var(--dg-cream); margin: 0 0 24px; line-height: 1.05; text-shadow: 0 2px 30px rgba(0,0,0,0.5); }
  .dg .hero-date { animation: dg-rise 1s ease 0.4s both; font-family: var(--dg-font-sans); font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(243,236,221,0.75); margin: 0 0 32px; }
  .dg .hero-actions { animation: dg-rise 1s ease 0.55s both; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

  .dg .countdown-wrap { padding: 72px 24px; background: var(--dg-bg-alt); text-align: center; border-top: 1px solid var(--dg-line); border-bottom: 1px solid var(--dg-line); }
  .dg .countdown-heading { font-family: var(--dg-font-display); font-size: 34px; color: var(--dg-cream); margin: 0 0 34px; font-weight: 600; }
  .dg .countdown-row { display: flex; justify-content: center; gap: clamp(24px, 6vw, 56px); }
  .dg .countdown-block { text-align: center; min-width: 56px; }
  .dg .countdown-value { font-family: var(--dg-font-display); font-size: clamp(32px, 5vw, 56px); color: var(--dg-gold); font-weight: 600; line-height: 1; }
  .dg .countdown-label { font-family: var(--dg-font-sans); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(243,236,221,0.55); margin-top: 10px; }

  .dg .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; margin-top: 8px; background: var(--dg-line); }
  @media (max-width: 640px) { .dg .details-grid { grid-template-columns: 1fr; } }
  .dg .details-card { background: var(--dg-bg-alt); padding: 34px 30px; }
  .dg .section-alt .details-card { background: var(--dg-bg); }
  .dg .details-card .label { font-family: var(--dg-font-sans); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--dg-gold); font-weight: 500; margin: 0 0 12px; }
  .dg .details-card .time { font-family: var(--dg-font-display); font-size: 28px; line-height: 1.2; color: var(--dg-cream); }
  .dg .details-card p { font-size: 14px; color: var(--dg-ink-soft); margin: 0 0 4px; }
  .dg .map-frame { overflow: hidden; min-height: 220px; filter: grayscale(0.3) contrast(1.05) brightness(0.9); }
  .dg .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .dg .directions-link { text-align: center; margin-top: 22px; }
  .dg .directions-link a { font-family: var(--dg-font-sans); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--dg-gold); font-weight: 500; text-decoration: none; }

  .dg .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .dg .schedule-day:last-child { margin-bottom: 0; }
  .dg .schedule-day-title { font-family: var(--dg-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--dg-gold); font-weight: 500; margin: 0 0 18px; }
  .dg .schedule-list { border-top: 1px solid var(--dg-line); text-align: left; }
  .dg .schedule-row { display: flex; gap: 20px; padding: 18px 0; border-bottom: 1px solid var(--dg-line); align-items: baseline; }
  .dg .schedule-time { font-family: var(--dg-font-display); font-size: 20px; color: var(--dg-gold); min-width: 110px; flex-shrink: 0; font-weight: 600; }
  .dg .schedule-info .name { font-family: var(--dg-font-sans); font-size: 15px; color: var(--dg-cream); font-weight: 500; margin: 0 0 3px; }
  .dg .schedule-info .loc { font-family: var(--dg-font-sans); font-size: 13px; color: var(--dg-ink-soft); margin: 0; }

  .dg .rsvp-section { position: relative; background-image: url('/images/themes/dinner-gala/rsvp-frame.jpeg'); background-size: cover; background-position: center; padding: 100px 28px; text-align: center; }
  .dg .rsvp-section::before { content: ''; position: absolute; inset: 0; background: rgba(10,20,32,0.82); }
  .dg .rsvp-section > * { position: relative; z-index: 1; }
  .dg .rsvp-card { max-width: 460px; margin: 0 auto; background: var(--dg-bg-alt); border: 1px solid var(--dg-line); padding: 40px 34px; text-align: left; box-shadow: 0 20px 60px rgba(0,0,0,0.45); }

  .dg .gallery-tile { overflow: hidden; border: 1px solid var(--dg-line); }

  .dg .registry-wrap { position: relative; width: 100%; min-height: 300px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .dg .registry-overlay { background: rgba(10,20,32,0.7); border: 1px solid var(--dg-line); padding: 50px 60px; text-align: center; }
  .dg .registry-title { font-family: var(--dg-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--dg-gold); margin: 0 0 14px; font-weight: 500; }
  .dg .registry-description { font-size: 15px; color: rgba(243,236,221,0.85); margin: 0 0 26px; line-height: 1.7; max-width: 390px; }
  .dg .registry-button { display: inline-block; padding: 13px 30px; border: 1px solid var(--dg-gold); color: var(--dg-gold); text-decoration: none; font-family: var(--dg-font-sans); font-size: 12px; font-weight: 500; letter-spacing: 1.6px; text-transform: uppercase; transition: background 0.2s ease, color 0.2s ease; }
  .dg .registry-button:hover { background: var(--dg-gold); color: var(--dg-bg); }

  .dg .song-section { padding: 96px 28px; text-align: center; }
  .dg .song-section .song-list { border-top: 1px solid var(--dg-line); max-width: 540px; margin: 0 auto; }
  .dg .song-section .song-row { border-bottom: 1px solid var(--dg-line); padding: 12px 0; }
  .dg .song-section .song-row .title { color: var(--dg-cream); }
  .dg .song-section .song-row .artist { color: var(--dg-ink-soft); }

  .dg .footer { padding: 90px 24px 70px; background: var(--dg-bg); text-align: center; border-top: 1px solid var(--dg-line); }
  .dg .footer p { font-size: 14px; color: rgba(243,236,221,0.75); margin: 0 0 4px; }
  .dg .footer-signoff { font-family: var(--dg-font-display); font-size: 36px !important; font-weight: 600; color: var(--dg-cream); margin: 26px 0 0; }
  .dg .footer-credit { font-family: var(--dg-font-sans); font-size: 11px; color: rgba(243,236,221,0.4); margin-top: 26px; letter-spacing: 0.5px; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US'): string {
  const formatted = localizeDate(dateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryBtn: 'The Evening',
    ourStoryLabel: 'About',
    howWeGotHere: 'A night to remember',
    theDetails: 'The details',
    dateAndLocation: 'Date & venue',
    theSchedule: 'Order of the evening',
    eventProgram: 'Program',
    kindlyRespond: 'Kindly RSVP',
    memoriesSoFar: 'A glimpse inside',
    ourMoments: 'The gallery',
    registry: 'Partners & Sponsors',
    viewRegistry: 'Learn more',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'Until the evening begins',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, questions, anything else we should know…',
    songRequests: 'Music Requests',
    buildOurPlaylist: 'Set the soundtrack',
    withLove: 'With gratitude,',
    theCouple: 'the hosts',
  },
  fr: {
    ourStoryBtn: 'La soirée',
    ourStoryLabel: 'À propos',
    howWeGotHere: 'Une soirée mémorable',
    theDetails: 'Les détails',
    dateAndLocation: 'Date et lieu',
    theSchedule: 'Déroulement de la soirée',
    eventProgram: 'Programme',
    kindlyRespond: 'Merci de confirmer',
    memoriesSoFar: 'Un aperçu',
    ourMoments: 'La galerie',
    registry: 'Partenaires et sponsors',
    viewRegistry: 'En savoir plus',
    countingDown: "Compte à rebours jusqu'à",
    untilWeSayIDo: 'Avant le début de la soirée',
    noteForCouple: 'Un mot pour les hôtes',
    noteForCouplePlaceholder: 'Besoins alimentaires, questions, autre chose à savoir…',
    songRequests: 'Demandes musicales',
    buildOurPlaylist: "Composez l'ambiance",
    withLove: 'Avec gratitude,',
    theCouple: 'les hôtes',
  },
  es: {
    ourStoryBtn: 'La velada',
    ourStoryLabel: 'Sobre',
    howWeGotHere: 'Una noche para recordar',
    theDetails: 'Los detalles',
    dateAndLocation: 'Fecha y lugar',
    theSchedule: 'Orden de la velada',
    eventProgram: 'Programa',
    kindlyRespond: 'Confirma tu asistencia',
    memoriesSoFar: 'Un vistazo',
    ourMoments: 'La galería',
    registry: 'Socios y patrocinadores',
    viewRegistry: 'Más información',
    countingDown: 'Cuenta regresiva hasta',
    untilWeSayIDo: 'Hasta que comience la velada',
    noteForCouple: 'Una nota para los anfitriones',
    noteForCouplePlaceholder: 'Necesidades alimentarias, preguntas, algo más que debamos saber…',
    songRequests: 'Solicitudes de música',
    buildOurPlaylist: 'Elige el ambiente',
    withLove: 'Con gratitud,',
    theCouple: 'los anfitriones',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're cordially invited", fr: 'Vous êtes cordialement invités', es: 'Estás cordialmente invitado' };

export default function DinnerGala({
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
    <div className="dg">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@400;500;600&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(bannerImage || HERO_DEFAULTS['dinner-gala']) ? (
            <video className="hero-bg" src={bannerImage || HERO_DEFAULTS['dinner-gala']} autoPlay muted loop playsInline style={{ objectFit: heroObjectFit }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage || HERO_DEFAULTS['dinner-gala']} alt="" style={{ objectFit: heroObjectFit }} />
          )
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="dg-rule" />
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
        <Reveal>
          <div id="story" className="section section-center">
            <div className="wrap">
              <p className="eyebrow">{t.ourStoryLabel}</p>
              <h2 className="section-title">{t.howWeGotHere}</h2>
              <hr className="dg-rule" />
              {editSlots?.description ?? (
                <p style={{ fontFamily: 'var(--dg-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--dg-ink-soft)', maxWidth: 560, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      <GalaDivider />

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
              <hr className="dg-rule" />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{localizeDate(eventDate, t.dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  {venueName && <p style={{ fontWeight: 600 }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dg-gold)', textDecoration: 'none', fontWeight: 500 }}>{t.joinOnline}</a></p>
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

      <GalaDivider />

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap">
              <p className="eyebrow">{t.theSchedule}</p>
              <h2 className="section-title">{t.eventProgram}</h2>
              <hr className="dg-rule" />
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
            <p className="eyebrow">{t.kindlyRespond}</p>
            <h2 className="section-title">{t.rsvp}</h2>
            <hr className="dg-rule" />
            <div className="rsvp-card">
              <RsvpForm userPageId={userPageId} translations={t} disabled={isPreview} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-alt section-center">
          <div className="wrap-wide">
            <p className="eyebrow">{t.memoriesSoFar}</p>
            <h2 className="section-title">{t.ourMoments}</h2>
            <hr className="dg-rule" />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* PARTNERS & SPONSORS (registry section, reframed) */}
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
              <hr className="dg-rule" />
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

      {/* MUSIC REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <Reveal>
          <div className="song-section section-alt">
            <div className="wrap">
              <p className="eyebrow">{t.buildOurPlaylist}</p>
              <h2 className="section-title">{t.songRequests}</h2>
              <hr className="dg-rule" />
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

      {/* FOOTER */}
      <footer className="footer">
        <p className="eyebrow" style={{ marginBottom: 14 }}>{t.questions}</p>
        <h2 className="section-title" style={{ marginBottom: 0 }}>{t.getInTouch}</h2>
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'rgba(243,236,221,0.75)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'rgba(243,236,221,0.75)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <p className="footer-signoff">{t.withLove} {heading || t.theCouple}</p>
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
