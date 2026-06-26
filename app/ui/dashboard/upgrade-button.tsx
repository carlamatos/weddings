'use client';

import { useState } from 'react';

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
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
