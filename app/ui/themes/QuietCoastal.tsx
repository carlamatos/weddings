import type { ThemeProps, ThemePreviewProps } from './types';
import { HERO_DEFAULTS } from './hero-defaults';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import { getTranslations } from '@/app/lib/translations';
import { eventWhen, formatDateRange } from './event-when';
import ShareSection from './ShareSection';
import { SectionText } from './section-text';
import { CustomSectionContent, SponsorGrid } from './PlusSections';
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ').toLowerCase();
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase(), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#F4F1EA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {bannerImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.8)', padding: '28px 56px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'lowercase', color: '#5C6B61', fontWeight: 500, margin: '0 0 12px' }}>together with their families</p>
        <h2 style={{ fontFamily: "'Helvetica Neue', system-ui, sans-serif", fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 400, color: '#3F4A45', margin: '0 0 12px', letterSpacing: -1, lineHeight: 1 }}>{heading || 'Your Event Name'}</h2>
        {date && <p style={{ fontSize: 11, letterSpacing: 2, color: '#7C8B86', margin: 0, textTransform: 'lowercase' }}>{date}</p>}
      </div>
    </div>
  );
}

const css = `
  :root {
    --sage: #8C9A93;
    --sage-deep: #5C6B61;
    --sand: #DCD4C0;
    --chalk: #F4F1EA;
    --slate: #C8D2D6;
    --ink: #3F4A45;
    --ink-soft: #7C8B86;
    --font-sans: 'Helvetica Neue', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .qc * { box-sizing: border-box; }
  .qc { margin: 0; background: #fff; color: var(--ink); font-family: var(--font-sans); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .qc img { max-width: 100%; }
  .qc .hairline { width: 100%; height: 1px; background: var(--slate); border: none; margin: 0; }
  .qc .eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: lowercase; color: var(--sage-deep); font-weight: 500; margin: 0 0 18px; }
  .qc .title { font-family: var(--font-sans); font-size: clamp(26px, 3.4vw, 34px); font-weight: 500; color: var(--ink); margin: 0 0 32px; letter-spacing: -0.5px; }
  .qc .wrap { max-width: 1040px; margin: 0 auto; padding: 0 32px; }
  .qc .section { padding: 110px 0; }
  .qc .section-tight { padding: 80px 0; }
  .qc .split { display: grid; grid-template-columns: 2fr 1fr; gap: 64px; align-items: start; }
  .qc .split.reverse { grid-template-columns: 1fr 2fr; }
  .qc .split.reverse .col-wide { order: 2; }
  .qc .split.reverse .col-narrow { order: 1; }
  @media (max-width: 800px) {
    .qc .split, .qc .split.reverse { grid-template-columns: 1fr; gap: 36px; }
    .qc .split.reverse .col-wide, .qc .split.reverse .col-narrow { order: unset; }
  }
  .qc .btn { font-family: var(--font-sans); font-size: 13px; font-weight: 500; letter-spacing: 0.5px; padding: 14px 32px; border-radius: 0; border: 1px solid var(--ink); background: var(--ink); color: #fff; cursor: pointer; transition: opacity 0.2s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .qc .btn:hover { opacity: 0.78; }
  .qc .btn-outline { background: transparent; color: var(--ink); border-color: var(--ink); }
  .qc .btn-outline:hover { background: var(--chalk); opacity: 1; }
  .qc .hero { position: relative; min-height: 96vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px; overflow: hidden; }
  .qc .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; object-fit: cover; }
  .qc .hero > *:not(.hero-bg) { position: relative; z-index: 1; }
  .qc .hero-content { background: rgba(255, 255, 255, 0.8); padding: 50px 100px; text-align: center; }
  @media (max-width: 640px) { .qc .hero-content { padding: 32px 24px; } }
  @keyframes qc-fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .qc .hero-eyebrow { animation: qc-fadeUp 1s ease both; }
  .qc .hero-name { animation: qc-fadeUp 1s ease 0.15s both; font-size: clamp(40px, 8vw, 76px); font-weight: 400; color: var(--ink); margin: 0 0 22px; letter-spacing: -2px; line-height: 1; }
  .qc .hero-date { animation: qc-fadeUp 1s ease 0.3s both; font-size: 13px; letter-spacing: 2px; color: var(--ink-soft); margin: 0 0 40px; text-transform: lowercase; }
  .qc .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .qc .detail-row { display: flex; justify-content: space-between; padding: 22px 0; border-bottom: 1px solid var(--slate); gap: 24px; }
  .qc .detail-row:first-child { border-top: 1px solid var(--slate); }
  .qc .detail-row .label { font-size: 12px; letter-spacing: 1.5px; text-transform: lowercase; color: var(--ink-soft); white-space: nowrap; padding-top: 2px; }
  .qc .detail-row .value { font-size: 16px; color: var(--ink); text-align: right; }
  .qc .detail-row .value .sub { display: block; font-size: 13px; color: var(--ink-soft); margin-top: 2px; }
  .qc .map-frame { overflow: hidden; min-height: 280px; margin-top: 0; }
  .qc .map-frame iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 280px; filter: saturate(0.5); }
  .qc .directions-link { margin-top: 16px; }
  .qc .directions-link a { font-size: 13px; color: var(--sage-deep); font-weight: 500; text-decoration: underline; }
  .qc .schedule-day { margin-bottom: 32px; }
  .qc .schedule-day:last-child { margin-bottom: 0; }
  .qc .schedule-day-title { font-size: 12px; letter-spacing: 1.5px; text-transform: lowercase; color: var(--sage-deep); font-weight: 500; margin: 0 0 4px; }
  .qc .footer-grid { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; flex-wrap: wrap; }
  .qc .footer p { font-size: 14px; color: var(--ink-soft); margin: 0 0 4px; }
  .qc .footer-signoff { font-size: 14px; color: var(--ink); letter-spacing: -0.2px; margin: 0; }
  .qc .footer-credit { font-size: 11px; color: var(--ink-soft); letter-spacing: 0.3px; margin-top: 24px; }
  .qc .registry-wrap { position: relative; width: 100%; min-height: 260px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .qc .registry-overlay { background: rgba(63, 74, 69, 0.55); padding: 48px 64px; text-align: center; }
  .qc .registry-title { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #fff; margin: 0 0 12px; font-weight: 500; }
  .qc .registry-description { font-size: 15px; color: rgba(255,255,255,0.85); margin: 0 0 24px; line-height: 1.6; max-width: 400px; }
  .qc .registry-button { display: inline-block; padding: 12px 28px; border: 1px solid #fff; color: #fff; text-decoration: none; font-size: 13px; letter-spacing: 0.5px; transition: background 0.2s ease; }
  .qc .registry-button:hover { background: rgba(255,255,255,0.12); }
  @media (max-width: 640px) { .qc .wrap { padding: 0 22px; } .qc .section { padding: 80px 0; } }
  .qc input, .qc textarea, .qc select { width: 100%; background: transparent; border: none; border-bottom: 1.5px solid var(--slate); padding: 10px 0; font-size: 15px; color: var(--ink); font-family: var(--font-sans); outline: none; border-radius: 0; appearance: none; display: block; }
  .qc input:focus, .qc textarea:focus, .qc select:focus { border-bottom-color: var(--ink); }
  .qc .field-label { font-size: 11px; letter-spacing: 2px; text-transform: lowercase; color: var(--ink-soft); display: block; margin-bottom: 2px; }
  .qc .rsvp-form { display: flex; flex-direction: column; gap: 22px; max-width: 440px; }
  .qc .attend-options { display: flex; gap: 24px; margin-top: 8px; flex-wrap: wrap; }
  .qc .radio-label, .qc .check-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--ink); cursor: pointer; }
  .qc .radio-label input, .qc .check-label input { width: auto; border: none; border-bottom: none; padding: 0; accent-color: var(--ink); }
  /* the generic input rule sets appearance: none, which would hide these */
  .qc .radio-label input, .qc .check-label input { appearance: auto; -webkit-appearance: auto; width: 16px; height: 16px; margin: 0; flex-shrink: 0; }
  .qc .check-hint { font-size: 12px; color: var(--ink-soft); margin: 4px 0 0; }
  .qc .rsvp-error { color: #A0524A; font-size: 13px; margin: 0; }
  .qc .rsvp-success { padding: 12px 0; }
  .qc .rsvp-headline { font-size: 20px; color: var(--ink); margin: 0 0 8px; letter-spacing: -0.3px; }
  .qc .rsvp-sub { font-size: 14px; color: var(--ink-soft); margin: 0; }
  /* share / hashtag band (ShareSection) */
  .qc .share-band { padding: 80px 24px; background: var(--chalk); text-align: center; }
  .qc .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .qc .share-hashtag { font-family: var(--font-sans); font-size: clamp(24px, 4vw, 32px); color: var(--sage-deep); margin: 0 0 28px; font-weight: 400; letter-spacing: 1px; overflow-wrap: anywhere; }
`;

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase();
  const location = [city, country].filter(Boolean).join(', ').toLowerCase();
  return location ? `${formatted} · ${location}` : formatted;
}

