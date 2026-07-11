import Link from 'next/link';
import { auth } from '@/auth';
import { fetchUserPageById, fetchUserPlan, fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings } from '@/app/lib/data';
import PlanPicker from '@/app/ui/dashboard/PlanPicker';
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

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const [userPage, userPlan, galleryImages] = await Promise.all([
    userId ? fetchUserPageById(userId) : undefined,
    userId ? fetchUserPlan(userId) : null,
    userId ? fetchGalleryImages(userId) : [],
  ]);
  const isPaid = userPage?.plan_type === 'paid';
  const [guestPhotosResult, guestSongsResult, pageSettings] = await Promise.all([
    userPage && isPaid ? fetchGuestPhotos(userPage.id, 0) : Promise.resolve({ photos: [], hasMore: false }),
    userPage && isPaid ? fetchGuestSongs(userPage.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    userPage ? fetchPageSettings(userPage.id) : Promise.resolve({} as Record<string, string>),
  ]);
  const heroObjectFit = (pageSettings['hero_object_fit'] as 'cover' | 'contain') ?? 'cover';

  if (!userPage) {
    if (userPlan?.plan_type === 'paid') {
      return (
        <div style={{ padding: '60px 24px', maxWidth: 480, margin: '0 auto', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EAF2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>✓</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#241F2B', margin: '0 0 10px' }}>Premium plan active</h1>
          <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 28px', lineHeight: 1.6 }}>
            Your payment was confirmed. Now let&apos;s create your wedding website.
          </p>
          <Link
            href="/dashboard/setup"
            style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 999, background: '#8c9eac', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
          >
            Create your event page →
          </Link>
        </div>
      );
    }
    return <PlanPicker />;
  }

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
        src={userPage.banner_image || ''}
        initialObjectFit={heroObjectFit}
      />
    ),
    heroEyebrow: (
      <EditableHeroEyebrow
        value={userPage.hero_eyebrow || themeEyebrowDefault}
        className={themeEyebrowClass}
      />
    ),
    heroName: (
      <EditableHeroName
        value={userPage.heading || ''}
      />
    ),
    heroDate: heroDateText ? (
      <EditableHeroDate
        displayText={heroDateText}
        eventDate={userPage.event_date || undefined}
        eventTime={userPage.event_time || undefined}
        city={userPage.city || undefined}
        country={userPage.country || undefined}
      />
    ) : undefined,
    description: (
      <EditableDescription
        value={userPage.description || ''}
        style={{ fontSize: 17, lineHeight: 1.9, color: 'inherit', margin: 0 }}
      />
    ),
    gallery: <EditableGallery initialImages={galleryImages} isPaid={userPage.plan_type === 'paid'} />,
    footerContact: (
      <EditableContactInfo
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
