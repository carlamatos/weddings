import { sql } from '@vercel/postgres';

// Database pieces for the Live Party extras, added on first use so a new
// environment needs no setup step:
//   guests_photos.hidden        the host hid the photo from the page and slideshow
//   guests_songs.votes          guests' upvotes, kept in step with guests_song_votes
//   guests_songs.played_at      the DJ marked the song as played
//   guests_song_votes           one vote per song per voter (a hash of their IP)
//   page_guest_messages         the live messages wall
let ready: Promise<unknown> | null = null;
export function ensureLiveTables(): Promise<unknown> {
  ready ??= (async () => {
    await sql`ALTER TABLE guests_photos ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE`;
    await sql`ALTER TABLE guests_songs ADD COLUMN IF NOT EXISTS votes INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE guests_songs ADD COLUMN IF NOT EXISTS played_at TIMESTAMPTZ`;
    await sql`
      CREATE TABLE IF NOT EXISTS guests_song_votes (
        song_id UUID NOT NULL REFERENCES guests_songs(id) ON DELETE CASCADE,
        voter TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (song_id, voter)
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS page_guest_messages (
        id SERIAL PRIMARY KEY,
        user_page_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        body TEXT NOT NULL,
        hidden BOOLEAN NOT NULL DEFAULT FALSE,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_page_guest_messages_page ON page_guest_messages (user_page_id, created_at DESC)`;
  })().catch((error) => { ready = null; throw error; });
  return ready;
}
