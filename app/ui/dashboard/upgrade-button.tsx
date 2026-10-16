'use client';

import { useState } from 'react';

// Sends the owner to Stripe Checkout for Plus. False when that failed.
// From inside a page's dashboard, checkout comes back to the same screen;
// `enable` is a Plus setting to switch on once paid (the section the host
// was turning on).
export async function startPlusCheckout(pageId?: number, { enable }: { enable?: string } = {}): Promise<boolean> {
  try {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageId !== undefined ? { pageId, returnPath: window.location.pathname, enable } : {}),
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
