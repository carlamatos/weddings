import { sql } from '@vercel/postgres';
import { ensureUserCreatedAt } from './user-joined';
import { ensureNewsletterTable } from './newsletter';
import type { QueryResultRow } from '@vercel/postgres';

export const ADMIN_PAGE_SIZE = 25;

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  provider: string | null;
  date: Date | string | null;
  created_at: Date | string | null; // when they signed up (see app/lib/user-joined.ts)
  email_verified_at: Date | string | null; // null = not verified yet
  plan_type: string;
  stripe_customer_id: string | null;
  current_period_end: Date | string | null;
  cancel_at_period_end: boolean;
  page_id: number | null;
  page_slug: string | null;
  page_heading: string | null;
  page_status: string | null;
  page_count: number;
};

export type AdminPageRow = {
  id: number;
  slug: string;
  heading: string | null;
  user_id: string;
  user_email: string;
  created_at: Date | string | null;
  event_date: Date | string | null;
  custom_domain: string | null;
  plan_type: string;
  status: string;
  stripe_customer_id: string | null;
  current_period_end: Date | string | null;
  cancel_at_period_end: boolean;
};

export type TrashedUserRow = {
  id: number;
  user_id: string;
  email: string;
  name: string | null;
  deleted_at: Date | string;
  deleted_by: string | null;
  page_slug: string | null;
  photo_count: number;
  gallery_count: number;
  guest_count: number;
};

export type PlanFilter = 'all' | 'free' | 'paid';
export type StatusFilter = 'all' | 'active' | 'inactive' | 'suspended';
export type SortOrder = 'newest' | 'oldest';

