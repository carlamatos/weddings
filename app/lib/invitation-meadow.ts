// The Wildflower Meadow style's artwork, our own: a garland of watercolour
// wildflowers (wild roses, cosmos, cornflowers, buttercups
// and baby's breath) on fine curving stems, along the top and the bottom of
// the card (a 100 x 140 box). Each flower is painted in washes: a pale
// petal, a deeper wash towards its heart, fine veins, then stamens; a filter
// softens and roughens the flowers' edges like paint on paper (the stems
// and leaves stay smooth). Fixed watercolour
// colours. Client-safe: no imports.

type P = [number, number];
const f = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;
const xy = (p: P) => `${f(p[0])} ${f(p[1])}`;
const at = (c: P, r: number, deg: number): P => [c[0] + Math.cos(rad(deg)) * r, c[1] + Math.sin(rad(deg)) * r];

// The same "random" garland every time.
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const GREENS = ['#93AC7F', '#7C9A6B', '#A9BE92', '#6E8A5E'];
const ROSES: [string, string][] = [['#F6C4C8', '#E3808E'], ['#F8CDBF', '#EC8F7A'], ['#F3BFD0', '#D97197']];
const COSMOS: [string, string][] = [['#E9C6E6', '#C487C6'], ['#F7D2DB', '#E59AB0']];
const BLUE: [string, string] = ['#9DB2E6', '#4E66B8'];
const YELLOW: [string, string] = ['#F8DE8A', '#E6B53E'];

// A petal from the heart c out at angle a: rounded, a little wavy, with a
// notch at the tip (heart) or teeth (toothed).
function petalPath(c: P, a: number, r0: number, r: number, w: number, tip: 'round' | 'heart' | 'toothed'): string {
  const b0 = at(c, r0, a - w * 0.25), b1 = at(c, r0, a + w * 0.25);
  const s0 = at(c, r * 0.72, a - w), s1 = at(c, r * 0.72, a + w);
  const e0 = at(c, r * 0.98, a - w * 0.55), e1 = at(c, r * 0.98, a + w * 0.55);
  let end: string;
  if (tip === 'heart') end = `L${xy(at(c, r * 0.88, a))}L${xy(e1)}`;
  else if (tip === 'toothed') end = `L${xy(at(c, r * 0.9, a - w * 0.28))}L${xy(at(c, r * 1.01, a - w * 0.1))}L${xy(at(c, r * 0.9, a + w * 0.1))}L${xy(at(c, r * 1.01, a + w * 0.28))}L${xy(e1)}`;
  else end = `Q${xy(at(c, r * 1.08, a))} ${xy(e1)}`;
  return `M${xy(b0)}C${xy(s0)} ${xy(at(c, r * 0.95, a - w * 0.9))} ${xy(e0)}${end}C${xy(at(c, r * 0.95, a + w * 0.9))} ${xy(s1)} ${xy(b1)}Z`;
}

// A flower seen from the front: each petal a pale wash, a deeper one over
// its inner half, two fine veins; then the heart.
function face(c: P, r: number, [pale, deep]: [string, string], n: number, rot: number, tip: 'round' | 'heart' | 'toothed', width: number, heart: string): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n + (i % 2 ? 4 : -3);
    const rr = r * (0.92 + ((i * 37) % 10) / 60);
    s += `<path d="${petalPath(c, a, r * 0.1, rr, width, tip)}" fill="${pale}" fill-opacity="0.85"/>`;
    s += `<path d="${petalPath(c, a, r * 0.1, rr * 0.62, width * 0.8, 'round')}" fill="${deep}" fill-opacity="0.35"/>`;
    s += `<path d="M${xy(at(c, r * 0.25, a))}Q${xy(at(c, r * 0.55, a + 3))} ${xy(at(c, rr * 0.8, a + 1))}M${xy(at(c, r * 0.3, a - width * 0.3))}Q${xy(at(c, r * 0.5, a - width * 0.4))} ${xy(at(c, rr * 0.7, a - width * 0.45))}" fill="none" stroke="${deep}" stroke-width="0.07" stroke-opacity="0.6"/>`;
  }
  return s + heart;
}

// A ring of stamens round a heart.
function stamens(c: P, r: number, disk: string, dot: string, count = 10): string {
  let s = `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * 0.5)}" fill="${disk}" fill-opacity="0.9"/>`;
  for (let i = 0; i < count; i++) {
    const a = (i * 360) / count, p = at(c, r * (0.6 + (i % 3) * 0.12), a);
    s += `<path d="M${xy(at(c, r * 0.3, a))}L${xy(p)}" stroke="${dot}" stroke-width="0.06"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r * 0.1)}" fill="${dot}"/>`;
  }
  return s;
}

