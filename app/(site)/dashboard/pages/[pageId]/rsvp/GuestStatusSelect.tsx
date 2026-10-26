'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateGuestStatus } from '@/app/lib/actions';

type Status = 'invited' | 'attending' | 'not_attending';

const OPTIONS: { value: Status; label: string }[] = [
  { value: 'attending', label: 'Attending' },
  { value: 'not_attending', label: 'Declining' },
  { value: 'invited', label: 'Invited' },
];

const COLORS: Record<Status, React.CSSProperties> = {
  attending: { background: '#EAF2EC', color: '#3D6B46' },
  not_attending: { background: '#F5EDEA', color: '#8B3A2A' },
  invited: { background: '#EEF0F8', color: '#4A5296' },
};

// Lets the host change a guest's status (e.g. Attending -> Declining). The
// counters above the table refresh once it's saved.
export function GuestStatusSelect({ pageId, guestId, guestName, initial }: { pageId: number; guestId: string; guestName: string; initial: Status }) {
  const [status, setStatus] = useState<Status>(initial);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function change(next: Status) {
    const previous = status;
    setStatus(next);
    setError(false);
    startTransition(async () => {
      const result = await updateGuestStatus(pageId, guestId, next);
      if (!result.ok) {
        setStatus(previous);
        setError(true);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <select
        aria-label={`Status for ${guestName}`}
        value={status}
        disabled={pending}
        onChange={(e) => change(e.target.value as Status)}
        style={{
          ...COLORS[status], border: 'none', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600,
          fontFamily: 'inherit', cursor: pending ? 'default' : 'pointer', opacity: pending ? 0.6 : 1,
        }}
      >
        {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span role="alert" style={{ display: 'block', fontSize: 11, color: '#B91C1C', marginTop: 4 }}>Couldn’t save</span>}
    </>
  );
}
