'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// The help centre's left sidebar: a search box and every guide, grouped by
// topic, with the open guide highlighted. Every link is in the HTML; typing
// narrows the list to the guides that match every word. On phones it folds
// into an "All topics" panel above the guide.

export type SidebarGuide = { slug: string; title: string; category: string; plan?: string; text: string };
type Category = { id: string; title: string };

const words = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(Boolean);

export function HelpSidebar({ guides, categories, current }: { guides: SidebarGuide[]; categories: Category[]; current?: string }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const shown = useMemo(() => {
    const q = words(query);
    if (!q.length) return guides;
    return guides.filter((g) => {
      const hay = words(`${g.title} ${g.text}`);
      return q.every((w) => hay.some((h) => h.startsWith(w)));
    });
  }, [query, guides]);
  const currentTitle = guides.find((g) => g.slug === current)?.title;

  // On desktop the sidebar scrolls on its own: bring the open guide into view.
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const aside = nav.current?.closest('.hc-aside');
    const link = nav.current?.querySelector<HTMLElement>('a.is-current');
    if (!aside || !link || aside.scrollHeight <= aside.clientHeight) return;
    const box = aside.getBoundingClientRect(), item = link.getBoundingClientRect();
    if (item.bottom > box.bottom - 24) aside.scrollTop += item.top - box.top - box.height / 3;
  }, [current]);

  const list = (
    <>
      <div className="hc-search">
        <MagnifyingGlassIcon aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guides" aria-label="Search the help centre" />
      </div>
      <Link href="/help" className={`hc-side-home${current ? '' : ' is-current'}`} aria-current={current ? undefined : 'page'}>Help centre home</Link>
      {shown.length === 0 && <p className="hc-side-empty">No guides match. Try another word or <Link href="/contact">ask us</Link>.</p>}
      {categories.map((c) => {
        const items = shown.filter((g) => g.category === c.id);
        if (!items.length) return null;
        return (
          <div key={c.id} className="hc-side-group">
            <p className="hc-side-title">{c.title}</p>
            <ul>
              {items.map((g) => (
                <li key={g.slug}>
                  <Link href={`/help/${g.slug}`} className={g.slug === current ? 'is-current' : undefined} aria-current={g.slug === current ? 'page' : undefined}>
                    {g.title}{g.plan && <span className="hc-plus">Plus</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );

  return (
    <nav ref={nav} className="hc-side" aria-label="Help topics">
      <button type="button" className="hc-side-toggle" aria-expanded={open} aria-controls="hc-side-panel" onClick={() => setOpen((o) => !o)}>
        <span>{currentTitle ? 'All topics' : 'Browse all topics'}</span><ChevronDownIcon aria-hidden="true" />
      </button>
      <div id="hc-side-panel" className={`hc-side-panel${open ? ' is-open' : ''}`}>{list}</div>
    </nav>
  );
}
