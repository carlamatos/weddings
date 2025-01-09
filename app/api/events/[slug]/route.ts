import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    // Query the database for the event with the matching slug
    const query = 'SELECT * FROM user_page WHERE slug = $1';
    const values = [slug];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const event = result.rows[0];

    // Return the event data
    return NextResponse.json({
      title: event.heading,
      description: event.main_content,
      eventDate: event.event_date,
      location: event.location,
      url: event.url,
      streetAddress: event.street_address,
      unitNumber: event.unit_number,
      postalCode: event.postal_code,
      city: event.city,
      country: event.country,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