const wildRose = (c: P, r: number, col: [string, string], rot: number) =>
  face(c, r, col, 5, rot, 'heart', 30, stamens(c, r * 0.36, '#E8D27A', '#B8862F', 12));
const cosmos = (c: P, r: number, col: [string, string], rot: number) =>
  face(c, r, col, 8, rot, 'toothed', 17, stamens(c, r * 0.26, '#EBC24E', '#B07F21', 9));
const buttercup = (c: P, r: number, rot: number) =>
  face(c, r, YELLOW, 5, rot, 'round', 34, stamens(c, r * 0.3, '#C9A13A', '#8E6B1C', 8))
  + `<path d="M${xy(at(c, r * 0.5, rot - 60))}q${f(r * 0.2)} ${f(-r * 0.1)} ${f(r * 0.32)} 0" fill="none" stroke="#fff" stroke-width="0.12" stroke-opacity="0.7"/>`;

// A cornflower: a ring of ragged little trumpets round a dark heart.
function cornflower(c: P, r: number, rot: number): string {
  let s = '';
  for (let i = 0; i < 9; i++) {
    const a = rot + i * 40;
    const base = at(c, r * 0.3, a);
    const m: P = at(c, r * 0.95, a);
    const l = at(c, r * 1.02, a - 14), rr = at(c, r * 1.02, a + 14);
    s += `<path d="M${xy(at(base, r * 0.12, a - 90))}Q${xy(at(c, r * 0.7, a - 9))} ${xy(l)}L${xy(at(c, r * 0.86, a - 7))}L${xy(m)}L${xy(at(c, r * 0.86, a + 7))}L${xy(rr)}Q${xy(at(c, r * 0.7, a + 9))} ${xy(at(base, r * 0.12, a + 90))}Z" fill="${BLUE[0]}" fill-opacity="0.85"/>`;
    s += `<path d="M${xy(base)}L${xy(at(c, r * 0.75, a))}" stroke="${BLUE[1]}" stroke-width="0.16" stroke-opacity="0.55"/>`;
  }
  s += `<circle cx="${f(c[0])}" cy="${f(c[1])}" r="${f(r * 0.34)}" fill="#5A4E9A" fill-opacity="0.85"/>`;
  for (let i = 0; i < 7; i++) { const p = at(c, r * 0.2, i * 51); s += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(r * 0.07)}" fill="#2E2660"/>`; }
  return s;
}

// A slender leaf curving as it goes, a deeper wash down one side, a midrib.
function leaf(base: P, angle: number, len: number, color: string, curl: number): string {
  const w = len * 0.17;
  const tip = at(base, len, angle + curl);
  const m0 = at(at(base, len * 0.45, angle + curl * 0.3), w, angle + 90), m1 = at(at(base, len * 0.45, angle + curl * 0.3), w, angle - 90);
  const mid = at(base, len * 0.5, angle + curl * 0.4);
  return `<path d="M${xy(base)}Q${xy(m0)} ${xy(tip)}Q${xy(m1)} ${xy(base)}Z" fill="${color}" fill-opacity="0.8"/>`
    + `<path d="M${xy(base)}Q${xy(m1)} ${xy(tip)}Q${xy(mid)} ${xy(base)}Z" fill="${GREENS[3]}" fill-opacity="0.25"/>`
    + `<path d="M${xy(base)}Q${xy(mid)} ${xy(tip)}" fill="none" stroke="${GREENS[3]}" stroke-width="0.07" stroke-opacity="0.7"/>`;
}

