'use client';

import { useState, useEffect } from 'react';
import type { Translations } from '@/app/lib/translations';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function VilmaCountdown({ eventDate, eventTime, translations: t }: {
  eventDate: string;
  eventTime?: string;
  translations: Translations;
}) {
  const target = new Date(eventDate + (eventTime ? `T${eventTime}` : 'T17:00:00')).getTime();
  const [diff, setDiff] = useState(() => Math.max(target - Date.now(), 0));

  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(target - Date.now(), 0)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins  = Math.floor((diff / 60000) % 60);
  const secs  = Math.floor((diff / 1000) % 60);

  return (
    <div className="countdown-wrap">
      <p className="eyebrow on-dark">{t.countingDown}</p>
      <h2 className="countdown-heading">{diff <= 0 ? t.todayIsTheDay : t.untilWeSayIDo}</h2>
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
