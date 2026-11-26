import type { UserPage } from './definitions';
import { publicPageUrl } from './share';
import { SAVE_THE_DATE_DAYS, daysUntil } from './setup-progress';

// The shareable save-the-date: a page of its own (/<slug>/save-the-date, or
// /save-the-date on a custom domain) with the host's invitation design worded
// as a save-the-date, and buttons to put the day in Google Calendar or Apple
// Calendar (an .ics file, /api/calendar/<slug>.ics: app/api/calendar/[file]). For hosts whose event is
// months away: guests note the day now, the invitation comes later.

type Lang = 'en' | 'fr' | 'es';
const lang = (l?: string | null): Lang => (l === 'fr' || l === 'es' ? l : 'en');

export const SAVE_THE_DATE_COPY: Record<Lang, {
  saveTheDate: string; invitationToFollow: string; addToCalendar: string; google: string; apple: string;
  seePage: string; open: string; metaTitle: (name: string) => string; metaDescription: (date: string) => string; calendarNote: string;
}> = {
  en: {
    saveTheDate: 'Save the date', invitationToFollow: 'Invitation to follow', addToCalendar: 'Add it to your calendar',
    google: 'Google Calendar', apple: 'Apple Calendar', seePage: 'See the event page', open: 'Open the save-the-date',
    metaTitle: (n) => `Save the date: ${n}`, metaDescription: (d) => `${d}. Invitation to follow.`,
    calendarNote: 'Invitation to follow. Event page:',
  },
  fr: {
    saveTheDate: 'Réservez la date', invitationToFollow: 'Invitation à suivre', addToCalendar: 'Ajoutez-la à votre agenda',
    google: 'Google Agenda', apple: 'Calendrier Apple', seePage: 'Voir la page de l’événement', open: 'Ouvrir le « réservez la date »',
    metaTitle: (n) => `Réservez la date : ${n}`, metaDescription: (d) => `${d}. Invitation à suivre.`,
    calendarNote: 'Invitation à suivre. Page de l’événement :',
  },
  es: {
    saveTheDate: 'Reserva la fecha', invitationToFollow: 'Invitación a continuación', addToCalendar: 'Agrégala a tu calendario',
    google: 'Google Calendar', apple: 'Calendario de Apple', seePage: 'Ver la página del evento', open: 'Abrir el «reserva la fecha»',
    metaTitle: (n) => `Reserva la fecha: ${n}`, metaDescription: (d) => `${d}. Invitación a continuación.`,
    calendarNote: 'Invitación a continuación. Página del evento:',
  },
};
export const saveTheDateCopy = (language?: string | null) => SAVE_THE_DATE_COPY[lang(language)];

// Only for pages with a date still to come.
export function hasSaveTheDate(page: Pick<UserPage, 'event_date'>, today = new Date()): boolean {
  const days = daysUntil(page.event_date, today);
  return days !== null && days >= 0;
}

// Months to go: the save-the-date is what to share first. Closer than that,
// the page (the invitation and RSVP) is.
export function isSaveTheDateTime(page: Pick<UserPage, 'event_date'>, today = new Date()): boolean {
  const days = daysUntil(page.event_date, today);
  return days !== null && days > SAVE_THE_DATE_DAYS;
}

export function saveTheDateUrl(page: Pick<UserPage, 'slug' | 'plan_type' | 'custom_domain' | 'domain_status'>): string {
  return `${publicPageUrl(page)}/save-the-date`;
}

// ── Calendar ──────────────────────────────────────────────────────────────
// Pages have no time zone, so times are "floating": the calendar takes them
// as the guest's local time, which is right for everyone near the event.
// Without a time it's an all-day event (over every day of a multi-day one);
// with a start time and no end, it lasts 3 hours.

