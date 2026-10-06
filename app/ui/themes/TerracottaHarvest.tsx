import { Fragment } from 'react';
import type { ThemeProps, ThemePreviewProps } from './types';
import { GalleryGrid } from './GallerySection';
import { GuestPhotoSection } from './GuestPhotoSection';
import { SongRequestSection } from './SongRequestSection';
import RsvpForm from './RsvpForm';
import { getTranslations } from '@/app/lib/translations';
import { eventWhen, formatDateRange } from './event-when';
import ShareSection from './ShareSection';
import { SectionText } from './section-text';
import { CustomSectionContent, SponsorGrid } from './PlusSections';
import { LivestreamContent } from './LivestreamSection';
import PotluckForm from './PotluckForm';
import GiftExchangeSection from './GiftExchangeSection';
import { PreviewTopBar } from './PreviewTopBar';
import { groupEventProgramByDate, formatProgramDate, formatProgramTime } from './event-program-utils';
import { heroMediaStyle } from './hero-media';

export function HeroPreview({ heading, eventDate, city, country, bannerImage }: ThemePreviewProps) {
  const loc = [city, country].filter(Boolean).join(', ');
  const date = eventDate
    ? [new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), loc].filter(Boolean).join(' · ')
    : '';
  return (
    <div style={{ position: 'relative', width: '100%', height: 280, background: '#F7F1E6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      {bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
          <rect width="1200" height="400" fill="#F7F1E6" />
          <circle cx="150" cy="300" r="200" fill="#EFCBA3" opacity="0.5" />
          <circle cx="1050" cy="80" r="180" fill="#A9C4DE" opacity="0.35" />
          <circle cx="950" cy="350" r="140" fill="#CC9A3E" opacity="0.2" />
        </svg>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: bannerImage ? '#fff' : '#BC5A38', fontWeight: 600, margin: '0 0 12px' }}>Together with their families</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 4vw, 46px)', fontWeight: 500, color: bannerImage ? '#fff' : '#3D2B1F', margin: '0 0 12px', lineHeight: 1.05 }}>{heading || 'Your Event Name'}</h2>
        <div style={{ width: 32, height: 2, background: '#CC9A3E', margin: '0 auto 12px' }} />
        {date && <p style={{ fontSize: 13, letterSpacing: 1, color: bannerImage ? 'rgba(255,255,255,0.9)' : '#7A6451', margin: 0 }}>{date}</p>}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', height: 5 }}>
        {['#BC5A38','#CC9A3E','#EFCBA3','#F7F1E6','#A9C4DE','#D8D2C2'].map((c) => (
          <div key={c} style={{ flex: 1, background: c }} />
        ))}
      </div>
    </div>
  );
}

