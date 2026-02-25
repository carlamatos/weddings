import { sql } from '@vercel/postgres';
import {
  Revenue,
  Slugs,
  UserPage,
  DBUser,
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
      SELECT *
      FROM user_page
      WHERE slug = ${slug}`;

      

      if (!data.rows[0]) { return undefined; }

      const page = data.rows[0]; // Access the first (and only) row

      return page;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch single user page.');
  }
}

export async function fetchUserPageById(user_id: string){
  try {
    
    const data = await sql<UserPage>`
      SELECT *
      FROM user_page
      WHERE user_id = ${user_id}`;

      if (!data.rows[0]) { return undefined; } 

      const page = data.rows[0]; // Access the first (and only) row

      return page;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch single user page.');
  }
}

