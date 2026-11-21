// Sub-events (Guests & RSVPs → Events): the separate parts of a celebration
// a host invites guests to one by one, e.g. a rehearsal dinner, the wedding
// and a brunch. Stored as JSON in user_page_settings under
// SUB_EVENTS_SETTING. Each guest (event_guests.invited_events, JSONB) lists
// the ids of the ones they're invited to (null: all of them), and their
// reply to each (event_replies: { id: true | false }). Their invitation and
// RSVP show only their events. Client-safe: no server imports.

export const SUB_EVENTS_SETTING = 'sub_events';
export const SUB_EVENTS_MAX = 10;
export const SUB_EVENT_TEXT_MAX = { name: 80, venue: 160 } as const;

export type SubEvent = {
  id: string; // short and stable, e.g. "e3k9"
  name: string;
  date: string; // YYYY-MM-DD, or ''
  time: string; // HH:MM, or ''
  venue: string;
};

export type EventReplies = Record<string, boolean>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const ID_RE = /^[a-z0-9]{2,12}$/;

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

// Any input (the saved JSON, a client payload) as a valid list.
export function parseSubEvents(raw: unknown): SubEvent[] {
  let list: unknown = raw;
  if (typeof raw === 'string') {
    try { list = JSON.parse(raw); } catch { return []; }
  }
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: SubEvent[] = [];
  for (const item of list.slice(0, SUB_EVENTS_MAX)) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const name = clean(r.name, SUB_EVENT_TEXT_MAX.name);
    if (!name) continue;
    let id = typeof r.id === 'string' && ID_RE.test(r.id) ? r.id : newSubEventId();
    while (seen.has(id)) id = newSubEventId();
    seen.add(id);
    out.push({
      id,
      name,
      date: typeof r.date === 'string' && DATE_RE.test(r.date) ? r.date : '',
      time: typeof r.time === 'string' && TIME_RE.test(r.time) ? r.time : '',
      venue: clean(r.venue, SUB_EVENT_TEXT_MAX.venue),
    });
  }
  return out;
}

export const newSubEventId = () => `e${Math.random().toString(36).slice(2, 7)}`;

// The guest's invited events: a list of ids, or null for all of them.
export function parseInvitedEvents(raw: unknown): string[] | null {
  if (raw == null) return null;
  let v: unknown = raw;
  if (typeof raw === 'string') {
    try { v = JSON.parse(raw); } catch { return null; }
  }
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && ID_RE.test(x)) : null;
}

export function parseEventReplies(raw: unknown): EventReplies {
  let v: unknown = raw;
  if (typeof raw === 'string') {
    try { v = JSON.parse(raw); } catch { return {}; }
  }
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out: EventReplies = {};
  for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (ID_RE.test(k) && typeof x === 'boolean') out[k] = x;
  return out;
}

// The events one guest is invited to, in the host's order.
export function eventsForGuest(all: SubEvent[], invited: string[] | null): SubEvent[] {
  if (!invited) return all;
  const set = new Set(invited);
  return all.filter((e) => set.has(e.id));
}

// "Friday, June 11 · 7:00 PM", in the page's language.
export function subEventWhen(e: Pick<SubEvent, 'date' | 'time'>, locale = 'en-US'): string {
  const parts: string[] = [];
  if (e.date) {
    const [y, m, d] = e.date.split('-').map(Number);
    parts.push(new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }));
  }
  if (e.time) {
    const [h, min] = e.time.split(':').map(Number);
    parts.push(new Date(Date.UTC(2000, 0, 1, h, min)).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }));
  }
  return parts.join(' · ');
}

export const localeOf = (language?: string | null) => (language === 'fr' ? 'fr-CA' : language === 'es' ? 'es' : 'en-US');
