import { sql } from '@vercel/postgres';
import {
  Revenue,
  Slugs,
  UserPage,
  DBUser,
  EventTheme,
  GalleryImage,
  Rsvp,
} from './definitions';


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

      const page = data.rows[0]; // Access the first (and only) row

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

export async function fetchRsvps(user_id: string): Promise<Rsvp[]> {
  try {
    const data = await sql<Rsvp>`
      SELECT er.*
      FROM event_rsvp er
      JOIN user_page up ON up.id = er.user_page_id
      WHERE up.user_id = ${user_id}
      ORDER BY er.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Failed to fetch RSVPs:', error);
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
    return data.rows[0];
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

      const page = data.rows[0]; // Access the first (and only) row

      return page;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch single user page.');
  }
}

