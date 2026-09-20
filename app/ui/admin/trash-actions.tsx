'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmEmailModal, { type ConfirmResult } from './confirm-email-modal';
import { alertError, buttonBase, dangerButton } from './styles';

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  return { ok: res.ok, data };
}

export default function TrashActions({ trashId, email }: { trashId: number; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);

  async function restore() {
    setBusy(true);
    setError(null);
    try {
      const { ok, data } = await post(`/api/admin/trash/${trashId}/restore`);
      if (!ok) {
        setError(data.error ?? 'Restore failed. Nothing was changed.');
        return;
      }
      window.alert(data.message ?? 'Restored.');
      router.refresh();
    } catch {
      setError('Network error. Nothing was changed — please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function purge(typedEmail: string): Promise<ConfirmResult> {
    const { ok, data } = await post(`/api/admin/trash/${trashId}/purge`, { confirmEmail: typedEmail });
    if (!ok) return { error: data.error ?? 'Something went wrong. Nothing was deleted.' };
    return { success: data.message ?? 'Permanently deleted.' };
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={restore} disabled={busy} style={{ ...buttonBase, opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Restoring…' : 'Restore'}
        </button>
        <button type="button" onClick={() => setPurgeOpen(true)} disabled={busy} style={dangerButton}>
          Delete permanently
        </button>
      </div>
      {error && (
        <div role="alert" style={{ ...alertError, marginTop: 8, maxWidth: 260 }}>
          {error}
        </div>
      )}
      {purgeOpen && (
        <ConfirmEmailModal
          title="Delete permanently?"
          description="This removes the account, their page, all guest data, and every photo and file they uploaded from storage. This cannot be undone."
          email={email}
          confirmLabel="Delete permanently"
          onConfirm={purge}
          onClose={() => {
            setPurgeOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
