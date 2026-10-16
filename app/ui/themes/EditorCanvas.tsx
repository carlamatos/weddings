'use client';

import { useEffect, useState } from 'react';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

// The page in the editor, with a bar above it: how to edit (click anything),
// and an Edit / Preview switch. Preview shows the page clean, as guests see
// it, with nothing clickable (dashboard.css, .theme-edit-canvas). The choice
// is remembered on this device.
const KEY = 'mygala-editor-mode';

export default function EditorCanvas({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a per-device preference after hydration
      if (localStorage.getItem(KEY) === 'preview') setMode('preview');
    } catch {
      // Storage blocked: start in Edit.
    }
  }, []);

  const choose = (next: 'edit' | 'preview') => {
    setMode(next);
    try { localStorage.setItem(KEY, next); } catch { /* not remembered */ }
  };

  return (
    <div className="theme-edit-canvas" data-mode={mode}>
      <div className="theme-edit-bar">
        <p>
          {mode === 'edit'
            ? <><strong>Click or tap any text, button or photo to change it.</strong> Switch to Preview to see your page as guests will.</>
            : <><strong>This is how guests see your page.</strong> Switch to Edit to make changes.</>}
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
