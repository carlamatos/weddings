// How a visitor from a landing page wants to start: with an invitation (the
// Christmas and party pages) or a website (weddings), often with a theme
// already chosen. The landing page links to /register?start=invitation&theme=merry;
// the sign-up form keeps it in this browser, and the create-event form reads
// it after the visitor verifies their email and signs in — so the first
// screen is "design your invitation" in the theme they picked.
// Browser storage only: a per-visitor convenience that's fine to lose.

export type StartIntent = { intent: 'invitation' | 'website'; theme?: string };

const KEY = 'mygala:start';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// From /register's query string; null when it says nothing usable.
export function parseStartParams(start?: string | null, theme?: string | null): StartIntent | null {
  if (start !== 'invitation' && start !== 'website') return null;
  return { intent: start, ...(theme && SLUG_RE.test(theme) && theme.length <= 60 ? { theme } : {}) };
}

// Query string for a landing page's sign-up links.
export function startQuery(intent: StartIntent['intent'], theme?: string): string {
  return `?start=${intent}${theme ? `&theme=${theme}` : ''}`;
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
    return parseStartParams(raw.intent, raw.theme);
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
