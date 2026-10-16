'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { updatePageSetting } from '@/app/lib/actions';
import { RSVP_GUEST_LIST_ONLY_SETTING } from '@/app/lib/rsvp-settings';
import { card } from './guest-ui';

// RSVP screen: only guests already on the guest list can RSVP. The reply has
// to match a guest's email address (app/api/rsvp). Off by default.
export function RsvpGuestListOption({
  pageId, initialOn, guestCount, guestListHref,
}: {
  pageId: number;
  initialOn: boolean;
  guestCount: number;
  guestListHref: string;
}) {
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
          <strong>Only guests on my guest list can RSVP</strong>
          <span style={{ display: 'block', color: '#6B6470', fontSize: 13 }}>
            Guests are matched by <strong>email address</strong>: a reply is accepted only when its email matches a guest on your{' '}
            <Link href={guestListHref} style={{ color: '#B6584A', fontWeight: 600 }}>Guest List</Link>, so make sure each guest has the
            email they&rsquo;ll use. Your RSVP form tells guests to use the email address you have for them.
          </span>
          {on && guestCount === 0 && (
            <span role="alert" style={{ display: 'block', marginTop: 6, color: '#8A6800', fontSize: 13, fontWeight: 600 }}>
              Your guest list is empty, so nobody can RSVP yet. Add your guests and their email addresses first.
            </span>
          )}
        </span>
      </label>
    </section>
  );
}
