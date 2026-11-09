// Fills {name} placeholders in a dashboard string: fill(d.rsvp.count, { n: 3 }).
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

// Picks the singular or plural form: plural(n, d.x.guest, d.x.guests) with
// {n} filled in.
export function plural(n: number, one: string, other: string): string {
  return fill(n === 1 ? one : other, { n });
}
