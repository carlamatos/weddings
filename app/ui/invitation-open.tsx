'use client';

import { useEffect, useRef } from 'react';
import type { InvitationDesign, InvitationDetails } from '@/app/lib/invitation';
import { envelopeCopy } from '@/app/lib/invitation-envelope';
import { EnvelopeOpening } from '@/app/ui/invitation-envelope-opening';

// The guest's invitation page (app/(site)/i/[token]): tells MyGala the guest
// saw it (once, from here so link scanners don't count), then either opens
// the envelope or, for a link from the full-invitation email (go), carries
// on to the event page.
function recordView(token: string) {
  const body = JSON.stringify({ t: token });
  try {
    if (navigator.sendBeacon?.('/api/i/view', new Blob([body], { type: 'application/json' }))) return;
  } catch { /* fall through */ }
  fetch('/api/i/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}

export function InvitationOpen({ token, go, startOpen, ...card }: {
  token: string | null;
  go: string | null;
  design: InvitationDesign;
  details: InvitationDetails;
  language?: string | null;
  guestName: string;
  note: string | null;
  hostName: string;
  startOpen: boolean;
}) {
  const sent = useRef(false);
  const view = () => {
    if (!token || sent.current) return;
    sent.current = true;
    recordView(token);
  };

  useEffect(() => {
    // Straight to the page, or already open: seeing it counts.
    if (go || startOpen) view();
    if (go) window.location.replace(go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (go) {
    const t = envelopeCopy(card.language);
    return (
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: 'system-ui, sans-serif', color: '#241F2B', background: '#FAF9F7' }}>
        <p style={{ margin: 0 }}>{t.opening}</p>
        <a href={go} style={{ color: '#B6584A', fontWeight: 600 }}>{t.continue}</a>
      </div>
    );
  }
  return <EnvelopeOpening {...card} startOpen={startOpen} onOpen={view} guestToken={token} />;
}
