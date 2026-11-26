'use client';

import { useEffect, useState } from 'react';
import { ArrowUpOnSquareIcon, ChatBubbleLeftIcon, CheckIcon, LinkIcon } from '@heroicons/react/24/outline';
import { markLinkShared } from '@/app/lib/actions';
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';
import PublishButton from '@/app/ui/dashboard/publish-button';
import type { ShareLock } from '@/app/lib/page-status';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
const enc = encodeURIComponent;
const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 8,
  fontSize: 14, fontWeight: 600, textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', border: 'none',
};
const icon = { width: 18, height: 18 };

// The quickest way to invite: the page's link, ready to paste into a group
// chat. Copying or sharing it completes "Share your page with guests" on the
// setup checklist (markLinkShared), since many hosts never type in guests'
// emails. saveTheDate: the event is months away, so the save-the-date
// (app/lib/save-the-date.ts) comes first, the page under it.
export function QuickShare({ pageId, url, title, lock, saveTheDate }: { pageId: number; url: string; title: string; lock?: ShareLock; saveTheDate?: { url: string; title: string } }) {
  const d = useDashText();
  const box: React.CSSProperties = { border: '1px solid #E6D3CD', borderRadius: 12, padding: '18px 20px', marginBottom: 28, background: '#FBF5F3' };
  const h2: React.CSSProperties = { fontSize: 17, fontWeight: 600, color: '#241F2B', margin: '0 0 4px' };
  const p: React.CSSProperties = { fontSize: 14, color: '#6B6470', margin: '0 0 14px', lineHeight: 1.6, maxWidth: 640 };
  if (lock) return <section style={box}><ShareLocked lock={lock} pageId={pageId} /></section>;
  if (saveTheDate) {
    return (
      <section style={box}>
        <h2 style={h2}>{d.quickShare.saveTheDateTitle}</h2>
        <p style={p}>{d.quickShare.saveTheDateText}</p>
        <ShareLinkButtons pageId={pageId} url={saveTheDate.url} title={saveTheDate.title} message={fill(d.quickShare.saveTheDateMessage, { title, url: saveTheDate.url })} label={d.quickShare.saveTheDateLink} />
        <p style={{ margin: '10px 0 0', fontSize: 14 }}>
          <a href={saveTheDate.url} target="_blank" rel="noopener noreferrer" style={{ color: '#B6584A', fontWeight: 600 }}>{d.quickShare.seeYourSaveTheDate} ↗</a>
        </p>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#241F2B', margin: '22px 0 10px', paddingTop: 16, borderTop: '1px solid #EAD9D3' }}>{d.quickShare.orShareThePage}</h3>
        <ShareLinkButtons pageId={pageId} url={url} title={title} />
      </section>
    );
  }
  return (
    <section style={box}>
      <h2 style={h2}>{d.quickShare.theQuickestWayShareYour}</h2>
      <p style={p}>{d.quickShare.pasteItIntoYourFamily}</p>
      <ShareLinkButtons pageId={pageId} url={url} title={title} />
    </section>
  );
}

// In place of the share buttons while the page is a draft: confirm the
// email (with a button to send the link again), or publish.
export function ShareLocked({ lock, pageId }: { lock: 'verify' | 'publish'; pageId: number }) {
  const d = useDashText();
  return (
    <div role="status" style={{ background: '#F3EFF9', border: '1px solid #D9CFEA', borderRadius: 10, padding: '12px 14px', color: '#3F2E63' }}>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>{lock === 'verify' ? d.quickShare.confirmToShare : d.quickShare.publishToShare}</p>
      <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.5 }}>{lock === 'verify' ? d.quickShare.confirmToShareText : d.quickShare.publishToShareText}</p>
      {lock === 'verify' ? <ResendVerificationButton /> : <PublishButton pageId={pageId} />}
    </div>
  );
}

// The link with Copy, WhatsApp, Text and the phone's own share sheet. Also
// on the empty guest list (app/ui/dashboard/guest-list-start.tsx).
export function ShareLinkButtons({ pageId, url, title, message: own, label }: { pageId: number; url: string; title: string; message?: string; label?: string }) {
  const d = useDashText();
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const message = own ?? fill(d.quickShare.inviteMessage, { title, url });

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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        readOnly
        value={url}
        aria-label={label ?? d.quickShare.yourPageLink}
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
  );
}
