'use client';

import { useState, useRef, useEffect } from 'react';
import { SwatchIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { updateTheme } from '@/app/lib/actions';
import { EventTheme } from '@/app/lib/definitions';

interface Props {
  currentThemeId: string | null;
  themes: EventTheme[];
}

export default function ThemeSwitcher({ currentThemeId, themes }: Props) {
  const current = themes.find((t) => t.theme_id === currentThemeId) ?? themes[0] ?? null;
  const [selected, setSelected] = useState<EventTheme | null>(current);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (theme: EventTheme) => {
    setSelected(theme);
    setOpen(false);
    await updateTheme(theme.theme_id);
  };

  if (!themes.length) return null;

  const others = themes.filter((t) => t.theme_id !== selected?.theme_id);

  return (
    <div className="dash-theme-switcher" ref={ref}>
      <button
        className="dash-theme-btn"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <SwatchIcon style={{ width: 14, height: 14 }} />
        <span>{selected?.name ?? 'Choose theme'}</span>
        <ChevronDownIcon style={{ width: 12, height: 12, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {open && (
        <div className="dash-theme-dropdown">
          {others.map((theme) => (
            <button
              key={theme.theme_id}
              className="dash-theme-option"
              onClick={() => handleSelect(theme)}
              type="button"
            >
              {theme.name}
            </button>
          ))}
          {/* Show current with a checkmark at the bottom */}
          {selected && (
            <button className="dash-theme-option dash-theme-option--active" disabled type="button">
              <CheckIcon style={{ width: 13, height: 13 }} />
              {selected.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
