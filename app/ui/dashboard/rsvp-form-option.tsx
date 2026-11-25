'use client';

import { useState, useTransition } from 'react';
import { updatePageSetting } from '@/app/lib/actions';
import {
  RSVP_ACCEPT_TEXT_SETTING, RSVP_ALLOW_PARTY_SETTING, RSVP_CHOICE_TEXT_MAX, RSVP_DECLINE_TEXT_SETTING, cleanRsvpChoiceText,
} from '@/app/lib/rsvp-form-options';
import { card, input, primary } from './guest-ui';
import { useDashText } from '@/app/ui/dashboard/dash-text';

// Guests & RSVPs: whether a reply can be for a whole party (the default) or
// for one person only, and the host's own wording for "accepts" / "declines"
// (app/lib/rsvp-form-options.ts). The placeholders show the usual wording in
// the page's language, used while a box is empty.
export function RsvpFormOption({ pageId, initialOnePerson, initialAccept, initialDecline, defaultAccept, defaultDecline }: {
  pageId: number; initialOnePerson: boolean; initialAccept: string; initialDecline: string; defaultAccept: string; defaultDecline: string;
}) {
  const d = useDashText().rsvpFormOption;
  const [allowParty, setAllowParty] = useState(!initialOnePerson);
  const [accept, setAccept] = useState(initialAccept);
  const [decline, setDecline] = useState(initialDecline);
  const [saved, setSaved] = useState({ accept: initialAccept, decline: initialDecline });
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const changed = cleanRsvpChoiceText(accept) !== saved.accept || cleanRsvpChoiceText(decline) !== saved.decline;

  const toggle = (next: boolean) => {
    setAllowParty(next);
    startTransition(async () => {
      await updatePageSetting(pageId, RSVP_ALLOW_PARTY_SETTING, next ? 'true' : 'false');
    });
  };

  const save = () => {
    const next = { accept: cleanRsvpChoiceText(accept), decline: cleanRsvpChoiceText(decline) };
    startTransition(async () => {
      await updatePageSetting(pageId, RSVP_ACCEPT_TEXT_SETTING, next.accept);
      await updatePageSetting(pageId, RSVP_DECLINE_TEXT_SETTING, next.decline);
      setSaved(next);
      setAccept(next.accept);
      setDecline(next.decline);
      setMessage(d.saved);
    });
  };

  const fieldLabel = { display: 'grid', gap: 4, fontSize: 13, color: '#6B6470' } as const;

  return (
    <section style={{ ...card, padding: '14px 18px', marginBottom: 24 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, color: '#241F2B', lineHeight: 1.5 }}>
        <input type="checkbox" checked={allowParty} disabled={pending} onChange={(e) => toggle(e.target.checked)} style={{ marginTop: 3, accentColor: '#B6584A' }} />
        <span>
          <strong>{d.guestsCanReplyForOthers}</strong>
          <span style={{ display: 'block', color: '#6B6470', fontSize: 13 }}>{d.guestsCanReplyForOthersHint}</span>
        </span>
      </label>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #EDE8E3' }}>
        <strong style={{ fontSize: 14, color: '#241F2B' }}>{d.choiceWording}</strong>
        <p style={{ margin: '2px 0 10px', color: '#6B6470', fontSize: 13, lineHeight: 1.5 }}>{d.choiceWordingHint}</p>
        <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
          <label style={fieldLabel}>
            {d.acceptLabel}
            <input value={accept} maxLength={RSVP_CHOICE_TEXT_MAX} placeholder={defaultAccept} style={input}
              onChange={(e) => { setMessage(''); setAccept(e.target.value); }} />
          </label>
          <label style={fieldLabel}>
            {d.declineLabel}
            <input value={decline} maxLength={RSVP_CHOICE_TEXT_MAX} placeholder={defaultDecline} style={input}
              onChange={(e) => { setMessage(''); setDecline(e.target.value); }} />
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <button type="button" style={{ ...primary, opacity: changed && !pending ? 1 : 0.5 }} disabled={!changed || pending} onClick={save}>
            {pending ? d.saving : d.save}
          </button>
          {message && <span role="status" style={{ fontSize: 13, color: '#3D6B46' }}>{message}</span>}
        </div>
      </div>
    </section>
  );
}
