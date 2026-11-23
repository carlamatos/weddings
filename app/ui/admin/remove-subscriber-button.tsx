'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { alertError, dangerButton, disabledButton } from './styles';

export default function RemoveSubscriberButton({ id, email }: { id: number; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm(`Remove ${email} from the newsletter?\n\nThey won't get newsletter emails, and their consent record is deleted. They can subscribe again themselves later.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? 'Something went wrong. Nothing was changed.');
      else router.refresh();
    } catch {
      setError('Network error. Nothing was changed — please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={remove} disabled={busy} style={busy ? disabledButton : dangerButton}>
        {busy ? 'Removing…' : 'Remove'}
      </button>
      {error && <div role="alert" style={{ ...alertError, marginTop: 6, maxWidth: 220, fontSize: 12 }}>{error}</div>}
    </div>
  );
}
