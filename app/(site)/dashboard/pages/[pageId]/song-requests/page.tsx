import { fetchGuestSongs, fetchPageSettings } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { isRsvpSongOn } from '@/app/lib/rsvp-song';
import Link from 'next/link';
import { DashboardSongRequests } from '@/app/ui/themes/SongRequestSection';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { areSongRequestsOn } from '@/app/lib/song-requests';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import { DjLink } from '@/app/ui/dashboard/dj-link';
import { djKey } from '@/app/lib/dj-token';
import { siteUrl } from '@/app/lib/site-url';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Song Requests' };

export default async function SongRequestsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);


  const [{ songs, hasMore }, settings] = await Promise.all([
    fetchGuestSongs(userPage.id, 0),
    fetchPageSettings(userPage.id),
  ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/song-requests" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.songRequests.songRequests}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          {d.songRequests.songsRequestedByYourGuests}
          {' '}<HelpLink guide="take-song-requests" />
        </p>
      </div>

      {/* On a free page, the free way in: songs from the RSVP form land here
          (app/lib/rsvp-song.ts); the section on the page is Live Party. */}
      {userPage.plan_type !== 'paid' && (
        <div style={{ border: '1px solid #CFE3D5', background: '#F2F8F4', borderRadius: 10, padding: '12px 14px', margin: '0 0 18px', fontSize: 14, lineHeight: 1.55, color: '#241F2B' }}>
          {isRsvpSongOn(settings) ? (
            <p style={{ margin: 0 }}>{d.songRequests.rsvpSongsFree}</p>
          ) : (
            <p style={{ margin: 0 }}>
              {d.songRequests.rsvpSongsOff}{' '}
              <Link href={`${pagePath(userPage.id, '/guest-list')}#rsvp-song`} style={{ color: '#B6584A', fontWeight: 600 }}>{d.songRequests.rsvpSongsOffLink}</Link>
            </p>
          )}
          <p style={{ margin: '6px 0 0', color: '#6B6470', fontSize: 13 }}>{d.songRequests.rsvpSongsPlus}</p>
        </div>
      )}

      <SectionToggle
        pageId={Number(userPage.id)}
        settingName="show_song_requests" plusSection="/song-requests"
        initialOn={areSongRequestsOn(settings)}
      />

      {userPage.plan_type === 'paid' && <DjLink url={`${siteUrl()}/${userPage.slug}/dj?k=${djKey(userPage.id)}`} />}

      <DashboardSongRequests
        initialSongs={songs}
        initialHasMore={hasMore}
        userPageId={String(userPage.id)}
      />
    </div>
  );
}
