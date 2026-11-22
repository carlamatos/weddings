// The Garden Scroll frame: our own engraved-style ornament of curling
// scrolls, leaves and five-petal blossoms, in a 100 x 140 box (the card).
// One corner is drawn here and mirrored into the other three; a blossom
// crowns the top and bottom and sits halfway down each side. The words keep
// to the middle (x 20–80, y 24–116), clear of every piece. Drawn in
// currentColor; the petal veins and flower hearts are cut out in the paper's
// colour (the .gs-cut class, set by the card). Client-safe: no imports.

type P = [number, number];
const f = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

// A smooth line through points, filled with a width that swells from thin to
// full and back (a pen stroke).
function stroke(pts: P[], max: number, min = 0.12): string {
  const n = pts.length;
  const left: P[] = [], right: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const t = i / (n - 1);
    const w = (min + (max - min) * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.8)) / 2;
    left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  const all = [...left, ...right.reverse()];
  return `<path d="M${all.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z"/>`;
}

function bezier(p0: P, p1: P, p2: P, p3: P, n = 24): P[] {
  const out: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

// A scroll: a curve from `from` that winds into a spiral around c, starting
// at angle a0 (degrees) and radius r0, turning `turns` times (sign: which
// way) down to radius r1, ending in a small ball. wave: how far the line
// sways either side on its way there (an S), fading out into the spiral.
function scroll(from: P, bend: P, c: P, r0: number, a0: number, turns: number, r1: number, max: number, wave = 0, waves = 1): string {
  const s: P = [c[0] + r0 * Math.cos(rad(a0)), c[1] + r0 * Math.sin(rad(a0))];
  const dir = Math.sign(turns);
  const tan: P = [-Math.sin(rad(a0)) * dir, Math.cos(rad(a0)) * dir];
  const k = Math.hypot(s[0] - from[0], s[1] - from[1]) * 0.4;
  const line = bezier(from, bend, [s[0] - tan[0] * k, s[1] - tan[1] * k], s, 48);
  const len = Math.hypot(s[0] - from[0], s[1] - from[1]) || 1;
  const n: P = [-(s[1] - from[1]) / len, (s[0] - from[0]) / len];
  const stem = line.map(([x, y], i): P => {
    const t = i / (line.length - 1);
    const o = wave * Math.sin(2 * Math.PI * waves * t) * Math.pow(1 - t, 0.8) * Math.min(1, t * 6);
    return [x + n[0] * o, y + n[1] * o];
  });
  const spiral: P[] = [];
  const steps = Math.ceil(Math.abs(turns) * 36);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const r = r0 * Math.pow(r1 / r0, t);
    const a = rad(a0 + 360 * turns * t);
    spiral.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
  }
  const end = spiral[spiral.length - 1];
  return stroke([...stem, ...spiral], max) + `<circle cx="${f(end[0])}" cy="${f(end[1])}" r="${f(max * 0.55)}"/>`;
}

// A pointed leaf from base, `len` long at angle (degrees), with a cut vein.
function leaf(base: P, angle: number, len: number, width = len * 0.3): string {
  const d: P = [Math.cos(rad(angle)), Math.sin(rad(angle))], n: P = [-d[1], d[0]];
  const at = (along: number, side: number): string => `${f(base[0] + d[0] * len * along + n[0] * side)} ${f(base[1] + d[1] * len * along + n[1] * side)}`;
  return `<path d="M${at(0, 0)}C${at(0.25, width)} ${at(0.7, width * 0.8)} ${at(1, 0)}C${at(0.7, -width * 0.8)} ${at(0.25, -width)} ${at(0, 0)}Z"/>`
    + `<path class="gs-cut-line" d="M${at(0.15, 0)}Q${at(0.5, width * 0.12)} ${at(0.82, 0)}"/>`;
}

// A five-petal blossom (each petal notched at the tip, a vein cut in it), a
// cut-out heart with a ring of stamens. rot: turns the first petal from up.
function blossom(c: P, r: number, rot = 0): string {
  const w = r * 0.62;
  let out = '';
  for (let i = 0; i < 5; i++) {
    const t = `translate(${f(c[0])} ${f(c[1])}) rotate(${f(rot + i * 72)})`;
    out += `<path transform="${t}" d="M0 ${f(-r * 0.2)}C${f(-w * 0.9)} ${f(-r * 0.35)} ${f(-w)} ${f(-r * 0.95)} ${f(-w * 0.3)} ${f(-r)}L0 ${f(-r * 0.86)}L${f(w * 0.3)} ${f(-r)}C${f(w)} ${f(-r * 0.95)} ${f(w * 0.9)} ${f(-r * 0.35)} 0 ${f(-r * 0.2)}Z"/>`;
    out += `<path class="gs-cut-line" transform="${t}" d="M0 ${f(-r * 0.4)}L0 ${f(-r * 0.75)}"/>`;
  }
  out += `<circle class="gs-cut" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * 0.34)}"/>`;
  out += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * 0.15)}"/>`;
  for (let i = 0; i < 6; i++) {
    const a = rad(rot + 30 + i * 60);
    out += `<circle cx="${f(c[0] + Math.cos(a) * r * 0.27)}" cy="${f(c[1] + Math.sin(a) * r * 0.27)}" r="${f(r * 0.055)}"/>`;
  }
  return out;
}

