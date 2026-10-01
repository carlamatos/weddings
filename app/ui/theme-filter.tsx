'use client';

import { useEffect, useState } from 'react';

// Category filter for the homepage theme showcase. Wraps the four
// .theme-category blocks (each tagged with data-category) and hides the
// ones that don't match; "All" shows everything. The Events menu links
// (#theme-<category>) switch the filter to that category before scrolling,
// so they never point at a hidden section.
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'birthdays', label: 'Celebrations' },
  { key: 'business', label: 'Business Events' },
  { key: 'wedding', label: 'Weddings' },
  { key: 'community', label: 'General Events' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function categoryFromHash(hash: string): FilterKey | null {
  const match = /^#theme-(\w+)$/.exec(hash);
  const key = match?.[1];
  return FILTERS.some((f) => f.key === key) ? (key as FilterKey) : null;
}

export default function ThemeFilter({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<FilterKey>('all');

  useEffect(() => {
    function showFromHash() {
      const key = categoryFromHash(window.location.hash);
      if (!key) return;
      setActive(key);
      // The section may have been hidden a moment ago; scroll once it's shown.
      requestAnimationFrame(() => document.getElementById(`theme-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    showFromHash();
    window.addEventListener('hashchange', showFromHash);
    return () => window.removeEventListener('hashchange', showFromHash);
  }, []);

  return (
    <>
      <div className="theme-filter" role="group" aria-label="Filter themes by event type">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`theme-filter-btn${active === f.key ? ' theme-filter-btn--active' : ''}`}
            aria-pressed={active === f.key}
            onClick={() => setActive(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="theme-filter-scope" data-filter={active}>
        {children}
      </div>
    </>
  );
}