export default function QuietCoastal({
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
  customSections,
  sponsors,
}: ThemeProps) {
  const t = getTranslations(language);
  // editSlots is only ever passed by the dashboard's live preview — reuse it
  // as the single signal that guest-facing forms must render read-only.
  const isPreview = !!editSlots;
  const sectionTextCtx = { values: sectionText, pageId: sectionTextPageId };
  const heroDate = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';

  const when = eventWhen({ eventDate, eventTime, eventEndDate, eventEndTime }, t.dateLocale);
  const formattedTime = when.time.toLowerCase();

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

  const heroImg = bannerImage || HERO_DEFAULTS['quiet-coastal'];

  const showVenue = location === 'address';
  const showVirtual = location === 'virtual' && url;

  return (
    <div className="qc">
      <style>{css}</style>

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (
          isVideoUrl(heroImg) ? (
            <video className="hero-bg" src={heroImg} autoPlay muted loop playsInline style={{ objectFit: heroObjectFit }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={heroImg} alt="" style={{ objectFit: heroObjectFit }} />
          )
        )}
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="eyebrow hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || 'together with their families'}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line' }}>{heading}</h1>}
          {heroDate && (editSlots?.heroDate ?? <p className="hero-date">{heroDate}</p>)}
          <div className="hero-actions">
            <a href="#rsvp" className="btn">{t.rsvpBtn.toLowerCase()}</a>
            <a href="#story" className="btn btn-outline">{t.ourStoryBtn.toLowerCase()}</a>
            {isPaid && <a href="#photos" className="btn btn-outline">{t.shareYourPhoto.toLowerCase()}</a>}
          </div>
        </div>
      </div>

      <hr className="hairline" />

      {/* STORY */}
      {(description || editSlots?.description) && (
        <div id="story" className="wrap">
          <div className="section split">
            <div className="col-wide">
              <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="eyebrow" fallback={t.ourStoryLabel.toLowerCase()} />
              <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="title" fallback={t.howWeGotHere.toLowerCase()} />
              {editSlots?.description ?? (
                <p style={{ fontSize: 17, lineHeight: 1.9, color: 'var(--ink-soft)', margin: 0, maxWidth: 520 }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <hr className="hairline" />

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <div className="wrap">
          <div className="section split reverse">
            <div className="col-narrow">
              <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="eyebrow" fallback={t.theDetails.toLowerCase()} />
              <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="title" fallback={t.dateAndLocation.toLowerCase()} />
              {mapsUrl && (
                <div className="directions-link">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections.toLowerCase()}</a>
                </div>
              )}
              {showVirtual && (
                <div className="directions-link">
                  <a href={url} target="_blank" rel="noopener noreferrer">{t.joinOnline.toLowerCase()}</a>
                </div>
              )}
            </div>
            <div className="col-wide">
              {eventDate && (
                <div className="detail-row">
                  <span className="label">{t.ceremony.toLowerCase()}</span>
                  <span className="value">
                    {formattedTime && <>{formattedTime}</>}
                    {eventDate && <span className="sub">{when.date.toLowerCase()}</span>}
                  </span>
                </div>
              )}
              {showVenue && (venueName || streetAddress || city) && (
                <div className="detail-row">
                  <span className="label">{t.venue.toLowerCase()}</span>
                  <span className="value">
                    {venueName ?? streetAddress}
                    {venueName && streetAddress && <span className="sub">{streetAddress}</span>}
                    {city && <span className="sub">{[city, postalCode, country].filter(Boolean).join(', ')}</span>}
                  </span>
                </div>
              )}
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
            </div>
          </div>
        </div>
      )}

      <hr className="hairline" />

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <div className="wrap" key={`custom-${section.position}`}>
          <div className="section">
            <CustomSectionContent section={section} titleClassName="title" align="left" textStyle={{ fontSize: 17, lineHeight: 1.9, color: 'var(--ink-soft)' }} />
          </div>
        </div>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <>
          <div className="wrap">
            <div className="section">
              <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="eyebrow" fallback={t.theSchedule.toLowerCase()} />
              <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="title" fallback={t.eventProgram.toLowerCase()} />
              {groupEventProgramByDate(eventProgram).map((group) => (
                <div className="schedule-day" key={group.date}>
                  <p className="schedule-day-title">{formatProgramDate(group.date, t.dateLocale).toLowerCase()}</p>
                  {group.items.map((item) => (
                    <div className="detail-row" key={item.id}>
                      <span className="label">{formatProgramTime(item, t.dateLocale).toLowerCase() || '—'}</span>
                      <span className="value">
                        {item.name}
                        {item.location && <span className="sub">{item.location}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <hr className="hairline" />
        </>
      )}

      {/* RSVP */}
      {showRsvp !== false && (
        <>
          <hr className="hairline" />
          <div id="rsvp" className="wrap">
            <div className="section">
              <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="eyebrow" fallback={t.kindlyRespond.toLowerCase()} />
              <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="title" fallback={t.rsvp.toLowerCase()} />
              <RsvpForm userPageId={userPageId} translations={t} disabled={isPreview} />
            </div>
          </div>
        </>
      )}

      {/* GALLERY */}
      {(() => {
        const content = editSlots?.gallery ?? (galleryImages?.length ? <GalleryGrid images={galleryImages} /> : null);
        return content ? (
          <>
            <hr className="hairline" />
            <div className="wrap">
              <div className="section">
                <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="eyebrow" fallback={t.gallery.toLowerCase()} />
                <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="title" fallback={t.ourMoments.toLowerCase()} />
                {content}
              </div>
            </div>
          </>
        ) : null;
      })()}

      {/* REGISTRY */}
      {(registryImage || registryDescription) && (
        <>
          <div
            className="registry-wrap"
            style={{ backgroundImage: `url(${registryImage || '/images/themes/wedding/registry.png'})` }}
          >
            <div className="registry-overlay">
              <p className="registry-title">{t.registry.toLowerCase()}</p>
              {registryDescription && <p className="registry-description">{registryDescription}</p>}
              {registryButtonLink && (
                <a href={registryButtonLink} target="_blank" rel="noopener noreferrer" className="registry-button">
                  {registryButtonText || t.viewRegistry.toLowerCase()}
                </a>
              )}
            </div>
          </div>
          <hr className="hairline" />
        </>
      )}

      {/* SPONSORS (Plus) */}
      {isPaid && sponsors && sponsors.length > 0 && (
        <div className="wrap">
          <div className="section">
            <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="eyebrow" fallback={t.sponsorsLabel.toLowerCase()} />
            <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="title" fallback={t.ourSponsors.toLowerCase()} />
            <SponsorGrid sponsors={sponsors} align="left" textStyle={{ color: 'var(--ink-soft)' }} />
          </div>
        </div>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <div id="photos" className="wrap" style={{ padding: '80px 32px' }}>
          <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="eyebrow" style={{ marginBottom: 8 }} fallback={t.guestPhotos.toLowerCase()} />
          <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" style={{ marginBottom: 28 }} fallback={t.shareYourPhoto.toLowerCase()} />
          <GuestPhotoSection
            userPageId={galleryToken}
            initialPhotos={guestPhotos ?? []}
            initialHasMore={guestPhotosHasMore ?? false}
            labels={{ shareYourPhoto: t.shareYourPhoto.toLowerCase(), loadMore: t.loadMore.toLowerCase(), beFirstToShare: t.beFirstToShare.toLowerCase(), photoUploaded: t.photoUploaded, photoUploadError: t.photoUploadError, uploading: t.sending.toLowerCase() }}
            btnClassName="btn"
            disabled={isPreview}
          />
        </div>
      )}

      {/* SONG REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <>
          <hr className="hairline" />
          <div className="wrap" style={{ padding: '80px 32px' }}>
            <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="eyebrow" style={{ marginBottom: 8 }} fallback={t.buildOurPlaylist.toLowerCase()} />
            <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" style={{ marginBottom: 28 }} fallback={t.songRequests.toLowerCase()} />
            <SongRequestSection
              userPageId={galleryToken}
              initialSongs={guestSongs ?? []}
              initialHasMore={guestSongsHasMore ?? false}
              labels={{ yourName: t.yourName.toLowerCase(), songTitle: t.songTitle.toLowerCase(), artistLabel: t.artistLabel.toLowerCase(), addSong: t.addSong.toLowerCase(), songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet.toLowerCase(), requestedBy: t.requestedBy.toLowerCase(), loadMore: t.loadMore.toLowerCase(), sending: t.sending.toLowerCase() }}
              btnClassName="btn"
              disabled={isPreview}
            />
          </div>
        </>
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="eyebrow" buttonClassName="btn btn-outline" lowercase sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer wrap" style={{ padding: '80px 32px' }}>
        <div className="footer-grid">
          <div>
            <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="eyebrow" style={{ marginBottom: 14 }} fallback={t.questions} />
            <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="title" style={{ marginBottom: 14 }} fallback={t.getInTouch} />
            {editSlots?.footerContact ?? (
              <>
                {heading && <p>{heading}</p>}
                {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>{userEmail}</a></p>}
                {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>{userPhone}</a></p>}
              </>
            )}
          </div>
          <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        </div>
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
