'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { PhotoIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { updateSectionBackground } from '@/app/lib/actions';
import { compressImageFile } from '@/app/lib/compress-image';
import {
  isSectionBgImageUrl, isSectionBgKey, SECTION_BG_LABELS, sectionBgCss,
  type SectionBackground, type SectionBackgrounds as SectionBgValues, type SectionBgKey,
} from '@/app/lib/section-background';
import EditSheet, { SheetField, SheetSection } from './EditSheet';
import HeroColorField from './HeroColorField';
import { EARLY_STYLE_ID } from './section-backgrounds-early';

// The page's own section backgrounds (app/lib/section-background.ts), for
// every theme. Each section is found by its title (data-section-heading, set
// by SectionText); its "surface" is the nearest full-width element behind the
// title that paints a background, or, when the theme paints none there, the
// section's top-level block. The owner's colour or photo goes on that
// surface. Covering photo layers and full-size overlays the theme draws over
// it are hidden while a custom background is on, and everything is put back
// when it's removed. In the editor (pageId set) each section also gets a
// "Change background" button (top right) that opens the options.
// Applied after the page loads: themes keep their own markup.

type Target = { key: SectionBgKey; surface: HTMLElement };
type Saved = {
  background: string; backgroundPriority: string; position: string; isolation: string;
  layer?: HTMLElement; // narrow sections: a full-width layer behind the section instead
  hidden: { el: HTMLElement; visibility: string; priority: string }[];
};

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const GLOBAL_CSS = `
  [data-mg-bg-hide~="before"]::before { display: none !important; }
  [data-mg-bg-hide~="after"]::after { display: none !important; }
  .mg-bg-btn {
    position: absolute; right: 14px; z-index: 40;
    display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px 7px 11px; border: none; border-radius: 999px;
    background: rgba(255,255,255,0.94); box-shadow: 0 2px 10px rgba(0,0,0,0.22); cursor: pointer;
    font: 600 13px/1.2 system-ui, -apple-system, 'Segoe UI', sans-serif; color: #241F2B; -webkit-text-fill-color: #241F2B;
    letter-spacing: 0.2px; text-transform: none; text-shadow: none;
  }
  .mg-bg-layer { position: absolute; top: 0; bottom: 0; z-index: -1; pointer-events: none; }
  .mg-bg-btn:hover { background: #fff; }
  .mg-bg-btn:focus-visible { outline: 3px solid #B6584A; outline-offset: 2px; }
  .mg-bg-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
  .theme-edit-canvas[data-mode="preview"] .mg-bg-btn { display: none; }
`;

const paints = (el: Element) => {
  const cs = getComputedStyle(el);
  if (cs.backgroundImage !== 'none') return true;
  const m = cs.backgroundColor.match(/[\d.]+/g);
  return !!m && (m.length < 4 || Number(m[3]) > 0);
};

function findSurface(heading: HTMLElement, root: HTMLElement, key: SectionBgKey): HTMLElement {
  const marked = heading.closest<HTMLElement>(`[data-mg-bg-surface="${key}"]`);
  if (marked && root.contains(marked)) return marked;
  const width = root.getBoundingClientRect().width;
  for (let el = heading.parentElement; el && el !== root; el = el.parentElement) {
    if (el.getBoundingClientRect().width >= width * 0.95 && paints(el)) return el;
  }
  let top: HTMLElement = heading;
  while (top.parentElement && top.parentElement !== root) top = top.parentElement;
  return top;
}

// Layers the theme puts over the whole section (a photo, a dark wash): they'd
// cover the owner's background.
function coveringLayers(surface: HTMLElement): HTMLElement[] {
  const box = surface.getBoundingClientRect();
  const out: HTMLElement[] = [];
  surface.querySelectorAll<HTMLElement>(':scope > *, :scope > * > *').forEach((el) => {
    if (el.matches('.mg-bg-btn') || el.querySelector('[data-section-heading], .mg-bg-btn')) return;
    const cs = getComputedStyle(el);
    if (cs.position !== 'absolute' && cs.position !== 'fixed') return;
    const r = el.getBoundingClientRect();
    const covers = r.width >= box.width * 0.9 && r.height >= box.height * 0.8;
    const media = el.matches('img, video, picture, canvas') || !!el.querySelector('img, video, picture') || paints(el);
    if (covers && media) out.push(el);
  });
  return out;
}

