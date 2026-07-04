import { auth } from '@/auth';
import { fetchUserPageById, fetchGuestPhotos } from '@/app/lib/data';
import { DashboardGuestPhotos } from '@/app/ui/themes/GuestPhotoSection';
import Link from 'next/link';

export default async function GuestPhotosPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userPage = userId ? await fetchUserPageById(userId) : undefined;
  const isPaid = userPage?.plan_type === 'paid';

  if (!isPaid) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, padding: '60px 24px', textAlign: 'center', margin: '0 auto' }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', marginBottom: 10 }}>Guest Photos</p>
        <p style={{ fontSize: 14, color: '#6B6470', marginBottom: 24 }}>
          The Guest Photo Wall is a Plus feature. Upgrade to let guests share photos directly on your event page.
        </p>
        <Link href="/dashboard/domain" style={{ display: 'inline-block', padding: '10px 24px', background: '#B6584A', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          Upgrade to Plus
        </Link>
      </div>
    );
  }

  const { photos, hasMore } = userPage
    ? await fetchGuestPhotos(userPage.id, 0)
    : { photos: [], hasMore: false };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Guest Photos</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          Photos shared by your guests on your event page. You can delete any photo.
        </p>
      </div>

      <DashboardGuestPhotos
        initialPhotos={photos}
        initialHasMore={hasMore}
        userPageId={String(userPage!.id)}
      />
    </div>
  );
}
