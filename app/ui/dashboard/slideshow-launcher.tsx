'use client';

import { useState } from 'react';

import { useDashText } from '@/app/ui/dashboard/dash-text';
// The slideshow's link on the Photo Slideshow screen: open it here, or copy
// it to open on the computer or smart TV at the venue.
export function SlideshowLauncher({ url }: { url: string }) {
  const d = useDashText();
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the link is on screen to copy by hand.
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
      <a href={url} target="_blank" rel="noopener"
        style={{ padding: '10px 20px', borderRadius: 8, background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
        {d.slideshowLauncher.openTheSlideshow}
      </a>
      <button type="button" onClick={copy}
        style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #EDE8E3', background: '#fff', color: '#241F2B', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        {copied ? d.slideshowLauncher.linkCopied : d.slideshowLauncher.copyLink}
      </button>
      <code style={{ fontSize: 13, color: '#6B6470', overflowWrap: 'anywhere' }}>{url}</code>
    </div>
  );
}
