import { sql } from '@vercel/postgres';

// Each guest's meal choices are a column on the guest list (event_guests,
// JSONB: one row per person in the party). It's added on first use, so a
// new environment needs no setup step (it's also in /api/migrate).
let columnReady: Promise<unknown> | null = null;
export function ensureMealsColumn(): Promise<unknown> {
  columnReady ??= (async () => {
    const has = await sql`
      SELECT 1 FROM information_schema.columns WHERE table_name = 'event_guests' AND column_name = 'meals'
    `;
    if (!has.rows.length) await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS meals JSONB`;
  })().catch((error) => { columnReady = null; throw error; });
  return columnReady;
}
