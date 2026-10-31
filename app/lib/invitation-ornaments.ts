// Decorations for the invitation (Invitations → Decorations): a divider under
// the event name and a frame around the card's edge, each in a colour the
// host picks. Drawn here as SVG line art in `currentColor`, so one drawing
// serves the dashboard preview, the printed card and (as a PNG from
// /api/invitation-ornament) the email. Client-safe: no server imports.
//
// Every design is our own, built from the motifs below (tapered strokes,
// spirals, leaves, flowers, holly, snowflakes, bats…).

export type OrnamentKind = 'divider' | 'frame';
export type OrnamentOccasion = 'wedding' | 'christmas' | 'birthday' | 'halloween';
export type Ornament = { id: string; name: string; occasion: OrnamentOccasion; body: string };

export const ORNAMENT_OCCASIONS: { key: OrnamentOccasion; label: string }[] = [
  { key: 'wedding', label: 'Weddings' },
  { key: 'christmas', label: 'Christmas' },
  { key: 'birthday', label: 'Birthdays' },
  { key: 'halloween', label: 'Halloween' },
];

// Dividers are 240×40; frames are the card itself, 500×700 (5×7).
export const ORNAMENT_VIEWBOX: Record<OrnamentKind, { w: number; h: number }> = {
  divider: { w: 240, h: 40 },
  frame: { w: 500, h: 700 },
};

// ─── Drawing helpers ────────────────────────────────────

type Pt = [number, number];
const r2 = (v: number) => Math.round(v * 100) / 100;
const P = (p: Pt) => `${r2(p[0])} ${r2(p[1])}`;
const F = 'fill="currentColor" stroke="none"';
const SOFT = 'fill="currentColor" fill-opacity=".2"';
const g = (t: string, body: string, attrs = '') => `<g transform="${t}"${attrs ? ` ${attrs}` : ''}>${body}</g>`;
const at = (x: number, y: number, deg = 0, s = 1) => `translate(${r2(x)} ${r2(y)})${deg ? ` rotate(${r2(deg)})` : ''}${s !== 1 ? ` scale(${r2(s)})` : ''}`;
const seg = (d: string, attrs = '') => `<path d="${d}"${attrs ? ` ${attrs}` : ''}/>`;
const dot = (x: number, y: number, r: number) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" ${F}/>`;
const rad = (deg: number) => (deg * Math.PI) / 180;

// A smooth curve through the points (Catmull-Rom as cubic Béziers).
function curve(pts: Pt[], move = true): string {
  let d = move ? `M${P(pts[0])}` : '';
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}
const line = (pts: Pt[], attrs = '') => seg(curve(pts), attrs);
const sample = (f: (t: number) => Pt, n = 32): Pt[] => Array.from({ length: n + 1 }, (_, i) => f(i / n));

// A calligraphic stroke: the curve drawn as a filled shape whose width
// follows `profile` (0–1 along its length).
function ribbon(pts: Pt[], width: number, profile: (t: number) => number = (t) => Math.sin(Math.PI * t)): string {
  const left: Pt[] = [], right: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(i - 1, 0)], b = pts[Math.min(i + 1, pts.length - 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const h = Math.max((width * profile(i / (pts.length - 1))) / 2, 0.12);
    left.push([p[0] - (dy / len) * h, p[1] + (dx / len) * h]);
    right.push([p[0] + (dy / len) * h, p[1] - (dx / len) * h]);
  });
  right.reverse();
  return seg(`${curve(left)}L${P(right[0])}${curve(right, false)}Z`, F);
}
// Thick at the start, fine at the end (most flourishes).
const fade = (t: number) => Math.min(1, t * 5) * (1 - 0.8 * t);
// Fine at both ends.
const swell = (t: number) => Math.sin(Math.PI * t) ** 0.7;

// Points on a spiral around (cx, cy), angles in degrees (clockwise on screen).
const spiral = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, n = 36): Pt[] =>
  sample((t) => [cx + (r0 + (r1 - r0) * t) * Math.cos(rad(a0 + (a1 - a0) * t)), cy + (r0 + (r1 - r0) * t) * Math.sin(rad(a0 + (a1 - a0) * t))], n);

const wave = (x0: number, x1: number, y: number, amp: number, period: number, phase = 0): Pt[] =>
  sample((t) => { const x = x0 + (x1 - x0) * t; return [x, y + amp * Math.sin((2 * Math.PI * (x - x0)) / period + phase)]; }, Math.max(8, Math.round((x1 - x0) / 3)));

// Mirrors across the divider's centre line, or a frame's corner diagonal.
const mirrorX = (body: string, w = 240) => body + g(`translate(${w} 0) scale(-1 1)`, body);
const mirrorY = (body: string, h = 40) => body + g(`translate(0 ${h}) scale(1 -1)`, body);
const diagonal = (body: string) => body + g('matrix(0 1 1 0 0 0)', body);
// A top-left corner repeated in all four corners, or only the opposite one.
const fourCorners = (tl: string) => tl + g('translate(500 0) scale(-1 1)', tl) + g('translate(0 700) scale(1 -1)', tl) + g('translate(500 700) scale(-1 -1)', tl);
const oppositeCorner = (tl: string, s = 1) => tl + g(`translate(500 700) rotate(180)${s !== 1 ? ` scale(${s})` : ''}`, tl);
const rect = (inset: number, rx = 0, attrs = '') => `<rect x="${inset}" y="${inset}" width="${500 - inset * 2}" height="${700 - inset * 2}"${rx ? ` rx="${rx}"` : ''}${attrs ? ` ${attrs}` : ''}/>`;

// Seeded random, so scattered designs (confetti, snow) are the same every time.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Motifs ─────────────────────────────────────────────

// A pointed leaf from (x, y), `len` long, pointing at `deg`.
const leaf = (x: number, y: number, deg: number, len: number, attrs = F, w = 0.34) =>
  g(at(x, y, deg), seg(`M0 0C${r2(len * 0.28)} ${r2(-len * w)} ${r2(len * 0.7)} ${r2(-len * w * 0.9)} ${r2(len)} 0C${r2(len * 0.7)} ${r2(len * w * 0.9)} ${r2(len * 0.28)} ${r2(len * w)} 0 0Z`, attrs));
// Outlined with a vein — for larger leaves.
const veinLeaf = (x: number, y: number, deg: number, len: number) =>
  leaf(x, y, deg, len, SOFT) + g(at(x, y, deg), seg(`M0 0Q${r2(len * 0.5)} ${r2(-len * 0.04)} ${r2(len * 0.86)} 0`));

function flower(x: number, y: number, r: number, petals = 5, rot = 0): string {
  let s = '';
  for (let i = 0; i < petals; i++) {
    s += g(`rotate(${r2(rot + (i * 360) / petals)})`, seg(`M0 0C${r2(r * 0.3)} ${r2(-r * 0.55)} ${r2(r)} ${r2(-r * 0.5)} ${r2(r)} 0C${r2(r)} ${r2(r * 0.5)} ${r2(r * 0.3)} ${r2(r * 0.55)} 0 0Z`, SOFT));
  }
  return g(at(x, y), s + dot(0, 0, r * 0.22));
}
// A closed bud on a short stalk.
const bud = (x: number, y: number, deg: number, len: number) =>
  g(at(x, y, deg), seg(`M0 0L${r2(len * 0.35)} 0`) + seg(`M${r2(len * 0.35)} 0C${r2(len * 0.5)} ${r2(-len * 0.28)} ${r2(len * 0.9)} ${r2(-len * 0.22)} ${r2(len)} 0C${r2(len * 0.9)} ${r2(len * 0.22)} ${r2(len * 0.5)} ${r2(len * 0.28)} ${r2(len * 0.35)} 0Z`, SOFT));

function heartD(x: number, y: number, s: number): string {
  const k = (a: number, b: number) => `${r2(x + a * s)} ${r2(y + b * s)}`;
  return `M${k(0, -0.35)}C${k(-0.25, -1)} ${k(-1, -0.9)} ${k(-1, -0.25)}C${k(-1, 0.35)} ${k(-0.35, 0.6)} ${k(0, 1)}C${k(0.35, 0.6)} ${k(1, 0.35)} ${k(1, -0.25)}C${k(1, -0.9)} ${k(0.25, -1)} ${k(0, -0.35)}Z`;
}

function star(x: number, y: number, r: number, inner = 0.45, points = 5, rot = -90, attrs = F): string {
  const pts: Pt[] = [];
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? r * inner : r, a = rad(rot + (i * 180) / points);
    pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]);
  }
  return seg(`M${pts.map(P).join('L')}Z`, attrs);
}

function snowflake(x: number, y: number, r: number): string {
  const arm = seg(`M0 0V${r2(-r)}M0 ${r2(-r * 0.5)}l${r2(-r * 0.24)} ${r2(-r * 0.24)}M0 ${r2(-r * 0.5)}l${r2(r * 0.24)} ${r2(-r * 0.24)}M0 ${r2(-r * 0.78)}l${r2(-r * 0.14)} ${r2(-r * 0.14)}M0 ${r2(-r * 0.78)}l${r2(r * 0.14)} ${r2(-r * 0.14)}`);
  return g(at(x, y), [0, 60, 120, 180, 240, 300].map((a) => g(`rotate(${a})`, arm)).join('') + dot(0, 0, Math.max(r * 0.1, 0.8)));
}

