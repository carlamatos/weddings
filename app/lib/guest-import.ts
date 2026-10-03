// Guest list import for the Invitations screen: CSV files, vCard (.vcf)
// files exported from a phone or address book, and the phone's own contact
// picker. Runs in the browser; /api/invitees validates again on the server.

export type ImportedGuest = { name: string; email?: string; phone?: string; guests: number; note?: string };

export const MAX_PARTY_SIZE = 50;
export const MAX_IMPORT = 1000;

export const SAMPLE_CSV = [
  'Name,Email,Guests,Phone,Invitation Notes',
  'Jane Doe,jane@example.com,2,+1 555 010 0001,"Can\'t wait to see you both — the kids are welcome too!"',
  'John Smith,john@example.com,,+1 555 010 0002,',
].join('\n');

export function partySize(raw: unknown): number {
  const n = Math.floor(Number(String(raw ?? '').trim()));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, MAX_PARTY_SIZE) : 1;
}

// RFC 4180-ish: quoted fields, doubled quotes, commas/newlines in quotes.
// Also accepts ; or tab separated files (Excel in some regions).
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, '');
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? '';
  const sep = [',', ';', '\t'].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim()));
}

const HEADERS: Record<keyof ImportedGuest, RegExp> = {
  name: /^(full\s*)?names?$|^guest(\s*name)?$/i,
  email: /^e-?mail(\s*address)?$/i,
  guests: /^(amount\s*of\s*)?guests?$|^party(\s*size)?$|^(number\s*of\s*)?(people|guests|seats)$/i,
  phone: /^(phone|mobile|cell)(\s*(number|#))?$|^tel(ephone)?$/i,
  note: /^(invitation\s*)?notes?$|^(personal\s*)?message$/i,
};

// Maps CSV rows to guests by their header names (any order, any case). A
// file without a recognisable header is read as Name, Email, Guests, Phone,
// Invitation Notes.
export function guestsFromCsv(text: string): ImportedGuest[] {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim());
  const col = (key: keyof ImportedGuest) => header.findIndex((h) => HEADERS[key].test(h));
  const hasHeader = col('name') !== -1;
  const idx = hasHeader
    ? { name: col('name'), email: col('email'), guests: col('guests'), phone: col('phone'), note: col('note') }
    : { name: 0, email: 1, guests: 2, phone: 3, note: 4 };
  return (hasHeader ? rows.slice(1) : rows)
    .map((r) => ({
      name: (r[idx.name] ?? '').trim(),
      email: idx.email >= 0 ? (r[idx.email] ?? '').trim() || undefined : undefined,
      guests: partySize(idx.guests >= 0 ? r[idx.guests] : ''),
      phone: idx.phone >= 0 ? (r[idx.phone] ?? '').trim() || undefined : undefined,
      note: idx.note >= 0 ? (r[idx.note] ?? '').trim() || undefined : undefined,
    }))
    .filter((g) => g.name);
}

// vCard 2.1–4.0 as exported by iPhone, Android, Google and Outlook contacts.
export function guestsFromVCard(text: string): ImportedGuest[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const guests: ImportedGuest[] = [];
  for (const card of unfolded.split(/BEGIN:VCARD/i)) {
    if (!card.trim()) continue;
    const fn = card.match(/^FN[^:\r\n]*:(.+)$/im)?.[1]?.trim();
    const n = card.match(/^N(?:;[^:\r\n]*)?:(.*)$/im)?.[1]?.split(';');
    const name = fn || (n ? [n[1], n[0]].filter(Boolean).join(' ').trim() : '');
    const email = card.match(/^(?:item\d+\.)?EMAIL[^:\r\n]*:(.+)$/im)?.[1]?.trim();
    const phone = card.match(/^(?:item\d+\.)?TEL[^:\r\n]*:(.+)$/im)?.[1]?.trim();
    if (name) guests.push({ name, email, phone, guests: 1 });
  }
  return guests;
}

// The Contact Picker API — Chrome on Android. iPhone Safari doesn't offer it,
// so the screen explains how to share contacts as a .vcf file instead.
export function canPickContacts(): boolean {
  return typeof navigator !== 'undefined' && 'contacts' in navigator && typeof window !== 'undefined' && 'ContactsManager' in window;
}

export async function pickContacts(): Promise<ImportedGuest[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const picked = await (navigator as any).contacts.select(['name', 'email', 'tel'], { multiple: true });
  return (picked as { name?: string[]; email?: string[]; tel?: string[] }[])
    .map((c) => ({ name: c.name?.[0]?.trim() ?? '', email: c.email?.[0], phone: c.tel?.[0], guests: 1 }))
    .filter((g) => g.name);
}
