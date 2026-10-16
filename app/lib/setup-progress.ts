import { sql } from '@vercel/postgres';
import type { UserPage } from './definitions';

// "Your page is 3/5 ready": the steps that turn a new page into one worth
// sharing, each with the dashboard screen where it's done. Shown at the top
// of the sidebar with the next step suggested.

export type SetupStep = { label: string; done: boolean; section: string };

export async function fetchSetupCounts(pageId: number | string): Promise<{ guests: number; program: number }> {
  try {
    const { rows } = await sql<{ guests: string; program: string }>`
      SELECT
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId})::text AS guests,
        (SELECT COUNT(*) FROM event_program WHERE user_page_id = ${pageId})::text AS program
    `;
    return { guests: Number(rows[0]?.guests ?? 0), program: Number(rows[0]?.program ?? 0) };
  } catch (error) {
    console.error('Failed to count setup steps:', error);
    return { guests: 0, program: 0 };
  }
}

export function setupSteps(page: UserPage, counts: { guests: number; program: number }): SetupStep[] {
  const filled = (v?: string | null) => !!v && v.trim() !== '';
  return [
    { label: 'Add the date and place', done: filled(page.event_date) && (filled(page.formatted_address) || filled(page.location) || filled(page.venue_name)), section: '' },
    { label: 'Add your own banner photo', done: filled(page.banner_image), section: '' },
    { label: 'Write a welcome message', done: filled(page.description), section: '' },
    { label: 'Plan the day in the Event Program', done: counts.program > 0, section: '/event-program' },
    { label: 'Add your guests', done: counts.guests > 0, section: '/guest-list' },
  ];
}