// A holly leaf with three spikes a side, pointing at `deg`.
function holly(x: number, y: number, deg: number, len: number): string {
  const w = len * 0.27, stops = [0, 0.22, 0.44, 0.66, 0.86, 1];
  const width = (t: number) => w * Math.sin(Math.PI * t) ** 0.7;
  let d = 'M0 0';
  for (let i = 1; i < stops.length; i++) {
    const mid = (stops[i - 1] + stops[i]) / 2, end = i === stops.length - 1;
    d += `Q${P([mid * len, -width(mid) * 0.5])} ${P([stops[i] * len, end ? 0 : -width(stops[i]) * 1.2])}`;
  }
  for (let i = stops.length - 1; i > 0; i--) {
    const mid = (stops[i - 1] + stops[i]) / 2, end = i - 1 === 0;
    d += `Q${P([mid * len, width(mid) * 0.5])} ${P([stops[i - 1] * len, end ? 0 : width(stops[i - 1]) * 1.2])}`;
  }
  return g(at(x, y, deg), seg(`${d}Z`, SOFT) + seg(`M0 0Q${r2(len * 0.5)} ${r2(-len * 0.03)} ${r2(len * 0.9)} 0`));
}
const berries = (x: number, y: number, r: number) => dot(x - r * 0.9, y + r * 0.4, r) + dot(x + r * 0.9, y + r * 0.4, r) + dot(x, y - r * 0.75, r);

// A bat in flight, `s` from wing tip to wing tip / 2.
function bat(x: number, y: number, s: number, deg = 0): string {
  const wing = 'M0 -.1C.2 -.32 .55 -.42 1 -.34C.9 -.22 .86 -.12 .88 0C.76 -.08 .64 -.06 .58 .04C.48 -.04 .34 -.02 .28 .1C.2 .04 .1 .06 0 .22Z';
  const ear = 'M-.1 -.19L-.1 -.36L-.02 -.25Z';
  const half = seg(wing, F) + seg(ear, F);
  return g(at(x, y, deg, s), half + g('scale(-1 1)', half) + `<ellipse cx="0" cy=".04" rx=".13" ry=".2" ${F}/><circle cx="0" cy="-.16" r=".11" ${F}/>`);
}

function pumpkin(x: number, y: number, s: number): string {
  const lobe = (cx: number, rx: number, ry: number) => `<ellipse cx="${r2(cx)}" cy="${r2(y)}" rx="${r2(rx)}" ry="${r2(ry)}" ${SOFT}/>`;
  const k = (a: number, b: number) => `${r2(x + a * s)} ${r2(y + b * s)}`;
  return lobe(x - s * 0.32, s * 0.4, s * 0.44) + lobe(x + s * 0.32, s * 0.4, s * 0.44) + lobe(x, s * 0.3, s * 0.48)
    + seg(`M${k(-0.06, -0.44)}C${k(-0.05, -0.6)} ${k(0.02, -0.68)} ${k(0.15, -0.7)}L${k(0.13, -0.61)}C${k(0.07, -0.6)} ${k(0.06, -0.53)} ${k(0.07, -0.45)}Z`, F)
    + line(spiral(x - s * 0.2, y - s * 0.6, s * 0.12, s * 0.03, 0, -300, 16));
}

function spider(x: number, y: number, s: number): string {
  let legs = '';
  for (let i = 0; i < 4; i++) {
    for (const side of [-1, 1]) {
      const ky = y - s * 0.55 + i * s * 0.34, fy = y - s * 0.35 + i * s * 0.42;
      legs += seg(`M${P([x, y - s * 0.05])}L${P([x + side * s * 0.62, ky])}L${P([x + side * s * (0.95 - i * 0.04), fy + s * 0.25])}`);
    }
  }
  return legs + `<ellipse cx="${r2(x)}" cy="${r2(y + s * 0.12)}" rx="${r2(s * 0.27)}" ry="${r2(s * 0.34)}" ${F}/>` + dot(x, y - s * 0.32, s * 0.18);
}

// A cobweb in the corner at the origin, `size` along each edge.
function web(size: number): string {
  const rays = [0, 22.5, 45, 67.5, 90];
  let s = rays.map((a) => seg(`M0 0L${P([size * Math.cos(rad(a)), size * Math.sin(rad(a))])}`)).join('');
  for (const ring of [0.28, 0.5, 0.72, 0.92]) {
    const pts = rays.map((a): Pt => [size * ring * Math.cos(rad(a)), size * ring * Math.sin(rad(a))]);
    let d = `M${P(pts[0])}`;
    for (let i = 1; i < pts.length; i++) {
      const c: Pt = [((pts[i - 1][0] + pts[i][0]) / 2) * 0.8, ((pts[i - 1][1] + pts[i][1]) / 2) * 0.8];
      d += `Q${P(c)} ${P(pts[i])}`;
    }
    s += seg(d);
  }
  return s;
}

// A balloon whose knot is at (x, y + s·0.5), with its string to `end`.
function balloon(x: number, y: number, s: number, end?: Pt): string {
  const ky = y + s * 0.48;
  const string = end ? line([[x, ky + s * 0.06], [x + (end[0] - x) * 0.3 + s * 0.12, ky + (end[1] - ky) * 0.35], [x + (end[0] - x) * 0.65 - s * 0.12, ky + (end[1] - ky) * 0.7], end], 'stroke-width=".9"') : '';
  return string + `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(s * 0.38)}" ry="${r2(s * 0.47)}" ${SOFT}/>`
    + seg(`M${P([x - s * 0.06, ky + s * 0.07])}L${P([x, ky - s * 0.01])}L${P([x + s * 0.06, ky + s * 0.07])}Z`, F)
    + seg(`M${P([x - s * 0.22, y - s * 0.12])}Q${P([x - s * 0.2, y - s * 0.32])} ${P([x - s * 0.04, y - s * 0.36])}`, 'stroke-width=".9"');
}

// Pine needles along a curve: short strokes angled back from each point.
function needles(pts: Pt[], len: number, every = 1): string {
  let d = '';
  for (let i = 1; i < pts.length - 1; i += every) {
    const [a, b] = [pts[i - 1], pts[i + 1]];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    for (const side of [-1, 1]) {
      const na = ang + Math.PI + side * rad(38);
      d += `M${P(pts[i])}l${r2(len * Math.cos(na))} ${r2(len * Math.sin(na))}`;
    }
  }
  return seg(d, 'stroke-width=".9"');
}

// Confetti: dots, slips, triangles and squiggles scattered over the boxes.
function confetti(boxes: [number, number, number, number][], count: number, seed: number, scale = 1): string {
  const rnd = seeded(seed);
  let s = '';
  for (let i = 0; i < count; i++) {
    // Spread along each box's long side, so the pieces never bunch up.
    const [x0, y0, x1, y1] = boxes[i % boxes.length], slot = (Math.floor(i / boxes.length) + rnd()) / Math.ceil(count / boxes.length);
    const wide = x1 - x0 >= y1 - y0;
    const x = x0 + (wide ? slot : rnd()) * (x1 - x0), y = y0 + (wide ? rnd() : slot) * (y1 - y0), a = rnd() * 180, k = (0.8 + rnd() * 0.6) * scale;
    const kind = Math.floor(rnd() * 4);
    if (kind === 0) s += dot(x, y, 1.7 * k);
    else if (kind === 1) s += g(at(x, y, a), `<rect x="${r2(-3 * k)}" y="${r2(-1 * k)}" width="${r2(6 * k)}" height="${r2(2 * k)}" rx="${r2(0.5 * k)}" ${F}/>`);
    else if (kind === 2) s += g(at(x, y, a), seg(`M0 ${r2(-3 * k)}L${r2(2.6 * k)} ${r2(1.6 * k)}L${r2(-2.6 * k)} ${r2(1.6 * k)}Z`, SOFT));
    else s += g(at(x, y, a), seg(`M${r2(-5 * k)} 0q${r2(1.25 * k)} ${r2(-2.4 * k)} ${r2(2.5 * k)} 0t${r2(2.5 * k)} 0t${r2(2.5 * k)} 0t${r2(2.5 * k)} 0`, 'stroke-width="1.1"'));
  }
  return s;
}

// A curve that sags (or arches, with a negative sag) between two points.
const swag = (x0: number, x1: number, y: number, sag: number) => sample((t) => [x0 + (x1 - x0) * t, y + sag * Math.sin(Math.PI * t)], 46);

// A laurel or olive branch along `pts`: pairs of leaves, smaller towards the tip.
function branch(pts: Pt[], len: number, every = 3, attrs = F): string {
  let out = line(pts, 'stroke-width="1"');
  for (let i = 1; i < pts.length - 1; i += every) {
    const [a, b] = [pts[i - 1], pts[i + 1]];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    const k = 1 - (0.5 * i) / pts.length;
    out += leaf(pts[i][0], pts[i][1], ang - 38, len * k, attrs) + leaf(pts[i][0], pts[i][1], ang + 38, len * k, attrs);
  }
  return out;
}

// Eucalyptus: round leaves alternating along a stem.
function eucalyptus(pts: Pt[], r: number, every = 4): string {
  let out = line(pts, 'stroke-width="1"');
  for (let i = 2, n = 0; i < pts.length - 1; i += every, n++) {
    const [a, b] = [pts[i - 1], pts[i + 1]];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (n % 2 ? 1 : -1) * rad(70);
    const rr = r * (1 - (0.45 * i) / pts.length);
    const cx = pts[i][0] + Math.cos(ang) * rr * 1.1, cy = pts[i][1] + Math.sin(ang) * rr * 1.1;
    out += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(rr)}" ${SOFT}/>` + seg(`M${P(pts[i])}L${r2(cx)} ${r2(cy)}`, 'stroke-width=".7"');
  }
  return out;
}

