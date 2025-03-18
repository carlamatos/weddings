"use client"
import { useActionState, useState } from 'react';

import { createUserPage, UserPageState } from '../lib/actions';

export default function Form() {
  const [location, setLocation] = useState<'address' | 'virtual'>('address');
  const [formData, setFormData] = useState({
    eventName: 'John and Jane Wedding',
    eventDate: '2025-01-31',
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
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
          placeholder="Enter event name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Event Date:</label>
        <input
          type="date"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Location:</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
          required
        >
          <option value="address">Address</option>
          <option value="virtual">Virtual</option>
        </select>
      </div>

      {location === 'address' ? (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Street Address:</label>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
              placeholder="Enter street address"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Unit Number:</label>
            <input
              type="text"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
              placeholder="Enter unit number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Postal Code:</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="Enter postal code"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
                placeholder="Enter city"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Country:</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
              placeholder="Enter country"
            />
          </div>
        </>
      ) : (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">URL:</label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            placeholder="Enter event URL"
            required
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Your Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
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
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
          placeholder="e.g., myevent"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Brief Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
          placeholder="Enter a brief description of the event"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full sage sage-but text-black font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
      >
        Create Event
      </button>
    </form>
  );
};


