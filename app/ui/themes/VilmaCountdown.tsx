'use client';

import { useState, useEffect } from 'react';
import type { Translations } from '@/app/lib/translations';
import { SectionText, type SectionTextContext } from './section-text';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function VilmaCountdown({ eventDate, eventTime, translations: t, sectionText }: {
  eventDate: string;
  eventTime?: string;
  translations: Translations;
  sectionText?: SectionTextContext;
}) {
  const target = new Date(eventDate + (eventTime ? `T${eventTime}` : 'T17:00:00')).getTime();
  // Server render and hydration happen at different moments, so Date.now()
  // can't be read during the first render (the seconds would disagree and
  // React would report a hydration mismatch). Start null and fill in on mount,
  // as the shared Countdown does.
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: Date.now() must not run during SSR render
    setDiff(Math.max(target - Date.now(), 0));
    const id = setInterval(() => setDiff(Math.max(target - Date.now(), 0)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const days  = diff !== null ? Math.floor(diff / 86400000) : 0;
  const hours = diff !== null ? Math.floor((diff / 3600000) % 24) : 0;
  const mins  = diff !== null ? Math.floor((diff / 60000) % 60) : 0;
  const secs  = diff !== null ? Math.floor((diff / 1000) % 60) : 0;

  return (
    <div className="countdown-wrap">
      <SectionText ctx={sectionText} k="countdown.eyebrow" className="eyebrow on-dark" fallback={t.countingDown} />
      {diff !== null && diff <= 0 && !sectionText?.pageId
        ? <h2 className="countdown-heading">{t.todayIsTheDay}</h2>
        : <SectionText ctx={sectionText} k="countdown.title" as="h2" className="countdown-heading" fallback={t.untilWeSayIDo} />}
      <div className="countdown-row">
        {([{ v: days, l: t.days }, { v: hours, l: t.hours }, { v: mins, l: t.mins }, { v: secs, l: t.secs }]).map(({ v, l }) => (
          <div key={l} className="countdown-block">
            <div className="countdown-value">{pad(v)}</div>
            <div className="countdown-label">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
