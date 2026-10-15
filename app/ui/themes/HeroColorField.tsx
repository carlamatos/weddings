'use client';

import { SheetField } from './EditSheet';

// A colour picker for text, buttons and the banner overlay that can also be
// left on the theme's own colour ('' = theme default). A large swatch, the
// colour's code, and a line on how to use it.
export default function HeroColorField({
  id,
  label,
  value,
  onChange,
  hint = 'Click the colour square to choose a new colour.',
  defaultLabel = 'Theme colour',
  allowDefault = true,
}: {
  id: string;
  label: string;
  value: string; // '#rrggbb', or '' for the theme's colour
  onChange: (next: string) => void;
  hint?: React.ReactNode;
  defaultLabel?: string;
  allowDefault?: boolean; // false when there's always a colour (the overlay)
}) {
  return (
    <SheetField label={label} hint={hint} htmlFor={id}>
      <div className="theme-color-field">
        <span className="theme-color-swatch" style={{ background: value || undefined }} data-empty={!value || undefined}>
          <input id={id} type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} />
        </span>
        <span className="theme-color-value">
          <strong>{value ? value.toUpperCase() : defaultLabel}</strong>
          <span>{value ? 'Your colour' : 'The colour the theme was designed with'}</span>
        </span>
        {allowDefault && value && (
          <button type="button" className="theme-sheet-btn theme-sheet-btn--small" onClick={() => onChange('')}>
            Use theme colour
          </button>
        )}
      </div>
    </SheetField>
  );
}
