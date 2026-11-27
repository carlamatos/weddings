'use client';

import { useEffect } from 'react';

// Counts one view of an event page (app/lib/page-views.ts), sent once the
// page has loaded in a real browser. The browser keeps the day it last saw
// this page, so each visitor counts once a day, and a browser that has never
// seen it counts as a new person (the host's "opened by N people"). Nothing
// is shown.
export default function PageViewBeacon({ pageId }: { pageId: number }) {
  useEffect(() => {
    const key = `mg_seen_${pageId}`;
    const today = new Date().toLocaleDateString('en-CA');
    let newVisitor = true;
    let newPerson = true;
    try {
      const seen = localStorage.getItem(key);
      newVisitor = seen !== today;
      newPerson = seen === null;
      localStorage.setItem(key, today);
    } catch { /* private browsing: count it as a new visitor */ }
    const body = JSON.stringify({ p: pageId, v: newVisitor, n: newPerson });
    const sent = typeof navigator.sendBeacon === 'function' && navigator.sendBeacon('/api/page-view', new Blob([body], { type: 'application/json' }));
    if (!sent) fetch('/api/page-view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }, [pageId]);
  return null;
}
