'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShareIcon, LinkIcon, CheckIcon, EnvelopeIcon, ChatBubbleLeftIcon, ArrowUpOnSquareIcon, ChevronRightIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { NETWORKS } from './share-buttons';
import { markLinkShared } from '@/app/lib/actions';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { rich } from '@/app/ui/dashboard/rich';
const enc = encodeURIComponent;

// The networks offered in the top bar's quick menu, in this order; the rest
// (Pinterest, Reddit, Threads…) are on the Invite screen.
const QUICK = ['WhatsApp', 'Facebook', 'Messenger', 'X', 'LinkedIn', 'Telegram'];

// pageId: copying or sharing the link counts as inviting guests on the
// page's setup checklist (markLinkShared).
export type ShareTarget = { url: string; title: string; heading: string; sharePageHref: string; pageId?: number };

// The share options themselves: the link with Copy, then the apps.
// `onDone` closes whatever holds the panel.
export function SharePanel({ url, title, heading, sharePageHref, pageId, onDone }: ShareTarget & { onDone: () => void }) {
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
      await navigator.share({ title, text: title, url });
      shared();
    } catch {
      // Dismissed by the user — nothing to do.
    }
  }

  const text = `${title} ${url}`;
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

function ChoicePanel({ choices, onDone }: { choices: ShareChoice[]; onDone: () => void }) {
  const d = useDashText();
  const [index, setIndex] = useState(0);
  const current = choices[index] ?? choices[0];
  return (
    <>
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

// A tip under the Share button, on a host's first few dashboard visits
// while the page hasn't been shared yet: many think they must type in their
// guest list before anyone can RSVP. Not on the page editor, where the
// Themes tip shows on those same first visits. Remembered in this browser;
// closing it or opening the menu ends it.
const TIP_KEY = 'mygala.shareTip';
const TIP_VISITS = 3;
let countedTipVisit: { visit: string; show: boolean } | null = null;

function readTip(): { visits: number; done: boolean } {
  try {
    const v = JSON.parse(localStorage.getItem(TIP_KEY) ?? 'null');
    if (v && typeof v.visits === 'number') return { visits: v.visits, done: !!v.done };
  } catch {}
  return { visits: 0, done: false };
}
function writeTip(v: { visits: number; done: boolean }) {
  try { localStorage.setItem(TIP_KEY, JSON.stringify(v)); } catch {}
}

function useShareTip(enabled: boolean) {
  const pathname = usePathname();
  const offEditor = enabled && !/^\/dashboard\/pages\/[^/]+\/?$/.test(pathname ?? '');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Whether to show depends on this browser's storage, read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!offEditor) { setShow(false); return; }
    const v = readTip();
    if (v.done) return;
    const visit = `${pathname}@${performance.timeOrigin}`;
    if (countedTipVisit?.visit !== visit) {
      countedTipVisit = { visit, show: v.visits < TIP_VISITS };
      if (countedTipVisit.show) writeTip({ ...v, visits: v.visits + 1 });
    }
    setShow(countedTipVisit.show);
  }, [offEditor, pathname]);

  const dismiss = useCallback(() => {
    setShow(false);
    writeTip({ ...readTip(), done: true });
  }, []);
  return { show, dismiss };
}

// The top bar's Share button, with the share options beneath it. tip: the
// page hasn't been shared yet (its setup step isn't done).
export default function ShareMenu({ choices, tip = false }: { choices: ShareChoice[]; tip?: boolean }) {
  const d = useDashText();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);
  const { show: tipShown, dismiss: dismissTip } = useShareTip(tip);

  return (
    <div className="dash-share" ref={ref}>
      <button type="button" className="dash-share-btn" onClick={() => { setOpen((o) => !o); if (tipShown) dismissTip(); }} aria-expanded={open} aria-haspopup="true">
        <ShareIcon />
        {d.shareMenu.share}
      </button>
      {tipShown && !open && (
        <div className="dash-themes-tip dash-share-tip" role="status">
          <p>{rich(d.shareTip.noNeedToTypeIn, { t0: (s) => <strong>{s}</strong> })}</p>
          <button type="button" onClick={dismissTip} aria-label={d.shareTip.closeTip}><XMarkIcon /></button>
        </div>
      )}
      {open && (
        <div className="dash-share-panel" role="dialog" aria-label={d.shareMenu.share}>
          <ChoicePanel choices={choices} onDone={close} />
        </div>
      )}
    </div>
  );
}

// The same options opened from elsewhere (the profile menu on phones), as a
// panel under the top bar.
export function ShareSheet({ onClose, choices }: { onClose: () => void; choices: ShareChoice[] }) {
  const d = useDashText();
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(true, onClose, ref);
  return (
    <div className="dash-share-panel dash-share-panel--sheet" role="dialog" aria-label={d.shareMenu.share} ref={ref}>
      <ChoicePanel choices={choices} onDone={onClose} />
    </div>
  );
}
