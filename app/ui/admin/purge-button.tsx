'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmEmailModal, { type ConfirmResult } from './confirm-email-modal';
import { c } from './styles';

// Runs the purge for exactly the pages the admin is looking at. The server
// re-checks each page and skips any that no longer qualify.
export default function PurgeButton({ pageIds }: { pageIds: number[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const count = pageIds.length;
  const phrase = `delete ${count} page${count === 1 ? '' : 's'}`;

  async function run(typed: string): Promise<ConfirmResult> {
    const res = await fetch('/api/admin/purge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageIds, confirm: typed }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) return { error: data.error ?? 'Something went wrong. Nothing was deleted.' };
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
        Permanently delete these {count} page{count === 1 ? '' : 's'}…
      </button>
      {open && (
        <ConfirmEmailModal
          title={`Permanently delete ${count} page${count === 1 ? '' : 's'}?`}
          description="This removes each page, its guest list, RSVPs, songs, guest photos and gallery, and the actual files from storage. The owners' accounts stay. This cannot be undone."
          phrase={phrase}
          confirmLabel="Delete permanently"
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
