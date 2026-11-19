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

// goal: what the host said they're planning (app/lib/event-goals.ts), or ''
// for pages made before the question. registryOn / giftOn: those sections are
// on; registryLink: the registry has its link; giftSetUp: the exchange has a
// budget or date; giftPeople: who's in the draw.
export type SetupCounts = {
  guests: number; invited: number; responded: number; shared: boolean; program: number; gallery: number; named: boolean;
  goal?: string; registryOn?: boolean; registryLink?: boolean; giftOn?: boolean; giftSetUp?: boolean; giftPeople?: number;
};

// Set (to when) the first time the owner copies or shares the page's link
// from the dashboard (markLinkShared). Sharing it in a group chat is as good
// as inviting guests one by one, so it completes the last step too.
export const LINK_SHARED_SETTING = 'link_shared_at';

// The top bar's Share tip (app/ui/dashboard/share-tip.tsx): shown while the
// page is live, has a date that hasn't passed, and nobody has the link yet
// (the share step isn't done). The date is enough: waiting for the time and
// place too kept the tip from most hosts, who rarely add them first.
// daysToGo: set when the event is this close, and the tip says so. far: the
// event is months away, so the tip suggests sharing it as a save-the-date.
export const SHARE_SOON_DAYS = 14;
export const SAVE_THE_DATE_DAYS = 60;
export type ShareTipState = { show: boolean; daysToGo: number | null; far?: boolean };

export function daysUntil(date: string | null | undefined, today = new Date()): number | null {
  if (!date) return null;
  const todayStr = today.toISOString().slice(0, 10);
  return Math.round((Date.parse(String(date).slice(0, 10)) - Date.parse(todayStr)) / 86_400_000);
}

export function shareTipFor(page: UserPage, steps: SetupStep[], today = new Date()): ShareTipState {
  const none: ShareTipState = { show: false, daysToGo: null };
  if (page.status !== 'active' || !page.event_date) return none;
  if (steps.find((s) => s.id === 'share')?.done !== false) return none;
  const todayStr = today.toISOString().slice(0, 10);
  const last = page.event_end_date || page.event_date;
  if (last < todayStr) return none;
  const days = Math.max(0, daysUntil(page.event_date, today) ?? 0); // started, not over yet: it's on now
  return { show: true, daysToGo: days <= SHARE_SOON_DAYS ? days : null, far: days > SAVE_THE_DATE_DAYS };
}

