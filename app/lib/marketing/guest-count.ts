// The guest count planner (app/ui/marketing/guest-tool.tsx): how many of the
// people invited are likely to come, group by group, and what that means for
// the venue, the tables and the catering bill.

export type GuestGroup = { id: string; label: string; rate: number; hint: string };

// How likely each group is to say yes, from what planners and caterers see
// at local events. Distance matters most, so travel lowers every group.
export const GUEST_GROUPS: GuestGroup[] = [
  { id: 'family', label: 'Immediate family', rate: 95, hint: 'Parents, siblings, grandparents' },
  { id: 'extended', label: 'Extended family', rate: 80, hint: 'Aunts, uncles, cousins' },
  { id: 'close', label: 'Close friends', rate: 90, hint: 'The people you see all the time' },
  { id: 'friends', label: 'Other friends', rate: 75, hint: 'Old classmates, teammates, neighbours' },
  { id: 'parents', label: 'Parents’ friends', rate: 70, hint: 'Family friends your parents invite' },
  { id: 'work', label: 'Coworkers', rate: 60, hint: 'Colleagues and clients' },
  { id: 'plus', label: 'Plus-ones', rate: 85, hint: 'Partners and dates of the guests above' },
  { id: 'kids', label: 'Children', rate: 70, hint: 'If kids are invited' },
];

export type Travel = 'local' | 'some' | 'most';
export const TRAVEL: { id: Travel; label: string; factor: number }[] = [
  { id: 'local', label: 'Most guests are local', factor: 1 },
  { id: 'some', label: 'About half travel', factor: 0.9 },
  { id: 'most', label: 'Most travel (destination)', factor: 0.72 },
];

export type GuestEstimate = {
  invited: number;
  expected: number;
  low: number; // a likely range: 9 times out of 10 the real number lands inside it
  high: number;
  averageRate: number; // in %
};

export function estimateGuests(counts: Record<string, number>, rates: Record<string, number>, travel: Travel): GuestEstimate {
  const factor = TRAVEL.find((t) => t.id === travel)!.factor;
  let invited = 0;
  let expected = 0;
  let variance = 0;
  for (const g of GUEST_GROUPS) {
    const n = counts[g.id] ?? 0;
    // Immediate family comes almost whatever the distance.
    const p = Math.min(1, ((rates[g.id] ?? g.rate) / 100) * (g.id === 'family' ? Math.sqrt(factor) : factor));
    invited += n;
    expected += n * p;
    variance += n * p * (1 - p);
  }
  // Guests don't decide alone (couples and families come together), so the
  // spread is wider than coin flips: about twice the variance.
  const spread = 1.645 * Math.sqrt(variance * 2);
  return {
    invited,
    expected: Math.round(expected),
    low: Math.max(0, Math.floor(expected - spread)),
    high: Math.min(invited, Math.ceil(expected + spread)),
    averageRate: invited ? Math.round((expected / invited) * 100) : 0,
  };
}

// Shared links: #guests=local.family-12-95+close-20-90…
export function guestHash(counts: Record<string, number>, rates: Record<string, number>, travel: Travel, capacity: number, table: number, cost: number, currency: string): string {
  const groups = GUEST_GROUPS.filter((g) => counts[g.id]).map((g) => `${g.id}-${counts[g.id]}-${rates[g.id] ?? g.rate}`).join('+');
  return `#guests=${travel}.${capacity}.${table}.${cost}.${currency}.${groups}`;
}

export function parseGuestHash(hash: string) {
  const m = /^#guests=(local|some|most)\.(\d{1,5})\.(\d{1,2})\.(\d{1,6})\.([A-Z]{3})\.([a-z0-9+-]*)$/.exec(hash);
  if (!m) return null;
  const counts: Record<string, number> = {};
  const rates: Record<string, number> = {};
  for (const part of m[6].split('+')) {
    const [id, n, r] = part.split('-');
    if (!GUEST_GROUPS.some((g) => g.id === id)) continue;
    counts[id] = Math.min(2000, Number(n) || 0);
    rates[id] = Math.min(100, Math.max(0, Number(r) || 0));
  }
  return { travel: m[1] as Travel, capacity: Number(m[2]), table: Number(m[3]), cost: Number(m[4]), currency: m[5], counts, rates };
}