// A fern frond from (x, y) pointing at `deg`, `len` long.
function fern(x: number, y: number, deg: number, len: number): string {
  let s = seg(`M0 0Q${r2(len * 0.5)} ${r2(-len * 0.06)} ${r2(len)} 0`, 'stroke-width="1"');
  const n = 9;
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1), px = len * t, py = -len * 0.06 * 4 * t * (1 - t);
    const l = len * 0.24 * (1 - t * 0.75);
    s += leaf(px, py, -55, l, SOFT, 0.3) + leaf(px, py, 55, l, SOFT, 0.3);
  }
  return g(at(x, y, deg), s);
}

// A rose seen from above: a spiral heart in a ring of petals.
function rose(x: number, y: number, r: number): string {
  let petals = '';
  for (let i = 0; i < 5; i++) petals += g(`rotate(${i * 72 + 18})`, seg(`M${r2(-r * 0.62)} ${r2(-r * 0.5)}Q0 ${r2(-r * 1.18)} ${r2(r * 0.62)} ${r2(-r * 0.5)}`, 'stroke-width="1"'));
  return g(at(x, y), `<circle cx="0" cy="0" r="${r2(r * 0.95)}" ${SOFT} stroke="none"/>` + petals + line(spiral(0, 0, r * 0.55, r * 0.06, 0, 620, 40), 'stroke-width="1"'));
}

// Two rings, linked.
const rings = (x: number, y: number, r: number) =>
  `<circle cx="${r2(x - r * 0.42)}" cy="${r2(y)}" r="${r2(r)}" stroke-width="1.5"/><circle cx="${r2(x + r * 0.42)}" cy="${r2(y)}" r="${r2(r)}" stroke-width="1.5"/>` + star(x - r * 0.42, y - r - 2.5, 2.4, 0.4, 4, -90);

// A row of pearls from big to small (or the other way).
const pearls = (pts: Pt[], r0: number, r1: number) => pts.map((p, i) => `<circle cx="${r2(p[0])}" cy="${r2(p[1])}" r="${r2(r0 + ((r1 - r0) * i) / Math.max(pts.length - 1, 1))}" ${SOFT} stroke-width=".8"/>`).join('');

// An art deco fan: rays in a half circle, opening upwards.
function decoFan(x: number, y: number, r: number, rays = 7): string {
  let s = seg(`M${r2(x - r)} ${y}A${r} ${r} 0 0 1 ${r2(x + r)} ${y}Z`, SOFT);
  for (let i = 0; i <= rays; i++) {
    const a = rad(180 + (180 * i) / rays);
    s += seg(`M${x} ${y}L${r2(x + r * Math.cos(a))} ${r2(y + r * Math.sin(a))}`, 'stroke-width=".9"');
  }
  return s + seg(`M${r2(x - r * 0.55)} ${y}A${r2(r * 0.55)} ${r2(r * 0.55)} 0 0 1 ${r2(x + r * 0.55)} ${y}`, 'stroke-width=".9"');
}

// A diamond (rhombus) outline, w wide and h tall.
const diamond = (x: number, y: number, w: number, h: number, attrs = '') => seg(`M${x} ${r2(y - h / 2)}L${r2(x + w / 2)} ${y}L${x} ${r2(y + h / 2)}L${r2(x - w / 2)} ${y}Z`, attrs);

// A ribbon bow, knot at (x, y).
function bow(x: number, y: number, s: number): string {
  const k = (a: number, b: number) => `${r2(x + a * s)} ${r2(y + b * s)}`;
  return seg(`M${k(0, 0)}C${k(-0.5, -0.65)} ${k(-1.15, -0.5)} ${k(-1, 0)}C${k(-1.15, 0.5)} ${k(-0.5, 0.65)} ${k(0, 0)}Z`, SOFT)
    + seg(`M${k(0, 0)}C${k(0.5, -0.65)} ${k(1.15, -0.5)} ${k(1, 0)}C${k(1.15, 0.5)} ${k(0.5, 0.65)} ${k(0, 0)}Z`, SOFT)
    + seg(`M${k(-0.08, 0.1)}Q${k(-0.3, 0.6)} ${k(-0.55, 1.05)}M${k(0.08, 0.1)}Q${k(0.3, 0.6)} ${k(0.55, 1.05)}`, 'stroke-width="1.1"')
    + `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(s * 0.16)}" ry="${r2(s * 0.2)}" ${F}/>`;
}

// A two-loop filigree: an S of spirals.
const filigree = (x: number, y: number, s: number, flip = 1) =>
  line([...spiral(x - s * 0.55 * flip, y, s * 0.42, s * 0.08, flip > 0 ? 90 : 270, flip > 0 ? 420 : 600, 30)].reverse().concat(spiral(x + s * 0.55 * flip, y, s * 0.08, s * 0.42, flip > 0 ? 240 : 60, flip > 0 ? 570 : 390, 30)), 'stroke-width="1.1"');

// Mistletoe: two leaves and three berries.
const mistletoe = (x: number, y: number, deg: number, s: number) =>
  g(at(x, y, deg), veinLeaf(0, 0, -30, s) + veinLeaf(0, 0, 30, s) + seg(`M0 0L${r2(-s * 0.35)} 0`) + berries(-s * 0.05, -s * 0.05, s * 0.12));

// A bell, its mouth at (x, y + s/2).
function bell(x: number, y: number, s: number): string {
  const k = (a: number, b: number) => `${r2(x + a * s)} ${r2(y + b * s)}`;
  return seg(`M${k(-0.5, 0.42)}C${k(-0.38, 0.3)} ${k(-0.4, -0.08)} ${k(-0.32, -0.25)}C${k(-0.25, -0.45)} ${k(0.25, -0.45)} ${k(0.32, -0.25)}C${k(0.4, -0.08)} ${k(0.38, 0.3)} ${k(0.5, 0.42)}Z`, SOFT)
    + dot(x, y + s * 0.5, s * 0.08) + `<circle cx="${r2(x)}" cy="${r2(y - s * 0.48)}" r="${r2(s * 0.07)}" stroke-width=".9"/>`;
}

// A striped candy cane, hook at the top, `s` tall, hook opening to the right (dir 1) or left.
function candyCane(x: number, y: number, s: number, dir = 1, deg = 0): string {
  const r = s * 0.16, d = `M${x} ${r2(y + s)}V${r2(y + r)}A${r2(r)} ${r2(r)} 0 0 ${dir > 0 ? 1 : 0} ${r2(x + 2 * r * dir)} ${r2(y + r)}V${r2(y + r * 2.2)}`;
  const w = Math.max(s * 0.09, 2.6);
  return g(`rotate(${deg} ${x} ${y + s / 2})`, seg(d, `stroke-width="${r2(w)}" stroke-opacity=".25"`) + seg(d, `stroke-width="${r2(w)}" stroke-dasharray="${r2(w * 0.7)} ${r2(w * 0.9)}" stroke-linecap="butt"`));
}

// A wrapped present, w×h, centred on (x, y).
function gift(x: number, y: number, w: number, h: number): string {
  return `<rect x="${r2(x - w / 2)}" y="${r2(y - h / 2)}" width="${r2(w)}" height="${r2(h)}" rx="1" ${SOFT} stroke-width="1.1"/>`
    + `<rect x="${r2(x - w / 2 - 1.5)}" y="${r2(y - h / 2 - 3)}" width="${r2(w + 3)}" height="4" rx="1" ${SOFT} stroke-width="1.1"/>`
    + seg(`M${x} ${r2(y - h / 2 - 3)}V${r2(y + h / 2)}`, 'stroke-width="1.1"') + bow(x, y - h / 2 - 3, Math.min(w, h) * 0.32);
}

// A crown, its base at y.
function crown(x: number, y: number, w: number, h: number): string {
  const pts: Pt[] = [[-0.5, 0], [-0.5, -0.55], [-0.3, -0.25], [-0.15, -0.8], [0, -0.35], [0.15, -0.8], [0.3, -0.25], [0.5, -0.55], [0.5, 0]];
  return seg(`M${pts.map(([a, b]) => P([x + a * w, y + b * h])).join('L')}Z`, SOFT + ' stroke-width="1.1"')
    + dot(x - w * 0.5, y - h * 0.55 - 2.2, 1.8) + dot(x - w * 0.15, y - h * 0.8 - 2.2, 1.8) + dot(x + w * 0.15, y - h * 0.8 - 2.2, 1.8) + dot(x + w * 0.5, y - h * 0.55 - 2.2, 1.8)
    + seg(`M${r2(x - w / 2)} ${r2(y - h * 0.12)}H${r2(x + w / 2)}`, 'stroke-width=".8"');
}

// A two-tier cake with candles, standing on y.
function cake(x: number, y: number, s: number): string {
  const k = (a: number, b: number) => [x + a * s, y + b * s] as Pt;
  const tier = (w: number, top: number, h: number) => `<rect x="${r2(x - (w * s) / 2)}" y="${r2(y + top * s)}" width="${r2(w * s)}" height="${r2(h * s)}" rx="${r2(s * 0.06)}" ${SOFT} stroke-width="1.1"/>`;
  const drips = line(sample((t) => k(-0.42 + 0.84 * t, -0.5 + 0.05 * Math.sin(Math.PI * 8 * t)), 24), 'stroke-width=".8"');
  let candles = '';
  for (const c of [-0.18, 0, 0.18]) candles += seg(`M${P(k(c, -0.95))}V${r2(y - 0.72 * s)}`, 'stroke-width="1.3"') + seg(`M${P(k(c, -1.12))}q${r2(s * 0.05)} ${r2(s * 0.08)} 0 ${r2(s * 0.12)}q${r2(-s * 0.05)} ${r2(-s * 0.04)} 0 ${r2(-s * 0.12)}Z`, F);
  return tier(1, -0.4, 0.4) + tier(0.66, -0.72, 0.32) + drips + candles + seg(`M${P(k(-0.62, 0))}H${r2(x + 0.62 * s)}`, 'stroke-width="1.2"');
}

