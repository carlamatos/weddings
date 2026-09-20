import Link from 'next/link';
import {
  countUserPages,
  fetchAllUserPages,
  type PlanFilter,
  type SortOrder,
  type StatusFilter,
} from '@/app/lib/admin-data';
import { hydrateSubscriptionInfo } from '@/app/lib/subscriptions';
import Pagination, { parseOffset } from '@/app/ui/admin/pagination';
import Total from '@/app/ui/admin/total';
import SubscriptionBadge from '@/app/ui/admin/subscription-badge';
import PageStatusToggle from '@/app/ui/admin/page-status-toggle';
import { formatDate } from '@/app/ui/admin/format';
import { alertError, buttonBase, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';

// Live admin data: never run these queries at build time.
export const dynamic = 'force-dynamic';

type Search = { plan?: string; status?: string; sort?: string; offset?: string };

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const select = {
  padding: '7px 10px',
  borderRadius: 8,
  border: `1px solid ${c.line}`,
  background: '#fff',
  fontSize: 13,
  color: c.ink,
} as const;

export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const plan: PlanFilter = pick(sp.plan, ['all', 'free', 'paid'] as const, 'all');
  const status: StatusFilter = pick(sp.status, ['all', 'active', 'inactive'] as const, 'all');
  const sort: SortOrder = pick(sp.sort, ['newest', 'oldest'] as const, 'newest');
  const offset = parseOffset(sp.offset);

  const filtered = plan !== 'all' || status !== 'all';
  const [{ rows, hasMore, error }, matching, overall] = await Promise.all([
    fetchAllUserPages({ plan, status, sort, offset }),
    countUserPages(plan, status),
    filtered ? countUserPages() : Promise.resolve(null),
  ]);
  await hydrateSubscriptionInfo(rows, (r) => r.user_id);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Pages</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        Deactivating a page shows guests a &ldquo;page unavailable&rdquo; message. The owner can still
        sign in and sees a notice in their dashboard.
      </p>

      <form
        method="get"
        style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}
      >
        <label style={{ fontSize: 12, color: c.soft, display: 'grid', gap: 4 }}>
          Plan
          <select name="plan" defaultValue={plan} style={select}>
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </label>
        <label style={{ fontSize: 12, color: c.soft, display: 'grid', gap: 4 }}>
          Status
          <select name="status" defaultValue={status} style={select}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label style={{ fontSize: 12, color: c.soft, display: 'grid', gap: 4 }}>
          Date created
          <select name="sort" defaultValue={sort} style={select}>
            <option value="newest">Most recent first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <button type="submit" style={{ ...buttonBase, padding: '8px 16px', background: c.ink, color: '#fff' }}>
          Apply
        </button>
        <Link href="/admin/pages" style={{ fontSize: 12, color: c.soft, paddingBottom: 9 }}>
          Reset
        </Link>
      </form>

      {error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>
          Couldn&apos;t load pages: {error}. If this is a new environment, run the schema setup first
          (POST /api/db-setup while signed in as a super admin).
        </div>
      )}

      <Total label={matching === 1 ? 'page' : 'pages'} count={matching} of={overall} />

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Page</th>
              <th style={th}>Owner</th>
              <th style={th}>Plan</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{p.heading || 'Untitled'}</div>
                  <Link href={`/${p.slug}`} target="_blank" style={{ color: c.soft }}>
                    /{p.slug}
                  </Link>
                  {p.custom_domain && <div style={{ color: c.muted, fontSize: 11 }}>{p.custom_domain}</div>}
                </td>
                <td style={td}>{p.user_email}</td>
                <td style={td}>
                  <SubscriptionBadge
                    planType={p.plan_type}
                    periodEnd={p.current_period_end}
                    cancelAtPeriodEnd={p.cancel_at_period_end}
                  />
                </td>
                <td style={td}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: p.status === 'inactive' ? c.amberBg : c.greenBg,
                      color: p.status === 'inactive' ? c.amber : c.green,
                    }}
                  >
                    {p.status === 'inactive' ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{formatDate(p.created_at)}</td>
                <td style={td}>
                  <PageStatusToggle pageId={p.id} status={p.status} />
                </td>
              </tr>
            ))}
            {!rows.length && !error && (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={6}>
                  No pages match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination path="/admin/pages" params={{ plan, status, sort }} offset={offset} hasMore={hasMore} />
    </>
  );
}