// A stem that sways: an S between from and to.
function stem(from: P, to: P, sway: number, width: number, color = GREENS[1]): string {
  const dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy) || 1;
  const n: P = [-dy / len, dx / len];
  const c1: P = [from[0] + dx * 0.33 + n[0] * sway, from[1] + dy * 0.33 + n[1] * sway];
  const c2: P = [from[0] + dx * 0.66 - n[0] * sway * 0.8, from[1] + dy * 0.66 - n[1] * sway * 0.8];
  return `<path d="M${xy(from)}C${xy(c1)} ${xy(c2)} ${xy(to)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}
const onStem = (from: P, to: P, sway: number, t: number): P => {
  const dx = to[0] - from[0], dy = to[1] - from[1], len = Math.hypot(dx, dy) || 1;
  const n: P = [-dy / len, dx / len], u = 1 - t;
  const c1: P = [from[0] + dx * 0.33 + n[0] * sway, from[1] + dy * 0.33 + n[1] * sway];
  const c2: P = [from[0] + dx * 0.66 - n[0] * sway * 0.8, from[1] + dy * 0.66 - n[1] * sway * 0.8];
  return [u * u * u * from[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * to[0], u * u * u * from[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * to[1]];
};

// A loose garland along y = mid: sprigs curving out every way with leaves
// (no stem joining them), each ending in an open flower or a spray
// of baby's breath. up: the side most sprigs grow towards (-1 up, 1 down).
function garland(mid: number, seed: number, up: -1 | 1): string {
  const rnd = rng(seed);
  let back = '', front = '';
  // Clusters of two or three sprigs from one spot, fanning out, with clear
  // space between the clusters; a flower is never put within reach of
  // another (a few tries at another angle, else the sprig is left out).
  const tips: P[] = [];
  let k = 0;
  for (let x = 9 + rnd() * 3; x < 92; x += 11 + rnd() * 3) {
    const base: P = [x, mid + (rnd() - 0.5) * 3];
    const count = 3 + Math.floor(rnd() * 2);
    for (let j = 0; j < count; j++) {
    let tip: P | null = null, h = 0;
    const side = j === 0 || rnd() < 0.7 ? up : (-up as -1 | 1);
    for (let tries = 0; tries < 8 && !tip; tries++) {
      h = 4.5 + rnd() * 5;
      const a = side * 90 + (j - (count - 1) / 2) * 42 + (rnd() - 0.5) * 30;
      const p: P = [Math.min(95, Math.max(5, base[0] + Math.cos(rad(a)) * h)), Math.min(137, Math.max(3.5, base[1] + Math.sin(rad(a)) * h))];
      if (tips.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 5.6)) tip = p;
    }
    if (!tip) continue;
    tips.push(tip);
    const sway = (rnd() < 0.5 ? -1 : 1) * (1.4 + rnd() * 1.8);
    back += stem(base, tip, sway, 0.16);
    const dirAt = (t: number) => { const a = onStem(base, tip, sway, t), b = onStem(base, tip, sway, Math.min(1, t + 0.05)); return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; };
    // Leaves up the sprig, alternating sides.
    const leaves = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < leaves; i++) {
      const t = 0.2 + rnd() * 0.55, dir = dirAt(t), sgn = i % 2 ? 1 : -1;
      back += leaf(onStem(base, tip, sway, t), dir + sgn * (35 + rnd() * 25), 2.2 + rnd() * 2, GREENS[Math.floor(rnd() * 3)], sgn * (10 + rnd() * 15));
    }
    // Now and then a leaf at its foot, lying out sideways.
    if (rnd() < 0.45) back += leaf(base, rnd() < 0.5 ? -15 * side : 180 + 15 * side, 2.4 + rnd() * 1.6, GREENS[Math.floor(rnd() * 3)], (rnd() - 0.5) * 40);
    const end = dirAt(0.95);
    switch (k++ % 9) {
      case 0: case 5: front += wildRose(tip, 2.4 + rnd() * 0.9, ROSES[Math.floor(rnd() * ROSES.length)], rnd() * 72); break;
      case 1: case 7: front += cornflower(tip, 2 + rnd() * 0.5, rnd() * 40); break;
      case 2: front += buttercup(tip, 1.7 + rnd() * 0.4, rnd() * 72); break;
      case 3: front += buttercup(tip, 1.7 + rnd() * 0.4, rnd() * 72); break;
      case 4: front += cosmos(tip, 2.6 + rnd() * 0.6, COSMOS[Math.floor(rnd() * COSMOS.length)], rnd() * 45); break;
      case 6: front += wildRose(tip, 2.2 + rnd() * 0.8, ROSES[Math.floor(rnd() * ROSES.length)], rnd() * 72); break;
      default:
        // Baby's breath: a little spray of white-and-cream dots on fine stalks.
        for (let i = 0; i < 6; i++) {
          const p = at(tip, 0.6 + rnd() * 1.4, end + (rnd() - 0.5) * 140);
          front += `<path d="M${xy(tip)}L${xy(p)}" stroke="${GREENS[2]}" stroke-width="0.07"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="0.38" fill="#FBF6EE" stroke="#D9CFC0" stroke-width="0.07"/>`;
        }
    }
    }
  }
  return `<g>${back}</g><g filter="url(#meadow-wc)">${front}</g>`;
}

export const MEADOW_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="none">`
  + `<filter id="meadow-wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.3"/><feGaussianBlur stdDeviation="0.04"/></filter>`
  + `${garland(11, 11, -1)}${garland(129, 29, 1)}</svg>`;
