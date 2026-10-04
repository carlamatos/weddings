'use client';

import { useState } from 'react';
import { PLAN_PRICE_LABEL, PLAN_TERM_MONTHS } from '@/app/lib/plans';

export default function ExtendButton({ pageId }: { pageId: number }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: '9px 18px', borderRadius: 8, border: 'none',
        background: '#8A6800', color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? 'Redirecting…' : `Extend — ${PLAN_PRICE_LABEL} / ${PLAN_TERM_MONTHS} mo`}
    </button>
  );
}
