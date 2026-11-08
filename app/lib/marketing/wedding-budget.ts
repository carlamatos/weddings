// The wedding budget calculator (app/ui/marketing/budget-tool.tsx): how a
// total budget is usually split across a wedding, adjusted for what the
// couple cares about most and what they're skipping.

export type BudgetCategory = {
  id: string;
  label: string;
  share: number; // the usual share of the total, in %
  covers: string;
  color: string;
};

// Typical shares of a wedding budget, drawn from couples' surveys in Canada,
// the US and the UK. They add up to 100.
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'food', label: 'Food and drink', share: 28, covers: 'Catering, bar, service staff and gratuities', color: '#B6584A' },
  { id: 'venue', label: 'Venue and rentals', share: 18, covers: 'Ceremony and reception venue, tables, chairs, linens and tent', color: '#D99A82' },
  { id: 'photo', label: 'Photography and video', share: 12, covers: 'Photographer, videographer and albums', color: '#7C8F6B' },
  { id: 'attire', label: 'Attire and beauty', share: 8, covers: 'Dress, suit, alterations, shoes, hair and makeup', color: '#A9B79A' },
  { id: 'flowers', label: 'Flowers and decor', share: 8, covers: 'Bouquets, centrepieces, ceremony flowers, candles and lighting', color: '#C9A15B' },
  { id: 'music', label: 'Music and entertainment', share: 6, covers: 'DJ or band, ceremony musicians and sound', color: '#E3C88F' },
  { id: 'planner', label: 'Planner or coordinator', share: 3, covers: 'Full planner or a day-of coordinator', color: '#6F86A6' },
  { id: 'rings', label: 'Wedding rings', share: 3, covers: 'Both wedding bands', color: '#A7B6CB' },
  { id: 'cake', label: 'Cake and desserts', share: 2, covers: 'Wedding cake, dessert table and late-night snacks', color: '#8E6C8A' },
  { id: 'paper', label: 'Invitations and stationery', share: 2, covers: 'Save-the-dates, invitations, postage, signs and menus', color: '#C2A9BF' },
  { id: 'transport', label: 'Transportation', share: 2, covers: 'Car for the couple and guest shuttles', color: '#9C8C7A' },
  { id: 'favours', label: 'Favours and gifts', share: 2, covers: 'Guest favours and gifts for the wedding party and parents', color: '#CDBFAE' },
  { id: 'ceremony', label: 'Officiant and licence', share: 1, covers: 'Officiant’s fee, marriage licence and ceremony fees', color: '#5E5A66' },
  { id: 'buffer', label: 'Buffer for surprises', share: 5, covers: 'Taxes you forgot, last-minute extras and overtime', color: '#B9B4BD' },
];

export const MAX_PRIORITIES = 3;
// A must-have gets this much more than its usual share.
const PRIORITY_BOOST = 1.4;

export type BudgetLine = BudgetCategory & { percent: number; amount: number; priority: boolean; skipped: boolean };

// Splits the total: must-haves get a bigger share, skipped categories get
// nothing, and everything else (except the fixed buffer) shares what's left
// in its usual proportions. The percentages always add up to 100.
export function splitBudget(total: number, priorities: string[], skipped: string[]): BudgetLine[] {
  const buffer = BUDGET_CATEGORIES.find((c) => c.id === 'buffer')!.share;
  const weight = (c: BudgetCategory) => (skipped.includes(c.id) ? 0 : c.share * (priorities.includes(c.id) ? PRIORITY_BOOST : 1));
  const others = BUDGET_CATEGORIES.filter((c) => c.id !== 'buffer');
  const sum = others.reduce((s, c) => s + weight(c), 0) || 1;
  return BUDGET_CATEGORIES.map((c) => {
    const percent = c.id === 'buffer' ? buffer : (weight(c) / sum) * (100 - buffer);
    return { ...c, percent, amount: (total * percent) / 100, priority: priorities.includes(c.id), skipped: skipped.includes(c.id) };
  });
}

// Shared links carry the whole set-up: #budget=30000.120.CAD.food+photo.planner
export function budgetHash(total: number, guests: number, currency: string, priorities: string[], skipped: string[]): string {
  return `#budget=${Math.round(total)}.${Math.round(guests)}.${currency}.${priorities.join('+')}.${skipped.join('+')}`;
}

export function parseBudgetHash(hash: string): { total: number; guests: number; currency: string; priorities: string[]; skipped: string[] } | null {
  const m = /^#budget=(\d{1,9})\.(\d{1,5})\.([A-Z]{3})\.([a-z+]*)\.([a-z+]*)$/.exec(hash);
  if (!m) return null;
  const ids = new Set(BUDGET_CATEGORIES.map((c) => c.id));
  const list = (s: string) => s.split('+').filter((id) => ids.has(id) && id !== 'buffer');
  return { total: Number(m[1]), guests: Number(m[2]), currency: m[3], priorities: list(m[4]).slice(0, MAX_PRIORITIES), skipped: list(m[5]) };
}
