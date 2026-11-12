'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updatePageSetting } from '@/app/lib/actions';
import { card } from './guest-ui';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { rich } from '@/app/ui/dashboard/rich';
// Invitations (Live Party), when the page is password protected: whether the page
// password is printed on the invitation, in the emails and in the text
// messages. On by default.
export function InvitationPasswordOption({
  pageId,
  state,
  passwordHref,
}: {
  pageId: number;
  state: 'unavailable' | 'included' | 'excluded';
  passwordHref: string;
}) {
  const d = useDashText();
  const router = useRouter();
  const [include, setInclude] = useState(state !== 'excluded');
  const [pending, startTransition] = useTransition();

  if (state === 'unavailable') {
    return (
      <section style={{ ...card, padding: '14px 18px', marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#241F2B', lineHeight: 1.6 }}>
          {rich(d.invitationPasswordOption.yourPageIsPasswordProtected, { t0: (s) => <strong>{s}</strong>, t1: (s) => <Link href={passwordHref} style={{ color: '#B6584A', fontWeight: 600 }}>{s}</Link> })}
        </p>
      </section>
    );
  }

  const toggle = (next: boolean) => {
    setInclude(next);
    startTransition(async () => {
      await updatePageSetting(pageId, 'invitation_include_password', next ? 'true' : 'false');
      router.refresh();
    });
  };

  return (
    <section style={{ ...card, padding: '14px 18px', marginBottom: 24 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: '#241F2B', lineHeight: 1.5 }}>
        <input type="checkbox" checked={include} disabled={pending} onChange={(e) => toggle(e.target.checked)} style={{ marginTop: 3, accentColor: '#B6584A' }} />
        <span>
          <strong>{d.invitationPasswordOption.includeThePagePasswordIn}</strong>
          <span style={{ display: 'block', color: '#6B6470', fontSize: 13 }}>
            {d.invitationPasswordOption.yourPageIsPasswordProtected2}
          </span>
        </span>
      </label>
    </section>
  );
}
