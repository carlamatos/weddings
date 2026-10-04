import { fetchGuestSongs, fetchPageSettings } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { hasExpiredPlan } from '@/app/lib/plans';
import { DashboardSongRequests } from '@/app/ui/themes/SongRequestSection';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import Link from 'next/link';
import { areSongRequestsOn } from '@/app/lib/song-requests';

export default async function SongRequestsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const isPaid = userPage.plan_type === 'paid';

  if (!isPaid) {
    const expired = hasExpiredPlan(userPage);
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, padding: '60px 24px', textAlign: 'center', margin: '0 auto' }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', marginBottom: 10 }}>Song Requests</p>
        <p style={{ fontSize: 14, color: '#6B6470', marginBottom: 24 }}>
          {expired
            ? 'Your Plus term has ended. Extend to bring Song Requests back.'
            : 'The Song Requests feature is a Plus feature. Upgrade to let guests suggest songs for your playlist.'}
        </p>
        <Link href={pagePath(userPage.id, '/domain')} style={{ display: 'inline-block', padding: '10px 24px', background: '#B6584A', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          {expired ? 'Extend Plus' : 'Upgrade to Plus'}
        </Link>
      </div>
    );
  }

  const [{ songs, hasMore }, settings] = await Promise.all([
    fetchGuestSongs(userPage.id, 0),
    fetchPageSettings(userPage.id),
  ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Song Requests</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          Songs requested by your guests. You can delete any entry.
        </p>
      </div>

      <SectionToggle
        pageId={Number(userPage.id)}
        settingName="show_song_requests"
        initialOn={areSongRequestsOn(settings)}
      />

      <DashboardSongRequests
        initialSongs={songs}
        initialHasMore={hasMore}
        userPageId={String(userPage.id)}
      />
    </div>
  );
}
