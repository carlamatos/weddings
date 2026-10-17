'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { Screenshot } from '@/app/lib/marketing/types';

// A product screenshot on a feature page. Click or tap it to see it full
// size in a dialog (Esc, the close button or a click outside closes it).
export function ZoomableScreenshot({ shot }: { shot: Screenshot }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false); // the full-size image loads on first open
  const close = () => dialog.current?.close();

  return (
    <figure className="mk-shot">
      <button type="button" className="mk-shot-open" onClick={() => { setOpened(true); dialog.current?.showModal(); }} aria-label={`Enlarge: ${shot.alt}`}>
        <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(max-width: 1180px) 100vw, 1120px" />
        <span className="mk-shot-zoom" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
          Click to enlarge
        </span>
      </button>
      <figcaption>{shot.caption}</figcaption>

      <dialog ref={dialog} className="mk-shot-dialog" aria-label={shot.alt} onClick={(e) => { if (!(e.target instanceof HTMLImageElement)) close(); }}>
        <button type="button" className="mk-shot-close" onClick={close} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="mk-shot-full">
          {opened && <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="100vw" quality={90} loading="eager" />}
        </div>
        <p className="mk-shot-hint">Swipe sideways to see the whole screen</p>
      </dialog>
    </figure>
  );
}
