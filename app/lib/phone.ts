// Contact phone numbers, as hosts type them: any country, any common format.
// Valid: an optional leading +, then digits with spaces, dashes, dots or
// brackets between them — 7 to 15 digits in all (15 is the international
// maximum, E.164) — and an optional extension ("ext. 12", "x12", "#12").
// Letters, other than in the extension, are not allowed.
// Client-safe: shared by the forms and the server actions.

export const PHONE_MAX_LENGTH = 40;
export const PHONE_INVALID_MESSAGE =
  'Please enter a valid phone number, e.g. +1 416 555 0101 or +44 20 7946 0958.';

const EXTENSION = /\s*(?:ext\.?|extension|x|#)\s*\d{1,6}$/i;
const NUMBER = /^\+?[\d\s().-]+$/;

export function isValidPhone(raw: string): boolean {
  const value = raw.trim();
  if (!value || value.length > PHONE_MAX_LENGTH) return false;
  const main = value.replace(EXTENSION, '');
  if (!NUMBER.test(main)) return false;
  const digits = main.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15;
}

// Optional field: empty is fine, otherwise it must be a valid number.
export function isValidOptionalPhone(raw: string | null | undefined): boolean {
  return !raw || !raw.trim() || isValidPhone(raw);
}

// Trimmed, with runs of spaces collapsed; empty becomes null.
export function cleanPhone(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim().replace(/\s+/g, ' ');
  return value || null;
}
