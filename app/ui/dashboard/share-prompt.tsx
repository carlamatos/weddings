'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { markSharePrompt } from '@/app/lib/actions';
import { ShareLinkButtons } from '@/app/ui/dashboard/quick-share';
import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import type { DashText } from '@/app/lib/dash-text/en';

// Fired by the page editor when the host switches to Preview: the moment
// they look at the page as guests will, a good time for the pop-up.
export const EDITOR_PREVIEW_EVENT = 'mygala:editor-preview';

const isEditor = (pathname: string | null) => /^\/dashboard\/pages\/[^/]+\/?$/.test(pathname ?? '');
// Screens that already lead with the same share buttons (Invite, and the
// empty guest list): no card or pop-up on top of them.
const hasOwnShare = (pathname: string | null) => /^\/dashboard\/pages\/[^/]+\/(invitations|guest-list)\/?$/.test(pathname ?? '');

function soonLine(t: DashText['sharePrompt'], daysToGo: number | null): string | null {
  if (daysToGo === null || daysToGo > 14) return null;
  if (daysToGo <= 0) return t.soonToday;
  if (daysToGo === 1) return t.soonTomorrow;
  return fill(t.soonDays, { days: daysToGo });
}

// "Your page is ready for your guests": a pop-up shown once per page (when
// the host leaves the editor or switches it to Preview), then a card on the
// page's other dashboard screens until the link is shared, invitations go
// out or an RSVP comes in (the shell decides, from app/lib/setup-progress.ts
// sharePromptFor). Sharing from here completes the setup's share step.
export function SharePrompt({ pageId, url, title, popup, card, daysToGo }: {
  pageId: number; url: string; title: string; popup: boolean; card: boolean; daysToGo: number | null;
}) {
  const d = useDashText();
  const t = d.sharePrompt;
  const pathname = usePathname();
  const onEditor = isEditor(pathname);
  const ownShare = hasOwnShare(pathname);
  const [open, setOpen] = useState(false);
  const [popupUsed, setPopupUsed] = useState(false);
  const [cardHidden, setCardHidden] = useState(false);
  const [shared, setShared] = useState(false);
  const soon = soonLine(t, daysToGo);

  useEffect(() => {
    if (!popup || popupUsed || ownShare) return;
    const show = () => {
      setPopupUsed(true);
      setOpen(true);
      markSharePrompt(pageId, 'shown').catch(() => {});
    };
    if (!onEditor) {
      // A moment after the screen appears, so it doesn't flash in on load.
      const timer = setTimeout(show, 600);
      return () => clearTimeout(timer);
    }
    window.addEventListener(EDITOR_PREVIEW_EVENT, show);
    return () => window.removeEventListener(EDITOR_PREVIEW_EVENT, show);
  }, [popup, popupUsed, onEditor, ownShare, pageId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Any share button pressed (the buttons record the share themselves).
  const onShareClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) setShared(true);
  };

  const hideCard = () => {
    setCardHidden(true);
    markSharePrompt(pageId, 'hidden').catch(() => {});
  };

  return (
    <>
      {card && !onEditor && !ownShare && !cardHidden && !open && !shared && (
        <section className="dash-share-card" aria-labelledby="share-card-title">
          <button type="button" className="dash-share-card-close" onClick={hideCard} aria-label={t.hideForNow} title={t.hideForNow}>
            <XMarkIcon aria-hidden="true" />
          </button>
          <h2 id="share-card-title">{t.cardTitle}</h2>
          <p>{soon ? <><strong>{soon}</strong> </> : null}{t.cardText}</p>
          <div onClickCapture={onShareClick}>
            <ShareLinkButtons pageId={pageId} url={url} title={title} />
          </div>
        </section>
      )}

      {open && createPortal(
        <div className="profile-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="profile-modal dash-share-modal" role="dialog" aria-modal="true" aria-labelledby="share-prompt-title" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setOpen(false)} aria-label={t.later}>×</button>
            <p className="dash-share-modal-emoji" aria-hidden="true">🎉</p>
            <h2 id="share-prompt-title">{t.popupTitle}</h2>
            {soon && <p className="dash-share-modal-soon">{soon}</p>}
            <p className="dash-share-modal-lead">{t.popupLead}</p>
            <div onClickCapture={onShareClick}>
              <ShareLinkButtons pageId={pageId} url={url} title={title} />
            </div>
            <div className="dash-share-modal-foot">
              <Link href={`/dashboard/pages/${pageId}/invitations`} onClick={() => setOpen(false)}>{t.moreWaysToInvite}</Link>
              <button type="button" onClick={() => setOpen(false)} className="dash-share-modal-later">
                {shared ? t.done : t.later}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
