// The Live Party features as the dashboard presents them. A free page can set any
// of them up completely; only the step that shows it to guests (turning the
// section on, sending, connecting a domain) asks for Live Party. Shared by client
// and server, so no server-only imports.

export type PlusFeature = {
  name: string;
  // The setting that shows it on the page. After paying from "turn on",
  // checkout switches it on, so the upgrade finishes what the host started.
  setting?: string;
  // What goes live once the page is on Live Party, for the upgrade dialog.
  goesLive: string;
};

// Keyed by the section's path in the dashboard (see nav-links.tsx).
export const PLUS_FEATURES: Record<string, PlusFeature> = {
  '/reminders': { name: 'Event Reminders', goesLive: 'your reminder emails go out to guests on the schedule you set' },
  '/seating': { name: 'Find Your Table', setting: 'show_seating', goesLive: 'guests can look up their table from your QR sign or your page' },
  '/messages': { name: 'Messages Wall', setting: 'show_guest_messages', goesLive: 'guests can leave messages that rotate on your photo slideshow' },
  '/slideshow': { name: 'Photo Slideshow', goesLive: 'your photo slideshow plays on any screen at your event' },
  '/song-requests': { name: 'Song Requests', setting: 'show_song_requests', goesLive: 'guests can request songs from your page' },
  '/livestream': { name: 'Live Stream', setting: 'show_livestream', goesLive: 'your live stream shows on your page' },
  '/sponsors': { name: 'Sponsors', setting: 'show_sponsors', goesLive: 'your sponsors show on your page' },
  '/password': { name: 'Password Protection', setting: 'password_protect', goesLive: 'only guests with the password can open your page' },
  '/domain': { name: 'Custom Domain', goesLive: 'your own domain points to your page' },
};

// Settings checkout may switch on after payment.
export const PLUS_ENABLE_SETTINGS = new Set(
  Object.values(PLUS_FEATURES).map((f) => f.setting).filter((s): s is string => !!s),
);

// A dashboard screen of this page to come back to after checkout:
// /dashboard/pages/<id> or /dashboard/pages/<id>/<section>.
export function isPageReturnPath(path: unknown, pageId: number): path is string {
  return typeof path === 'string' && new RegExp(`^/dashboard/pages/${pageId}(/[a-z-]+)?$`).test(path);
}
