import { sql } from '@vercel/postgres';
import { ensureLiveTables } from './live-db';
import { GUEST_MESSAGES_SHOWN, type GuestMessage } from './guest-messages';

// The newest messages first; hidden ones only for the host's dashboard.
export async function fetchGuestMessages(pageId: number | string, includeHidden = false, limit = GUEST_MESSAGES_SHOWN): Promise<GuestMessage[]> {
  await ensureLiveTables();
  const { rows } = await sql<GuestMessage>`
    SELECT id, name, body, hidden, created_at FROM page_guest_messages
    WHERE user_page_id = ${pageId} AND (${includeHidden} OR NOT hidden)
    ORDER BY created_at DESC, id DESC
    LIMIT ${limit}`;
  return rows;
}
