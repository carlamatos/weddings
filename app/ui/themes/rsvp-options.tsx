'use client';

import { createContext, useContext } from 'react';

// Page-level RSVP options for the RSVP form, without passing them through
// every theme. guestListOnly: only guests on the host's guest list can
// reply, matched by email (app/api/rsvp). meals: the host's meal choices
// (app/lib/rsvp-meals.ts), or null when the host doesn't ask. giftExchange:
// the page's Gift Exchange is open for sign-ups, so attending guests can join
// it from the RSVP form. askSong: the free "a song for the dance floor"
// question (app/lib/rsvp-song.ts).
type RsvpOptions = { guestListOnly: boolean; meals: string[] | null; giftExchange?: boolean; askSong?: boolean };

const Ctx = createContext<RsvpOptions>({ guestListOnly: false, meals: null, giftExchange: false, askSong: false });

export function RsvpOptionsProvider({ guestListOnly, meals, giftExchange = false, askSong = false, children }: RsvpOptions & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ guestListOnly, meals, giftExchange, askSong }}>{children}</Ctx.Provider>;
}

export function useRsvpOptions() {
  return useContext(Ctx);
}