// A papel picado flag: a rectangle with a zigzag hem and cut-out shapes.
function papel(x: number, y: number, w: number, h: number, variant = 0): string {
  let hem = `M${r2(x - w / 2)} ${y}H${r2(x + w / 2)}V${r2(y + h * 0.82)}`;
  for (let i = 0; i < 6; i++) hem += `L${r2(x + w / 2 - (w / 6) * (i + 0.5))} ${r2(y + h)}L${r2(x + w / 2 - (w / 6) * (i + 1))} ${r2(y + h * 0.82)}`;
  const cx = x, cy = y + h * 0.42;
  const cut = variant % 3 === 0 ? flower(cx, cy, h * 0.26, 6, 0) : variant % 3 === 1 ? seg(heartD(cx, cy, h * 0.2), F) : star(cx, cy, h * 0.24, 0.45, 5, -90);
  return seg(`${hem}Z`, SOFT + ' stroke-width="1"') + cut + dot(x - w * 0.32, y + h * 0.16, 1.1) + dot(x + w * 0.32, y + h * 0.16, 1.1);
}

// ─── Dividers (240×40, centre 120,20) ───────────────────

const scrollCurl = ribbon([[178, 20], [168, 19.2], [159, 16.5], ...spiral(148, 12.5, 7.5, 1.4, 25, -335, 44)], 3, (t) => (0.5 + 0.5 * Math.min(1, t * 3)) * (1 - 0.82 * t));
const DIVIDER_LIST: Ornament[] = [
  {
    id: 'wedding-scroll', name: 'Scroll', occasion: 'wedding',
    body: mirrorX(mirrorY(scrollCurl) + ribbon(wave(176, 228, 20, 1.4, 104), 2.6, (t) => (1 - t) ** 0.9 + 0.1) + dot(233, 20, 1.5) + leaf(186, 19.5, -32, 9) + leaf(186, 20.5, 32, 9) + line([[127, 20], [134, 20]], 'stroke-width=".9"'))
      + seg('M120 12.5L124.5 20L120 27.5L115.5 20Z', F) + dot(120, 7.5, 1.1) + dot(120, 32.5, 1.1),
  },
  {
    id: 'wedding-vine', name: 'Leafy vine', occasion: 'wedding',
    body: mirrorX(line(wave(130, 224, 20, 4, 36, Math.PI), 'stroke-width="1.2"')
      + [0, 1, 2, 3, 4].map((k) => {
        const x = 130 + 18 * (0.5 + k), up = k % 2 === 0;
        return leaf(x, up ? 16 : 24, up ? -42 : 42, 10 - k * 0.8) + leaf(x, up ? 16 : 24, up ? -140 : 140, 6.5 - k * 0.5);
      }).join('') + dot(228, 20, 1.3))
      + flower(120, 20, 8, 5, -90),
  },
  {
    id: 'wedding-arrow', name: 'Arrow & hearts', occasion: 'wedding',
    body: seg('M36 20H208', 'stroke-width="1.2"') + seg('M226 20L205 13.5L209.5 20L205 26.5Z', F)
      + [0, 1, 2].map((i) => seg(`M${38 + i * 8} 20l-9 -7.5M${38 + i * 8} 20l-9 7.5`, 'stroke-width="1.1"')).join('')
      + seg(heartD(113, 19.5, 7.5), F) + seg(heartD(127, 21, 7.5), 'stroke-width="1.4" fill="none"'),
  },
  {
    id: 'wedding-heart', name: 'Heart flourish', occasion: 'wedding',
    body: mirrorX(ribbon([...sample((t) => [131 + 62 * t, 20 + 6 * Math.sin(Math.PI * 2 * t) * (1 - t * 0.3)], 30), ...spiral(198, 18.5, 4.5, 1.2, 160, 520, 24).slice(1)], 2.2, (t) => Math.min(1, t * 6) * (1 - 0.75 * t))
      + dot(209, 20, 1.6) + dot(216, 20, 1.2) + dot(222, 20, 0.85))
      + seg(heartD(120, 20.5, 8), 'stroke-width="1.4" fill="currentColor" fill-opacity=".2"'),
  },
  {
    id: 'christmas-holly', name: 'Holly', occasion: 'christmas',
    body: mirrorX(seg('M150 20H214', 'stroke-width="1.1"') + dot(220, 20, 1.5) + dot(226, 20, 1)) + holly(116, 21, 196, 30) + holly(124, 21, -16, 30) + berries(120, 19.5, 3),
  },
  {
    id: 'christmas-snowflake', name: 'Snowflake', occasion: 'christmas',
    body: mirrorX(seg('M138 20H186', 'stroke-width="1.1"') + snowflake(197, 20, 6) + dot(209, 20, 1.3) + dot(216, 20, 0.9)) + snowflake(120, 20, 13),
  },
  {
    id: 'christmas-evergreen', name: 'Evergreen', occasion: 'christmas',
    body: mirrorX((() => { const pts = sample((t) => [132 + 92 * t, 20 + 3 * Math.sin(Math.PI * t)], 30); return line(pts, 'stroke-width="1.2"') + needles(pts.slice(0, 28), 6) + dot(176, 26.5, 2.2) + dot(204, 25.5, 1.8); })())
      + star(120, 19.5, 9.5),
  },
  {
    id: 'birthday-stars', name: 'Stars', occasion: 'birthday',
    body: mirrorX(seg('M134 20H188', 'stroke-width="1.1"') + star(199, 20, 5.5) + star(213, 20, 3.2) + dot(223, 20, 1.2)) + star(120, 19.5, 11),
  },
  {
    id: 'birthday-confetti', name: 'Confetti', occasion: 'birthday',
    body: confetti([[22, 8, 98, 32], [142, 8, 218, 32]], 34, 7) + star(120, 20, 7) + dot(106, 14, 1.4) + dot(134, 26, 1.4),
  },
  {
    id: 'birthday-balloons', name: 'Balloons', occasion: 'birthday',
    body: mirrorX(line(sample((t) => [136 + 88 * t, 30 - 3 * Math.sin(Math.PI * 3 * t)], 30), 'stroke-width="1.1"') + dot(228, 30, 1.3))
      + balloon(109, 13, 13, [119, 36]) + balloon(131, 13, 13, [121, 36]) + balloon(120, 9, 14, [120, 36]),
  },
  {
    id: 'halloween-bats', name: 'Bats', occasion: 'halloween',
    body: mirrorX(line(wave(138, 200, 21, 2.4, 31), 'stroke-width="1.1"') + bat(214, 18, 8, -12)) + bat(120, 20, 15),
  },
  {
    id: 'halloween-pumpkin', name: 'Pumpkin vine', occasion: 'halloween',
    body: mirrorX(line([[133, 24], [150, 21], [166, 25], ...spiral(176, 18, 8, 1.5, 120, 450, 30)], 'stroke-width="1.2"')
      + line([[176, 26], [196, 24], [212, 20], [226, 21]], 'stroke-width="1.2"') + veinLeaf(150, 21, -60, 11) + veinLeaf(200, 23.5, 55, 9) + dot(230, 21, 1.2))
      + pumpkin(120, 22, 17),
  },
  {
    id: 'halloween-web', name: 'Spider thread', occasion: 'halloween',
    body: mirrorX([0, 1, 2].map((i) => seg(`M${136 + i * 28} 14Q${150 + i * 28} 23 ${164 + i * 28} 14`, 'stroke-width="1.1"')).join('') + seg('M136 14L132 14', 'stroke-width="1.1"') + dot(222, 14, 1.3))
      + seg('M120 3V12', 'stroke-width=".8"') + spider(120, 21, 9),
  },
  // ── More for every occasion, so no two invitations look alike ──
  {
    id: 'wedding-laurel', name: 'Laurel', occasion: 'wedding',
    body: mirrorX(branch(sample((t) => [127 + 96 * t, 21 - 3 * Math.sin(Math.PI * t)], 24), 13, 3, SOFT + ' stroke-width=".8"')) + dot(120, 21, 2.4),
  },
  {
    id: 'wedding-rings', name: 'Rings', occasion: 'wedding',
    body: mirrorX(seg('M140 20H210', 'stroke-width="1.1"') + dot(216, 20, 1.5) + dot(223, 20, 1)) + rings(120, 21, 8.5),
  },
  {
    id: 'wedding-pearls', name: 'Pearls', occasion: 'wedding',
    body: mirrorX(line(sample((t) => [128 + 96 * t, 20 + 3 * Math.sin(Math.PI * t)], 20), 'stroke-width=".6"') + pearls(sample((t) => [130 + 92 * t, 20 + 3 * Math.sin(Math.PI * t)], 9), 3.6, 1.4)) + `<circle cx="120" cy="20" r="5.2" ${SOFT} stroke-width="1.1"/>`,
  },
  {
    id: 'wedding-deco', name: 'Art deco', occasion: 'wedding',
    body: mirrorX(seg('M142 30H214M152 34.5H200M162 25.5H190', 'stroke-width="1"') + diamond(222, 30, 7, 7, F)) + decoFan(120, 30, 21, 10) + seg('M96 30H144', 'stroke-width="1.3"'),
  },
  {
    id: 'wedding-eucalyptus', name: 'Eucalyptus', occasion: 'wedding',
    body: mirrorX(eucalyptus(sample((t) => [126 + 98 * t, 20 + 3 * Math.sin(Math.PI * 1.6 * t)], 36), 4.2, 4)),
  },
  {
    id: 'wedding-filigree', name: 'Filigree', occasion: 'wedding',
    body: mirrorX(filigree(158, 20, 26) + seg('M184 20H222', 'stroke-width="1"') + dot(227, 20, 1.3)) + diamond(120, 20, 10, 14, F),
  },
  {
    id: 'wedding-rose', name: 'Rose', occasion: 'wedding',
    body: mirrorX(line([[131, 22], [150, 24], [172, 20], [200, 21], [222, 19]], 'stroke-width="1.1"') + veinLeaf(140, 23, 20, 11) + veinLeaf(158, 23, -24, 9) + bud(206, 21, -6, 12)) + rose(120, 20, 10),
  },
  {
    id: 'wedding-fern', name: 'Fern', occasion: 'wedding',
    body: mirrorX(fern(128, 21, -4, 92)) + dot(120, 21, 2),
  },
  {
    id: 'wedding-diamond', name: 'Diamonds', occasion: 'wedding',
    body: mirrorX(seg('M136 20H160M178 20H200', 'stroke-width="1"') + diamond(169, 20, 12, 12, 'stroke-width="1"') + diamond(209, 20, 8, 8, F) + dot(220, 20, 1.2)) + diamond(120, 20, 18, 18, 'stroke-width="1.2"') + diamond(120, 20, 8, 8, F),
  },
  {
    id: 'wedding-bow', name: 'Bow', occasion: 'wedding',
    body: mirrorX(line(wave(140, 222, 20, 2, 41), 'stroke-width="1.1"') + dot(226, 20, 1.3)) + bow(120, 17, 13),
  },
  {
    id: 'christmas-mistletoe', name: 'Mistletoe', occasion: 'christmas',
    body: mirrorX(seg('M140 20H212', 'stroke-width="1.1"') + dot(218, 20, 1.4) + dot(224, 20, 1)) + mistletoe(132, 20, 0, 22) + g('translate(240 0) scale(-1 1)', mistletoe(132, 20, 0, 22)),
  },
  {
    id: 'christmas-baubles', name: 'Baubles', occasion: 'christmas',
    body: mirrorX(line(swag(122, 226, 8, 8), 'stroke-width="1"') + seg('M152 13.5V18M196 13V17', 'stroke-width=".8"') + `<circle cx="152" cy="23" r="5" ${SOFT} stroke-width="1"/><circle cx="196" cy="21" r="4" ${SOFT} stroke-width="1"/>`) + `<circle cx="120" cy="22" r="8" ${SOFT} stroke-width="1.2"/>` + seg('M114 20Q120 24 126 20', 'stroke-width=".8"') + `<rect x="117.5" y="11" width="5" height="3.5" rx="1" ${F}/>`,
  },
  {
    id: 'christmas-stars', name: 'Star garland', occasion: 'christmas',
    body: mirrorX(line(swag(122, 226, 12, 10), 'stroke-width=".9"') + star(146, 19, 3.6) + star(170, 21.5, 4.4) + star(198, 19, 3.4) + dot(222, 13, 1.2)) + star(120, 14, 9),
  },
  {
    id: 'christmas-bells', name: 'Bells', occasion: 'christmas',
    body: mirrorX(seg('M144 20H214', 'stroke-width="1.1"') + dot(220, 20, 1.4)) + g('rotate(-14 112 20)', bell(112, 20, 18)) + g('rotate(14 128 20)', bell(128, 20, 18)) + bow(120, 9, 6.5),
  },
  {
    id: 'christmas-gift', name: 'Gift', occasion: 'christmas',
    body: mirrorX(seg('M138 22H212', 'stroke-width="1.1"') + line(spiral(218, 20, 3.4, 0.6, 180, 540, 18), 'stroke-width=".9"')) + gift(120, 24, 18, 13),
  },
  {
    id: 'christmas-candy', name: 'Candy canes', occasion: 'christmas',
    body: mirrorX(seg('M144 22H212', 'stroke-width="1.1"') + dot(218, 22, 1.5) + dot(225, 22, 1)) + candyCane(113, 6, 30, 1, -18) + g('translate(240 0) scale(-1 1)', candyCane(113, 6, 30, 1, -18)) + bow(120, 22, 7),
  },
  {
    id: 'birthday-streamers', name: 'Streamers', occasion: 'birthday',
    body: line(wave(22, 218, 15, 4, 30), 'stroke-width="1.3"') + line(wave(22, 218, 25, 4, 30, Math.PI), 'stroke-width="1"') + dot(120, 20, 2.4) + dot(18, 20, 1.4) + dot(222, 20, 1.4),
  },
  {
    id: 'birthday-crown', name: 'Crown', occasion: 'birthday',
    body: mirrorX(seg('M142 26H212', 'stroke-width="1.1"') + star(218, 26, 3.6)) + crown(120, 28, 30, 22),
  },
  {
    id: 'birthday-polka', name: 'Polka dots', occasion: 'birthday',
    body: mirrorX([0, 1, 2, 3, 4, 5, 6].map((i) => dot(132 + i * 14, 20 + (i % 2 ? 4 : -4), 2.6 - i * 0.25)).join('') + star(226, 20, 3)) + `<circle cx="120" cy="20" r="6" ${SOFT} stroke-width="1.2"/>`,
  },
  {
    id: 'birthday-cake', name: 'Cake', occasion: 'birthday',
    body: mirrorX(seg('M140 34H212', 'stroke-width="1.1"') + star(218, 30, 3.4) + dot(226, 24, 1.2)) + cake(120, 34, 26),
  },
  {
    id: 'birthday-papel', name: 'Papel picado', occasion: 'birthday',
    body: line(swag(14, 226, 6, 4), 'stroke-width="1"') + [0, 1, 2, 3, 4, 5, 6].map((i) => papel(32 + i * 29, 6 + 4 * Math.sin((Math.PI * (32 + i * 29 - 14)) / 212), 22, 26, i)).join(''),
  },
];

