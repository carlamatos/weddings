'use client';

import { defaultInvitation, googleFontsHref } from '../lib/invitation';
import { InvitationCard } from './dashboard/invitation-card';
import { eventWhen } from './themes/event-when';
import { themeCard } from './theme-picker';

// Previews of the chosen theme, for the create-event form's step 2 and
// /design-your-invitation: the invitation in its starting design with the
// event's name and date, and the whole event page in a phone, which scrolls
// while the pointer is over it (swipe on touch screens).
// nameAs: see InvitationCard.
export function StylePreviews({ themeSlug, eventName, eventDate, nameAs }: { themeSlug: string; eventName: string; eventDate: string; nameAs?: 'h2' | 'p' }) {
  const design = defaultInvitation(themeSlug);
  const card = themeCard(themeSlug);
  const details = {
    name: eventName.trim() || card?.sample.heading || 'Your event',
    date: eventWhen({ eventDate: eventDate || card?.sample.eventDate }, 'en-US').date,
    time: '',
    venue: '',
    address: '',
    url: '',
  };
  return (
    <>
      <link rel="stylesheet" href={googleFontsHref([design.headingFont, design.bodyFont])} />
      <figure className="setup-preview">
        <figcaption>Your invitation</figcaption>
        <InvitationCard design={{ ...design, showQr: false }} details={details} nameAs={nameAs} />
      </figure>
      <figure className="setup-preview">
        <figcaption>Your website</figcaption>
        <div className="setup-phone">
          <div className="setup-phone__screen" tabIndex={0} aria-label={`${card?.name ?? 'Theme'}: picture of the whole page`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/theme-pages/${themeSlug}.webp`} alt={`The ${card?.name ?? ''} theme, the whole page`} width={520} decoding="async" />
          </div>
          <span className="setup-phone__hint" aria-hidden="true" />
        </div>
      </figure>
    </>
  );
}
