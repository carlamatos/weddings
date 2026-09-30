// Date/time wording for events with an optional end date and end time.
// Times stay in the 12-hour en-US style the themes already used; dates follow
// the page language (with the same es/fr capitalization as localizeDate).
import { capitalizeDateWords, localizeDate } from '@/app/lib/translations';

export type EventWhenInput = {
  eventDate?: string;
  eventTime?: string;
  eventEndDate?: string;
  eventEndTime?: string;
};

const toDate = (iso: string) => new Date(iso + 'T00:00:00');
// Keep "Oct 18, 2:00 PM" on one line so a narrow card wraps at the dash.
const nowrap = (s: string) => s.replace(/ /g, '\u00A0');

export function formatTime12(hhmm: string): string {
  return new Date(`1970-01-01T${hhmm}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function isMultiDay(eventDate?: string, eventEndDate?: string): eventEndDate is string {
  return !!eventDate && !!eventEndDate && eventEndDate > eventDate;
}

// "October 16, 2026" or, for multi-day events, "October 16 – 18, 2026" /
// "16–18 octobre 2026" — Intl collapses the shared month/year per locale.
export function formatDateRange(
  eventDate: string,
  eventEndDate: string | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  if (!isMultiDay(eventDate, eventEndDate)) return localizeDate(eventDate, locale, options);
  const range = new Intl.DateTimeFormat(locale, options).formatRange(toDate(eventDate), toDate(eventEndDate));
  return capitalizeDateWords(range, locale);
}

// The two lines of a theme's "Date & location" card:
//   time — "4:00 PM – 11:00 PM" (same day) or "Oct 16, 4:00 PM – Oct 18, 2:00 PM" (multi-day)
//   date — "Friday, October 16, 2026" or "Friday, October 16 – Sunday, October 18, 2026"
export function eventWhen({ eventDate, eventTime, eventEndDate, eventEndTime }: EventWhenInput, locale: string) {
  const start = eventTime ? formatTime12(eventTime) : '';
  const end = eventEndTime ? formatTime12(eventEndTime) : '';
  const date = eventDate
    ? formatDateRange(eventDate, eventEndDate, locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  if (eventDate && isMultiDay(eventDate, eventEndDate)) {
    if (!start && !end) return { time: '', date };
    const short = (iso: string) => localizeDate(iso, locale, { month: 'short', day: 'numeric' });
    const from = nowrap([short(eventDate), start].filter(Boolean).join(', '));
    const to = nowrap([short(eventEndDate), end].filter(Boolean).join(', '));
    return { time: `${from} – ${to}`, date };
  }

  const time = start && end ? `${nowrap(start)} – ${nowrap(end)}` : start || (end ? `– ${nowrap(end)}` : '');
  return { time, date };
}
