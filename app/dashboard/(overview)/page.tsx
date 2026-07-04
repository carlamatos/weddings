import Link from 'next/link';
import { auth } from '@/auth';
import { fetchUserPageById, fetchGalleryImages } from '@/app/lib/data';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import {
  EditableHeroEyebrow,
  EditableHeroName,
  EditableHeroDate,
  EditableDescription,
  EditableBannerBg,
} from '@/app/ui/themes/slots';
import { EditableGallery } from '@/app/ui/themes/GallerySection';

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const [userPage, galleryImages] = await Promise.all([
    userId ? fetchUserPageById(userId) : undefined,
    userId ? fetchGalleryImages(userId) : [],
  ]);

  if (!userPage) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: '#6B6470', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ fontSize: 16 }}>No event page yet.</p>
        <Link href="/dashboard/setup" style={{ color: '#B6584A', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          Create your event page →
        </Link>
      </div>
    );
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
        mapsKey={mapsKey}
        registryImage={userPage.section_2_image || undefined}
        registryDescription={userPage.section_2_description || undefined}
        registryButtonText={userPage.section_2_button_text || undefined}
        registryButtonLink={userPage.section_2_button_link || undefined}
        galleryImages={galleryImages}
        heroEyebrow={userPage.hero_eyebrow || undefined}
        venueName={userPage.venue_name || undefined}
        language={userPage.language || 'en'}
        editSlots={editSlots}
      />
    </div>
  );
}
