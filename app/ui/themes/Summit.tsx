import type { ThemeProps, ThemePreviewProps } from './types';
import type { Translations } from '@/app/lib/translations';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import { Reveal } from './Reveal';
import { PreviewTopBar } from './PreviewTopBar';
import { HERO_DEFAULTS } from './hero-defaults';
import { getTranslations, pickByLanguage } from '@/app/lib/translations';
import { eventWhen, formatDateRange } from './event-when';
import ShareSection from './ShareSection';
import { SectionText } from './section-text';
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

// Exclusive to Summit — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'sm-default-1', user_page_id: 0, image_path: '/images/themes/summit/celebration-1.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  // celebration-2.jpeg intentionally excluded from the gallery (per request).
  { id: 'sm-default-3', user_page_id: 0, image_path: '/images/themes/summit/celebration-3.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'sm-default-4', user_page_id: 0, image_path: '/images/themes/summit/celebration-4.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'sm-default-5', user_page_id: 0, image_path: '/images/themes/summit/celebration-5.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'sm-default-6', user_page_id: 0, image_path: '/images/themes/summit/celebration-6.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'sm-default-7', user_page_id: 0, image_path: '/images/themes/summit/celebration-7.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'sm-default-8', user_page_id: 0, image_path: '/images/themes/summit/celebration-8.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'sm-default-9', user_page_id: 0, image_path: '/images/themes/summit/celebration-9.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
];

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#14171C', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS.summit} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,23,28,0.35), rgba(20,23,28,0.75))' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#C9A24B', fontWeight: 700, margin: '0 0 12px' }}>You&apos;re invited</p>
        <h2 style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px', letterSpacing: -0.5 }}>{heading || 'Your Event Name'}</h2>
        <div style={{ width: 30, height: 2, background: '#2F5DFF', margin: '0 auto 12px' }} />
        {date && <p style={{ fontSize: 12, letterSpacing: 1, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --sm-ink: #14171C;
    --sm-ink-soft: #5B6270;
    --sm-paper: #F7F8FA;
    --sm-line: #E4E7EC;
    --sm-accent: #2F5DFF;
    --sm-accent-deep: #1B3FCC;
    --sm-gold: #C9A24B;
    --sm-font-display: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --sm-font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .sm * { box-sizing: border-box; }
  .sm { margin: 0; background: #fff; color: var(--sm-ink); font-family: var(--sm-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .sm img { max-width: 100%; }

  .sm .divider { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 28px 0; }
  .sm .divider .line { width: 64px; height: 1px; background: var(--sm-line); }
  .sm .divider .dot { width: 6px; height: 6px; background: var(--sm-accent); }

  .sm .eyebrow { font-family: var(--sm-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--sm-accent-deep); font-weight: 700; margin: 0 0 14px; }
  .sm .eyebrow.on-dark { color: var(--sm-gold); }
  .sm .section-title { font-family: var(--sm-font-display); font-size: clamp(28px, 4vw, 42px); font-weight: 700; color: var(--sm-ink); margin: 0 0 24px; letter-spacing: -0.5px; line-height: 1.1; }
  .sm .section-title.on-dark { color: #FFFFFF; }

  .sm .wrap { max-width: 780px; margin: 0 auto; padding: 0 28px; }
  .sm .wrap-wide { max-width: 1040px; margin: 0 auto; padding: 0 28px; }
  .sm .section { padding: 90px 28px; }
  .sm .section-center { text-align: center; }
  .sm .section-tinted { background: var(--sm-paper); }
  .sm .story-section { position: relative; background-size: cover; background-position: center; overflow: hidden; }
  @media (max-width: 640px) { .sm .section { padding: 64px 20px; } }

  .sm .btn { font-family: var(--sm-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 0.5px; padding: 14px 30px; border-radius: 4px; border: 1.5px solid var(--sm-accent); background: var(--sm-accent); color: #fff; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .sm .btn:hover { background: var(--sm-accent-deep); transform: translateY(-1px); }
  .sm .btn-outline { background: transparent; color: var(--sm-ink); border-color: var(--sm-line); }
  .sm .btn-outline:hover { background: var(--sm-paper); }
  .sm .btn-outline.on-dark { color: #fff; border-color: rgba(255,255,255,0.35); }
  .sm .btn-outline.on-dark:hover { background: rgba(255,255,255,0.08); }

  .sm .hero { position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 72px 24px; background: var(--sm-ink); overflow: hidden; }
  .sm .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.85; }
  .sm .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,23,28,0.25), rgba(20,23,28,0.82)); z-index: 1; }
  .sm .hero-content { position: relative; z-index: 2; max-width: 620px; margin: 0 auto; }
  @keyframes sm-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .sm .hero-eyebrow { animation: sm-rise 0.9s ease both; }
  .sm .hero-rule-top { animation: sm-rise 0.9s ease 0.12s both; width: 40px; height: 2px; background: var(--sm-accent); margin: 0 auto 22px; }
  .sm .hero-name { animation: sm-rise 0.9s ease 0.22s both; font-family: var(--sm-font-display); font-size: clamp(42px, 8vw, 80px); font-weight: 700; color: #fff; margin: 0 0 18px; line-height: 1.05; letter-spacing: -1.5px; }
  .sm .hero-date { animation: sm-rise 0.9s ease 0.34s both; font-size: 14px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0 0 34px; }
  .sm .hero-actions { animation: sm-rise 0.9s ease 0.46s both; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  .sm .countdown-wrap { padding: 72px 24px; background: var(--sm-ink); text-align: center; }
  .sm .countdown-heading { font-family: var(--sm-font-display); font-size: 30px; color: #fff; margin: 0 0 32px; font-weight: 700; }
  .sm .countdown-row { display: flex; justify-content: center; gap: clamp(18px, 5vw, 44px); }
  .sm .countdown-block { text-align: center; min-width: 56px; }
  .sm .countdown-value { font-family: var(--sm-font-display); font-size: clamp(30px, 5vw, 48px); color: var(--sm-gold); font-weight: 700; line-height: 1; }
  .sm .countdown-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-top: 8px; }

  .sm .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 12px; }
  @media (max-width: 640px) { .sm .details-grid { grid-template-columns: 1fr; } }
  .sm .details-card { border: 1px solid var(--sm-line); border-radius: 6px; padding: 30px 28px; background: #fff; }
  .sm .details-card .label { font-family: var(--sm-font-sans); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--sm-accent-deep); font-weight: 700; margin: 0 0 12px; }
  .sm .details-card .time { font-family: var(--sm-font-display); font-size: 30px; font-weight: 700; line-height: 1.2; margin: 0 0 6px; }
  .sm .details-card p { font-size: 14px; color: var(--sm-ink-soft); margin: 0 0 3px; }
  .sm .map-frame { border-radius: 6px; overflow: hidden; min-height: 220px; border: 1px solid var(--sm-line); }
  .sm .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .sm .directions-link { text-align: center; margin-top: 20px; }
  .sm .directions-link a { font-size: 13px; color: var(--sm-accent-deep); font-weight: 700; text-decoration: none; letter-spacing: 0.3px; }

  .sm .schedule-day { max-width: 640px; margin: 0 auto 40px; }
  .sm .schedule-day:last-child { margin-bottom: 0; }
  .sm .schedule-day-title { font-family: var(--sm-font-sans); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--sm-accent-deep); font-weight: 700; margin: 0 0 16px; text-align: left; }
  .sm .schedule-list { border-top: 1.5px solid var(--sm-line); text-align: left; }
  .sm .schedule-row { display: flex; gap: 20px; padding: 18px 0; border-bottom: 1px solid var(--sm-line); align-items: baseline; }
  .sm .schedule-time { font-family: var(--sm-font-display); font-size: 16px; font-weight: 700; color: var(--sm-accent-deep); min-width: 130px; flex-shrink: 0; }
  .sm .schedule-info .name { font-size: 15px; color: var(--sm-ink); font-weight: 600; margin: 0 0 3px; }
  .sm .schedule-info .loc { font-size: 13px; color: var(--sm-ink-soft); margin: 0; }

  .sm .rsvp-card { max-width: 460px; margin: 0 auto; background: #fff; border-radius: 6px; padding: 36px 32px; border: 1px solid var(--sm-line); text-align: left; box-shadow: 0 4px 28px rgba(20,23,28,0.06); }
  .sm input, .sm textarea, .sm select { font-family: var(--sm-font-sans); font-size: 15px; padding: 10px 0; border-radius: 0; border: none; border-bottom: 1.5px solid var(--sm-line); outline: none; background: transparent; color: var(--sm-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .sm input:focus, .sm textarea:focus, .sm select:focus { border-bottom-color: var(--sm-accent); }
  .sm label.field-label { font-family: var(--sm-font-sans); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--sm-accent-deep); display: block; margin-bottom: 4px; font-weight: 700; }
  .sm .radio-label, .sm .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--sm-ink); cursor: pointer; }
  .sm .radio-label input, .sm .check-label input { width: auto; border: none; border-bottom: none; padding: 0; accent-color: var(--sm-accent); }
  .sm .check-hint { font-family: var(--sm-font-sans); font-size: 12px; color: var(--sm-ink-soft); margin: 4px 0 0; }
  .sm .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .sm .rsvp-error { color: #C1443A; font-size: 13px; margin: 0; font-family: var(--sm-font-sans); }
  .sm .rsvp-success { text-align: center; padding: 16px 0; }
  .sm .rsvp-headline { font-family: var(--sm-font-display); font-size: 26px; color: var(--sm-ink); margin: 0 0 10px; font-weight: 700; }
  .sm .rsvp-sub { font-size: 14px; color: var(--sm-ink-soft); margin: 0; }
  .sm .rsvp-form { display: flex; flex-direction: column; gap: 20px; }

  .sm .gallery-tile { overflow: hidden; border-radius: 4px; border: 1px solid var(--sm-line); }

  .sm .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; background-color: var(--sm-ink); }
  .sm .registry-overlay { background: rgba(20,23,28,0.6); padding: 48px 64px; text-align: center; border-radius: 6px; }
  .sm .registry-title { font-family: var(--sm-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--sm-gold); margin: 0 0 14px; font-weight: 700; }
  .sm .registry-description { font-size: 15px; color: rgba(255,255,255,0.85); margin: 0 0 24px; line-height: 1.6; max-width: 400px; }
  .sm .registry-button { display: inline-block; padding: 13px 30px; border-radius: 4px; border: 1.5px solid var(--sm-gold); color: var(--sm-gold); text-decoration: none; font-family: var(--sm-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; transition: background 0.2s ease; line-height: 1; }
  .sm .registry-button:hover { background: rgba(201,162,74,0.12); }

  .sm .song-section { background: var(--sm-ink); }
  .sm .song-section .song-list { border-top: 1.5px solid rgba(255,255,255,0.15); max-width: 560px; margin: 0 auto; }
  .sm .song-section .song-row { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0; display: flex; justify-content: space-between; }
  .sm .song-section .song-row .title { color: #fff; }
  .sm .song-section .song-row .artist { color: rgba(255,255,255,0.6); }
  .sm .song-section input::placeholder { color: rgba(255,255,255,0.4); }
  .sm .song-section input { color: #fff; border-bottom-color: rgba(255,255,255,0.25); }
  .sm .song-section input:focus { border-bottom-color: var(--sm-gold); }
  .sm .song-section label.field-label { color: rgba(255,255,255,0.65); }

  .sm .footer { padding: 90px 24px 72px; background: var(--sm-paper); text-align: center; }
  .sm .footer p { font-size: 14px; color: var(--sm-ink-soft); margin: 0 0 4px; }
  .sm .footer-rule { width: 40px; height: 1px; background: var(--sm-line); margin: 24px auto; border: none; }
  .sm .footer-signoff { font-family: var(--sm-font-display); font-size: 18px; font-weight: 700; color: var(--sm-ink); margin: 0; }
  .sm .footer-credit { font-family: var(--sm-font-sans); font-size: 11px; color: var(--sm-ink-soft); opacity: 0.6; margin-top: 24px; letter-spacing: 0.3px; }
  /* share / hashtag band (ShareSection) */
  .sm .share-band { padding: 88px 24px; background: var(--sm-ink); text-align: center; }
  .sm .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .sm .share-hashtag { font-family: var(--sm-font-display); font-size: clamp(26px, 4vw, 36px); color: #fff; margin: 0 0 28px; font-weight: 700; letter-spacing: -0.5px; overflow-wrap: anywhere; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

// Summit reuses every shared form/section component (RsvpForm, GuestPhotoSection,
// SongRequestSection) as-is — only the copy that's inherently bride/groom-flavored
// is overridden here, everything else (RSVP, Gallery, error/success strings) stays
// exactly what translations.ts already provides.
const OVERRIDES = {
  en: {
    ourStoryBtn: 'About the Event',
    ourStoryLabel: 'About',
    howWeGotHere: 'About the event',
    eventProgram: 'Agenda',
    kindlyRespond: "Let us know you're coming",
    registry: 'Partners & Sponsors',
    viewRegistry: 'Learn more',
    noteForCouple: 'A note for the hosts',
    noteForCouplePlaceholder: 'Dietary needs, questions, anything else we should know…',
    songRequests: 'Music Requests',
    buildOurPlaylist: 'Set the soundtrack',
    withLove: 'See you there,',
    theCouple: 'the team',
  },
  fr: {
    ourStoryBtn: "À propos de l'événement",
    ourStoryLabel: 'À propos',
    howWeGotHere: "À propos de l'événement",
    eventProgram: 'Programme',
    kindlyRespond: 'Confirmez votre présence',
    registry: 'Partenaires et sponsors',
    viewRegistry: 'En savoir plus',
    noteForCouple: 'Un mot pour les organisateurs',
    noteForCouplePlaceholder: 'Besoins alimentaires, questions, autre chose à savoir…',
    songRequests: 'Demandes musicales',
    buildOurPlaylist: "Composez l'ambiance",
    withLove: 'À bientôt,',
    theCouple: "l'équipe",
  },
  es: {
    ourStoryBtn: 'Sobre el evento',
    ourStoryLabel: 'Sobre',
    howWeGotHere: 'Sobre el evento',
    eventProgram: 'Agenda',
    kindlyRespond: 'Confirma tu asistencia',
    registry: 'Socios y patrocinadores',
    viewRegistry: 'Más información',
    noteForCouple: 'Una nota para los organizadores',
    noteForCouplePlaceholder: 'Necesidades alimentarias, preguntas, algo más que debamos saber…',
    songRequests: 'Solicitudes de música',
    buildOurPlaylist: 'Elige el ambiente',
    withLove: 'Nos vemos allí,',
    theCouple: 'el equipo',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "You're invited", fr: 'Vous êtes invités', es: 'Estás invitado' };

const SummitDivider = () => (
  <div className="divider" aria-hidden="true">
    <span className="line" />
    <span className="dot" />
    <span className="line" />
  </div>
);

export default function Summit({
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
    <div className="sm">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(bannerImage || HERO_DEFAULTS.summit) ? (
            <video className="hero-bg" src={bannerImage || HERO_DEFAULTS.summit} autoPlay muted loop playsInline style={{ objectFit: heroObjectFit }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage || HERO_DEFAULTS.summit} alt="" style={{ objectFit: heroObjectFit }} />
          )
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="eyebrow on-dark hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          <div className="hero-rule-top" />
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
          <div id="story" className="section section-center story-section" style={{ backgroundColor: '#14171C' }}>
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow on-dark" fallback={t.ourStoryLabel} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title on-dark" fallback={t.howWeGotHere} />
              {editSlots?.description ?? (
                <p style={{ fontFamily: 'var(--sm-font-sans)', fontSize: 17, lineHeight: 1.85, color: 'rgba(255,255,255,0.88)', maxWidth: 600, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      <SummitDivider />

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <Reveal from="right">
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 600, color: 'var(--sm-ink)' }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sm-accent-deep)', textDecoration: 'none', fontWeight: 700 }}>{t.joinOnline}</a></p>
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
      )}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-center section-tinted">
            <div className="wrap">
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
          <div id="rsvp" className="section section-center" style={{ backgroundColor: '#14171C' }}>
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" style={{ color: '#FFFFFF' }} fallback={t.kindlyRespond} />
              <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title on-dark" fallback={t.rsvp} />
              <div className="rsvp-card">
                <RsvpForm userPageId={userPageId} translations={t} disabled={isPreview} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center section-tinted">
          <div className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.gallery} />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.memoriesSoFar} />
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

      {/* MUSIC REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <Reveal>
          <div className="section section-center song-section">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow on-dark" fallback={t.buildOurPlaylist} />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title on-dark" fallback={t.songRequests} />
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
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline on-dark" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow" style={{ marginBottom: 14 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title" style={{ marginBottom: 14 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--sm-ink-soft)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--sm-ink-soft)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <hr className="footer-rule" />
        <p className="footer-signoff">{t.withLove} {heading || t.theCouple}</p>
        <SectionText ctx={sectionTextCtx} k="footer.credit" className="footer-credit" fallback={t.madeWithMygala}
          defaultContent={<>{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></>} />
      </footer>
    </div>
  );
}
