'use client';

import { useState } from 'react';
import { PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS } from '@/app/lib/plans';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
export default function ExtendButton({ pageId }: { pageId: number }) {
  const d = useDashText();
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
      {loading ? d.extendButton.redirecting : fill(d.extendButton.extendMo, { PLAN_PRICE_PLUS_TAX, PLAN_TERM_MONTHS })}
    </button>
  );
}
