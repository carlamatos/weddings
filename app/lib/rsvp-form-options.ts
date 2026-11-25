// RSVP form choices a host makes in Guests & RSVPs → RSVP form settings.
//   rsvp_allow_party: 'false' = one person per reply (no "how many people"
//     counter, every reply counts as 1). Unset or 'true' = guests can reply
//     for their party, as before.
//   rsvp_accept_text / rsvp_decline_text: the host's own wording for the two
//     choices ("Joyfully accepts" / "Regretfully declines"); '' = the usual
//     wording in the page's language (app/lib/translations.ts).
// Client-safe: no server imports.

export const RSVP_ALLOW_PARTY_SETTING = 'rsvp_allow_party';
export const RSVP_ACCEPT_TEXT_SETTING = 'rsvp_accept_text';
export const RSVP_DECLINE_TEXT_SETTING = 'rsvp_decline_text';
export const RSVP_CHOICE_TEXT_MAX = 80;

export type RsvpFormOptions = { onePerson: boolean; acceptText: string; declineText: string };

export const cleanRsvpChoiceText = (v: string) => v.replace(/\s+/g, ' ').trim().slice(0, RSVP_CHOICE_TEXT_MAX);

export function rsvpFormFromSettings(settings: Record<string, string>): RsvpFormOptions {
  return {
    onePerson: settings[RSVP_ALLOW_PARTY_SETTING] === 'false',
    acceptText: cleanRsvpChoiceText(settings[RSVP_ACCEPT_TEXT_SETTING] ?? ''),
    declineText: cleanRsvpChoiceText(settings[RSVP_DECLINE_TEXT_SETTING] ?? ''),
  };
}
