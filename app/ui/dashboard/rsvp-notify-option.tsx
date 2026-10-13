'use client';

import { useState, useTransition } from 'react';
import { updatePageSetting } from '@/app/lib/actions';
import { card } from './guest-ui';

// RSVP screen: whether the organizer gets an email for every RSVP (sent to
// their account address). On by default.
export function RsvpNotifyOption({ pageId, initialOn, email }: { pageId: number; initialOn: boolean; email?: string }) {
  const [on, setOn] = useState(initialOn);
  const [pending, startTransition] = useTransition();

  const toggle = (next: boolean) => {
    setOn(next);
    startTransition(async () => {
      await updatePageSetting(pageId, 'rsvp_notify_owner', next ? 'true' : 'false');
    });
  };

  return (
    <section style={{ ...card, padding: '14px 18px', marginBottom: 24 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: '#241F2B', lineHeight: 1.5 }}>
        <input type="checkbox" checked={on} disabled={pending} onChange={(e) => toggle(e.target.checked)} style={{ marginTop: 3, accentColor: '#B6584A' }} />
        <span>
          <strong>Email me when someone RSVPs</strong>
          <span style={{ display: 'block', color: '#6B6470', fontSize: 13 }}>
            Each time a guest replies (or changes their reply), we&rsquo;ll send the details to {email ? <strong>{email}</strong> : 'your account email'}.
          </span>
        </span>
      </label>
    </section>
  );
}
