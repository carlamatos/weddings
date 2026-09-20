'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmEmailModal, { type ConfirmResult } from './confirm-email-modal';
import { c, dangerButton, disabledButton } from './styles';

export default function TrashUserButton({
  userId,
  email,
  blockedReason,
}: {
  userId: string;
  email: string;
  blockedReason: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (blockedReason) {
    return (
      <div>
        <button type="button" disabled title={blockedReason} style={disabledButton}>
          Move to trash
        </button>
        <div style={{ fontSize: 11, color: c.muted, marginTop: 4, maxWidth: 180 }}>{blockedReason}</div>
      </div>
    );
  }

  async function trash(typedEmail: string): Promise<ConfirmResult> {
    const res = await fetch(`/api/admin/users/${userId}/trash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmEmail: typedEmail }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) return { error: data.error ?? 'Something went wrong. Nothing was changed.' };
    return { success: data.message ?? 'Moved to the trash.' };
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={dangerButton}>
        Move to trash
      </button>
      {open && (
        <ConfirmEmailModal
          title="Move this user to the trash?"
          description="Their page will go offline and they will no longer be able to sign in. Nothing is permanently deleted — you can restore them from the Trash tab at any time."
          phrase={email}
          confirmLabel="Move to trash"
          onConfirm={trash}
          onClose={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
