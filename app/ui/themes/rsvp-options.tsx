'use client';

import { createContext, useContext } from 'react';

// Page-level RSVP options for the RSVP form, without passing them through
// every theme. guestListOnly: only guests on the host's guest list can
// reply, matched by email (app/api/rsvp).
type RsvpOptions = { guestListOnly: boolean };

const Ctx = createContext<RsvpOptions>({ guestListOnly: false });

export function RsvpOptionsProvider({ guestListOnly, children }: RsvpOptions & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ guestListOnly }}>{children}</Ctx.Provider>;
}

export function useRsvpOptions() {
  return useContext(Ctx);
}
