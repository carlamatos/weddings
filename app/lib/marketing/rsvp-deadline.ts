// The RSVP deadline calculator (app/ui/marketing/rsvp-tool.tsx): works back
// from the event date and the day the caterer or venue needs the final
// numbers to an RSVP deadline, and the dates around it. Dates are plain
// YYYY-MM-DD days, worked out in UTC so time zones and daylight saving
// never move them.

export type RsvpEventType = 'wedding' | 'destination' | 'party' | 'corporate';

export const RSVP_EVENT_TYPES: { id: RsvpEventType; label: string; finalCountDays: number; inviteWeeks: number; saveTheDateMonths: number | null; seating: boolean }[] = [
  { id: 'wedding', label: 'Wedding', finalCountDays: 14, inviteWeeks: 8, saveTheDateMonths: 6, seating: true },
  { id: 'destination', label: 'Destination wedding', finalCountDays: 21, inviteWeeks: 12, saveTheDateMonths: 9, seating: true },
  { id: 'party', label: 'Party or celebration', finalCountDays: 7, inviteWeeks: 4, saveTheDateMonths: null, seating: false },
  { id: 'corporate', label: 'Gala or corporate event', finalCountDays: 10, inviteWeeks: 6, saveTheDateMonths: 3, seating: true },
];

export type RsvpStep = { id: string; date: string; title: string; text: string; link?: { label: string; href: string }; key?: boolean };

const DAY = 86400000;
const toTime = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
const fromTime = (t: number) => new Date(t).toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => fromTime(toTime(d) + n * DAY);
export const daysBetween = (from: string, to: string) => Math.round((toTime(to) - toTime(from)) / DAY);

export function addMonths(d: string, n: number): string {
  const t = new Date(toTime(d));
  const day = t.getUTCDate();
  t.setUTCDate(1);
  t.setUTCMonth(t.getUTCMonth() + n);
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(day, last));
  return fromTime(t.getTime());
}

export function isDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && fromTime(toTime(d)) === d;
}

export function formatDay(d: string, withYear = true): string {
  return new Date(toTime(d)).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) });
}

// A deadline on a weekend moves back to the Friday before, while people are
// still checking their email.
function weekdayOnOrBefore(d: string): string {
  const wd = new Date(toTime(d)).getUTCDay(); // 0 Sunday … 6 Saturday
  return wd === 0 ? addDays(d, -2) : wd === 6 ? addDays(d, -1) : d;
}

export function rsvpPlan(eventDate: string, type: RsvpEventType, finalCountDays: number, seating: boolean): { deadline: string; steps: RsvpStep[] } {
  const t = RSVP_EVENT_TYPES.find((x) => x.id === type)!;
  const finalCount = addDays(eventDate, -finalCountDays);
  // Time to chase late replies (and draw the seating chart) between the
  // deadline and the day the final count is due.
  const chaseDays = seating ? 7 : 5;
  const deadline = weekdayOnOrBefore(addDays(finalCount, -chaseDays));
  // Guests need about four weeks to reply (two for a party).
  const invite = addDays(eventDate, -t.inviteWeeks * 7);
  const latestInvite = addDays(deadline, type === 'party' ? -14 : -28);
  const inviteDate = invite < latestInvite ? invite : latestInvite;
  const reminder = addDays(deadline, -7);

  const steps: RsvpStep[] = [];
  if (t.saveTheDateMonths) {
    steps.push({
      id: 'save', date: addMonths(eventDate, -t.saveTheDateMonths), title: 'Send save-the-dates',
      text: type === 'destination' ? 'Guests need time to book flights, hotels and time off. Include the location and where to stay.' : 'Let guests block the date. Your website link can go on them, with details to follow.',
      link: { label: 'Make a save-the-date', href: '/features/invitations' },
    });
  }
  steps.push({
    id: 'invite', date: inviteDate, title: 'Send invitations',
    text: `Ask guests to reply by ${formatDay(deadline, false)}. Put the deadline on the invitation and on your event page.`,
    link: { label: 'Design your invitation', href: '/design-your-invitation' },
  });
  steps.push({
    id: 'reminder', date: reminder, title: 'Remind guests who haven’t replied',
    text: 'A friendly nudge a week before the deadline brings in most of the late replies.',
    link: { label: 'Automatic reminder emails', href: '/features/event-reminder-emails' },
  });
  steps.push({ id: 'deadline', date: deadline, title: 'RSVP deadline', text: 'The last day for guests to reply.', key: true });
  steps.push({
    id: 'chase', date: addDays(deadline, 1), title: 'Call or text anyone who hasn’t replied',
    text: 'Expect 10 to 20% of guests to miss the deadline. A quick personal message is the fastest way to get an answer.',
  });
  if (seating) {
    steps.push({
      id: 'seating', date: addDays(finalCount, -2), title: 'Finish your seating chart',
      text: 'With every reply in, place guests at tables and check meal choices and allergies.',
      link: { label: 'Let guests find their table', href: '/features/find-your-table' },
    });
  }
  steps.push({ id: 'final', date: finalCount, title: 'Give the final count to your caterer and venue', text: 'Most caterers charge for this number even if fewer people come.', key: true });
  steps.push({ id: 'event', date: eventDate, title: type === 'wedding' || type === 'destination' ? 'Your wedding day' : 'Your event', text: 'Enjoy it!' });
  steps.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { deadline, steps };
}

// An .ics calendar file with each step as an all-day event.
export function rsvpCalendar(steps: RsvpStep[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MyGala//RSVP deadline calculator//EN', 'CALSCALE:GREGORIAN'];
  for (const s of steps) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${s.id}-${s.date}@mygala.ca`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${s.date.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${addDays(s.date, 1).replace(/-/g, '')}`,
      `SUMMARY:${esc(s.title)}`,
      `DESCRIPTION:${esc(s.text)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Shared links and saved plans: #rsvp=2027-06-12.wedding.14.1
export function rsvpHash(eventDate: string, type: RsvpEventType, finalCountDays: number, seating: boolean): string {
  return `#rsvp=${eventDate}.${type}.${finalCountDays}.${seating ? 1 : 0}`;
}

export function parseRsvpHash(hash: string): { eventDate: string; type: RsvpEventType; finalCountDays: number; seating: boolean } | null {
  const m = /^#rsvp=(\d{4}-\d{2}-\d{2})\.([a-z]+)\.(\d{1,2})\.([01])$/.exec(hash);
  const type = m && RSVP_EVENT_TYPES.find((t) => t.id === m[2]);
  if (!m || !type || !isDate(m[1])) return null;
  return { eventDate: m[1], type: type.id, finalCountDays: Math.max(1, Math.min(60, Number(m[3]))), seating: m[4] === '1' };
}
