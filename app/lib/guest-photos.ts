// Guest Photos (the photo wall guests upload to). Free pages get it too, up
// to FREE_GUEST_PHOTO_LIMIT photos; Plus raises the limit. Shared by client
// and server, so no server-only imports.

export const FREE_GUEST_PHOTO_LIMIT = 50;
export const PLUS_GUEST_PHOTO_LIMIT = 500;

export function guestPhotoLimit(isPaid: boolean): number {
  return isPaid ? PLUS_GUEST_PHOTO_LIMIT : FREE_GUEST_PHOTO_LIMIT;
}

// Whether the section shows on the page. On Plus it's on unless switched off
// (as before); on a free page it's off until the host switches it on, so no
// existing free page starts taking uploads without its host choosing to.
export function areGuestPhotosOn(settings: Record<string, string>, isPaid: boolean): boolean {
  const value = settings['show_guest_photos'];
  return isPaid ? value !== 'false' : value === 'true';
}
