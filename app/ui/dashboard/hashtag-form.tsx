'use client';

import { useState, useTransition } from 'react';
import { updateShareHashtag } from '@/app/lib/actions';
import { HASHTAG_MAX_LENGTH, normalizeHashtag } from '@/app/lib/hashtag';

export function HashtagForm({ pageId, initialHashtag, pageUrl }: {
  pageId: number;
  initialHashtag: string;
  pageUrl: string;
}) {
  const [saved, setSaved] = useState(initialHashtag);
  const [draft, setDraft] = useState(initialHashtag);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();
  const cleaned = normalizeHashtag(draft);
  const dirty = cleaned !== saved;

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateShareHashtag(pageId, draft);
      if (result === null) {
        setStatus('error');
        return;
      }
      setSaved(result);
      setDraft(result);
      setStatus('saved');
    });
  }

  return (
    <form onSubmit={save}>
      <label htmlFor="share-hashtag" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#241F2B', marginBottom: 6 }}>
        Hashtag <span style={{ fontWeight: 400, color: '#6B6470' }}>(optional)</span>
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B6470', fontSize: 14 }}>#</span>
          <input
            id="share-hashtag"
            value={draft}
            onChange={(e) => { setDraft(e.target.value.replace(/^#+/, '')); setStatus('idle'); }}
            placeholder="SofiaAndJames2026"
            maxLength={HASHTAG_MAX_LENGTH + 10}
            autoComplete="off"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 26px', border: '1px solid #DDD5CE', borderRadius: 8, fontSize: 14, color: '#241F2B', background: '#fff' }}
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !dirty}
          style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isPending || !dirty ? 'default' : 'pointer', opacity: isPending || !dirty ? 0.6 : 1 }}
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p style={{ fontSize: 13, color: '#6B6470', margin: '8px 0 0', lineHeight: 1.6 }}>
        {cleaned && cleaned !== draft && <>Will be saved as <strong>#{cleaned}</strong> (letters, numbers and _ only). </>}
        If you leave this empty, the section just says &ldquo;Share this event&rdquo; above the buttons, which share your page link
        (<span style={{ overflowWrap: 'anywhere' }}>{pageUrl.replace(/^https?:\/\//, '')}</span>).
      </p>
      {status === 'saved' && <p role="status" style={{ fontSize: 13, color: '#2F7A4F', margin: '6px 0 0' }}>{saved ? `Saved — guests will see #${saved}.` : 'Saved — the section will say “Share this event”.'}</p>}
      {status === 'error' && <p role="alert" style={{ fontSize: 13, color: '#B91C1C', margin: '6px 0 0' }}>Couldn’t save the hashtag. Please try again.</p>}
    </form>
  );
}
