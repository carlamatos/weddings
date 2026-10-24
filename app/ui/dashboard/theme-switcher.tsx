'use client';

import { useState } from 'react';
import { SwatchIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { updateTheme } from '@/app/lib/actions';
import { EventTheme } from '@/app/lib/definitions';
import { ThemePicker } from '@/app/ui/theme-picker';

interface Props {
  pageId: number;
  currentThemeId: string | null;
  themes: EventTheme[];
  // Shown before the theme's name ("Theme: Fun Party"), so the button reads
  // as the theme picker.
  label?: string;
}

// The page's theme. The button opens the full-screen gallery (the same one
// as on the create form, app/ui/theme-picker.tsx): every theme's website and
// invitation side by side, with a live preview; choosing one switches the
// page to it. The page's own text, colours and backgrounds stay.
export default function ThemeSwitcher({ pageId, currentThemeId, themes, label }: Props) {
  const current = themes.find((t) => t.theme_id === currentThemeId) ?? themes[0] ?? null;
  const [selected, setSelected] = useState<EventTheme | null>(current);
  const [open, setOpen] = useState(false);

  const choose = async (slug: string) => {
    const theme = themes.find((t) => t.slug === slug);
    setOpen(false);
    if (!theme || theme.theme_id === selected?.theme_id) return;
    setSelected(theme);
    await updateTheme(pageId, theme.theme_id);
  };

  if (!themes.length) return null;

  return (
    // The phone menu closes on clicks inside it: keep the gallery's own
    // clicks from reaching it.
    <div className="dash-theme-switcher" onClick={(e) => e.stopPropagation()}>
      <button
        className="dash-theme-btn"
        onClick={() => setOpen(true)}
        type="button"
        aria-haspopup="dialog"
      >
        <SwatchIcon style={{ width: 14, height: 14 }} />
        <span>{label && <span className="dash-theme-btn-label">{label}: </span>}{selected?.name ?? 'Choose theme'}</span>
        <ChevronRightIcon style={{ width: 12, height: 12 }} />
      </button>
      <ThemePicker open={open} selected={selected?.slug ?? ''} onChoose={choose} onClose={() => setOpen(false)} />
    </div>
  );
}
