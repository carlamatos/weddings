'use client';

import { useState, useTransition } from 'react';
import { updatePageSetting } from '@/app/lib/actions';
import { usePlus } from './plus-gate';

export function SectionToggle({
  pageId,
  settingName,
  initialOn,
  label = 'Show on your page',
  plusSection,
}: {
  pageId: number;
  settingName: string;
  initialOn: boolean;
  label?: string;
  // The Plus feature this switch shows to guests (its dashboard path). On a
  // free page it stays off and asks to upgrade — and switches on after.
  plusSection?: string;
}) {
  const plus = usePlus();
  const locked = !!plusSection && !plus.paid;
  const [saved, setOn] = useState(initialOn);
  const on = saved && !locked;
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (locked) { plus.ask({ section: plusSection, turnOn: true }); return; }
    const next = !on;
    setOn(next);
    startTransition(() => {
      updatePageSetting(pageId, settingName, String(next));
    });
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
      padding: '14px 18px', borderRadius: 10, border: '1px solid #EDE8E3', background: '#faf8f6',
      fontFamily: 'system-ui, sans-serif', width: 'fit-content',
    }}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        disabled={isPending}
        style={{
          position: 'relative', width: 40, height: 22, borderRadius: 999, border: 'none',
          background: on ? '#3D6B46' : '#D9D2CB', cursor: isPending ? 'default' : 'pointer',
          opacity: isPending ? 0.7 : 1, transition: 'background 0.15s ease', flexShrink: 0, padding: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.15s ease',
        }} />
      </button>
      <span style={{ fontSize: 14, fontWeight: 500, color: '#241F2B' }}>
        {label} — <strong>{on ? 'Visible' : 'Hidden'}</strong>
        {locked && <span style={{ color: '#6B6470' }}> · turns on with Plus</span>}
      </span>
    </div>
  );
}
