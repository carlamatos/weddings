import { sql } from '@vercel/postgres';

// Who shows interest in Live Party, for the admin's Activity tab: one row each
// time a host on a free page opens the Live Party box (usePlus().ask, in
// app/ui/dashboard/plus-gate.tsx) or starts a checkout (/api/stripe/checkout).
// Payments themselves are on the page (plan_type, plan_expires_at).
// Server only.

export type PlusInterestKind = 'box' | 'checkout';

// The dashboard section it was about ('/seating', as in PLUS_FEATURES), or
// null when it wasn't from a section (the "Upgrade" button elsewhere).
const SECTION_RE = /^\/[a-z-]{1,40}$/;
export function plusSection(value: unknown): string | null {
  return typeof value === 'string' && SECTION_RE.test(value) ? value : null;
}

let tableReady: Promise<unknown> | null = null;
export function ensurePlusInterestTable(): Promise<unknown> {
  tableReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS plus_interest (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        user_page_id INTEGER NOT NULL,
        kind TEXT NOT NULL,
        section TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS plus_interest_user_idx ON plus_interest (user_id, created_at)`;
  })().catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

// Records it, once: the same host, page, kind and section within 10 seconds
// is the same moment (a double click, or React running the effect twice in
// development). Never throws: it must not get in the host's way.
export async function recordPlusInterest(userId: string, pageId: number, kind: PlusInterestKind, section: string | null): Promise<void> {
  try {
    await ensurePlusInterestTable();
    await sql`
      INSERT INTO plus_interest (user_id, user_page_id, kind, section)
      SELECT ${userId}::uuid, ${pageId}, ${kind}, ${section}
      WHERE NOT EXISTS (
        SELECT 1 FROM plus_interest
        WHERE user_id = ${userId}::uuid AND user_page_id = ${pageId} AND kind = ${kind}
          AND section IS NOT DISTINCT FROM ${section} AND created_at > NOW() - interval '10 seconds'
      )
    `;
  } catch (error) {
    console.error('Failed to record Live Party interest:', error);
  }
}
