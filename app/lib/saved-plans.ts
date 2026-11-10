// Plans saved from the free planning tools (/wedding-budget-calculator,
// /rsvp-deadline-calculator, /guest-count-planner) to an event page with
// "Save to my MyGala". The budget becomes the dashboard's budget tracker,
// the RSVP dates its planning timeline (with reminder emails to the host),
// and the guest count plan shows in Guests & RSVPs. A plan travels as the
// tool's share link (#budget=…), so a saved plan reopens in its tool.
// Shared by client and server, so no server-only imports (the database side
// is in saved-plans-data.ts).

import { BUDGET_CATEGORIES, parseBudgetHash, splitBudget } from './marketing/wedding-budget';
import { parseRsvpHash, type RsvpEventType } from './marketing/rsvp-deadline';
import { estimateGuests, parseGuestHash, type Travel } from './marketing/guest-count';
import { DEFAULT_CURRENCY, isCurrency, type Currency } from './marketing/tool-money';

export type PlanTool = 'budget' | 'rsvp' | 'guests';

export const PLAN_TOOLS: Record<PlanTool, { name: string; toolPath: string; screen: string; thing: string }> = {
  budget: { name: 'Wedding budget calculator', toolPath: '/wedding-budget-calculator', screen: '/budget', thing: 'budget' },
  rsvp: { name: 'RSVP deadline calculator', toolPath: '/rsvp-deadline-calculator', screen: '/timeline', thing: 'RSVP timeline' },
  guests: { name: 'Guest count planner', toolPath: '/guest-count-planner', screen: '/guest-list', thing: 'guest count plan' },
};

// The tool's share link without its "#": budget=30000.120.CAD.food.
export type PlanLink = { tool: PlanTool; hash: string };

export function parsePlanLink(value: string | null | undefined): PlanLink | null {
  if (typeof value !== 'string' || value.length > 600) return null;
  const hash = `#${value.replace(/^#/, '')}`;
  if (parseBudgetHash(hash)) return { tool: 'budget', hash };
  if (parseRsvpHash(hash)) return { tool: 'rsvp', hash };
  if (parseGuestHash(hash)) return { tool: 'guests', hash };
  return null;
}

