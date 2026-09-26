'use client';

import { useState, useEffect } from 'react';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Generic countdown, decoupled from translations.ts (whose countdown copy —
// "Until we say I do" — is wedding-specific). Any theme supplies its own
// eyebrow/heading/unit labels as props instead.
export function Countdown({
  eventDate,
  eventTime,
  eyebrow,
  heading,
  todayHeading,
  unitLabels,
}: {
  eventDate: string;
  eventTime?: string;
  eyebrow: string;
  heading: string;
  todayHeading: string;
  unitLabels: { days: string; hours: string; mins: string; secs: string };
}) {
  const target = new Date(eventDate + (eventTime ? `T${eventTime}` : 'T17:00:00')).getTime();
  // Server-render and client-hydration happen at different wall-clock
  // moments, so Date.now() can't be read during the initial render (it would
  // make the SSR HTML and the hydrated client output disagree). Start null —
  // rendered identically on both sides — and fill in the real value on mount.
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    setDiff(Math.max(target - Date.now(), 0));
    const id = setInterval(() => setDiff(Math.max(target - Date.now(), 0)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const days = diff !== null ? Math.floor(diff / 86400000) : 0;
  const hours = diff !== null ? Math.floor((diff / 3600000) % 24) : 0;
  const mins = diff !== null ? Math.floor((diff / 60000) % 60) : 0;
  const secs = diff !== null ? Math.floor((diff / 1000) % 60) : 0;

  return (
    <div className="countdown-wrap">
      <p className="eyebrow on-dark">{eyebrow}</p>
      <h2 className="countdown-heading">{diff !== null && diff <= 0 ? todayHeading : heading}</h2>
      <div className="countdown-row">
        {([{ v: days, l: unitLabels.days }, { v: hours, l: unitLabels.hours }, { v: mins, l: unitLabels.mins }, { v: secs, l: unitLabels.secs }]).map(({ v, l }) => (
          <div key={l} className="countdown-block">
            <div className="countdown-value">{pad(v)}</div>
            <div className="countdown-label">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
