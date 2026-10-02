// Plus: the Potluck section — guests say what they're bringing. One entry per
// email per page (re-submitting with the same email updates it). Shared by
// the API, the dashboard and the themes, so no server-only imports.
//
// Settings (user_page_settings), both OFF unless explicitly 'true' — unlike
// most sections, which are on by default:
//   show_potluck          the section is on the page
//   show_potluck_entries  everyone's entries are listed on the page too
//                         (otherwise only the host sees them, in the dashboard)

export const POTLUCK_NAME_MAX = 120;
export const POTLUCK_ITEMS_MAX = 500;
export const POTLUCK_NOTE_MAX = 500;
export const POTLUCK_MAX_ENTRIES = 500;

export type PotluckPublicEntry = { name: string; items: string };

export type PotluckEntry = PotluckPublicEntry & {
  id: number;
  email: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

// What a theme gets: the signed page token for submissions, and the entries
// only when the host chose to show them.
export type PotluckProps = {
  token: string;
  showEntries: boolean;
  entries: PotluckPublicEntry[];
};

export function isPotluckOn(settings: Record<string, string>): boolean {
  return settings['show_potluck'] === 'true';
}

export function arePotluckEntriesPublic(settings: Record<string, string>): boolean {
  return settings['show_potluck_entries'] === 'true';
}

// Only the first name (and an initial) on the public list.
export function publicName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? '';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
