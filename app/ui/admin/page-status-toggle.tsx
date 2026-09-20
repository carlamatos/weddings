'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { alertError, buttonBase, dangerButton } from './styles';

export default function PageStatusToggle({ pageId, status }: { pageId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inactive = status === 'inactive';
  const next = inactive ? 'active' : 'inactive';

  async function toggle() {
    if (
      next === 'inactive' &&
      !window.confirm(
        'Deactivate this page?\n\nGuests will see a "page unavailable" message until you reactivate it. The owner can still sign in to their dashboard.',
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? 'Something went wrong.');
      else router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        style={{ ...(inactive ? buttonBase : dangerButton), opacity: busy ? 0.6 : 1 }}
      >
        {busy ? 'Saving…' : inactive ? 'Reactivate' : 'Deactivate'}
      </button>
      {error && (
        <div role="alert" style={{ ...alertError, marginTop: 8, maxWidth: 220 }}>
          {error}
        </div>
      )}
    </div>
  );
}