const css = `
  :root {
    --rust: #BC5A38;
    --ochre: #CC9A3E;
    --peach: #EFCBA3;
    --cream: #F7F1E6;
    --blue: #A9C4DE;
    --linen: #D8D2C2;
    --ink: #3D2B1F;
    --ink-soft: #7A6451;
    --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-serif: Georgia, 'Times New Roman', serif;
  }
  .tc * { box-sizing: border-box; }
  .tc { margin: 0; background: #fff; color: var(--ink); font-family: var(--font-sans); overflow-x: hidden; }
  .tc img { max-width: 100%; }
  .tc .band { display: flex; width: 100%; }
  .tc .band > span { flex: 1; height: 10px; }
  .tc .band.thin > span { height: 4px; }
  .tc .band-rust { background: var(--rust); }
  .tc .band-ochre { background: var(--ochre); }
  .tc .band-peach { background: var(--peach); }
  .tc .band-cream { background: var(--cream); }
  .tc .band-blue { background: var(--blue); }
  .tc .band-linen { background: var(--linen); }
  .tc .section-label { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--rust); font-weight: 600; margin: 0 0 10px; text-align: center; }
  .tc .section-title { font-family: var(--font-serif); font-size: clamp(28px, 4vw, 38px); font-weight: 500; color: var(--ink); margin: 0 0 28px; text-align: center; letter-spacing: 0.3px; }
  .tc .btn { font-family: var(--font-sans); font-size: 14px; font-weight: 600; letter-spacing: 0.5px; padding: 12px 28px; border-radius: 999px; border: 1.5px solid var(--rust); background: var(--rust); color: #fff; cursor: pointer; transition: transform 0.15s ease, background 0.15s ease; text-decoration: none; display: inline-block; line-height: 1; }
  .tc .btn:hover { background: #A24A2D; transform: translateY(-1px); }
  .tc .btn-outline { background: transparent; color: var(--rust); }
  .tc .btn-outline:hover { background: rgba(239, 203, 163, 0.3); }
  .tc .hero { position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 60px 24px; overflow: hidden; }
  .tc .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; object-fit: cover; }
  .tc .hero-bg-svg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
  .tc .hero-overlay { position: absolute; inset: 0; background: rgba(247, 241, 230, 0.55); z-index: 1; }
  .tc .hero-content { position: relative; z-index: 2; }
  @keyframes tc-fadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  .tc .hero-eyebrow { animation: tc-fadeInDown 1s ease both; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: var(--rust); font-weight: 600; margin: 0 0 18px; }
  .tc .hero-name { animation: tc-fadeInDown 1s ease 0.25s both; font-family: var(--font-serif); font-size: clamp(44px, 9vw, 88px); font-weight: 500; color: var(--ink); margin: 0 0 18px; line-height: 1.05; }
  .tc .hero-rule { width: 48px; height: 2px; background: var(--ochre); margin: 0 auto 18px; }
  .tc .hero-date { animation: tc-fadeInDown 1s ease 0.5s both; font-size: 16px; letter-spacing: 1.5px; color: var(--ink-soft); margin: 0 0 32px; }
  .tc .hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .tc .section { padding: 80px 24px; max-width: 720px; margin: 0 auto; }
  .tc .section-wide { padding: 80px 24px; max-width: 1000px; margin: 0 auto; }
  .tc .section-tinted { padding: 80px 24px; background: var(--cream); }
  .tc .story-text { font-size: 17px; line-height: 1.8; color: var(--ink-soft); text-align: center; margin: 0; }
  .tc .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 8px; }
  .tc .details-card { border: 1px solid var(--linen); border-radius: 16px; padding: 28px; height: 100%; }
  .tc .details-card .label { font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: var(--rust); font-weight: 600; margin: 0 0 10px; }
  .tc .details-card .time { font-family: var(--font-serif); font-size: 22px; margin: 0 0 6px; color: var(--ink); }
  .tc .details-card p { font-size: 15px; color: var(--ink-soft); margin: 0 0 4px; }
  .tc .map-card { border-radius: 16px; overflow: hidden; border: 1px solid var(--linen); min-height: 200px; height: 100%; }
  .tc .map-card iframe { border: 0; display: block; width: 100%; height: 100%; min-height: 200px; }
  .tc .directions-link { text-align: center; margin-top: 22px; }
  .tc .directions-link a { font-size: 14px; color: var(--rust); font-weight: 600; text-decoration: none; }
  .tc .schedule-day { margin-bottom: 36px; }
  .tc .schedule-day:last-child { margin-bottom: 0; }
  .tc .schedule-day-title { font-family: var(--font-serif); font-size: 18px; color: var(--rust); margin: 0 0 16px; text-align: center; }
  .tc .schedule-row { display: flex; gap: 20px; align-items: baseline; border-bottom: 1px solid var(--linen); padding: 14px 0; text-align: left; }
  .tc .schedule-time { font-family: var(--font-serif); font-size: 17px; color: var(--rust); min-width: 130px; flex-shrink: 0; }
  .tc .schedule-info .name { font-size: 15px; font-weight: 600; color: var(--ink); margin: 0 0 2px; }
  .tc .schedule-info .loc { font-size: 13px; color: var(--ink-soft); margin: 0; }
  .tc .registry-wrap { position: relative; width: 100%; min-height: 280px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
  .tc .registry-overlay { background: rgba(61, 43, 31, 0.6); padding: 48px 64px; text-align: center; border-radius: 4px; }
  .tc .registry-title { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: var(--peach); margin: 0 0 14px; font-weight: 600; }
  .tc .registry-description { font-size: 15px; color: rgba(255,255,255,0.85); margin: 0 0 24px; line-height: 1.6; max-width: 400px; }
  .tc .registry-button { display: inline-block; padding: 12px 28px; border-radius: 999px; border: 1.5px solid #fff; color: #fff; text-decoration: none; font-size: 13px; transition: background 0.2s ease; }
  .tc .registry-button:hover { background: rgba(255,255,255,0.15); }
  .tc .footer { padding: 70px 24px 60px; background: var(--cream); text-align: center; }
  .tc .footer p { font-size: 15px; color: var(--ink-soft); margin: 0 0 4px; }
  .tc .footer-rule { width: 36px; height: 1px; background: var(--ochre); margin: 20px auto; }
  .tc .footer-signoff { font-size: 13px; color: var(--ink-soft); letter-spacing: 0.5px; margin: 0; }
  .tc .footer-credit { font-size: 11px; color: var(--ink-soft); opacity: 0.5; margin-top: 20px; }
  @media (max-width: 640px) { .tc .details-grid { grid-template-columns: 1fr; } }
  .tc input, .tc textarea, .tc select { width: 100%; background: #fff; border: 1.5px solid var(--linen); border-radius: 10px; padding: 11px 14px; font-size: 15px; color: var(--ink); font-family: var(--font-sans); outline: none; display: block; }
  .tc input:focus, .tc textarea:focus, .tc select:focus { border-color: var(--rust); }
  .tc .field-label { font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--rust); display: block; margin-bottom: 6px; font-weight: 600; }
  .tc .rsvp-form { display: flex; flex-direction: column; gap: 20px; max-width: 440px; margin: 0 auto; }
  .tc .attend-options { display: flex; gap: 24px; margin-top: 8px; flex-wrap: wrap; }
  .tc .radio-label, .tc .check-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--ink-soft); cursor: pointer; }
  .tc .radio-label input, .tc .check-label input { width: auto; border: none; padding: 0; accent-color: var(--rust); }
  .tc .check-hint { font-size: 12px; color: var(--ink-soft); margin: 4px 0 0; }
  .tc .rsvp-error { color: var(--rust); font-size: 13px; margin: 0; }
  .tc .rsvp-success { text-align: center; padding: 20px 0; }
  .tc .rsvp-headline { font-family: var(--font-serif); font-size: 22px; color: var(--ink); margin: 0 0 8px; }
  .tc .rsvp-sub { font-size: 15px; color: var(--ink-soft); margin: 0; }
  /* share / hashtag band (ShareSection) */
  .tc .share-band { padding: 70px 24px; background: transparent; text-align: center; }
  .tc .share-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .tc .share-hashtag { font-family: var(--font-serif); font-size: clamp(26px, 4vw, 32px); color: var(--rust); margin: 0 0 28px; font-weight: 500; overflow-wrap: anywhere; }
`;

