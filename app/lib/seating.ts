// Find Your Table (Plus): the host gives each guest on the guest list a
// table, and guests look theirs up at <page>/table — usually from a QR sign
// at the entrance — instead of the host printing a seating chart. Shared by
// client and server, so no server-only imports (the database side is in
// seating-data.ts).

export const SEATING_SETTING = 'show_seating';
export const SEATING_TABLE_MAX = 60;
// More matches than this and nobody is shown: the guest is asked for their
// full name. Keeps the lookup from listing the whole seating plan one
// letter at a time.
export const SEATING_MAX_MATCHES = 6;
export const SEATING_QUERY_MAX = 80;

// Off until the host switches it on, and only on Plus pages.
export function isSeatingOn(settings: Record<string, string>, isPaid: boolean): boolean {
  return isPaid && settings[SEATING_SETTING] === 'true';
}

// '' (no table) or the table's name as the host typed it, tidied.
export function cleanTableName(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, SEATING_TABLE_MAX) : '';
}

// Lower case, accents and punctuation gone, so "José O'Neil" is found as
// "jose oneil" or "jose o neil".
export function nameWords(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// The same name, in any order ("Smith, Ana" is Ana Smith).
export function sameName(a: string, b: string): boolean {
  return nameWords(a).sort().join(' ') === nameWords(b).sort().join(' ');
}

// Every word the guest typed starts one of the words of the guest's name:
// "ana m" finds "Ana Martínez", "martinez" finds her too.
export function nameMatches(query: string, name: string): boolean {
  const q = nameWords(query);
  if (!q.length) return false;
  const words = nameWords(name);
  return q.every((part) => words.some((w) => w.startsWith(part)));
}

// The table names in use, in a natural order (Table 2 before Table 10).
export function sortTables(tables: Iterable<string>): string[] {
  return [...new Set(tables)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

// A pasted seating chart, one guest per line: "Name, Table" or the two
// columns copied from a spreadsheet (tab between them). The last column is
// the table and the columns before it are the name, so "Smith, Ana, 4"
// still works.
export function parseSeatingPaste(text: string): { name: string; table: string }[] {
  const rows: { name: string; table: string }[] = [];
  for (const line of text.split(/\r?\n/)) {
    const cols = (line.includes('\t') ? line.split('\t') : line.split(/[,;]/)).map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2) continue;
    const table = cleanTableName(cols[cols.length - 1]);
    const name = cols.slice(0, -1).join(' ').replace(/\s+/g, ' ').trim();
    if (/^(guest\s*)?names?$/i.test(name)) continue; // a header row
    if (name && table) rows.push({ name, table });
  }
  return rows;
}
