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
const swag = (x0: number, x1: number, y: number, sag: number) => sample((t) => [x0 + (x1 - x0) * t, y + sag * Math.sin(Math.PI * t)], 46);
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
  'summit': ['#2F5DFF', '#C9A24B', '#E8ECF2', '#C1443A', '#5B6270'],
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
