'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { updatePageSetting } from '@/app/lib/actions';
import { RSVP_GUEST_LIST_ONLY_SETTING } from '@/app/lib/rsvp-settings';
import { card } from './guest-ui';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { rich } from '@/app/ui/dashboard/rich';
// Guests & RSVPs: only guests already on the guest list can RSVP. The reply has
// to match a guest's email address (app/api/rsvp). Off by default.
export function RsvpGuestListOption({
  pageId, initialOn, guestCount, guestListHref,
}: {
  pageId: number;
  initialOn: boolean;
  guestCount: number;
  guestListHref: string;
}) {
  const d = useDashText();
  const [on, setOn] = useState(initialOn);
  const [pending, startTransition] = useTransition();

  const toggle = (next: boolean) => {
    setOn(next);
    startTransition(async () => {
      await updatePageSetting(pageId, RSVP_GUEST_LIST_ONLY_SETTING, next ? 'true' : 'false');
    });
  };

  return (
    <section style={{ ...card, padding: '14px 18px', marginBottom: 24 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: '#241F2B', lineHeight: 1.5 }}>
        <input type="checkbox" checked={on} disabled={pending} onChange={(e) => toggle(e.target.checked)} style={{ marginTop: 3, accentColor: '#B6584A' }} />
        <span>
          <strong>{d.rsvpGuestListOption.onlyGuestsOnMyGuest}</strong>
          <span style={{ display: 'block', color: '#6B6470', fontSize: 13 }}>
            {rich(d.rsvpGuestListOption.guestsAreMatchedByEmail, { t0: (s) => <strong>{s}</strong>, t1: (s) => <Link href={guestListHref} style={{ color: '#B6584A', fontWeight: 600 }}>{s}</Link> })}
          </span>
          {on && guestCount === 0 && (
            <span role="alert" style={{ display: 'block', marginTop: 6, color: '#8A6800', fontSize: 13, fontWeight: 600 }}>
              {d.rsvpGuestListOption.yourGuestListIsEmpty}
            </span>
          )}
        </span>
      </label>
    </section>
  );
}
