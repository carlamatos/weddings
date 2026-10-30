'use client';

import { useRef, useState } from 'react';
import { ArrowRightIcon, SwatchIcon } from '@heroicons/react/20/solid';
import { appHref } from '@/app/lib/app-url';
import { START_NAME_MAX, startQuery, type StartOccasion } from '@/app/lib/start-intent';
import { CATEGORY_LABELS, ThemePicker, occasionThemes, themeCard } from '@/app/ui/theme-picker';
import { StylePreviews } from '@/app/ui/style-previews';
import { TrySignup } from './try-signup';
import { AuthDateInput } from '@/app/ui/auth-date-input';

// /design-your-invitation: try an invitation before signing up. Pick a
// theme, type the event's name and date, and see the invitation and the
// website in that theme. Nothing is saved here: "Save my invitation" takes
// the choices to sign-up in its address (app/lib/start-intent.ts), and the
// create-event form starts with them after the visitor signs in. A host who
// is already signed in goes straight to that form.
// text: the page's heading, intro and example name
// (app/lib/marketing/try-invitation.ts). occasion: Christmas lists the
// Christmas themes first, here and in the create-event form's gallery.
// intent: what the new event opens on after sign-up (start-intent.ts).
// inlineSignup: "Save" opens the sign-up step right here (try-signup.tsx)
// instead of the sign-up page; then the name and date are required.
// liveWebsite / websiteFirst: see StylePreviews.
export type TryText = {
  intent: 'invitation' | 'website'; saveLabel: string; eyebrow: string; h1: string; intro: string; example: string;
  nameLabel?: string; dateLabel?: string; inlineSignup?: boolean; liveWebsite?: boolean; websiteFirst?: boolean;
};

export function TryInvitation({ initialTheme, isLoggedIn, occasion, text }: {
  initialTheme: string;
  isLoggedIn: boolean;
  occasion?: StartOccasion;
  text: TryText;
}) {
  const [themeSlug, setThemeSlug] = useState(initialTheme);
  const [picking, setPicking] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [signingUp, setSigningUp] = useState(false);
  const [missing, setMissing] = useState<{ name?: boolean; date?: boolean }>({});
  const formColumn = useRef<HTMLDivElement>(null);
  const card = themeCard(themeSlug);

  const query = startQuery(text.intent, themeSlug, occasion, { name: eventName, date: eventDate });
  const href = appHref(isLoggedIn ? '/dashboard/setup' : '/register') + query;
  const inline = !!text.inlineSignup && !isLoggedIn;

  // Inline sign-up: the event needs its name and date before it's created.
  function startSignup(e: React.MouseEvent) {
    if (!inline) return;
    e.preventDefault();
    const gaps = { name: !eventName.trim(), date: !eventDate };
    setMissing(gaps);
    if (gaps.name || gaps.date) {
      document.getElementById(gaps.name ? 'tryEventName' : 'tryEventDate')?.focus();
      return;
    }
    setSigningUp(true);
    // On a phone the step starts where the form was: bring it into view.
    requestAnimationFrame(() => formColumn.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return (
    <div className={`auth-card setup-card--wide try-invite__card${text.websiteFirst ? ' try-invite__card--website-first' : ''}${signingUp ? ' is-signing-up' : ''}`}>
      <p className="try-invite__eyebrow">{text.eyebrow}</p>
      <h1 className="auth-heading">{text.h1}</h1>
      <p className="auth-subheading">{text.intro}</p>

      <div className="setup-style">
        <div className="setup-style__form" ref={formColumn}>
          {signingUp && card ? (
            <TrySignup
              heading={text.saveLabel}
              setupPath={`/dashboard/setup${query}`}
              choices={{ themeSlug, eventType: card.category, eventName: eventName.trim(), eventDate, intent: text.intent }}
              onBack={() => setSigningUp(false)}
            />
          ) : (<>
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
              <label className="auth-label" htmlFor="tryEventName">{text.nameLabel ?? 'Event name'}</label>
              <div className="auth-input-wrap">
                <input className="auth-input" id="tryEventName" type="text" value={eventName}
                  onChange={(e) => { setEventName(e.target.value); setMissing((m) => ({ ...m, name: false })); }}
                  placeholder={`e.g. ${text.example}`} maxLength={START_NAME_MAX} aria-invalid={missing.name || undefined} />
              </div>
              {missing.name && <p className="auth-field-error" role="alert">Please add {text.nameLabel ? text.nameLabel.toLowerCase() : 'the event’s name'} to save it.</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="tryEventDate">{text.dateLabel ?? 'Event date'}</label>
              <AuthDateInput id="tryEventDate" value={eventDate}
                onChange={(e) => { setEventDate(e.target.value); setMissing((m) => ({ ...m, date: false })); }} aria-invalid={missing.date || undefined} />
              {missing.date && <p className="auth-field-error" role="alert">Please add the date to save it.</p>}
            </div>

            <a className="auth-btn try-invite__save" href={href} onClick={startSignup} data-cta="try-invitation">
              {text.saveLabel} <ArrowRightIcon style={{ width: 16, height: 16 }} />
            </a>
            <p className="auth-address-hint" style={{ textAlign: 'center', marginTop: 10 }}>
              {isLoggedIn
                ? 'Next, choose your page address. Then add the time and place and share it.'
                : 'Free to start, no credit card. Create your account to save it, then add the time and place and share it.'}
            </p>
          </>)}
        </div>

        {card && (
          <div className="setup-style__previews">
            <StylePreviews themeSlug={card.slug} eventName={eventName} eventDate={eventDate} nameAs="p" live={text.liveWebsite} websiteFirst={text.websiteFirst} />
            <p className="setup-style__note try-invite__note">
              <SwatchIcon aria-hidden="true" />
              After you sign up you can change the colours, fonts, wording and photos of both.
            </p>
          </div>
        )}
      </div>

      {picking && <ThemePicker open={picking} selected={themeSlug} onChoose={(slug) => { setThemeSlug(slug); setPicking(false); }} onClose={() => setPicking(false)} first={occasionThemes(occasion)} />}
    </div>
  );
}
