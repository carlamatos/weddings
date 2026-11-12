// The free song question on the RSVP form: "A song that will get you on the
// dance floor". Off until the host switches it on in Guests & RSVPs (the
// setting is show_rsvp_song, so updatePageSetting already accepts it).
// Answers are saved as song requests, so the host sees them in Song Requests
// even without Live Party; the public song request section stays Live Party.
export const RSVP_SONG_SETTING = 'show_rsvp_song';
export const RSVP_SONG_MAX = 120;

export function isRsvpSongOn(settings: Record<string, string>): boolean {
  return settings[RSVP_SONG_SETTING] === 'true';
}
