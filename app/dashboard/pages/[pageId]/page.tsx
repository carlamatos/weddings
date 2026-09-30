import { fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings, fetchEventProgram, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { signPageId } from '@/app/lib/page-token';
import { isPagePaidAndLive } from '@/app/lib/plans';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import { sectionTextFromSettings } from '@/app/lib/section-text';
import { normalizeHashtag } from '@/app/lib/hashtag';
import { publicPageUrl } from '@/app/lib/share';
import {
  EditableHeroEyebrow,
  EditableHeroName,
  EditableHeroDate,
  EditableDescription,
  EditableBannerBg,
  EditableContactInfo,
} from '@/app/ui/themes/slots';
import { EditableGallery } from '@/app/ui/themes/GallerySection';
import { heroFallbackFor } from '@/app/ui/themes/hero-fallback';
import { formatDateRange } from '@/app/ui/themes/event-when';

export default async function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);
  const isPaid = isPagePaidAndLive(userPage);
  const [galleryImages, guestPhotosResult, guestSongsResult, pageSettings, eventProgram] = await Promise.all([
    fetchGalleryImages(pageId),
    isPaid ? fetchGuestPhotos(userPage.id, 0) : Promise.resolve({ photos: [], hasMore: false }),
    isPaid ? fetchGuestSongs(userPage.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    fetchPageSettings(userPage.id),
    fetchEventProgram(pageId),
  ]);
  const heroObjectFit = (pageSettings['hero_object_fit'] as 'cover' | 'contain') ?? 'cover';
  const showEventProgram = isSectionOn(pageSettings, 'show_event_program');
  const showSongRequests = isSectionOn(pageSettings, 'show_song_requests');
  const showGuestPhotos = isSectionOn(pageSettings, 'show_guest_photos');
  const showRsvp = isSectionOn(pageSettings, 'show_rsvp');
  const showShare = isSectionOn(pageSettings, 'show_share');
  const shareHashtag = normalizeHashtag(pageSettings['share_hashtag']) || undefined;
  const sectionText = sectionTextFromSettings(pageSettings);

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Build the date display string the same way each theme would
  const heroDateText = userPage.event_date
    ? (() => {
        const formatted = formatDateRange(userPage.event_date, userPage.event_end_date, 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const loc = [userPage.city, userPage.country].filter(Boolean).join(', ');
        return loc ? `${formatted} · ${loc}` : formatted;
      })()
    : '';

  const themeEyebrowDefault =
    userPage.theme_slug === 'midnight-botanical'
      ? 'Save the date'
      : userPage.theme_slug === 'antique-cars'
      ? 'Antique & Classic'
      : 'Together with their families';

  const themeEyebrowClass =
    userPage.theme_slug === 'midnight-botanical'
      ? 'eyebrow on-dark hero-eyebrow'
      : userPage.theme_slug === 'quiet-coastal' || userPage.theme_slug === 'vilma'
      ? 'eyebrow hero-eyebrow'
      : 'hero-eyebrow';

  const editSlots = {
    heroBg: (
      <EditableBannerBg
        pageId={pageId}
        {...heroFallbackFor(userPage.theme_slug)}
        src={userPage.banner_image || ''}
        initialObjectFit={heroObjectFit}
      />
    ),
    heroEyebrow: (
      <EditableHeroEyebrow
        pageId={pageId}
        value={userPage.hero_eyebrow || themeEyebrowDefault}
        className={themeEyebrowClass}
      />
    ),
    heroName: (
      <EditableHeroName
        pageId={pageId}
        value={userPage.heading || ''}
      />
    ),
    heroDate: heroDateText ? (
      <EditableHeroDate
        pageId={pageId}
        displayText={heroDateText}
        eventDate={userPage.event_date || undefined}
        eventTime={userPage.event_time || undefined}
        eventEndDate={userPage.event_end_date || undefined}
        eventEndTime={userPage.event_end_time || undefined}
        city={userPage.city || undefined}
        country={userPage.country || undefined}
        address={userPage.location === 'virtual' ? undefined : {
          venueName: userPage.venue_name || undefined,
          streetAddress: userPage.street_address || undefined,
          unitNumber: userPage.unit_number || undefined,
          postalCode: userPage.postal_code || undefined,
          placeId: userPage.place_id || undefined,
          formattedAddress: userPage.formatted_address || undefined,
        }}
      />
    ) : undefined,
    description: (
      <EditableDescription
        pageId={pageId}
        value={userPage.description || ''}
        style={{ fontSize: 17, lineHeight: 1.9, color: 'inherit', margin: 0 }}
      />
    ),
    gallery: <EditableGallery pageId={pageId} initialImages={galleryImages} isPaid={isPaid} />,
    footerContact: (
      <EditableContactInfo
        pageId={pageId}
        email={userPage.user_email || ''}
        phone={userPage.user_phone || ''}
        linkStyle={
          userPage.theme_slug === 'vilma' ? { color: 'rgba(255,255,255,0.75)' } :
          userPage.theme_slug === 'midnight-botanical' ? { color: 'var(--gold)' } :
          { color: 'inherit' }
        }
      />
    ),
  };

  return (
    <div style={{ margin: '-32px -28px' }}>
      <ThemeRenderer
        themeSlug={userPage.theme_slug}
        heading={userPage.heading || ''}
        description={userPage.description || undefined}
        eventDate={userPage.event_date || undefined}
        eventTime={userPage.event_time || undefined}
        eventEndDate={userPage.event_end_date || undefined}
        eventEndTime={userPage.event_end_time || undefined}
        location={userPage.location}
        city={userPage.city || undefined}
        country={userPage.country || undefined}
        streetAddress={userPage.street_address || undefined}
        unitNumber={userPage.unit_number || undefined}
        postalCode={userPage.postal_code || undefined}
        formattedAddress={userPage.formatted_address || undefined}
        placeId={userPage.place_id || undefined}
        url={userPage.url || undefined}
        bannerImage={userPage.banner_image || undefined}
        userEmail={userPage.user_email || undefined}
        userPhone={userPage.user_phone || undefined}
        mapsKey={mapsKey}
        galleryToken={isPaid ? signPageId(pageId) : undefined}
        registryImage={userPage.section_2_image || undefined}
        registryDescription={userPage.section_2_description || undefined}
        registryButtonText={userPage.section_2_button_text || undefined}
        registryButtonLink={userPage.section_2_button_link || undefined}
        galleryImages={galleryImages}
        heroEyebrow={userPage.hero_eyebrow || undefined}
        venueName={userPage.venue_name || undefined}
        language={userPage.language || 'en'}
        isPaid={isPaid}
        guestPhotos={guestPhotosResult.photos}
        guestPhotosHasMore={guestPhotosResult.hasMore}
        guestSongs={guestSongsResult.songs}
        guestSongsHasMore={guestSongsResult.hasMore}
        heroObjectFit={heroObjectFit}
        eventProgram={eventProgram}
        showEventProgram={showEventProgram}
        showSongRequests={showSongRequests}
        showGuestPhotos={showGuestPhotos}
        showRsvp={showRsvp}
        showShare={showShare}
        shareHashtag={shareHashtag}
        sectionText={sectionText}
        sectionTextPageId={pageId}
        shareUrl={publicPageUrl(userPage)}
        editSlots={editSlots}
      />
    </div>
  );
}
