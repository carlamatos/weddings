// The live photo slideshow (Plus): <page>/slideshow plays the guests'
// photos full screen on a TV or projector at the venue, and new uploads
// join the show as they arrive. Shared by client and server, so no
// server-only imports.

export const SLIDESHOW_PATH = '/slideshow';
// Photos loaded when the slideshow opens; newer ones are fetched as they arrive.
export const SLIDESHOW_INITIAL_PHOTOS = 300;
export const SLIDESHOW_POLL_MS = 15_000;
export const SLIDESHOW_SPEEDS = [5, 8, 12] as const; // seconds per photo
export const SLIDESHOW_DEFAULT_SPEED = 8;

// It plays for guests on a Plus page with Guest Photos on; the owner can
// always open it to try it out.
export function isSlideshowLive(isPaid: boolean, guestPhotosOn: boolean): boolean {
  return isPaid && guestPhotosOn;
}
