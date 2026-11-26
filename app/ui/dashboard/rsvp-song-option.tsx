'use client';

import { useState, useTransition } from 'react';
import { updatePageSetting } from '@/app/lib/actions';
import { RSVP_SONG_SETTING } from '@/app/lib/rsvp-song';
import { card } from './guest-ui';
import { useDashText } from '@/app/ui/dashboard/dash-text';

// Guests & RSVPs: the free "a song for the dance floor" question on the RSVP
// form (app/lib/rsvp-song.ts). Off by default; answers land in Song Requests.
export function RsvpSongOption({ pageId, initialOn }: { pageId: number; initialOn: boolean }) {
  const d = useDashText();
  const [on, setOn] = useState(initialOn);
  const [pending, startTransition] = useTransition();

  const toggle = (next: boolean) => {
    setOn(next);
    startTransition(async () => {
      await updatePageSetting(pageId, RSVP_SONG_SETTING, next ? 'true' : 'false');
    });
  };

  return (
    <section id="rsvp-song" style={{ ...card, padding: '14px 18px', marginBottom: 24 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: '#241F2B', lineHeight: 1.5 }}>
        <input type="checkbox" checked={on} disabled={pending} onChange={(e) => toggle(e.target.checked)} style={{ marginTop: 3, accentColor: '#B6584A' }} />
        <span>
          <strong>{d.rsvpSongOption.askForASong}</strong>
          {/* Free on every plan, unlike the Song Requests section (Live Party). */}
          <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 999, background: '#E7F2EA', color: '#2F6B4A', fontSize: 11, fontWeight: 700, verticalAlign: 'middle' }}>{d.rsvpSongOption.free}</span>
          <span style={{ display: 'block', color: '#6B6470', fontSize: 13 }}>{d.rsvpSongOption.askForASongHint}</span>
        </span>
      </label>
    </section>
  );
}
