"use client"
import { useActionState, useState, useMemo, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { createUserPage, UserPageState } from '../lib/actions';
import { themeRegistry } from './themes/registry';
import ThemeHeroPreview from './dashboard/ThemeHeroPreview';
import { PLAN_TERM_MONTHS } from '../lib/plans';
import { CATEGORY_LABELS, ThemePicker, themeCard } from './theme-picker';

// The chosen theme's own real banner (HeroPreview) with the event's name,
// scaled down to fit the form.
const PREVIEW_NATURAL_HEIGHT = 280;
const PREVIEW_CARD_HEIGHT = 170;
const PREVIEW_SCALE = PREVIEW_CARD_HEIGHT / PREVIEW_NATURAL_HEIGHT;

function ThemeCardPreview({ themeSlug, heading }: { themeSlug: string; heading: string }) {
  return (
    <div className="setup-theme-card__preview">
      <div style={{ width: `${100 / PREVIEW_SCALE}%`, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}>
        <ThemeHeroPreview themeSlug={themeSlug} heading={heading} />
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Create an event page in two steps: 1. the theme, from the full-screen
// gallery (theme-picker.tsx, which opens straight away; the type of event
// comes from the theme); 2. the event's name, its date and the page address
// (suggested from the name; the host picks one). Everything else — the time, the place, the
// welcome message, the contact details and the owner's name — comes after,
// from the page editor and the setup checklist (app/lib/setup-progress.ts),
// so a new host sees their page straight away. Pages start Free; Plus is an
// upgrade from the dashboard.
// accountEmail: the signed-in account's email — the page's contact email
// starts as this, and can be changed in the editor.
// prepaid: Plus was already bought before this account had a page, so this
// page gets it without another payment.
export default function Form({ prepaid = false, accountEmail = '' }: { prepaid?: boolean; accountEmail?: string }) {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [themeSlug, setThemeSlug] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [picking, setPicking] = useState(false);
  // Step 1 is the gallery itself: open it on arrival.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the dialog opens after mount (showModal needs the DOM)
    setPicking(true);
  }, []);
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
    <div className="auth-card" style={{ maxWidth: 620 }}>
      <ol className="setup-steps" aria-label="Create your event">
        <li className={step === 1 ? 'is-current' : 'is-done'} aria-current={step === 1 ? 'step' : undefined}>
          <span className="setup-steps__num">1</span>Theme
        </li>
        <li className={step === 2 ? 'is-current' : undefined} aria-current={step === 2 ? 'step' : undefined}>
          <span className="setup-steps__num">2</span>Name, date &amp; address
        </li>
      </ol>

      {step === 1 ? (
        <>
          <h1 className="auth-heading">Choose your theme</h1>
          <p className="auth-subheading">Pick the design for your event page. You can change it any time.</p>
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
          <h1 className="auth-heading">Name your event</h1>
          <p className="auth-subheading">The name, the date and your page&rsquo;s address. You&rsquo;ll add the time, place and the rest on your page.</p>

          {state.message && (
            <div className="auth-error">
              <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
              {state.message}
            </div>
          )}

          {/* The theme chosen in step 1, with the event's name on its banner. */}
          {chosenTheme && (
            <div className="setup-chosen-theme" style={{ marginBottom: 20 }}>
              <ThemeCardPreview themeSlug={chosenTheme.slug} heading={eventName} />
              <div className="setup-chosen-theme__row">
                <span>
                  <strong>{chosenTheme.name}</strong>
                  <span className="setup-chosen-theme__cat">{CATEGORY_LABELS[chosenTheme.category]}</span>
                </span>
                <button type="button" className="setup-theme-change" onClick={() => setPicking(true)}>
                  Change theme
                </button>
              </div>
            </div>
          )}
          {state.errors?.theme_slug && <p className="auth-field-error">{state.errors.theme_slug[0]}</p>}
          {state.errors?.event_type && <p className="auth-field-error">{state.errors.event_type[0]}</p>}

          <form
            action={formAction}
            // The theme is required, but it's a hidden field the browser can't check.
            onSubmit={(e) => {
              if (themeSlug) return;
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

            <div className="auth-field">
              <label className="auth-label" htmlFor="eventName">Event Name</label>
              <div className="auth-input-wrap">
                <input className="auth-input" id="eventName" type="text" name="eventName"
                  value={eventName} onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Sofia & James Wedding" maxLength={200} autoFocus required />
              </div>
              {state.errors?.event_name && <p className="auth-field-error">{state.errors.event_name[0]}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="eventDate">Event Date</label>
              <div className="auth-input-wrap">
                <input className="auth-input" id="eventDate" type="date" name="eventDate"
                  value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              </div>
              {state.errors?.event_date && <p className="auth-field-error">{state.errors.event_date[0]}</p>}
            </div>

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
                {isPending ? 'Creating your page…' : 'Create my event page'} <ArrowRightIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <p className="auth-address-hint" style={{ textAlign: 'center', marginTop: 10 }}>
              {prepaid
                ? <><strong>Plus is already paid</strong> — this page includes every Plus feature for {PLAN_TERM_MONTHS} months.</>
                : 'Free to start. Upgrade this event to Plus any time from your dashboard.'}
            </p>
          </form>
        </>
      )}

      <ThemePicker open={picking} selected={themeSlug} onChoose={chooseTheme} onClose={() => setPicking(false)} />
    </div>
  );
}
