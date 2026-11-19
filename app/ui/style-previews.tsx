'use client';

import { useEffect, useState } from 'react';
import { defaultInvitation, googleFontsHref } from '../lib/invitation';
import { InvitationCard } from './dashboard/invitation-card';
import { RsvpPreview } from './rsvp-preview';
import { eventWhen } from './themes/event-when';
import { themeCard } from './theme-picker';

// Previews of the chosen theme, for the create-event form's step 2 and
// /design-your-invitation: the invitation in its starting design with the
// event's name and date, and the whole event page in a phone, which scrolls
// while the pointer is over it (swipe on touch screens).
// nameAs: see InvitationCard. live: the website is the theme's real page
// with this name and date (app/(frame)/theme-preview) instead of its
// picture. websiteFirst: the website before the invitation. rsvp: the RSVP
// form guests fill in, in place of the invitation (the party try page).
// language: the page's language (the create-event form's choice) for the
// captions, the invitation's wording and the date.
const CAPTIONS = {
  en: { rsvp: 'Your RSVP form', invitation: 'Your invitation', website: 'Your website', event: 'Your event', locale: 'en-US' },
  fr: { rsvp: 'Votre formulaire RSVP', invitation: 'Votre invitation', website: 'Votre site web', event: 'Votre événement', locale: 'fr-CA' },
  es: { rsvp: 'Tu formulario de RSVP', invitation: 'Tu invitación', website: 'Tu sitio web', event: 'Tu evento', locale: 'es-ES' },
} as const;

export function StylePreviews({ themeSlug, eventName, eventDate, nameAs, live = false, websiteFirst = false, rsvp = false, language = 'en' }: {
  themeSlug: string; eventName: string; eventDate: string; nameAs?: 'h2' | 'p'; live?: boolean; websiteFirst?: boolean; rsvp?: boolean; language?: string;
}) {
  const words = CAPTIONS[language === 'fr' || language === 'es' ? language : 'en'];
  const design = defaultInvitation(themeSlug, language);
  const card = themeCard(themeSlug);
  const details = {
    name: eventName.trim() || card?.sample.heading || words.event,
    date: eventWhen({ eventDate: eventDate || card?.sample.eventDate }, words.locale).date,
    time: '',
    venue: '',
    address: '',
    url: '',
  };
  const invitation = rsvp ? (
    <figure className="setup-preview setup-preview--invitation setup-preview--rsvp" key="invitation">
      <figcaption>{words.rsvp}</figcaption>
      <div role="img" aria-label={`The RSVP form on your website: ${details.name}`}>
        <RsvpPreview design={design} name={details.name} date={details.date} />
      </div>
    </figure>
  ) : (
    <figure className="setup-preview setup-preview--invitation" key="invitation">
      <figcaption>{words.invitation}</figcaption>
      <InvitationCard design={{ ...design, showQr: false }} details={details} nameAs={nameAs} />
    </figure>
  );
  const website = (
    <figure className="setup-preview setup-preview--website" key="website">
      <figcaption>{words.website}</figcaption>
      {live ? (
        <LiveWebsite themeSlug={themeSlug} eventName={eventName} eventDate={eventDate} label={`${card?.name ?? 'Theme'}: your website`} />
      ) : (
        <div className="setup-phone">
          <div className="setup-phone__screen" tabIndex={0} aria-label={`${card?.name ?? 'Theme'}: picture of the whole page`}>
            {/* In the page's language (scripts/theme-page-shots.mjs --fr / --es); the English picture if that one is missing. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${themeSlug}-${language}`}
              src={`/images/theme-pages/${language === 'fr' || language === 'es' ? `${language}/` : ''}${themeSlug}.webp`}
              onError={(e) => { const en = `/images/theme-pages/${themeSlug}.webp`; if (!e.currentTarget.src.endsWith(en)) e.currentTarget.src = en; }}
              alt={`The ${card?.name ?? ''} theme, the whole page`} width={520} decoding="async"
            />
          </div>
          <span className="setup-phone__hint" aria-hidden="true" />
        </div>
      )}
    </figure>
  );
  return (
    <>
      <link rel="stylesheet" href={googleFontsHref([design.headingFont, design.bodyFont])} />
      {websiteFirst ? [website, invitation] : [invitation, website]}
    </>
  );
}

// The theme's page in a phone, as a phone shows it (390px wide, scaled to
// fit), with the typed name and date. It reloads once typing pauses; the
// page already showing stays until the new one has loaded, so it doesn't
// flash. It scrolls like a phone, without a scrollbar; the line under it
// says so.
function LiveWebsite({ themeSlug, eventName, eventDate, label }: { themeSlug: string; eventName: string; eventDate: string; label: string }) {
  const src = (name: string, date: string) => {
    const q = new URLSearchParams();
    if (name.trim()) q.set('name', name.trim());
    if (date) q.set('date', date);
    const qs = q.toString();
    return `/theme-preview/${themeSlug}${qs ? `?${qs}` : ''}`;
  };
  const wanted = src(eventName, eventDate);
  // Two frames: the one showing, and the next one loading behind it.
  const [frames, setFrames] = useState<{ shown: string; loading: string | null }>({ shown: wanted, loading: null });
  useEffect(() => {
    if (wanted === frames.shown || wanted === frames.loading) return;
    // A new theme straight away; typing after a pause.
    const sameTheme = frames.shown.split('?')[0] === wanted.split('?')[0];
    const timer = setTimeout(() => setFrames((f) => ({ ...f, loading: wanted })), sameTheme ? 700 : 0);
    return () => clearTimeout(timer);
  }, [wanted, frames.shown, frames.loading]);
  return (
    <>
      <div className="setup-phone setup-phone--live">
        <div className="setup-phone__screen">
          <iframe key={frames.shown} src={frames.shown} title={label} className="setup-phone__frame" loading="lazy" />
          {frames.loading && (
            <iframe key={frames.loading} src={frames.loading} title={label} className="setup-phone__frame setup-phone__frame--next" aria-hidden="true"
              onLoad={() => setFrames((f) => (f.loading ? { shown: f.loading, loading: null } : f))} />
          )}
        </div>
      </div>
      <p className="setup-phone__caption" aria-hidden="true" />
    </>
  );
}