function coveringPseudos(surface: HTMLElement): string {
  const box = surface.getBoundingClientRect();
  return (['before', 'after'] as const).filter((p) => {
    const cs = getComputedStyle(surface, `::${p}`);
    if (cs.content === 'none' || (cs.position !== 'absolute' && cs.position !== 'fixed')) return false;
    const w = parseFloat(cs.width), h = parseFloat(cs.height);
    const hasBg = cs.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
    return hasBg && w >= box.width * 0.9 && h >= box.height * 0.8;
  }).join(' ');
}

const toHex = (rgb: string): string | null => {
  const m = rgb.match(/[\d.]+/g);
  if (!m || (m.length >= 4 && Number(m[3]) < 0.6)) return null;
  return `#${m.slice(0, 3).map((v) => Math.round(Number(v)).toString(16).padStart(2, '0')).join('')}`;
};

// The theme's colours, read from the page: its section backgrounds, the page
// background, heading and button colours.
function themePalette(root: HTMLElement): string[] {
  const colors: string[] = [];
  const add = (c: string | null) => {
    if (!c) return;
    const near = colors.some((x) => {
      const d = [1, 3, 5].reduce((s, i) => s + Math.abs(parseInt(x.slice(i, i + 2), 16) - parseInt(c.slice(i, i + 2), 16)), 0);
      return d < 24;
    });
    if (!near) colors.push(c);
  };
  add(toHex(getComputedStyle(root).backgroundColor));
  root.querySelectorAll<HTMLElement>('[data-section-heading]').forEach((h) => {
    for (let el = h.parentElement; el && el !== root; el = el.parentElement) {
      if (el.hasAttribute('data-mg-bg-surface')) break; // the owner's own, not the theme's
      if (paints(el)) { add(toHex(getComputedStyle(el).backgroundColor)); break; }
    }
    add(toHex(getComputedStyle(h).color));
  });
  root.querySelectorAll<HTMLElement>('.btn, button[type="submit"], footer').forEach((el) => add(toHex(getComputedStyle(el).backgroundColor)));
  return colors.slice(0, 12);
}

