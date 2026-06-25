'use client';

import { useState } from 'react';
import { PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
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
    await updateLocation({ location, streetAddress, unitNumber, postalCode, city, country, placeId, formattedAddress, url });
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <p className="dash-card-title">Venue / Location</p>
        <button
          className={`dash-edit-btn${isEditing ? ' dash-edit-btn--save' : ''}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? <CheckIcon style={{ width: 14, height: 14 }} /> : <PencilSquareIcon style={{ width: 14, height: 14 }} />}
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <div className="dash-card-body">
        {isEditing && (
          <div className="dash-edit-fields">
            <div className="dash-field">
              <label>Location Type</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="dash-input dash-select">
                <option value="address">Address</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            {location === 'address' ? (
              <>
                <div className="dash-field">
                  <label>Search Address</label>
                  <AddressAutocomplete onPlaceSelect={handlePlaceSelect} defaultValue={formattedAddress} />
                </div>
                {formattedAddress && <p className="dash-hint">Selected: {formattedAddress}</p>}
                <div className="dash-field">
                  <label>Unit / Suite</label>
                  <input type="text" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} className="dash-input" placeholder="Apt, suite…" />
                </div>
              </>
            ) : (
              <div className="dash-field">
                <label>Event URL</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="dash-input" placeholder="https://…" />
              </div>
            )}
          </div>
        )}

        {location === 'address' ? (
          <>
            <div className="dash-address-lines">
              {streetAddress && <span>{streetAddress}</span>}
              {unitNumber && <span>{unitNumber}</span>}
              {city && <span>{city}</span>}
              {postalCode && <span>{postalCode}</span>}
              {country && <span>{country}</span>}
              {!streetAddress && !city && <span style={{ color: 'var(--ink-soft)', opacity: 0.5 }}>No address set — click Edit to add one.</span>}
            </div>
            {mapSrc && (
              <iframe key={mapSrc} src={mapSrc} className="dash-map-frame" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            )}
          </>
        ) : (
          <div>
            {url
              ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--rose)', fontWeight: 500 }}>{url}</a>
              : <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>No URL set — click Edit to add one.</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}
