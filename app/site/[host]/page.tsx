import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { eventPageMetadata } from '@/app/lib/share';
import { fetchUserPageByDomain, fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings, fetchEventProgram, isSectionOn } from '@/app/lib/data';
import { signPageId } from '@/app/lib/page-token';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import PageUnavailable from '@/app/ui/page-unavailable';
import '@/app/ui/wedding.css';

export async function generateMetadata(
  { params }: { params: Promise<{ host: string }> }
): Promise<Metadata> {
  const host = decodeURIComponent((await params).host);
  const data = await fetchUserPageByDomain(host);
  if (!data) return {};
  return eventPageMetadata(data);
}

export default async function CustomDomainPage({ params }: { params: Promise<{ host: string }> }) {
  const host = decodeURIComponent((await params).host);
  const data = await fetchUserPageByDomain(host);
  if (!data) notFound();
  if (data.status === 'inactive') return <PageUnavailable />;

  const isPaid = data.plan_type === 'paid';
  const [galleryImages, guestPhotosResult, guestSongsResult, pageSettings, eventProgram] = await Promise.all([
    fetchGalleryImages(data.id),
    isPaid ? fetchGuestPhotos(data.id, 0) : Promise.resolve({ photos: [], hasMore: false }),
    isPaid ? fetchGuestSongs(data.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    fetchPageSettings(data.id),
    fetchEventProgram(data.id),
  ]);
  const heroObjectFit = (pageSettings['hero_object_fit'] as 'cover' | 'contain') ?? 'cover';
  const showEventProgram = isSectionOn(pageSettings, 'show_event_program');
  const showSongRequests = isSectionOn(pageSettings, 'show_song_requests');
  const showGuestPhotos = isSectionOn(pageSettings, 'show_guest_photos');
  const showRsvp = isSectionOn(pageSettings, 'show_rsvp');
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <ThemeRenderer
      themeSlug={data.theme_slug}
      heading={data.heading}
      description={data.description || undefined}
      eventDate={data.event_date || undefined}
      eventTime={data.event_time || undefined}
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
      registryImage={data.section_2_image}
      registryDescription={data.section_2_description}
      registryButtonText={data.section_2_button_text}
      registryButtonLink={data.section_2_button_link}
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
      eventProgram={eventProgram}
      showEventProgram={showEventProgram}
      showSongRequests={showSongRequests}
      showGuestPhotos={showGuestPhotos}
      showRsvp={showRsvp}
    />
  );
}
