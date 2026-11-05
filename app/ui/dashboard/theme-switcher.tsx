'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SwatchIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  // The top bar's short "Themes" button (phones and tablets), beside the
  // menu button: it just opens the gallery.
  quick?: boolean;
  // The top bar's buttons: on the page editor, a few pulses and a one-time
  // tip, so hosts notice they can switch themes (useThemesNudge).
  nudge?: boolean;
}

// Pulse the Themes button and show its tip on the editor's first few visits,
// until the host opens the gallery or closes the tip. Remembered in this
// browser only.
const NUDGE_KEY = 'mygala.themesNudge';
const NUDGE_VISITS = 3;
// The top bar has two of these buttons (phones and desktops): count each
// visit once, and give both the same answer.
let countedVisit: { visit: string; show: boolean } | null = null;

function readNudge(): { visits: number; done: boolean } {
  try {
    const v = JSON.parse(localStorage.getItem(NUDGE_KEY) ?? 'null');
    if (v && typeof v.visits === 'number') return { visits: v.visits, done: !!v.done };
  } catch {}
  return { visits: 0, done: false };
}
function writeNudge(v: { visits: number; done: boolean }) {
  try { localStorage.setItem(NUDGE_KEY, JSON.stringify(v)); } catch {}
}

function useThemesNudge(enabled: boolean) {
  const pathname = usePathname();
  const onEditor = enabled && /^\/dashboard\/pages\/[^/]+\/?$/.test(pathname ?? '');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!onEditor) { setShow(false); return; }
    const v = readNudge();
    if (v.done) return;
    const visit = `${pathname}@${performance.timeOrigin}`;
    if (countedVisit?.visit !== visit) {
      countedVisit = { visit, show: v.visits < NUDGE_VISITS };
      if (countedVisit.show) writeNudge({ ...v, visits: v.visits + 1 });
    }
    setShow(countedVisit.show);
  }, [onEditor, pathname]);

  const dismiss = () => {
    setShow(false);
    writeNudge({ ...readNudge(), done: true });
  };
  return { show, dismiss };
}

// The page's theme. The button opens the full-screen gallery (the same one
// as on the create form, app/ui/theme-picker.tsx): every theme's website and
// invitation side by side, with a live preview; choosing one switches the
// page to it. The page's own text, colours and backgrounds stay.
export default function ThemeSwitcher({ pageId, currentThemeId, themes, label, quick = false, nudge = false }: Props) {
  const current = themes.find((t) => t.theme_id === currentThemeId) ?? themes[0] ?? null;
  const [selected, setSelected] = useState<EventTheme | null>(current);
  const [open, setOpen] = useState(false);
  const { show: nudging, dismiss } = useThemesNudge(nudge);
  const openPicker = () => { setOpen(true); if (nudging) dismiss(); };

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
    <div className={`dash-theme-switcher${quick ? ' dash-themes-quick' : ''}${nudging ? ' is-nudging' : ''}`} onClick={(e) => e.stopPropagation()}>
      {quick ? (
        <button className="dash-theme-btn" onClick={openPicker} type="button" aria-haspopup="dialog">
          <SwatchIcon style={{ width: 14, height: 14 }} />
          <span>Themes</span>
        </button>
      ) : (
        <button
          className="dash-theme-btn"
          onClick={openPicker}
          type="button"
          aria-haspopup="dialog"
        >
          <SwatchIcon style={{ width: 14, height: 14 }} />
          <span>{label && <span className="dash-theme-btn-label">{label}: </span>}{selected?.name ?? 'Choose theme'}</span>
          <ChevronRightIcon style={{ width: 12, height: 12 }} />
        </button>
      )}
      {nudging && (
        <div className="dash-themes-tip" role="status">
          <p><strong>Try a different look.</strong> Pick another theme: your text and photos stay.</p>
          <button type="button" onClick={dismiss} aria-label="Close tip"><XMarkIcon /></button>
        </div>
      )}
      <ThemePicker open={open} selected={selected?.slug ?? ''} onChoose={choose} onClose={() => setOpen(false)} gridOnPhones />
    </div>
  );
}
