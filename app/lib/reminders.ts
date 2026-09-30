// Event Reminders (Plus): emails sent to guests who opted into updates, at the
// lead times the owner ticks. Settings live in user_page_settings:
//   reminder_schedule — comma-separated option keys, e.g. "1w,1d"
//   reminder_message  — the owner's personal note included in each email
// Shared by the dashboard (client) and the cron job, so no server imports.

export const REMINDER_OPTIONS = [
  { key: '1m', label: '1 month in advance', months: 1, days: 0 },
  { key: '3w', label: '3 weeks in advance', months: 0, days: 21 },
  { key: '2w', label: '2 weeks in advance', months: 0, days: 14 },
  { key: '1w', label: '1 week in advance', months: 0, days: 7 },
  { key: '3d', label: '3 days in advance', months: 0, days: 3 },
  { key: '1d', label: '1 day in advance', months: 0, days: 1 },
] as const;

export type ReminderKey = (typeof REMINDER_OPTIONS)[number]['key'];

export const REMINDER_MESSAGE_MAX_LENGTH = 1000;

const KEYS = new Set<string>(REMINDER_OPTIONS.map((o) => o.key));

export function isReminderKey(key: string): key is ReminderKey {
  return KEYS.has(key);
}

export function parseReminderSchedule(value: string | null | undefined): ReminderKey[] {
  const picked = new Set((value ?? '').split(',').map((s) => s.trim()).filter(isReminderKey));
  // Keep a stable, earliest-first order regardless of how it was saved.
  return REMINDER_OPTIONS.map((o) => o.key).filter((k) => picked.has(k));
}

const pad = (n: number) => String(n).padStart(2, '0');

// The day a reminder goes out (YYYY-MM-DD), counted back from the event date.
// Month steps clamp to the month's last day (Mar 31 → Feb 28/29).
export function reminderSendDate(eventDate: string, key: ReminderKey): string {
  const opt = REMINDER_OPTIONS.find((o) => o.key === key)!;
  const [y, m, d] = eventDate.split('-').map(Number);
  let date: Date;
  if (opt.months) {
    const target = new Date(Date.UTC(y, m - 1 - opt.months, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    date = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, lastDay)));
  } else {
    date = new Date(Date.UTC(y, m - 1, d - opt.days));
  }
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// Relative wording for the email subject/heading, in the page language:
// "tomorrow", "in 3 days", "next week", "in 2 weeks", "next month".
export function reminderLeadText(key: ReminderKey, locale: string): string {
  const opt = REMINDER_OPTIONS.find((o) => o.key === key)!;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (opt.months) return rtf.format(opt.months, 'month');
  if (opt.days % 7 === 0) return rtf.format(opt.days / 7, 'week');
  return rtf.format(opt.days, 'day');
}
