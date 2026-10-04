'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PageStatus } from '@/app/lib/page-status';
import { alertError, buttonBase, c, dangerButton } from './styles';

// Admin status buttons for one page:
//   active    → Deactivate · Suspend
//   inactive  → Reactivate · Suspend
//   suspended → Reactivate · Deactivate
// Deactivated pages can be turned back on by their owner; suspended ones only
// by an admin.
const CONFIRM: Record<PageStatus, string> = {
  active: 'Reactivate this page?\n\nGuests will be able to see it again.',
  inactive:
    'Deactivate this page?\n\nGuests will see a "page unavailable" message. The owner can still sign in and can reactivate it themselves.',
  suspended:
    'Suspend this page?\n\nGuests will see a "page unavailable" message and its forms and uploads close. The owner sees a "suspended by MyGala" notice and can’t reactivate it — only an admin can.',
};

const LABEL: Record<PageStatus, string> = { active: 'Reactivate', inactive: 'Deactivate', suspended: 'Suspend' };

const suspendButton: React.CSSProperties = { ...buttonBase, color: '#fff', background: c.red, borderColor: c.red };

export default function PageStatusToggle({ pageId, status }: { pageId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<PageStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current: PageStatus = status === 'inactive' || status === 'suspended' ? status : 'active';
  const options: PageStatus[] =
    current === 'active' ? ['inactive', 'suspended'] : current === 'inactive' ? ['active', 'suspended'] : ['active', 'inactive'];

  async function change(next: PageStatus) {
    if (!window.confirm(CONFIRM[next])) return;
    setBusy(next);
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
      setBusy(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((next) => (
          <button
            key={next}
            type="button"
            onClick={() => change(next)}
            disabled={busy !== null}
            style={{ ...(next === 'suspended' ? suspendButton : next === 'inactive' ? dangerButton : buttonBase), opacity: busy !== null ? 0.6 : 1 }}
          >
            {busy === next ? 'Saving…' : LABEL[next]}
          </button>
        ))}
      </div>
      {error && (
        <div role="alert" style={{ ...alertError, marginTop: 8, maxWidth: 220 }}>
          {error}
        </div>
      )}
    </div>
  );
}
