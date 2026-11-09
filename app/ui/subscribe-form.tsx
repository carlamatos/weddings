"use client"
import { useActionState, useState, useMemo, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { createUserPage, UserPageState } from '../lib/actions';
import { themeRegistry } from './themes/registry';
import { PLAN_TERM_MONTHS } from '../lib/plans';
import { CATEGORY_LABELS, ThemePicker, occasionThemes, themeCard } from './theme-picker';
import { clearStartIntent, readBrowsing, readStartIntent, type StartIntent } from '../lib/start-intent';
import { StylePreviews } from './style-previews';
import { slugify } from '../lib/slugify';
import { AuthDateInput } from './auth-date-input';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
// Create an event page on one screen, asking as little as possible: the
// event's name is the only required field. The theme starts chosen — the
// landing page's (app/lib/start-intent.ts), else the theme page or landing
// page the visitor last browsed, else that occasion's first theme, else
// "Simple", the neutral theme — and "Change your theme" opens a short list
// of that occasion's themes, or one of each kind of event (with "See all"). The date is optional ("We haven't picked a date yet"), and the page
// address is the first free suggestion from the name, with "Change" to pick
// another. Everything else — the date if skipped, the time, the place, the
// host's name, the welcome message — comes after, from the page editor and
// the setup checklist (app/lib/setup-progress.ts), so a new host sees their
// page straight away. Pages start Free; Plus is an upgrade from the dashboard.
// accountEmail: the signed-in account's email — the page's contact email
// starts as this, and can be changed in the editor.
// prepaid: Plus was already bought before this account had a page, so this
// page gets it without another payment.
// When the host came to make an invitation the wording says so and the new
// page opens on its invitation designer instead of the page editor.
// start: the landing page's choice, from the address instead of browser
// storage (a signed-in host coming from /design-your-invitation); it also
// brings the event's name and date typed there.
const DEFAULT_THEME = 'simple';
// The short list without an occasion: the neutral theme, then one of each kind.
const MIXED_THEMES = [DEFAULT_THEME, 'the-day', 'balloons', 'summit', 'community', 'christmas-party'];
const SHORT_LIST = 6;

export default function Form({ prepaid = false, accountEmail = '', start: startFromAddress = null }: { prepaid?: boolean; accountEmail?: string; start?: StartIntent | null }) {
  const d = useDashText();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [noDate, setNoDate] = useState(false);
  const [themeSlug, setThemeSlug] = useState('');
  const [picking, setPicking] = useState(false);
  const [forInvitation, setForInvitation] = useState(false);
  const [firstThemes, setFirstThemes] = useState<string[]>([]);
  const [changingSlug, setChangingSlug] = useState(false);
  // The previews only beside the form (wide screens). Phones and tablets would
  // show them under the Create button, mostly unseen, so they aren't rendered
  // there at all and their pictures and fonts don't load; the new page opens
  // right after anyway, and the theme line above the button names the design.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1100px)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  // The starting theme and the short list, after mount (browser storage).
  useEffect(() => {
    const start = startFromAddress ?? readStartIntent();
    const browsed = readBrowsing();
    const known = (slug?: string) => !!slug && !!themeRegistry[slug] && !!themeCard(slug);
    /* eslint-disable react-hooks/set-state-in-effect -- the landing page's choice and the browsing history live in browser storage */
    if (start?.intent === 'invitation') setForInvitation(true);
    if (start?.name) setEventName(start.name);
    if (start?.date) setEventDate(start.date);
    // A landing page's own occasion beats a theme browsed elsewhere.
    const occasion = start?.occasion ?? browsed.occasion;
    const browsedTheme = start?.occasion ? undefined : browsed.theme;
    const list = occasion ? occasionThemes(occasion) : MIXED_THEMES;
    const theme = [start?.theme, browsedTheme, ...list].find(known) ?? DEFAULT_THEME;
    setThemeSlug(theme);
    // The short list: the chosen theme first, then the occasion's (or the mix).
    setFirstThemes([theme, ...list.filter((s) => s !== theme)]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [startFromAddress]);
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
    const year = eventDate && !noDate ? eventDate.slice(0, 4) : '';
    const all = [
      { id: 'name',    value: base,                                       label: d.subscribeForm.eventNameOnly },
      { id: 'date',    value: year ? `${base}-${year}` : `${base}-year`,   label: d.subscribeForm.eventNameYear },
      { id: 'random',  value: randomSuffix ? `${base}-${randomSuffix}` : `${base}-????`,   label: d.subscribeForm.eventNameUniqueNumber },
      { id: 'random2', value: randomSuffix2 ? `${base}-${randomSuffix2}` : `${base}-?????`, label: d.subscribeForm.eventNameUniqueNumber },
    ];
    return all.filter((o, i) => all.findIndex((x) => x.value === o.value) === i);
  }, [eventName, eventDate, noDate, randomSuffix, randomSuffix2, d]);

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
    setPicking(false);
  };

  return (
    <div className="auth-card setup-card--wide">
      <h1 className="auth-heading">{forInvitation ? d.subscribeForm.createYourInvitation : d.subscribeForm.createYourEventPage}</h1>
      <p className="auth-subheading">
        {forInvitation
          ? d.subscribeForm.giveYourEventAName
          : <>{d.subscribeForm.giveYourEventAName2}</>}
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
        onSubmit={() => clearStartIntent()}
      >
        <input type="hidden" name="eventType" value={eventType} />
        <input type="hidden" name="themeSlug" value={themeSlug} />
        <input type="hidden" name="slug" value={activeSlug} />
        {/* Not picked by the host: if it's taken by the time the page is made, another is chosen. */}
        {!selectedSlug && <input type="hidden" name="slugAuto" value="1" />}
        <input type="hidden" name="plan" value="free" />
        <input type="hidden" name="location" value="address" />
        <input type="hidden" name="email" value={accountEmail} />
        {forInvitation && <input type="hidden" name="next" value="invitations" />}

        <div className="auth-field">
          <label className="auth-label" htmlFor="eventName">{d.subscribeForm.eventName}</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="eventName" type="text" name="eventName"
              value={eventName} onChange={(e) => setEventName(e.target.value)}
              placeholder={`e.g. ${chosenTheme?.sample.heading ?? (forInvitation ? d.subscribeForm.theSmithsChristmasParty : d.subscribeForm.sofiaJamesWedding)}`} maxLength={200} autoFocus required />
          </div>
          {state.errors?.event_name && <p className="auth-field-error">{state.errors.event_name[0]}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="eventDate">{rich(d.subscribeForm.eventDateOptional, { t0: (s) => <span className="auth-label-optional">{s}</span> })}</label>
          {!noDate && <AuthDateInput id="eventDate" name="eventDate" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />}
          <label className="setup-date-tbd">
            <input type="checkbox" checked={noDate} onChange={(e) => setNoDate(e.target.checked)} />
            {d.subscribeForm.weHavenTPickedA}
          </label>
          {state.errors?.event_date && <p className="auth-field-error">{state.errors.event_date[0]}</p>}
        </div>

        {/* Phones and tablets have no previews: the theme is named here instead. */}
        {chosenTheme && (
          <div className="setup-slug-line setup-theme-line">
            <span>{rich(fill(d.subscribeForm.theme, { name: chosenTheme.name }), { t0: (s) => <strong>{s}</strong> })}</span>
            <button type="button" className="setup-slug-change" onClick={() => setPicking(true)}>{d.subscribeForm.changeYourTheme}</button>
          </div>
        )}

        {/* Page address: the first free suggestion, or another one after "Change". */}
        <div className="auth-field">
          <p className="auth-label">{d.subscribeForm.yourPageAddress}</p>
          <div className="setup-slug-line">
            <strong>mygala.ca/{activeSlug}</strong>
            <button type="button" className="setup-slug-change" aria-expanded={changingSlug} onClick={() => setChangingSlug((v) => !v)}>
              {changingSlug ? d.subscribeForm.done : d.subscribeForm.change}
            </button>
          </div>
          {changingSlug && (
            <div className="setup-slug-options" role="radiogroup" aria-label={d.subscribeForm.yourPageAddress}>
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
          )}
          {state.errors?.slug && <p className="auth-field-error">{state.errors.slug[0]}</p>}
        </div>

        <button className="auth-btn" type="submit" disabled={isPending || !themeSlug}>
          {isPending ? d.subscribeForm.creating : forInvitation ? d.subscribeForm.designMyInvitation : d.subscribeForm.createMyEventPage} <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
        <p className="auth-address-hint" style={{ textAlign: 'center', marginTop: 10 }}>
          {prepaid
            ? <>{rich(fill(d.subscribeForm.plusIsAlreadyPaidThis, { PLAN_TERM_MONTHS }), { t0: (s) => <strong>{s}</strong> })}</>
            : d.subscribeForm.freeToStartUpgradeThis}
        </p>
      </form>

      {chosenTheme && wide && (
        <div className="setup-style__previews">
          <StylePreviews themeSlug={chosenTheme.slug} eventName={eventName} eventDate={noDate ? '' : eventDate} />
          <div className="setup-chosen-theme__row setup-style__theme">
            <span>
              <strong>{chosenTheme.name}</strong>
              <span className="setup-chosen-theme__cat">{CATEGORY_LABELS[chosenTheme.category]}</span>
            </span>
            <button type="button" className="setup-theme-change" onClick={() => setPicking(true)}>
              {d.subscribeForm.changeTheme}
            </button>
          </div>
          <p className="setup-style__note">{d.subscribeForm.youCanChangeTheColours}</p>
        </div>
      )}
      </div>

      <ThemePicker open={picking} selected={themeSlug} onChoose={chooseTheme} onClose={() => setPicking(false)} first={firstThemes} limit={SHORT_LIST} compactOnPhones />
    </div>
  );
}