const BandDivider = ({ thin }: { thin?: boolean }) => (
  <div className={`band${thin ? ' thin' : ''}`}>
    <span className="band-rust" />
    <span className="band-ochre" />
    <span className="band-peach" />
    <span className="band-cream" />
    <span className="band-blue" />
    <span className="band-linen" />
  </div>
);

function isVideoUrl(url: string) { return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url); }

function formatDate(dateStr: string, city?: string, country?: string, locale = 'en-US', endDateStr?: string): string {
  const formatted = formatDateRange(dateStr, endDateStr, locale, { month: 'long', day: 'numeric', year: 'numeric' });
  const loc = [city, country].filter(Boolean).join(', ');
  return loc ? `${formatted} · ${loc}` : formatted;
}

// What Terracotta Harvest shows in place of a banner image. Exported so the
// dashboard editor shows exactly the same thing.
export function TerracottaDefaultHero() {
  return (
    <svg className="hero-bg-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <rect width="1600" height="1000" fill="#F7F1E6" />
      <circle cx="220" cy="760" r="340" fill="#EFCBA3" opacity="0.5" />
      <circle cx="1400" cy="180" r="300" fill="#A9C4DE" opacity="0.35" />
      <circle cx="1300" cy="850" r="220" fill="#CC9A3E" opacity="0.25" />
      <circle cx="80" cy="120" r="160" fill="#D8D2C2" opacity="0.5" />
      <path d="M0 760 C 250 680, 420 820, 700 740 S 1180 660, 1600 760 L1600 1000 L0 1000 Z" fill="#BC5A38" opacity="0.14" />
      <path d="M0 840 C 300 780, 520 900, 820 830 S 1300 760, 1600 850 L1600 1000 L0 1000 Z" fill="#CC9A3E" opacity="0.18" />
    </svg>
  );
}

