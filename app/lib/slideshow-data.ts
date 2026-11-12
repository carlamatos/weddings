import { sql } from '@vercel/postgres';
import { SLIDESHOW_INITIAL_PHOTOS } from './slideshow';
import { ensureLiveTables } from './live-db';

export type SlideshowPhoto = { id: string; photo: string };

// The newest guest photos, oldest first: the order the slideshow plays them.
export async function fetchSlideshowPhotos(pageId: number | string): Promise<SlideshowPhoto[]> {
  await ensureLiveTables();
  const { rows } = await sql<SlideshowPhoto>`
    SELECT id::text AS id, photo FROM guests_photos
    WHERE user_page_id = ${pageId} AND NOT hidden
    ORDER BY uploaded_at DESC
    LIMIT ${SLIDESHOW_INITIAL_PHOTOS}
  `;
  return rows.reverse();
}