// ─── Frames (500×700, the card) ─────────────────────────

// Wedding: a scroll in each corner inside a double rule.
const classicCorner = diagonal(
  ribbon([[46, 54], [56, 45], [68, 40.5], ...spiral(86, 50, 12, 2.2, -122, 238, 44)], 3.2, fade)
  + ribbon(sample((t) => [100 + 56 * t, 41 - 2.5 * Math.sin(Math.PI * t)], 24), 2.2, swell)
  + leaf(112, 47, 18, 13) + leaf(130, 38.5, -22, 11) + dot(162, 40.5, 1.6),
) + flower(44, 44, 10, 4, 45);

// Wedding: a leafy vine along two edges from a flower in the corner.
const vinePts = sample((t) => [58 + 250 * t, 44 - 5 * Math.sin(Math.PI * 2.4 * t) * (1 - t * 0.6)], 60);
const vineCorner = diagonal(
  ribbon(vinePts, 2.8, (t) => (1 - t) ** 0.8 + 0.15)
  + vinePts.filter((_, i) => i > 3 && i < 58 && i % 5 === 0).map((p, k) => leaf(p[0], p[1], k % 2 ? 38 : -38, 17 - k * 0.8, SOFT) + leaf(p[0], p[1], k % 2 ? 38 : -38, 17 - k * 0.8, 'fill="none" stroke-width=".9"')).join('')
  + bud(vinePts[58][0], vinePts[58][1], -8, 12),
) + line(spiral(62, 62, 22, 14, 200, 500, 30), 'stroke-width="1.3"') + flower(62, 62, 14, 6, 15);

// Wedding: flower clusters in two corners, sprigs in the others.
const floralCluster = flower(58, 58, 18, 6, 12) + flower(106, 44, 11, 5, -6) + flower(44, 106, 11, 5, 24)
  + [[86, 36, -12, 22], [36, 86, 102, 22], [74, 76, 45, 18], [128, 38, -18, 17], [38, 128, 108, 17], [92, 62, 18, 13], [62, 92, 72, 13]]
    .map(([x, y, a, l]) => veinLeaf(x, y, a, l)).join('')
  + line([[116, 43], [140, 37], [168, 34], [196, 33]]) + leaf(150, 35.5, -38, 10, SOFT) + leaf(176, 33.5, 32, 9, SOFT) + bud(196, 33, -4, 11)
  + line([[43, 116], [37, 140], [34, 168], [33, 196]]) + leaf(35.5, 150, 128, 10, SOFT) + leaf(33.5, 176, 58, 9, SOFT) + bud(33, 196, 94, 11);
const floralSprig = flower(44, 44, 8, 5, 10) + leaf(56, 40, -14, 14, SOFT) + leaf(40, 56, 104, 14, SOFT) + dot(68, 36, 1.5) + dot(36, 68, 1.5);

// Wedding: a scalloped edge with a fine inner rule.
const scallops = (() => {
  let d = 'M30 30';
  for (let i = 0; i < 22; i++) d += 'a10 10 0 0 1 20 0';
  for (let i = 0; i < 32; i++) d += 'a10 10 0 0 1 0 20';
  for (let i = 0; i < 22; i++) d += 'a10 10 0 0 1 -20 0';
  for (let i = 0; i < 32; i++) d += 'a10 10 0 0 1 0 -20';
  return seg(d, 'stroke-width="1.3"');
})();

