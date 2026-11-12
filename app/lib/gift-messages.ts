import { sql } from '@vercel/postgres';

// Anonymous messages in a Gift Exchange: a Secret Santa can ask their giftee
// a question, and anyone can write to their own Secret Santa, without the
// Santa's name ever being shown. Each message is emailed to its recipient
// with their private link, where they read the conversation and reply.
// Messages belong to one draw: drawing again or clearing the draw removes
// them (clearGiftMessages).

export { GIFT_MESSAGE_MAX } from './gift-messages-shared';

let tableReady: Promise<unknown> | null = null;
export function ensureGiftMessagesTable(): Promise<unknown> {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS page_gift_messages (
      id SERIAL PRIMARY KEY,
      user_page_id INTEGER NOT NULL,
      from_id INTEGER NOT NULL REFERENCES page_gift_exchange(id) ON DELETE CASCADE,
      to_id INTEGER NOT NULL REFERENCES page_gift_exchange(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
    .then(() => sql`CREATE INDEX IF NOT EXISTS idx_page_gift_messages_page ON page_gift_messages (user_page_id)`)
    .catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

export type GiftMessage = { id: number; from_id: number; to_id: number; body: string; created_at: string };

// Every message to or from one participant, oldest first.
export async function fetchGiftMessagesFor(participantId: number): Promise<GiftMessage[]> {
  await ensureGiftMessagesTable();
  const r = await sql<GiftMessage>`
    SELECT id, from_id, to_id, body, created_at FROM page_gift_messages
    WHERE from_id = ${participantId} OR to_id = ${participantId}
    ORDER BY created_at, id`;
  return r.rows;
}

// A new draw (or clearing it) makes old conversations point at the wrong
// people, so they go.
export async function clearGiftMessages(pageId: number): Promise<void> {
  await ensureGiftMessagesTable();
  await sql`DELETE FROM page_gift_messages WHERE user_page_id = ${pageId}`;
}
