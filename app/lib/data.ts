import { sql } from '@vercel/postgres';
import { effectiveTier, maxPagesFor } from './plans';
import {
  Revenue,
  Slugs,
  UserPage,
  DBUser,
  EventTheme,
  GalleryImage,
  Guest,
  GuestPhoto,
  GuestSong,
} from './definitions';

function normalizePage(page: UserPage): UserPage {
  const d = page.event_date as unknown;
  if (d instanceof Date) {
    page.event_date = d.toISOString().split('T')[0];
  } else if (typeof d === 'string' && d.includes('T')) {
    page.event_date = d.split('T')[0];
  }
  return page;
}


export async function fetchUser(email: string){
  try {
    
    const data = await sql<DBUser>`
      SELECT *
      FROM users
      WHERE email = ${email}`;
      
      if (!data.rows[0]) { return undefined; }

      const user = data.rows[0]; // Access the first (and only) row

      return user;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

     console.log('Fetching revenue data...');
     await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}
export async function fetchUserPages(){
  try {
    const data = await sql<Slugs>`
      SELECT slug
      FROM user_page
      ORDER BY user_page.created_at DESC `;

    const pages = data.rows.map((page) => ({
      ...page,
    }));
    
    return pages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the user pages.');
  }
}

export async function fetchUserPage(slug: string){
  try {

    const data = await sql<UserPage>`
      SELECT up.*, et.slug as theme_slug
      FROM user_page up
      LEFT JOIN event_themes et ON et.theme_id = up.theme_id
      WHERE up.slug = ${slug}`;



      if (!data.rows[0]) { return undefined; }
      return normalizePage(data.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch single user page.');
  }
}

export async function fetchEventThemes(): Promise<EventTheme[]> {
  try {
    const data = await sql<EventTheme>`SELECT * FROM event_themes ORDER BY name`;
    return data.rows;
  } catch (error) {
    console.error('Database Error fetching themes:', error);
    return [];
  }
}

export async function fetchGuests(pageId: number): Promise<Guest[]> {
  try {
    const data = await sql<Guest>`
      SELECT eg.*
      FROM event_guests eg
      WHERE eg.user_page_id = ${pageId}
      ORDER BY eg.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Failed to fetch guests:', error);
    return [];
  }
}

export async function fetchGalleryImages(pageId: number | string): Promise<GalleryImage[]> {
  try {
    const data = await sql<GalleryImage>`
      SELECT eg.*
      FROM event_gallery eg
      WHERE eg.user_page_id = ${pageId}
      ORDER BY eg.created_at ASC
    `;
    return data.rows;
  } catch (error) {
    console.error('Failed to fetch gallery images:', error);
    return [];
  }
}

const GUEST_PHOTOS_PAGE_SIZE = 20;

export async function fetchGuestPhotos(
  userPageId: string,
  offset = 0,
): Promise<{ photos: GuestPhoto[]; hasMore: boolean }> {
  try {
    const data = await sql<GuestPhoto>`
      SELECT id, user_page_id, photo, ip_address, uploaded_at
      FROM guests_photos
      WHERE user_page_id = ${userPageId}
      ORDER BY uploaded_at DESC
      LIMIT ${GUEST_PHOTOS_PAGE_SIZE + 1} OFFSET ${offset}
    `;
    const rows = data.rows;
    const hasMore = rows.length > GUEST_PHOTOS_PAGE_SIZE;
    return { photos: hasMore ? rows.slice(0, GUEST_PHOTOS_PAGE_SIZE) : rows, hasMore };
  } catch (error) {
    console.error('Failed to fetch guest photos:', error);
    return { photos: [], hasMore: false };
  }
}

const GUEST_SONGS_PAGE_SIZE = 20;

export async function fetchGuestSongs(
  userPageId: string,
  offset = 0,
): Promise<{ songs: GuestSong[]; hasMore: boolean }> {
  try {
    const data = await sql<GuestSong>`
      SELECT id, user_page_id, requester_name, song_title, artist, ip_address, created_at
      FROM guests_songs
      WHERE user_page_id = ${userPageId}
      ORDER BY created_at DESC
      LIMIT ${GUEST_SONGS_PAGE_SIZE + 1} OFFSET ${offset}
    `;
    const rows = data.rows;
    const hasMore = rows.length > GUEST_SONGS_PAGE_SIZE;
    return { songs: hasMore ? rows.slice(0, GUEST_SONGS_PAGE_SIZE) : rows, hasMore };
  } catch (error) {
    console.error('Failed to fetch guest songs:', error);
    return { songs: [], hasMore: false };
  }
}

export async function fetchUserPageByDomain(domain: string): Promise<UserPage | undefined> {
  try {
    const data = await sql<UserPage>`
      SELECT up.*, et.slug as theme_slug
      FROM user_page up
      LEFT JOIN event_themes et ON et.theme_id = up.theme_id
      WHERE up.custom_domain = ${domain}`;
    return data.rows[0] ? normalizePage(data.rows[0]) : undefined;
  } catch (error) {
    console.error('Database Error:', error);
    return undefined;
  }
}

export async function fetchPageSettings(userPageId: string | number): Promise<Record<string, string>> {
  try {
    const data = await sql<{ setting_name: string; setting_value: string }>`
      SELECT setting_name, setting_value FROM user_page_settings WHERE user_page_id = ${userPageId}
    `;
    return Object.fromEntries(data.rows.map(r => [r.setting_name, r.setting_value]));
  } catch {
    return {};
  }
}

// A page id coming from a URL, form or client call: a positive integer or null.
export function parsePageId(value: unknown): number | null {
  const n = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  return typeof n === 'number' && Number.isInteger(n) && n > 0 ? n : null;
}

// The one way to load a page on behalf of a signed-in user: returns the page
// only if this user owns it. Use it for every dashboard page, server action
// and owner API so one user can never reach another user's page.
export async function fetchOwnedPage(userId: string, pageId: number): Promise<UserPage | undefined> {
  try {
    const data = await sql<UserPage>`
      SELECT up.*, et.slug as theme_slug
      FROM user_page up
      LEFT JOIN event_themes et ON et.theme_id = up.theme_id
      WHERE up.id = ${pageId} AND up.user_id = ${userId}`;
    return data.rows[0] ? normalizePage(data.rows[0]) : undefined;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch page.');
  }
}

// Cheap ownership check for routes that only need a yes/no.
export async function ownsPage(userId: string, pageId: number): Promise<boolean> {
  try {
    const data = await sql`SELECT 1 FROM user_page WHERE id = ${pageId} AND user_id = ${userId}`;
    return data.rows.length > 0;
  } catch (error) {
    console.error('Database Error:', error);
    return false;
  }
}

// All of a user's pages, oldest first.
export async function listOwnedPages(userId: string): Promise<UserPage[]> {
  try {
    const data = await sql<UserPage>`
      SELECT up.*, et.slug as theme_slug
      FROM user_page up
      LEFT JOIN event_themes et ON et.theme_id = up.theme_id
      WHERE up.user_id = ${userId}
      ORDER BY up.created_at ASC, up.id ASC`;
    return data.rows.map(normalizePage);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}

export async function countUserPages(userId: string): Promise<number> {
  const data = await sql`SELECT COUNT(*)::int AS n FROM user_page WHERE user_id = ${userId}`;
  return data.rows[0]?.n ?? 0;
}

// How many pages the user has and how many their plan allows.
export async function fetchPageQuota(userId: string): Promise<{ count: number; limit: number }> {
  const [count, plan] = await Promise.all([countUserPages(userId), fetchUserPlan(userId)]);
  return { count, limit: maxPagesFor(effectiveTier(plan?.plan_type, null)) };
}

export async function fetchUserPlan(user_id: string): Promise<{ plan_type: string; stripe_customer_id: string | null } | null> {
  try {
    const data = await sql`SELECT plan_type, stripe_customer_id FROM user_plans WHERE user_id = ${user_id} LIMIT 1`;
    return (data.rows[0] as { plan_type: string; stripe_customer_id: string | null } | undefined) ?? null;
  } catch {
    return null;
  }
}