// Christmas: an evergreen garland swagged across the top, with baubles.
const bauble = (x: number, y: number, r: number, hang: number) =>
  seg(`M${x} ${y - hang}V${y - r - 2}`, 'stroke-width=".8"') + `<rect x="${r2(x - r * 0.3)}" y="${r2(y - r - 3.5)}" width="${r2(r * 0.6)}" height="3.5" rx="1" ${F}/>`
  + `<circle cx="${x}" cy="${y}" r="${r}" ${SOFT}/>` + seg(`M${r2(x - r * 0.55)} ${r2(y - r * 0.2)}Q${x} ${r2(y + r * 0.25)} ${r2(x + r * 0.55)} ${r2(y - r * 0.2)}`, 'stroke-width=".8"');
const garlandTop = [swag(26, 250, 36, 44), swag(250, 474, 36, 44)].map((pts) => line(pts, 'stroke-width="1.3"') + needles(pts, 8)).join('')
  + bauble(138, 98, 10, 18) + bauble(362, 98, 10, 18) + bauble(250, 58, 8, 18) + star(250, 34, 11);
const garlandBottom = (() => { const pts = swag(80, 420, 668, -26); return line(pts, 'stroke-width="1.3"') + needles(pts, 7) + holly(240, 642, 200, 20) + holly(260, 642, -20, 20) + berries(250, 641, 2.8); })();

// Christmas: snowflakes at the corners, a few falling along the edges.
const flurry = (() => {
  const rnd = seeded(11);
  let s = '';
  const spots: [number, number][] = [[110, 52], [160, 40], [210, 56], [290, 44], [340, 58], [390, 42], [54, 140], [44, 200], [446, 150], [456, 210], [110, 650], [180, 660], [320, 656], [392, 648], [52, 560], [448, 540]];
  spots.forEach(([x, y]) => { s += rnd() > 0.45 ? snowflake(x, y, 4 + rnd() * 3) : dot(x, y, 1.4 + rnd()); });
  return s;
})();

// Birthday: bunting swagged across the top.
function bunting(x0: number, x1: number, y: number, sag: number, flags: number): string {
  const pts = swag(x0, x1, y, sag);
  let s = line(pts, 'stroke-width="1.1"');
  for (let i = 1; i < flags + 1; i++) {
    const t = i / (flags + 1), x = x0 + (x1 - x0) * t, yy = y + sag * Math.sin(Math.PI * t);
    const ang = (Math.atan(((sag * Math.PI) / (x1 - x0)) * Math.cos(Math.PI * t)) * 180) / Math.PI;
    s += g(at(x, yy, ang), seg('M-9 0L9 0L0 22Z', i % 2 ? SOFT : F));
  }
  return s;
}

// Birthday: a balloon bunch tied with a bow in the top corners.
const balloonBunch = balloon(56, 64, 34, [86, 150]) + balloon(98, 52, 32, [88, 150]) + balloon(78, 96, 30, [87, 150])
  + seg('M87 150c-8 -6 -14 -2 -10 4c3 3 8 0 10 -4zM87 150c8 -6 14 -2 10 4c-3 3 -8 0 -10 -4z', SOFT) + line([[87, 151], [84, 164], [89, 176]], 'stroke-width=".9"') + line([[87, 151], [92, 166], [88, 178]], 'stroke-width=".9"');

// Halloween: pumpkins and a curling vine along the bottom.
const pumpkinPatch = (() => {
  const vine = sample((t) => [96 + 308 * t, 662 - 6 * Math.sin(Math.PI * 3 * t)], 60);
  return line(vine, 'stroke-width="1.3"')
    + [0.12, 0.36, 0.62, 0.86].map((t, i) => { const p = vine[Math.round(t * 60)]; return veinLeaf(p[0], p[1], i % 2 ? 210 : -30, 18) + line(spiral(p[0] + (i % 2 ? -8 : 8), p[1] - 12, 7, 1.5, 90, 420, 24), 'stroke-width="1"'); }).join('')
    + pumpkin(64, 640, 46) + pumpkin(106, 656, 30) + pumpkin(436, 640, 46) + pumpkin(394, 656, 30);
})();
const vineCurl = line([[30, 120], [36, 80], [52, 52], ...spiral(70, 64, 18, 3, -150, 260, 40)], 'stroke-width="1.3"') + veinLeaf(40, 92, -60, 18) + veinLeaf(60, 46, 30, 16);

const batFlight = bat(84, 80, 40, -14) + bat(160, 54, 22, 8) + bat(56, 150, 18, -24) + bat(214, 92, 14, 14)
  + bat(414, 84, 36, 12) + bat(340, 56, 18, -6) + bat(446, 156, 16, 20)
  + bat(96, 628, 20, -10) + bat(404, 636, 24, 10) + bat(250, 660, 14, 0);

// ── For the frames added for variety ──

// Dots along a rectangle's edges, `gap` apart.
function rectDots(inset: number, gap: number, r: number, attrs = F): string {
  let out = '';
  const w = 500 - inset * 2, h = 700 - inset * 2;
  const nx = Math.round(w / gap), ny = Math.round(h / gap);
  for (let i = 0; i <= nx; i++) for (const y of [inset, 700 - inset]) out += `<circle cx="${r2(inset + (w * i) / nx)}" cy="${y}" r="${r}" ${attrs}/>`;
  for (let i = 1; i < ny; i++) for (const x of [inset, 500 - inset]) out += `<circle cx="${x}" cy="${r2(inset + (h * i) / ny)}" r="${r}" ${attrs}/>`;
  return out;
}
// A four-point sparkle.
const sparkle = (x: number, y: number, r: number) => star(x, y, r, 0.22, 4, -90);

// Wedding: laurel halves meeting at the top and bottom centres.
const laurelHalf = branch(sample((t) => [244 - 196 * t, 46 + 26 * t * t], 30), 20, 3, SOFT + ' stroke-width=".9"');
const laurelFrame = rect(24, 0, 'stroke-width=".9"') + mirrorX(laurelHalf, 500) + mirrorY(mirrorX(laurelHalf, 500), 700) + dot(250, 44, 3.2) + dot(250, 656, 3.2);

// Wedding: art deco — fans at top and bottom, stepped corners.
const decoCorner = seg('M36 120V36H120M50 106V50H106M64 92V64H92', 'stroke-width="1.1"') + diamond(36, 36, 12, 12, F) + diamond(78, 78, 8, 8, F);
const decoFrame = rect(36, 0, 'stroke-width=".9"') + fourCorners(decoCorner) + g('translate(500 92) rotate(180)', decoFan(250, 56, 42, 12)) + decoFan(250, 644, 42, 12)
  + seg('M150 36H350M150 664H350', 'stroke-width="1.6"');

// Wedding: a string of pearls around the card, larger at the corners.
const pearlFrame = rect(44, 0, 'stroke-width=".7"') + rectDots(30, 14, 2.4, `${SOFT} stroke-width=".8"`) + fourCorners(`<circle cx="30" cy="30" r="6.5" ${SOFT} stroke-width="1"/>` + dot(30, 30, 1.6));

// Wedding: eucalyptus stems out of two corners.
const eucalyptusCorner = eucalyptus(sample((t) => [40 + 240 * t, 44 + 8 * Math.sin(Math.PI * 2 * t)], 70), 9, 5) + eucalyptus(sample((t) => [44 + 8 * Math.sin(Math.PI * 2 * t), 40 + 300 * t], 80), 9, 5);
const eucalyptusFrame = rect(24, 4, 'stroke-width=".9"') + oppositeCorner(eucalyptusCorner);

// Wedding: an arched window, doubled, with a flower at the top.
const archFrame = seg('M34 674V230A216 216 0 0 1 466 230V674Z', 'stroke-width="1.4"') + seg('M46 662V232A204 204 0 0 1 454 232V662Z', 'stroke-width=".8"')
  + flower(250, 26, 10, 6, 0) + leaf(236, 30, 200, 16, SOFT) + leaf(264, 30, -20, 16, SOFT) + fourCorners(dot(34, 674, 0) + dot(18, 18, 0)) + dot(34, 680, 2) + dot(466, 680, 2);

// Wedding: filigree loops in the corners and at the middle of each long side.
const filigreeFrame = rect(28, 0, 'stroke-width="1.2"') + rect(34, 0, 'stroke-width=".6"')
  + fourCorners(g('translate(64 64) rotate(45)', filigree(0, 0, 44)) + dot(46, 46, 2.2))
  + g('translate(250 34)', filigree(0, 12, 50)) + g('translate(250 666) scale(1 -1)', filigree(0, 12, 50));

// Wedding: roses with leaves in two corners.
const roseCorner = rose(66, 66, 26) + rose(118, 46, 14) + rose(46, 118, 14)
  + [[96, 82, 20, 26], [82, 96, 70, 26], [146, 40, -10, 20], [40, 146, 100, 20], [100, 112, 45, 16]].map(([x, y, a, l]) => veinLeaf(x, y, a, l)).join('')
  + line([[160, 40], [200, 34], [236, 36]], 'stroke-width="1"') + bud(236, 36, 0, 14) + line([[40, 160], [34, 200], [36, 236]], 'stroke-width="1"') + bud(36, 236, 90, 14);
const roseFrame = rect(22, 0, 'stroke-width="1"') + oppositeCorner(roseCorner);

// Wedding: fern fronds rising up both sides.
const fernFrame = rect(26, 0, 'stroke-width=".9"') + fern(44, 678, -84, 170) + fern(456, 678, -96, 170) + fern(52, 38, 70, 104) + fern(448, 38, 110, 104);

