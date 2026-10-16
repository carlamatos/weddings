// RSVP settings shared by the RSVP API and the dashboard.
// No server-only imports, so client components can use it.

// Only guests already on the guest list may RSVP: the reply has to match a
// guest's email or phone number. Off by default; set on the RSVP screen.
export const RSVP_GUEST_LIST_ONLY_SETTING = 'rsvp_guest_list_only';

export function isRsvpGuestListOnly(settings: Record<string, string>): boolean {
  return settings[RSVP_GUEST_LIST_ONLY_SETTING] === 'true';
}

// A phone number's digits for matching: "+1 (416) 555-0199" and
// "416-555-0199" are the same guest. The last 10 digits are compared, so a
// country code on one side only still matches; under 7 digits isn't a number.
export function phoneMatchKey(phone: unknown): string {
  const digits = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
  return digits.length >= 7 ? digits.slice(-10) : '';
}
