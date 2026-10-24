'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { publishPage } from '@/app/lib/actions';

// "Publish my page": puts a draft live (publishPage, verified emails only).
export default function PublishButton({ pageId }: { pageId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => {
          setError(null);
          const result = await publishPage(pageId);
          if (result.error) setError(result.error);
          else router.refresh();
        })}
        style={{
          padding: '9px 18px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: pending ? 'default' : 'pointer', whiteSpace: 'nowrap', opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? 'Publishing…' : 'Publish my page'}
      </button>
      {error && <span role="alert" style={{ fontSize: 12, color: '#B91C1C', maxWidth: 280, textAlign: 'right' }}>{error}</span>}
    </span>
  );
}
