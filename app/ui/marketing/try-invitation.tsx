'use client';

import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { appHref } from '@/app/lib/app-url';
import { START_NAME_MAX, startQuery, type StartOccasion } from '@/app/lib/start-intent';
import { CATEGORY_LABELS, ThemePicker, occasionThemes, themeCard } from '@/app/ui/theme-picker';
import { StylePreviews } from '@/app/ui/style-previews';

// /design-your-invitation: try an invitation before signing up. Pick a
// theme, type the event's name and date, and see the invitation and the
// website in that theme. Nothing is saved here: "Save my invitation" takes
// the choices to sign-up in its address (app/lib/start-intent.ts), and the
// create-event form starts with them after the visitor signs in. A host who
// is already signed in goes straight to that form.
// occasion: Christmas (/design-your-christmas-invitation) words it for a
// party and lists the Christmas themes first, here and in the create-event
// form's gallery.
const TEXT = {
  default: {
    heading: 'Design your invitation',
    sub: 'Pick a design, add the name and the date, and see your invitation and its matching website. No account needed to try it.',
    example: 'Sofia & James',
  },
  christmas: {
    heading: 'Design your Christmas invitation',
    sub: 'Pick a festive design, add your party’s name and date, and see your invitation and its matching party page. No account needed to try it.',
    example: 'The Smiths’ Christmas Party',
  },
} as const;

export function TryInvitation({ initialTheme, isLoggedIn, occasion }: { initialTheme: string; isLoggedIn: boolean; occasion?: StartOccasion }) {
  const t = occasion === 'christmas' ? TEXT.christmas : TEXT.default;
  const [themeSlug, setThemeSlug] = useState(initialTheme);
  const [picking, setPicking] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const card = themeCard(themeSlug);

  const href = appHref(isLoggedIn ? '/dashboard/setup' : '/register')
    + startQuery('invitation', themeSlug, occasion, { name: eventName, date: eventDate });

  return (
    <div className="auth-card setup-card--wide try-invite__card">
      <h1 className="auth-heading">{t.heading}</h1>
      <p className="auth-subheading">{t.sub}</p>

      <div className="setup-style">
        <div className="setup-style__form">
          <div className="auth-field">
            <p className="auth-label">Design</p>
            <div className="setup-chosen-theme__row try-invite__theme">
              <span>
                <strong>{card?.name}</strong>
                {card && <span className="setup-chosen-theme__cat">{CATEGORY_LABELS[card.category]}</span>}
              </span>
              <button type="button" className="setup-theme-change" onClick={() => setPicking(true)}>
                Change design
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="tryEventName">Event name</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="tryEventName" type="text" value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder={`e.g. ${occasion === 'christmas' ? t.example : card?.sample.heading ?? t.example}`} maxLength={START_NAME_MAX} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="tryEventDate">Event date</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="tryEventDate" type="date" value={eventDate}
                onChange={(e) => setEventDate(e.target.value)} />
            </div>
          </div>

          <a className="auth-btn try-invite__save" href={href} data-cta="try-invitation">
            Save my invitation <ArrowRightIcon style={{ width: 16, height: 16 }} />
          </a>
          <p className="auth-address-hint" style={{ textAlign: 'center', marginTop: 10 }}>
            {isLoggedIn
              ? 'Next, choose your page address. Then add the time and place and share it.'
              : 'Free to start, no credit card. Create your account to save it, then add the time and place and share it.'}
          </p>
        </div>

        {card && (
          <div className="setup-style__previews">
            <StylePreviews themeSlug={card.slug} eventName={eventName} eventDate={eventDate} />
            <p className="setup-style__note">After you sign up you can change the colours, fonts, wording and photos of both.</p>
          </div>
        )}
      </div>

      <ThemePicker open={picking} selected={themeSlug} onChoose={(slug) => { setThemeSlug(slug); setPicking(false); }} onClose={() => setPicking(false)} first={occasionThemes(occasion)} />
    </div>
  );
}
