'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SearchEntry } from '@/app/lib/marketing/search-index';

type SearchModule = typeof import('@/app/lib/marketing/search-index');

const SUGGESTIONS = ['RSVP', 'Wedding', 'Pricing', 'Guest photos', 'Invitations', 'Livestream', 'Baby shower', 'Custom domain'];

const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

// Wraps the query's words in <mark> (case-insensitive; accents must match;
// a plural "s" is dropped so "photos" also marks "Photo").
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const words = terms
    .filter((t) => t.length > 1)
    .map((t) => (t.length > 3 && /[^s]s$/i.test(t) ? t.slice(0, -1) : t));
  if (!words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return <>{text.split(re).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))}</>;
}

// A snippet around the first matching word, so long FAQ answers show the
// relevant part rather than their opening sentence.
function excerpt(text: string, terms: string[], max = 170): string {
  if (text.length <= max) return text;
  const lower = text.toLowerCase();
  const hit = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, Math.min(hit - 50, text.length - max));
  const cut = text.slice(start, start + max);
  return `${start > 0 ? '…' : ''}${cut.trim()}${start + max < text.length ? '…' : ''}`;
}

// Search icon for the marketing top bar. Opens a full-screen search over
// the site's pages, features, event types, themes and FAQ. Also opens with
// "/" or Ctrl/⌘+K.
export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [mod, setMod] = useState<SearchModule | null>(null);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const openSearch = useCallback(() => {
    // Render inside .marketing-page (its colours and fonts) but outside the
    // top bar, whose backdrop-filter would trap a position: fixed panel.
    setPortalEl((buttonRef.current?.closest('.marketing-page') as HTMLElement | null) ?? document.body);
    setOpen(true);
    import('@/app/lib/marketing/search-index').then(setMod);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Keyboard shortcuts to open: "/" (when not typing) and Ctrl/⌘+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !open)) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, openSearch]);

  // While open: no page scroll behind it, focus in the box.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // The last search stays, selected, so typing replaces it.
    inputRef.current?.focus();
    inputRef.current?.select();
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close after navigating (e.g. a result on the same page with a #section).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  const results: SearchEntry[] = useMemo(() => (mod && query.trim() ? mod.searchSite(query) : []), [mod, query]);
  const terms = useMemo(() => (mod ? query.trim().split(/\s+/).filter(Boolean) : []), [mod, query]);

  // Tell Google Analytics what people search for, once they pause typing.
  useEffect(() => {
    const q = query.trim();
    if (!open || !mod || q.length < 2) return;
    const timer = window.setTimeout(() => {
      window.gtag?.('event', 'search', { search_term: q, results_count: results.length });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [open, mod, query, results.length]);

  const go = (r: SearchEntry) => {
    setOpen(false);
    if (/^https?:\/\//.test(r.url)) window.location.assign(r.url);
    else router.push(r.url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      setActive(next);
      listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[Math.min(active, results.length - 1)]);
    }
  };

  const q = query.trim();

  return (
    <>
      <button ref={buttonRef} type="button" className="topbar-search-btn" aria-label="Search" title="Search (Ctrl+K)" onClick={openSearch}>
        <SearchIcon />
      </button>

      {open && portalEl && createPortal(
        <div className="site-search" role="dialog" aria-modal="true" aria-label="Search MyGala" onKeyDown={onKeyDown}>
          <div className="site-search-head">
            <div className="site-search-field">
              <SearchIcon size={22} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                placeholder="Search features, themes, FAQ…"
                aria-label="Search MyGala"
                aria-controls="site-search-results"
                aria-activedescendant={results.length ? `site-search-r${active}` : undefined}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
              />
            </div>
            <button type="button" className="site-search-close" onClick={close} aria-label="Close search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              <span className="site-search-esc">Esc</span>
            </button>
          </div>

          <div className="site-search-body">
            {!q && (
              <div className="site-search-suggest">
                <p className="site-search-label">Popular searches</p>
                <div className="site-search-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => { setQuery(s); setActive(0); inputRef.current?.focus(); }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {q && !mod && <p className="site-search-status">Searching…</p>}

            {q && mod && (results.length ? (
              <>
                <p className="site-search-label" aria-live="polite">{results.length === 30 ? 'Top 30 results' : `${results.length} result${results.length === 1 ? '' : 's'}`}</p>
                <ul id="site-search-results" ref={listRef} className="site-search-results" role="listbox" aria-label="Search results">
                  {results.map((r, i) => (
                    <li key={`${r.kind}-${r.url}-${r.title}`} id={`site-search-r${i}`} role="option" aria-selected={i === active}>
                      <Link
                        href={r.url}
                        className={i === active ? 'is-active' : undefined}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => setOpen(false)}
                      >
                        <span className="site-search-kind">{r.kind}</span>
                        <span className="site-search-title"><Highlight text={r.title} terms={terms} /></span>
                        <span className="site-search-snippet"><Highlight text={excerpt(r.snippet, terms.map((t) => t.toLowerCase()))} terms={terms} /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="site-search-empty" aria-live="polite">
                <p className="site-search-empty-title">No results for “{q}”</p>
                <p>Try a shorter word, like <em>RSVP</em>, <em>photos</em> or <em>wedding</em> — or <Link href="/contact" onClick={() => setOpen(false)}>ask us</Link>.</p>
              </div>
            ))}
          </div>
        </div>,
        portalEl,
      )}
    </>
  );
}
