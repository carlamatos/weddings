import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { eventPageMetadata, publicPageUrl } from '@/app/lib/share';
import { fetchUserPageByDomain, fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings, fetchEventProgram, isSectionOn, fetchPlusContent, registryProps, potluckProps } from '@/app/lib/data';
import { signPageId } from '@/app/lib/page-token';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import { livestreamFromSettings } from '@/app/lib/livestream';
import { isPageLocked } from '@/app/lib/page-password';
import { LOCKED_PAGE_METADATA, mustShowPasswordGate } from '@/app/lib/page-gate';
import { getTranslations } from '@/app/lib/translations';
import PagePasswordGate from '@/app/ui/page-password-gate';
import { sectionTextFromSettings } from '@/app/lib/section-text';
import { normalizeHashtag } from '@/app/lib/hashtag';
import PageUnavailable from '@/app/ui/page-unavailable';
import '@/app/ui/wedding.css';
import { isPageOffline } from '@/app/lib/page-status';
import { areSongRequestsOn } from '@/app/lib/song-requests';
import { isHeroObjectPosition } from '@/app/ui/themes/hero-media';

export async function generateMetadata(
  { params }: { params: Promise<{ host: string }> }
): Promise<Metadata> {
  const host = decodeURIComponent((await params).host);
  const data = await fetchUserPageByDomain(host);
  if (!data) return {};
  if (isPageLocked(await fetchPageSettings(data.id), data.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  return eventPageMetadata(data);
}

export default async function CustomDomainPage({ params }: { params: Promise<{ host: string }> }) {
  const host = decodeURIComponent((await params).host);
  const data = await fetchUserPageByDomain(host);
  if (!data) notFound();
  if (isPageOffline(data.status)) return <PageUnavailable />;

  const isPaid = data.plan_type === 'paid';
  const pageSettings = await fetchPageSettings(data.id);

  // Password protected (Plus): the guest enters the password on this domain,
  // so the access cookie is this domain's own.
  if (await mustShowPasswordGate(data.id, pageSettings, isPaid)) {
    return <PagePasswordGate token={signPageId(data.id)} t={getTranslations(data.language)} />;
  }

  const [galleryImages, guestPhotosResult, guestSongsResult, eventProgram, potluck] = await Promise.all([
    fetchGalleryImages(data.id),
    isPaid ? fetchGuestPhotos(data.id, 0) : Promise.resolve({ photos: [], hasMore: false }),
    isPaid ? fetchGuestSongs(data.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    fetchEventProgram(data.id),
    potluckProps(data.id, isPaid, pageSettings),
  ]);
  const heroObjectFit = (pageSettings['hero_object_fit'] as 'cover' | 'contain') ?? 'cover';
  const heroObjectPosition = isHeroObjectPosition(pageSettings['hero_object_position']) ? pageSettings['hero_object_position'] : undefined;
  const showEventProgram = isSectionOn(pageSettings, 'show_event_program');
  const showSongRequests = areSongRequestsOn(pageSettings);
  const showGuestPhotos = isSectionOn(pageSettings, 'show_guest_photos');
  const showRsvp = isSectionOn(pageSettings, 'show_rsvp');
  const showShare = isSectionOn(pageSettings, 'show_share');
  const shareHashtag = normalizeHashtag(pageSettings['share_hashtag']) || undefined;
  const sectionText = sectionTextFromSettings(pageSettings);
  const plusContent = await fetchPlusContent(data.id, isPaid, pageSettings);
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <ThemeRenderer
      themeSlug={data.theme_slug}
      heading={data.heading}
      description={data.description || undefined}
      eventDate={data.event_date || undefined}
      eventTime={data.event_time || undefined}
      eventEndDate={data.event_end_date || undefined}
      eventEndTime={data.event_end_time || undefined}
      location={data.location}
      city={data.city || undefined}
      country={data.country || undefined}
      streetAddress={data.street_address || undefined}
      unitNumber={data.unit_number || undefined}
      postalCode={data.postal_code || undefined}
      formattedAddress={data.formatted_address || undefined}
      placeId={data.place_id || undefined}
      url={data.url || undefined}
      userPageId={String(data.id)}
      galleryToken={isPaid ? signPageId(data.id) : undefined}
      bannerImage={data.banner_image || undefined}
      userEmail={data.user_email || undefined}
      userPhone={data.user_phone || undefined}
      mapsKey={mapsKey}
      {...registryProps(data, isPaid, pageSettings)}
      heroEyebrow={data.hero_eyebrow || undefined}
      venueName={data.venue_name || undefined}
      language={data.language || 'en'}
      galleryImages={galleryImages}
      isPaid={isPaid}
      guestPhotos={guestPhotosResult.photos}
      guestPhotosHasMore={guestPhotosResult.hasMore}
      guestSongs={guestSongsResult.songs}
      guestSongsHasMore={guestSongsResult.hasMore}
      heroObjectFit={heroObjectFit}
      heroObjectPosition={heroObjectPosition}
      eventProgram={eventProgram}
      showEventProgram={showEventProgram}
      showSongRequests={showSongRequests}
      showGuestPhotos={showGuestPhotos}
      showRsvp={showRsvp}
        showShare={showShare}
        shareHashtag={shareHashtag}
        sectionText={sectionText}
        customSections={plusContent.customSections}
        sponsors={plusContent.sponsors}
        livestream={livestreamFromSettings(pageSettings, isPaid)}
        potluck={potluck}
        shareUrl={publicPageUrl(data)}
    />
  );
}