export async function fetchSetupCounts(pageId: number | string): Promise<SetupCounts> {
  try {
    const { rows } = await sql<{ guests: string; invited: string; responded: string; shared: boolean; program: string; gallery: string; named: boolean | null; goal: string | null; registry_on: boolean; registry_link: boolean; gift_on: boolean; gift_set_up: boolean; gift_people: string }>`
      SELECT
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId})::text AS guests,
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId} AND (invited_at IS NOT NULL OR texted_at IS NOT NULL))::text AS invited,
        (SELECT COUNT(*) FROM event_guests WHERE user_page_id = ${pageId} AND responded_at IS NOT NULL)::text AS responded,
        EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${pageId} AND setting_name = ${LINK_SHARED_SETTING}) AS shared,
        (SELECT COUNT(*) FROM event_program WHERE user_page_id = ${pageId})::text AS program,
        (SELECT COUNT(*) FROM event_gallery WHERE user_page_id = ${pageId})::text AS gallery,
        (SELECT COALESCE(TRIM(u.given_name), '') <> '' AND COALESCE(TRIM(u.family_name), '') <> ''
           FROM users u JOIN user_page p ON p.user_id = u.id WHERE p.id = ${pageId}) AS named,
        (SELECT setting_value FROM user_page_settings WHERE user_page_id = ${pageId} AND setting_name = 'event_goal') AS goal,
        NOT EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${pageId} AND setting_name = 'show_registry' AND setting_value = 'false') AS registry_on,
        EXISTS (SELECT 1 FROM user_page WHERE id = ${pageId} AND COALESCE(TRIM(section_2_button_link), '') <> '') AS registry_link,
        EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${pageId} AND setting_name = 'show_gift_exchange' AND setting_value = 'true') AS gift_on,
        EXISTS (SELECT 1 FROM user_page_settings WHERE user_page_id = ${pageId} AND setting_name IN ('gift_exchange_budget', 'gift_exchange_day', 'gift_exchange_date') AND TRIM(setting_value) <> '') AS gift_set_up,
        (SELECT COUNT(*) FROM page_gift_exchange WHERE user_page_id = ${pageId})::text AS gift_people
    `;
    return {
      guests: Number(rows[0]?.guests ?? 0),
      invited: Number(rows[0]?.invited ?? 0),
      responded: Number(rows[0]?.responded ?? 0),
      shared: !!rows[0]?.shared,
      program: Number(rows[0]?.program ?? 0),
      gallery: Number(rows[0]?.gallery ?? 0),
      named: rows[0]?.named !== false,
      goal: rows[0]?.goal ?? '',
      registryOn: !!rows[0]?.registry_on,
      registryLink: !!rows[0]?.registry_link,
      giftOn: !!rows[0]?.gift_on,
      giftSetUp: !!rows[0]?.gift_set_up,
      giftPeople: Number(rows[0]?.gift_people ?? 0),
    };
  } catch (error) {
    console.error('Failed to count setup steps:', error);
    return { guests: 0, invited: 0, responded: 0, shared: false, program: 0, gallery: 0, named: true, goal: '' };
  }
}

export function setupSteps(page: UserPage, counts: SetupCounts, t: DashText['setupSteps']): SetupStep[] {
  const filled = (v?: string | null) => !!v && v.trim() !== '';
  const all: (SetupStep | false)[] = [
    {
      label: filled(page.event_date) ? t.addTheTimeAndPlace : t.addTheDateTimeAndPlace,
      done: filled(page.event_date) && filled(page.event_time) && (page.location === 'virtual' ? filled(page.url) : filled(page.formatted_address) || filled(page.venue_name)),
      section: '',
      open: 'location',
    },
    { label: t.addYourName, done: counts.named, section: '', action: 'profile' },
    { label: t.writeAWelcomeMessage, done: filled(page.description), section: '', open: 'description' },
    // The gallery is empty until the host adds photos (it's hidden till then).
    // By what the host is planning (app/lib/event-goals.ts): the gift
    // exchange's steps when it's on, and the registry for a wedding or baby
    // shower; a Secret Santa without a party skips the gallery and program.
    counts.giftOn === true && { label: t.setUpTheGiftExchange, done: !!counts.giftSetUp, section: '/gift-exchange' },
    counts.goal === 'secret-santa' && { label: t.addPeopleToTheDraw, done: (counts.giftPeople ?? 0) > 0, section: '/gift-exchange' },
    (counts.goal === 'wedding' || counts.goal === 'baby-shower') && counts.registryOn === true && { label: t.addYourGiftRegistry, done: !!counts.registryLink, section: '/registry' },
    counts.goal !== 'secret-santa' && { label: t.addPhotosToYourGallery, done: counts.gallery > 0, section: '', open: 'gallery' },
    counts.goal !== 'secret-santa' && { label: t.planTheDay, done: counts.program > 0, section: '/event-program' },
    // The finish line: the link shared, invitations emailed or texted, or an
    // RSVP in (guests only reply once they have the link). No "add your
    // guests" step: hosts read it as required, but sharing the link is
    // enough, and guests who RSVP join the list by themselves.
    { id: 'share', label: t.shareYourPageWithGuests, done: counts.shared || counts.invited > 0 || counts.responded > 0, section: '/invitations' },
  ];
  return all.filter((step): step is SetupStep => !!step);
}
