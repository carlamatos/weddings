import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchUserPage, fetchUserPages, fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings } from '../lib/data';
import { auth } from '@/auth';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import '@/app/ui/wedding.css';

interface EventData {
  id: string;
  user_id: string;
  slug: string;
  banner_image: string;
  heading: string;
  main_content: string;
  event_date: string;
  event_time?: string;
  location: string;
  user_email: string;
  description: string;
  created_at: string;
  theme_slug?: string;
  url?: string;
  street_address?: string;
  unit_number?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  place_id?: string;
  formatted_address?: string;
  section_2_image?: string;
  section_2_description?: string;
  section_2_button_text?: string;
  section_2_button_link?: string;
  hero_eyebrow?: string;
  venue_name?: string;
  language?: string;
  plan_type?: string;
  user_phone?: string;
}

async function fetchEventData(slug: string): Promise<EventData | null> {
  const res = await fetchUserPage(slug);
  if (!res) return null;
  return {
    id: res.id,
    user_id: res.user_id,
    slug: res.slug,
    banner_image: res.banner_image,
    heading: res.heading,
    main_content: res.main_content,
    event_date: res.event_date,
    event_time: res.event_time || undefined,
    location: res.location,
    user_email: res.user_email,
    description: res.description,
    created_at: res.created_at,
    theme_slug: res.theme_slug || undefined,
    url: res.url || undefined,
    street_address: res.street_address || undefined,
    unit_number: res.unit_number || undefined,
    postal_code: res.postal_code || undefined,
    city: res.city || undefined,
    country: res.country || undefined,
    place_id: res.place_id || undefined,
    formatted_address: res.formatted_address || undefined,
    section_2_image: res.section_2_image || undefined,
    section_2_description: res.section_2_description || undefined,
    section_2_button_text: res.section_2_button_text || undefined,
    section_2_button_link: res.section_2_button_link || undefined,
    hero_eyebrow: res.hero_eyebrow || undefined,
    venue_name: res.venue_name || undefined,
    language: res.language || 'en',
    plan_type: res.plan_type || undefined,
    user_phone: res.user_phone || undefined,
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const slug = (await params).slug;
  const page = await fetchUserPage(slug);
  if (!page) return {};
  const description = page.description
    ? page.description.replace(/<[^>]*>/g, '').trim().slice(0, 140)
    : undefined;
  return {
    title: { absolute: page.heading || 'MyGala' },
    description: description || undefined,
  };
}

export async function generateStaticParams() {
  const res = await fetchUserPages();
  if (!res || res.length === 0) return [];
  return res.map((page) => ({ slug: page.slug }));
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [data, session] = await Promise.all([fetchEventData(slug), auth()]);
  const isPaid = data?.plan_type === 'paid';
  const [galleryImages, guestPhotosResult, guestSongsResult, pageSettings] = await Promise.all([
    data ? fetchGalleryImages(data.user_id) : Promise.resolve([]),
    data && isPaid ? fetchGuestPhotos(data.id, 0) : Promise.resolve({ photos: [], hasMore: false }),
    data && isPaid ? fetchGuestSongs(data.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    data ? fetchPageSettings(data.id) : Promise.resolve({} as Record<string, string>),
  ]);
  const heroObjectFit = (pageSettings['hero_object_fit'] as 'cover' | 'contain') ?? 'cover';
  if (!data) notFound();

  const isOwner = session?.user?.id === data.user_id;
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <>
      {/* Edit button — visible to page owner only */}
      {isOwner && (
        <Link href="/dashboard" className="edit-page-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit page
        </Link>
      )}

      <ThemeRenderer
        themeSlug={data.theme_slug}
        heading={data.heading}
        description={data.description || undefined}
        eventDate={data.event_date || undefined}
        eventTime={data.event_time}
        location={data.location}
        city={data.city}
        country={data.country}
        streetAddress={data.street_address}
        unitNumber={data.unit_number}
        postalCode={data.postal_code}
        formattedAddress={data.formatted_address}
        placeId={data.place_id}
        url={data.url}
        userPageId={String(data.id)}
        bannerImage={data.banner_image || undefined}
        userEmail={data.user_email || undefined}
        userPhone={data.user_phone || undefined}
        mapsKey={mapsKey}
        registryImage={data.section_2_image}
        registryDescription={data.section_2_description}
        registryButtonText={data.section_2_button_text}
        registryButtonLink={data.section_2_button_link}
        heroEyebrow={data.hero_eyebrow}
        venueName={data.venue_name}
        language={data.language}
        galleryImages={galleryImages}
        isPaid={isPaid}
        guestPhotos={guestPhotosResult.photos}
        guestPhotosHasMore={guestPhotosResult.hasMore}
        guestSongs={guestSongsResult.songs}
        guestSongsHasMore={guestSongsResult.hasMore}
        heroObjectFit={heroObjectFit}
      />
    </>
  );
}
