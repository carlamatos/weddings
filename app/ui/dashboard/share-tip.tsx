'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDashText } from '@/app/ui/dashboard/dash-text';
import { rich } from '@/app/ui/dashboard/rich';
import { fill } from '@/app/lib/dash-text/fill';
import { THEMES_TIP_DONE_EVENT, themesTipPending } from './theme-switcher';
import { Mascot } from '@/app/ui/mascot';

// "Your page is ready to share": a tip like the Themes one, under the top
// bar's Share button (or, on phones and tablets, just above the Share
// button fixed at the bottom right). It comes right after the Themes
// tip, while the page is live and nobody has the link yet (the server
// decides that: shareTipFor in app/lib/setup-progress.ts), 20 seconds after
// the page opens (TIP_DELAY_MS). Shown on up to
// three visits per page; closing it or opening Share ends it. Remembered in
// this browser.
const KEY = (pageId: number) => `mygala.shareTip.${pageId}`;
const VISITS = 3;
// How long it waits after the page opens before appearing (the Themes tip
// shows straight away).
const TIP_DELAY_MS = 20_000;
const CHANGE_EVENT = 'mygala:share-tip-change';
// The dashboard mounts two of these (top bar button and bottom-right button): count each visit
// once, and give both the same answer.
const counted = new Map<number, { visit: string; show: boolean }>();

function read(pageId: number): { visits: number; done: boolean } {
  try {
    const v = JSON.parse(localStorage.getItem(KEY(pageId)) ?? 'null');
    if (v && typeof v.visits === 'number') return { visits: v.visits, done: !!v.done };
  } catch {}
  return { visits: 0, done: false };
}
function write(pageId: number, v: { visits: number; done: boolean }) {
  try { localStorage.setItem(KEY(pageId), JSON.stringify(v)); } catch {}
}

// Opening Share (from the top bar or the profile menu) ends the tip.
export function endShareTip(pageId: number) {
  const v = read(pageId);
  if (v.done) return;
  write(pageId, { ...v, done: true });
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useShareTip(pageId: number | undefined, enabled: boolean) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled || pageId === undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(false);
      return;
    }
    const visit = `${pathname}@${performance.timeOrigin}`;
    const update = () => {
      const v = read(pageId);
      if (v.done || themesTipPending()) { setShow(false); return; }
      let c = counted.get(pageId);
      if (c?.visit !== visit) {
        c = { visit, show: v.visits < VISITS };
        counted.set(pageId, c);
        if (c.show) write(pageId, { ...v, visits: v.visits + 1 });
      }
      setShow(c.show);
    };
    // Whether to show depends on this browser's storage, read after mount,
    // and not straight away: TIP_DELAY_MS after the page opens (a visit only
    // counts once the tip has shown).
    let started = false;
    const timer = window.setTimeout(() => {
      started = true;
      update();
      window.addEventListener(THEMES_TIP_DONE_EVENT, update);
      window.addEventListener(CHANGE_EVENT, update);
    }, TIP_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      if (!started) return;
      window.removeEventListener(THEMES_TIP_DONE_EVENT, update);
      window.removeEventListener(CHANGE_EVENT, update);
    };
  }, [enabled, pageId, pathname]);

  const dismiss = useCallback(() => { if (pageId !== undefined) endShareTip(pageId); }, [pageId]);
  return { show, dismiss };
}

// The bubble, with Pop bursting into confetti beside the words (app/ui/mascot.tsx).
// where: 'share' under the top bar's Share button (desktops),
// 'fab' just above the Share button at the bottom right (phones and tablets).
// far: the event is months away, so it's offered as a save-the-date.
export function ShareTipBubble({ daysToGo, far = false, where, onClose }: { daysToGo: number | null; far?: boolean; where: 'share' | 'fab'; onClose: () => void }) {
  const d = useDashText();
  const t = d.shareTip;
  const soon = daysToGo === null ? null : daysToGo <= 0 ? t.soonToday : daysToGo === 1 ? t.soonTomorrow : fill(t.soonDays, { days: daysToGo });
  return (
    <div className={`dash-themes-tip dash-share-tip dash-share-tip--${where}`} role="status">
      <Mascot pose="pop" size={54} className="dash-share-tip-mascot" eager />
      <p>
        {soon && <strong className="dash-share-tip-soon">{soon}</strong>}
        {rich(far ? t.saveTheDate : t.ready, { t0: (s) => <strong>{s}</strong> })}
      </p>
      <button type="button" onClick={onClose} aria-label={t.closeTip}><XMarkIcon /></button>
    </div>
  );
}
