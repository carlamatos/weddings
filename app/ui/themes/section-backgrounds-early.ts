import type { SectionBackgrounds } from '@/app/lib/section-background';

// The page's own section backgrounds, put on while the page is still being
// read, so guests never see the theme's background first. ThemeRenderer
// writes this function into the page as an inline <script> right after the
// theme: it runs before the page is first painted. It must stand alone: no
// imports and nothing from outside the function (it is sent as its source).
//
// It touches none of the theme's elements: it writes CSS rules into its own
// <style> (EARLY_STYLE_ID), each aimed at a section by its place in the page.
// Once React has the page, SectionBackgrounds.tsx puts the same backgrounds
// on the elements themselves and empties that <style>, so the places are
// only relied on while the page is exactly as the server sent it. What CSS
// alone can't do (a photo on a section narrower than the page, which needs an
// extra layer) waits for SectionBackgrounds.tsx. The rules for finding a
// section's surface are the same as there; keep them in step.
export const EARLY_STYLE_ID = 'mg-section-bg-early';

export function applySectionBackgroundsEarly(values: SectionBackgrounds, styleId: string) {
  const style = document.getElementById(styleId);
  const holder = document.currentScript?.previousElementSibling;
  if (!style || !holder) return;
  const root = Array.from(holder.children).find((el) => !el.matches('style, link, script, meta, noscript')) as HTMLElement | undefined;
  if (!root) return;

  const paints = (el: Element) => {
    const cs = getComputedStyle(el);
    if (cs.backgroundImage !== 'none') return true;
    const m = cs.backgroundColor.match(/[\d.]+/g);
    return !!m && (m.length < 4 || Number(m[3]) > 0);
  };
  const css = (bg: NonNullable<SectionBackgrounds[keyof SectionBackgrounds]>) => {
    if (bg.kind === 'color') return bg.color;
    const layer = `url("${bg.url}") center / cover no-repeat`;
    if (bg.wash === 'none' || !bg.strength) return layer;
    const c = bg.wash === 'light' ? '255,255,255' : '0,0,0';
    const a = bg.strength / 100;
    return `linear-gradient(rgba(${c},${a}), rgba(${c},${a})), ${layer}`;
  };
  // A selector for an element by its place under the theme's holder.
  const path = (el: Element) => {
    const steps: string[] = [];
    for (let e: Element | null = el; e && e !== holder; e = e.parentElement) {
      steps.unshift(`:nth-child(${Array.prototype.indexOf.call(e.parentElement!.children, e) + 1})`);
    }
    return `[data-mg-theme] > ${steps.join(' > ')}`;
  };

  const width = root.getBoundingClientRect().width;
  const rules: string[] = [];
  const narrow: { surface: HTMLElement; selector: string; color: string }[] = [];
  const done = new Set<string>();

  root.querySelectorAll<HTMLElement>('[data-section-heading]').forEach((heading) => {
    const key = heading.dataset.sectionHeading as keyof SectionBackgrounds;
    const bg = values[key];
    if (!bg || done.has(key)) return;
    done.add(key);

    // The surface: the nearest full-width element behind the title that
    // paints a background, else the section's top-level block.
    let surface: HTMLElement | null = null;
    for (let el = heading.parentElement; el && el !== root; el = el.parentElement) {
      if (el.getBoundingClientRect().width >= width * 0.95 && paints(el)) { surface = el; break; }
    }
    if (!surface) {
      surface = heading;
      while (surface.parentElement && surface.parentElement !== root) surface = surface.parentElement;
    }
    const box = surface.getBoundingClientRect();
    const isNarrow = box.width < width * 0.95;
    if (isNarrow && bg.kind === 'image') return; // needs a layer: SectionBackgrounds.tsx does it
    const selector = path(surface);

    // Photo layers and full-size overlays the theme draws over the section.
    surface.querySelectorAll<HTMLElement>(':scope > *, :scope > * > *').forEach((el) => {
      if (el.querySelector('[data-section-heading]')) return;
      const cs = getComputedStyle(el);
      if (cs.position !== 'absolute' && cs.position !== 'fixed') return;
      const r = el.getBoundingClientRect();
      const media = el.matches('img, video, picture, canvas') || !!el.querySelector('img, video, picture') || paints(el);
      if (media && r.width >= box.width * 0.9 && r.height >= box.height * 0.8) rules.push(`${path(el)}{visibility:hidden!important}`);
    });
    for (const p of ['before', 'after']) {
      const cs = getComputedStyle(surface, `::${p}`);
      if (cs.content === 'none' || (cs.position !== 'absolute' && cs.position !== 'fixed')) continue;
      const hasBg = cs.backgroundImage !== 'none' || !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
      if (hasBg && parseFloat(cs.width) >= box.width * 0.9 && parseFloat(cs.height) >= box.height * 0.8) rules.push(`${selector}::${p}{display:none!important}`);
    }

    rules.push(`${selector}{background:${css(bg)}!important}`);
    if (isNarrow) narrow.push({ surface, selector, color: (bg as { color: string }).color });
  });

  // A colour on a section narrower than the page: copies of the section's
  // box, side by side, carry it out to the page's edges (shadows add no
  // elements and don't change the layout). Redone when the width changes,
  // until React takes over (it marks the <style> data-done).
  const write = () => {
    const page = root.getBoundingClientRect();
    const extra = narrow.map(({ surface, selector, color }) => {
      const r = surface.getBoundingClientRect();
      const reach = Math.max(r.left - page.left, page.right - r.right);
      const shadows: string[] = [];
      for (let x = r.width; r.width && x - r.width < reach; x += r.width) shadows.push(`${x}px 0 0 0 ${color}`, `${-x}px 0 0 0 ${color}`);
      return shadows.length ? `${selector}{box-shadow:${shadows.join(',')}!important}` : '';
    });
    style.textContent = rules.concat(extra).join('\n');
  };
  write();
  if (narrow.length) {
    const onResize = () => { if (style.hasAttribute('data-done')) window.removeEventListener('resize', onResize); else write(); };
    window.addEventListener('resize', onResize);
  }
}

// The <script> text for a page's backgrounds. Nothing in the values can end
// the script early: colours are #rrggbb and photo addresses are checked
// (section-background.ts), and '<' is escaped anyway.
export function sectionBackgroundsScript(values: SectionBackgrounds): string {
  const args = `${JSON.stringify(values)}, ${JSON.stringify(EARLY_STYLE_ID)}`.replace(/</g, '\\u003c');
  return `(${applySectionBackgroundsEarly.toString()})(${args});`;
}
