// Song Requests (Plus) are off unless the host switches them on — unlike most
// sections, which are on by default. Pages created before this default
// changed (2026-10-04) were switched on by POST /api/migrate, so they kept
// the section they had.
export function areSongRequestsOn(settings: Record<string, string>): boolean {
  return settings['show_song_requests'] === 'true';
}
