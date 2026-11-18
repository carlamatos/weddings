"use client"
import { useActionState, useState, useMemo, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setDashLang } from '../lib/dash-text/actions';
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
import { EVENT_GOALS, GOAL_RULES, suggestedGoal, themeForGoal, type EventGoal } from '../lib/event-goals';
import { THEME_CARDS } from '../lib/marketing/theme-cards';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
// Create an event page in two short steps. First "What are you planning?"
// (required, one tap: app/lib/event-goals.ts), which sets the starting theme
// unless the host already chose one that suits, the sections the page starts
// with and the checklist; a landing page's or browsed theme's event is
// highlighted there. Then one screen asking as little as possible: the
// event's name is the only required field. The theme starts chosen — the
// landing page's (app/lib/start-intent.ts), else the theme page or landing
// page the visitor last browsed, else that occasion's first theme, else
// "Simple", the neutral theme — and "Change your theme" opens a short list
// of that occasion's themes, or one of each kind of event (with "See all"). The date is optional ("We haven't picked a date yet"), and the page
// address is the first free suggestion from the name, with "Change" to pick
// another. Everything else — the date if skipped, the time, the place, the
// host's name, the welcome message — comes after, from the page editor and
// the setup checklist (app/lib/setup-progress.ts), so a new host sees their
// page straight away. Pages start Free; Live Party is an upgrade from the dashboard.
// accountEmail: the signed-in account's email — the page's contact email
// starts as this, and can be changed in the editor.
// prepaid: Live Party was already bought before this account had a page, so this
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
// The page's language: each in its own words, so it reads the same in any dashboard language.
type PageLanguage = 'en' | 'fr' | 'es';
const PAGE_LANGUAGES: [PageLanguage, string][] = [['en', 'English'], ['fr', 'Français'], ['es', 'Español']];
const GOAL_ICONS: Record<EventGoal, string> = {
  wedding: '💍', birthday: '🎂', 'baby-shower': '🍼', 'christmas-party': '🎄',
  'secret-santa': '🎁', 'new-years': '🥂', business: '💼', other: '✨',
};
const GOAL_TEXT_KEYS: Record<EventGoal, [string, string]> = {
  wedding: ['goalWedding', 'goalWeddingHint'],
  birthday: ['goalBirthday', 'goalBirthdayHint'],
  'baby-shower': ['goalBabyShower', 'goalBabyShowerHint'],
  'christmas-party': ['goalChristmasParty', 'goalChristmasPartyHint'],
  'secret-santa': ['goalSecretSanta', 'goalSecretSantaHint'],
  'new-years': ['goalNewYears', 'goalNewYearsHint'],
  business: ['goalBusiness', 'goalBusinessHint'],
  other: ['goalOther', 'goalOtherHint'],
};

