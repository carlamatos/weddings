'use client';
import type { InputHTMLAttributes } from 'react';
import { useToday } from './use-today';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

// A date field for the auth-style forms (app/ui/auth.css). Phones show an
// empty date input as a blank box, so on touch screens it gets a "Choose a
// date" placeholder while empty and a calendar icon; desktop browsers
// already show mm/dd/yyyy and their own calendar button.
// future: only today and later can be picked (an event's date).
export function AuthDateInput({ value, placeholder = 'Choose a date', future = false, ...props }:
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'placeholder'> & { value: string; placeholder?: string; future?: boolean }) {
  const today = useToday();
  return (
    <div className={value ? 'auth-input-wrap auth-date' : 'auth-input-wrap auth-date auth-date--empty'}>
      <input className="auth-input" type="date" value={value} min={future && today ? today : undefined} {...props} />
      <span className="auth-date-placeholder" aria-hidden="true">{placeholder}</span>
      <CalendarDaysIcon className="auth-input-icon auth-date-icon" aria-hidden="true" />
    </div>
  );
}
