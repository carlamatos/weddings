"use client"
import { useActionState, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

import { createUserPage, UserPageState } from '../lib/actions';
import AddressAutocomplete, { AddressComponents } from './address-autocomplete';

const WEDDING_THEMES = [
  { slug: 'quiet-coastal',      label: 'Quiet Coastal',      src: '/images/themes/quiet-coastal/coastal.png' },
  { slug: 'midnight-botanical', label: 'Midnight Botanical',  src: '/images/themes/midnight-botanical/woods.png' },
  { slug: 'terracotta-harvest', label: 'Terracotta Harvest',  src: '/images/themes/wedding.png' },
  { slug: 'vilma',              label: 'Vilma',               src: '/images/themes/vilma/preview.png' },
];

const EVENT_THEMES = [
  { slug: 'event', label: 'Classic Event', src: '/images/themes/event.png' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function Form() {
  const [eventType, setEventType] = useState<'wedding' | 'event'>('wedding');
  const [location, setLocation] = useState<'address' | 'virtual'>('address');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  // Random suffix for option 4 — set after mount only to avoid SSR/client mismatch
  const [randomSuffix, setRandomSuffix] = useState<number | null>(null);
  useEffect(() => {
    setRandomSuffix(Math.floor(1000 + Math.random() * 9000));
  }, []);

  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    themeSlug: 'quiet-coastal',
    location: 'address',
    email: '',
    description: '',
    url: '',
    streetAddress: '',
    unitNumber: '',
    postalCode: '',
    city: '',
    country: '',
    placeId: '',
    formattedAddress: '',
  });

  const initialState: UserPageState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(createUserPage, initialState);

  const themes = eventType === 'wedding' ? WEDDING_THEMES : EVENT_THEMES;

  // Generate 4 slug options live from current form values
  const slugOptions = useMemo(() => {
    const base = slugify(formData.eventName) || 'your-event';
    const year = formData.eventDate ? formData.eventDate.slice(0, 4) : '';
    const city = slugify(formData.city) || 'your-city';

    return [
      { id: 'name',   value: base,                                    label: 'Event name only' },
      { id: 'date',   value: year ? `${base}-${year}` : `${base}-year`, label: 'Event name + year' },
      { id: 'city',   value: `${base}-${city}`,                       label: 'Event name + city' },
      { id: 'random', value: randomSuffix ? `${base}-${randomSuffix}` : `${base}-????`, label: 'Event name + unique number' },
    ];
  }, [formData.eventName, formData.eventDate, formData.city, randomSuffix]);

  // Auto-select first option when options change (e.g. user starts typing name)
  // but only if no manual selection has been made yet
  const activeSlug = selectedSlug || slugOptions[0].value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'location') setLocation(value as 'address' | 'virtual');
  };

  const handleEventTypeChange = (type: 'wedding' | 'event') => {
    setEventType(type);
    setFormData(prev => ({ ...prev, themeSlug: type === 'wedding' ? 'quiet-coastal' : 'event' }));
  };

  const handlePlaceSelect = (components: AddressComponents) => {
    setFormData(prev => ({
      ...prev,
      streetAddress: components.streetAddress,
      postalCode: components.postalCode,
      city: components.city,
      country: components.country,
      placeId: components.placeId,
      formattedAddress: components.formattedAddress,
    }));
  };

  return (
    <div className="auth-card" style={{ maxWidth: 620 }}>
      <h1 className="auth-heading">Create your event</h1>
      <p className="auth-subheading">Set up your wedding page in just a few steps.</p>

      {state.message && (
        <div className="auth-error">
          <ExclamationCircleIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {state.message}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="eventType" value={eventType} />
        <input type="hidden" name="themeSlug" value={formData.themeSlug} />
        <input type="hidden" name="slug" value={activeSlug} />

        {/* Event Type */}
        <div className="auth-field">
          <label className="auth-label">Event Type</label>
          <div className="setup-type-pills">
            {(['wedding', 'event'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`setup-type-pill${eventType === type ? ' setup-type-pill--active' : ''}`}
                onClick={() => handleEventTypeChange(type)}
              >
                {type === 'wedding' ? 'Wedding' : 'Event'}
              </button>
            ))}
          </div>
          {state.errors?.event_type && <p className="auth-field-error">{state.errors.event_type[0]}</p>}
        </div>

        {/* Event Name */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="eventName">Event Name</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="eventName" type="text" name="eventName"
              value={formData.eventName} onChange={handleChange}
              placeholder={eventType === 'wedding' ? 'e.g. Sofia & James Wedding' : 'e.g. Annual Gala 2027'} required />
          </div>
          {state.errors?.event_name && <p className="auth-field-error">{state.errors.event_name[0]}</p>}
        </div>

        {/* Date & Time */}
        <div className="auth-grid-2">
          <div className="auth-field">
            <label className="auth-label" htmlFor="eventDate">Event Date</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="eventDate" type="date" name="eventDate"
                value={formData.eventDate} onChange={handleChange} required />
            </div>
            {state.errors?.event_date && <p className="auth-field-error">{state.errors.event_date[0]}</p>}
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="eventTime">Event Time</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="eventTime" type="time" name="eventTime"
                value={formData.eventTime} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Theme picker */}
        <div className="auth-field">
          <label className="auth-label">
            {eventType === 'wedding' ? 'Wedding Theme' : 'Event Theme'}
          </label>
          <div className="setup-theme-cards">
            {themes.map(({ slug, label, src }) => (
              <label
                key={slug}
                className={`setup-theme-card${formData.themeSlug === slug ? ' setup-theme-card--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="themeSlugRadio"
                  value={slug}
                  checked={formData.themeSlug === slug}
                  onChange={() => setFormData(prev => ({ ...prev, themeSlug: slug }))}
                />
                <Image src={src} alt={label} width={400} height={160} className="setup-theme-card__image" />
                <div className="setup-theme-card__label">
                  <span className="setup-theme-card__check">
                    {formData.themeSlug === slug && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {label}
                </div>
              </label>
            ))}
          </div>
          {state.errors?.theme_slug && <p className="auth-field-error">{state.errors.theme_slug[0]}</p>}
        </div>

        {/* Location type */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="location">Location Type</label>
          <div className="auth-input-wrap">
            <select className="auth-input auth-select" id="location" name="location"
              value={formData.location} onChange={handleChange} required>
              <option value="address">Address</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
        </div>

        {/* Address fields */}
        {location === 'address' ? (
          <>
            <input type="hidden" name="placeId" value={formData.placeId} />
            <input type="hidden" name="formattedAddress" value={formData.formattedAddress} />
            <input type="hidden" name="streetAddress" value={formData.streetAddress} />
            <input type="hidden" name="postalCode" value={formData.postalCode} />
            <input type="hidden" name="city" value={formData.city} />
            <input type="hidden" name="country" value={formData.country} />

            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="auth-label">Address</label>
                <AddressAutocomplete onPlaceSelect={handlePlaceSelect} />
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="unitNumber">Unit Number</label>
                <div className="auth-input-wrap">
                  <input className="auth-input" id="unitNumber" type="text" name="unitNumber"
                    value={formData.unitNumber} onChange={handleChange} placeholder="Apt, suite…" />
                </div>
              </div>
            </div>

            {formData.formattedAddress && (
              <p className="auth-address-hint">Selected: {formData.formattedAddress}</p>
            )}
          </>
        ) : (
          <div className="auth-field">
            <label className="auth-label" htmlFor="url">Event URL</label>
            <div className="auth-input-wrap">
              <input className="auth-input" id="url" type="url" name="url"
                value={formData.url} onChange={handleChange}
                placeholder="https://zoom.us/j/…" required />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Your Email</label>
          <div className="auth-input-wrap">
            <input className="auth-input" id="email" type="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="you@example.com" required />
          </div>
          {state.errors?.email && <p className="auth-field-error">{state.errors.email[0]}</p>}
        </div>

        {/* Page URL — 4 generated options */}
        <div className="auth-field">
          <label className="auth-label">Your Page URL</label>
          <p className="auth-address-hint" style={{ marginBottom: 10, marginTop: 0 }}>
            mygala.ca/<strong>{activeSlug}</strong>
          </p>
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
          {state.errors?.slug && <p className="auth-field-error">{state.errors.slug[0]}</p>}
        </div>

        {/* Description */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="description">Brief Description</label>
          <textarea className="auth-input auth-textarea" id="description" name="description"
            value={formData.description} onChange={handleChange}
            placeholder="A few words about your event…" required />
          {state.errors?.description && <p className="auth-field-error">{state.errors.description[0]}</p>}
        </div>

        <button className="auth-btn" type="submit" disabled={isPending}>
          Create Event <ArrowRightIcon style={{ width: 16, height: 16 }} />
        </button>
      </form>
    </div>
  );
}
