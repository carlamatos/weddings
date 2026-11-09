'use client';

import { useSyncExternalStore } from 'react';
import { useDashText } from '@/app/ui/dashboard/dash-text';

const subscribe = () => () => {};

// A date in the viewer's own time zone. The server renders in UTC (Vercel's
// clock), so an evening RSVP in Vancouver would show as the next day; once
// the page is in the browser it switches to the viewer's local date.
export function LocalDate({ iso, options = { month: 'short', day: 'numeric', year: 'numeric' } }: {
  iso: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const { locale } = useDashText().meta;
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  const text = new Date(iso).toLocaleDateString(locale, inBrowser ? options : { ...options, timeZone: 'UTC' });
  return <span suppressHydrationWarning>{text}</span>;
}
