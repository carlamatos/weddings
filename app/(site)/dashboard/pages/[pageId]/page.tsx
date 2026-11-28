import { fetchGalleryImages, fetchGuestPhotos, fetchGuestSongs, fetchPageSettings, fetchEventProgram, isSectionOn, fetchPlusContent, registryProps, potluckProps, giftExchangeProps } from '@/app/lib/data';
import { heroEyebrowDefault, isDefaultHeroEyebrow } from '@/app/ui/themes/hero-eyebrow';
import { areGuestMessagesOn } from '@/app/lib/guest-messages';
import { isRsvpSongOn } from '@/app/lib/rsvp-song';
import { rsvpFormFromSettings } from '@/app/lib/rsvp-form-options';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { signPageId } from '@/app/lib/page-token';
import { isPagePaidAndLive } from '@/app/lib/plans';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import { livestreamFromSettings } from '@/app/lib/livestream';
import { sectionTextFromSettings } from '@/app/lib/section-text';
import { sectionBackgroundsFromSettings } from '@/app/lib/section-background';
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
import { areSongRequestsOn } from '@/app/lib/song-requests';
import { isHeroObjectPosition } from '@/app/ui/themes/hero-media';
import { heroOverlayFromSettings } from '@/app/ui/themes/hero-overlay';
import { heroStyleFromSettings } from '@/app/ui/themes/hero-style';
import EditorCanvas from '@/app/ui/themes/EditorCanvas';
import { auth } from '@/auth';
import { UNVERIFIED_UPLOADS_PER_DAY } from '@/app/lib/require-verified';
import { isRsvpGuestListOnly } from '@/app/lib/rsvp-settings';
import { mealOptionsFromSettings } from '@/app/lib/rsvp-meals';
import { areGuestPhotosOn } from '@/app/lib/guest-photos';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Event Page' };

