'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { OPEN_PARAM } from './open-editor';
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';

// The page in the editor, with a bar above it: how to edit (click anything),
// and an Edit / Preview switch. Preview shows the page clean, as guests see
// it, with nothing clickable (dashboard.css, .theme-edit-canvas). The choice
// is remembered on this device. A link that opens an editor (?open=, from
// the setup checklist) always lands in Edit.
// unverified: the account's email isn't verified yet, so a slim line above
// the bar says "Verify your email to publish your event." (tap it for what's
// locked) with a Resend email button — in place of the dashboard's banner.
const KEY = 'mygala-editor-mode';

export default function EditorCanvas({ children, unverified }: { children: React.ReactNode; unverified?: { uploadsPerDay: number } }) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [showLocked, setShowLocked] = useState(false);
  const params = useSearchParams();
  const opening = params.has(OPEN_PARAM);

  useEffect(() => {
    if (opening) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a per-device preference after hydration
      if (localStorage.getItem(KEY) === 'preview') setMode('preview');
    } catch {
      // Storage blocked: start in Edit.
    }
    // Only on arrival: the remembered choice, unless a link opened an editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- an editor was opened from a link
    if (opening) setMode('edit');
  }, [opening, params]);

  const choose = (next: 'edit' | 'preview') => {
    setMode(next);
    try { localStorage.setItem(KEY, next); } catch { /* not remembered */ }
  };

  return (
    <div className="theme-edit-canvas" data-mode={mode}>
      {/* Unverified: one slim line above the bar that scrolls away with the
          page (only the bar stays pinned). The link and the button stay on
          one line; phones get shorter wording. */}
      {unverified && (
        <div className="theme-edit-verify-strip">
          <div className="theme-edit-verify-row">
            <button type="button" className="theme-edit-verify" aria-expanded={showLocked} onClick={() => setShowLocked((v) => !v)}>
              <span className="theme-edit-verify-long">Verify your email to publish your event.</span>
              <span className="theme-edit-verify-short">Verify your email<span className="theme-edit-verify-why"> to publish</span>.</span>
            </button>
            <ResendVerificationButton label="Resend email" compact />
          </div>
          {showLocked && (
            <p className="theme-edit-locked">
              Until you click the link we emailed you, your page is a draft only you can see, and sending invitations, texting guests,
              connecting a domain and uploading more than {unverified.uploadsPerDay} photos a day are locked. Everything else you can build now.
            </p>
          )}
        </div>
      )}
      <div className="theme-edit-bar">
        <p>
          {mode === 'edit'
            ? <><strong>Click or tap any text, button or photo to change it.</strong>{unverified ? '' : ' Switch to Preview to see your page as guests will.'}</>
            : <><strong>This is how guests see your page.</strong>{unverified ? '' : ' Switch to Edit to make changes.'}</>}
        </p>
        <div className="theme-edit-modes" role="group" aria-label="Editor mode">
          <button type="button" aria-pressed={mode === 'edit'} onClick={() => choose('edit')}><PencilSquareIcon aria-hidden="true" />Edit</button>
          <button type="button" aria-pressed={mode === 'preview'} onClick={() => choose('preview')}><EyeIcon aria-hidden="true" />Preview</button>
        </div>
      </div>
      {children}
    </div>
  );
}
