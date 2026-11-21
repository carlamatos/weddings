import { createHmac, timingSafeEqual } from 'crypto';
import { sql } from '@vercel/postgres';
import { siteUrl } from './site-url';
import { signPageId, verifyPageToken } from './page-token';

// Each guest's own invitation link (/i/<token>) and what it tells the host:
// opened_at, the first time their email app showed the invitation email (a
// tiny image in it, /api/i/open; Apple Mail loads it by itself, so it can be
// early), and viewed_at, the first time they opened the envelope or followed
// a link in the invitation (recorded from the page, /api/i/view, so link
// scanners that only fetch the page don't count). The token is the guest's id
// and a signature, so links can't be guessed. The "invite:" prefix keeps these
// signatures apart from the unsubscribe and page tokens.
const SECRET = process.env.AUTH_SECRET ?? '';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sign = (guestId: string) => createHmac('sha256', SECRET).update(`invite:${guestId.toLowerCase()}`).digest('hex').slice(0, 24);

export const inviteToken = (guestId: string) => `${guestId.toLowerCase()}.${sign(guestId)}`;

// The guest's own link to their invitation.
export const inviteUrl = (guestId: string) => `${siteUrl()}/i/${inviteToken(guestId)}`;

// The page's own link (no guest): for the host's test email and preview.
export const pageInviteUrl = (pageId: number | string) => `${siteUrl()}/i/${signPageId(pageId)}`;

export type InviteRef = { kind: 'guest'; guestId: string } | { kind: 'page'; pageId: number };

export function verifyInviteToken(token: string | null | undefined): InviteRef | null {
  if (!token) return null;
  const t = decodeURIComponent(token);
  const dot = t.lastIndexOf('.');
  if (dot === -1) return null;
  const id = t.slice(0, dot);
  if (UUID_RE.test(id)) {
    const given = t.slice(dot + 1);
    if (!/^[0-9a-f]{24}$/i.test(given)) return null;
    const a = Buffer.from(sign(id), 'hex');
    const b = Buffer.from(given.toLowerCase(), 'hex');
    return a.length === b.length && timingSafeEqual(a, b) ? { kind: 'guest', guestId: id.toLowerCase() } : null;
  }
  const pageId = verifyPageToken(t);
  return pageId === null ? null : { kind: 'page', pageId };
}

// The invitation columns on the guest list, added on first use so a new
// environment needs no setup step (they're also in /api/migrate):
// opened_at / viewed_at (above); seats, the seats the host saved for a
// household, which their RSVP can't go over; invited_events / event_replies,
// the sub-events they're invited to and their answers (app/lib/sub-events.ts);
// save_the_date_at, when their save-the-date was emailed. And the table of
// scheduled sends (app/lib/invitation-send.ts).
const INVITE_COLUMN_COUNT = 6;
let columnsReady: Promise<unknown> | null = null;
export function ensureInviteColumns(): Promise<unknown> {
  columnsReady ??= (async () => {
    const has = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'event_guests' AND column_name IN ('opened_at', 'viewed_at', 'seats', 'invited_events', 'event_replies', 'save_the_date_at')
    `;
    const table = await sql`SELECT to_regclass('public.scheduled_sends') AS t`;
    if (has.rows.length < INVITE_COLUMN_COUNT || !table.rows[0]?.t) await addInviteColumns();
  })().catch((error) => { columnsReady = null; throw error; });
  return columnsReady;
}

export async function addInviteColumns(): Promise<void> {
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ`;
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS seats INTEGER`;
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS invited_events JSONB`;
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS event_replies JSONB`;
  await sql`ALTER TABLE event_guests ADD COLUMN IF NOT EXISTS save_the_date_at TIMESTAMPTZ`;
  await sql`
    CREATE TABLE IF NOT EXISTS scheduled_sends (
      id SERIAL PRIMARY KEY,
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('invitation', 'save_the_date')),
      guest_ids TEXT NOT NULL,
      send_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
      sent_count INTEGER,
      error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS scheduled_sends_due ON scheduled_sends (send_at) WHERE status = 'pending'`;
}

// The email was shown (only for guests it was sent to).
export async function markInviteOpened(guestId: string): Promise<void> {
  await ensureInviteColumns();
  await sql`UPDATE event_guests SET opened_at = NOW() WHERE id = ${guestId}::uuid AND opened_at IS NULL AND invited_at IS NOT NULL`;
}

// The guest opened the envelope or followed a link: that also means the
// email (or text) reached them.
export async function markInviteViewed(guestId: string): Promise<void> {
  await ensureInviteColumns();
  await sql`
    UPDATE event_guests SET viewed_at = COALESCE(viewed_at, NOW()), opened_at = COALESCE(opened_at, CASE WHEN invited_at IS NOT NULL THEN NOW() END)
    WHERE id = ${guestId}::uuid AND viewed_at IS NULL
  `;
}
