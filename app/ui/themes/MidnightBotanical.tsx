import type { ThemeProps, ThemePreviewProps } from './types';
import { GalleryGrid } from './GallerySection';
import RsvpForm from './RsvpForm';

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ').toUpperCase();
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#0F1F1A', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {bannerImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, border: '1px solid #8C7440', padding: '28px 48px', background: 'rgba(30,58,46,0.6)', maxWidth: 380 }}>
        <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#C9A75D', margin: '0 0 10px', fontWeight: 600 }}>Save the date</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 500, color: '#F2EAD3', margin: '0 0 10px', lineHeight: 1.1 }}>{heading || 'Your Event Name'}</h2>
        <div style={{ width: 22, height: 1, background: '#C9A75D', margin: '0 auto 10px' }} />
        {date && <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#C9C0A0', margin: 0 }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --ink-black: #0F1F1A;
    --ink: #14241E;
    --forest: #1E3A2E;
    --moss: #3C5C46;
    --gold: #C9A75D;
    --gold-dim: #8C7440;
    --parchment: #F2EAD3;
    --parchment-soft: #C9C0A0;
    --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-serif: Georgia, 'Times New Roman', serif;
  }
  .mb * { box-sizing: border-box; }
  .mb { margin: 0; background: #fff; color: var(--ink); font-family: var(--font-sans); overflow-x: hidden; }
  .mb img { max-width: 100%; }
  .mb .spine-section { position: relative; padding: 80px 24px 80px 56px; max-width: 760px; margin: 0 auto; }
  .mb .spine-section::before { content: ""; position: absolute; left: 16px; top: 24px; bottom: 24px; width: 1px; background: linear-gradient(to bottom, transparent, var(--gold) 15%, var(--gold) 85%, transparent); }
  .mb .spine-section.align-right { text-align: right; padding: 80px 56px 80px 24px; }
  .mb .spine-section.align-right::before { left: auto; right: 16px; }
  .mb .spine-section.wide { max-width: 1000px; }
  @media (max-width: 640px) {
    .mb .spine-section, .mb .spine-section.align-right { padding: 60px 24px 60px 40px; text-align: left; }
    .mb .spine-section.align-right::before { left: 16px; right: auto; }
  }
  .mb .eyebrow { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold-dim); font-weight: 600; margin: 0 0 12px; }
  .mb .eyebrow.on-dark { color: var(--gold); }
  .mb .title { font-family: var(--font-serif); font-style: italic; font-size: clamp(26px, 3.6vw, 36px); font-weight: 500; color: var(--ink); margin: 0 0 24px; letter-spacing: 0.2px; }
  .mb .title.on-dark { color: var(--parchment); }
  .mb .btn { font-family: var(--font-sans); font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 13px 30px; border-radius: 2px; border: 1px solid var(--gold); background: var(--gold); color: var(--ink-black); cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1;}
  .mb .btn:hover { background: #D9B96E; transform: translateY(-1px); }
  .mb .btn-outline { background: transparent; color: var(--gold); }
  .mb .btn-outline:hover { background: rgba(201, 167, 93, 0.12); }
  .mb .hero { position: relative; min-height: 95vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 60px 24px; background: var(--ink-black); overflow: hidden; }
  .mb .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; object-fit: cover; }
  .mb .hero-content { position: relative; z-index: 1; }
  .mb .hero-frame { border: 1px solid var(--gold-dim); padding: 56px 48px; max-width: 480px; background: rgba(30, 58, 46, 0.6); }
  @media (max-width: 640px) { .mb .hero-frame { padding: 40px 24px; } }
  @keyframes mb-fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .mb .hero-eyebrow { animation: mb-fadeIn 1.2s ease both; }
  .mb .hero-name { animation: mb-fadeIn 1.2s ease 0.3s both; font-family: var(--font-serif); font-style: italic; font-size: clamp(38px, 7vw, 64px); font-weight: 500; color: var(--parchment); margin: 0 0 16px; line-height: 1.1; }
  .mb .hero-rule { width: 28px; height: 1px; background: var(--gold); margin: 0 auto 16px; }
  .mb .hero-date { animation: mb-fadeIn 1.2s ease 0.6s both; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: var(--parchment-soft); margin: 0 0 28px; }
  .mb .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .mb .countdown-wrap { padding: 70px 24px; background: var(--forest); text-align: center; }
  .mb .countdown-heading { font-family: var(--font-serif); font-style: italic; font-size: 22px; color: var(--parchment); margin: 0 0 36px; font-weight: 500; }
  .mb .countdown-row { display: flex; justify-content: center; gap: clamp(20px, 6vw, 48px); }
  .mb .countdown-block { text-align: center; min-width: 60px; }
  .mb .countdown-value { font-family: var(--font-serif); font-size: clamp(26px, 4.5vw, 40px); color: var(--gold); font-weight: 500; line-height: 1; }
  .mb .countdown-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--parchment-soft); margin-top: 8px; }
  .mb .details-row { display: flex; flex-direction: column; gap: 20px; margin-top: 8px; }
  .mb .details-card { border: 1px solid var(--parchment-soft); padding: 26px 30px; max-width: 460px; }
  .mb .details-card.self-end { align-self: flex-end; text-align: right; border-color: var(--gold-dim); }
  .mb .details-card .label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold-dim); font-weight: 600; margin: 0 0 10px; }
  .mb .details-card .time { font-family: var(--font-serif); font-style: italic; font-size: 22px; margin: 0 0 8px; color: var(--ink); }
  .mb .details-card p { font-size: 14px; color: var(--moss); margin: 0 0 3px; }
  .mb .map-frame { border: 1px solid var(--parchment-soft); overflow: hidden; min-height: 220px; margin-top: 24px; }
  .mb .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 220px; filter: grayscale(20%); }
  .mb .directions-link { margin-top: 18px; }
  .mb .directions-link a { font-size: 13px; letter-spacing: 1px; color: var(--moss); font-weight: 600; text-decoration: none; }
  .mb .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .mb .registry-overlay { background: rgba(15, 31, 26, 0.7); padding: 48px 64px; text-align: center; border: 1px solid var(--gold-dim); }
  .mb .registry-title { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin: 0 0 14px; font-weight: 600; }
  .mb .registry-description { font-size: 14px; color: var(--parchment-soft); margin: 0 0 24px; line-height: 1.6; max-width: 360px; }
  .mb .registry-button { display: inline-block; padding: 12px 28px; border: 1px solid var(--gold); color: var(--gold); text-decoration: none; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; transition: background 0.2s ease; }
  .mb .registry-button:hover { background: rgba(201, 167, 93, 0.15); }
  .mb .footer { padding: 80px 24px 70px; background: var(--ink-black); text-align: center; }
  .mb .footer p { font-size: 14px; color: var(--parchment-soft); margin: 0 0 4px; }
  .mb .footer-rule { width: 28px; height: 1px; background: var(--gold); margin: 22px auto; }
  .mb .footer-signoff { font-family: var(--font-serif); font-style: italic; font-size: 14px; color: var(--gold); letter-spacing: 0.5px; margin: 0; }
  .mb .footer-credit { font-size: 11px; color: var(--parchment-soft); opacity: 0.5; margin-top: 24px; }
  .mb input, .mb textarea, .mb select { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--gold-dim); padding: 10px 0; font-size: 15px; color: var(--ink); font-family: var(--font-sans); outline: none; border-radius: 0; appearance: none; display: block; }
  .mb input:focus, .mb textarea:focus, .mb select:focus { border-bottom-color: var(--gold); }
  .mb .field-label { font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold-dim); display: block; margin-bottom: 4px; font-weight: 600; }
  .mb .rsvp-form { display: flex; flex-direction: column; gap: 20px; max-width: 440px; }
  .mb .attend-options { display: flex; gap: 24px; margin-top: 8px; flex-wrap: wrap; }
  .mb .radio-label, .mb .check-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--ink); cursor: pointer; }
  .mb .radio-label input, .mb .check-label input { width: auto; border: none; border-bottom: none; padding: 0; accent-color: var(--gold); }
  .mb .check-hint { font-size: 12px; color: var(--moss); margin: 4px 0 0; }
  .mb .rsvp-error { color: #B25A4A; font-size: 13px; margin: 0; }
  .mb .rsvp-success { padding: 12px 0; }
  .mb .rsvp-headline { font-family: var(--font-serif); font-style: italic; font-size: 20px; color: var(--ink); margin: 0 0 8px; }
  .mb .rsvp-sub { font-size: 14px; color: var(--moss); margin: 0; }
`;

function formatDate(dateStr: string, city?: string, country?: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const formatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const loc = [city, country].filter(Boolean).join(', ').toUpperCase();
  return loc ? `${formatted} · ${loc}` : formatted;
}

export default function MidnightBotanical({
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
}: ThemeProps) {
  const heroDate = eventDate ? formatDate(eventDate, city, country) : '';

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

  const heroImg = bannerImage || '/images/themes/midnight-botanical/woods.png';

  const showVenue = location === 'address';
  const showVirtual = location === 'virtual' && url;

  return (
    <div className="mb">
      <style>{css}</style>

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero-bg" src={heroImg} alt="" />
        )}
        <div className="hero-content">
          <div className="hero-frame">
            {editSlots?.heroEyebrow ?? <p className="eyebrow on-dark hero-eyebrow">{heroEyebrow || 'Save the date'}</p>}
            {editSlots?.heroName ?? <h1 className="hero-name">{heading}</h1>}
            <div className="hero-rule" />
            {heroDate && (editSlots?.heroDate ?? <p className="hero-date">{heroDate}</p>)}
            <div className="hero-actions">
              <a href="#rsvp" className="btn">RSVP</a>
              <a href="#story" className="btn btn-outline">Our story</a>
            </div>
          </div>
        </div>
      </div>

      {/* STORY */}
      {(description || editSlots?.description) && (
        <div id="story" className="spine-section">
          <p className="eyebrow">Our story</p>
          <h2 className="title">How we got here</h2>
          {editSlots?.description ?? (
            <p style={{ fontSize: 16, lineHeight: 1.85, color: 'var(--moss)', margin: 0 }}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <div className="spine-section align-right wide">
          <p className="eyebrow">The details</p>
          <h2 className="title">Date &amp; location</h2>
          <div className="details-row">
            {eventDate && (
              <div className="details-card">
                <p className="label">Ceremony</p>
                {formattedTime && <p className="time">{formattedTime}</p>}
                {eventDate && <p>{new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                {venueName && <p style={{ fontWeight: 500 }}>{venueName}</p>}
                {streetAddress && <p>{streetAddress}</p>}
                {city && <p style={{ fontSize: 13, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
              </div>
            )}
            {showVirtual && (
              <div className="details-card">
                <p className="label">Virtual Event</p>
                <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Join Online →</a></p>
              </div>
            )}
          </div>
          {mapSrc && (
            <div className="map-frame">
              <iframe
                src={mapSrc}
                width="600"
                height="450"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          {mapsUrl && (
            <div className="directions-link">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Get directions →</a>
            </div>
          )}
        </div>
      )}

      {/* RSVP */}
      {!editSlots && (
        <div id="rsvp" className="spine-section">
          <p className="eyebrow">Kindly respond</p>
          <h2 className="title">RSVP</h2>
          <RsvpForm userPageId={userPageId} />
        </div>
      )}

      {/* GALLERY */}
      {(() => {
        const content = editSlots?.gallery ?? (galleryImages?.length ? <GalleryGrid images={galleryImages} /> : null);
        return content ? (
          <div className="spine-section wide">
            <p className="eyebrow">Gallery</p>
            <h2 className="title">Our moments</h2>
            {content}
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
            <p className="registry-title">Registry</p>
            {registryDescription && <p className="registry-description">{registryDescription}</p>}
            {registryButtonLink && (
              <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                {registryButtonText || 'View Registry'}
              </a>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        {eventDate && <p>{new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
        {city && <p>{[city, country].filter(Boolean).join(', ')}</p>}
        <div className="footer-rule" />
        {userEmail && <p className="footer-signoff"><a href={`mailto:${userEmail}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{userEmail}</a></p>}
        <p className="footer-credit">made with mygala</p>
      </footer>
    </div>
  );
}
