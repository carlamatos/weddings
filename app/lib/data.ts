import { sql } from '@vercel/postgres';
import {
  Revenue,
  Slugs,
  UserPage,
  DBUser,
  EventTheme,
  GalleryImage,
  Guest,
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

export async function fetchGuests(user_id: string): Promise<Guest[]> {
  try {
    const data = await sql<Guest>`
      SELECT eg.*
      FROM event_guests eg
      JOIN user_page up ON up.id = eg.user_page_id
      WHERE up.user_id = ${user_id}
      ORDER BY eg.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Failed to fetch guests:', error);
    return [];
  }
}

export async function fetchGalleryImages(user_id: string): Promise<GalleryImage[]> {
  try {
    const data = await sql<GalleryImage>`
      SELECT eg.*
      FROM event_gallery eg
      JOIN user_page up ON up.id = eg.user_page_id
      WHERE up.user_id = ${user_id}
      ORDER BY eg.created_at ASC
    `;
    return data.rows;
  } catch (error) {
    console.error('Failed to fetch gallery images:', error);
    return [];
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

export async function fetchUserPageById(user_id: string){
  try {

    const data = await sql<UserPage>`
      SELECT up.*, et.slug as theme_slug
      FROM user_page up
      LEFT JOIN event_themes et ON et.theme_id = up.theme_id
      WHERE up.user_id = ${user_id}`;

      if (!data.rows[0]) { return undefined; }
      return normalizePage(data.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch single user page.');
  }
}

