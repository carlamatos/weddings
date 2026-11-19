// "What are you planning?": the first question of the create-event form
// (app/ui/subscribe-form.tsx), required before the name and date. The answer
// picks the starting theme (unless the host already chose one that suits it),
// the sections the page starts with, and the setup checklist's steps; it's
// kept on the page (user_page_settings 'event_goal') for the admin Activity
// tab and sent to Google Analytics with "event_page_created".
// Shared by the form and the server, so no server-only imports.

export const EVENT_GOALS = [
  'wedding',
  'birthday',
  'baby-shower',
  'christmas-party',
  'secret-santa',
  'new-years',
  'business',
  'other',
] as const;
export type EventGoal = (typeof EVENT_GOALS)[number];

export const EVENT_GOAL_SETTING = 'event_goal';

// For the admin screens and emails (English only).
export const GOAL_ADMIN_LABELS: Record<string, string> = {
  wedding: 'Wedding', birthday: 'Birthday', 'baby-shower': 'Baby shower', 'christmas-party': 'Christmas party',
  'secret-santa': 'Secret Santa', 'new-years': 'New Year’s party', business: 'Business event', other: 'Something else',
};

export function isEventGoal(v: unknown): v is EventGoal {
  return typeof v === 'string' && (EVENT_GOALS as readonly string[]).includes(v);
}

type GoalRule = {
  // user_page.event_type (the create action's categories).
  eventType: 'wedding' | 'birthdays' | 'business' | 'community';
  // The starting theme when the host hasn't chosen one that suits.
  theme: string;
  // Themes that suit (a landing page's or browsed theme is kept if it's one);
  // null: any theme.
  fits: ((slug: string, category: string) => boolean) | null;
  // The Gift Registry starts on (it's on by default for every page).
  registry: boolean;
  // Secret Santa without a party: the Gift Exchange on and the RSVP off, so
  // the banner's RSVP button becomes "Gift Exchange".
  giftDrawOnly?: boolean;
  // The form offers "Add a Secret Santa gift exchange" (keeps the RSVP).
  offersGiftExchange?: boolean;
};

const CHRISTMAS = ['christmas-party', 'merry', 'white-christmas', 'gnomes'];

export const GOAL_RULES: Record<EventGoal, GoalRule> = {
  wedding: { eventType: 'wedding', theme: 'the-day', fits: (_s, c) => c === 'wedding', registry: true },
  birthday: { eventType: 'birthdays', theme: 'balloons', fits: (s, c) => c === 'birthdays' && !s.startsWith('baby-shower'), registry: true },
  'baby-shower': { eventType: 'birthdays', theme: 'baby-shower-neutral', fits: (s) => s.startsWith('baby-shower'), registry: true },
  'christmas-party': { eventType: 'community', theme: 'christmas-party', fits: (s) => CHRISTMAS.includes(s), registry: false, offersGiftExchange: true },
  'secret-santa': { eventType: 'community', theme: 'christmas-party', fits: (s) => CHRISTMAS.includes(s), registry: false, giftDrawOnly: true },
  'new-years': { eventType: 'community', theme: 'new-years-eve', fits: (s) => s === 'new-years-eve' || s === 'fireworks', registry: false },
  business: { eventType: 'business', theme: 'nexus', fits: (_s, c) => c === 'business', registry: false },
  other: { eventType: 'community', theme: 'simple', fits: null, registry: false },
};

// The theme a new page starts with: the host's own choice if it suits the
// goal, else the goal's theme.
export function themeForGoal(goal: EventGoal, chosen: { slug: string; category: string } | null): string {
  const rule = GOAL_RULES[goal];
  if (chosen && (!rule.fits || rule.fits(chosen.slug, chosen.category))) return chosen.slug;
  return rule.theme;
}

// The goal a landing page or a browsed theme suggests (highlighted on the
// question; the host still picks).
export function suggestedGoal(hint: { intent?: string; occasion?: string; theme?: { slug: string; category: string } | null }): EventGoal | null {
  if (hint.intent === 'secret-santa') return 'secret-santa';
  if (hint.occasion === 'wedding') return 'wedding';
  if (hint.occasion === 'christmas') return 'christmas-party';
  const t = hint.theme;
  if (t) {
    for (const goal of ['wedding', 'baby-shower', 'christmas-party', 'new-years', 'business', 'birthday'] as const) {
      const fits = GOAL_RULES[goal].fits;
      if (fits && fits(t.slug, t.category)) return goal;
    }
  }
  if (hint.occasion === 'celebration') return 'birthday';
  return null;
}
