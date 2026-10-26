import { sql } from '@vercel/postgres';
import { fetchGuestPhotos, fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { publicPageUrl } from '@/app/lib/share';
import { areGuestPhotosOn, guestPhotoLimit } from '@/app/lib/guest-photos';
import { isPagePaidAndLive } from '@/app/lib/plans';
import { DashboardGuestPhotos } from '@/app/ui/themes/GuestPhotoSection';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PhotoQrCard } from '@/app/ui/dashboard/photo-qr-card';
import { GuestPhotoAllowance } from '@/app/ui/dashboard/guest-photo-allowance';

// Guest Photos is free up to FREE_GUEST_PHOTO_LIMIT photos; Plus raises the
// limit. Free pages start with the section off.
export default async function GuestPhotosPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const paid = isPagePaidAndLive(userPage);

  const [{ photos, hasMore }, settings, total] = await Promise.all([
    fetchGuestPhotos(userPage.id, 0),
    fetchPageSettings(userPage.id),
    sql<{ count: string }>`SELECT COUNT(*)::text AS count FROM guests_photos WHERE user_page_id = ${userPage.id}`
      .then((r) => Number(r.rows[0]?.count ?? 0))
      .catch(() => 0),
  ]);
  const on = areGuestPhotosOn(settings, paid);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Guest Photos</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Guests share their photos straight from your event page, and everyone can browse them. You can delete any photo,
          and download them all at once.
        </p>
      </div>

      <SectionToggle pageId={Number(userPage.id)} settingName="show_guest_photos" initialOn={on} />

      <GuestPhotoAllowance used={total} limit={guestPhotoLimit(paid)} paid={paid} />

      <PhotoQrCard
        uploadUrl={`${publicPageUrl(userPage)}#photos`}
        heading={userPage.heading || ''}
        sectionOn={on}
      />

      <DashboardGuestPhotos
        initialPhotos={photos}
        initialHasMore={hasMore}
        userPageId={String(userPage.id)}
      />
    </div>
  );
}
