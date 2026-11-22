// The Rustic Lace style's artwork, our own: white lace flowers spilling in
// from two corners of the card (a 100 x 140 box), and a matte rustic wood
// paper. The lace is line work in currentColor with soft fills; the
// words keep to the middle, clear of it. Client-safe: no imports.

type P = [number, number];
const f = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (c: P, r: number, deg: number): P => [c[0] + r * Math.cos(rad(deg)), c[1] + r * Math.sin(rad(deg))];
const xy = (p: P) => `${f(p[0])} ${f(p[1])}`;

// A ring of petals round c, from radius r0 to r1: pointed or round, outlined,
// with a faint fill and a line down the middle of each.
function petals(c: P, r0: number, r1: number, count: number, rot: number, round: boolean, fill: number): string {
  let s = '';
  const half = 360 / count / 2;
  for (let i = 0; i < count; i++) {
    const a = rot + (i * 360) / count;
    const b0 = pt(c, r0, a - half * 0.9), b1 = pt(c, r0, a + half * 0.9), tip = pt(c, r1, a);
    const w = round ? 1.15 : 0.7;
    const c0 = pt(c, r0 + (r1 - r0) * 0.75, a - half * w), c1 = pt(c, r0 + (r1 - r0) * 0.75, a + half * w);
    const d = round
      ? `M${xy(b0)}C${xy(c0)} ${xy(pt(c, r1 * 1.02, a - half * 0.5))} ${xy(tip)}C${xy(pt(c, r1 * 1.02, a + half * 0.5))} ${xy(c1)} ${xy(b1)}`
      : `M${xy(b0)}Q${xy(c0)} ${xy(tip)}Q${xy(c1)} ${xy(b1)}`;
    s += `<path d="${d}" fill="currentColor" fill-opacity="${fill}"/>`;
    s += `<path d="M${xy(pt(c, r0 + (r1 - r0) * 0.2, a))}L${xy(pt(c, r0 + (r1 - r0) * 0.72, a))}"/>`;
  }
  return s;
}

// A round lace flower: layers of petals (the outer pointed ring left off
// when pointed is false), a scalloped ring, a dotted heart.
function flower(c: P, r: number, rot = 0, pointed = true): string {
  let s = '';
  if (pointed) s += petals(c, r * 0.62, r, 14, rot, false, 0.08);
  s += petals(c, r * 0.38, r * 0.66, 10, rot + 18, true, 0.22);
  // A scalloped ring between the layers.
  const n = 16;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n, b = rot + ((i + 1) * 360) / n;
    d += `${i ? '' : `M${xy(pt(c, r * 0.36, a))}`}Q${xy(pt(c, r * 0.44, (a + b) / 2))} ${xy(pt(c, r * 0.36, b))}`;
  }
  s += `<path d="${d}Z"/>`;
  s += petals(c, r * 0.12, r * 0.33, 8, rot, true, 0.35);
  s += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * 0.1)}" fill="currentColor" fill-opacity="0.6"/>`;
  for (let i = 0; i < 10; i++) {
    const p = pt(c, r * 0.17, rot + i * 36);
    s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="0.22" fill="currentColor" stroke="none"/>`;
  }
  return s;
}

// The lace in the top-right corner; the bottom-left is the same turned
// round. Two smaller sprigs dress the other two corners.
function corner(): string {
  let s = '';
  s += flower([93, 7], 15, 8, false);
  s += flower([73, 12], 7, 20);
  s += flower([88, 27], 6.4, -10);
  s += flower([66, 4], 4, 0);
  s += flower([97, 40], 4.2, 15);
  return s;
}
function sprig(): string {
  return flower([4, 4], 7, 0);
}

const C = corner(), S = sprig();
export const LACE_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="0.28" stroke-linecap="round" stroke-linejoin="round">`
  + `<g>${C}</g><g transform="rotate(180 50 70)">${C}</g>`
  + `<g>${S}</g><g transform="rotate(180 50 70)">${S}</g></svg>`;

// Rustic wood, matte and weathered: one continuous board, its grain
// running down it in long wavering lines (stretched noise cut into bands,
// the way growth rings show on sawn wood), fine fibres, darker weathered
// patches and a couple of knots, toned down so nothing shines. tint: the
// wood's colour.
const KNOTS: [number, number, number][] = [[48, 330, 8], [455, 560, 6], [240, 655, 7]];
const woodCache = new Map<string, string>();
export function woodPaper(tint: string): string {
  const hit = woodCache.get(tint);
  if (hit) return hit;
  const defs = `<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.0022" numOctaves="4" seed="3"/>`
      + `<feComponentTransfer><feFuncR type="table" tableValues="0 1 0.15 1 0.05 0.9 0.2 1 0 0.85 0.1 1 0.3 0.9"/></feComponentTransfer>`
      + `<feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.03  -0.75 0 0 0 0.75"/></filter>`
    + `<filter id="fib" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7 0.018" numOctaves="2" seed="9"/>`
      + `<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.05"/></filter>`
    + `<filter id="wx" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.004" numOctaves="3" seed="17"/>`
      + `<feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.03  1.6 0 0 0 -0.7"/></filter>`
    + `<filter id="dust" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="21"/>`
      + `<feColorMatrix values="0 0 0 0 0.75  0 0 0 0 0.7  0 0 0 0 0.62  0 0 0 4 -2.6"/></filter>`
    + `<radialGradient id="knot"><stop offset="0" stop-color="#140C07" stop-opacity="0.75"/><stop offset="0.45" stop-color="#2A1A10" stop-opacity="0.45"/><stop offset="1" stop-color="#2A1A10" stop-opacity="0"/></radialGradient>`;
  let body = `<rect width="500" height="700" fill="${tint}"/>`
    + `<rect width="500" height="700" filter="url(#wx)" opacity="0.6"/>`
    + `<rect width="500" height="700" filter="url(#g)"/>`
    + `<rect width="500" height="700" filter="url(#fib)" opacity="0.4"/>`
    + `<rect width="500" height="700" filter="url(#dust)" opacity="0.18"/>`;
  for (const [cx, cy, r] of KNOTS) {
    body += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 1.6}" ry="${r * 3.4}" fill="url(#knot)"/>`;
    for (let k = 1; k <= 3; k++) body += `<ellipse cx="${cx}" cy="${cy}" rx="${r * (0.9 + k * 0.55)}" ry="${r * (2 + k * 1.6)}" fill="none" stroke="#1A100A" stroke-width="0.8" opacity="${0.3 - k * 0.07}"/>`;
  }
  // A flat grey veil: weathered, matte.
  body += `<rect width="500" height="700" fill="#6B625A" opacity="0.12"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="700"><defs>${defs}</defs>${body}</svg>`;
  const out = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  woodCache.set(tint, out);
  return out;
}
