'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { updateHeroButton } from '@/app/lib/actions';
import { HERO_BUTTON_LABEL_MAX_LENGTH, heroButtonStyle, isHeroColor, type HeroButtonKey, type HeroButtonStyle } from './hero-style';
import HeroColorField from './HeroColorField';

// Editor version of a top-banner button: an Edit badge opens a dialog for its
// label, button colour and text colour. The dialog is portaled to <body>
// because every theme's hero clips its overflow.
export default function EditableHeroButton({
  pageId,
  id,
  href,
  className,
  defaultLabel,
  initial,
}: {
  pageId: number;
  id: HeroButtonKey;
  href: string;
  className: string;
  defaultLabel: string;
  initial?: HeroButtonStyle;
}) {
  const [current, setCurrent] = useState<HeroButtonStyle>(initial ?? {});
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [bg, setBg] = useState('');
  const [color, setColor] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startEdit = () => {
    setLabel(current.label ?? '');
    setBg(current.bg ?? '');
    setColor(current.color ?? '');
    setError('');
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    const ok = await updateHeroButton(pageId, id, { label, bg: isHeroColor(bg) ? bg : '', color: isHeroColor(color) ? color : '' });
    setSaving(false);
    if (!ok) {
      setError('Couldn’t save the button. Please try again.');
      return;
    }
    const trimmed = label.replace(/\s+/g, ' ').trim();
    setCurrent({ label: trimmed || undefined, bg: bg || undefined, color: color || undefined });
    setOpen(false);
  };

  const cancel = () => setOpen(false);

  // While the dialog is open the button previews the unsaved choices.
  const shown: HeroButtonStyle = open ? { label: label.trim() || undefined, bg: bg || undefined, color: color || undefined } : current;

  return (
    <span className="theme-editable" style={{ display: 'inline-flex', position: 'relative' }}>
      <a href={href} className={className} style={heroButtonStyle(shown)} onClick={(e) => { e.preventDefault(); startEdit(); }}>
        {shown.label || defaultLabel}
      </a>
      <button className="theme-edit-badge" onClick={startEdit} title="Edit button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit
      </button>

      {open && createPortal(
        <div className="theme-edit-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) cancel(); }}>
          <div
            className="theme-date-popover theme-date-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Edit button"
            onKeyDown={(e) => { if (e.key === 'Escape') cancel(); }}
          >
            <p className="theme-date-heading">Button</p>
            <div>
              <label htmlFor={`hb-${id}-label`}>Button text</label>
              <input
                id={`hb-${id}-label`}
                type="text"
                value={label}
                maxLength={HERO_BUTTON_LABEL_MAX_LENGTH}
                placeholder={defaultLabel}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                autoFocus
              />
            </div>
            <HeroColorField id={`hb-${id}-bg`} label="Button colour" value={bg} onChange={setBg} />
            <HeroColorField id={`hb-${id}-color`} label="Text colour" value={color} onChange={setColor} />
            {error && <p style={{ color: '#B91C1C', fontSize: 12, margin: 0 }}>{error}</p>}
            <div className="theme-edit-controls" style={{ marginTop: 4 }}>
              <button className="theme-edit-save" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button className="theme-edit-cancel" onClick={cancel}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}
