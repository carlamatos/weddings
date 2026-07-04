'use client';

import { useState, useRef, useEffect } from 'react';
import { LanguageIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { updateLanguage } from '@/app/lib/actions';
import { LANGUAGES } from '@/app/lib/translations';

interface Props {
  currentLanguage: string;
}

export default function LanguageSwitcher({ currentLanguage }: Props) {
  const current = LANGUAGES.find((l) => l.code === currentLanguage) ?? LANGUAGES[0];
  const [selected, setSelected] = useState(current);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (lang: typeof LANGUAGES[0]) => {
    setSelected(lang);
    setOpen(false);
    await updateLanguage(lang.code);
  };

  const others = LANGUAGES.filter((l) => l.code !== selected.code);

  return (
    <div className="dash-theme-switcher" ref={ref}>
      <button
        className="dash-theme-btn"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <LanguageIcon style={{ width: 14, height: 14 }} />
        <span>{selected.label}</span>
        <ChevronDownIcon style={{ width: 12, height: 12, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {open && (
        <div className="dash-theme-dropdown">
          {others.map((lang) => (
            <button
              key={lang.code}
              className="dash-theme-option"
              onClick={() => handleSelect(lang)}
              type="button"
            >
              {lang.label}
            </button>
          ))}
          <button className="dash-theme-option dash-theme-option--active" disabled type="button">
            <CheckIcon style={{ width: 13, height: 13 }} />
            {selected.label}
          </button>
        </div>
      )}
    </div>
  );
}
