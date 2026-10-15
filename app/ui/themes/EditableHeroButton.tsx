'use client';

import { useState } from 'react';
import { updateHeroButton } from '@/app/lib/actions';
import { HERO_BUTTON_LABEL_MAX_LENGTH, heroButtonStyle, isHeroColor, type HeroButtonKey, type HeroButtonStyle } from './hero-style';
import HeroColorField from './HeroColorField';
import EditSheet, { SheetField } from './EditSheet';

// Editor version of a top-banner button: an Edit badge opens the full-screen
// editor for its label, button colour and text colour.
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

      {open && (
        <EditSheet
          title="Edit this button"
          intro={`The “${current.label || defaultLabel}” button on your banner. Guests tap it to jump to that part of your page.`}
          onClose={cancel}
          onSave={save}
          saving={saving}
        >
          <SheetField label="Button text" htmlFor={`hb-${id}-label`} hint={`Leave it empty to use the theme’s wording, “${defaultLabel}”.`}>
            <input
              id={`hb-${id}-label`}
              className="theme-sheet-input"
              type="text"
              value={label}
              maxLength={HERO_BUTTON_LABEL_MAX_LENGTH}
              placeholder={defaultLabel}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
              autoFocus
            />
          </SheetField>
          <HeroColorField id={`hb-${id}-bg`} label="Button colour" value={bg} onChange={setBg} hint="Click the colour square to choose the colour of the button itself." />
          <HeroColorField id={`hb-${id}-color`} label="Text colour" value={color} onChange={setColor} hint="Click the colour square to choose the colour of the words on the button. Pick one that stands out from the button colour." />
          <div className="theme-sheet-field">
            <p className="theme-sheet-label">Preview</p>
            <div className="theme-sheet-preview theme-sheet-preview--button">
              <span className="theme-sheet-preview-light"><span className="theme-sheet-button" style={heroButtonStyle(shown)}>{shown.label || defaultLabel}</span></span>
              <span className="theme-sheet-preview-dark"><span className="theme-sheet-button" style={heroButtonStyle(shown)}>{shown.label || defaultLabel}</span></span>
            </div>
            {!bg && !color && <p className="theme-sheet-hint">Using the theme’s colours — on your page the button looks the way the theme designed it.</p>}
          </div>
          {error && <p className="theme-sheet-error" role="alert">{error}</p>}
        </EditSheet>
      )}
    </span>
  );
}
