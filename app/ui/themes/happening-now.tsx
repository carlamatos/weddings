'use client';

import { useEffect } from 'react';
import type { EventProgramItem } from '@/app/lib/definitions';
import { getTranslations } from '@/app/lib/translations';

const ATTR = 'data-happening-now';
const DEFAULT_MINUTES = 60; // an item without an end time lasts until the next one, or this long

// "Happening now" on the event program, during the event: the item whose time
// it is gets a badge. Every theme draws its own program, so instead of
// changing each one, this finds the item's name on the page and puts the
// badge just before it. Uses the guest's own clock (guests at the venue
// share the event's time zone); checks again every minute.
export default function HappeningNow({ items, language }: { items: EventProgramItem[]; language: string }) {
  useEffect(() => {
    const label = getTranslations(language).programNow;
    const toMs = (day: string, time: string) => new Date(`${day}T${time.length === 5 ? `${time}:00` : time}`).getTime();
    const tick = () => {
      document.querySelectorAll(`[${ATTR}]`).forEach((el) => el.remove());
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const day = items
        .filter((i) => i.start_time && String(i.event_date).slice(0, 10) === today)
        .sort((a, b) => a.start_time!.localeCompare(b.start_time!));
      const t = now.getTime();
      const current = day.find((item, i) => {
        const start = toMs(today, item.start_time!);
        const end = item.end_time ? toMs(today, item.end_time)
          : day[i + 1] ? toMs(today, day[i + 1].start_time!)
          : start + DEFAULT_MINUTES * 60_000;
        return t >= start && t < end;
      });
      if (!current) return;
      const root = document.querySelector('[data-mg-theme]');
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let target: Element | null = null;
      while (walker.nextNode()) {
        const el = walker.currentNode as Element;
        if (el.children.length === 0 && el.textContent?.trim() === current.name.trim()) { target = el; break; }
      }
      if (!target?.parentElement) return;
      const badge = document.createElement('span');
      badge.setAttribute(ATTR, '');
      badge.textContent = `● ${label}`;
      badge.style.cssText = 'display:inline-block;margin:0 0 6px;padding:3px 10px;border-radius:999px;background:#B6584A;color:#fff;font:700 11px/1.4 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;animation:mg-now 2s ease-in-out infinite';
      target.parentElement.insertBefore(badge, target);
    };
    tick();
    const timer = setInterval(tick, 60_000);
    return () => { clearInterval(timer); document.querySelectorAll(`[${ATTR}]`).forEach((el) => el.remove()); };
  }, [items, language]);
  return <style>{'@keyframes mg-now{0%,100%{opacity:1}50%{opacity:.65}}'}</style>;
}
