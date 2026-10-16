import { sql } from '@vercel/postgres';
import { nameMatches, SEATING_MAX_MATCHES } from './seating';

// Each guest's table is a column on the guest list (event_guests). It's
// added on first use, so a new environment needs no setup step (it's also
// in /api/migrate).
let columnReady: Promise<unknown> | null = null;
export function ensureSeatingColumn(): Promise<unknown> {
  columnReady ??= (async () => {
    const has = await sql`
      SELECT 1 FROM information_schema.columns WHERE table_name = 'event_guests' AND column_name = 'seating_table'
    `;
    if (!has.rows.length) await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS seating_table TEXT`;
  })().catch((error) => { columnReady = null; throw error; });
  return columnReady;
}

export type SeatMatch = { name: string; table: string };
export type SeatLookup = { matches: SeatMatch[]; tooMany: boolean };

// The seated guests whose name matches what the guest typed. Only names and
// tables leave the database, and nothing when too many guests match.
export async function findSeats(pageId: number | string, query: string): Promise<SeatLookup> {
  await ensureSeatingColumn();
  const { rows } = await sql<SeatMatch>`
    SELECT name, seating_table AS "table" FROM event_guests
    WHERE user_page_id = ${pageId} AND seating_table IS NOT NULL AND seating_table <> ''
  `;
  const matches = rows.filter((r) => nameMatches(query, r.name));
  if (matches.length > SEATING_MAX_MATCHES) return { matches: [], tooMany: true };
  matches.sort((a, b) => a.name.localeCompare(b.name));
  return { matches, tooMany: false };
}
