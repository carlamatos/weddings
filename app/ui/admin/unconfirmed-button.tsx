'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmEmailModal, { type ConfirmResult } from './confirm-email-modal';
import { c } from './styles';

// Moves exactly the never-confirmed accounts the admin is looking at to the
// trash. The server re-checks each one and skips any that no longer qualify.
export default function UnconfirmedButton({ userIds }: { userIds: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const count = userIds.length;
  const accounts = `${count} account${count === 1 ? '' : 's'}`;

  async function run(typed: string): Promise<ConfirmResult> {
    const res = await fetch('/api/admin/unconfirmed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, confirm: typed }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) return { error: data.error ?? 'Something went wrong. Nothing was changed.' };
    return { success: data.message ?? 'Done.' };
  }

  if (count === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: '10px 18px',
          borderRadius: 8,
          border: `1px solid ${c.red}`,
          background: c.red,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Move these {accounts} to the trash…
      </button>
      {open && (
        <ConfirmEmailModal
          title={`Move ${accounts} to the trash?`}
          description="Each account is removed with its draft pages, so their web addresses become free. Everything is kept in the Trash tab, where you can restore an account until it is permanently deleted from there."
          phrase={`remove ${accounts}`}
          confirmLabel="Move to trash"
          onConfirm={run}
          onClose={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
