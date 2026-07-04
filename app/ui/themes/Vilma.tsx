import type { ThemeProps, ThemePreviewProps } from './types';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import VilmaCountdown from './VilmaCountdown';
import { getTranslations, localizeDate } from '@/app/lib/translations';

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#FFFFFF', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="vl-p-g1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d2c3d6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#d2c3d6" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="vl-p-g2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f4e3b5" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#f4e3b5" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="600" cy="200" rx="520" ry="200" fill="url(#vl-p-g1)"/>
        <ellipse cx="600" cy="200" rx="320" ry="160" fill="url(#vl-p-g2)"/>
        <circle cx="180" cy="70" r="4" fill="#f8ac4c" opacity="0.5"/>
        <circle cx="1020" cy="90" r="3" fill="#f8ac4c" opacity="0.45"/>
        <circle cx="90" cy="310" r="5" fill="#d2c3d6" opacity="0.55"/>
        <circle cx="1110" cy="330" r="4" fill="#92946f" opacity="0.4"/>
      </svg>
      {bannerImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.14 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #d2c3d6', background: 'radial-gradient(circle, rgba(244,227,181,0.5) 0%, transparent 70%)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', border: '0.5px solid rgba(248,172,76,0.4)' }} />
        </div>
        <p style={{ fontSize: 10, letterSpacing: 3.5, textTransform: 'uppercase', color: '#92946f', fontWeight: 600, margin: '0 0 10px', fontFamily: 'system-ui, sans-serif' }}>Together with their families</p>
        <h2 style={{ fontFamily: "'bickham-script-pro-3', Georgia, cursive", fontSize: 'clamp(22px, 5vw, 44px)', fontWeight: 400, color: '#8c9eac', margin: '0 0 10px', lineHeight: 1.1 }}>{heading || 'Your Event Name'}</h2>
        <div style={{ width: 36, height: 1.5, background: '#f8ac4c', margin: '0 auto 10px', border: 'none' }} />
        {date && <p style={{ fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: '#92946f', margin: 0, fontFamily: 'system-ui, sans-serif' }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  .vl * { box-sizing: border-box; }
  .vl {
    margin: 0; background: #FFFFFF; color: #3a3830;
    font-family: 'adobe-caslon-pro', 'Adobe Caslon Pro', Georgia, 'Times New Roman', serif;
    overflow-x: hidden; -webkit-font-smoothing: antialiased;
    --vl-steel: #8c9eac; --vl-steel-deep: #6b808f;
    --vl-olive: #92946f; --vl-olive-deep: #6e7054;
    --vl-mist: #e8e7e2; --vl-butter: #f4e3b5;
    --vl-lilac: #d2c3d6; --vl-amber: #f8ac4c;
    --vl-ink: #3a3830; --vl-ink-soft: #6b6658;
    --vl-script: 'bickham-script-pro-3', 'Bickham Script Pro 3', Georgia, cursive;
    --vl-serif: 'adobe-caslon-pro', 'Adobe Caslon Pro', Georgia, 'Times New Roman', serif;
    --vl-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .vl img { max-width: 100%; }

  .vl .vl-rule { width: 48px; height: 1.5px; background: var(--vl-amber); border: none; margin: 0 auto 24px; }
  .vl .vl-rule-left { margin-left: 0; }
  .vl .vl-ring { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid var(--vl-lilac); margin: 0 auto 20px; background: radial-gradient(circle, rgba(244,227,181,0.5) 0%, transparent 70%); display: flex; align-items: center; justify-content: center; }
  .vl .vl-ring-inner { width: 38px; height: 38px; border-radius: 50%; border: 0.5px solid rgba(248,172,76,0.4); }

  .vl .eyebrow { font-family: var(--vl-sans); font-size: 11px; letter-spacing: 3.5px; text-transform: uppercase; color: var(--vl-olive); font-weight: 600; margin: 0 0 12px; }
  .vl .eyebrow.on-dark { color: rgba(255,255,255,0.65); }
  .vl .section-title { font-family: var(--vl-script); font-size: clamp(42px, 4.5vw, 64px); font-weight: 400; color: var(--vl-steel); margin: 0 0 20px; line-height: 1.2; letter-spacing: 0.5px; }
  .vl .section-title.on-dark { color: #FFFFFF; }
  .vl .section-title.on-butter { color: var(--vl-olive-deep); }

  .vl .wrap { max-width: 760px; margin: 0 auto; padding: 0 28px; }
  .vl .wrap-wide { max-width: 1000px; margin: 0 auto; padding: 0 28px; }
  .vl .section { padding: 88px 28px; }
  .vl .section-center { text-align: center; }
  @media (max-width: 640px) { .vl .section { padding: 60px 20px; } }

  .vl .btn { font-family: var(--vl-sans); font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 13px 30px; border-radius: 999px; border: 1.5px solid var(--vl-steel); background: var(--vl-steel); color: #FFFFFF; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .vl .btn:hover { background: var(--vl-steel-deep); transform: translateY(-1px); }
  .vl .btn:active { transform: scale(0.98); }
  .vl .btn-outline { background: transparent; color: var(--vl-olive); border-color: var(--vl-olive); }
  .vl .btn-outline:hover { background: rgba(146,148,111,0.1); }
  .vl .btn-amber { background: var(--vl-amber); border-color: var(--vl-amber); color: var(--vl-ink); }
  .vl .btn-amber:hover { background: #e09932; border-color: #e09932; }

  .vl input, .vl textarea, .vl select { font-family: var(--vl-serif); font-size: 15px; padding: 10px 0; border-radius: 0; border: none; border-bottom: 1.5px solid var(--vl-mist); outline: none; background: transparent; color: var(--vl-ink); width: 100%; display: block; transition: border-color 0.2s ease; }
  .vl input:focus, .vl textarea:focus, .vl select:focus { border-bottom-color: var(--vl-steel); }
  .vl label.field-label { font-family: var(--vl-sans); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--vl-olive); display: block; margin-bottom: 4px; font-weight: 600; }
  .vl .radio-label, .vl .check-label { display: flex; align-items: center; gap: 8px; font-size: 15px; color: var(--vl-ink); cursor: pointer; }
  .vl .radio-label input, .vl .check-label input { width: auto; border: none; border-bottom: none; padding: 0; accent-color: var(--vl-steel); }
  .vl .check-hint { font-family: var(--vl-sans); font-size: 12px; color: var(--vl-olive); margin: 4px 0 0; }
  .vl .attend-options { display: flex; gap: 20px; margin-top: 8px; flex-wrap: wrap; }
  .vl .rsvp-error { color: #b25a4a; font-size: 13px; margin: 0; font-family: var(--vl-sans); }
  .vl .rsvp-success { text-align: center; padding: 16px 0; }
  .vl .rsvp-headline { font-family: var(--vl-script); font-size: 33px; color: var(--vl-steel); margin: 0 0 10px; font-weight: 400; }
  .vl .rsvp-sub { font-size: 14px; color: var(--vl-ink-soft); margin: 0; }
  .vl .rsvp-form { display: flex; flex-direction: column; gap: 20px; }

  .vl .hero { position: relative; min-height: 95vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 72px 24px 88px; background: #FFFFFF; overflow: hidden; }
  .vl .hero-watercolour { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  .vl .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.8; border-bottom: 1px solid var(--vl-olive); }
  .vl .hero-content { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; }
  @keyframes vl-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .vl .hero-eyebrow { animation: vl-rise 1s ease both; }
  .vl .hero-name { animation: vl-rise 1s ease 0.2s both; font-family: var(--vl-script); font-size: clamp(60px, 9.5vw, 110px); font-weight: 400; color: var(--vl-steel); margin: 0 0 30px; line-height: 0.8; }
  .vl .hero-date { animation: vl-rise 1s ease 0.4s both; font-family: var(--vl-sans); font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--vl-olive); margin: 0 0 30px; }
  .vl .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

  .vl .countdown-wrap { padding: 72px 24px; background: var(--vl-steel); text-align: center; }
  .vl .countdown-heading { font-family: var(--vl-script); font-size: 39px; letter-spacing: 0.5px; color: #FFFFFF; margin: 0 0 36px; font-weight: 400; }
  .vl .countdown-row { display: flex; justify-content: center; gap: clamp(20px, 6vw, 52px); }
  .vl .countdown-block { text-align: center; min-width: 60px; }
  .vl .countdown-value { font-family: var(--vl-script); font-size: clamp(37px, 5.5vw, 55px); color: var(--vl-butter); font-weight: 400; line-height: 1; }
  .vl .countdown-label { font-family: var(--vl-sans); font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,0.65); margin-top: 8px; }

  .vl .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 12px; }
  @media (max-width: 640px) { .vl .details-grid { grid-template-columns: 1fr; } }
  .vl .details-card { background: var(--vl-mist); border-radius: 4px 20px 4px 20px; padding: 28px 26px; }
  .vl .details-card .label { font-family: var(--vl-sans); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--vl-olive); font-weight: 600; margin: 0 0 10px; }
  .vl .details-card .time { font-family: var(--vl-script); font-size: 33px; line-height: 1.2; margin: 0 0 6px; }
  .vl .details-card p { font-size: 14px; color: var(--vl-ink-soft); margin: 0 0 3px; }
  .vl .map-frame { border-radius: 4px 20px 4px 20px; overflow: hidden; min-height: 220px; border: 1px solid var(--vl-mist); }
  .vl .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; filter: saturate(0.7) sepia(5%); }
  .vl .directions-link { text-align: center; margin-top: 18px; }
  .vl .directions-link a { font-family: var(--vl-sans); font-size: 13px; color: var(--vl-steel); font-weight: 600; text-decoration: none; letter-spacing: 0.5px; }

  .vl .rsvp-section { background: var(--vl-butter); padding: 88px 28px; text-align: center; }
  .vl .rsvp-card { max-width: 460px; margin: 0 auto; background: #FFFFFF; border-radius: 4px 20px 4px 20px; padding: 36px 32px; border: 1px solid rgba(146,148,111,0.22); box-shadow: 0 4px 28px rgba(140,158,172,0.1); text-align: left; }

  .vl .gallery-tile { overflow: hidden; border-radius: 4px 14px 4px 14px; border: 1px solid var(--vl-mist); }

  .vl .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .vl .registry-overlay { background: rgba(58,56,48,0.65); padding: 48px 64px; text-align: center; border-radius: 4px; }
  .vl .registry-title { font-family: var(--vl-sans); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--vl-butter); margin: 0 0 14px; font-weight: 600; }
  .vl .registry-description { font-size: 15px; color: rgba(255,255,255,0.85); margin: 0 0 24px; line-height: 1.6; max-width: 400px; }
  .vl .registry-button { display: inline-block; padding: 13px 30px; border-radius: 999px; border: 1.5px solid var(--vl-butter); color: var(--vl-butter); text-decoration: none; font-family: var(--vl-sans); font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; transition: background 0.2s ease; line-height: 1; }
  .vl .registry-button:hover { background: rgba(244,227,181,0.15); }

  .vl .song-section { background: var(--vl-steel); padding: 88px 28px; text-align: center; }
  .vl .song-section .song-list { border-top: 1.5px solid rgba(255,255,255,0.25); max-width: 560px; margin: 0 auto; }
  .vl .song-section .song-row { border-bottom: 1px solid rgba(255,255,255,0.15); }
  .vl .song-section .song-row .title { color: #FFFFFF; }
  .vl .song-section .song-row .artist { color: rgba(255,255,255,0.7); }
  .vl .song-section input::placeholder { color: rgba(255,255,255,0.55); }
  .vl .song-section input:focus { border-color: var(--vl-butter); }

  .vl .footer { padding: 88px 24px 72px; background: var(--vl-olive-deep); text-align: center; }
  .vl .footer p { font-size: 14px; color: rgba(255,255,255,0.75); margin: 0 0 4px; }
  .vl .footer-rule { width: 40px; height: 1px; background: var(--vl-butter); margin: 22px auto; border: none; }
  .vl .footer-signoff { font-family: var(--vl-script); font-size: 33px !important; font-weight: 400; color: var(--vl-butter); margin: 0; letter-spacing: 0.5px; }
  .vl .footer-credit { font-family: var(--vl-sans); font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 24px; letter-spacing: 0.5px; }
`;

function formatDate(dateStr: string, city?: string, country?: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

function formatDateLong(dateStr: string, locale = 'en-US'): string {
  return localizeDate(dateStr, locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Vilma({
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
}: ThemeProps) {
  const t = getTranslations(language);
  const heroDateText = eventDate ? formatDate(eventDate, city, country) : '';

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
    <div className="vl">
      {/* Typekit fonts */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <link rel="stylesheet" href="https://use.typekit.net/ufj0hfm.css" />
      <style>{css}</style>

      {/* HERO */}
      <div className="hero">
        {/* Watercolour wash */}
        <svg className="hero-watercolour" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id="vl-g1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d2c3d6" stopOpacity="0.38"/>
              <stop offset="100%" stopColor="#d2c3d6" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="vl-g2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f4e3b5" stopOpacity="0.42"/>
              <stop offset="100%" stopColor="#f4e3b5" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="vl-g3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8c9eac" stopOpacity="0.14"/>
              <stop offset="100%" stopColor="#8c9eac" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <ellipse cx="800" cy="500" rx="600" ry="490" fill="url(#vl-g1)"/>
          <ellipse cx="800" cy="500" rx="370" ry="310" fill="url(#vl-g2)"/>
          <ellipse cx="800" cy="500" rx="210" ry="180" fill="url(#vl-g3)"/>
        </svg>

        {editSlots?.heroBg ?? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero-bg" src={bannerImage || '/images/themes/vilma/hero-bg.jpg'} alt="" style={{ objectFit: heroObjectFit }} />
        )}

        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="eyebrow hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || 'Together with their families'}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line' }}>{heading}</h1>}
          <hr className="vl-rule" />
          {heroDateText && (editSlots?.heroDate ?? <p className="hero-date">{heroDateText}</p>)}
          <div className="hero-actions">
            <a href="#rsvp" className="btn">{t.rsvpBtn}</a>
            <a href="#story" className="btn btn-outline">{t.ourStoryBtn}</a>
          </div>
        </div>
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <div id="story" className="section section-center">
          <div className="wrap">
            <p className="eyebrow">{t.ourStoryLabel}</p>
            <h2 className="section-title">{t.howWeGotHere}</h2>
            <hr className="vl-rule" />
            {editSlots?.description ?? (
              <p style={{ fontFamily: 'var(--vl-serif)', fontSize: 17, lineHeight: 1.9, color: 'var(--vl-ink-soft)', maxWidth: 580, margin: '0 auto' }}>
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {eventDate && !editSlots && (
        <VilmaCountdown eventDate={eventDate} eventTime={eventTime} translations={t} />
      )}

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <div className="section section-center">
          <div className="wrap-wide">
            <p className="eyebrow">{t.theDetails}</p>
            <h2 className="section-title">{t.dateAndLocation}</h2>
            <hr className="vl-rule" />
            <div className="details-grid">
              <div className="details-card">
                <p className="label">{t.ceremony}</p>
                {formattedTime && <p className="time">{formattedTime}</p>}
                {eventDate && <p>{formatDateLong(eventDate, t.dateLocale)}</p>}
                {venueName && <p style={{ fontWeight: 500 }}>{venueName}</p>}
                {streetAddress && <p>{streetAddress}</p>}
                {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                {showVirtual && (
                  <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--vl-steel)', textDecoration: 'none', fontWeight: 600 }}>{t.joinOnline}</a></p>
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
      )}

      {/* RSVP */}
      {!editSlots && (
        <div id="rsvp" className="rsvp-section">
          <p className="eyebrow">{t.kindlyRespond}</p>
          <h2 className="section-title on-butter">{t.rsvp}</h2>
          <hr className="vl-rule" />
          <div className="rsvp-card">
            <RsvpForm userPageId={userPageId} translations={t} />
          </div>
        </div>
      )}

      {/* GALLERY */}
      {(() => {
        const content = editSlots?.gallery ?? (galleryImages?.length ? <GalleryGrid images={galleryImages} /> : null);
        return content ? (
          <div className="section section-center">
            <div className="wrap-wide">
              <p className="eyebrow">{t.memoriesSoFar}</p>
              <h2 className="section-title">{t.ourMoments}</h2>
              <hr className="vl-rule" />
              {content}
            </div>
          </div>
        ) : null;
      })()}

      {/* REGISTRY */}
      {(registryImage || registryDescription) && (
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
      )}

      {/* GUEST PHOTOS */}
      {isPaid && userPageId && (
        <div className="section section-center">
          <div className="wrap">
            <p className="eyebrow">{t.guestPhotos}</p>
            <h2 className="section-title">{t.shareYourPhoto}</h2>
            <hr className="vl-rule" />
            <GuestPhotoSection
              userPageId={userPageId}
              initialPhotos={guestPhotos ?? []}
              initialHasMore={guestPhotosHasMore ?? false}
              labels={{ shareYourPhoto: t.shareYourPhoto, loadMore: t.loadMore, beFirstToShare: t.beFirstToShare, photoUploaded: t.photoUploaded, photoUploadError: t.photoUploadError, uploading: t.sending }}
              btnClassName="btn"
            />
          </div>
        </div>
      )}

      {/* SONG REQUESTS */}
      {isPaid && userPageId && (
        <div className="song-section">
          <div className="wrap">
            <p className="eyebrow on-dark">{t.buildOurPlaylist}</p>
            <h2 className="section-title on-dark">{t.songRequests}</h2>
            <hr className="vl-rule" />
            <SongRequestSection
              userPageId={userPageId}
              initialSongs={guestSongs ?? []}
              initialHasMore={guestSongsHasMore ?? false}
              labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
              btnClassName="btn btn-amber"
              inputStyle={{ flex: '2 1 160px', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'var(--vl-steel)', color: '#FFFFFF', outline: 'none' }}
            />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p className="eyebrow on-dark" style={{ marginBottom: 14 }}>{t.questions}</p>
        {eventDate && <p>{formatDateLong(eventDate, t.dateLocale)}</p>}
        {city && <p>{[city, country].filter(Boolean).join(', ')}</p>}
        {editSlots?.footerContact ?? (
          <>
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <hr className="footer-rule" />
        <p className="footer-signoff">{t.withLove}, {heading || t.theCouple}</p>
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
