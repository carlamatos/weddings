'use client';

import { useState } from 'react';

// Sends the owner to Stripe Checkout for Plus. False when that failed.
export async function startPlusCheckout(pageId?: number): Promise<boolean> {
  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageId !== undefined ? { pageId } : {}),
    });
    const data = await res.json();
    if (data.url) { window.location.href = data.url; return true; }
  } catch {
    // Fall through.
  }
  return false;
}

export default function UpgradeButton({ pageId }: { pageId?: number }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    if (!(await startPlusCheckout(pageId))) setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="dash-upgrade-btn"
    >
      {loading ? 'Redirecting…' : '⭐ Upgrade'}
    </button>
  );
}
