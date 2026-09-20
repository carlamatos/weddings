import Link from 'next/link';
import { getSuperAdmin, isSuperAdmin } from '@/app/lib/admin';
import { countUsers, fetchAllUsers } from '@/app/lib/admin-data';
import { hydrateSubscriptionInfo } from '@/app/lib/subscriptions';
import Pagination, { parseOffset } from '@/app/ui/admin/pagination';
import Total from '@/app/ui/admin/total';
import SubscriptionBadge from '@/app/ui/admin/subscription-badge';
import TrashUserButton from '@/app/ui/admin/trash-user-button';
import { formatDate } from '@/app/ui/admin/format';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const admin = await getSuperAdmin();
  const offset = parseOffset((await searchParams).offset);

  const [{ rows, hasMore, error }, total] = await Promise.all([fetchAllUsers(offset), countUsers()]);
  await hydrateSubscriptionInfo(rows, (r) => r.id);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Users</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        Deleting a user moves them to the Trash, where they can be restored. Users with an active
        subscription can&apos;t be deleted — deactivate their page from the Pages tab instead.
      </p>

      {error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>
          Couldn&apos;t load users: {error}. If this is a new environment, run the schema setup first
          (POST /api/db-setup while signed in as a super admin).
        </div>
      )}

      <Total label={total === 1 ? 'user' : 'users'} count={total} />

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Page</th>
              <th style={th}>Subscription</th>
              <th style={th}>Joined</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              let blockedReason: string | null = null;
              if (isSuperAdmin(u.email) || u.id === admin?.id) blockedReason = 'Super admin account.';
              else if (u.plan_type === 'paid') {
                blockedReason = 'Active subscription — deactivate the page instead.';
              }
              return (
                <tr key={u.id}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: c.soft }}>{u.email}</div>
                    <div style={{ color: c.muted, fontSize: 11 }}>{u.provider ?? 'unknown'} sign-in</div>
                  </td>
                  <td style={td}>
                    {u.page_slug ? (
                      <>
                        <Link href={`/${u.page_slug}`} target="_blank" style={{ color: c.ink }}>
                          /{u.page_slug}
                        </Link>
                        {u.page_status === 'inactive' && (
                          <div style={{ color: c.amber, fontSize: 11, fontWeight: 600 }}>Deactivated</div>
                        )}
                      </>
                    ) : (
                      <span style={{ color: c.muted }}>No page yet</span>
                    )}
                  </td>
                  <td style={td}>
                    <SubscriptionBadge
                      planType={u.plan_type}
                      periodEnd={u.current_period_end}
                      cancelAtPeriodEnd={u.cancel_at_period_end}
                    />
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{formatDate(u.date)}</td>
                  <td style={td}>
                    <TrashUserButton userId={u.id} email={u.email} blockedReason={blockedReason} />
                  </td>
                </tr>
              );
            })}
            {!rows.length && !error && (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={5}>
                  No users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination path="/admin/users" params={{}} offset={offset} hasMore={hasMore} />
    </>
  );
}
