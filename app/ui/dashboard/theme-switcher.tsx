'use client';

import { useState, useRef, useEffect } from 'react';
import { SwatchIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { updateTheme } from '@/app/lib/actions';
import { EventTheme } from '@/app/lib/definitions';

interface Props {
  pageId: number;
  currentThemeId: string | null;
  themes: EventTheme[];
  // Shown before the theme's name ("Theme: Fun Party"), so the button reads
  // as the theme picker.
  label?: string;
}

export default function ThemeSwitcher({ pageId, currentThemeId, themes, label }: Props) {
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
    await updateTheme(pageId, theme.theme_id);
  };

  if (!themes.length) return null;

  return (
    <div className="dash-theme-switcher" ref={ref}>
      <button
        className="dash-theme-btn"
        onClick={() => setOpen((o) => !o)}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <SwatchIcon style={{ width: 14, height: 14 }} />
        <span>{label && <span className="dash-theme-btn-label">{label}: </span>}{selected?.name ?? 'Choose theme'}</span>
        <ChevronDownIcon style={{ width: 12, height: 12, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Every theme in its usual order; the current one is ticked. Three
          columns in the top bar, one scrolling column in the mobile menu
          (dashboard.css). */}
      {open && (
        <div className="dash-theme-dropdown" role="listbox" aria-label="Themes">
          {themes.map((theme) => {
            const active = theme.theme_id === selected?.theme_id;
            return (
              <button
                key={theme.theme_id}
                className={`dash-theme-option${active ? ' dash-theme-option--active' : ''}`}
                onClick={() => (active ? setOpen(false) : handleSelect(theme))}
                type="button"
                role="option"
                aria-selected={active}
              >
                {active && <CheckIcon style={{ width: 13, height: 13, flexShrink: 0 }} />}
                {theme.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