// Search: what an admin types, as an ILIKE pattern ('' = no search). LIKE's
// own wildcards are escaped, so "%" or "_" match literally.
export const ADMIN_SEARCH_MAX = 100;
export function searchPattern(raw: string | null | undefined): string {
  const term = (raw ?? '').trim().slice(0, ADMIN_SEARCH_MAX);
  if (!term) return '';
  return `%${term.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

// A pasted event link is reduced to what's stored: "https://mygala.ca/ana-ben"
// → "ana-ben", "https://www.anaben.com/" → "anaben.com", "/ana-ben" → "ana-ben".
export function pageSearchTerm(raw: string | null | undefined): string {
  let term = (raw ?? '').trim();
  const url = term.match(/^(?:https?:\/\/)?(?:www\.)?([^/\s?#]+)(\/[^\s?#]*)?/i);
  if (url && (/^https?:\/\//i.test(term) || /\.[a-z]{2,}$/i.test(url[1]) || url[2])) {
    const host = url[1].toLowerCase();
    const path = (url[2] ?? '').replace(/^\/+|\/+$/g, '');
    term = /(^|\.)mygala\.ca$/.test(host) || /^localhost(:\d+)?$/.test(host) ? path || host : path ? `${host}/${path}` : host;
  }
  return term.replace(/^\/+/, '');
}

// SQL lives in plain strings so it can also be run directly in tests.
export const USERS_SQL = `
  SELECT u.id, u.name, u.email, u.provider, u.date, u.created_at, u.email_verified_at,
         COALESCE(pl.plan_type, p.plan_type, 'free') AS plan_type,
         COALESCE(pl.stripe_customer_id, p.stripe_customer_id) AS stripe_customer_id,
         pl.current_period_end,
         COALESCE(pl.cancel_at_period_end, false) AS cancel_at_period_end,
         p.id AS page_id, p.slug AS page_slug, p.heading AS page_heading,
         COALESCE(p.status, 'active') AS page_status,
         (SELECT count(*)::int FROM user_page WHERE user_id = u.id) AS page_count
  FROM users u
  LEFT JOIN user_plans pl ON pl.user_id = u.id::text
  LEFT JOIN LATERAL (
    SELECT id, slug, heading, status, plan_type, stripe_customer_id
    FROM user_page WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
  ) p ON true
  WHERE ${USER_SEARCH('$1')}
  ORDER BY COALESCE(u.created_at, u.date::timestamp AT TIME ZONE 'UTC') DESC NULLS LAST, u.email
  LIMIT $2 OFFSET $3
`;

// Users: name (or first + last name) or email.
function USER_SEARCH(param: string): string {
  return `(${param}::text = '' OR u.email ILIKE ${param} OR u.name ILIKE ${param}
    OR concat_ws(' ', u.given_name, u.family_name) ILIKE ${param})`;
}

// Pages: the owner's account email, the page's contact email, the event name
// (line breaks count as spaces), its address (slug) or custom domain.
function PAGE_SEARCH(param: string): string {
  return `(${param}::text = '' OR owner.email ILIKE ${param} OR p.user_email ILIKE ${param}
    OR regexp_replace(COALESCE(p.heading, ''), '\\s+', ' ', 'g') ILIKE ${param}
    OR p.slug ILIKE ${param} OR p.custom_domain ILIKE ${param})`;
}

export const PAGES_SQL = `
  SELECT p.id, p.slug, p.heading, p.user_id, p.user_email, p.created_at, p.event_date, p.custom_domain,
         COALESCE(p.plan_type, 'free') AS plan_type,
         COALESCE(p.status, 'active') AS status,
         COALESCE(pl.stripe_customer_id, p.stripe_customer_id) AS stripe_customer_id,
         pl.current_period_end,
         COALESCE(pl.cancel_at_period_end, false) AS cancel_at_period_end
  FROM user_page p
  LEFT JOIN user_plans pl ON pl.user_id = p.user_id::text
  LEFT JOIN users owner ON owner.id = p.user_id
  WHERE ($1 = 'all' OR COALESCE(p.plan_type, 'free') = $1)
    AND ($2 = 'all' OR COALESCE(p.status, 'active') = $2)
    AND ${PAGE_SEARCH('$4')}
  ORDER BY (CASE WHEN $3 = 'oldest' THEN p.created_at END) ASC NULLS LAST, p.created_at DESC
  LIMIT $5 OFFSET $6
`;

export const TRASH_SQL = `
  SELECT id, user_id, email, name, deleted_at, deleted_by,
         snapshot #>> '{tables,user_page,0,slug}' AS page_slug,
         COALESCE(jsonb_array_length(snapshot #> '{tables,guests_photos}'), 0) AS photo_count,
         COALESCE(jsonb_array_length(snapshot #> '{tables,event_gallery}'), 0) AS gallery_count,
         COALESCE(jsonb_array_length(snapshot #> '{tables,event_guests}'), 0) AS guest_count
  FROM deleted_users
  WHERE restored_at IS NULL
  ORDER BY deleted_at DESC
  LIMIT $1 OFFSET $2
`;

export const USERS_COUNT_SQL = `SELECT count(*)::int AS n FROM users u WHERE ${USER_SEARCH('$1')}`;

export const PAGES_COUNT_SQL = `
  SELECT count(*)::int AS n FROM user_page p
  LEFT JOIN users owner ON owner.id = p.user_id
  WHERE ($1 = 'all' OR COALESCE(p.plan_type, 'free') = $1)
    AND ($2 = 'all' OR COALESCE(p.status, 'active') = $2)
    AND ${PAGE_SEARCH('$3')}
`;

export const TRASH_COUNT_SQL = `SELECT count(*)::int AS n FROM deleted_users WHERE restored_at IS NULL`;

// Event pages their owners deleted (page trash), newest first.
export type DeletedPageRow = {
  id: number;
  page_id: number;
  slug: string;
  heading: string | null;
  owner_email: string | null;
  plan_type: string | null;
  custom_domain: string | null;
  deleted_at: Date | string;
  deleted_by: string | null;
  purge_after: Date | string;
  photo_count: number;
  gallery_count: number;
  guest_count: number;
};

export const DELETED_PAGES_SQL = `
  SELECT id, page_id, slug, heading, owner_email, plan_type, custom_domain, deleted_at, deleted_by, purge_after,
         COALESCE(jsonb_array_length(snapshot #> '{tables,guests_photos}'), 0) AS photo_count,
         COALESCE(jsonb_array_length(snapshot #> '{tables,event_gallery}'), 0) AS gallery_count,
         COALESCE(jsonb_array_length(snapshot #> '{tables,event_guests}'), 0) AS guest_count
  FROM deleted_pages
  WHERE restored_at IS NULL
  ORDER BY deleted_at DESC
  LIMIT $1 OFFSET $2
`;
export const DELETED_PAGES_COUNT_SQL = `SELECT count(*)::int AS n FROM deleted_pages WHERE restored_at IS NULL`;

type Listed<T> = { rows: T[]; hasMore: boolean; error: string | null };

// Fetch one extra row to learn whether there is another page.
async function list<T extends QueryResultRow>(text: string, params: unknown[], offset: number): Promise<Listed<T>> {
  try {
    const result = await sql.query<T>(text, [...params, ADMIN_PAGE_SIZE + 1, offset]);
    const hasMore = result.rows.length > ADMIN_PAGE_SIZE;
    return { rows: hasMore ? result.rows.slice(0, ADMIN_PAGE_SIZE) : result.rows, hasMore, error: null };
  } catch (error) {
    console.error('Admin list query failed:', error);
    return {
      rows: [],
      hasMore: false,
      error: error instanceof Error ? error.message : 'Query failed',
    };
  }
}

// joined: 'newest' (the default) or 'oldest' first, by when they signed up.
export async function fetchAllUsers(offset = 0, search = '', joined: 'newest' | 'oldest' = 'newest') {
  await ensureUserCreatedAt().catch((error) => console.error('Could not add users.created_at:', error));
  const text = joined === 'oldest' ? USERS_SQL.replace(') DESC NULLS LAST, u.email', ') ASC NULLS LAST, u.email') : USERS_SQL;
  return list<AdminUserRow>(text, [searchPattern(search)], offset);
}

export async function fetchAllUserPages(opts: {
  plan: PlanFilter;
  status: StatusFilter;
  sort: SortOrder;
  search?: string;
  offset?: number;
}) {
  return list<AdminPageRow>(PAGES_SQL, [opts.plan, opts.status, opts.sort, searchPattern(pageSearchTerm(opts.search))], opts.offset ?? 0);
}

export async function fetchTrashedUsers(offset = 0) {
  return list<TrashedUserRow>(TRASH_SQL, [], offset);
}

export async function fetchDeletedPages(offset = 0) {
  return list<DeletedPageRow>(DELETED_PAGES_SQL, [], offset);
}

// Totals shown above each table. null means the count couldn't be read
// (e.g. schema setup not run yet) — the list itself reports the error.
async function count(text: string, params: unknown[] = []): Promise<number | null> {
  try {
    const result = await sql.query<{ n: number }>(text, params);
    return result.rows[0]?.n ?? 0;
  } catch {
    return null;
  }
}

export const countUsers = (search = '') => count(USERS_COUNT_SQL, [searchPattern(search)]);
export const countTrashedUsers = () => count(TRASH_COUNT_SQL);
export const countDeletedPages = () => count(DELETED_PAGES_COUNT_SQL);
export const countUserPages = (plan: PlanFilter = 'all', status: StatusFilter = 'all', search = '') =>
  count(PAGES_COUNT_SQL, [plan, status, searchPattern(pageSearchTerm(search))]);

// ── Newsletter (Admin → Newsletter) ────────────────────────────────────────
// Everyone on the list, newest first, with their account if the address has
// one. consent_text is null for people who joined before the CASL wording was
// saved (app/lib/newsletter-consent.ts), so there's no proof of what they saw.
export type NewsletterSubscriberRow = {
  id: number;
  email: string;
  source: string | null;
  subscribed_at: Date | string;
  unsubscribed_at: Date | string | null;
  consent_text: string | null;
  user_name: string | null;
};

const NEWSLETTER_SQL = `
  SELECT n.id, n.email, n.source, n.subscribed_at, n.unsubscribed_at, n.consent_text, u.name AS user_name
  FROM newsletter_subscribers n
  LEFT JOIN users u ON lower(u.email) = n.email
  ORDER BY n.subscribed_at DESC, n.id DESC
  LIMIT $1 OFFSET $2
`;
const NEWSLETTER_COUNT_SQL = `
  SELECT count(*) FILTER (WHERE unsubscribed_at IS NULL)::int AS n FROM newsletter_subscribers
`;

export async function fetchNewsletterSubscribers(offset = 0) {
  await ensureNewsletterTable().catch((error) => console.error('Could not create newsletter_subscribers:', error));
  return list<NewsletterSubscriberRow>(NEWSLETTER_SQL, [], offset);
}
export const countNewsletterSubscribers = () => count(NEWSLETTER_COUNT_SQL);
