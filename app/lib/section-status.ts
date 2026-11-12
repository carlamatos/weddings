import type { UserPage } from './definitions';
import { isSectionOn } from './data';
import { isPagePaidAndLive } from './plans';
import { areSponsorsOn } from './custom-sections';
import { livestreamFromSettings } from './livestream';
import { isPotluckOn } from './potluck';
import { isPageLocked } from './page-password';
import { parseReminderSchedule } from './reminders';
import { areSongRequestsOn } from './song-requests';
import { isGiftExchangeOn } from './gift-exchange';
import { areGuestPhotosOn } from './guest-photos';
import { isSeatingOn } from './seating';
import { areGuestMessagesOn } from './guest-messages';

// Whether each dashboard section is currently ON for this page, keyed by the
// section's path in the sidebar (see nav-links.tsx). Follows the same rules
// the public page uses: most sections default on, Live Party ones need the
// page to be paid, and Potluck, Gift Exchange, Sponsors, Song Requests and
// Password are off until switched on. Potluck, Gift Exchange, Custom
// Sections and Registry are free on every page.
export function sectionStatus(page: UserPage, settings: Record<string, string>): Record<string, boolean> {
  const paid = isPagePaidAndLive(page);
  return {
    '/guest-list': isSectionOn(settings, 'show_rsvp'),
    '/potluck': isPotluckOn(settings),
    '/gift-exchange': isGiftExchangeOn(settings),
    '/guest-photos': areGuestPhotosOn(settings, paid),
    '/seating': isSeatingOn(settings, paid),
    '/livestream': paid && !!livestreamFromSettings(settings, paid),
    '/song-requests': paid && areSongRequestsOn(settings),
    '/messages': paid && areGuestMessagesOn(settings),
    '/reminders': paid && parseReminderSchedule(settings['reminder_schedule']).length > 0,
    '/event-program': isSectionOn(settings, 'show_event_program'),
    '/custom-sections': isSectionOn(settings, 'show_custom_sections'),
    '/sponsors': paid && areSponsorsOn(settings),
    '/registry': isSectionOn(settings, 'show_registry'),
    '/password': isPageLocked(settings, paid),
    '/domain': paid && !!page.custom_domain && page.domain_status === 'active',
  };
}
