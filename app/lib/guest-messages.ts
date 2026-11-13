// The live messages wall (Live Party): guests leave a short message from the
// photo section of the event page; it rotates on the venue slideshow and is
// kept in the memories page. Off until the host switches it on. Client-safe.
export const GUEST_MESSAGES_SETTING = 'show_guest_messages';
export const GUEST_MESSAGE_NAME_MAX = 60;
export const GUEST_MESSAGE_BODY_MAX = 280;
export const GUEST_MESSAGES_SHOWN = 100; // newest messages the slideshow and memories load

export type GuestMessage = { id: number; name: string; body: string; hidden: boolean; created_at: string };

export function areGuestMessagesOn(settings: Record<string, string>): boolean {
  return settings[GUEST_MESSAGES_SETTING] === 'true';
}
