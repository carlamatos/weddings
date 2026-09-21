import { fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
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

export default async function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);
  const isPaid = userPage.plan_type === 'paid';
  const [galleryImages, guestPhotosResult, guestSongsResult, pageSettings] = await Promise.all([
    fetchGalleryImages(pageId),
    isPaid ? fetchGuestPhotos(userPage.id, 0) : Promise.resolve({ photos: [], hasMore: false }),
    isPaid ? fetchGuestSongs(userPage.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    fetchPageSettings(userPage.id),
  ]);
  const heroObjectFit = (pageSettings['hero_object_fit'] as 'cover' | 'contain') ?? 'cover';

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Build the date display string the same way each theme would
  const heroDateText = userPage.event_date
    ? (() => {
        const d = new Date(userPage.event_date + 'T00:00:00');
        const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const loc = [userPage.city, userPage.country].filter(Boolean).join(', ');
        return loc ? `${formatted} · ${loc}` : formatted;
      })()
    : '';

  const themeEyebrowDefault =
    userPage.theme_slug === 'midnight-botanical'
      ? 'Save the date'
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
        city={userPage.city || undefined}
        country={userPage.country || undefined}
      />
    ) : undefined,
    description: (
      <EditableDescription
        pageId={pageId}
        value={userPage.description || ''}
        style={{ fontSize: 17, lineHeight: 1.9, color: 'inherit', margin: 0 }}
      />
    ),
    gallery: <EditableGallery pageId={pageId} initialImages={galleryImages} isPaid={userPage.plan_type === 'paid'} />,
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
        editSlots={editSlots}
      />
    </div>
  );
}
