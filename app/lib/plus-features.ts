// The Plus features as the dashboard presents them. A free page can set any
// of them up completely; only the step that shows it to guests (turning the
// section on, sending, connecting a domain) asks for Plus. Shared by client
// and server, so no server-only imports.

export type PlusFeature = {
  name: string;
  // The setting that shows it on the page. After paying from "turn on",
  // checkout switches it on, so the upgrade finishes what the host started.
  setting?: string;
  // What goes live once the page is on Plus, for the upgrade dialog.
  goesLive: string;
};

// Keyed by the section's path in the dashboard (see nav-links.tsx).
export const PLUS_FEATURES: Record<string, PlusFeature> = {
  '/reminders': { name: 'Event Reminders', goesLive: 'your reminder emails go out to guests on the schedule you set' },
  '/seating': { name: 'Find Your Table', setting: 'show_seating', goesLive: 'guests can look up their table from your QR sign or your page' },
  '/song-requests': { name: 'Song Requests', setting: 'show_song_requests', goesLive: 'guests can request songs from your page' },
  '/livestream': { name: 'Live Stream', setting: 'show_livestream', goesLive: 'your live stream shows on your page' },
  '/potluck': { name: 'Potluck', setting: 'show_potluck', goesLive: 'guests can sign up for what they’re bringing' },
  '/gift-exchange': { name: 'Gift Exchange', setting: 'show_gift_exchange', goesLive: 'guests can join your gift exchange and you can draw names' },
  '/custom-sections': { name: 'Custom Sections', setting: 'show_custom_sections', goesLive: 'your custom sections show on your page' },
  '/sponsors': { name: 'Sponsors', setting: 'show_sponsors', goesLive: 'your sponsors show on your page' },
  '/registry': { name: 'Registry', setting: 'show_registry', goesLive: 'your registry shows on your page' },
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
