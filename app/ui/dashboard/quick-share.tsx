'use client';

import { useEffect, useState } from 'react';
import { ArrowUpOnSquareIcon, ChatBubbleLeftIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';
import { markLinkShared } from '@/app/lib/actions';

import { useDashText } from '@/app/ui/dashboard/dash-text';
const enc = encodeURIComponent;
const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 8,
  fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', border: 'none',
};
const icon = { width: 18, height: 18 };

// The quickest way to invite: the page's link, ready to paste into a group
// chat. Copying or sharing it completes "Invite your guests" on the setup
// checklist (markLinkShared), since many hosts never type in guests' emails.
export function QuickShare({ pageId, url, title, draft = false }: { pageId: number; url: string; title: string; draft?: boolean }) {
  const d = useDashText();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const message = `You're invited to ${title}! Here are all the details, and you can RSVP here: ${url}`;

  useEffect(() => {
    // Read after mount so the server render and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator.share === 'function');
  }, []);

  const shared = () => { markLinkShared(pageId).catch(() => {}); };

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      shared();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(d.quickShare.copyThisLink, url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: message, url });
      shared();
    } catch {
      // Dismissed by the user — nothing to do.
    }
  }

  return (
    <section style={{ border: '1px solid #E6D3CD', borderRadius: 12, padding: '18px 20px', marginBottom: 28, background: '#FBF5F3' }}>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' }}>{d.quickShare.theQuickestWayShareYour}</h2>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6, maxWidth: 640 }}>
        {d.quickShare.pasteItIntoYourFamily}
      </p>
      {draft && (
        <p role="status" style={{ fontSize: 13, color: '#3F2E63', background: '#F3EFF9', border: '1px solid #D9CFEA', borderRadius: 8, padding: '8px 12px', margin: '0 0 14px', lineHeight: 1.5 }}>
          {d.quickShare.yourPageIsStillA}
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          readOnly
          value={url}
          aria-label={d.quickShare.yourPageLink}
          onFocus={(e) => e.currentTarget.select()}
          style={{ flex: '1 1 240px', minWidth: 0, padding: '10px 12px', border: '1px solid #DDD5CE', borderRadius: 8, fontSize: 14, color: '#241F2B', background: '#fff' }}
        />
        <button type="button" onClick={copy} style={{ ...btn, background: '#B6584A', color: '#fff' }}>
          {copied ? <CheckIcon style={icon} /> : <LinkIcon style={icon} />}
          {copied ? d.quickShare.copied : d.quickShare.copyLink}
        </button>
        <a href={`https://wa.me/?text=${enc(message)}`} target="_blank" rel="noopener noreferrer" onClick={shared} style={{ ...btn, background: '#25D366', color: '#fff' }}>
          {d.quickShare.whatsapp}
        </a>
        <a href={`sms:?&body=${enc(message)}`} onClick={shared} style={{ ...btn, background: '#fff', color: '#241F2B', border: '1px solid #DDD5CE' }}>
          <ChatBubbleLeftIcon style={icon} />
          {d.quickShare.text}
        </a>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} style={{ ...btn, background: '#fff', color: '#241F2B', border: '1px solid #DDD5CE' }}>
            <ArrowUpOnSquareIcon style={icon} />
            {d.quickShare.moreApps}
          </button>
        )}
      </div>
    </section>
  );
}
