// /app/api/fetch-user-pages/route.ts
import { NextResponse } from 'next/server';
import { fetchUserPages } from '@/app/lib/data';

export async function GET() {
  try {
    const pages = await fetchUserPages();
    return NextResponse.json(pages); // Return JSON data
  } catch (error) {
    console.error('Error fetching user pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch the latest user pages.' },
      { status: 500 }
    );
  }
}