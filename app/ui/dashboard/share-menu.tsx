'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ShareIcon, LinkIcon, CheckIcon, EnvelopeIcon, ChatBubbleLeftIcon, ArrowUpOnSquareIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { NETWORKS } from './share-buttons';

const enc = encodeURIComponent;

// The networks offered in the top bar's quick menu, in this order; the rest
// (Pinterest, Reddit, Threads…) are on the full Share page.
const QUICK = ['WhatsApp', 'Facebook', 'Messenger', 'X', 'LinkedIn', 'Telegram'];

export type ShareTarget = { url: string; title: string; heading: string; sharePageHref: string };

// The share options themselves: the link with Copy, then the apps.
// `onDone` closes whatever holds the panel.
export function SharePanel({ url, title, heading, sharePageHref, onDone }: ShareTarget & { onDone: () => void }) {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: title, url });
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
        <input readOnly value={url} aria-label="Link to share" onFocus={(e) => e.currentTarget.select()} />
        <button type="button" onClick={copy} className={copied ? 'is-copied' : undefined}>
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      <div className="dash-share-grid">
        {networks.map((n) => (
          <a key={n.name} href={n.href(params)} target="_blank" rel="noopener noreferrer" className="dash-share-option" onClick={onDone}>
            <span className="dash-share-dot" style={{ background: n.color }} aria-hidden="true" />
            {n.name}
          </a>
        ))}
        <a href={`mailto:?subject=${enc(title)}&body=${enc(url)}`} className="dash-share-option" onClick={onDone}>
          <EnvelopeIcon />
          Email
        </a>
        <a href={`sms:?&body=${enc(text)}`} className="dash-share-option" onClick={onDone}>
          <ChatBubbleLeftIcon />
          Text message
        </a>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className="dash-share-option">
            <ArrowUpOnSquareIcon />
            More apps…
          </button>
        )}
      </div>

      <Link href={sharePageHref} className="dash-share-more" onClick={onDone}>
        More sharing options &amp; link preview
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

// A button in the dashboard's top bar ("Share", "Share RSVP") that opens the
// share options beneath it.
export default function ShareMenu({ label, ...target }: ShareTarget & { label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);

  return (
    <div className="dash-share" ref={ref}>
      <button type="button" className="dash-share-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true">
        <ShareIcon />
        {label}
      </button>
      {open && (
        <div className="dash-share-panel" role="dialog" aria-label={target.heading}>
          <SharePanel {...target} onDone={close} />
        </div>
      )}
    </div>
  );
}

// The same options opened from elsewhere (the profile menu on phones), as a
// panel under the top bar.
export function ShareSheet({ onClose, ...target }: ShareTarget & { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(true, onClose, ref);
  return (
    <div className="dash-share-panel dash-share-panel--sheet" role="dialog" aria-label={target.heading} ref={ref}>
      <SharePanel {...target} onDone={onClose} />
    </div>
  );
}
