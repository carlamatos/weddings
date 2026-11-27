'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ShareIcon, LinkIcon, CheckIcon, EnvelopeIcon, ChatBubbleLeftIcon, ArrowUpOnSquareIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { NETWORKS } from './share-buttons';
import { markLinkShared } from '@/app/lib/actions';
import { ShareTipBubble, useShareTip } from './share-tip';
import { ShareLocked } from './quick-share';
import type { ShareLock } from '@/app/lib/page-status';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill, plural } from '@/app/lib/dash-text/fill';
const enc = encodeURIComponent;

// "Opened by N people" (app/lib/page-views.ts fetchPageOpens), shown at the
// top of the share options of a live page, with "· 9 this week" when not all
// of them came this week. sinceLabel: "Counted since
// November 25, 2026." for pages older than the counting.
export type OpensInfo = { people: number; week: number; sinceLabel: string | null };

function OpensLine({ opens }: { opens: OpensInfo }) {
  const d = useDashText();
  const t = d.pageOpens;
  if (opens.people === 0) {
    return <p className="dash-share-opened dash-share-opened--zero">{t.panelNobody}</p>;
  }
  return (
    <p className="dash-share-opened">
      <strong>{plural(opens.people, t.person, t.people)}</strong>
      {opens.week > 0 && opens.week < opens.people && <> · {fill(t.thisWeek, { n: opens.week })}</>}
      {opens.sinceLabel && <span className="dash-share-opened-since">{opens.sinceLabel}</span>}
    </p>
  );
}

// The networks offered in the top bar's quick menu, in this order; the rest
// (Pinterest, Reddit, Threads…) are on the Invite screen.
const QUICK = ['WhatsApp', 'Facebook', 'Messenger', 'X', 'LinkedIn', 'Telegram'];

// pageId: copying or sharing the link counts as inviting guests on the
// page's setup checklist (markLinkShared). lock: a draft, so instead of the
// link, confirm the email or publish (app/lib/page-status.ts). message: the
// text sent with the link (the save-the-date's own), else the title.
export type ShareTarget = { url: string; title: string; heading: string; sharePageHref: string; pageId?: number; lock?: ShareLock; message?: string };

// The share options themselves: the link with Copy, then the apps.
// `onDone` closes whatever holds the panel.
export function SharePanel(props: ShareTarget & { onDone: () => void }) {
  if (props.lock && props.pageId !== undefined) {
    return (
      <>
        <p className="dash-share-title">{props.heading}</p>
        <ShareLocked lock={props.lock} pageId={props.pageId} />
      </>
    );
  }
  return <OpenSharePanel {...props} />;
}

function OpenSharePanel({ url, title, heading, sharePageHref, pageId, message, onDone }: ShareTarget & { onDone: () => void }) {
  const d = useDashText();
  const shared = () => { if (pageId !== undefined) markLinkShared(pageId).catch(() => {}); };
  const sharedAndDone = () => { shared(); onDone(); };
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Read after mount so the server render and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator.share === 'function');
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      shared();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(d.shareMenu.copyThisLink, url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: message ?? title, url });
      shared();
    } catch {
      // Dismissed by the user — nothing to do.
    }
  }

  const text = message ?? `${title} ${url}`;
  const params = { url, title, text, shareImage: '' };
  // Messenger's share intent only works from the mobile app.
  const networks = QUICK
    .filter((name) => name !== 'Messenger' || isMobile)
    .map((name) => NETWORKS.find((n) => n.name === name)!)
    .filter(Boolean);

  return (
    <>
      <p className="dash-share-title">{heading}</p>
      <div className="dash-share-link">
        <input readOnly value={url} aria-label={d.shareMenu.linkToShare} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" onClick={copy} className={copied ? 'is-copied' : undefined}>
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? d.shareMenu.copied : d.shareMenu.copyLink}
        </button>
      </div>

      <div className="dash-share-grid">
        {networks.map((n) => (
          <a key={n.name} href={n.href(params)} target="_blank" rel="noopener noreferrer" className="dash-share-option" onClick={sharedAndDone}>
            <span className="dash-share-dot" style={{ background: n.color }} aria-hidden="true" />
            {n.name}
          </a>
        ))}
        <a href={`mailto:?subject=${enc(title)}&body=${enc(url)}`} className="dash-share-option" onClick={sharedAndDone}>
          <EnvelopeIcon />
          {d.shareMenu.email}
        </a>
        <a href={`sms:?&body=${enc(text)}`} className="dash-share-option" onClick={sharedAndDone}>
          <ChatBubbleLeftIcon />
          {d.shareMenu.textMessage}
        </a>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className="dash-share-option">
            <ArrowUpOnSquareIcon />
            {d.shareMenu.moreApps}
          </button>
        )}
      </div>

      <Link href={sharePageHref} className="dash-share-more" onClick={onDone}>
        {d.shareMenu.moreSharingOptionsLinkPreview}
        <ChevronRightIcon />
      </Link>
    </>
  );
}

