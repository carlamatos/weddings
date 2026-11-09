'use client';

import { createContext, useContext } from 'react';

// Page-level RSVP options for the RSVP form, without passing them through
// every theme. guestListOnly: only guests on the host's guest list can
// reply, matched by email (app/api/rsvp). meals: the host's meal choices
// (app/lib/rsvp-meals.ts), or null when the host doesn't ask.
type RsvpOptions = { guestListOnly: boolean; meals: string[] | null };

const Ctx = createContext<RsvpOptions>({ guestListOnly: false, meals: null });

export function RsvpOptionsProvider({ guestListOnly, meals, children }: RsvpOptions & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ guestListOnly, meals }}>{children}</Ctx.Provider>;
}

export function useRsvpOptions() {
  return useContext(Ctx);
}
