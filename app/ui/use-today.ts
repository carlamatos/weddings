'use client';
import { useEffect, useState } from 'react';

// Today's date (YYYY-MM-DD) in the visitor's own time zone, for date
// pickers that only offer today and later (min). Empty until mounted, so
// the server's render and the browser's agree.
export function useToday(): string {
  const [today, setToday] = useState('');
  useEffect(() => {
    const d = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser's own date, after mount
    setToday(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }, []);
  return today;
}
