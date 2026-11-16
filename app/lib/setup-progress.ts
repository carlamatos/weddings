import { sql } from '@vercel/postgres';
import type { UserPage } from './definitions';
import type { EditorTarget } from '@/app/ui/themes/open-editor';
import type { DashText } from '@/app/lib/dash-text/en';

// "Your page is 3/6 ready": the steps that turn a new page into one worth
// sharing, each with the dashboard screen where it's done. Shown at the top
// of the sidebar with the next step suggested. The create form asks only for
// the name (the date is optional), so the date, time, place and the owner's
// name come in here.
// action 'profile' opens the profile (name and phone, kept on the account, so
// that step is done for every page once it's filled in). Steps done in the
// page editor name the popup to open there (app/ui/themes/open-editor.ts).

// id 'share': the share step, which the top bar's Share tip waits on.
export type SetupStep = { label: string; done: boolean; section: string; action?: 'profile'; open?: EditorTarget; id?: 'share' };

export type SetupCounts = { guests: number; invited: number; responded: number; shared: boolean; program: number; gallery: number; named: boolean };

// Set (to when) the first time the owner copies or shares the page's link
// from the dashboard (markLinkShared). Sharing it in a group chat is as good
// as inviting guests one by one, so it completes the last step too.
export const LINK_SHARED_SETTING = 'link_shared_at';

// The "send it to your guests" pop-up (shown once per page) and card (closed
// "count|when"; it comes back once, SHARE_CARD_RETURN_DAYS later).
export const SHARE_PROMPT_SHOWN_SETTING = 'share_prompt_shown_at';
export const SHARE_CARD_HIDDEN_SETTING = 'share_card_hidden';
const SHARE_CARD_RETURN_DAYS = 3;
// Events this close get the pop-up and card even before the details are in.
export const SHARE_SOON_DAYS = 14;

export type SharePrompt = { popup: boolean; card: boolean; daysToGo: number | null };

// Whether to push the host to share: the page is live, the event hasn't
// happened, nobody has the link yet (setup's share step isn't done), and the
// page is worth sharing (date, time and place in) or the event is soon.
export function sharePromptFor(page: UserPage, steps: SetupStep[], settings: Record<string, unknown>, today = new Date()): SharePrompt {
  const none: SharePrompt = { popup: false, card: false, daysToGo: null };
  if (page.status !== 'active') return none;
  if (steps.find((s) => s.id === 'share')?.done !== false) return none;
  const todayStr = today.toISOString().slice(0, 10);
  const last = page.event_end_date || page.event_date;
  if (last && last < todayStr) return none;
  const daysToGo = page.event_date && page.event_date >= todayStr
    ? Math.round((Date.parse(page.event_date) - Date.parse(todayStr)) / 86_400_000)
    : page.event_date ? 0 : null; // started, not over yet: it's on now
  const soon = daysToGo !== null && daysToGo <= SHARE_SOON_DAYS;
  if (!steps[0]?.done && !soon) return { ...none, daysToGo };

  const [count, when] = String(settings[SHARE_CARD_HIDDEN_SETTING] ?? '').split('|');
  const hidden = Number(count) || 0;
  const card = hidden === 0
    || (hidden === 1 && !!when && today.getTime() - Date.parse(when) > SHARE_CARD_RETURN_DAYS * 86_400_000);
  return { popup: !settings[SHARE_PROMPT_SHOWN_SETTING], card, daysToGo };
}

export async function fetchSetupCounts(pageId: number | string): Promise<SetupCounts> {
  try {
    const { rows } = await sql<{ guests: string; invited: string; responded: string; shared: boolean; program: string; gallery: string; named: boolean | null }>`
      SELECT
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId})::text AS guests,
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId} AND (invited_at IS NOT NULL OR texted_at IS NOT NULL))::text AS invited,
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId} AND responded_at IS NOT NULL)::text AS responded,
        EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${pageId} AND setting_name = ${LINK_SHARED_SETTING}) AS shared,
        (SELECT COUNT(*) FROM event_program WHERE user_page_id = ${pageId})::text AS program,
        (SELECT COUNT(*) FROM event_gallery WHERE user_page_id = ${pageId})::text AS gallery,
        (SELECT COALESCE(TRIM(u.given_name), '') <> '' AND COALESCE(TRIM(u.family_name), '') <> ''
           FROM users u JOIN user_page p ON p.user_id = u.id WHERE p.id = ${pageId}) AS named
    `;
    return {
      guests: Number(rows[0]?.guests ?? 0),
      invited: Number(rows[0]?.invited ?? 0),
      responded: Number(rows[0]?.responded ?? 0),
      shared: !!rows[0]?.shared,
      program: Number(rows[0]?.program ?? 0),
      gallery: Number(rows[0]?.gallery ?? 0),
      named: rows[0]?.named !== false,
    };
  } catch (error) {
    console.error('Failed to count setup steps:', error);
    return { guests: 0, invited: 0, responded: 0, shared: false, program: 0, gallery: 0, named: true };
  }
}

export function setupSteps(page: UserPage, counts: SetupCounts, t: DashText['setupSteps']): SetupStep[] {
  const filled = (v?: string | null) => !!v && v.trim() !== '';
  return [
    {
      label: filled(page.event_date) ? t.addTheTimeAndPlace : t.addTheDateTimeAndPlace,
      done: filled(page.event_date) && filled(page.event_time) && (page.location === 'virtual' ? filled(page.url) : filled(page.formatted_address) || filled(page.venue_name)),
      section: '',
      open: 'location',
    },
    { label: t.addYourName, done: counts.named, section: '', action: 'profile' },
    { label: t.writeAWelcomeMessage, done: filled(page.description), section: '', open: 'description' },
    // The gallery is empty until the host adds photos (it's hidden till then).
    { label: t.addPhotosToYourGallery, done: counts.gallery > 0, section: '', open: 'gallery' },
    { label: t.planTheDay, done: counts.program > 0, section: '/event-program' },
    // The finish line: the link shared, invitations emailed or texted, or an
    // RSVP in (guests only reply once they have the link). No "add your
    // guests" step: hosts read it as required, but sharing the link is
    // enough, and guests who RSVP join the list by themselves.
    { id: 'share', label: t.shareYourPageWithGuests, done: counts.shared || counts.invited > 0 || counts.responded > 0, section: '/invitations' },
  ];
}