// A closed bud on a short stalk, pointing at angle.
function bud(base: P, angle: number, len: number): string {
  const d: P = [Math.cos(rad(angle)), Math.sin(rad(angle))];
  const tip: P = [base[0] + d[0] * len, base[1] + d[1] * len];
  return stroke(bezier(base, [base[0] + d[0] * len * 0.3, base[1] + d[1] * len * 0.3], [base[0] + d[0] * len * 0.5, base[1] + d[1] * len * 0.5], [base[0] + d[0] * len * 0.55, base[1] + d[1] * len * 0.55], 8), 0.3, 0.2)
    + leaf([base[0] + d[0] * len * 0.5, base[1] + d[1] * len * 0.5], angle, len * 0.5, len * 0.22)
    + leaf([base[0] + d[0] * len * 0.55, base[1] + d[1] * len * 0.55], angle - 35, len * 0.28, len * 0.08)
    + leaf([base[0] + d[0] * len * 0.55, base[1] + d[1] * len * 0.55], angle + 35, len * 0.28, len * 0.08)
    + `<circle cx="${f(tip[0])}" cy="${f(tip[1])}" r="0.01"/>`;
}

// The top-left quarter: the corner and half of the pieces on the middle
// lines (drawn whole; their mirror lands on them).
function quarter(): string {
  let s = '';
  // The great corner scroll: along the top edge, curling round in the corner.
  s += scroll([37, 6.6], [28, 9.4], [10.5, 10.5], 4.2, -90, -1.15, 0.7, 0.72, -3.6, 1.5);
  // Its partner down the side, curling the other way below it.
  s += scroll([6.4, 50], [8.6, 38], [11.6, 20.6], 2.7, 180, 1.1, 0.55, 0.66, 3.8, 1.5);
  // Small curls off each, turning in towards the words.
  s += scroll([29, 7.2], [25, 9.6], [22.6, 12.2], 1.9, 0, 1.05, 0.45, 0.4, 1.9);
  s += scroll([6.6, 40], [8.4, 36], [10.8, 32.6], 1.7, 90, -1.05, 0.4, 0.4, -1.9);
  // Acanthus leaves along the scrolls.
  s += leaf([31, 6.8], 200, 4.4) + leaf([24, 6.4], 195, 3.4) + leaf([33, 7.2], 160, 3);
  s += leaf([6.3, 44], -100, 4.4) + leaf([6.5, 36], -105, 3.4) + leaf([6.9, 46], -60, 3);
  // Blossoms in the corner, with leaves and a bud.
  s += blossom([17.8, 14.4], 2.9, 12);
  s += leaf([19.6, 16.8], 55, 3.4) + leaf([20.4, 13], -10, 3.2);
  s += blossom([14.6, 26.6], 1.9, -20);
  s += leaf([15.6, 28.4], 70, 2.8) + leaf([16.4, 25.6], 5, 2.4);
  s += bud([16, 8.4], -20, 4.2);
  // The top crown: a blossom between two leaves, small scrolls out to the
  // corner scrolls.
  s += scroll([47.4, 8.6], [44, 7], [39.6, 9.8], 1.7, -90, -1.05, 0.4, 0.48, -2.3);
  s += leaf([47.6, 9.4], 200, 4.6) + leaf([47, 10.4], 160, 3.4) + leaf([48.4, 6.6], 230, 2.8);
  s += blossom([50, 8.6], 3.1, 0);
  // Halfway down the side: a blossom, leaves, and scrolls up to the corner's.
  s += scroll([7.4, 66.6], [6.6, 61], [9.6, 55.4], 1.6, 90, -1.05, 0.4, 0.48, 2.5);
  s += leaf([8.4, 67], -70, 4.2) + leaf([7, 66.6], -110, 3.4) + leaf([9.6, 68.6], -20, 2.8);
  s += blossom([8.2, 70], 2.5, -90);
  // Fine tendrils between the pieces.
  s += scroll([36, 8.2], [33, 11], [30.4, 11.6], 1.1, 0, -1.2, 0.3, 0.22);
  s += scroll([43, 7.6], [44, 4.8], [41.8, 4.2], 0.9, 90, 1.2, 0.25, 0.2);
  s += scroll([8, 46], [11, 44], [12.6, 41], 1.1, 90, 1.2, 0.3, 0.22);
  s += scroll([7, 58], [4.2, 60], [4.6, 62.6], 0.9, 0, -1.2, 0.25, 0.2);
  s += scroll([24, 18], [22, 20.5], [20.6, 21.4], 0.9, -90, -1.2, 0.25, 0.2);
  s += leaf([27, 7], 150, 2.4) + leaf([7.2, 30], -75, 2.4) + leaf([6.9, 54], -95, 2.6) + leaf([6.9, 54], -60, 2);
  s += blossom([28.2, 11.6], 1.25, 30) + blossom([5.2, 33.6], 1.15, 10);
  return s;
}

const Q = quarter();
export const GARDEN_SCROLL_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="none" fill="currentColor">`
  + `<g>${Q}</g><g transform="translate(100 0) scale(-1 1)">${Q}</g>`
  + `<g transform="translate(0 140) scale(1 -1)">${Q}</g><g transform="translate(100 140) scale(-1 -1)">${Q}</g></svg>`;