export default function SectionBackgrounds({ values = {}, pageId }: { values?: SectionBgValues; pageId?: number }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [saved, setSaved] = useState<SectionBgValues>(values);
  const [editing, setEditing] = useState<SectionBgKey | null>(null);
  const [draft, setDraft] = useState<SectionBackground | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  // The window's width: page-wide layers behind narrow sections follow it.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const originals = useRef(new Map<HTMLElement, Saved>());
  // The sections' surfaces, changed only from effects; `targets` (state) just
  // renders the buttons.
  const surfaces = useRef(new Map<SectionBgKey, HTMLElement>());

  // Find the sections, and again whenever the page's sections change.
  useEffect(() => {
    // The theme's own top element (a theme may put <style> or <link> tags
    // first). The guests' page has the early <script> in between.
    let holder = anchor.current?.previousElementSibling;
    while (holder && !holder.hasAttribute('data-mg-theme')) holder = holder.previousElementSibling;
    const root = [...(holder?.children ?? [])].find((el): el is HTMLElement => el instanceof HTMLElement && !el.matches('style, link, script, meta, noscript'));
    if (!root) return;
    rootRef.current = root;
    let frame = 0;
    const scan = () => {
      frame = 0;
      const found = new Map<SectionBgKey, HTMLElement>();
      root.querySelectorAll<HTMLElement>('[data-section-heading]').forEach((h) => {
        const key = h.dataset.sectionHeading;
        if (isSectionBgKey(key) && !found.has(key)) found.set(key, findSurface(h, root, key));
      });
      surfaces.current = found;
      setTargets((prev) => {
        const same = prev.length === found.size && prev.every((t) => found.get(t.key) === t.surface);
        return same ? prev : [...found].map(([key, surface]) => ({ key, surface }));
      });
    };
    scan();
    const observer = new MutationObserver((records) => {
      // Our own buttons and styles don't count.
      if (records.every((r) => [...r.addedNodes, ...r.removedNodes].every((n) => n instanceof Element && n.matches('.mg-bg-btn, .mg-bg-layer')))) return;
      if (!frame) frame = requestAnimationFrame(scan);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const restore = useCallback((surface: HTMLElement) => {
    const o = originals.current.get(surface);
    if (!o) return;
    surface.style.setProperty('background', o.background, o.backgroundPriority);
    if (!o.background) surface.style.removeProperty('background');
    surface.style.setProperty('position', o.position);
    surface.style.setProperty('isolation', o.isolation);
    o.layer?.remove();
    for (const h of o.hidden) {
      h.el.style.setProperty('visibility', h.visibility, h.priority);
      if (!h.visibility) h.el.style.removeProperty('visibility');
    }
    surface.removeAttribute('data-mg-bg-hide');
    surface.removeAttribute('data-mg-bg-surface');
    originals.current.delete(surface);
  }, []);

  // Put each section's background on (the one being edited shows its draft).
  useEffect(() => {
    // Taking over from the page's early CSS (section-backgrounds-early.ts):
    // it's switched off first, so the theme's own overlays are seen and
    // handled here, then emptied; all before the next paint.
    const early = document.getElementById(EARLY_STYLE_ID) as HTMLStyleElement | null;
    const takeOver = !!early && !early.hasAttribute('data-done') && surfaces.current.size > 0;
    if (takeOver && early.sheet) early.sheet.disabled = true;
    for (const [key, surface] of surfaces.current) {
      const bg = editing === key ? draft : saved[key] ?? null;
      if (!bg) { restore(surface); if (pageId && getComputedStyle(surface).position === 'static') surface.style.setProperty('position', 'relative'); continue; }
      if (!originals.current.has(surface)) {
        const layers = coveringLayers(surface);
        originals.current.set(surface, {
          background: surface.style.getPropertyValue('background'),
          backgroundPriority: surface.style.getPropertyPriority('background'),
          position: surface.style.position,
          isolation: surface.style.isolation,
          hidden: layers.map((el) => ({ el, visibility: el.style.getPropertyValue('visibility'), priority: el.style.getPropertyPriority('visibility') })),
        });
        for (const el of layers) el.style.setProperty('visibility', 'hidden', 'important');
        const pseudos = coveringPseudos(surface);
        if (pseudos) surface.setAttribute('data-mg-bg-hide', pseudos);
      }
      surface.setAttribute('data-mg-bg-surface', key);
      if (getComputedStyle(surface).position === 'static') surface.style.setProperty('position', 'relative');
      const root = rootRef.current;
      const o = originals.current.get(surface)!;
      const rootBox = root?.getBoundingClientRect();
      const box = surface.getBoundingClientRect();
      // A section narrower than the page (its theme paints one background
      // for the whole page): a layer behind it, as wide as the page.
      if (rootBox && box.width < rootBox.width * 0.95 && getComputedStyle(surface).overflowX === 'visible') {
        if (!o.layer) {
          o.layer = document.createElement('div');
          o.layer.className = 'mg-bg-layer';
          o.layer.setAttribute('aria-hidden', 'true');
          surface.prepend(o.layer);
          surface.style.setProperty('isolation', 'isolate');
        }
        o.layer.style.left = `${rootBox.left - box.left}px`;
        o.layer.style.width = `${rootBox.width}px`;
        o.layer.style.setProperty('background', sectionBgCss(bg));
      } else {
        surface.style.setProperty('background', sectionBgCss(bg), 'important');
      }
    }
    if (takeOver) { early.setAttribute('data-done', ''); early.textContent = ''; }
  }, [targets, saved, editing, draft, pageId, restore, width]);

  const open = (key: SectionBgKey) => {
    if (rootRef.current) setPalette(themePalette(rootRef.current));
    setDraft(saved[key] ?? null);
    setEditing(key);
  };

  return (
    <>
      <span ref={anchor} hidden />
      <style>{GLOBAL_CSS}</style>
      {pageId && targets.map(({ key, surface }) => createPortal(
        <button
          key={key}
          type="button"
          className="mg-bg-btn"
          // Below a wavy or masked top edge, where one would hide the button.
          style={{ top: getComputedStyle(surface).maskImage && getComputedStyle(surface).maskImage !== 'none' ? 72 : 14 }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); open(key); }}
          title={`Change the ${SECTION_BG_LABELS[key]} section’s background`}
        >
          <SwatchIcon aria-hidden="true" />
          <span>Change background</span>
        </button>,
        surface,
        key,
      ))}
      {pageId && editing && (
        <BackgroundSheet
          pageId={pageId}
          sectionKey={editing}
          value={draft}
          palette={palette}
          onChange={setDraft}
          onClose={() => { setEditing(null); setDraft(null); }}
          onSaved={(bg) => { setSaved((prev) => { const next = { ...prev }; if (bg) next[editing] = bg; else delete next[editing]; return next; }); setEditing(null); setDraft(null); }}
        />
      )}
    </>
  );
}

function BackgroundSheet({
  pageId, sectionKey, value, palette, onChange, onClose, onSaved,
}: {
  pageId: number;
  sectionKey: SectionBgKey;
  value: SectionBackground | null;
  palette: string[];
  onChange: (bg: SectionBackground | null) => void;
  onClose: () => void;
  onSaved: (bg: SectionBackground | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saving, startSaving] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const label = SECTION_BG_LABELS[sectionKey];
  const color = value?.kind === 'color' ? value.color : '';
  const image = value?.kind === 'image' ? value : null;

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type.startsWith('video/')) { setError('Please choose a photo.'); return; }
    if (file.size > MAX_PHOTO_BYTES) { setError('That photo is larger than 4 MB. Please choose a smaller one.'); return; }
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', await compressImageFile(file));
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.status === 413) throw new Error('That photo is too large to upload. Please choose one under 4 MB.');
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!data.url || !isSectionBgImageUrl(data.url)) throw new Error(data.error ?? 'Upload failed. Please try again.');
      onChange({ kind: 'image', url: data.url, wash: image?.wash ?? 'none', strength: image?.strength ?? 30 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const save = () => startSaving(async () => {
    const ok = await updateSectionBackground(pageId, sectionKey, value);
    if (ok) onSaved(value);
    else setError('Couldn’t save the background. Please try again.');
  });

  return (
    <EditSheet
      title={`${label} background`}
      intro="Choose a colour or a photo for this section. It stays if you change your theme, and you can go back to the theme’s background any time."
      onClose={onClose}
      onSave={save}
      saving={saving}
      saveDisabled={uploading || saving}
    >
      {error && <p className="theme-sheet-error" role="alert">{error}</p>}

      <SheetSection title="Colour">
        <SheetField label="Your theme’s colours" hint="Colours from your current theme.">
          <div className="mg-bg-swatches" role="radiogroup" aria-label="Your theme’s colours">
            {palette.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={c}
                title={c}
                className={`mg-bg-swatch${color === c ? ' is-selected' : ''}`}
                style={{ background: c }}
                onClick={() => onChange({ kind: 'color', color: c })}
              />
            ))}
          </div>
        </SheetField>
        <HeroColorField
          id="section-bg-color"
          label="Or any colour"
          value={color}
          onChange={(c) => onChange(c ? { kind: 'color', color: c } : null)}
          hint="Click the colour square to choose any colour."
          defaultLabel="Theme background"
        />
      </SheetSection>

      <SheetSection title="Photo">
        <SheetField label="Upload a photo" hint="JPG, PNG or HEIC, up to 4 MB. It fills the whole section.">
          <div className="theme-sheet-row">
            <button type="button" className="theme-sheet-btn theme-sheet-btn--primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <PhotoIcon /> {uploading ? 'Uploading…' : image ? 'Choose another photo' : 'Choose a photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,.heic,.heif" style={{ display: 'none' }} onChange={pickFile} />
          </div>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt="Your section photo" className="mg-bg-photo-preview" />
          )}
        </SheetField>
        {image && (
          <>
            <SheetField label="Wash over the photo" hint="A light or dark wash keeps the text easy to read.">
              <div className="theme-sheet-choices">
                {(['none', 'light', 'dark'] as const).map((w) => (
                  <button key={w} type="button" aria-pressed={image.wash === w}
                    onClick={() => onChange({ ...image, wash: w, strength: w === 'none' ? 0 : image.strength || 30 })}>
                    {w === 'none' ? 'None' : w === 'light' ? 'Light' : 'Dark'}
                  </button>
                ))}
              </div>
            </SheetField>
            {image.wash !== 'none' && (
              <SheetField label="Strength" htmlFor="section-bg-strength">
                <div className="theme-sheet-row">
                  <input id="section-bg-strength" className="theme-sheet-range" type="range" min={10} max={80} step={5}
                    value={image.strength} onChange={(e) => onChange({ ...image, strength: Number(e.target.value) })} />
                  <span className="theme-sheet-range-value">{image.strength}%</span>
                </div>
              </SheetField>
            )}
          </>
        )}
      </SheetSection>

      <SheetSection title="Theme default">
        <div className="theme-sheet-row">
          <button type="button" className="theme-sheet-btn" onClick={() => onChange(null)} disabled={!value}>
            Use the theme’s background
          </button>
        </div>
        <p className="theme-sheet-hint" style={{ marginTop: 8 }}>{value ? 'Brings back your theme’s own background for this section.' : 'This section shows your theme’s own background.'}</p>
      </SheetSection>
    </EditSheet>
  );
}
