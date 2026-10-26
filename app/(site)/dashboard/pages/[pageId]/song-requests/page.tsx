import { fetchGuestSongs, fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { DashboardSongRequests } from '@/app/ui/themes/SongRequestSection';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { areSongRequestsOn } from '@/app/lib/song-requests';

export default async function SongRequestsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);


  const [{ songs, hasMore }, settings] = await Promise.all([
    fetchGuestSongs(userPage.id, 0),
    fetchPageSettings(userPage.id),
  ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/song-requests" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Song Requests</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          Songs requested by your guests. You can delete any entry.
        </p>
      </div>

      <SectionToggle
        pageId={Number(userPage.id)}
        settingName="show_song_requests" plusSection="/song-requests"
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
