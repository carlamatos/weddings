// Date/time wording for events with an optional end date and end time.
// Dates and times follow the page language (4:00 PM in English, 16:00 in
// French and Spanish, as in the event program), with the same es/fr
// capitalization as localizeDate.
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

function formatTime(hhmm: string, locale: string): string {
  return new Date(`1970-01-01T${hhmm}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
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
  const start = eventTime ? formatTime(eventTime, locale) : '';
  const end = eventEndTime ? formatTime(eventEndTime, locale) : '';
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
