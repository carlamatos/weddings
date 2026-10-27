// One CSV cell, quoted. Guests type names, notes and dishes themselves, and
// a spreadsheet runs a cell starting with = + - @ (or a tab / return) as a
// formula, so those get a leading apostrophe and open as plain text. Phone
// numbers (+1 604 555 0123) are left alone: digits can't do any harm.
export function csvCell(value: unknown): string {
  const text = String(value ?? '');
  const risky = /^[=+\-@\t\r]/.test(text) && !/^\+?[\d\s().-]+$/.test(text);
  const safe = risky ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