// Wedding: diamonds at the corners and middles, double rule.
const geoFrame = rect(24, 0, 'stroke-width="1.3"') + rect(40, 0, 'stroke-width=".7"')
  + fourCorners(diamond(32, 32, 26, 26, `${SOFT} stroke-width="1"`) + diamond(32, 32, 10, 10, F) + seg('M58 32H110M32 58V110', 'stroke-width="1.1"'))
  + diamond(250, 32, 22, 22, `${SOFT} stroke-width="1"`) + diamond(250, 668, 22, 22, `${SOFT} stroke-width="1"`) + diamond(32, 350, 22, 22, `${SOFT} stroke-width="1"`) + diamond(468, 350, 22, 22, `${SOFT} stroke-width="1"`);

// Wedding: a bow at the top with its ribbon running along the edge.
const ribbonFrame = rect(30, 0, 'stroke-width="1"') + ribbon(sample((t) => [238 - 200 * t, 40 + 8 * Math.sin(Math.PI * 3 * t)], 40), 5, (t) => 1 - t * 0.85)
  + ribbon(sample((t) => [262 + 200 * t, 40 + 8 * Math.sin(Math.PI * 3 * t)], 40), 5, (t) => 1 - t * 0.85) + bow(250, 36, 30) + fourCorners(dot(30, 30, 2.4));

// Christmas: mistletoe hanging from the top on ribbons, berries below.
const mistletoeFrame = rect(22, 0, 'stroke-width="1.4"') + rect(29, 0, 'stroke-width=".7"')
  + seg('M250 22V64M150 22V44M350 22V44', 'stroke-width=".9"') + bow(250, 64, 13) + mistletoe(250, 86, 90, 40) + mistletoe(150, 58, 90, 28) + mistletoe(350, 58, 90, 28)
  + fourCorners(berries(48, 48, 4) + leaf(48, 48, 20, 22, SOFT) + leaf(48, 48, 70, 22, SOFT));

// Christmas: baubles on strings of different lengths.
const baublesFrame = rect(22, 0, 'stroke-width="1.2"') + seg('M22 22H478', 'stroke-width="2"')
  + [[70, 70, 12], [118, 104, 16], [170, 58, 10], [330, 58, 10], [382, 104, 16], [430, 70, 12]].map(([x, y, r]) => bauble(x, y, r, y - 22)).join('')
  + star(250, 48, 14) + seg('M250 22V34', 'stroke-width=".9"') + fourCorners(dot(38, 680, 0)) + snowflake(70, 640, 12) + snowflake(430, 640, 12) + snowflake(250, 662, 8);

// Christmas: strings of stars swagged across the top and bottom.
const starsLine = (y: number, sag: number) => { const pts = swag(22, 478, y, sag); return line(pts, 'stroke-width=".9"') + pts.filter((_, i) => i % 5 === 2).map((p, i) => star(p[0], p[1] + 6, i % 2 ? 5 : 7.5)).join(''); };
const starsFrame = rect(22, 14, 'stroke-width="1.1"') + starsLine(36, 40) + starsLine(664, -30) + fourCorners(sparkle(46, 46, 9));

// Christmas: a pair of bells with a bow at the top, small bells below.
const bellsFrame = rect(20, 0, 'stroke-width="1.5"') + rect(27, 0, 'stroke-width=".7"')
  + g('rotate(-16 232 70)', bell(232, 70, 48)) + g('rotate(16 268 70)', bell(268, 70, 48)) + bow(250, 40, 18)
  + line([[150, 30], [200, 46], [230, 44]], 'stroke-width="1"') + line([[350, 30], [300, 46], [270, 44]], 'stroke-width="1"')
  + bell(70, 646, 26) + bell(430, 646, 26) + holly(250, 658, 200, 18) + holly(250, 658, -20, 18) + berries(250, 656, 2.6);

// Christmas: presents piled in the bottom corners, a bow at the top.
const giftFrame = rect(24, 0, 'stroke-width="1.2"') + bow(250, 40, 26) + seg('M24 40H222M278 40H476', 'stroke-width="1.6"')
  + gift(64, 644, 48, 40) + gift(112, 654, 34, 30) + gift(436, 644, 48, 40) + gift(388, 654, 34, 30);

// Birthday: streamers curling down from the top corners.
const streamer = (x: number, s: number) => line(sample((t) => [x + s * (9 * Math.sin(Math.PI * 5 * t) + 6 * t), 30 + 230 * t], 70), 'stroke-width="1.4"');
const streamersFrame = rect(22, 10, 'stroke-width="1"') + line(wave(22, 478, 34, 6, 46), 'stroke-width="1.3"') + streamer(40, 1) + streamer(460, -1) + streamer(58, 0.6) + streamer(442, -0.6)
  + confetti([[60, 646, 440, 682]], 30, 21, 1.4);

// Birthday: a crown at the top over a dotted border.
const crownFrame = rectDots(26, 12, 1.8) + rect(38, 8, 'stroke-width=".8"') + crown(250, 60, 74, 42) + sparkle(190, 44, 7) + sparkle(310, 44, 7) + fourCorners(sparkle(26, 26, 10));

// Birthday: a band of polka dots inside a double edge.
const polkaFrame = rect(20, 8, 'stroke-width="1.2"') + rect(58, 4, 'stroke-width=".8"') + (() => {
  let s = '';
  for (let y = 32; y < 690; y += 18) for (let x = 32; x < 490; x += 18) {
    const inBand = x < 50 || x > 450 || y < 50 || y > 650;
    if (inBand) s += dot(x + ((y / 18) % 2 ? 9 : 0) * 0, y, (Math.floor(x / 18) + Math.floor(y / 18)) % 2 ? 3.2 : 1.8);
  }
  return s;
})();

// Birthday: sparkles in the corners and scattered along the edges.
const sparkleFrame = rect(24, 18, 'stroke-width="1.1"') + fourCorners(sparkle(54, 54, 20) + sparkle(96, 40, 8) + sparkle(40, 96, 8) + dot(80, 70, 1.8) + dot(70, 84, 1.4))
  + (() => { const rnd = seeded(5); let s = ''; for (const [x, y] of [[180, 40], [320, 46], [460, 250], [40, 300], [460, 420], [40, 470], [200, 662], [300, 656]]) s += rnd() > 0.5 ? sparkle(x, y, 5 + rnd() * 3) : dot(x, y, 1.8); return s; })();

// Birthday / Día de los Muertos: papel picado across the top, smaller below.
const papelRow = (y: number, w: number, h: number, n: number, sag: number) =>
  line(swag(22, 478, y, sag), 'stroke-width="1"') + Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; const x = 22 + 456 * t; return papel(x, y + sag * Math.sin(Math.PI * t), w, h, i); }).join('');
const papelFrame = rect(22, 0, 'stroke-width="1"') + papelRow(26, 46, 40, 8, 8) + papelRow(644, 30, 28, 10, 4);

