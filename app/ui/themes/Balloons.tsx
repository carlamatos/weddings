import type { CSSProperties } from 'react';
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

// Exclusive to Balloons — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'bl-default-1', user_page_id: 0, image_path: '/images/themes/balloons/celebration-1.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'bl-default-2', user_page_id: 0, image_path: '/images/themes/balloons/celebration-2.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'bl-default-3', user_page_id: 0, image_path: '/images/themes/balloons/celebration-3.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'bl-default-4', user_page_id: 0, image_path: '/images/themes/balloons/celebration-4.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'bl-default-5', user_page_id: 0, image_path: '/images/themes/balloons/celebration-5.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'bl-default-6', user_page_id: 0, image_path: '/images/themes/balloons/celebration-6.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'bl-default-7', user_page_id: 0, image_path: '/images/themes/balloons/celebration-7.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
  { id: 'bl-default-8', user_page_id: 0, image_path: '/images/themes/balloons/celebration-8.jpeg', image_name: '', image_type: 'image/jpeg', created_at: '' },
];

const PALETTE: [string, string, string] = ['#3E8FE0', '#F2454B', '#FFC93C'];

function Confetti({ style }: { style?: CSSProperties }) {
  return (
    <div className="bl-confetti" aria-hidden="true" style={style}>
      <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="3" fill="#F2454B" transform="rotate(15 8 8)" /></svg>
      <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="6.5" fill="#FFC93C" /></svg>
      <svg width="15" height="15" viewBox="0 0 15 15"><polygon points="7.5,0 15,15 0,15" fill="#3E8FE0" /></svg>
      <svg width="13" height="13" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="6.5" fill="#9B6BDE" /></svg>
      <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="3" fill="#2FB88A" transform="rotate(-12 8 8)" /></svg>
    </div>
  );
}

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: 'linear-gradient(135deg, #FFFDF6 0%, #EAF4FF 100%)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }} />
      ) : (
        <GradientHeroPlaceholder colors={PALETTE} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/themes/balloons/hero-balloons.png" alt="" style={{ position: 'absolute', right: -18, bottom: -12, width: 150, objectFit: 'contain', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: "'Baloo 2', cursive", fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#F2454B', fontWeight: 700, margin: '0 0 10px' }}>It&apos;s party time</p>
        <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 'clamp(26px, 5.2vw, 44px)', fontWeight: 700, color: '#2E2A3D', margin: '0 0 10px' }}>{heading || 'The Big Celebration'}</h2>
        {date && <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#6E6780', margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --bl-cream: #FFFDF6;
    --bl-sky: #EAF4FF;
    --bl-red: #F2454B;
    --bl-yellow: #FFC93C;
    --bl-blue: #3E8FE0;
    --bl-purple: #9B6BDE;
    --bl-green: #2FB88A;
    --bl-ink: #2E2A3D;
    --bl-ink-soft: #6E6780;
    --bl-font-display: 'Baloo 2', cursive;
    --bl-font-sans: 'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .bl * { box-sizing: border-box; }
  .bl { margin: 0; background: var(--bl-cream); color: var(--bl-ink); font-family: var(--bl-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .bl img { max-width: 100%; }

  .bl .bl-confetti { display: inline-flex; gap: 9px; align-items: center; margin: 0 0 18px; }
  .bl .bl-confetti.center { justify-content: center; width: 100%; }

  .bl .eyebrow { font-family: var(--bl-font-display); font-size: 13px; letter-spacing: 0.5px; color: var(--bl-red); font-weight: 700; margin: 0 0 10px; text-transform: none; }
  .bl .eyebrow.on-dark { color: #FFFFFF; }
  .bl .section-title { font-family: var(--bl-font-display); font-size: clamp(32px, 4.4vw, 50px); font-weight: 700; color: var(--bl-ink); margin: 0 0 20px; line-height: 1.15; }
  .bl .section-title.on-dark { color: #FFFFFF; }

  .bl .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .bl .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .bl .section { padding: 84px 28px; }
  .bl .section-center { text-align: center; }
  @media (max-width: 640px) { .bl .section { padding: 56px 20px; } }

  .bl .btn { font-family: var(--bl-font-display); font-size: 14px; font-weight: 700; letter-spacing: 0.3px; padding: 13px 30px; border-radius: 999px; border: none; background: var(--bl-red); color: #FFFFFF; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; box-shadow: 0 6px 16px rgba(242,69,75,0.28); }
  .bl .btn:hover { background: #D93840; transform: translateY(-2px) rotate(-1deg); }
  .bl .btn-outline { background: transparent; color: var(--bl-blue); border: 2px solid var(--bl-blue); box-shadow: none; }
  .bl .btn-outline:hover { background: rgba(62,143,224,0.1); transform: translateY(-2px); }
  .bl .btn-blue { background: var(--bl-blue); box-shadow: 0 6px 16px rgba(62,143,224,0.28); }
  .bl .btn-blue:hover { background: #2C78C4; }

  .bl input, .bl textarea, .bl select { font-family: var(--bl-font-sans); font-size: 15px; padding: 11px 14px; border-radius: 12px; border: 2px solid #EDE7F5; outline: none; background: #FBFAFF; color: var(--bl-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .bl input:focus, .bl textarea:focus, .bl select:focus { border-color: var(--bl-blue); }
  .bl label.field-label { font-family: var(--bl-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bl-red); display: block; margin-bottom: 5px; font-weight: 700; }
  .bl .radio-label, .bl .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--bl-ink); cursor: pointer; }
  .bl .radio-label input, .bl .check-label input { width: auto; border: none; padding: 0; accent-color: var(--bl-red); }
  .bl .check-hint { font-family: var(--bl-font-sans); font-size: 12px; color: var(--bl-ink-soft); margin: 4px 0 0; }
  .bl .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .bl .rsvp-error { color: #C0392B; font-size: 13px; margin: 0; font-family: var(--bl-font-sans); }
  .bl .rsvp-success { text-align: center; padding: 16px 0; }
  .bl .rsvp-headline { font-family: var(--bl-font-display); font-size: 30px; color: var(--bl-red); margin: 0 0 10px; font-weight: 700; }
  .bl .rsvp-sub { font-size: 14px; color: var(--bl-ink-soft); margin: 0; }
  .bl .rsvp-form { display: flex; flex-direction: column; gap: 20px; }

  .bl .hero { position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 120px 32px 96px; background: linear-gradient(135deg, var(--bl-cream) 0%, var(--bl-sky) 100%); overflow: hidden; }
  .bl .hero-balloons { position: absolute; right: clamp(-40px, -2vw, 0px); bottom: -12px; width: min(40vw, 460px); z-index: 1; object-fit: contain; filter: drop-shadow(0 24px 40px rgba(46,42,61,0.18)); animation: bl-float 6s ease-in-out infinite; }
  @keyframes bl-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  @media (max-width: 720px) { .bl .hero-balloons { width: 220px; opacity: 0.85; } }
  @media (max-width: 480px) { .bl .hero-balloons { display: none; } }
  .bl .hero-content { position: relative; z-index: 2; max-width: 620px; margin: 0 auto; }
  @keyframes bl-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .bl .hero-eyebrow { animation: bl-rise 0.8s ease both; }
  .bl .hero-name { animation: bl-rise 0.8s ease 0.15s both; font-family: var(--bl-font-display); font-size: clamp(48px, 8.4vw, 92px); font-weight: 800; color: var(--bl-ink); margin: 0 0 22px; line-height: 1; }
  .bl .hero-date { animation: bl-rise 0.8s ease 0.3s both; font-family: var(--bl-font-sans); font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bl-ink-soft); font-weight: 700; margin: 0 0 26px; }
  .bl .hero-actions { animation: bl-rise 0.8s ease 0.45s both; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  .bl .countdown-wrap { padding: 68px 24px; background: var(--bl-blue); text-align: center; }
  .bl .countdown-heading { font-family: var(--bl-font-display); font-size: 40px; color: #fff; margin: 0 0 32px; font-weight: 700; }
  .bl .countdown-row { display: flex; justify-content: center; gap: clamp(16px, 5vw, 44px); }
  .bl .countdown-block { text-align: center; min-width: 56px; }
  .bl .countdown-value { font-family: var(--bl-font-display); font-size: clamp(32px, 5vw, 60px); color: #fff; font-weight: 700; line-height: 1; }
  .bl .countdown-label { font-family: var(--bl-font-sans); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-top: 8px; font-weight: 700; }

  .bl .details-section { position: relative; overflow: hidden; }
  .bl .details-balloon-decor { position: absolute; top: -50px; right: -60px; width: 360px; opacity: 0.14; z-index: 0; pointer-events: none; }
  .bl .details-inner { position: relative; z-index: 1; }
  .bl .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 12px; }
  @media (max-width: 640px) { .bl .details-grid { grid-template-columns: 1fr; } }
  .bl .details-card { background: #FFFFFF; border: 2px solid #EDE7F5; border-radius: 20px; padding: 28px 26px; box-shadow: 0 10px 28px rgba(46,42,61,0.06); }
  .bl .details-card .label { font-family: var(--bl-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bl-blue); font-weight: 800; margin: 0 0 10px; }
  .bl .details-card .time { font-family: var(--bl-font-display); font-size: 30px; line-height: 1.2; color: var(--bl-ink); }
  .bl .details-card p { font-size: 14px; color: var(--bl-ink-soft); margin: 0 0 3px; }
  .bl .map-frame { border-radius: 20px; overflow: hidden; min-height: 220px; border: 2px solid #EDE7F5; }
  .bl .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .bl .directions-link { text-align: center; margin-top: 18px; }
  .bl .directions-link a { font-family: var(--bl-font-sans); font-size: 13px; color: var(--bl-blue); font-weight: 700; text-decoration: none; }

  .bl .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .bl .schedule-day:last-child { margin-bottom: 0; }
  .bl .schedule-day-title { font-family: var(--bl-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bl-green); font-weight: 800; margin: 0 0 18px; }
  .bl .schedule-list { border-top: 2px solid #EDE7F5; text-align: left; }
  .bl .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 2px solid #EDE7F5; align-items: baseline; }
  .bl .schedule-time { font-family: var(--bl-font-display); font-size: 18px; color: var(--bl-red); min-width: 110px; flex-shrink: 0; font-weight: 700; }
  .bl .schedule-info .name { font-family: var(--bl-font-sans); font-size: 15px; color: var(--bl-ink); font-weight: 700; margin: 0 0 3px; }
  .bl .schedule-info .loc { font-family: var(--bl-font-sans); font-size: 13px; color: var(--bl-ink-soft); margin: 0; }

  .bl .rsvp-section { position: relative; background-image: url('/images/themes/balloons/rsvp-frame.jpeg'); background-size: cover; background-position: center; padding: 96px 28px; text-align: center; }
  .bl .rsvp-section::before { content: ''; position: absolute; inset: 0; background: rgba(255,253,246,0.2); }
  .bl .rsvp-section > * { position: relative; z-index: 1; }
  .bl .rsvp-card { max-width: 460px; margin: 0 auto; background: #FFFFFF; border-radius: 22px; padding: 34px 30px; text-align: left; box-shadow: 0 16px 40px rgba(46,42,61,0.22); border: 3px dashed var(--bl-red); }

  .bl .gallery-tile { overflow: hidden; border-radius: 18px; border: 2px solid #EDE7F5; }

  .bl .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .bl .registry-overlay { background: rgba(46,42,61,0.62); padding: 48px 60px; text-align: center; border-radius: 20px; }
  .bl .registry-title { font-family: var(--bl-font-sans); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--bl-yellow); margin: 0 0 14px; font-weight: 800; }
  .bl .registry-description { font-size: 15px; color: rgba(255,255,255,0.9); margin: 0 0 24px; line-height: 1.6; max-width: 390px; }
  .bl .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; border: 2px solid var(--bl-yellow); color: var(--bl-yellow); text-decoration: none; font-family: var(--bl-font-display); font-size: 14px; font-weight: 700; transition: background 0.2s ease; }
  .bl .registry-button:hover { background: rgba(255,201,60,0.15); }

  .bl .song-section { background: var(--bl-sky); padding: 84px 28px; text-align: center; }
  .bl .song-section .song-list { border-top: 2px solid #DCE9F7; max-width: 540px; margin: 0 auto; }
  .bl .song-section .song-row { border-bottom: 2px solid #DCE9F7; padding: 10px 0; }
  .bl .song-section .song-row .title { color: var(--bl-ink); }
  .bl .song-section .song-row .artist { color: var(--bl-ink-soft); }

  .bl .footer { padding: 84px 24px 68px; background: var(--bl-red); text-align: center; }
  .bl .footer p { font-size: 14px; color: rgba(255,255,255,0.9); margin: 0 0 4px; }
  .bl .footer-signoff { font-family: var(--bl-font-display); font-size: 38px !important; font-weight: 700; color: #FFFFFF; margin: 24px 0 0; }
  .bl .footer-credit { font-family: var(--bl-font-sans); font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 24px; letter-spacing: 0.5px; }
  /* share / hashtag band (ShareSection) */
  .bl .share-band { padding: 84px 24px; background: var(--bl-sky); text-align: center; }
  .bl .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .bl .share-hashtag { font-family: var(--bl-font-display); font-size: clamp(28px, 4vw, 40px); color: var(--bl-blue); margin: 0 0 28px; font-weight: 800; overflow-wrap: anywhere; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryLabel: 'The guest of honor',
    howWeGotHere: 'A little bit about them',
    theDetails: 'Party info',
    dateAndLocation: 'Date & location',
    ceremony: 'Party time',
    reception: 'Location',
    theSchedule: 'What to expect',
    eventProgram: 'Party schedule',
    kindlyRespond: "Don't miss out",
    rsvp: 'RSVP',
    memoriesSoFar: 'Fun so far',
    ourMoments: 'Party moments',
    registry: 'Wish list',
    viewRegistry: 'View wish list',
    countingDown: 'Counting down to',
    untilWeSayIDo: 'Until the party starts',
    guestPhotos: 'Photo booth',
    shareYourPhoto: 'Share a photo',
    songRequests: 'Song requests',
    buildOurPlaylist: 'Build the playlist',
    noteForCouple: 'A wish for the celebration (optional)',
    noteForCouplePlaceholder: 'Can’t wait to celebrate with you!',
    getInTouch: 'Get in touch',
    questions: 'Questions?',
  },
  fr: {
    ourStoryLabel: "L'invité(e) d'honneur",
    howWeGotHere: 'Un peu à leur sujet',
    theDetails: 'Infos de la fête',
    dateAndLocation: 'Date et lieu',
    ceremony: "L'heure de la fête",
    reception: 'Lieu',
    theSchedule: "À quoi s'attendre",
    eventProgram: 'Programme de la fête',
    kindlyRespond: 'Ne manquez pas ça',
    rsvp: 'RSVP',
    memoriesSoFar: "Déjà de l'amusement",
    ourMoments: 'Moments de fête',
    registry: 'Liste de souhaits',
    viewRegistry: 'Voir la liste',
    countingDown: "Compte à rebours jusqu'à",
    untilWeSayIDo: 'Avant le début de la fête',
    guestPhotos: 'Photobooth',
    shareYourPhoto: 'Partager une photo',
    songRequests: 'Demandes de chansons',
    buildOurPlaylist: 'Composez la playlist',
    noteForCouple: 'Un voeu pour la célébration (facultatif)',
    noteForCouplePlaceholder: "J'ai hâte de célébrer avec vous!",
    getInTouch: 'Nous contacter',
    questions: 'Des questions?',
  },
  es: {
    ourStoryLabel: 'El homenajeado',
    howWeGotHere: 'Un poco sobre él/ella',
    theDetails: 'Información de la fiesta',
    dateAndLocation: 'Fecha y lugar',
    ceremony: 'Hora de la fiesta',
    reception: 'Ubicación',
    theSchedule: 'Qué esperar',
    eventProgram: 'Programa de la fiesta',
    kindlyRespond: 'No te lo pierdas',
    rsvp: 'RSVP',
    memoriesSoFar: 'La diversión hasta ahora',
    ourMoments: 'Momentos de la fiesta',
    registry: 'Lista de deseos',
    viewRegistry: 'Ver la lista',
    countingDown: 'Cuenta regresiva hasta',
    untilWeSayIDo: 'Hasta que comience la fiesta',
    guestPhotos: 'Photo booth',
    shareYourPhoto: 'Compartir una foto',
    songRequests: 'Solicitudes de canciones',
    buildOurPlaylist: 'Armar la playlist',
    noteForCouple: 'Un deseo para la celebración (opcional)',
    noteForCouplePlaceholder: '¡No puedo esperar para celebrar contigo!',
    getInTouch: 'Contacto',
    questions: '¿Preguntas?',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: "It's party time", fr: "C'est l'heure de la fête", es: 'Es hora de la fiesta' };

export default function Balloons({
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
    <div className="bl">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes={demo} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          bannerImage ? (
            isVideoUrl(bannerImage) ? (
              <video className="hero-bg" src={bannerImage} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...heroMediaStyle(heroObjectFit, heroObjectPosition), zIndex: 0 }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="hero-bg" src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...heroMediaStyle(heroObjectFit, heroObjectPosition), zIndex: 0 }} />
            )
          ) : null
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-balloons" src="/images/themes/balloons/hero-balloons.png" alt="" />
        <div className="hero-content">
          <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
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
              <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
              {editSlots?.description ?? (
                <p style={{ fontFamily: 'var(--bl-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--bl-ink-soft)', maxWidth: 560, margin: '0 auto' }}>
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
        <Reveal from="right">
          <div className="section section-center details-section">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="details-balloon-decor" src="/images/themes/balloons/single-balloon.png" alt="" />
            <div className="wrap-wide details-inner">
              <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 700 }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bl-blue)', textDecoration: 'none', fontWeight: 700 }}>{t.joinOnline}</a></p>
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
              <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--bl-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Reveal key={`custom-${section.position}`}>
          <div className="section section-center">
            <div className="wrap">
              <CustomSectionContent section={section} titleClassName="section-title" textStyle={{ fontFamily: 'var(--bl-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--bl-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <Reveal>
          <div className="section section-center">
            <div className="wrap">
              <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
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
          <div id="rsvp" className="rsvp-section">
            <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
            <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond} />
            <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
            <div className="rsvp-card">
              <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
            </div>
          </div>
        </Reveal>
      )}
      {/* POTLUCK (Plus, off by default) */}
      {isPaid && potluck && (
        <Reveal>
          <div id="potluck" className="rsvp-section">
            <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
            <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="eyebrow" fallback={t.potluckLabel} />
            <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
            <div className="rsvp-card">
              <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) */}
      {isPaid && giftExchange && (
        <Reveal>
          <div id="gift-exchange" className="rsvp-section">
            <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
            <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="eyebrow" fallback={t.giftLabel} />
            <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
            <div className="rsvp-card">
              <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
            <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.memoriesSoFar} />
            <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* WISH LIST (registry section, reframed) */}
      {(registryDescription || registryButtonLink) && (
        <Reveal>
          <div
            className="registry-wrap"
            // A solid coral by default; an uploaded registry image replaces it.
            style={registryImage ? { backgroundImage: `url(${registryImage})` } : { backgroundColor: '#F2454B' }}
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
              <SponsorGrid sponsors={sponsors} textStyle={{ color: 'var(--bl-ink-soft)' }} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <Reveal>
          <div id="photos" className="section section-center">
            <div className="wrap">
              <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
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
          <div className="song-section">
            <div className="wrap">
              <Confetti style={{ justifyContent: 'center', display: 'flex' }} />
              <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" fallback={t.buildOurPlaylist} />
              <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" fallback={t.songRequests} />
              <SongRequestSection
                userPageId={galleryToken}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn btn-blue"
                disabled={formsDisabled}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow" buttonClassName="btn btn-outline" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow on-dark" style={{ marginBottom: 14 }} fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title on-dark" style={{ marginBottom: 0 }} fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p style={{ marginTop: 18 }}>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove} ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
