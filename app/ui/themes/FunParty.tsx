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

// Exclusive to Fun Party — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'fp-default-1', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-1.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'fp-default-2', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-2.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'fp-default-3', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-3.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'fp-default-4', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-4.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'fp-default-5', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-5.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'fp-default-6', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-6.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'fp-default-7', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-7.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'fp-default-8', user_page_id: 0, image_path: '/images/themes/fun-party/celebration-8.png', image_name: '', image_type: 'image/png', created_at: '' },
];

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#1A0B2E', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'left' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bannerImage || HERO_DEFAULTS['fun-party']} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(26,11,46,0.88) 0%, rgba(26,11,46,0.35) 60%, rgba(26,11,46,0.1) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', maxWidth: 260 }}>
        <p style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: '#E8FF3D', fontWeight: 700, margin: '0 0 10px' }}>Let&apos;s get this party started</p>
        <h2 style={{ fontFamily: "'Bungee', system-ui, sans-serif", fontSize: 'clamp(22px, 4.2vw, 34px)', fontWeight: 400, color: '#FFFFFF', margin: '0 0 10px', lineHeight: 1.05, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>{heading || 'The Big Sweet 16'}</h2>
        {date && <p style={{ fontSize: 11, letterSpacing: 1.5, color: '#00D9E9', margin: 0, fontWeight: 600 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --fp-pink: #FF2E93;
    --fp-pink-deep: #D91C77;
    --fp-cyan: #00D9E9;
    --fp-yellow: #E8FF3D;
    --fp-purple-deep: #1A0B2E;
    --fp-purple: #2E1852;
    --fp-cream: #FFF9F0;
    --fp-ink: #1A0B2E;
    --fp-ink-soft: #6B5B85;
    --fp-font-display: 'Bungee', system-ui, -apple-system, 'Segoe UI', sans-serif;
    --fp-font-sans: 'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .fp * { box-sizing: border-box; }
  .fp { margin: 0; background: var(--fp-cream); color: var(--fp-ink); font-family: var(--fp-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .fp img { max-width: 100%; }

  .fp .confetti { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
  .fp .confetti span { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
  .fp .confetti.center { justify-content: center; }

  .fp .eyebrow { font-family: var(--fp-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--fp-pink-deep); font-weight: 700; margin: 0 0 12px; }
  .fp .eyebrow.on-dark { color: var(--fp-yellow); }
  .fp .section-title { font-family: var(--fp-font-display); font-size: clamp(28px, 4vw, 44px); font-weight: 400; color: var(--fp-ink); margin: 0 0 22px; line-height: 1.15; }
  .fp .section-title.on-dark { color: #FFFFFF; }

  .fp .wrap { max-width: 760px; margin: 0 auto; padding: 0 28px; }
  .fp .wrap-wide { max-width: 1000px; margin: 0 auto; padding: 0 28px; }
  .fp .section { padding: 84px 28px; }
  .fp .section-center { text-align: center; }
  .fp .section-dark { background: var(--fp-purple-deep); }
  @media (max-width: 640px) { .fp .section { padding: 60px 20px; } }

  .fp .btn { font-family: var(--fp-font-sans); font-size: 13px; font-weight: 700; letter-spacing: 0.5px; padding: 14px 30px; border-radius: 999px; border: none; background: var(--fp-pink); color: #fff; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .fp .btn:hover { background: var(--fp-pink-deep); transform: translateY(-2px) rotate(-1deg); }
  .fp .btn-outline { background: transparent; color: #FFFFFF; border: 2px solid var(--fp-cyan); }
  .fp .btn-outline:hover { background: rgba(0,217,233,0.15); }
  .fp .btn-cyan { background: var(--fp-cyan); color: var(--fp-purple-deep); }
  .fp .btn-cyan:hover { background: #00B8C7; }

  .fp input, .fp textarea, .fp select { font-family: var(--fp-font-sans); font-size: 15px; padding: 11px 14px; border-radius: 10px; border: 2px solid #EDE2FF; outline: none; background: #fff; color: var(--fp-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .fp input:focus, .fp textarea:focus, .fp select:focus { border-color: var(--fp-pink); }
  .fp label.field-label { font-family: var(--fp-font-sans); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--fp-pink-deep); display: block; margin-bottom: 5px; font-weight: 700; }
  .fp .radio-label, .fp .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--fp-ink); cursor: pointer; }
  .fp .radio-label input, .fp .check-label input { width: auto; border: none; padding: 0; accent-color: var(--fp-pink); }
  .fp .check-hint { font-family: var(--fp-font-sans); font-size: 12px; color: var(--fp-ink-soft); margin: 4px 0 0; }
  .fp .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .fp .rsvp-error { color: #D91C77; font-size: 13px; margin: 0; font-family: var(--fp-font-sans); }
  .fp .rsvp-success { text-align: center; padding: 16px 0; }
  .fp .rsvp-headline { font-family: var(--fp-font-display); font-size: 26px; color: var(--fp-pink); margin: 0 0 10px; font-weight: 400; }
  .fp .rsvp-sub { font-size: 14px; color: var(--fp-ink-soft); margin: 0; }
  .fp .rsvp-form { display: flex; flex-direction: column; gap: 18px; }

  .fp .hero { position: relative; min-height: 94vh; display: flex; align-items: center; justify-content: flex-start; text-align: left; padding: 96px 40px 88px; background: var(--fp-purple-deep); overflow: hidden; }
  .fp .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.9; }
  .fp .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(26,11,46,0.88) 0%, rgba(26,11,46,0.5) 55%, rgba(26,11,46,0.15) 100%); z-index: 0; }
  .fp .hero-content { position: relative; z-index: 1; max-width: 540px; }
  @keyframes fp-pop { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .fp .hero-eyebrow { animation: fp-pop 0.8s ease both; }
  .fp .hero-name { animation: fp-pop 0.8s ease 0.15s both; font-family: var(--fp-font-display); font-size: clamp(40px, 7.5vw, 78px); font-weight: 400; color: #FFFFFF; margin: 0 0 20px; line-height: 1.05; text-shadow: 0 3px 0 var(--fp-pink), 0 6px 24px rgba(0,0,0,0.4); }
  .fp .hero-date { animation: fp-pop 0.8s ease 0.3s both; font-family: var(--fp-font-sans); font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--fp-cyan); font-weight: 700; margin: 0 0 30px; }
  .fp .hero-actions { animation: fp-pop 0.8s ease 0.45s both; display: flex; gap: 14px; flex-wrap: wrap; }

  .fp .countdown-wrap { padding: 72px 24px; background: var(--fp-purple-deep); text-align: center; }
  .fp .countdown-heading { font-family: var(--fp-font-display); font-size: 28px; color: #fff; margin: 0 0 32px; font-weight: 400; }
  .fp .countdown-row { display: flex; justify-content: center; gap: clamp(16px, 5vw, 42px); }
  .fp .countdown-block { text-align: center; min-width: 60px; }
  .fp .countdown-value { font-family: var(--fp-font-display); font-size: clamp(28px, 4.5vw, 46px); color: var(--fp-yellow); font-weight: 400; line-height: 1; }
  .fp .countdown-label { font-family: var(--fp-font-sans); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--fp-cyan); margin-top: 8px; font-weight: 600; }

  .fp .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 12px; }
  @media (max-width: 640px) { .fp .details-grid { grid-template-columns: 1fr; } }
  .fp .details-card { background: #fff; border: 2px solid var(--fp-pink); border-radius: 16px; padding: 28px 26px; }
  .fp .details-card .label { font-family: var(--fp-font-sans); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--fp-pink-deep); font-weight: 700; margin: 0 0 10px; }
  .fp .details-card .time { font-family: var(--fp-font-display); font-size: 28px; line-height: 1.2; color: var(--fp-ink); }
  .fp .details-card p { font-size: 14px; color: var(--fp-ink-soft); margin: 0 0 3px; }
  .fp .map-frame { border-radius: 16px; overflow: hidden; min-height: 220px; border: 2px solid var(--fp-cyan); }
  .fp .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .fp .directions-link { text-align: center; margin-top: 18px; }
  .fp .directions-link a { font-family: var(--fp-font-sans); font-size: 13px; color: var(--fp-pink-deep); font-weight: 700; text-decoration: none; }

  .fp .schedule-day { max-width: 620px; margin: 0 auto 40px; }
  .fp .schedule-day:last-child { margin-bottom: 0; }
  .fp .schedule-day-title { font-family: var(--fp-font-sans); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--fp-yellow); font-weight: 700; margin: 0 0 16px; text-align: left; }
  .fp .schedule-list { border-top: 2px solid rgba(255,255,255,0.15); text-align: left; }
  .fp .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.1); align-items: baseline; }
  .fp .schedule-time { font-family: var(--fp-font-display); font-size: 15px; color: var(--fp-cyan); min-width: 120px; flex-shrink: 0; }
  .fp .schedule-info .name { font-family: var(--fp-font-sans); font-size: 15px; color: #fff; font-weight: 600; margin: 0 0 3px; }
  .fp .schedule-info .loc { font-family: var(--fp-font-sans); font-size: 13px; color: rgba(255,255,255,0.65); margin: 0; }

  .fp .rsvp-card { max-width: 460px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 34px 30px; text-align: left; box-shadow: 0 10px 40px rgba(255,46,147,0.18); border: 2px solid var(--fp-yellow); }

  .fp .gallery-tile { overflow: hidden; border-radius: 14px; border: 2px solid var(--fp-pink); }

  .fp .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .fp .registry-overlay { background: rgba(26,11,46,0.72); padding: 48px 60px; text-align: center; border-radius: 16px; }
  .fp .registry-title { font-family: var(--fp-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--fp-yellow); margin: 0 0 14px; font-weight: 700; }
  .fp .registry-description { font-size: 15px; color: rgba(255,255,255,0.9); margin: 0 0 24px; line-height: 1.6; max-width: 390px; }
  .fp .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; border: none; background: var(--fp-pink); color: #fff; text-decoration: none; font-family: var(--fp-font-sans); font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; transition: background 0.2s ease; }
  .fp .registry-button:hover { background: var(--fp-pink-deep); }

  .fp .song-section .song-list { border-top: 2px solid rgba(255,255,255,0.15); max-width: 540px; margin: 0 auto; }
  .fp .song-section .song-row { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 10px 0; }
  .fp .song-section .song-row .title { color: #fff; }
  .fp .song-section .song-row .artist { color: rgba(255,255,255,0.6); }
  .fp .song-section input { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); color: #fff; }
  .fp .song-section input::placeholder { color: rgba(255,255,255,0.4); }
  .fp .song-section label.field-label { color: var(--fp-yellow); }

  .fp .footer { padding: 84px 24px 68px; background: var(--fp-purple-deep); text-align: center; }
  .fp .footer p { font-size: 14px; color: rgba(255,255,255,0.8); margin: 0 0 4px; }
  .fp .footer-rule { width: 60px; height: 3px; background: var(--fp-yellow); margin: 24px auto; border: none; border-radius: 2px; }
  .fp .footer-signoff { font-family: var(--fp-font-display); font-size: 20px; font-weight: 400; color: var(--fp-pink); margin: 0; }
  .fp .footer-credit { font-family: var(--fp-font-sans); font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 24px; letter-spacing: 0.3px; }
  /* share / hashtag band (ShareSection) */
  .fp .share-band { padding: 84px 24px; background: var(--fp-purple); text-align: center; }
  .fp .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .fp .share-hashtag { font-family: var(--fp-font-display); font-size: clamp(24px, 4vw, 36px); color: var(--fp-yellow); margin: 0 0 28px; font-weight: 400; overflow-wrap: anywhere; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryLabel: 'The vibe',
    howWeGotHere: "What's the party about",
    eventProgram: 'Party Lineup',
    theSchedule: "Don't miss a thing",
    kindlyRespond: 'Are you in?',
    registry: 'Wishlist',
    viewRegistry: 'View wishlist',
    noteForCouple: 'A note for the birthday crew',
    noteForCouplePlaceholder: 'Hype, requests, anything we should know…',
    buildOurPlaylist: 'Hype up the playlist',
    untilWeSayIDo: 'Until we party',
    withLove: 'See you on the dance floor,',
    theCouple: 'the birthday crew',
  },
  fr: {
    ourStoryLabel: "L'ambiance",
    howWeGotHere: 'De quoi parle la fête',
    eventProgram: 'Programme de la fête',
    theSchedule: 'À ne pas manquer',
    kindlyRespond: 'Tu viens?',
    registry: 'Liste de souhaits',
    viewRegistry: 'Voir la liste',
    noteForCouple: "Un mot pour l'équipe d'anniversaire",
    noteForCouplePlaceholder: 'Hype, demandes, autre chose à savoir…',
    buildOurPlaylist: 'Boostez la playlist',
    untilWeSayIDo: 'Avant la fête',
    withLove: 'On se retrouve sur la piste de danse,',
    theCouple: "l'équipe d'anniversaire",
  },
  es: {
    ourStoryLabel: 'El ambiente',
    howWeGotHere: 'De qué se trata la fiesta',
    eventProgram: 'Programa de la fiesta',
    theSchedule: 'No te lo pierdas',
    kindlyRespond: '¿Vienes?',
    registry: 'Lista de deseos',
    viewRegistry: 'Ver la lista',
    noteForCouple: 'Una nota para el equipo de cumpleaños',
    noteForCouplePlaceholder: 'Ánimo, peticiones, algo más que debamos saber…',
    buildOurPlaylist: 'Anima la playlist',
    untilWeSayIDo: 'Hasta que empiece la fiesta',
    withLove: 'Nos vemos en la pista de baile,',
    theCouple: 'el equipo de cumpleaños',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "Let's get this party started", fr: 'La fête commence!', es: '¡Que empiece la fiesta!' };

const Confetti = ({ center }: { center?: boolean }) => (
  <div className={`confetti${center ? ' center' : ''}`} aria-hidden="true">
    <span style={{ background: '#FF2E93' }} />
    <span style={{ background: '#00D9E9' }} />
    <span style={{ background: '#E8FF3D' }} />
    <span style={{ background: '#FF2E93' }} />
  </div>
);

export default function FunParty({
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
  // Fun Party reuses every shared form/section component as-is — only the
  // copy that's inherently bride/groom-flavored is overridden here.
  const t: Translations = { ...base, ...pickByLanguage(OVERRIDES, language) };
  const isPreview = !!editSlots;
  // Forms are shown but can't be submitted in the editor or a showcase preview.
  const formsDisabled = isPreview || !!demo;
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
    <div className="fp">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Poppins:wght@400;500;600;700&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes={demo} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(bannerImage || HERO_DEFAULTS['fun-party']) ? (
            <video className="hero-bg" src={bannerImage || HERO_DEFAULTS['fun-party']} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage || HERO_DEFAULTS['fun-party']} alt="" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <Confetti />
          {editSlots?.heroEyebrow ?? <p className="eyebrow on-dark hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
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
              <Confetti center />
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
              {editSlots?.description ?? (
                <p style={{ fontFamily: 'var(--fp-font-sans)', fontSize: 17, lineHeight: 1.85, color: 'var(--fp-ink-soft)', maxWidth: 580, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* COUNTDOWN */}
      {eventDate && (
        <Countdown
          eventDate={eventDate}
          eventTime={eventTime}
          eyebrow={t.countingDown}
          heading={t.untilWeSayIDo}
          todayHeading={t.todayIsTheDay}
          unitLabels={{ days: t.days, hours: t.hours, mins: t.mins, secs: t.secs }}
          sectionText={sectionTextCtx}
        />
      )}

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 600, color: 'var(--fp-ink)' }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fp-pink-deep)', textDecoration: 'none', fontWeight: 700 }}>{t.joinOnline}</a></p>
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
          <div id="livestream" className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="eyebrow" fallback={t.livestreamLabel} />
              <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--fp-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-center">
            <div className="wrap">
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={{ fontFamily: 'var(--fp-font-sans)', fontSize: 17, lineHeight: 1.85, color: 'var(--fp-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-center section-dark">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow on-dark" fallback={t.theSchedule} />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title on-dark" fallback={t.eventProgram} />
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
          <div id="rsvp" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
              <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
              <div className="rsvp-card">
                <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
              </div>
            </div>
          </div>
        </Reveal>
      )}
      {/* POTLUCK (Plus, off by default) */}
      {isPaid && potluck && (
        <Reveal>
          <div id="potluck" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
              <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
              <div className="rsvp-card">
                <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) */}
      {isPaid && giftExchange && (
        <Reveal>
          <div id="gift-exchange" className="section section-center">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
              <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
              <div className="rsvp-card">
                <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.gallery} />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.memoriesSoFar} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* WISHLIST (registry section, reframed) */}
      {(registryDescription || registryButtonLink) && (
        <Reveal>
          <div
            className="registry-wrap"
            style={{ backgroundImage: `url(${registryImage || '/images/themes/fun-party/registry.jpg'})` }}
          >
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
          <div className="section section-center">
            <div className="wrap-wide">
              <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel} />
              <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
              <SponsorGrid sponsors={sponsors} textStyle={{ color: 'var(--fp-ink-soft)' }} />
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
                disabled={formsDisabled}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* SONG REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <Reveal>
          <div className="section section-center section-dark song-section">
            <div className="wrap">
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow on-dark" fallback={t.buildOurPlaylist} />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title on-dark" fallback={t.songRequests} />
              <SongRequestSection
                userPageId={galleryToken}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn btn-cyan"
                disabled={formsDisabled}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow on-dark" buttonClassName="btn btn-outline" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 14 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 14 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <hr className="footer-rule" />
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
