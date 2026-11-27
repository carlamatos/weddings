'use client';

import { createContext, useContext } from 'react';
import type { RsvpFormOptions } from '@/app/lib/rsvp-form-options';

// Page-level RSVP options for the RSVP form, without passing them through
// every theme. guestListOnly: only guests on the host's guest list can
// reply, matched by email (app/api/rsvp). meals: the host's meal choices
// (app/lib/rsvp-meals.ts), or null when the host doesn't ask. giftExchange:
// the page's Gift Exchange is open for sign-ups, so attending guests can join
// it from the RSVP form. askSong: the free "a song for the dance floor"
// question (app/lib/rsvp-song.ts). form: one person per reply, and the
// host's wording for accept / decline and the note box (app/lib/rsvp-form-options.ts).
// ownPage: on a free page's guest view, the sign-up links for "make your own"
// shown after an RSVP (rsvp) or a Secret Santa sign-up (santa); null elsewhere.
export type OwnPageLinks = { rsvp: string; santa: string };
type RsvpOptions = { guestListOnly: boolean; meals: string[] | null; giftExchange?: boolean; askSong?: boolean; form?: RsvpFormOptions; ownPage?: OwnPageLinks | null };

const NO_FORM_OPTIONS: RsvpFormOptions = { onePerson: false, acceptText: '', declineText: '', noteLabel: '', notePlaceholder: '', partyNamesRequired: false, askPhone: true };
const Ctx = createContext<RsvpOptions>({ guestListOnly: false, meals: null, giftExchange: false, askSong: false, form: NO_FORM_OPTIONS });

export function RsvpOptionsProvider({ guestListOnly, meals, giftExchange = false, askSong = false, form = NO_FORM_OPTIONS, ownPage = null, children }: RsvpOptions & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ guestListOnly, meals, giftExchange, askSong, form, ownPage }}>{children}</Ctx.Provider>;
}

// "Planning your own party? Make a free page like this one →", under a
// guest's confirmation. Opens MyGala's sign-up in a new tab.
export function OwnPageLine({ ask, link, href }: { ask: string; link: string; href: string }) {
  return (
    <p className="rsvp-sub" style={{ margin: '18px 0 0', fontSize: '0.9em', lineHeight: 1.6, opacity: 0.85 }}>
      {ask}{' '}
      <a href={href} target="_blank" rel="noopener" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>
        {link} →
      </a>
    </p>
  );
}

export function useRsvpOptions() {
  return useContext(Ctx);
}