type CalPage = Pick<UserPage, 'slug' | 'heading' | 'event_date' | 'event_time' | 'event_end_date' | 'event_end_time' | 'venue_name' | 'formatted_address' | 'street_address' | 'city' | 'country' | 'location' | 'language' | 'plan_type' | 'custom_domain' | 'domain_status'>;

const ymd = (iso: string) => iso.slice(0, 10).replace(/-/g, '');
const isTime = (t?: string | null): t is string => !!t && /^\d{1,2}:\d{2}/.test(t);
const hms = (t: string) => { const [h, m] = t.split(':'); return `${h.padStart(2, '0')}${m.slice(0, 2)}00`; };
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
// "2027-06-12" + "16:00" + hours → "20270612T190000"
function shift(iso: string, time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCMinutes(h * 60 + m + hours * 60);
  return `${d.toISOString().slice(0, 10).replace(/-/g, '')}T${d.toISOString().slice(11, 19).replace(/:/g, '')}`;
}

export type CalendarEvent = { title: string; start: string; end: string; allDay: boolean; location: string; details: string; url: string };

export function calendarEvent(page: CalPage): CalendarEvent | null {
  if (!page.event_date) return null;
  const date = String(page.event_date).slice(0, 10);
  const endDate = page.event_end_date && String(page.event_end_date).slice(0, 10) > date ? String(page.event_end_date).slice(0, 10) : date;
  const url = publicPageUrl(page);
  const virtual = page.location === 'virtual';
  const address = virtual ? '' : page.formatted_address || [page.street_address, page.city, page.country].filter(Boolean).join(', ');
  const location = virtual ? url : [page.venue_name, address].filter(Boolean).join(', ');
  const t = saveTheDateCopy(page.language);
  const base = { title: page.heading || 'Event', location, details: `${t.calendarNote} ${url}`, url };
  if (!isTime(page.event_time)) {
    return { ...base, allDay: true, start: ymd(date), end: ymd(addDays(endDate, 1)) };
  }
  const start = `${ymd(date)}T${hms(page.event_time)}`;
  let end: string;
  if (isTime(page.event_end_time)) {
    end = `${ymd(endDate)}T${hms(page.event_end_time)}`;
    // An end time earlier than the start on the same day runs past midnight.
    if (end <= start) end = shift(endDate, page.event_end_time, 24);
  } else {
    end = endDate > date ? `${ymd(endDate)}T235900` : shift(date, page.event_time, 3);
  }
  return { ...base, allDay: false, start, end };
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: `${e.start}/${e.end}`, details: e.details, location: e.location });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

// Apple Calendar (and Outlook, and most phones) open an .ics file. On the
// page's own origin (a custom domain too), so a password-protected page's
// access cookie goes with it.
export const icsUrl = (page: Pick<UserPage, 'slug' | 'plan_type' | 'custom_domain' | 'domain_status'>) =>
  `${new URL(publicPageUrl(page)).origin}/api/calendar/${encodeURIComponent(page.slug)}.ics`;

export function icsFile(e: CalendarEvent, uid: string): string {
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const when = e.allDay
    ? [`DTSTART;VALUE=DATE:${e.start}`, `DTEND;VALUE=DATE:${e.end}`]
    : [`DTSTART:${e.start}`, `DTEND:${e.end}`];
  // Lines longer than 75 octets are folded (RFC 5545).
  const fold = (line: string) => {
    const out: string[] = [];
    let rest = line;
    while (Buffer.byteLength(rest) > 75) {
      let i = 75;
      while (Buffer.byteLength(rest.slice(0, i)) > 75) i--;
      out.push(rest.slice(0, i));
      rest = ` ${rest.slice(i)}`;
    }
    out.push(rest);
    return out.join('\r\n');
  };
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MyGala//Save the date//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@mygala.ca`,
    `DTSTAMP:${stamp}`,
    ...when,
    `SUMMARY:${esc(e.title)}`,
    ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
    `DESCRIPTION:${esc(e.details)}`,
    `URL:${e.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(fold).join('\r\n') + '\r\n';
}
