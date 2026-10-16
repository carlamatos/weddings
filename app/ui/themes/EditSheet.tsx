'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeLook } from './theme-look';

// The full-screen white editor that every editable piece of a page opens,
// so the owner sees clearly what they're changing: a title, a line on what
// it is, labelled fields with instructions, and Save / Cancel at the bottom.
// Portaled to <body> because every theme's hero clips its overflow.
export default function EditSheet({
  title,
  intro,
  onClose,
  onSave,
  saving,
  saveDisabled,
  saveLabel = 'Save',
  closeLabel = 'Cancel',
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  onClose: () => void;
  // Without onSave the changes apply as they're made and the sheet just has "Done".
  onSave?: () => void;
  saving?: boolean;
  saveDisabled?: boolean;
  saveLabel?: string;
  closeLabel?: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  // Hold the page still behind the sheet, take the keyboard focus (unless a
  // field already has it) and close on Escape wherever the focus is.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const previous = document.activeElement as HTMLElement | null;
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="theme-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      ref={ref}
    >
      <header className="theme-sheet-head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="theme-sheet-x" onClick={onClose} aria-label="Close without saving">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>
      <div className="theme-sheet-body">
        <div className="theme-sheet-inner">
          {intro && <p className="theme-sheet-intro">{intro}</p>}
          {children}
        </div>
      </div>
      <footer className="theme-sheet-foot">
        <div className="theme-sheet-inner theme-sheet-actions">
          {onSave ? (
            <>
              <button type="button" className="theme-sheet-btn" onClick={onClose}>{closeLabel}</button>
              <button type="button" className="theme-sheet-btn theme-sheet-btn--primary" onClick={onSave} disabled={saving || saveDisabled}>
                {saving ? 'Saving…' : saveLabel}
              </button>
            </>
          ) : (
            <button type="button" className="theme-sheet-btn theme-sheet-btn--primary" onClick={onClose}>Done</button>
          )}
        </div>
      </footer>
    </div>,
    document.body,
  );
}

// A labelled block in the sheet, with an optional instruction under the label.
export function SheetField({
  label,
  hint,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const Label = htmlFor ? 'label' : 'p';
  return (
    <div className="theme-sheet-field">
      <Label className="theme-sheet-label" {...(htmlFor ? { htmlFor } : {})}>
        {label}
        {optional && <span className="theme-sheet-optional"> (optional)</span>}
      </Label>
      {hint && <p className="theme-sheet-hint">{hint}</p>}
      {children}
    </div>
  );
}

// A section heading inside the sheet ("Date & time", "Location"…).
export function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="theme-sheet-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

// The text as it will look in the chosen colour — or, with none chosen, in
// the theme's own colour and type as read from the page — on a light and a
// dark background, since banner text sits on a photo that can be either.
export function TextPreview({ text, color, look, large }: { text: string; color: string; look?: ThemeLook; large?: boolean }) {
  const shown = color || look?.color;
  const style = (fallback: string): React.CSSProperties => ({
    ...look?.font,
    color: shown || fallback,
    WebkitTextFillColor: shown || fallback,
    fontSize: large ? 30 : 19,
  });
  return (
    <div className="theme-sheet-field">
      <p className="theme-sheet-label">Preview</p>
      <div className="theme-sheet-preview">
        <span className="theme-sheet-preview-light" style={style('#241F2B')}>{text || ' '}</span>
        <span className="theme-sheet-preview-dark" style={style('#ffffff')}>{text || ' '}</span>
      </div>
    </div>
  );
}
