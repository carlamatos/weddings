'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { OPEN_PARAM } from './open-editor';
import ResendVerificationButton from '@/app/ui/dashboard/resend-verification-button';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
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
  const d = useDashText();
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
              <span className="theme-edit-verify-long">{d.editorCanvas.verifyYourEmailToPublish}</span>
              <span className="theme-edit-verify-short">{rich(d.editorCanvas.verifyYourEmailToPublish2, { t0: (s) => <span className="theme-edit-verify-why">{s}</span> })}</span>
            </button>
            <ResendVerificationButton label={d.editorCanvas.resendEmail} compact />
          </div>
          {showLocked && (
            <p className="theme-edit-locked">
              {fill(d.editorCanvas.untilYouClickTheLink, { uploadsPerDay: unverified.uploadsPerDay })}
            </p>
          )}
        </div>
      )}
      <div className="theme-edit-bar">
        <p>
          {mode === 'edit'
            ? <><strong>{d.editorCanvas.clickOrTapAnyText}</strong>{unverified ? '' : d.editorCanvas.switchToPreviewToSee}</>
            : <><strong>{d.editorCanvas.thisIsHowGuestsSee}</strong>{unverified ? '' : d.editorCanvas.switchToEditToMake}</>}
        </p>
        <div className="theme-edit-modes" role="group" aria-label={d.editorCanvas.editorMode}>
          <button type="button" aria-pressed={mode === 'edit'} onClick={() => choose('edit')}><PencilSquareIcon aria-hidden="true" />{d.editorCanvas.edit}</button>
          <button type="button" aria-pressed={mode === 'preview'} onClick={() => choose('preview')}><EyeIcon aria-hidden="true" />{d.editorCanvas.preview}</button>
        </div>
      </div>
      {children}
    </div>
  );
}
