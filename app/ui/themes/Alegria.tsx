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
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import type { GalleryImage } from '@/app/lib/definitions';

// Exclusive to Alegría — do not reuse these on other themes.
const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { id: 'al-default-1', user_page_id: 0, image_path: '/images/themes/alegria/celebration-1.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'al-default-2', user_page_id: 0, image_path: '/images/themes/alegria/celebration-2.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'al-default-3', user_page_id: 0, image_path: '/images/themes/alegria/celebration-3.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'al-default-4', user_page_id: 0, image_path: '/images/themes/alegria/celebration-4.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'al-default-5', user_page_id: 0, image_path: '/images/themes/alegria/celebration-5.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'al-default-6', user_page_id: 0, image_path: '/images/themes/alegria/celebration-6.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'al-default-7', user_page_id: 0, image_path: '/images/themes/alegria/celebration-7.png', image_name: '', image_type: 'image/png', created_at: '' },
  { id: 'al-default-8', user_page_id: 0, image_path: '/images/themes/alegria/celebration-8.png', image_name: '', image_type: 'image/png', created_at: '' },
];

const PALETTE: [string, string, string] = ['#E8A8B4', '#D8C3EE', '#D9A544'];

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#FFF8F3', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }} />
      ) : (
        <GradientHeroPlaceholder colors={PALETTE} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #D9A544', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '0.5px solid rgba(217,165,68,0.5)' }} />
        </div>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#B9808F', fontWeight: 600, margin: '0 0 10px' }}>Join us in celebrating</p>
        <h2 style={{ fontFamily: "'Parisienne', cursive", fontSize: 'clamp(28px, 5.5vw, 48px)', fontWeight: 400, color: '#4A2E3A', margin: '0 0 10px' }}>{heading || 'Her Quinceañera'}</h2>
        {date && <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#8A6B78', margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --al-blush: #F7D9DE;
    --al-blush-deep: #E8A8B4;
    --al-lilac: #E3D5F0;
    --al-lilac-deep: #B98FD1;
    --al-gold: #D9A544;
    --al-cream: #FFF8F3;
    --al-ink: #4A2E3A;
    --al-ink-soft: #8A6B78;
    --al-font-script: 'Parisienne', 'Brush Script MT', cursive;
    --al-font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
    --al-font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .al * { box-sizing: border-box; }
  .al { margin: 0; background: var(--al-cream); color: var(--al-ink); font-family: var(--al-font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .al img { max-width: 100%; }

  .al .al-rule { width: 46px; height: 1.5px; background: var(--al-gold); border: none; margin: 0 auto 22px; }
  .al .al-rule-right { margin: 0 0 22px auto; }
  .al .al-ring { width: 52px; height: 52px; border-radius: 50%; border: 1.5px solid var(--al-lilac-deep); margin: 0 auto 18px; background: radial-gradient(circle, rgba(216,195,238,0.5) 0%, transparent 70%); display: flex; align-items: center; justify-content: center; }
  .al .al-ring-right { margin: 0 0 18px auto; }
  .al .al-ring-inner { width: 34px; height: 34px; border-radius: 50%; border: 0.5px solid rgba(217,165,68,0.5); }

  .al .eyebrow { font-family: var(--al-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--al-blush-deep); font-weight: 600; margin: 0 0 12px; }
  /* Gold reads well on the hero's near-black scrim (see .hero-eyebrow below)
     but not against the blush-deep pink used by the countdown bar and
     footer — both "on-dark" contexts use white instead, like their
     sibling heading/value text already does. */
  .al .eyebrow.on-dark { color: #FFFFFF; }
  .al .section-title { font-family: var(--al-font-script); font-size: clamp(38px, 4.4vw, 58px); font-weight: 400; color: var(--al-blush-deep); margin: 0 0 20px; line-height: 1.2; }
  .al .section-title.on-dark { color: #FFFFFF; }

  .al .wrap { max-width: 740px; margin: 0 auto; padding: 0 28px; }
  .al .wrap-wide { max-width: 980px; margin: 0 auto; padding: 0 28px; }
  .al .section { padding: 84px 28px; }
  .al .section-center { text-align: center; }
  @media (max-width: 640px) { .al .section { padding: 60px 20px; } }

  .al .btn { font-family: var(--al-font-sans); font-size: 12px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; padding: 13px 30px; border-radius: 999px; border: 1.5px solid var(--al-blush-deep); background: var(--al-blush-deep); color: #FFFFFF; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .al .btn:hover { background: #D9909E; transform: translateY(-1px); }
  .al .btn-outline { background: transparent; color: var(--al-blush-deep); border-color: var(--al-blush-deep); }
  .al .btn-outline:hover { background: rgba(232,168,180,0.12); }
  .al .btn-gold { background: var(--al-gold); border-color: var(--al-gold); color: #fff; }
  .al .btn-gold:hover { background: #C4913A; }

  .al input, .al textarea, .al select { font-family: var(--al-font-sans); font-size: 15px; padding: 10px 0; border-radius: 0; border: none; border-bottom: 1.5px solid var(--al-blush); outline: none; background: transparent; color: var(--al-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .al input:focus, .al textarea:focus, .al select:focus { border-bottom-color: var(--al-blush-deep); }
  .al label.field-label { font-family: var(--al-font-sans); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--al-blush-deep); display: block; margin-bottom: 4px; font-weight: 600; }
  .al .radio-label, .al .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--al-ink); cursor: pointer; }
  .al .radio-label input, .al .check-label input { width: auto; border: none; border-bottom: none; padding: 0; accent-color: var(--al-blush-deep); }
  .al .check-hint { font-family: var(--al-font-sans); font-size: 12px; color: var(--al-ink-soft); margin: 4px 0 0; }
  .al .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .al .rsvp-error { color: #B25A4A; font-size: 13px; margin: 0; font-family: var(--al-font-sans); }
  .al .rsvp-success { text-align: center; padding: 16px 0; }
  .al .rsvp-headline { font-family: var(--al-font-script); font-size: 34px; color: var(--al-blush-deep); margin: 0 0 10px; font-weight: 400; }
  .al .rsvp-sub { font-size: 14px; color: var(--al-ink-soft); margin: 0; }
  .al .rsvp-form { display: flex; flex-direction: column; gap: 20px; }

  .al .hero { position: relative; min-height: 94vh; display: flex; align-items: center; justify-content: flex-end; text-align: right; padding: 72px 48px 88px; background: var(--al-cream); overflow: hidden; }
  .al .hero-bg-svg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  .al .hero-dots { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  .al .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.85; }
  /* Darker toward the right, where the text sits, so it reads clearly over
     a busy photo/video — left side stays lighter to still show the footage. */
  .al .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(43,26,34,0.1) 0%, rgba(43,26,34,0.55) 45%, rgba(43,26,34,0.8) 100%); z-index: 0; }
  .al .hero-content { position: relative; z-index: 1; max-width: 560px; margin: 0 0 0 auto; }
  @keyframes al-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  /* Hero sits over a dark scrim now, so these get the same on-dark
     treatment used elsewhere (footer, song section) instead of the
     light-on-light colors used on the cream sections below. */
  .al .hero-eyebrow { animation: al-rise 1s ease both; color: var(--al-gold); }
  .al .hero-name { animation: al-rise 1s ease 0.2s both; font-family: var(--al-font-script); font-size: clamp(56px, 9vw, 104px); font-weight: 400; color: #FFFFFF; margin: 0 0 26px; line-height: 0.95; text-shadow: 0 2px 24px rgba(0,0,0,0.35); }
  .al .hero-date { animation: al-rise 1s ease 0.4s both; font-family: var(--al-font-sans); font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.85); margin: 0 0 30px; }
  .al .hero-actions { animation: al-rise 1s ease 0.55s both; display: flex; gap: 14px; justify-content: flex-end; flex-wrap: wrap; }

  .al .countdown-wrap { padding: 68px 24px; background: var(--al-blush-deep); text-align: center; }
  .al .countdown-heading { font-family: var(--al-font-script); font-size: 50px; color: #fff; margin: 0 0 32px; font-weight: 400; }
  .al .countdown-row { display: flex; justify-content: center; gap: clamp(18px, 5vw, 48px); }
  .al .countdown-block { text-align: center; min-width: 56px; }
  .al .countdown-value { font-family: var(--al-font-script); font-size: clamp(34px, 5vw, 66px); color: #fff; font-weight: 400; line-height: 1; }
  .al .countdown-label { font-family: var(--al-font-sans); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-top: 8px; }

  .al .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 12px; }
  @media (max-width: 640px) { .al .details-grid { grid-template-columns: 1fr; } }
  .al .details-card { background: var(--al-blush); border-radius: 20px 4px 20px 4px; padding: 28px 26px; }
  .al .details-card .label { font-family: var(--al-font-sans); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--al-blush-deep); font-weight: 700; margin: 0 0 10px; }
  .al .details-card .time { font-family: var(--al-font-script); font-size: 32px; line-height: 1.2; color: var(--al-ink); }
  .al .details-card p { font-size: 14px; color: var(--al-ink-soft); margin: 0 0 3px; }
  .al .map-frame { border-radius: 20px 4px 20px 4px; overflow: hidden; min-height: 220px; border: 1px solid var(--al-blush); }
  .al .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; }
  .al .directions-link { text-align: center; margin-top: 18px; }
  .al .directions-link a { font-family: var(--al-font-sans); font-size: 13px; color: var(--al-blush-deep); font-weight: 600; text-decoration: none; }

  .al .schedule-day { max-width: 600px; margin: 0 auto 44px; }
  .al .schedule-day:last-child { margin-bottom: 0; }
  .al .schedule-day-title { font-family: var(--al-font-sans); font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--al-gold); font-weight: 600; margin: 0 0 18px; }
  .al .schedule-list { border-top: 1.5px solid var(--al-blush); text-align: left; }
  .al .schedule-row { display: flex; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--al-blush); align-items: baseline; }
  .al .schedule-time { font-family: var(--al-font-script); font-size: 21px; color: var(--al-blush-deep); min-width: 120px; flex-shrink: 0; }
  .al .schedule-info .name { font-family: var(--al-font-sans); font-size: 15px; color: var(--al-ink); font-weight: 600; margin: 0 0 3px; }
  .al .schedule-info .loc { font-family: var(--al-font-sans); font-size: 13px; color: var(--al-ink-soft); margin: 0; }

  .al .rsvp-section { background: var(--al-lilac); padding: 84px 28px; text-align: center; }
  .al .rsvp-card { max-width: 460px; margin: 0 auto; background: #FFFFFF; border-radius: 20px 4px 20px 4px; padding: 34px 30px; text-align: left; box-shadow: 0 4px 28px rgba(232,168,180,0.25); }

  .al .gallery-tile { overflow: hidden; border-radius: 16px 4px 16px 4px; border: 1px solid var(--al-blush); }

  .al .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .al .registry-overlay { background: rgba(74,46,58,0.6); padding: 48px 60px; text-align: center; border-radius: 4px; }
  .al .registry-title { font-family: var(--al-font-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--al-gold); margin: 0 0 14px; font-weight: 600; }
  .al .registry-description { font-size: 15px; color: rgba(255,255,255,0.9); margin: 0 0 24px; line-height: 1.6; max-width: 390px; }
  .al .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; border: 1.5px solid var(--al-gold); color: var(--al-gold); text-decoration: none; font-family: var(--al-font-sans); font-size: 12px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; transition: background 0.2s ease; }
  .al .registry-button:hover { background: rgba(217,165,68,0.15); }

  .al .song-section { background: var(--al-lilac); padding: 84px 28px; text-align: center; }
  .al .song-section .song-list { border-top: 1.5px solid rgba(74,46,58,0.15); max-width: 540px; margin: 0 auto; }
  .al .song-section .song-row { border-bottom: 1px solid rgba(74,46,58,0.1); padding: 10px 0; }
  .al .song-section .song-row .title { color: var(--al-ink); }
  .al .song-section .song-row .artist { color: var(--al-ink-soft); }

  .al .footer { padding: 84px 24px 68px; background: var(--al-blush-deep); text-align: center; }
  .al .footer p { font-size: 14px; color: rgba(255,255,255,0.85); margin: 0 0 4px; }
  .al .footer-rule { width: 40px; height: 1px; background: var(--al-gold); margin: 22px auto; border: none; }
  .al .footer-signoff { font-family: var(--al-font-script); font-size: 42px !important; font-weight: 400; color: #FFFFFF; margin: 0; }
  .al .footer-credit { font-family: var(--al-font-sans); font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 24px; letter-spacing: 0.5px; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

const OVERRIDES = {
  en: {
    ourStoryLabel: 'A little about her',
    howWeGotHere: 'Her story',
    eventProgram: 'Celebration schedule',
    noteForCouple: 'A note for the quinceañera',
    noteForCouplePlaceholder: 'Share your wishes for her big day…',
    registry: 'Gifts',
    viewRegistry: 'View gifts',
    untilWeSayIDo: 'Until the celebration begins',
  },
  fr: {
    ourStoryLabel: 'Un peu sur elle',
    howWeGotHere: 'Son histoire',
    eventProgram: 'Programme de la célébration',
    noteForCouple: 'Un mot pour la quinceañera',
    noteForCouplePlaceholder: 'Partagez vos voeux pour son grand jour…',
    registry: 'Cadeaux',
    viewRegistry: 'Voir les cadeaux',
    untilWeSayIDo: 'Avant le début de la célébration',
  },
  es: {
    ourStoryLabel: 'Un poco sobre ella',
    howWeGotHere: 'Su historia',
    eventProgram: 'Programa de la celebración',
    noteForCouple: 'Una nota para la quinceañera',
    noteForCouplePlaceholder: 'Comparte tus deseos para su gran día…',
    registry: 'Regalos',
    viewRegistry: 'Ver regalos',
    untilWeSayIDo: 'Hasta que comience la celebración',
  },
} satisfies Record<'en' | 'fr' | 'es', Partial<Translations>>;

const HERO_EYEBROW_DEFAULT = { en: 'Join us in celebrating', fr: 'Rejoignez-nous pour célébrer', es: 'Únete a la celebración' };

export default function Alegria({
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
    <div className="al">
      {/* Each theme needs its own distinct Google Font, loaded only when that theme is rendered —
          a shared root layout would force-load every theme's fonts on every page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Parisienne&family=Playfair+Display:ital,wght@0,500;1,500&display=swap" />
      <style>{css}</style>
      {!isPreview && <PreviewTopBar isLoggedIn={isLoggedIn} />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(bannerImage || HERO_DEFAULTS.alegria) ? (
            <video className="hero-bg" src={bannerImage || HERO_DEFAULTS.alegria} autoPlay muted loop playsInline style={{ objectFit: heroObjectFit }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage || HERO_DEFAULTS.alegria} alt="" style={{ objectFit: heroObjectFit }} />
          )
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="al-ring al-ring-right"><div className="al-ring-inner" /></div>
          {editSlots?.heroEyebrow ?? <p className="eyebrow hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || pickByLanguage(HERO_EYEBROW_DEFAULT, language)}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line' }}>{heading}</h1>}
          <hr className="al-rule al-rule-right" />
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
              <hr className="al-rule" />
              {editSlots?.description ?? (
                <p style={{ fontFamily: 'var(--al-font-sans)', fontSize: 17, lineHeight: 1.9, color: 'var(--al-ink-soft)', maxWidth: 560, margin: '0 auto' }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      )}

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
          <div className="section section-center">
            <div className="wrap-wide">
              <p className="eyebrow">{t.theDetails}</p>
              <h2 className="section-title">{t.dateAndLocation}</h2>
              <hr className="al-rule" />
              <div className="details-grid">
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 600 }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--al-blush-deep)', textDecoration: 'none', fontWeight: 600 }}>{t.joinOnline}</a></p>
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
              <hr className="al-rule" />
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
            <hr className="al-rule" />
            <div className="rsvp-card">
              <RsvpForm userPageId={userPageId} translations={t} disabled={isPreview} />
            </div>
          </div>
        </Reveal>
      )}

      {/* GALLERY — shows the theme's own sample photos until the owner
          uploads real ones, so the section is never empty. */}
      <Reveal>
        <div className="section section-center">
          <div className="wrap-wide">
            <p className="eyebrow">{t.memoriesSoFar}</p>
            <h2 className="section-title">{t.ourMoments}</h2>
            <hr className="al-rule" />
            {editSlots?.gallery ?? <GalleryGrid images={galleryImages?.length ? galleryImages : DEFAULT_GALLERY_IMAGES} />}
          </div>
        </div>
      </Reveal>

      {/* GIFTS (registry section, reframed) */}
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
              <hr className="al-rule" />
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
              <hr className="al-rule" />
              <SongRequestSection
                userPageId={galleryToken}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn btn-gold"
                disabled={isPreview}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p className="eyebrow on-dark" style={{ marginBottom: 14 }}>{t.questions}</p>
        <h2 className="section-title on-dark" style={{ marginBottom: 14 }}>{t.getInTouch}</h2>
        {editSlots?.footerContact ?? (
          <>
            {heading && <p>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <hr className="footer-rule" />
        <p className="footer-signoff">{t.withLove} {heading || t.theCouple}</p>
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
