import { sql } from '@vercel/postgres';
import type { UserPage } from './definitions';
import type { EditorTarget } from '@/app/ui/themes/open-editor';

// "Your page is 3/7 ready": the steps that turn a new page into one worth
// sharing, each with the dashboard screen where it's done. Shown at the top
// of the sidebar with the next step suggested. The create form asks only for
// the basics, so the time, place and the owner's name come in here.
// action 'profile' opens the profile (name and phone, kept on the account, so
// that step is done for every page once it's filled in). Steps done in the
// page editor name the popup to open there (app/ui/themes/open-editor.ts).

export type SetupStep = { label: string; done: boolean; section: string; action?: 'profile'; open?: EditorTarget };

export type SetupCounts = { guests: number; program: number; gallery: number; named: boolean };

export async function fetchSetupCounts(pageId: number | string): Promise<SetupCounts> {
  try {
    const { rows } = await sql<{ guests: string; program: string; gallery: string; named: boolean | null }>`
      SELECT
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId})::text AS guests,
        (SELECT COUNT(*) FROM event_program WHERE user_page_id = ${pageId})::text AS program,
        (SELECT COUNT(*) FROM event_gallery WHERE user_page_id = ${pageId})::text AS gallery,
        (SELECT COALESCE(TRIM(u.given_name), '') <> '' AND COALESCE(TRIM(u.family_name), '') <> ''
           FROM users u JOIN user_page p ON p.user_id = u.id WHERE p.id = ${pageId}) AS named
    `;
    return {
      guests: Number(rows[0]?.guests ?? 0),
      program: Number(rows[0]?.program ?? 0),
      gallery: Number(rows[0]?.gallery ?? 0),
      named: rows[0]?.named !== false,
    };
  } catch (error) {
    console.error('Failed to count setup steps:', error);
    return { guests: 0, program: 0, gallery: 0, named: true };
  }
}

export function setupSteps(page: UserPage, counts: SetupCounts): SetupStep[] {
  const filled = (v?: string | null) => !!v && v.trim() !== '';
  return [
    {
      label: 'Add the time and place',
      done: filled(page.event_time) && (page.location === 'virtual' ? filled(page.url) : filled(page.formatted_address) || filled(page.venue_name)),
      section: '',
      open: 'location',
    },
    { label: 'Add your name', done: counts.named, section: '', action: 'profile' },
    { label: 'Add your own banner photo', done: filled(page.banner_image), section: '', open: 'banner' },
    { label: 'Write a welcome message', done: filled(page.description), section: '', open: 'description' },
    // The gallery is empty until the host adds photos (it's hidden till then).
    { label: 'Add photos to your gallery', done: counts.gallery > 0, section: '', open: 'gallery' },
    { label: 'Plan the day in the Event Program', done: counts.program > 0, section: '/event-program' },
    { label: 'Add your guests', done: counts.guests > 0, section: '/guest-list' },
  ];
}
