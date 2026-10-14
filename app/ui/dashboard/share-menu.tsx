'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ShareIcon, LinkIcon, CheckIcon, EnvelopeIcon, ChatBubbleLeftIcon, ArrowUpOnSquareIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { NETWORKS } from './share-buttons';

const enc = encodeURIComponent;

// The networks offered in the top bar's quick menu, in this order; the rest
// (Pinterest, Reddit, Threads…) are on the full Share page.
const QUICK = ['WhatsApp', 'Facebook', 'Messenger', 'X', 'LinkedIn', 'Telegram'];

// "Share" in the dashboard's top bar: copy the page link or send it to a
// messaging app or social network in one click.
export default function ShareMenu({ url, title, sharePageHref }: { url: string; title: string; sharePageHref: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read after mount so the server render and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator.share === 'function');
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
    <div className="dash-share" ref={ref}>
      <button type="button" className="dash-share-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true">
        <ShareIcon />
        Share
      </button>

      {open && (
        <div className="dash-share-panel" role="dialog" aria-label="Share your page">
          <p className="dash-share-title">Share your page</p>
          <div className="dash-share-link">
            <input readOnly value={url} aria-label="Your page link" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" onClick={copy} className={copied ? 'is-copied' : undefined}>
              {copied ? <CheckIcon /> : <LinkIcon />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>

          <div className="dash-share-grid">
            {networks.map((n) => (
              <a key={n.name} href={n.href(params)} target="_blank" rel="noopener noreferrer" className="dash-share-option" onClick={() => setOpen(false)}>
                <span className="dash-share-dot" style={{ background: n.color }} aria-hidden="true" />
                {n.name}
              </a>
            ))}
            <a href={`mailto:?subject=${enc(title)}&body=${enc(url)}`} className="dash-share-option" onClick={() => setOpen(false)}>
              <EnvelopeIcon />
              Email
            </a>
            <a href={`sms:?&body=${enc(text)}`} className="dash-share-option" onClick={() => setOpen(false)}>
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

          <Link href={sharePageHref} className="dash-share-more" onClick={() => setOpen(false)}>
            More sharing options &amp; link preview
            <ChevronRightIcon />
          </Link>
        </div>
      )}
    </div>
  );
}