const FRAME_LIST: Ornament[] = [
  { id: 'wedding-classic', name: 'Classic scroll', occasion: 'wedding', body: rect(18, 0, 'stroke-width="1.6"') + rect(26, 0, 'stroke-width=".8"') + fourCorners(g('translate(-14 -14) scale(1.55)', classicCorner, 'stroke-width=".9"')) },
  { id: 'wedding-vine', name: 'Leafy vine', occasion: 'wedding', body: rect(30, 0, 'stroke-width="1.1"') + oppositeCorner(g('translate(-12 -12) scale(1.3)', vineCorner, 'stroke-width="1"'), 0.8) },
  { id: 'wedding-floral', name: 'Flowers', occasion: 'wedding', body: rect(24, 6, 'stroke-width="1.1"') + oppositeCorner(g('translate(-12 -12) scale(1.4)', floralCluster, 'stroke-width="1"')) + g('translate(500 0) scale(-1 1)', floralSprig) + g('translate(0 700) scale(1 -1)', floralSprig) },
  { id: 'wedding-scallop', name: 'Scalloped', occasion: 'wedding', body: scallops + rect(42, 0, 'stroke-width=".8"') + fourCorners(flower(42, 42, 7, 4, 45)) },
  { id: 'christmas-holly', name: 'Holly', occasion: 'christmas', body: rect(20, 0, 'stroke-width="1.5"') + rect(27, 0, 'stroke-width=".8"') + fourCorners(holly(48, 46, 4, 46) + holly(46, 48, 86, 46) + holly(50, 50, 45, 30) + berries(44, 44, 4.5)) },
  { id: 'christmas-snow', name: 'Snowflakes', occasion: 'christmas', body: rect(24, 12, 'stroke-width="1.2"') + fourCorners(snowflake(60, 60, 28) + snowflake(108, 42, 9) + snowflake(42, 108, 9)) + flurry },
  { id: 'christmas-garland', name: 'Garland', occasion: 'christmas', body: rect(24, 0, 'stroke-width="1"') + garlandTop + garlandBottom },
  { id: 'birthday-bunting', name: 'Bunting', occasion: 'birthday', body: rect(22, 10, 'stroke-width="1.1"') + bunting(22, 250, 46, 34, 7) + bunting(250, 478, 46, 34, 7) + fourCorners(star(46, 46, 6)) },
  { id: 'birthday-confetti', name: 'Confetti', occasion: 'birthday', body: confetti([[16, 16, 484, 76], [16, 624, 484, 684], [16, 76, 70, 624], [430, 76, 484, 624]], 150, 3, 1.6) },
  { id: 'birthday-balloons', name: 'Balloons', occasion: 'birthday', body: rect(24, 10, 'stroke-width="1.1"') + g('translate(-2 -10) scale(.95)', balloonBunch) + g('translate(502 -10) scale(-.95 .95)', balloonBunch) + star(60, 640, 8) + star(440, 640, 8) + star(84, 656, 4.5) + star(416, 656, 4.5) },
  { id: 'halloween-webs', name: 'Cobwebs', occasion: 'halloween', body: rect(22, 0, 'stroke-width="1.1"') + g(at(22, 22), web(150)) + g('translate(478 22) scale(-1 1)', web(150)) + g('translate(22 678) scale(1 -1)', web(80)) + g('translate(478 678) scale(-1 -1)', web(80)) + seg('M446 50V140', 'stroke-width=".8"') + spider(446, 150, 11) },
  { id: 'halloween-bats', name: 'Bats', occasion: 'halloween', body: rect(20, 0, 'stroke-width="1.4"') + rect(27, 0, 'stroke-width=".7"') + batFlight },
  { id: 'halloween-pumpkins', name: 'Pumpkin patch', occasion: 'halloween', body: rect(24, 0, 'stroke-width="1.1"') + pumpkinPatch + g('scale(1.4)', vineCurl, 'stroke-width=".85"') + g('translate(500 0) scale(-1.4 1.4)', vineCurl, 'stroke-width=".85"') },
  // ── More for every occasion, so no two invitations look alike ──
  { id: 'wedding-laurel', name: 'Laurel', occasion: 'wedding', body: laurelFrame },
  { id: 'wedding-deco', name: 'Art deco', occasion: 'wedding', body: decoFrame },
  { id: 'wedding-pearls', name: 'Pearls', occasion: 'wedding', body: pearlFrame },
  { id: 'wedding-eucalyptus', name: 'Eucalyptus', occasion: 'wedding', body: eucalyptusFrame },
  { id: 'wedding-arch', name: 'Arch', occasion: 'wedding', body: archFrame },
  { id: 'wedding-filigree', name: 'Filigree', occasion: 'wedding', body: filigreeFrame },
  { id: 'wedding-rose', name: 'Roses', occasion: 'wedding', body: roseFrame },
  { id: 'wedding-fern', name: 'Ferns', occasion: 'wedding', body: fernFrame },
  { id: 'wedding-geometric', name: 'Diamonds', occasion: 'wedding', body: geoFrame },
  { id: 'wedding-ribbon', name: 'Ribbon', occasion: 'wedding', body: ribbonFrame },
  { id: 'christmas-mistletoe', name: 'Mistletoe', occasion: 'christmas', body: mistletoeFrame },
  { id: 'christmas-baubles', name: 'Baubles', occasion: 'christmas', body: baublesFrame },
  { id: 'christmas-stars', name: 'Star garland', occasion: 'christmas', body: starsFrame },
  { id: 'christmas-bells', name: 'Bells', occasion: 'christmas', body: bellsFrame },
  { id: 'christmas-gift', name: 'Presents', occasion: 'christmas', body: giftFrame },
  { id: 'christmas-candy', name: 'Candy canes', occasion: 'christmas', body: rect(24, 0, 'stroke-width="1.1"') + rectDots(34, 16, 1.4) + fourCorners(candyCane(54, 40, 70, 1, -30) + candyCane(80, 46, 54, -1, 24) + bow(66, 104, 12)) },
  { id: 'birthday-streamers', name: 'Streamers', occasion: 'birthday', body: streamersFrame },
  { id: 'birthday-crown', name: 'Crown', occasion: 'birthday', body: crownFrame },
  { id: 'birthday-polka', name: 'Polka dots', occasion: 'birthday', body: polkaFrame },
  { id: 'birthday-sparkle', name: 'Sparkles', occasion: 'birthday', body: sparkleFrame },
  { id: 'birthday-papel', name: 'Papel picado', occasion: 'birthday', body: papelFrame },
];

// ─── Public API ─────────────────────────────────────────

export const ORNAMENTS: Record<OrnamentKind, Ornament[]> = { divider: DIVIDER_LIST, frame: FRAME_LIST };

export function findOrnament(kind: OrnamentKind, id: string | null | undefined): Ornament | undefined {
  return id ? ORNAMENTS[kind].find((o) => o.id === id) : undefined;
}

// The ornament as an <svg>, in `color` (or the surrounding text colour). With
// `width`, a fixed-size image (for the PNG); otherwise it fills its box.
export function ornamentSvg(kind: OrnamentKind, ornament: Ornament, color = 'currentColor', width?: number): string {
  const { w, h } = ORNAMENT_VIEWBOX[kind];
  const size = width ? `width="${width}" height="${Math.round((width * h) / w)}"` : `style="display:block;width:100%;height:${kind === 'frame' ? '100%' : 'auto'}"`;
  const body = color === 'currentColor' ? ornament.body : ornament.body.replaceAll('currentColor', color);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${size} fill="none" stroke="${color}" stroke-width="${kind === 'frame' ? 1.5 : 1.3}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// Which set to show first for a theme.
const OCCASION_BY_THEME: Record<string, OrnamentOccasion> = {
  'merry': 'christmas', 'gnomes': 'christmas', 'white-christmas': 'christmas', 'christmas-party': 'christmas',
  'halloween-party': 'halloween', 'dia-de-los-muertos': 'halloween',
  'fun-party': 'birthday', 'balloons': 'birthday', 'alegria': 'birthday', 'antique-cars': 'birthday',
  'baby-shower-girl': 'birthday', 'baby-shower-neutral': 'birthday', 'baby-shower-boy': 'birthday',
};
export const ornamentOccasion = (themeSlug?: string | null): OrnamentOccasion => (themeSlug && OCCASION_BY_THEME[themeSlug]) || 'wedding';

// Ornament colours offered per theme: its golds, inks and accents.
const PALETTES: Record<string, string[]> = {
  'the-day': ['#9C7C3C', '#33402F', '#6F7F5C', '#DDCDB3', '#FFFFFF'],
  'love': ['#B23A5B', '#5A2D3A', '#E49763', '#E7C6CC', '#FFFFFF'],
  'nature': ['#2D4130', '#9C4A3F', '#BFA55B', '#C8857A', '#2A231E'],
  'wild-flores': ['#BE7922', '#3E3A2C', '#CE9BC8', '#7D8B5A', '#FFFFFF'],
  'western': ['#A4452B', '#2B1B12', '#C9A26B', '#E2B36B', '#F4EADB'],
  'terracotta-harvest': ['#BC5A38', '#CC9A3E', '#7A6451', '#3D2B1F', '#A9C4DE'],
  'midnight-botanical': ['#C9A75D', '#F5EEDC', '#8C7440', '#B25A4A', '#D9B96E'],
  'quiet-coastal': ['#7D8F84', '#3F4A45', '#5C6B61', '#DCD4C0', '#A0524A'],
  'vilma': ['#F8AC4C', '#3C4A5C', '#8C9EAC', '#92946F', '#D2C3D6'],
  'alegria': ['#C77FA1', '#4A3550', '#D9A544', '#E8A8B4', '#8A6B78'],
  'fun-party': ['#FF3EA5', '#E8FF3D', '#00D9E9', '#F4F1FF', '#EDE2FF'],
  'balloons': ['#E63946', '#FFC93C', '#3E8FE0', '#9B6BDE', '#1E3A5F'],
  'baby-shower-girl': ['#C9708A', '#B8578E', '#5B4A54', '#7F7A73', '#F7DEE5'],
  'baby-shower-neutral': ['#8A7FB5', '#7A6858', '#2E7BB8', '#4A5060', '#EDE6DC'],
  'baby-shower-boy': ['#B07A45', '#2A6FA6', '#244A63', '#F5C1AB', '#FFFFFF'],
  'summit': ['#CECECE', '#2F5DFF', '#C9A24B', '#E8ECF2', '#C1443A', '#5B6270'],
  'nexus': ['#E8A33D', '#4FB6A8', '#E7E3DA', '#C1443A', '#C6863F'],
  'dinner-gala': ['#C9A24B', '#D8B35A', '#EDE3CC', '#E2A15A', '#C9A96E'],
  'community': ['#D9472B', '#1A5B91', '#EDB044', '#405518', '#1F2E4D'],
  'antique-cars': ['#F2C230', '#2E1A47', '#B3261E', '#4E3D99', '#FFFFFF'],
  'christmas-party': ['#C8372D', '#F8C166', '#F4EDE1', '#C18D51', '#E6D3B1'],
  'white-christmas': ['#B89B4F', '#23415E', '#D6AB7C', '#FFFFFF', '#C7CBD7'],
  'merry': ['#D3B560', '#DC3E36', '#A4191F', '#F3F6F9', '#24506B'],
  'gnomes': ['#D91D1A', '#476735', '#34502A', '#FABA61', '#F57774'],
  'dia-de-los-muertos': ['#FBB813', '#EB247B', '#F0562C', '#FCDE11', '#FDF3E1'],
  'halloween-party': ['#F07F1E', '#EDE4D3', '#FF5A6E', '#FEA132', '#3D3839'],
};

// The invitation's own colours first, then the theme's — no repeats.
export function ornamentPalette(themeSlug: string | null | undefined, design: { accentColor: string; textColor: string }): string[] {
  const all = [design.accentColor, design.textColor, ...((themeSlug && PALETTES[themeSlug]) || PALETTES['the-day'])];
  return [...new Set(all.map((c) => c.toUpperCase()))];
}
