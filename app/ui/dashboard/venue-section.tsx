'use client';

import { useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import AddressAutocomplete, { AddressComponents } from '@/app/ui/address-autocomplete';
import { updateLocation } from '@/app/lib/actions';

interface Props {
  location: string;
  streetAddress?: string;
  unitNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  placeId?: string;
  formattedAddress?: string;
  url?: string;
}

export default function VenueSection({
  location: initialLocation,
  streetAddress: initialStreet = '',
  unitNumber: initialUnit = '',
  city: initialCity = '',
  postalCode: initialPostal = '',
  country: initialCountry = '',
  placeId: initialPlaceId = '',
  formattedAddress: initialFormattedAddress = '',
  url: initialUrl = '',
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState(initialLocation);
  const [streetAddress, setStreetAddress] = useState(initialStreet);
  const [unitNumber, setUnitNumber] = useState(initialUnit);
  const [city, setCity] = useState(initialCity);
  const [postalCode, setPostalCode] = useState(initialPostal);
  const [country, setCountry] = useState(initialCountry);
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [formattedAddress, setFormattedAddress] = useState(initialFormattedAddress);
  const [url, setUrl] = useState(initialUrl);

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapSrc = location === 'address'
    ? placeId
      ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=place_id:${placeId}`
      : formattedAddress
      ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(formattedAddress)}`
      : null
    : null;

  const handlePlaceSelect = (components: AddressComponents) => {
    setStreetAddress(components.streetAddress);
    setCity(components.city);
    setPostalCode(components.postalCode);
    setCountry(components.country);
    setPlaceId(components.placeId);
    setFormattedAddress(components.formattedAddress);
  };

  const handleSave = async () => {
    setIsEditing(false);
    await updateLocation({
      location,
      streetAddress,
      unitNumber,
      postalCode,
      city,
      country,
      placeId,
      formattedAddress,
      url,
    });
  };

  return (
    <div className="wedding-venue-section">
      <div className="section-toolbar">
        <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="edit-but">
          <PencilSquareIcon />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <h2 className="venue-title">VENUE LOCATION</h2>

      {isEditing && (
        <div className="venue-edit-fields">
          <div className="venue-edit-row">
            <label className="registry-edit-label">Location Type</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="setup-input"
            >
              <option value="address">Address</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>

          {location === 'address' ? (
            <>
              <div className="venue-edit-row">
                <label className="registry-edit-label">Search Address</label>
                <AddressAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  defaultValue={formattedAddress}
                />
              </div>
              {formattedAddress && (
                <p className="venue-selected-address">Selected: {formattedAddress}</p>
              )}
              <div className="venue-edit-row">
                <label className="registry-edit-label">Unit / Suite</label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="setup-input"
                  placeholder="Apt, suite, unit..."
                />
              </div>
            </>
          ) : (
            <div className="venue-edit-row">
              <label className="registry-edit-label">Event URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="setup-input"
                placeholder="https://..."
              />
            </div>
          )}
        </div>
      )}

      {location === 'address' ? (
        <div className="venue-inner">
          <div className="venue-address">
            {streetAddress && <p>{streetAddress}</p>}
            {unitNumber && <p>{unitNumber}</p>}
            {city && <p>{city}</p>}
            {postalCode && <p>{postalCode}</p>}
            {country && <p>{country}</p>}
          </div>
          {mapSrc && (
            <iframe
              key={mapSrc}
              src={mapSrc}
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: '0.5rem' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>
      ) : (
        <div className="venue-virtual">
          {url
            ? <a href={url} target="_blank" rel="noopener noreferrer" className="link-auth">{url}</a>
            : <p className="venue-address">No URL set.</p>
          }
        </div>
      )}
    </div>
  );
}
