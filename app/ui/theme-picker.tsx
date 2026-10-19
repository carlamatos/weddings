'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import { THEME_CARDS, type ThemeCard } from '@/app/lib/marketing/theme-cards';
import type { EventCategory } from './themes/types';

// The create-event form's theme choice: a full-screen gallery of every
// theme, filtered by type of event (All by default). Each card shows a
// picture of the whole demo page (scrolls through on hover; swipe inside it
// on a phone), so hosts can choose without opening the live preview.
// Pictures: public/images/theme-pages, made by scripts/theme-page-shots.mjs.

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  wedding: 'Weddings',
  birthdays: 'Celebrations',
  business: 'Business',
  community: 'General Events',
};
const FILTERS = ['all', 'wedding', 'birthdays', 'business', 'community'] as const;
type Filter = (typeof FILTERS)[number];

export const themePagePicture = (slug: string) => `/images/theme-pages/${slug}.webp`;
export const themeCard = (slug: string): ThemeCard | undefined => THEME_CARDS.find((t) => t.slug === slug);

export function ThemePicker({
  open, selected, onChoose, onClose,
}: {
  open: boolean;
  selected: string;
  onChoose: (slug: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const shown = filter === 'all' ? THEME_CARDS : THEME_CARDS.filter((t) => t.category === filter);
  const count = (f: Filter) => (f === 'all' ? THEME_CARDS.length : THEME_CARDS.filter((t) => t.category === f).length);

  return (
    // onClose: Esc (and close()) — keep the parent's state in step.
    <dialog ref={dialog} className="tp-dialog" aria-labelledby="tp-title" onClose={onClose}>
      <div className="tp-head">
        <div className="tp-head-row">
          <div>
            <h2 id="tp-title" className="tp-title">Choose your theme</h2>
            <p className="tp-sub">Every theme comes with the same sections — RSVP, countdown, photos and more. You can change it any time.</p>
          </div>
          <button type="button" className="tp-close" onClick={onClose} aria-label="Close">
            <XMarkIcon />
          </button>
        </div>
        <div className="tp-filters" role="group" aria-label="Type of event">
          {FILTERS.map((f) => (
            <button key={f} type="button" className="tp-filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : CATEGORY_LABELS[f]} <span>{count(f)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tp-body">
        {/* Only the open gallery loads its pictures. */}
        {open && (
          <ul className="tp-grid">
            {shown.map((t) => {
              const isSelected = t.slug === selected;
              return (
                <li key={t.slug} className={`tp-card${isSelected ? ' is-selected' : ''}`}>
                  <div className="tp-shot-wrap">
                    <div className="tp-shot" tabIndex={0} aria-label={`${t.name}: picture of the whole page`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={themePagePicture(t.slug)} alt={`The ${t.name} theme, the whole page`} loading="lazy" decoding="async" width={520} />
                    </div>
                    <span className="tp-shot-hint" aria-hidden="true" />
                  </div>
                  <div className="tp-info">
                    <p className="tp-cat">{CATEGORY_LABELS[t.category]}</p>
                    <h3 className="tp-name">{t.name}</h3>
                    <p className="tp-desc">{t.desc}</p>
                    <div className="tp-actions">
                      <button type="button" className="tp-choose" onClick={() => onChoose(t.slug)} aria-pressed={isSelected}>
                        {isSelected ? <><CheckIcon aria-hidden="true" /> Chosen</> : `Choose ${t.name}`}
                      </button>
                      <a className="tp-live" href={`/themes/${t.slug}`} target="_blank" rel="noopener noreferrer">
                        Live preview <ArrowTopRightOnSquareIcon aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </dialog>
  );
}
