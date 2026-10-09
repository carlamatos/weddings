'use client';

// A colour picker for the banner's text and buttons that can also be left on
// the theme's own colour ('' = theme default).
export default function HeroColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string; // '#rrggbb', or '' for the theme's colour
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          id={id}
          type="color"
          value={value || '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 44, height: 34, padding: 2, cursor: 'pointer', flex: 'none' }}
        />
        <span style={{ fontSize: 12, color: '#6B6470', fontFamily: 'system-ui, sans-serif', flex: 1 }}>
          {value ? value.toUpperCase() : 'Theme default'}
        </span>
        {value && (
          <button
            type="button"
            className="theme-edit-cancel"
            onClick={() => onChange('')}
            title="Use the theme's own colour"
          >
            Use theme colour
          </button>
        )}
      </div>
    </div>
  );
}
