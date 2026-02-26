'use client';

import { useEffect, useRef } from 'react';

export interface AddressComponents {
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  formattedAddress: string;
  placeId: string;
}

interface Props {
  onPlaceSelect: (components: AddressComponents) => void;
  defaultValue?: string;
}

export default function AddressAutocomplete({ onPlaceSelect, defaultValue }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    const scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    if (existing) {
      existing.addEventListener('load', initAutocomplete);
      return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);
  }, []);

  function initAutocomplete() {
    if (!inputRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['place_id', 'formatted_address', 'address_components'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.place_id) return;

      const components: AddressComponents = {
        streetAddress: '',
        postalCode: '',
        city: '',
        country: '',
        formattedAddress: place.formatted_address || '',
        placeId: place.place_id,
      };

      for (const component of place.address_components || []) {
        const type = component.types[0];
        if (type === 'street_number') components.streetAddress = component.long_name + ' ';
        if (type === 'route') components.streetAddress += component.long_name;
        if (type === 'locality') components.city = component.long_name;
        if (type === 'postal_code') components.postalCode = component.long_name;
        if (type === 'country') components.country = component.long_name;
      }

      onPlaceSelect(components);
    });
  }

  return (
    <input
      ref={inputRef}
      type="text"
      className="setup-input"
      placeholder="Search for an address..."
      defaultValue={defaultValue}
      autoComplete="off"
    />
  );
}
