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
  // Callers usually pass a fresh function each render; read the latest one
  // through a ref so the Autocomplete is created once, not once per render
  // (stacked instances made every stale listener fire on selection).
  const onPlaceSelectRef = useRef(onPlaceSelect);
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    let cancelled = false;
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    function initAutocomplete() {
      if (cancelled || autocomplete || !inputRef.current) return;

      const instance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['place_id', 'formatted_address', 'address_components'],
      });
      autocomplete = instance;

      listener = instance.addListener('place_changed', () => {
        // Undefined/empty when Enter is pressed before a suggestion resolves.
        const place = instance.getPlace();
        if (!place?.place_id) return;

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

        onPlaceSelectRef.current(components);
      });
    }

    const scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    if (window.google?.maps?.places) {
      initAutocomplete();
    } else if (existing) {
      existing.addEventListener('load', initAutocomplete);
    } else {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', initAutocomplete);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      document.querySelector(`script[src="${scriptSrc}"]`)?.removeEventListener('load', initAutocomplete);
      listener?.remove();
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      className="auth-input"
      placeholder="Search for an address…"
      defaultValue={defaultValue}
      autoComplete="off"
      // Enter picks a suggestion; it shouldn't also submit the surrounding form.
      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
    />
  );
}
