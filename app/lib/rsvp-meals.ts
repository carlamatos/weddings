// Meal choices and dietary needs on the RSVP. Off until the host switches it
// on (RSVP screen); then each person in an attending party can pick a meal
// from the host's list and note allergies, both optional for guests. The
// host gets a count per meal for the caterer, and Find Your Table shows the
// meals at each table. Shared by client and server, so no server-only
// imports (the column is added in rsvp-meals-data.ts).

export const MEALS_ON_SETTING = 'rsvp_ask_meals';
export const MEAL_OPTIONS_SETTING = 'rsvp_meal_options'; // JSON array of the host's meal names

export const MEAL_OPTIONS_MAX = 8;
export const MEAL_NAME_MAX = 40;
export const PARTY_NAME_MAX = 80;
export const DIET_MAX = 200;

// The starting list, in the page's language; the host can change it.
export const DEFAULT_MEALS: Record<string, string[]> = {
  en: ['Chicken', 'Fish', 'Vegetarian', 'Kids’ meal'],
  fr: ['Poulet', 'Poisson', 'Végétarien', 'Menu enfant'],
  es: ['Pollo', 'Pescado', 'Vegetariano', 'Menú infantil'],
};

export function defaultMeals(language?: string | null): string[] {
  return DEFAULT_MEALS[language ?? 'en'] ?? DEFAULT_MEALS.en;
}

// One person in a party: the first is the guest who replied.
export type PartyMeal = { name: string; meal: string; diet: string };

const tidy = (value: unknown, max: number) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

// The host's list as saved, or null when it isn't a usable list.
export function parseMealOptions(raw: string | undefined | null): string[] | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return null;
    const list = cleanMealOptions(value);
    return list.length ? list : null;
  } catch {
    return null;
  }
}

// Trimmed, no blanks or repeats, at most MEAL_OPTIONS_MAX.
export function cleanMealOptions(values: unknown[]): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const v of values) {
    const name = tidy(v, MEAL_NAME_MAX);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    list.push(name);
  }
  return list.slice(0, MEAL_OPTIONS_MAX);
}

// The meals guests choose from, or null when the host doesn't ask.
export function mealOptionsFromSettings(settings: Record<string, string>, language?: string | null): string[] | null {
  if (settings[MEALS_ON_SETTING] !== 'true') return null;
  return parseMealOptions(settings[MEAL_OPTIONS_SETTING]) ?? defaultMeals(language);
}

// What a guest sent, kept to their party size and the host's meals. Rows
// with nothing chosen or noted still keep the person's name. Returns null
// when there's nothing at all to keep.
export function cleanPartyMeals(input: unknown, partySize: number, options: string[]): PartyMeal[] | null {
  if (!Array.isArray(input)) return null;
  const rows = input.slice(0, partySize).map((row, i) => {
    const r = (row ?? {}) as Record<string, unknown>;
    const meal = tidy(r.meal, MEAL_NAME_MAX);
    return {
      name: i === 0 ? '' : tidy(r.name, PARTY_NAME_MAX), // the first person is the guest themself
      meal: options.includes(meal) ? meal : '',
      diet: tidy(r.diet, DIET_MAX),
    };
  });
  return rows.some((r) => r.meal || r.diet || r.name) ? rows : null;
}

// The saved column (JSONB), defensively.
export function readPartyMeals(value: unknown): PartyMeal[] {
  const rows = typeof value === 'string' ? (() => { try { return JSON.parse(value) as unknown; } catch { return null; } })() : value;
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    name: tidy((r as PartyMeal)?.name, PARTY_NAME_MAX),
    meal: tidy((r as PartyMeal)?.meal, MEAL_NAME_MAX),
    diet: tidy((r as PartyMeal)?.diet, DIET_MAX),
  }));
}

// "Ana" for the guest, "Ana's guest 2" for an unnamed plus-one.
export function personName(guestName: string, meals: PartyMeal[], i: number): string {
  if (i === 0) return guestName;
  return meals[i]?.name || `${guestName} · guest ${i + 1}`;
}

export type MealGuest = { name: string; status: string; guests: number; meals: PartyMeal[]; table?: string };
export type MealSummary = {
  counts: { meal: string; count: number }[]; // the host's meals, then any old ones still chosen
  notChosen: number; // people coming without a meal picked
  people: number;
  diets: { person: string; diet: string; table?: string }[];
};

// Counts for the caterer, from the attending guests only.
export function summarizeMeals(guests: MealGuest[], options: string[]): MealSummary {
  const counts = new Map(options.map((m) => [m, 0]));
  let notChosen = 0;
  let people = 0;
  const diets: MealSummary['diets'] = [];
  for (const g of guests) {
    if (g.status !== 'attending') continue;
    const size = Math.max(1, g.guests || 1);
    for (let i = 0; i < size; i++) {
      people++;
      const row = g.meals[i];
      if (row?.meal) counts.set(row.meal, (counts.get(row.meal) ?? 0) + 1);
      else notChosen++;
      if (row?.diet) diets.push({ person: personName(g.name, g.meals, i), diet: row.diet, table: g.table || undefined });
    }
  }
  return { counts: [...counts].map(([meal, count]) => ({ meal, count })), notChosen, people, diets };
}

// "2 Chicken · 1 Fish", for a table or a party.
export function mealLine(guests: Pick<MealGuest, 'status' | 'guests' | 'meals'>[]): string {
  const counts = new Map<string, number>();
  for (const g of guests) {
    if (g.status === 'not_attending') continue;
    for (const row of g.meals.slice(0, Math.max(1, g.guests || 1))) if (row.meal) counts.set(row.meal, (counts.get(row.meal) ?? 0) + 1);
  }
  return [...counts].map(([meal, n]) => `${n} ${meal}`).join(' · ');
}
