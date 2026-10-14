'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { INVITATION_FONTS, type InvitationFont } from '@/app/lib/invitation';

const FONTS = Object.keys(INVITATION_FONTS) as InvitationFont[];

// "Creepster (spooky)" → name "Creepster", hint "spooky".
function parts(font: InvitationFont): { name: string; hint: string } {
  const m = /^(.*?)\s*\((.*)\)$/.exec(INVITATION_FONTS[font].label);
  return m ? { name: m[1], hint: m[2] } : { name: INVITATION_FONTS[font].label, hint: '' };
}

// A font dropdown that shows each font's name in that font. A native
// <select> can't: phones and macOS draw their own list in the system font.
// The fonts themselves are loaded by the designer (googleFontsHref).
export function FontPicker({ id, value, onChange, labelledBy }: {
  id: string;
  value: InvitationFont;
  onChange: (f: InvitationFont) => void;
  labelledBy: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(FONTS.indexOf(value));
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  function choose(font: InvitationFont) {
    onChange(font);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setActive(FONTS.indexOf(value));
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, FONTS.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(FONTS.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(FONTS[active]); }
    else if (e.key === 'Escape' || e.key === 'Tab') setOpen(false);
  }

  const current = parts(value);
  return (
    <div className="font-picker" ref={ref}>
      <button
        type="button"
        id={id}
        className="font-picker-btn"
        role="combobox"
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelledBy} ${id}`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => { setActive(FONTS.indexOf(value)); setOpen((o) => !o); }}
        onKeyDown={onKeyDown}
      >
        <span className="font-picker-name" style={{ fontFamily: INVITATION_FONTS[value].family }}>{current.name}</span>
        {current.hint && <span className="font-picker-hint">{current.hint}</span>}
        <ChevronDownIcon className="font-picker-chevron" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
      </button>
      {open && (
        <ul id={`${id}-list`} className="font-picker-list" role="listbox" aria-labelledby={labelledBy} ref={listRef}>
          {FONTS.map((f, i) => {
            const p = parts(f);
            return (
              <li
                key={f}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={f === value}
                className={`font-picker-option${i === active ? ' is-active' : ''}${f === value ? ' is-selected' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(f)}
              >
                <span className="font-picker-name" style={{ fontFamily: INVITATION_FONTS[f].family }}>{p.name}</span>
                {p.hint && <span className="font-picker-hint">{p.hint}</span>}
                {f === value && <CheckIcon className="font-picker-check" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
