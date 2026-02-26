"use client"
import { useActionState, useState } from 'react';
import Image from 'next/image';

import { createUserPage, UserPageState } from '../lib/actions';
import AddressAutocomplete, { AddressComponents } from './address-autocomplete';

export default function Form() {
  const [location, setLocation] = useState<'address' | 'virtual'>('address');
  const [formData, setFormData] = useState({
    eventName: 'John and Jane Wedding',
    eventDate: '2025-01-31',
    eventTime: '',
    eventTheme: 'wedding',
    location: 'address',
    email: 'carlamatos@gmail.com',
    slug: 'janeandjohn',
    description: 'test',
    url: '',
    streetAddress: '11160 234A St',
    unitNumber: '16',
    postalCode: 'V2W0B8',
    city: 'Maple Ridge',
    country: 'Canada',
    placeId: '',
    formattedAddress: '',
  });

    

   const initialState: UserPageState = { message: null, errors: {} };
  
    const [state, formAction] = useActionState(createUserPage, initialState);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'location') {
      setLocation(value as 'address' | 'virtual');
    }
  };

  const handlePlaceSelect = (components: AddressComponents) => {
    setFormData((prev) => ({
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
    <form action={formAction} className="setup max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Your Event</h2>
      <div id="customer-error" aria-live="polite" aria-atomic="true">
      {state.message && <p>{state.message}</p>}
          </div>


      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Event Name:</label>
        <input
          type="text"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          className="setup-input"
          placeholder="Enter event name"
          required
        />
      </div>

      <div className="form-row-2">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Event Date:</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="setup-input"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Event Time:</label>
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            className="setup-input"
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-3">Event Theme:</label>
        <input type="hidden" name="eventTheme" value={formData.eventTheme} required />
        <div className="theme-cards">
          {[
            { value: 'wedding', label: 'Wedding', src: '/images/themes/wedding.png' },
            { value: 'event',   label: 'Event',   src: '/images/themes/event.png'   },
          ].map(({ value, label, src }) => (
            <label
              key={value}
              className={`theme-card${formData.eventTheme === value ? ' theme-card--selected' : ''}`}
            >
              <input
                type="radio"
                name="eventTheme"
                value={value}
                checked={formData.eventTheme === value}
                onChange={handleChange}
              />
              <Image
                src={src}
                alt={label}
                width={400}
                height={160}
                className="theme-card__image"
              />
              <div className="theme-card__label">
                <span className="theme-card__check">
                  {formData.eventTheme === value && (
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
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Location:</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="setup-input"
          required
        >
          <option value="address">Address</option>
          <option value="virtual">Virtual</option>
        </select>
      </div>

      {location === 'address' ? (
        <>
          {/* Hidden fields populated by autocomplete */}
          <input type="hidden" name="placeId" value={formData.placeId} />
          <input type="hidden" name="formattedAddress" value={formData.formattedAddress} />
          <input type="hidden" name="streetAddress" value={formData.streetAddress} />
          <input type="hidden" name="postalCode" value={formData.postalCode} />
          <input type="hidden" name="city" value={formData.city} />
          <input type="hidden" name="country" value={formData.country} />

          <div className="form-row-2">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Address:</label>
              <AddressAutocomplete onPlaceSelect={handlePlaceSelect} />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Unit Number:</label>
              <input
                type="text"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleChange}
                className="setup-input"
                placeholder="Apt, suite, unit..."
              />
            </div>
          </div>

          {formData.formattedAddress && (
            <p className="text-sm text-gray-500 -mt-2 mb-4">
              Selected: {formData.formattedAddress}
            </p>
          )}
        </>
      ) : (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">URL:</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="setup-input"
            placeholder="Enter event URL"
            required
          />
        </div>
      )}

      <div className="form-row-2">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Your Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="setup-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Choose a URL (slug):</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="setup-input"
            placeholder="e.g., myevent"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Brief Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="setup-input"
          placeholder="Enter a brief description of the event"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full charcoal sage-but text-black font-bold py-3 px-6 rounded-lg setup-submit"
      >
        Create Event
      </button>
    </form>
  );
};


