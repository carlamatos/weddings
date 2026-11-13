'use client';

import { createContext, useContext } from 'react';

// Page-level Live Party options for the shared sections, without passing them
// through every theme (like rsvp-options.tsx). messagesOn: guests can leave a
// message on the live wall from the photo section (app/lib/guest-messages.ts).
type LiveOptions = { messagesOn: boolean; language: string };

const Ctx = createContext<LiveOptions>({ messagesOn: false, language: 'en' });

export function LiveOptionsProvider({ messagesOn, language, children }: LiveOptions & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ messagesOn, language }}>{children}</Ctx.Provider>;
}

export function useLiveOptions() {
  return useContext(Ctx);
}
