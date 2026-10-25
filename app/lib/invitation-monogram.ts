// The monogram layout's pieces (InvitationDesign.layout 'monogram'): a
// hand-drawn leaf wreath for the couple's initials, and the names split out
// of the event name ("Isabella & Mateo").

const r1 = (n: number) => Math.round(n * 10) / 10;

// Two leafy branches growing up from the bottom of a circle (their stems
// crossing there), almost meeting at the top. Line art in currentColor, like
// the ornaments (app/lib/invitation-ornaments.ts).
function wreath(): string {
  const C = 100, R = 70, L = 22, W = 6.5;
  const at = (deg: number) => [C + R * Math.cos((deg * Math.PI) / 180), C + R * Math.sin((deg * Math.PI) / 180)];
  const leaf = (x: number, y: number, ux: number, uy: number) => {
    const nx = -uy, ny = ux;
    const tx = x + ux * L, ty = y + uy * L;
    const mx = x + (ux * L) / 2, my = y + (uy * L) / 2;
    return `<path d="M${r1(x)} ${r1(y)}Q${r1(mx + nx * W)} ${r1(my + ny * W)} ${r1(tx)} ${r1(ty)}Q${r1(mx - nx * W)} ${r1(my - ny * W)} ${r1(x)} ${r1(y)}Z"/>`
      + `<path d="M${r1(x)} ${r1(y)}L${r1(x + ux * L * 0.75)} ${r1(y + uy * L * 0.75)}" stroke-width="0.8"/>`;
  };
  const parts: string[] = [];
  // dir 1: angles grow (the left branch, bottom → left → top); -1: the right.
  for (const [from, to, dir] of [[72, 262, 1], [108, -82, -1]] as const) {
    const [sx, sy] = at(from), [ex, ey] = at(to);
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    parts.push(`<path d="M${r1(sx)} ${r1(sy)}A${R} ${R} 0 ${large} ${dir === 1 ? 1 : 0} ${r1(ex)} ${r1(ey)}" stroke-width="1.4"/>`);
    let i = 0;
    for (let a = from + dir * 12; dir === 1 ? a < to - 4 : a > to + 4; a += dir * 9, i++) {
      const [x, y] = at(a);
      const rad = (a * Math.PI) / 180;
      // Along the stem, the way it grows; then turned out or in, in turn.
      const tx = -Math.sin(rad) * dir, ty = Math.cos(rad) * dir;
      const t = ((i % 2 ? 40 : -40) * dir * Math.PI) / 180;
      parts.push(leaf(x, y, tx * Math.cos(t) - ty * Math.sin(t), tx * Math.sin(t) + ty * Math.cos(t)));
    }
    // A last leaf at the branch's tip.
    const rad = (to * Math.PI) / 180;
    parts.push(leaf(ex, ey, -Math.sin(rad) * dir, Math.cos(rad) * dir));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style="display:block;width:100%;height:auto" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${parts.join('')}</svg>`;
}

export const MONOGRAM_WREATH_SVG = wreath();

// "Isabella & Mateo" → names ['Isabella', 'Mateo'], initials 'I+M'. A name
// that isn't two people joined by &, +, "and" or "et" stays whole, with its
// first letter as the monogram.
export function monogramNames(name: string): { names: string[]; initials: string } {
  const parts = name.split(/\s*(?:&|\+|\band\b|\bet\b)\s*/i).map((p) => p.trim()).filter(Boolean);
  const names = parts.length === 2 ? parts : [name.trim()];
  const initials = names.map((n) => n.charAt(0).toUpperCase()).join('+');
  return { names, initials };
}