// Closes on a click outside `ref` or Escape, while `open`.
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref]);
}

// What to share: the page itself, or straight to its RSVP form. One Share
// button offers both, as a choice at the top of the panel.
export type ShareChoice = { tab: string; target: ShareTarget };

function ChoicePanel({ choices, onDone, opens }: { choices: ShareChoice[]; onDone: () => void; opens?: OpensInfo | null }) {
  const d = useDashText();
  const [index, setIndex] = useState(0);
  const current = choices[index] ?? choices[0];
  return (
    <>
      {opens && !current.target.lock && <OpensLine opens={opens} />}
      {choices.length > 1 && (
        <div className="dash-share-tabs" role="tablist" aria-label={d.shareMenu.whatToShare}>
          {choices.map((c, i) => (
            <button
              key={c.tab}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={i === index ? 'is-active' : undefined}
              onClick={() => setIndex(i)}
            >
              {c.tab}
            </button>
          ))}
        </div>
      )}
      <SharePanel key={current.tab} {...current.target} onDone={onDone} />
    </>
  );
}

// The top bar's Share button, with the share options beneath it. tip: show
// the "ready to share" tip (share-tip.tsx) when it's this page's turn.
export default function ShareMenu({ choices, pageId, tip, opens }: { choices: ShareChoice[]; pageId?: number; tip?: { show: boolean; daysToGo: number | null; far?: boolean }; opens?: OpensInfo | null }) {
  const d = useDashText();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);
  const { show: tipShown, dismiss: dismissTip } = useShareTip(pageId, !!tip?.show);

  return (
    <div className={`dash-share${tipShown ? ' is-nudging' : ''}`} ref={ref}>
      <button type="button" className="dash-share-btn" onClick={() => { setOpen((o) => !o); if (tipShown) dismissTip(); }} aria-expanded={open} aria-haspopup="true">
        <ShareIcon />
        {d.shareMenu.share}
      </button>
      {tipShown && !open && <ShareTipBubble daysToGo={tip?.daysToGo ?? null} far={!!tip?.far} where="share" onClose={dismissTip} />}
      {open && (
        <div className="dash-share-panel" role="dialog" aria-label={d.shareMenu.share}>
          <ChoicePanel choices={choices} onDone={close} opens={opens} />
        </div>
      )}
    </div>
  );
}

// The same options opened from elsewhere (the Share button at the bottom
// right on phones and tablets), as a panel above that button (bottom) or
// under the top bar.
export function ShareSheet({ onClose, choices, bottom = false, opens }: { onClose: () => void; choices: ShareChoice[]; bottom?: boolean; opens?: OpensInfo | null }) {
  const d = useDashText();
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(true, onClose, ref);
  return (
    <div className={`dash-share-panel dash-share-panel--sheet${bottom ? ' dash-share-panel--bottom' : ''}`} role="dialog" aria-label={d.shareMenu.share} ref={ref}>
      <ChoicePanel choices={choices} onDone={onClose} opens={opens} />
    </div>
  );
}
