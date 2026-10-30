"use client"
import { useActionState, useState, useMemo, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { createUserPage, UserPageState } from '../lib/actions';
import { themeRegistry } from './themes/registry';
import { PLAN_TERM_MONTHS } from '../lib/plans';
import { CATEGORY_LABELS, ThemePicker, occasionThemes, themeCard } from './theme-picker';
import { clearStartIntent, readStartIntent, type StartIntent } from '../lib/start-intent';
import { StylePreviews } from './style-previews';
import { slugify } from '../lib/slugify';
import { AuthDateInput } from './auth-date-input';

// Create an event page in two steps: 1. the theme, from the full-screen
// gallery (theme-picker.tsx, which opens straight away; the type of event
// comes from the theme); 2. the event's name, its date, the host's own name
// (only until the account has one) and the page address (suggested from the
// name; the host picks one), beside previews of the invitation and the
// website in that theme. Everything else — the time, the place, the
// welcome message and the contact details — comes after,
// from the page editor and the setup checklist (app/lib/setup-progress.ts),
// so a new host sees their page straight away. Pages start Free; Plus is an
// upgrade from the dashboard.
// accountEmail: the signed-in account's email — the page's contact email
// starts as this, and can be changed in the editor.
// prepaid: Plus was already bought before this account had a page, so this
// page gets it without another payment.
// From a landing page (app/lib/start-intent.ts): the theme the visitor
// picked there is already chosen (straight to step 2), and when they came to
// make an invitation the wording says so and the new page opens on its
// invitation designer instead of the page editor.
// needsName: the account has no first and last name yet, so step 2 asks
// for them (required); ownerName fills in whatever part it does have.
// start: the same choice, from the address instead of browser storage (a
// signed-in host coming from /design-your-invitation); it also brings the
// event's name and date typed there.
export default function Form({ prepaid = false, accountEmail = '', needsName = false, ownerName, start: startFromAddress = null }: { prepaid?: boolean; accountEmail?: string; needsName?: boolean; ownerName?: { given: string; family: string }; start?: StartIntent | null }) {
  const [eventName, setEventName] = useState('');
  // Controlled, so a failed submit (the form resets) keeps what was typed.
  const [givenName, setGivenName] = useState(ownerName?.given ?? '');
  const [familyName, setFamilyName] = useState(ownerName?.family ?? '');
  const [eventDate, setEventDate] = useState('');
  const [themeSlug, setThemeSlug] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [picking, setPicking] = useState(false);
  const [forInvitation, setForInvitation] = useState(false);
  const [firstThemes, setFirstThemes] = useState<string[]>([]);
  // Step 1 is the gallery itself: open it on arrival — unless a landing page
  // already chose the theme (browser storage is only readable after mount).
  useEffect(() => {
    const start = startFromAddress ?? readStartIntent();
    /* eslint-disable react-hooks/set-state-in-effect -- the dialog opens after mount (showModal needs the DOM); the landing page's choice lives in browser storage */
    if (start?.intent === 'invitation') setForInvitation(true);
    if (start?.name) setEventName(start.name);
    if (start?.date) setEventDate(start.date);
    setFirstThemes(occasionThemes(start?.occasion, start?.theme));
    if (start?.theme && themeRegistry[start.theme] && themeCard(start.theme)) {
      setThemeSlug(start.theme);
      setStep(2);
    } else {
      setPicking(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [startFromAddress]);
  const [themeMissing, setThemeMissing] = useState(false);
  const chosenTheme = themeSlug ? themeCard(themeSlug) : undefined;
  const eventType = themeRegistry[themeSlug]?.category ?? '';
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  // Random suffixes for the unique-number addresses — set after mount only
  // to avoid an SSR/client mismatch.
  const [randomSuffix, setRandomSuffix] = useState<number | null>(null);
  const [randomSuffix2, setRandomSuffix2] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: Math.random() must not run during SSR render
    setRandomSuffix(Math.floor(1000 + Math.random() * 9000));
    setRandomSuffix2(Math.floor(10000 + Math.random() * 90000));
  }, []);
  // Suggested addresses already used by another page (or reserved).
  const [takenSlugs, setTakenSlugs] = useState<Set<string>>(new Set());

  const initialState: UserPageState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(createUserPage, initialState);

  // Address suggestions, live from the form: more than the 4 shown, so
  // taken ones can be skipped.
  const slugCandidates = useMemo(() => {
    const base = slugify(eventName) || 'your-event';
    const year = eventDate ? eventDate.slice(0, 4) : '';
    const all = [
      { id: 'name',    value: base,                                       label: 'Event name only' },
      { id: 'date',    value: year ? `${base}-${year}` : `${base}-year`,   label: 'Event name + year' },
      { id: 'random',  value: randomSuffix ? `${base}-${randomSuffix}` : `${base}-????`,   label: 'Event name + unique number' },
      { id: 'random2', value: randomSuffix2 ? `${base}-${randomSuffix2}` : `${base}-?????`, label: 'Event name + unique number' },
    ];
    return all.filter((o, i) => all.findIndex((x) => x.value === o.value) === i);
  }, [eventName, eventDate, randomSuffix, randomSuffix2]);

  // Ask which suggestions are taken, once typing pauses.
  useEffect(() => {
    const slugs = slugCandidates.map((o) => o.value).filter((v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v));
    if (!slugs.length) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/slug-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { taken?: string[] };
        setTakenSlugs(new Set(data.taken ?? []));
      } catch {
        // Offline or aborted: keep showing suggestions; creating the page re-checks.
      }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [slugCandidates]);

  // The suggestions that are free (all of them if the check hasn't answered).
  const slugOptions = useMemo(() => {
    const free = slugCandidates.filter((o) => !takenSlugs.has(o.value));
    return free.length ? free : slugCandidates;
  }, [slugCandidates, takenSlugs]);

  // The chosen address, or the first free one if nothing is chosen yet (or
  // the chosen one turned out to be taken).
  const activeSlug = slugOptions.some((o) => o.value === selectedSlug) ? selectedSlug : slugOptions[0].value;
  const chooseTheme = (slug: string) => {
    setThemeSlug(slug);
    setThemeMissing(false);
    setPicking(false);
    setStep(2);
  };

  return (
    <div className={`auth-card${step === 2 ? ' setup-card--wide' : ''}`} style={step === 2 ? undefined : { maxWidth: 620 }}>
      <ol className="setup-steps" aria-label="Create your event">
        <li className={step === 1 ? 'is-current' : 'is-done'} aria-current={step === 1 ? 'step' : undefined}>
          <span className="setup-steps__num">1</span>Theme
        </li>
        <li className={step === 2 ? 'is-current' : undefined} aria-current={step === 2 ? 'step' : undefined}>
          <span className="setup-steps__num">2</span>Style, name &amp; address
        </li>
      </ol>

      {step === 1 ? (
        <>
          <h1 className="auth-heading">{forInvitation ? 'Choose your invitation design' : 'Choose your theme'}</h1>
          <p className="auth-subheading">
            {forInvitation
              ? 'Pick a design. Your invitation and the page it opens to will match. You can change it any time.'
              : 'Pick the design for your event page. You can change it any time.'}
          </p>
          <button
            type="button"
            id="choose-theme"
            className={`setup-choose-theme${themeMissing ? ' is-missing' : ''}`}
            onClick={() => setPicking(true)}
          >
            <span className="setup-choose-theme__title">{chosenTheme ? `Chosen: ${chosenTheme.name}` : 'Browse the themes'}</span>
            <span className="setup-choose-theme__sub">See all {Object.keys(themeRegistry).length} designs — weddings, celebrations, business and more</span>
          </button>
          {chosenTheme && (
            <button className="auth-btn" type="button" style={{ marginTop: 16 }} onClick={() => setStep(2)}>
              Next <ArrowRightIcon style={{ width: 16, height: 16 }} />
            </button>
          )}
        </>
      ) : (
        <>
          <h1 className="auth-heading">Choose your style for your invitations and website</h1>
          <p className="auth-subheading">
            {forInvitation
              ? 'Your invitation and the website it opens to share one design. Add the name and the date. Next you’ll add the time and place, finish your invitation and share the link.'
              : <>Your invitations and website share one design. Add the name, the date and your website&rsquo;s address. You&rsquo;ll add the time, place and the rest on your page.</>}
          </p>

          {state.message && (
            <div className="auth-error">
              <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {state.message}
            </div>
          )}
          {state.errors?.theme_slug && <p className="auth-field-error">{state.errors.theme_slug[0]}</p>}
          {state.errors?.event_type && <p className="auth-field-error">{state.errors.event_type[0]}</p>}

          <div className="setup-style">
          <form
            className="setup-style__form"
            action={formAction}
            // The theme is required, but it's a hidden field the browser can't check.
            onSubmit={(e) => {
              if (themeSlug) { clearStartIntent(); return; }
              e.preventDefault();
              setThemeMissing(true);
              setStep(1);
            }}
          >
            <input type="hidden" name="eventType" value={eventType} />
            <input type="hidden" name="themeSlug" value={themeSlug} />
            <input type="hidden" name="slug" value={activeSlug} />
            <input type="hidden" name="plan" value="free" />
            <input type="hidden" name="location" value="address" />
            <input type="hidden" name="email" value={accountEmail} />
            {forInvitation && <input type="hidden" name="next" value="invitations" />}

            <div className="auth-field">
              <label className="auth-label" htmlFor="eventName">Event Name</label>
              <div className="auth-input-wrap">
                <input className="auth-input" id="eventName" type="text" name="eventName"
                  value={eventName} onChange={(e) => setEventName(e.target.value)}
                  placeholder={`e.g. ${chosenTheme?.sample.heading ?? (forInvitation ? 'The Smiths’ Christmas Party' : 'Sofia & James Wedding')}`} maxLength={200} autoFocus required />
              </div>
              {state.errors?.event_name && <p className="auth-field-error">{state.errors.event_name[0]}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="eventDate">Event Date</label>
              <AuthDateInput id="eventDate" name="eventDate" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              {state.errors?.event_date && <p className="auth-field-error">{state.errors.event_date[0]}</p>}
            </div>

            {needsName && (
              <div className="setup-name-row">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="givenName">Your first name</label>
                  <div className="auth-input-wrap">
                    <input className="auth-input" id="givenName" type="text" name="givenName" value={givenName} onChange={(e) => setGivenName(e.target.value)} maxLength={100} autoComplete="given-name" required />
                  </div>
                  {state.errors?.given_name && <p className="auth-field-error">{state.errors.given_name[0]}</p>}
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="familyName">Your last name</label>
                  <div className="auth-input-wrap">
                    <input className="auth-input" id="familyName" type="text" name="familyName" value={familyName} onChange={(e) => setFamilyName(e.target.value)} maxLength={100} autoComplete="family-name" required />
                  </div>
                  {state.errors?.family_name && <p className="auth-field-error">{state.errors.family_name[0]}</p>}
                </div>
              </div>
            )}

            {/* Page address: suggestions from the name, taken ones left out. */}
            <div className="auth-field">
              <p className="auth-label">Your page address</p>
              <div className="setup-slug-options" role="radiogroup" aria-label="Your page address">
                {slugOptions.map((opt) => (
                  <label
                    key={opt.id}
                    className={`setup-slug-option${activeSlug === opt.value ? ' setup-slug-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="slugRadio"
                      value={opt.value}
                      checked={activeSlug === opt.value}
                      onChange={() => setSelectedSlug(opt.value)}
                    />
                    <span className="setup-slug-option__value">mygala.ca/{opt.value}</span>
                    <span className="setup-slug-option__label">{opt.label}</span>
                  </label>
                ))}
              </div>
              {state.errors?.slug && <p className="auth-field-error">{state.errors.slug[0]}</p>}
            </div>

            <div className="setup-nav">
              <button type="button" className="setup-back" onClick={() => setStep(1)}>← Back</button>
              <button className="auth-btn" type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : forInvitation ? 'Design my invitation' : 'Create my event page'} <ArrowRightIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <p className="auth-address-hint" style={{ textAlign: 'center', marginTop: 10 }}>
              {prepaid
                ? <><strong>Plus is already paid</strong> — this page includes every Plus feature for {PLAN_TERM_MONTHS} months.</>
                : 'Free to start. Upgrade this event to Plus any time from your dashboard.'}
            </p>
          </form>

          {chosenTheme && (
            <div className="setup-style__previews">
              <StylePreviews themeSlug={chosenTheme.slug} eventName={eventName} eventDate={eventDate} />
              <div className="setup-chosen-theme__row setup-style__theme">
                <span>
                  <strong>{chosenTheme.name}</strong>
                  <span className="setup-chosen-theme__cat">{CATEGORY_LABELS[chosenTheme.category]}</span>
                </span>
                <button type="button" className="setup-theme-change" onClick={() => setPicking(true)}>
                  Change theme
                </button>
              </div>
              <p className="setup-style__note">You can change the colours, fonts and design of your invitation and website in the editor later.</p>
            </div>
          )}
          </div>
        </>
      )}

      <ThemePicker open={picking} selected={themeSlug} onChoose={chooseTheme} onClose={() => setPicking(false)} first={firstThemes} compactOnPhones />
    </div>
  );
}
