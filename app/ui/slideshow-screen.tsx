import type { UserPage } from '@/app/lib/definitions';
import { fetchPageSettings } from '@/app/lib/data';
import { signPageId } from '@/app/lib/page-token';
import { mustShowPasswordGate } from '@/app/lib/page-gate';
import { getTranslations } from '@/app/lib/translations';
import { areGuestPhotosOn } from '@/app/lib/guest-photos';
import { isSlideshowLive } from '@/app/lib/slideshow';
import { fetchSlideshowPhotos } from '@/app/lib/slideshow-data';
import { publicPageUrl } from '@/app/lib/share';
import PagePasswordGate from '@/app/ui/page-password-gate';
import PhotoSlideshow from '@/app/ui/photo-slideshow';
import { areGuestMessagesOn } from '@/app/lib/guest-messages';
import { fetchGuestMessages } from '@/app/lib/guest-messages-data';

// The live photo slideshow for a page, at mygala.ca/<slug>/slideshow and
// <custom domain>/slideshow. Plays for guests on a Live Party page with Guest
// Photos on; the owner can always open it to try it.
export default async function SlideshowScreen({ page, isOwner }: { page: UserPage; isOwner: boolean }) {
  const isPaid = page.plan_type === 'paid';
  const settings = await fetchPageSettings(page.id);
  const t = getTranslations(page.language || 'en');

  if (await mustShowPasswordGate(page.id, settings, isPaid, isOwner)) {
    return <PagePasswordGate token={signPageId(page.id)} t={t} />;
  }

  const photosOn = areGuestPhotosOn(settings, isPaid);
  const live = isSlideshowLive(isPaid, photosOn);
  if (!live && !isOwner) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#0d0b10', color: 'rgba(255,255,255,.8)', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <p style={{ fontSize: 18, maxWidth: 480, lineHeight: 1.6 }}>{t.slideshowUnavailable}</p>
      </main>
    );
  }

  const photos = await fetchSlideshowPhotos(page.id).catch((error) => {
    console.error('Failed to load slideshow photos:', error);
    return [];
  });

  // The live messages wall rotates over the photos (Live Party).
  const messagesOn = isPaid && areGuestMessagesOn(settings);
  const messages = messagesOn
    ? (await fetchGuestMessages(page.id).catch(() => [])).map(({ id, name, body }) => ({ id, name, body }))
    : [];

  return (
    <PhotoSlideshow
      messagesOn={messagesOn}
      initialMessages={messages}
      token={signPageId(page.id)}
      heading={page.heading}
      initialPhotos={photos}
      uploadUrl={`${publicPageUrl(page)}#photos`}
      strings={{ share: t.slideshowShare, scan: t.slideshowScan, empty: t.slideshowEmpty, justShared: t.slideshowJustShared }}
      preview={live ? undefined
        : !isPaid ? 'Preview: only you can see this. The slideshow plays for everyone once this event is on Live Party.'
        : 'Preview: only you can see this. Switch on Guest Photos in your dashboard so guests can open the slideshow and add photos.'}
    />
  );
}