export default async function Page({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  // Unverified accounts see "Verify your email to publish your event." in the editor bar.
  const verifiedEmail = (await auth())?.user?.verifiedEmail ?? true;
  const pageId = Number(userPage.id);
  const isPaid = isPagePaidAndLive(userPage);
  const [galleryImages, guestPhotosResult, guestSongsResult, pageSettings, eventProgram] = await Promise.all([
    fetchGalleryImages(pageId),
    fetchGuestPhotos(userPage.id, 0),
    isPaid ? fetchGuestSongs(userPage.id, 0) : Promise.resolve({ songs: [], hasMore: false }),
    fetchPageSettings(userPage.id),
    fetchEventProgram(pageId),
  ]);
  const heroObjectFit = (pageSettings['hero_object_fit'] as 'cover' | 'contain') ?? 'cover';
  const heroObjectPosition = isHeroObjectPosition(pageSettings['hero_object_position']) ? pageSettings['hero_object_position'] : undefined;
  const heroOverlay = heroOverlayFromSettings(pageSettings);
  const heroStyle = heroStyleFromSettings(pageSettings);
  const showEventProgram = isSectionOn(pageSettings, 'show_event_program');
  const showSongRequests = areSongRequestsOn(pageSettings);
  // Free pages get Guest Photos too (up to FREE_GUEST_PHOTO_LIMIT).
  const showGuestPhotos = areGuestPhotosOn(pageSettings, isPaid);
  const showRsvp = isSectionOn(pageSettings, 'show_rsvp');
  const showShare = isSectionOn(pageSettings, 'show_share');
  const shareHashtag = normalizeHashtag(pageSettings['share_hashtag']) || undefined;
  const sectionText = sectionTextFromSettings(pageSettings);

  const [plusContent, potluck, giftExchange] = await Promise.all([
    fetchPlusContent(pageId, isPaid, pageSettings),
    potluckProps(pageId, isPaid, pageSettings),
    giftExchangeProps(pageId, isPaid, pageSettings),
  ]);
  // The event page's map (Maps Embed: free, and shown on hosts' own domains
  // too) has its own key, restricted to that API only; the billed autocomplete
  // key is locked to MyGala's addresses. Falls back to that one until it's set.
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Build the date display string the same way each theme would
  const heroDateText = userPage.event_date
    ? (() => {
        const formatted = formatDateRange(userPage.event_date, userPage.event_end_date, 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const loc = [userPage.city, userPage.country].filter(Boolean).join(', ');
        return loc ? `${formatted} · ${loc}` : formatted;
      })()
    : '';

  // The banner's top line: the host's own, or the theme's in the page's
  // language (a saved copy of a theme default counts as not written).
  const ownEyebrow = isDefaultHeroEyebrow(userPage.theme_slug, userPage.hero_eyebrow) ? '' : userPage.hero_eyebrow || '';
  const themeEyebrowDefault = heroEyebrowDefault(userPage.theme_slug, userPage.language);

  const themeEyebrowClass =
    userPage.theme_slug === 'midnight-botanical'
      ? 'eyebrow on-dark hero-eyebrow'
      : userPage.theme_slug === 'quiet-coastal' || userPage.theme_slug === 'vilma'
      ? 'eyebrow hero-eyebrow'
      : 'hero-eyebrow';

  // The date and place editor: the banner's date (when there is one) and
  // the editor bar's "Edit date & location" button.
  const heroDateProps = {
    pageId,
    displayText: heroDateText,
    initialColor: heroStyle.text.date,
    eventDate: userPage.event_date || undefined,
    eventTime: userPage.event_time || undefined,
    eventEndDate: userPage.event_end_date || undefined,
    eventEndTime: userPage.event_end_time || undefined,
    city: userPage.city || undefined,
    country: userPage.country || undefined,
    location: userPage.location === 'virtual' ? 'virtual' as const : 'address' as const,
    eventUrl: userPage.url || '',
    address: {
      venueName: userPage.venue_name || undefined,
      streetAddress: userPage.street_address || undefined,
      unitNumber: userPage.unit_number || undefined,
      postalCode: userPage.postal_code || undefined,
      placeId: userPage.place_id || undefined,
      formattedAddress: userPage.formatted_address || undefined,
    },
  };

  const editSlots = {
    heroEditPageId: pageId,
    heroBg: (
      <EditableBannerBg
        pageId={pageId}
        {...heroFallbackFor(userPage.theme_slug)}
        src={userPage.banner_image || ''}
        initialObjectFit={heroObjectFit}
        initialObjectPosition={heroObjectPosition}
        initialOverlayColor={pageSettings['hero_overlay_color']}
        initialOverlayOpacity={pageSettings['hero_overlay_opacity']}
      />
    ),
    heroEyebrow: (
      <EditableHeroEyebrow
        pageId={pageId}
        value={ownEyebrow || themeEyebrowDefault}
        className={themeEyebrowClass}
        initialColor={heroStyle.text.eyebrow}
      />
    ),
    heroName: (
      <EditableHeroName
        pageId={pageId}
        value={userPage.heading || ''}
        initialColor={heroStyle.text.name}
      />
    ),
    // Keyed on the text, so a save from the bar's button (below) shows here
    // once the page refreshes.
    heroDate: heroDateText ? <EditableHeroDate key={heroDateText} {...heroDateProps} /> : undefined,
    description: (
      <EditableDescription
        pageId={pageId}
        value={userPage.description || ''}
        initialColor={pageSettings.story_text_color ?? ''}
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
    <div className="dash-editor-bleed">
      <EditorCanvas
        unverified={verifiedEmail ? undefined : { uploadsPerDay: UNVERIFIED_UPLOADS_PER_DAY }}
        // Keyed on what it edits, so it starts from the saved values again
        // after a save refreshes the page.
        dateButton={<EditableHeroDate key={JSON.stringify(heroDateProps)} {...heroDateProps} asButton />}
      >
      <ThemeRenderer
        rsvpGuestListOnly={isRsvpGuestListOnly(pageSettings)}
        rsvpMeals={mealOptionsFromSettings(pageSettings, userPage.language)}
        rsvpAskSong={isRsvpSongOn(pageSettings)}
        rsvpForm={rsvpFormFromSettings(pageSettings)}
        guestMessagesOn={isPaid && areGuestMessagesOn(pageSettings)}
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
        galleryToken={signPageId(pageId)}
        {...registryProps(userPage, isPaid, pageSettings)}
        galleryImages={galleryImages}
        heroEyebrow={ownEyebrow || undefined}
        venueName={userPage.venue_name || undefined}
        language={userPage.language || 'en'}
        isPaid={isPaid}
        guestPhotos={guestPhotosResult.photos}
        guestPhotosHasMore={guestPhotosResult.hasMore}
        guestSongs={guestSongsResult.songs}
        guestSongsHasMore={guestSongsResult.hasMore}
        heroObjectFit={heroObjectFit}
        heroObjectPosition={heroObjectPosition}
        heroOverlay={heroOverlay}
        heroStyle={heroStyle}
        eventProgram={eventProgram}
        showEventProgram={showEventProgram}
        showSongRequests={showSongRequests}
        showGuestPhotos={showGuestPhotos}
        showRsvp={showRsvp}
        showShare={showShare}
        shareHashtag={shareHashtag}
        sectionText={sectionText}
        sectionBackgrounds={sectionBackgroundsFromSettings(pageSettings)}
        customSections={plusContent.customSections}
        sponsors={plusContent.sponsors}
        livestream={livestreamFromSettings(pageSettings, isPaid)}
        potluck={potluck}
        giftExchange={giftExchange}
        sectionTextPageId={pageId}
        shareUrl={publicPageUrl(userPage)}
        editSlots={editSlots}
      />
      </EditorCanvas>
    </div>
  );
}
