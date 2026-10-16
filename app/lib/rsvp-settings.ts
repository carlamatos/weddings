// RSVP settings shared by the RSVP API and the dashboard.
// No server-only imports, so client components can use it.

// Only guests already on the guest list may RSVP: the reply has to match a
// guest's email address. Off by default; set on the RSVP screen.
export const RSVP_GUEST_LIST_ONLY_SETTING = 'rsvp_guest_list_only';

export function isRsvpGuestListOnly(settings: Record<string, string>): boolean {
  return settings[RSVP_GUEST_LIST_ONLY_SETTING] === 'true';
}
