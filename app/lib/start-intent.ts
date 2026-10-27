// How a visitor from a landing page wants to start: with an invitation (the
// Christmas and party pages) or a website (weddings), often with a theme
// already chosen. The landing page links to /register?start=invitation&theme=merry;
// the sign-up form keeps it in this browser, and the create-event form reads
// it after the visitor verifies their email and signs in — so the first
// screen is "design your invitation" in the theme they picked. The occasion
// (the wedding or Christmas landing page) puts its themes first in the
// theme gallery. The "design your invitation" page (/design-your-invitation)
// also sends the event's name and date typed there, so the create-event form
// starts filled in.
// Browser storage only: a per-visitor convenience that's fine to lose.

export type StartOccasion = 'wedding' | 'christmas';
export type StartIntent = { intent: 'invitation' | 'website'; theme?: string; occasion?: StartOccasion; name?: string; date?: string };
export type StartDetails = { name?: string | null; date?: string | null };

const KEY = 'mygala:start';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const START_NAME_MAX = 200; // the create-event form's limit

// From /register's query string; null when it says nothing usable.
export function parseStartParams(start?: string | null, theme?: string | null, occasion?: string | null, details?: StartDetails): StartIntent | null {
  if (start !== 'invitation' && start !== 'website') return null;
  const name = typeof details?.name === 'string' ? details.name.trim().slice(0, START_NAME_MAX) : '';
  const date = typeof details?.date === 'string' && DATE_RE.test(details.date) && !Number.isNaN(Date.parse(details.date)) ? details.date : '';
  return {
    intent: start,
    ...(theme && SLUG_RE.test(theme) && theme.length <= 60 ? { theme } : {}),
    ...(occasion === 'wedding' || occasion === 'christmas' ? { occasion } : {}),
    ...(name ? { name } : {}),
    ...(date ? { date } : {}),
  };
}

// Query string for a landing page's sign-up links.
export function startQuery(intent: StartIntent['intent'], theme?: string, occasion?: StartOccasion, details?: StartDetails): string {
  const q = new URLSearchParams({ start: intent });
  if (theme) q.set('theme', theme);
  if (occasion) q.set('occasion', occasion);
  if (details?.name?.trim()) q.set('name', details.name.trim().slice(0, START_NAME_MAX));
  if (details?.date) q.set('date', details.date);
  return `?${q}`;
}

export function saveStartIntent(value: StartIntent) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...value, at: Date.now() }));
  } catch {
    // Private browsing or storage blocked: the visitor just starts normally.
  }
}

export function readStartIntent(): StartIntent | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as (StartIntent & { at?: number }) | null;
    if (!raw || typeof raw.at !== 'number' || Date.now() - raw.at > MAX_AGE_MS) return null;
    return parseStartParams(raw.intent, raw.theme, raw.occasion, { name: raw.name, date: raw.date });
  } catch {
    return null;
  }
}

export function clearStartIntent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
