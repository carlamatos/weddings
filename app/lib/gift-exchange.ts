// Plus: the Gift Exchange (Secret Santa) section. Guests join on the event
// page (or the host adds them); the host draws names and each participant is
// told — by email, or by a private link sent as a text/WhatsApp message from
// the host's phone — who they're buying a gift for. Shared by the API, the
// dashboard and the themes, so no server-only imports.
//
// Settings (user_page_settings):
//   show_gift_exchange      the section is on the page — OFF unless 'true'
//   gift_exchange_budget    e.g. "$25"
//   gift_exchange_date      when gifts are exchanged, e.g. "December 19, at the party"
//   gift_exchange_note      the host's message to participants

export const GIFT_NAME_MAX = 120;
export const GIFT_WISHLIST_MAX = 500;
export const GIFT_BUDGET_MAX = 60;
export const GIFT_DATE_MAX = 80;
export const GIFT_NOTE_MAX = 600;
export const GIFT_MAX_PARTICIPANTS = 200;
// With fewer, someone could work out who drew whom.
export const GIFT_MIN_TO_DRAW = 3;

export const GIFT_SETTINGS = {
  budget: 'gift_exchange_budget',
  exchangeDate: 'gift_exchange_date',
  note: 'gift_exchange_note',
} as const;

export type GiftExchangeDetails = { budget: string; exchangeDate: string; note: string };

// What a theme gets: the signed page token for joining, the host's details,
// how many have joined, and whether names have been drawn (sign-ups close).
export type GiftExchangeProps = {
  token: string;
  details: GiftExchangeDetails;
  participantCount: number;
  drawn: boolean;
};

export type GiftParticipant = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  wishlist: string | null;
  guest_id: string | null;
  giftee_id: number | null;
  notified_at: string | null;
  notified_via: 'email' | 'sms' | 'whatsapp' | null;
  created_at: string;
};

export function isGiftExchangeOn(settings: Record<string, string>): boolean {
  return settings['show_gift_exchange'] === 'true';
}

export function giftExchangeDetails(settings: Record<string, string>): GiftExchangeDetails {
  return {
    budget: settings[GIFT_SETTINGS.budget] ?? '',
    exchangeDate: settings[GIFT_SETTINGS.exchangeDate] ?? '',
    note: settings[GIFT_SETTINGS.note] ?? '',
  };
}

// The draw: shuffle everyone, then each person gives to the next one around
// the circle (the last gives to the first). One single loop means nobody ever
// draws themselves, everyone gives and receives exactly one gift, and — with
// three or more people — no two people draw each other.
// randomInt(max) must return an integer in [0, max): pass crypto.randomInt.
export function drawCycle<T>(ids: T[], randomInt: (max: number) => number): Map<T, T> {
  if (ids.length < 2) throw new Error('At least two participants are needed.');
  const order = [...ids];
  for (let i = order.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const pairs = new Map<T, T>();
  order.forEach((giver, i) => pairs.set(giver, order[(i + 1) % order.length]));
  return pairs;
}
