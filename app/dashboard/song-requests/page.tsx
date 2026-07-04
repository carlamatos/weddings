import { auth } from '@/auth';
import { fetchUserPageById, fetchGuestSongs } from '@/app/lib/data';
import { DashboardSongRequests } from '@/app/ui/themes/SongRequestSection';
import Link from 'next/link';

export default async function SongRequestsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userPage = userId ? await fetchUserPageById(userId) : undefined;
  const isPaid = userPage?.plan_type === 'paid';

  if (!isPaid) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, padding: '60px 24px', textAlign: 'center', margin: '0 auto' }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', marginBottom: 10 }}>Song Requests</p>
        <p style={{ fontSize: 14, color: '#6B6470', marginBottom: 24 }}>
          The Song Requests feature is a Plus feature. Upgrade to let guests suggest songs for your playlist.
        </p>
        <Link href="/dashboard/domain" style={{ display: 'inline-block', padding: '10px 24px', background: '#B6584A', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          Upgrade to Plus
        </Link>
      </div>
    );
  }

  const { songs, hasMore } = userPage
    ? await fetchGuestSongs(userPage.id, 0)
    : { songs: [], hasMore: false };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Song Requests</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          Songs requested by your guests. You can delete any entry.
        </p>
      </div>

      <DashboardSongRequests
        initialSongs={songs}
        initialHasMore={hasMore}
        userPageId={String(userPage!.id)}
      />
    </div>
  );
}
