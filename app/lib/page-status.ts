// A page's status (user_page.status):
//   active     live for guests
//   inactive   deactivated — by the owner or an admin; the owner can turn it
//              back on from their dashboard
//   suspended  taken down by an admin (e.g. inappropriate content); only an
//              admin can bring it back — the owner can't change it
// Inactive and suspended pages show "page unavailable" to guests, and their
// guest forms and uploads are closed.

export const PAGE_STATUSES = ['active', 'inactive', 'suspended'] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export function isPageStatus(v: unknown): v is PageStatus {
  return typeof v === 'string' && (PAGE_STATUSES as readonly string[]).includes(v);
}

// Hidden from guests.
export function isPageOffline(status?: string | null): boolean {
  return status === 'inactive' || status === 'suspended';
}

export function isPageSuspended(status?: string | null): boolean {
  return status === 'suspended';
}
