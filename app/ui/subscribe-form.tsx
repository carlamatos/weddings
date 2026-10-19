"use client"
import { useActionState, useState, useMemo, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { createUserPage, UserPageState } from '../lib/actions';
import { themesByCategory } from './themes/registry';
import type { EventCategory } from './themes/types';
import ThemeHeroPreview from './dashboard/ThemeHeroPreview';
import { PLAN_TERM_MONTHS } from '../lib/plans';

const CATEGORY_LABELS: Record<EventCategory, string> = {
  wedding: 'Wedding',
  birthdays: 'Celebrations',
  business: 'Business',
  community: 'General Events',
};

const EVENT_NAME_PLACEHOLDER: Record<EventCategory, string> = {
  wedding: 'e.g. Sofia & James Wedding',
  birthdays: "e.g. Sofia's Quinceañera or Sweet 16",
  business: 'e.g. Annual Leadership Summit',
  community: 'e.g. Classic Car Show or Neighborhood Block Party',
};

// Every theme card shows the theme's own real HeroPreview, scaled down to
// fit the card — this always matches the live theme exactly (no separately
// maintained thumbnail image to fall out of sync).
const PREVIEW_NATURAL_HEIGHT = 280;
const PREVIEW_CARD_HEIGHT = 130;
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

// Create an event page with only what the page can't start without: the
// type of event, its name, the date and a theme (the page address is picked
// for you and can be changed). Everything else — the time, the place, the
// welcome message, the contact details and the owner's name — comes after,
// from the page editor and the setup checklist (app/lib/setup-progress.ts),
// so a new host sees their page straight away. Pages start Free; Plus is an
// upgrade from the dashboard.
// accountEmail: the signed-in account's email — the page's contact email
// starts as this, and can be changed in the editor.
// prepaid: Plus was already bought before this account had a page, so this
// page gets it without another payment.
export default function Form({ prepaid = false, accountEmail = '' }: { prepaid?: boolean; accountEmail?: string }) {
  const [eventType, setEventType] = useState<EventCategory>('wedding');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [themeSlug, setThemeSlug] = useState<string>(() => themesByCategory('wedding')[0]?.slug ?? 'quiet-coastal');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [showSlugs, setShowSlugs] = useState(false);
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

  const themes = themesByCategory(eventType);

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
  // A taken address comes back as an error: show the choices.
  const slugsOpen = showSlugs || !!state.errors?.slug;

  const handleEventTypeChange = (type: EventCategory) => {
    setEventType(type);
    setThemeSlug(themesByCategory(type)[0]?.slug ?? '');
  };

  return (
    <div className="auth-card" style={{ maxWidth: 620 }}>
      <h1 className="auth-heading">Create your event</h1>
      <p className="auth-subheading">Just the basics for now — you&rsquo;ll add the time, place and the rest on your page.</p>

      {state.message && (
        <div className="auth-error">
          <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {state.message}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="eventType" value={eventType} />
        <input type="hidden" name="themeSlug" value={themeSlug} />
        <input type="hidden" name="slug" value={activeSlug} />
        <input type="hidden" name="plan" value="free" />
        <input type="hidden" name="location" value="address" />
        <input type="hidden" name="email" value={accountEmail} />

        {/* Event Type */}
        <div className="auth-field">
          <label className="auth-label">What are you celebrating?</label>
          <div className="setup-type-pills">
            {(['wedding', 'birthdays', 'business', 'community'] as const).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={eventType === type}
                className={`setup-type-pill${eventType === type ? ' setup-type-pill--active' : ''}`}
                onClick={() => handleEventTypeChange(type)}
              >
                {CATEGORY_LABELS[type]}
              </button>
            ))}
          </div>
          {state.errors?.event_type && <p className="auth-field-error">{state.errors.event_type[0]}</p>}
        </div>

        {/* Event Name + Date */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="eventName">Event Name</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="eventName" type="text" name="eventName"
              value={eventName} onChange={(e) => setEventName(e.target.value)}
              placeholder={EVENT_NAME_PLACEHOLDER[eventType]} maxLength={200} autoFocus required />
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

        {/* Theme picker */}
        <div className="auth-field">
          <label className="auth-label">{CATEGORY_LABELS[eventType]} Theme</label>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 10px', lineHeight: 1.5 }}>
            Not sure yet? Pick one you like — you can change your theme anytime from your page editor.
          </p>
          {themes.length === 0 ? (
            <div className="setup-theme-cards--empty">
              No {CATEGORY_LABELS[eventType].toLowerCase()} themes yet — more are on the way. Pick another category for now.
            </div>
          ) : (
            <div className="setup-theme-cards">
              {themes.map((theme) => (
                <label
                  key={theme.slug}
                  className={`setup-theme-card${themeSlug === theme.slug ? ' setup-theme-card--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="themeSlugRadio"
                    value={theme.slug}
                    checked={themeSlug === theme.slug}
                    onChange={() => setThemeSlug(theme.slug)}
                  />
                  <ThemeCardPreview themeSlug={theme.slug} heading={eventName} />
                  <div className="setup-theme-card__label">
                    <span className="setup-theme-card__check">
                      {themeSlug === theme.slug && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {theme.label}
                  </div>
                </label>
              ))}
            </div>
          )}
          {state.errors?.theme_slug && <p className="auth-field-error">{state.errors.theme_slug[0]}</p>}
        </div>

        {/* Page address: picked for you, with the other choices a click away */}
        <div className="auth-field">
          <p className="setup-slug-line">
            <span>Your page: <strong>mygala.ca/{activeSlug}</strong></span>
            <button type="button" className="setup-slug-change" aria-expanded={slugsOpen} onClick={() => setShowSlugs((v) => !v)}>
              {slugsOpen ? 'Done' : 'Change'}
            </button>
          </p>
          {slugsOpen && (
            <div className="setup-slug-options">
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
                  <span className="setup-slug-option__value">{opt.value}</span>
                  <span className="setup-slug-option__label">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
          {state.errors?.slug && <p className="auth-field-error">{state.errors.slug[0]}</p>}
        </div>

        <button className="auth-btn" type="submit" disabled={isPending}>
          {isPending ? 'Creating your page…' : 'Create my event page'} <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
        <p className="auth-address-hint" style={{ textAlign: 'center', marginTop: 10 }}>
          {prepaid
            ? <><strong>Plus is already paid</strong> — this page includes every Plus feature for {PLAN_TERM_MONTHS} months.</>
            : 'Free to start. Upgrade this event to Plus any time from your dashboard.'}
        </p>
      </form>
    </div>
  );
}
