import { sql } from '@vercel/postgres';
import { effectiveTier, maxPagesFor } from './plans';
import { expireIfPast } from './plan-expiry';
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
  EventProgramItem,
  CustomSection,
  Sponsor,
} from './definitions';
import { CUSTOM_SECTION_COUNT, emptyCustomSection, hasCustomSectionContent, normalizeBlocks } from './custom-sections';

function isoDay(d: unknown): string | undefined {
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.includes('T') ? d.split('T')[0] : d;
  return undefined;
}

function normalizePage(page: UserPage): UserPage {
  page.event_date = isoDay(page.event_date) ?? page.event_date;
  page.event_end_date = isoDay(page.event_end_date) || undefined;
  page.event_end_time = page.event_end_time || undefined;
  return page;
}

export function normalizeEventProgramItem(item: EventProgramItem): EventProgramItem {
  const d = item.event_date as unknown;
  if (d instanceof Date) {
    item.event_date = d.toISOString().split('T')[0];
  } else if (typeof d === 'string' && d.includes('T')) {
    item.event_date = d.split('T')[0];
  }
  return item;
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
      const page = normalizePage(data.rows[0]);
      await expireIfPast(page);
      return page;
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

export async function fetchEventProgram(pageId: number | string): Promise<EventProgramItem[]> {
  try {
    const data = await sql<EventProgramItem>`
      SELECT * FROM event_program
      WHERE user_page_id = ${pageId}
      ORDER BY event_date ASC, start_time ASC NULLS LAST, id ASC
    `;
    return data.rows.map(normalizeEventProgramItem);
  } catch (error) {
    console.error('Failed to fetch event program:', error);
    return [];
  }
}

// The page's three custom sections, always in slot order 1..3 (unsaved slots
// come back empty).
export async function fetchCustomSections(pageId: number | string): Promise<CustomSection[]> {
  const sections = Array.from({ length: CUSTOM_SECTION_COUNT }, (_, i) => emptyCustomSection(i + 1));
  try {
    const data = await sql<{ position: number; title: string; blocks: unknown }>`
      SELECT position, title, blocks FROM page_custom_sections WHERE user_page_id = ${pageId}
    `;
    for (const row of data.rows) {
      const i = Number(row.position) - 1;
      if (sections[i]) sections[i] = { position: i + 1, title: row.title ?? '', blocks: normalizeBlocks(row.blocks) ?? [] };
    }
  } catch (error) {
    console.error('Failed to fetch custom sections:', error);
  }
  return sections;
}

export async function fetchSponsors(pageId: number | string): Promise<Sponsor[]> {
  try {
    const data = await sql<Sponsor>`
      SELECT id, user_page_id, image_url, image_bg, description, position FROM page_sponsors
      WHERE user_page_id = ${pageId}
      ORDER BY position ASC, created_at ASC
    `;
    return data.rows;
  } catch (error) {
    console.error('Failed to fetch sponsors:', error);
    return [];
  }
}

// The registry section's theme props (Plus): empty unless the page is paid
// and the section is switched on.
export function registryProps(
  page: Pick<UserPage, 'section_2_image' | 'section_2_description' | 'section_2_button_text' | 'section_2_button_link'>,
  isPaid: boolean,
  settings: Record<string, string>,
): { registryImage?: string; registryDescription?: string; registryButtonText?: string; registryButtonLink?: string } {
  if (!isPaid || !isSectionOn(settings, 'show_registry')) return {};
  return {
    registryImage: page.section_2_image || undefined,
    registryDescription: page.section_2_description || undefined,
    registryButtonText: page.section_2_button_text || undefined,
    registryButtonLink: page.section_2_button_link || undefined,
  };
}

// What a public page (or the editor preview) shows: nothing unless the page
// is paid and the section is switched on, and only custom sections that have
// something in them.
export async function fetchPlusContent(
  pageId: number | string,
  isPaid: boolean,
  settings: Record<string, string>,
): Promise<{ customSections: CustomSection[]; sponsors: Sponsor[] }> {
  if (!isPaid) return { customSections: [], sponsors: [] };
  const [customSections, sponsors] = await Promise.all([
    isSectionOn(settings, 'show_custom_sections') ? fetchCustomSections(pageId) : Promise.resolve([]),
    isSectionOn(settings, 'show_sponsors') ? fetchSponsors(pageId) : Promise.resolve([]),
  ]);
  return { customSections: customSections.filter(hasCustomSectionContent), sponsors };
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
    if (!data.rows[0]) return undefined;
    const page = normalizePage(data.rows[0]);
    await expireIfPast(page);
    return page;
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

// A section is visible unless its setting is explicitly turned off — the
// only exception is new pages, which set show_event_program='false' at creation.
export function isSectionOn(settings: Record<string, string>, key: string): boolean {
  return settings[key] !== 'false';
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
    if (!data.rows[0]) return undefined;
    const page = normalizePage(data.rows[0]);
    await expireIfPast(page);
    return page;
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
    const pages = data.rows.map(normalizePage);
    await Promise.all(pages.map(expireIfPast));
    return pages;
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

export async function fetchUserPlan(user_id: string): Promise<{ plan_type: string; stripe_customer_id: string | null; plan_expires_at: string | null } | null> {
  try {
    const data = await sql`SELECT plan_type, stripe_customer_id, plan_expires_at FROM user_plans WHERE user_id = ${user_id} LIMIT 1`;
    return (data.rows[0] as { plan_type: string; stripe_customer_id: string | null; plan_expires_at: string | null } | undefined) ?? null;
  } catch {
    return null;
  }
}

