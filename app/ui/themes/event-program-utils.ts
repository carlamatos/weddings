import type { EventProgramItem } from '@/app/lib/definitions';
import { localizeDate } from '@/app/lib/translations';

export function groupEventProgramByDate(items: EventProgramItem[]): { date: string; items: EventProgramItem[] }[] {
  const groups: { date: string; items: EventProgramItem[] }[] = [];
  for (const item of items) {
    const group = groups.find((g) => g.date === item.event_date);
    if (group) group.items.push(item);
    else groups.push({ date: item.event_date, items: [item] });
  }
  return groups;
}

export function formatProgramDate(dateStr: string, locale: string): string {
  return localizeDate(dateStr, locale, { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatProgramClockTime(time: string, locale: string): string {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

export function formatProgramTime(item: EventProgramItem, locale: string): string {
  const start = item.start_time ? formatProgramClockTime(item.start_time, locale) : '';
  const end = item.end_time ? formatProgramClockTime(item.end_time, locale) : '';
  if (start && end) return `${start} – ${end}`;
  return start || end;
}