export default function TerracottaHarvest({
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
  const t = getTranslations(language);
  // editSlots is only ever passed by the dashboard's live preview — reuse it
  // as the single signal that guest-facing forms must render read-only.
  const isPreview = !!editSlots;
  // Forms are shown but can't be submitted in the editor or a showcase preview.
  const formsDisabled = isPreview || !!demo;
  const sectionTextCtx = { values: sectionText, pageId: sectionTextPageId };
  const heroDate = eventDate ? formatDate(eventDate, city, country, t.dateLocale, eventEndDate) : '';

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
    <div className="tc">
      <style>{css}</style>
      {/* Live pages of this theme have no top bar; the showcase preview gets one */}
      {demo && <PreviewTopBar isLoggedIn={isLoggedIn} backToThemes />}

      {/* HERO */}
      <div className="hero">
        {editSlots?.heroBg ?? (bannerImage ? (
          isVideoUrl(bannerImage) ? (
            <video className="hero-bg" src={bannerImage} autoPlay muted loop playsInline style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-bg" src={bannerImage} alt="" style={heroMediaStyle(heroObjectFit, heroObjectPosition)} />
          )
        ) : (
          <TerracottaDefaultHero />
        ))}
        <div className="hero-overlay" />
        <div className="hero-content">
          {editSlots?.heroEyebrow ?? <p className="hero-eyebrow" style={{ whiteSpace: 'pre-line' }}>{heroEyebrow || 'Together with their families'}</p>}
          {editSlots?.heroName ?? <h1 className="hero-name" style={{ whiteSpace: 'pre-line' }}>{heading}</h1>}
          <div className="hero-rule" />
          {heroDate && (editSlots?.heroDate ?? <p className="hero-date">{heroDate}</p>)}
          <div className="hero-actions">
            <a href="#rsvp" className="btn">{t.rsvpBtn}</a>
            <a href="#story" className="btn btn-outline">{t.ourStoryBtn}</a>
            {isPaid && <a href="#photos" className="btn btn-outline">{t.shareYourPhoto}</a>}
          </div>
        </div>
      </div>

      <BandDivider />

      {/* STORY */}
      {(description || editSlots?.description) && (
        <>
          <div id="story" className="section">
            <SectionText ctx={sectionTextCtx} k="story.eyebrow" className="section-label" fallback={t.ourStoryLabel} />
            <SectionText ctx={sectionTextCtx} k="story.title" as="h2" className="section-title" fallback={t.howWeGotHere} />
            {editSlots?.description ?? <p className="story-text">{description}</p>}
          </div>
          <BandDivider thin />
        </>
      )}

      {/* DATE / LOCATION */}
      {(showVenue || showVirtual) && (
        <>
          <div className="section-wide">
            <SectionText ctx={sectionTextCtx} k="details.eyebrow" className="section-label" fallback={t.theDetails} />
            <SectionText ctx={sectionTextCtx} k="details.title" as="h2" className="section-title" fallback={t.dateAndLocation} />
            <div className="details-grid">
              <div>
                <div className="details-card">
                  <p className="label">{t.ceremony}</p>
                  {formattedTime && <p className="time">{formattedTime}</p>}
                  {eventDate && <p>{when.date}</p>}
                  {venueName && <p style={{ fontWeight: 500 }}>{venueName}</p>}
                  {streetAddress && <p>{streetAddress}</p>}
                  {city && <p style={{ fontSize: 14, marginTop: 2 }}>{[city, postalCode, country].filter(Boolean).join(', ')}</p>}
                  {showVirtual && (
                    <p><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rust)', textDecoration: 'none', fontWeight: 600 }}>{t.joinOnline}</a></p>
                  )}
                </div>
              </div>
              {mapSrc && (
                <div>
                  <div className="map-card">
                    <iframe
                      title="Venue map"
                      src={mapSrc}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>
            {mapsUrl && (
              <div className="directions-link">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{t.getDirections}</a>
              </div>
            )}
          </div>
          <BandDivider thin />
        </>
      )}

      {/* LIVE STREAM (Plus) */}
      {isPaid && livestream && (
        <>
          <div id="livestream" className="section-wide">
            <SectionText ctx={sectionTextCtx} k="livestream.eyebrow" className="section-label" fallback={t.livestreamLabel} />
            <SectionText ctx={sectionTextCtx} k="livestream.title" as="h2" className="section-title" fallback={t.watchLive} />
            <LivestreamContent livestream={livestream} labels={{ watchLive: t.watchLive, openStream: t.openStream }} buttonClassName="registry-button" textStyle={{ color: 'var(--ink-soft)' }} />
          </div>
          <BandDivider thin />
        </>
      )}

      {/* CUSTOM SECTIONS (Plus) */}
      {isPaid && customSections?.map((section) => (
        <Fragment key={`custom-${section.position}`}>
          <div className="section">
            <CustomSectionContent section={section} titleClassName="section-title" textClassName="story-text" />
          </div>
          <BandDivider thin />
        </Fragment>
      ))}

      {/* EVENT PROGRAM */}
      {showEventProgram !== false && eventProgram && eventProgram.length > 0 && (
        <>
          <div className="section-wide">
            <SectionText ctx={sectionTextCtx} k="program.eyebrow" className="section-label" fallback={t.theSchedule} />
            <SectionText ctx={sectionTextCtx} k="program.title" as="h2" className="section-title" fallback={t.eventProgram} />
            <div style={{ maxWidth: 620, margin: '0 auto' }}>
              {groupEventProgramByDate(eventProgram).map((group) => (
                <div className="schedule-day" key={group.date}>
                  <p className="schedule-day-title">{formatProgramDate(group.date, t.dateLocale)}</p>
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
              ))}
            </div>
          </div>
          <BandDivider thin />
        </>
      )}

      {/* RSVP */}
      {showRsvp !== false && (
        <>
          <div id="rsvp" className="section-tinted">
            <SectionText ctx={sectionTextCtx} k="rsvp.eyebrow" className="section-label" fallback={t.kindlyRespond} />
            <SectionText ctx={sectionTextCtx} k="rsvp.title" as="h2" className="section-title" fallback={t.rsvp} />
            <RsvpForm userPageId={userPageId} translations={t} disabled={formsDisabled} />
          </div>
          <BandDivider thin />
        </>
      )}
      {/* POTLUCK (Plus, off by default) */}
      {isPaid && potluck && (
        <>
          <div id="potluck" className="section-tinted">
            <SectionText ctx={sectionTextCtx} k="potluck.eyebrow" className="section-label" fallback={t.potluckLabel} />
            <SectionText ctx={sectionTextCtx} k="potluck.title" as="h2" className="section-title" fallback={t.potluckTitle} />
            <PotluckForm potluck={potluck} translations={t} disabled={formsDisabled} />
          </div>
          <BandDivider thin />
        </>
      )}

      {/* GIFT EXCHANGE — Secret Santa (Plus, off by default) */}
      {isPaid && giftExchange && (
        <>
          <div id="gift-exchange" className="section-tinted">
            <SectionText ctx={sectionTextCtx} k="gift.eyebrow" className="section-label" fallback={t.giftLabel} />
            <SectionText ctx={sectionTextCtx} k="gift.title" as="h2" className="section-title" fallback={t.giftTitle} />
            <GiftExchangeSection giftExchange={giftExchange} translations={t} disabled={formsDisabled} />
          </div>
          <BandDivider thin />
        </>
      )}

      {/* GALLERY */}
      {(() => {
        const content = editSlots?.gallery ?? (galleryImages?.length ? <GalleryGrid images={galleryImages} /> : null);
        return content ? (
          <>
            <div className="section-wide">
              <SectionText ctx={sectionTextCtx} k="gallery.eyebrow" className="section-label" fallback={t.gallery} />
              <SectionText ctx={sectionTextCtx} k="gallery.title" as="h2" className="section-title" fallback={t.ourMoments} />
              {content}
            </div>
            <BandDivider thin />
          </>
        ) : null;
      })()}

      {/* REGISTRY */}
      {(registryDescription || registryButtonLink) && (
        <>
          <div
            className="registry-wrap"
            style={{ backgroundImage: `url(${registryImage || '/images/themes/terracotta-harvest/registry.jpg'})` }}
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
          <BandDivider thin />
        </>
      )}

      {/* SPONSORS (Plus) */}
      {isPaid && sponsors && sponsors.length > 0 && (
        <>
          <div className="section-wide">
            <SectionText ctx={sectionTextCtx} k="sponsors.eyebrow" className="section-label" fallback={t.sponsorsLabel} />
            <SectionText ctx={sectionTextCtx} k="sponsors.title" as="h2" className="section-title" fallback={t.ourSponsors} />
            <SponsorGrid sponsors={sponsors} textStyle={{ color: 'var(--ink-soft)' }} />
          </div>
          <BandDivider thin />
        </>
      )}

      {/* GUEST PHOTOS */}
      {isPaid && galleryToken && showGuestPhotos !== false && (
        <div id="photos" className="section-wide">
          <SectionText ctx={sectionTextCtx} k="photos.eyebrow" className="section-label" fallback={t.guestPhotos} />
          <SectionText ctx={sectionTextCtx} k="photos.title" as="h2" className="section-title" fallback={t.shareYourPhoto} />
          <GuestPhotoSection
            userPageId={galleryToken}
            initialPhotos={guestPhotos ?? []}
            initialHasMore={guestPhotosHasMore ?? false}
            labels={{
              shareYourPhoto: t.shareYourPhoto,
              loadMore: t.loadMore,
              beFirstToShare: t.beFirstToShare,
              photoUploaded: t.photoUploaded,
              photoUploadError: t.photoUploadError,
              uploading: t.sending,
            }}
            btnClassName="btn"
            disabled={formsDisabled}
          />
        </div>
      )}

      {/* SONG REQUESTS */}
      {isPaid && galleryToken && showSongRequests !== false && (
        <>
          <BandDivider thin />
          <div className="section-tinted">
            <SectionText ctx={sectionTextCtx} k="songs.eyebrow" className="section-label" fallback={t.buildOurPlaylist} />
            <SectionText ctx={sectionTextCtx} k="songs.title" as="h2" className="section-title" fallback={t.songRequests} />
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <SongRequestSection
                userPageId={galleryToken}
                initialSongs={guestSongs ?? []}
                initialHasMore={guestSongsHasMore ?? false}
                labels={{ yourName: t.yourName, songTitle: t.songTitle, artistLabel: t.artistLabel, addSong: t.addSong, songAdded: t.songAdded, songAddError: t.songAddError, noSongsYet: t.noSongsYet, requestedBy: t.requestedBy, loadMore: t.loadMore, sending: t.sending }}
                btnClassName="btn"
                disabled={formsDisabled}
              />
            </div>
          </div>
          <BandDivider thin />
        </>
      )}

      {/* SHARE / HASHTAG */}
      {showShare !== false && shareUrl && (
        <ShareSection url={shareUrl} title={heading} hashtag={shareHashtag} t={t} eyebrowClassName="section-label" buttonClassName="btn btn-outline" sectionText={sectionTextCtx} />
      )}

      {/* FOOTER */}
      <footer className="footer">
        <SectionText ctx={sectionTextCtx} k="footer.eyebrow" className="section-label" fallback={t.questions} />
        <SectionText ctx={sectionTextCtx} k="footer.title" as="h2" className="section-title" fallback={t.getInTouch} />
        {editSlots?.footerContact ?? (
          <>
            {heading && <p>{heading}</p>}
            {userEmail && <p><a href={`mailto:${userEmail}`} style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>{userEmail}</a></p>}
            {userPhone && <p><a href={`tel:${userPhone}`} style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>{userPhone}</a></p>}
          </>
        )}
        <div className="footer-rule" />
        <SectionText ctx={sectionTextCtx} k="footer.signoff" className="footer-signoff" fallback={`${t.withLove}, ${heading || t.theCouple}`} />
        <p className="footer-credit">{t.madeWithMygala.split('mygala')[0]}<a href="https://mygala.ca" target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'inherit' }}>mygala</a></p>
      </footer>
    </div>
  );
}
