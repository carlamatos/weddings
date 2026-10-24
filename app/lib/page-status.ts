// A page's status (user_page.status):
//   active     live for guests
//   inactive   deactivated — by the owner or an admin; the owner can turn it
//              back on from their dashboard
//   suspended  taken down by an admin (e.g. inappropriate content); only an
//              admin can bring it back — the owner can't change it
//   draft      not published yet: pages made by an account that hasn't
//              verified its email start here. Only the owner can see it;
//              publishing (publishPage) needs a verified email.
// Inactive, suspended and draft pages are hidden from guests ("page
// unavailable", or "not published yet" for a draft), and their guest forms
// and uploads are closed.

export const PAGE_STATUSES = ['active', 'inactive', 'suspended', 'draft'] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export function isPageStatus(v: unknown): v is PageStatus {
  return typeof v === 'string' && (PAGE_STATUSES as readonly string[]).includes(v);
}

// Hidden from guests.
export function isPageOffline(status?: string | null): boolean {
  return status === 'inactive' || status === 'suspended' || status === 'draft';
}

export function isPageDraft(status?: string | null): boolean {
  return status === 'draft';
}

export function isPageSuspended(status?: string | null): boolean {
  return status === 'suspended';
}
