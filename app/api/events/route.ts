import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function GET(req: NextRequest) {
  try {
    // Query to retrieve all events
    const query = 'SELECT slug, heading, event_date, location FROM user_page';

    const client = await pool.connect();
    const result = await client.query(query);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No events found' }, { status: 404 });
    }

    // Map events to a simplified format
    const events = result.rows.map((event) => ({
      slug: event.slug,
      title: event.heading,
      eventDate: event.event_date,
      location: event.location,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