// askNewsletter: the account hasn't been asked (a Google, Facebook or Apple
// sign-up, on its first page) and isn't on the list: the newsletter checkbox,
// unticked (CASL).
// language: the page's starting language — French or Spanish when the host
// came from that sign-up page or chose it for the dashboard, else English.
export default function Form({ prepaid = false, accountEmail = '', start: startFromAddress = null, askNewsletter = false, language: startLanguage = 'en' }: { prepaid?: boolean; accountEmail?: string; start?: StartIntent | null; askNewsletter?: boolean; language?: PageLanguage }) {
  const d = useDashText();
  const [eventName, setEventName] = useState('');
  const [pageLanguage, setPageLanguage] = useState<PageLanguage>(startLanguage);
  // Choosing the page's language switches the dashboard to it too (this
  // form and the menus, at once; what's typed here stays).
  const router = useRouter();
  const [, startLangTransition] = useTransition();
  const choosePageLanguage = (code: PageLanguage) => {
    setPageLanguage(code);
    startLangTransition(async () => {
      await setDashLang(code);
      router.refresh();
    });
  };
  const [eventDate, setEventDate] = useState('');
  const [noDate, setNoDate] = useState(false);
  const [themeSlug, setThemeSlug] = useState('');
  const [picking, setPicking] = useState(false);
  const [forInvitation, setForInvitation] = useState(false);
  const [forSecretSanta, setForSecretSanta] = useState(false);
  const [firstThemes, setFirstThemes] = useState<string[]>([]);
  const [changingSlug, setChangingSlug] = useState(false);
  // "What are you planning?" (required): null until the host picks.
  const [goal, setGoal] = useState<EventGoal | null>(null);
  const [suggested, setSuggested] = useState<EventGoal | null>(null);
  // A theme the host chose before (on a landing or theme page): kept when it suits the goal.
  const [themeHint, setThemeHint] = useState<{ slug: string; category: string } | null>(null);
  // Picked in the theme picker here: a later change of goal keeps it.
  const [themeTouched, setThemeTouched] = useState(false);
  // Christmas party: "Add a Secret Santa gift exchange".
  const [withGift, setWithGift] = useState(false);
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
  // Once: switching the page's language refreshes the dashboard text, which
  // mustn't reset what the host has chosen since.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = startFromAddress ?? readStartIntent();
    const browsed = readBrowsing();
    const known = (slug?: string) => !!slug && !!themeRegistry[slug] && !!themeCard(slug);
    /* eslint-disable react-hooks/set-state-in-effect -- the landing page's choice and the browsing history live in browser storage */
    if (start?.intent === 'invitation') setForInvitation(true);
    if (start?.intent === 'secret-santa') { setForSecretSanta(true); if (!start.name) setEventName(d.subscribeForm.secretSantaName); }
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
    // What the host already chose, for "What are you planning?".
    const explicit = [start?.theme, browsedTheme].find(known);
    const hint = explicit ? { slug: explicit, category: themeCard(explicit)!.category } : null;
    setThemeHint(hint);
    setSuggested(suggestedGoal({ intent: start?.intent, occasion, theme: hint }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [startFromAddress, d.subscribeForm.secretSantaName]);
  const chosenTheme = themeSlug ? themeCard(themeSlug) : undefined;
  const eventType = goal ? GOAL_RULES[goal].eventType : themeRegistry[themeSlug]?.category ?? '';
  const goalText = (g: EventGoal) => {
    const [name, hint] = GOAL_TEXT_KEYS[g];
    const t = d.subscribeForm as Record<string, string>;
    return { name: t[name], hint: t[hint] };
  };
  const chooseGoal = (g: EventGoal) => {
    const rule = GOAL_RULES[g];
    const theme = themeTouched ? themeSlug : themeForGoal(g, themeHint);
    setGoal(g);
    setThemeSlug(theme);
    // The short list: the theme, then the others that suit this event.
    const suits = rule.fits
      ? THEME_CARDS.filter((c) => rule.fits!(c.slug, c.category)).map((c) => c.slug)
      : MIXED_THEMES;
    setFirstThemes([theme, ...suits.filter((s) => s !== theme)]);
    const santaName = d.subscribeForm.secretSantaName;
    if (rule.giftDrawOnly) {
      setForSecretSanta(true);
      if (!eventName.trim()) setEventName(santaName);
    } else {
      setForSecretSanta(false);
      if (eventName === santaName) setEventName('');
    }
    window.scrollTo({ top: 0 });
  };
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
    setThemeTouched(true);
    setPicking(false);
  };

  if (!goal) {
    return (
      <div className="auth-card setup-card--wide">
        <h1 className="auth-heading">{d.subscribeForm.whatAreYouPlanning}</h1>
        <p className="auth-subheading">{d.subscribeForm.pickOneWeLlSetUp}</p>
        <ul className="setup-goals">
          {EVENT_GOALS.map((g) => {
            const { name, hint } = goalText(g);
            return (
              <li key={g}>
                <button type="button" className={`setup-goal${suggested === g ? ' setup-goal--suggested' : ''}`} onClick={() => chooseGoal(g)}>
                  <span className="setup-goal__icon" aria-hidden="true">{GOAL_ICONS[g]}</span>
                  <span className="setup-goal__name">{name}</span>
                  <span className="setup-goal__hint">{hint}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const giftExchangeOn = GOAL_RULES[goal].giftDrawOnly || (GOAL_RULES[goal].offersGiftExchange && withGift);

  return (
    <div className="auth-card setup-card--wide">
      <h1 className="auth-heading">{forSecretSanta ? d.subscribeForm.createYourSecretSanta : forInvitation ? d.subscribeForm.createYourInvitation : d.subscribeForm.createYourEventPage}</h1>
      <p className="auth-subheading setup-form-sub">
        {forSecretSanta ? d.subscribeForm.secretSantaLead : forInvitation
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
        <input type="hidden" name="goal" value={goal} />
        {giftExchangeOn && <input type="hidden" name="withGiftExchange" value="1" />}
        {giftExchangeOn
          ? <input type="hidden" name="next" value="gift-exchange" />
          : forInvitation && <input type="hidden" name="next" value="invitations" />}

        {/* The answer to "What are you planning?", and going back to change it. */}
        <div className="setup-slug-line setup-goal-line">
          <span>{GOAL_ICONS[goal]} {rich(fill(d.subscribeForm.planning, { goal: goalText(goal).name }), { t0: (s) => <strong>{s}</strong> })}</span>
          <button type="button" className="setup-slug-change" onClick={() => setGoal(null)}>{d.subscribeForm.change}</button>
        </div>

        {/* The page's language, in one row (the guests' words: RSVP, dates, buttons). */}
        <div className="auth-field setup-lang">
          <p className="auth-label" id="pageLanguageLabel">{d.subscribeForm.languageOfYourPage}</p>
          <div className="setup-lang__options" role="radiogroup" aria-labelledby="pageLanguageLabel">
            {PAGE_LANGUAGES.map(([code, name]) => (
              <label key={code} className={`setup-lang__option${pageLanguage === code ? ' setup-lang__option--active' : ''}`} lang={code}>
                <input type="radio" name="language" value={code} checked={pageLanguage === code} onChange={() => choosePageLanguage(code)} />
                {name}
              </label>
            ))}
          </div>
        </div>

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
          {!noDate && <AuthDateInput id="eventDate" name="eventDate" value={eventDate} placeholder={d.subscribeForm.chooseADate} onChange={(e) => setEventDate(e.target.value)} />}
          <label className="setup-date-tbd">
            <input type="checkbox" checked={noDate} onChange={(e) => setNoDate(e.target.checked)} />
            {d.subscribeForm.weHavenTPickedA}
          </label>
          {state.errors?.event_date && <p className="auth-field-error">{state.errors.event_date[0]}</p>}
        </div>

        {GOAL_RULES[goal].offersGiftExchange && (
          <label className="setup-date-tbd setup-gift-option">
            <input type="checkbox" checked={withGift} onChange={(e) => setWithGift(e.target.checked)} />
            <span>{d.subscribeForm.addASecretSanta}<small>{d.subscribeForm.addASecretSantaHint}</small></span>
          </label>
        )}

        {/* Phones and tablets have no previews: the theme is named here instead. */}
        {chosenTheme && (
          <div className="setup-slug-line setup-theme-line">
            <span>{rich(fill(d.subscribeForm.theme, { name: chosenTheme.name }), { t0: (s) => <strong>{s}</strong> })}</span>
            <button type="button" className="setup-slug-change" onClick={() => setPicking(true)}>{d.subscribeForm.changeYourTheme}</button>
          </div>
        )}

        {/* Page address: the first free suggestion, or another one after "Change". */}
        <div className="auth-field setup-address">
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

        {askNewsletter && (
          <label className="auth-consent">
            <input type="checkbox" name="newsletter" value="1" />
            <span>{d.subscribeForm.newsletterOptIn}</span>
          </label>
        )}

        <button className="auth-btn" type="submit" disabled={isPending || !themeSlug}>
          {isPending ? d.subscribeForm.creating : forSecretSanta ? d.subscribeForm.createMySecretSanta : forInvitation ? d.subscribeForm.designMyInvitation : d.subscribeForm.createMyEventPage} <ArrowRightIcon style={{ width: 16, height: 16 }} />
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
