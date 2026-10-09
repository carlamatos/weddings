import type { UserPage } from './definitions';
import type { InvitationDetails } from './invitation';
import { getTranslations } from './translations';
import { publicPageUrl } from './share';
import { eventWhen } from '@/app/ui/themes/event-when';

// The event's own facts for the invitation, in the page's language. Shared by
// the Invitations screen (preview/print) and the invitation emails. Pass the
// page password to include it (see invitationPassword in page-password.ts).
const PASSWORD_LABEL: Record<string, string> = { en: 'Page password', fr: 'Mot de passe de la page', es: 'Contraseña de la página' };

export function invitationDetails(page: UserPage, password?: string | null): InvitationDetails {
  const t = getTranslations(page.language);
  const when = eventWhen(
    { eventDate: page.event_date, eventTime: page.event_time, eventEndDate: page.event_end_date, eventEndTime: page.event_end_time },
    t.dateLocale,
  );
  const virtual = page.location === 'virtual';
  const address = virtual
    ? ''
    : page.formatted_address || [page.street_address, page.city, page.country].filter(Boolean).join(', ');
  return {
    name: page.heading || 'Your event',
    date: when.date,
    time: when.time,
    venue: virtual ? t.virtualEvent : page.venue_name || '',
    address,
    url: publicPageUrl(page),
    ...(password ? { password, passwordLabel: PASSWORD_LABEL[page.language ?? 'en'] ?? PASSWORD_LABEL.en } : {}),
  };
}
