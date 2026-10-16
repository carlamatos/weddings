import { fetchGuestPhotos, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { publicPageUrl } from '@/app/lib/share';
import { DashboardGuestPhotos } from '@/app/ui/themes/GuestPhotoSection';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PhotoQrCard } from '@/app/ui/dashboard/photo-qr-card';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { isPagePaidAndLive } from '@/app/lib/plans';

export default async function GuestPhotosPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);


  const [{ photos, hasMore }, settings] = await Promise.all([
    fetchGuestPhotos(userPage.id, 0),
    fetchPageSettings(userPage.id),
  ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/guest-photos" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Guest Photos</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          Photos shared by your guests on your event page. You can delete any photo.
        </p>
      </div>

      <SectionToggle
        pageId={Number(userPage.id)}
        settingName="show_guest_photos" plusSection="/guest-photos"
        initialOn={isSectionOn(settings, 'show_guest_photos')}
      />

      <PhotoQrCard
        uploadUrl={`${publicPageUrl(userPage)}#photos`}
        heading={userPage.heading || ''}
        sectionOn={isPagePaidAndLive(userPage) && isSectionOn(settings, 'show_guest_photos')}
      />

      <DashboardGuestPhotos
        initialPhotos={photos}
        initialHasMore={hasMore}
        userPageId={String(userPage.id)}
      />
    </div>
  );
}