// ?plan=… for the save screen and sign-up.
export function planParam(hash: string): string {
  return encodeURIComponent(hash.replace(/^#/, ''));
}

// ── The budget tracker ──────────────────────────────────────────────────

export type BudgetLine = {
  id: string; // a calculator category, or c-… for one the host added
  label: string;
  estimate: number;
  actual: number; // spent so far
  deposit: number; // the next payment due (0 = none)
  due: string; // YYYY-MM-DD or ''
  paid: boolean; // that payment is made
  note: string;
};

export type BudgetPlan = { total: number; guests: number; currency: Currency; lines: BudgetLine[]; hash?: string; sent?: string[] };

export const BUDGET_LINES_MAX = 40;
export const BUDGET_LABEL_MAX = 60;
export const BUDGET_NOTE_MAX = 200;
export const BUDGET_AMOUNT_MAX = 99_999_999;

const amount = (v: unknown) => Math.min(BUDGET_AMOUNT_MAX, Math.max(0, Math.round((Number(v) || 0) * 100) / 100));
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const day = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');

// A budget as the calculator split it; what the host already entered for a
// category (spent, deposits, notes) and the lines they added are kept.
export function budgetFromHash(hash: string, previous?: BudgetPlan | null): BudgetPlan | null {
  const p = parseBudgetHash(hash);
  if (!p) return null;
  const old = new Map((previous?.lines ?? []).map((l) => [l.id, l]));
  const lines: BudgetLine[] = splitBudget(p.total, p.priorities, p.skipped)
    .filter((l) => !l.skipped || old.has(l.id))
    .map((l) => ({ ...(old.get(l.id) ?? { actual: 0, deposit: 0, due: '', paid: false, note: '' }), id: l.id, label: l.label, estimate: Math.round(l.amount) }));
  const custom = (previous?.lines ?? []).filter((l) => l.id.startsWith('c-'));
  return { total: p.total, guests: p.guests, currency: isCurrency(p.currency) ? p.currency : DEFAULT_CURRENCY, lines: [...lines, ...custom], hash, sent: previous?.sent };
}

// A budget the host starts in the dashboard: the typical split of a total.
export function blankBudget(total: number, currency: Currency = DEFAULT_CURRENCY): BudgetPlan {
  return budgetFromHash(`#budget=${Math.round(total)}.100.${currency}..`)!;
}

// What the tracker sends to be saved, checked field by field.
export function cleanBudget(input: unknown): BudgetPlan | null {
  const b = (input ?? {}) as Record<string, unknown>;
  if (!Array.isArray(b.lines)) return null;
  const ids = new Set(BUDGET_CATEGORIES.map((c) => c.id));
  const seen = new Set<string>();
  const lines: BudgetLine[] = [];
  for (const raw of b.lines.slice(0, BUDGET_LINES_MAX)) {
    const l = (raw ?? {}) as Record<string, unknown>;
    const id = typeof l.id === 'string' && (ids.has(l.id) || /^c-[a-z0-9]{1,16}$/.test(l.id)) ? l.id : '';
    if (!id || seen.has(id)) continue;
    seen.add(id);
    lines.push({
      id, label: text(l.label, BUDGET_LABEL_MAX) || 'Untitled', estimate: amount(l.estimate), actual: amount(l.actual),
      deposit: amount(l.deposit), due: day(l.due), paid: l.paid === true, note: text(l.note, BUDGET_NOTE_MAX),
    });
  }
  const currency = typeof b.currency === 'string' && isCurrency(b.currency) ? b.currency : DEFAULT_CURRENCY;
  return { total: amount(b.total), guests: Math.min(5000, Math.max(0, Math.round(Number(b.guests) || 0))), currency, lines };
}

export function readBudget(data: unknown): BudgetPlan | null {
  const plan = cleanBudget(data);
  if (!plan) return null;
  const d = data as { hash?: unknown; sent?: unknown };
  return { ...plan, hash: typeof d.hash === 'string' ? d.hash : undefined, sent: Array.isArray(d.sent) ? d.sent.filter((s): s is string => typeof s === 'string') : [] };
}

export function budgetTotals(plan: BudgetPlan) {
  const estimated = plan.lines.reduce((n, l) => n + l.estimate, 0);
  const spent = plan.lines.reduce((n, l) => n + l.actual, 0);
  return { estimated, spent, left: plan.total - spent, overBy: Math.max(0, spent - plan.total) };
}

// Payments still to make, soonest first.
export function depositsDue(plan: BudgetPlan): BudgetLine[] {
  return plan.lines.filter((l) => l.deposit > 0 && l.due && !l.paid).sort((a, b) => a.due.localeCompare(b.due));
}

// ── The RSVP timeline ───────────────────────────────────────────────────

export type RsvpTimelinePlan = {
  eventDate: string; type: RsvpEventType; finalCountDays: number; seating: boolean;
  reminders: boolean; // email the host on each date
  done: string[]; // step ids ticked off
  sent: string[]; // "stepId:date" already emailed
  hash: string;
};

export function rsvpTimelineFromHash(hash: string, previous?: RsvpTimelinePlan | null): RsvpTimelinePlan | null {
  const p = parseRsvpHash(hash);
  if (!p) return null;
  return { ...p, reminders: previous?.reminders ?? true, done: previous?.done ?? [], sent: previous?.sent ?? [], hash };
}

export function readRsvpTimeline(data: unknown): RsvpTimelinePlan | null {
  const d = (data ?? {}) as Partial<RsvpTimelinePlan>;
  const base = typeof d.hash === 'string' ? rsvpTimelineFromHash(d.hash) : null;
  if (!base) return null;
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, 100) : []);
  return { ...base, reminders: d.reminders !== false, done: list(d.done), sent: list(d.sent) };
}

// ── The guest count plan ────────────────────────────────────────────────

export type GuestCountPlan = {
  hash: string; travel: Travel; capacity: number; invited: number; expected: number; low: number; high: number;
};

export function guestPlanFromHash(hash: string): GuestCountPlan | null {
  const p = parseGuestHash(hash);
  if (!p) return null;
  const e = estimateGuests(p.counts, p.rates, p.travel);
  return { hash, travel: p.travel, capacity: p.capacity, invited: e.invited, expected: e.expected, low: e.low, high: e.high };
}

export function readGuestPlan(data: unknown): GuestCountPlan | null {
  const d = (data ?? {}) as { hash?: unknown };
  return typeof d.hash === 'string' ? guestPlanFromHash(d.hash) : null;
}

// ── Carrying a plan through sign-up ─────────────────────────────────────
// Someone who saves a plan before they have an account signs up first; the
// plan waits in this browser until they're in the dashboard, which offers
// to save it to their event. Browser storage only: fine to lose.

const PENDING_KEY = 'mygala:plan';
const PENDING_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function savePendingPlan(link: PlanLink) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify({ hash: link.hash, at: Date.now() })); } catch { /* storage blocked */ }
}

export function readPendingPlan(): PlanLink | null {
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING_KEY) ?? 'null') as { hash?: string; at?: number } | null;
    if (!raw || typeof raw.at !== 'number' || Date.now() - raw.at > PENDING_MAX_AGE_MS) return null;
    return parsePlanLink(raw.hash);
  } catch {
    return null;
  }
}

export function clearPendingPlan() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* storage blocked */ }
}
