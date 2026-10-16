'use client';

import { useState } from 'react';
import { FREE_GUEST_PHOTO_LIMIT, PLUS_GUEST_PHOTO_LIMIT } from '@/app/lib/guest-photos';
import { usePlus } from './plus-gate';
import { startPlusCheckout } from './upgrade-button';

// How many of the page's guest photos are used. Free pages get
// FREE_GUEST_PHOTO_LIMIT; near or at the limit they're offered Plus.
export function GuestPhotoAllowance({ used, limit, paid }: { used: number; limit: number; paid: boolean }) {
  const { pageId } = usePlus();
  const [loading, setLoading] = useState(false);
  const shown = Math.min(used, limit);
  const full = used >= limit;
  const nearly = !full && used >= limit * 0.8;
  const barColor = full ? '#B6584A' : nearly ? '#C9A227' : '#3D6B46';

  return (
    <section style={{ border: '1px solid #EDE8E3', background: '#fff', borderRadius: 12, padding: '14px 18px', marginBottom: 24, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#241F2B' }}>
          {shown} of {limit} photos
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#6B6470' }}>
          {paid ? 'Plus' : `Free: up to ${FREE_GUEST_PHOTO_LIMIT} photos`}
        </p>
      </div>
      <div role="progressbar" aria-label="Guest photos used" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={shown} style={{ height: 8, borderRadius: 999, background: '#EFE8E2', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', width: `${(shown / limit) * 100}%`, background: barColor, borderRadius: 'inherit' }} />
      </div>
      {!paid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <p style={{ margin: 0, flex: '1 1 260px', fontSize: 13, lineHeight: 1.5, color: full ? '#8B3A2A' : '#6B6470' }}>
            {full
              ? `Your photo wall is full: guests can’t add more. Upgrade to Plus for up to ${PLUS_GUEST_PHOTO_LIMIT} photos.`
              : `Upgrade to Plus for up to ${PLUS_GUEST_PHOTO_LIMIT} photos, plus invitations, reminders and more.`}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={async () => { setLoading(true); if (!(await startPlusCheckout(pageId))) setLoading(false); }}
            style={{
              padding: '8px 16px', borderRadius: 8, border: full || nearly ? 'none' : '1px solid #DDD5CF',
              background: full || nearly ? '#B6584A' : '#fff', color: full || nearly ? '#fff' : '#241F2B',
              fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Opening checkout…' : 'Upgrade to Plus'}
          </button>
        </div>
      )}
    </section>
  );
}
