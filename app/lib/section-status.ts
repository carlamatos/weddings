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

// Whether each dashboard section is currently ON for this page, keyed by the
// section's path in the sidebar (see nav-links.tsx). Follows the same rules
// the public page uses: most sections default on, Plus ones need the page
// to be paid, and Potluck, Sponsors, Song Requests and Password are off until switched on.
export function sectionStatus(page: UserPage, settings: Record<string, string>): Record<string, boolean> {
  const paid = isPagePaidAndLive(page);
  return {
    '/rsvp': isSectionOn(settings, 'show_rsvp'),
    '/potluck': paid && isPotluckOn(settings),
    '/gift-exchange': paid && isGiftExchangeOn(settings),
    '/guest-photos': paid && isSectionOn(settings, 'show_guest_photos'),
    '/livestream': paid && !!livestreamFromSettings(settings, paid),
    '/song-requests': paid && areSongRequestsOn(settings),
    '/reminders': paid && parseReminderSchedule(settings['reminder_schedule']).length > 0,
    '/event-program': isSectionOn(settings, 'show_event_program'),
    '/custom-sections': paid && isSectionOn(settings, 'show_custom_sections'),
    '/sponsors': paid && areSponsorsOn(settings),
    '/registry': paid && isSectionOn(settings, 'show_registry'),
    '/share': isSectionOn(settings, 'show_share'),
    '/password': isPageLocked(settings, paid),
    '/domain': paid && !!page.custom_domain && page.domain_status === 'active',
  };
}
