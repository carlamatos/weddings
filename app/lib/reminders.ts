// Event Reminders (Plus): emails sent to guests who opted into updates, at the
// lead times the owner ticks or adds. Settings live in user_page_settings:
//   reminder_schedule — comma-separated keys: the presets ("1w,1d") and the
//                       owner's own lead times ("c5d", "c2w", "c3h" = 5 days,
//                       2 weeks, 3 hours before)
//   reminder_message  — the owner's personal note included in each email
//   reminder_timezone — the owner's time zone (IANA, from their browser),
//                       used for hours-before reminders
// Shared by the dashboard (client) and the cron job, so no server imports.

export const REMINDER_OPTIONS = [
  { key: '1m', label: '1 month in advance', months: 1, days: 0 },
  { key: '3w', label: '3 weeks in advance', months: 0, days: 21 },
  { key: '2w', label: '2 weeks in advance', months: 0, days: 14 },
  { key: '1w', label: '1 week in advance', months: 0, days: 7 },
  { key: '3d', label: '3 days in advance', months: 0, days: 3 },
  { key: '1d', label: '1 day in advance', months: 0, days: 1 },
] as const;

export type PresetReminderKey = (typeof REMINDER_OPTIONS)[number]['key'];
export type ReminderUnit = 'w' | 'd' | 'h';
// A preset key, or a custom one: "c" + amount + unit.
export type ReminderKey = PresetReminderKey | `c${number}${ReminderUnit}`;

export const REMINDER_MESSAGE_MAX_LENGTH = 1000;
export const CUSTOM_REMINDER_MAX = 5; // custom lead times per page
export const REMINDER_UNIT_MAX: Record<ReminderUnit, number> = { w: 52, d: 365, h: 168 };
export const REMINDER_UNIT_LABELS: Record<ReminderUnit, { one: string; many: string }> = {
  w: { one: 'week', many: 'weeks' },
  d: { one: 'day', many: 'days' },
  h: { one: 'hour', many: 'hours' },
};
// Used when the owner's time zone isn't known (matches the "Eastern" morning
// send time of the date-based reminders).
export const DEFAULT_REMINDER_TIMEZONE = 'America/Toronto';

const PRESET_KEYS = new Set<string>(REMINDER_OPTIONS.map((o) => o.key));
const CUSTOM_RE = /^c([1-9]\d{0,2})([wdh])$/;

export function parseCustomReminder(key: string): { amount: number; unit: ReminderUnit } | null {
  const m = CUSTOM_RE.exec(key);
  if (!m) return null;
  const amount = Number(m[1]);
  const unit = m[2] as ReminderUnit;
  return amount <= REMINDER_UNIT_MAX[unit] ? { amount, unit } : null;
}

export function customReminderKey(amount: number, unit: ReminderUnit): ReminderKey | null {
  const key = `c${Math.floor(amount)}${unit}` as ReminderKey;
  return parseCustomReminder(key) ? key : null;
}

export function isPresetReminderKey(key: string): key is PresetReminderKey {
  return PRESET_KEYS.has(key);
}

export function isReminderKey(key: string): key is ReminderKey {
  return PRESET_KEYS.has(key) || !!parseCustomReminder(key);
}

export function isHourReminder(key: ReminderKey): boolean {
  return parseCustomReminder(key)?.unit === 'h';
}

// "3 hours before", "1 week before".
export function reminderLabel(key: ReminderKey): string {
  const preset = REMINDER_OPTIONS.find((o) => o.key === key);
  if (preset) return preset.label;
  const c = parseCustomReminder(key)!;
  const unit = REMINDER_UNIT_LABELS[c.unit];
  return `${c.amount} ${c.amount === 1 ? unit.one : unit.many} before`;
}

// How far ahead of the event a reminder goes, in hours (for ordering).
function leadHours(key: ReminderKey): number {
  const preset = REMINDER_OPTIONS.find((o) => o.key === key);
  if (preset) return (preset.months * 30 + preset.days) * 24;
  const c = parseCustomReminder(key)!;
  return c.amount * (c.unit === 'w' ? 168 : c.unit === 'd' ? 24 : 1);
}

export function parseReminderSchedule(value: string | null | undefined): ReminderKey[] {
  const picked = new Set((value ?? '').split(',').map((s) => s.trim()).filter(isReminderKey));
  const presets = REMINDER_OPTIONS.map((o) => o.key).filter((k) => picked.has(k));
  const custom = [...picked].filter((k) => !isPresetReminderKey(k)).slice(0, CUSTOM_REMINDER_MAX);
  // A stable, earliest-first order regardless of how it was saved.
  return [...presets, ...custom].sort((a, b) => leadHours(b) - leadHours(a));
}

const pad = (n: number) => String(n).padStart(2, '0');

// The day a date-based reminder goes out (YYYY-MM-DD), counted back from the
// event date. Month steps clamp to the month's last day (Mar 31 → Feb 28/29).
// For an hours-before reminder, the event-date day it falls on is computed by
// reminderSendInstant instead.
export function reminderSendDate(eventDate: string, key: ReminderKey): string {
  const preset = REMINDER_OPTIONS.find((o) => o.key === key);
  const [y, m, d] = eventDate.split('-').map(Number);
  let date: Date;
  if (preset?.months) {
    const target = new Date(Date.UTC(y, m - 1 - preset.months, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    date = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, lastDay)));
  } else {
    const c = parseCustomReminder(key);
    const days = preset ? preset.days : c!.unit === 'w' ? c!.amount * 7 : c!.unit === 'd' ? c!.amount : Math.ceil(c!.amount / 24);
    date = new Date(Date.UTC(y, m - 1, d - days));
  }
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function isValidTimeZone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Offset of `timeZone` from UTC at the instant `ms`, in milliseconds.
function zoneOffset(ms: number, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

// The moment the event starts: its date and time as wall-clock time in
// `timeZone`. Null without a usable time.
export function eventStartInstant(eventDate: string, eventTime: string | null | undefined, timeZone: string): Date | null {
  const t = /^(\d{1,2}):(\d{2})/.exec(eventTime ?? '');
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate);
  if (!t || !d) return null;
  const wall = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]);
  let ms = wall - zoneOffset(wall, timeZone);
  ms = wall - zoneOffset(ms, timeZone); // settle across a DST change
  return new Date(ms);
}

// When an hours-before reminder goes out. Null for other reminders, or when
// the event has no start time.
export function reminderSendInstant(eventDate: string, eventTime: string | null | undefined, key: ReminderKey, timeZone: string): Date | null {
  const c = parseCustomReminder(key);
  if (c?.unit !== 'h') return null;
  const start = eventStartInstant(eventDate, eventTime, timeZone);
  return start ? new Date(start.getTime() - c.amount * 60 * 60 * 1000) : null;
}

// Relative wording for the email subject/heading, in the page language:
// "tomorrow", "in 3 days", "next week", "in 2 weeks", "next month", "in 3 hours".
export function reminderLeadText(key: ReminderKey, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const preset = REMINDER_OPTIONS.find((o) => o.key === key);
  if (preset) {
    if (preset.months) return rtf.format(preset.months, 'month');
    if (preset.days % 7 === 0) return rtf.format(preset.days / 7, 'week');
    return rtf.format(preset.days, 'day');
  }
  const c = parseCustomReminder(key)!;
  if (c.unit === 'h') return new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(c.amount, 'hour');
  if (c.unit === 'w') return rtf.format(c.amount, 'week');
  return c.amount % 7 === 0 ? rtf.format(c.amount / 7, 'week') : rtf.format(c.amount, 'day');
}
