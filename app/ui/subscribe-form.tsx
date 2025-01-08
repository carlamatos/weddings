"use client"
import React, { useState } from 'react';

const SubscribeForm: React.FC = () => {
  const [slug, setSlug] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/create-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, eventName, eventDate, location, email, description }),
    });

    if (response.ok) {
      alert('Event created successfully!');
      window.location.href = `/${slug}`; // Redirect to the new page
    } else {
      const { message } = await response.json();
      alert(`Error: ${message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="setup">
      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        required
      />
      <input
        type="date"
        placeholder="Event Date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Choose a URL (slug, e.g., myevent)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />
      <textarea
        placeholder="Brief description of the event"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      ></textarea>
      <button type="submit">Create Event</button>
    </form>
  );
};

export default SubscribeForm;
