'use client';

import { useState } from 'react';
import { useDashText } from '@/app/ui/dashboard/dash-text';

// Song Requests: the DJ's private link to the live queue (sorted by votes,
// with a "Played" button). The host copies it and sends it to their DJ.
export function DjLink({ url }: { url: string }) {
  const d = useDashText();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked: the link is selectable */ }
  };
  return (
    <section style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '14px 18px', margin: '0 0 24px', maxWidth: 760 }}>
      <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#241F2B' }}>{d.djLink.title}</p>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6B6470', lineHeight: 1.5 }}>{d.djLink.hint}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input readOnly value={url} onFocus={(e) => e.target.select()} style={{ flex: '1 1 280px', minWidth: 0, padding: '8px 10px', border: '1px solid #E4DDD6', borderRadius: 8, fontSize: 13, color: '#241F2B' }} />
        <button type="button" onClick={copy} style={{ padding: '8px 14px', borderRadius: 8, border: 0, background: '#B6584A', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{copied ? d.djLink.copied : d.djLink.copy}</button>
        <a href={url} target="_blank" rel="noopener" style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #DDD5CE', color: '#241F2B', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{d.djLink.open}</a>
      </div>
    </section>
  );
}
