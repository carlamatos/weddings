import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { eventPageMetadata, publicPageUrl, withSearchVisibility } from '@/app/lib/share';
import Link from 'next/link';
import { fetchUserPage, fetchUserPages, fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings, fetchEventProgram, isSectionOn, fetchPlusContent, registryProps, potluckProps, giftExchangeProps } from '../lib/data';
import { auth } from '@/auth';
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
import { appHref } from '@/app/lib/app-url';
import { isPageOffline } from '@/app/lib/page-status';
import { areSongRequestsOn } from '@/app/lib/song-requests';
import { isHeroObjectPosition } from '@/app/ui/themes/hero-media';

interface EventData {
  id: string;
  user_id: string;
  slug: string;
  banner_image: string;
  heading: string;
  main_content: string;
  event_date: string;
  event_time?: string;
  event_end_date?: string;
  event_end_time?: string;
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
  status?: string;
  user_phone?: string;
  share_url: string;
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
    event_end_date: res.event_end_date || undefined,
    event_end_time: res.event_end_time || undefined,
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
    status: res.status || 'active',
    user_phone: res.user_phone || undefined,
    share_url: publicPageUrl(res),
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const slug = (await params).slug;
  const page = await fetchUserPage(slug);
  if (!page) return {};
  const settings = await fetchPageSettings(page.id);
  if (isPageLocked(settings, page.plan_type === 'paid')) return LOCKED_PAGE_METADATA;
  return withSearchVisibility(eventPageMetadata(page), settings);
}

export async function generateStaticParams() {
  const res = await fetchUserPages();
  if (!res || res.length === 0) return [];
  return res.map((page) => ({ slug: page.slug }));
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [data, session] = await Promise.all([fetchEventData(slug), auth()]);
  if (!data) notFound();
  if (isPageOffline(data.status)) return <PageUnavailable />;
  const isPaid = data.plan_type === 'paid';
  const isOwner = session?.user?.id === data.user_id;
  const pageSettings = await fetchPageSettings(data.id);

  // Password protected (Plus): nothing about the event until the guest
  // enters the password. The owner always sees the page.
  if (await mustShowPasswordGate(data.id, pageSettings, isPaid, isOwner)) {
    return <PagePasswordGate token={signPageId(data.id)} t={getTranslations(data.language)} />;
  }

  const [galleryImages, guestPhotosResult, guestSongsResult, eventProgram, potluck, giftExchange] = await Promise.all([
    fetchGalleryImages(data.id),
    isPaid ? fetchGuestPhotos(data.id, 0) : Promise.resolve({ photos: [], hasMore: false }),
    isPaid ? fetchGuestSongs(data.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    fetchEventProgram(data.id),
    potluckProps(data.id, isPaid, pageSettings),
    giftExchangeProps(data.id, isPaid, pageSettings),
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
    <>
      {/* Edit button — visible to page owner only */}
      {isOwner && (
        <Link href={appHref('/dashboard')} className="edit-page-btn">
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
        eventEndDate={data.event_end_date}
        eventEndTime={data.event_end_time}
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
        galleryToken={isPaid ? signPageId(data.id) : undefined}
        bannerImage={data.banner_image || undefined}
        userEmail={data.user_email || undefined}
        userPhone={data.user_phone || undefined}
        mapsKey={mapsKey}
        {...registryProps(data, isPaid, pageSettings)}
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
        giftExchange={giftExchange}
        shareUrl={data.share_url}
        isLoggedIn={!!session?.user}
      />
    </>
  );
}
