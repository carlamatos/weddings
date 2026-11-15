import { previewPurge } from '@/app/lib/purge';
import { OFFLINE_RETENTION_MONTHS, PURGE_BATCH_LIMIT, UNCONFIRMED_AFTER_DAYS, UNCONFIRMED_RECENT_DAYS } from '@/app/lib/retention';
import { previewUnconfirmed } from '@/app/lib/unconfirmed';
import UnconfirmedButton from '@/app/ui/admin/unconfirmed-button';
import PurgeButton from '@/app/ui/admin/purge-button';
import Total from '@/app/ui/admin/total';
import { formatDate } from '@/app/ui/admin/format';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cleanup' };

// Live admin data: never run these queries at build time.
export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  inactive: 'Suspended by admin',
  paused: 'Paused (plan limit)',
  deleted: 'Deleted by owner',
};

function monthsAgo(value: Date | string): string {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
  return days >= 60 ? `${Math.floor(days / 30)} months ago` : `${days} days ago`;
}

export default async function AdminCleanupPage() {
  const [{ candidates, total, error }, unconfirmed] = await Promise.all([previewPurge(), previewUnconfirmed()]);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Cleanup</h1>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        Pages that have been <strong>offline for more than {OFFLINE_RETENTION_MONTHS} months</strong> (suspended,
        paused or deleted by their owner) and whose owner is <strong>not on a paid plan</strong>. Deleting them
        frees their web address and storage. Owners&apos; accounts are kept.
      </p>
      <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12, color: c.muted, lineHeight: 1.7 }}>
        <li>The list is re-checked when you confirm — any page that no longer qualifies is skipped.</li>
        <li>Pages whose owner has an active Stripe subscription (or can&apos;t be verified) are skipped.</li>
        <li>At most {PURGE_BATCH_LIMIT} pages are deleted per run; run it again for more.</li>
        <li>Every deletion is recorded in the purge log (no guest data is kept).</li>
      </ul>

      {error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>
          Couldn&apos;t load the list: {error}. If this is a new environment, run the schema setup first
          (POST /api/db-setup while signed in as a super admin).
        </div>
      )}

      <Total label={total === 1 ? 'page qualifies' : 'pages qualify'} count={error ? null : total} />
      {total > candidates.length && (
        <p style={{ margin: '-6px 0 12px', fontSize: 12, color: c.muted }}>
          Showing the {candidates.length} that have been offline longest.
        </p>
      )}

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Page</th>
              <th style={th}>Owner</th>
              <th style={th}>Why it&apos;s offline</th>
              <th style={th}>Offline since</th>
              <th style={th}>Will be deleted</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((p) => (
              <tr key={p.id}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{p.heading || 'Untitled'}</div>
                  <div style={{ color: c.soft }}>/{p.slug}</div>
                  {p.custom_domain && <div style={{ color: c.muted, fontSize: 11 }}>{p.custom_domain}</div>}
                </td>
                <td style={td}>{p.owner_email}</td>
                <td style={td}>{STATUS_LABEL[p.status] ?? p.status}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  {formatDate(p.offline_since)}
                  <div style={{ color: c.muted, fontSize: 11 }}>{monthsAgo(p.offline_since)}</div>
                </td>
                <td style={{ ...td, color: c.soft }}>
                  {p.guest_count} guest{p.guest_count === 1 ? '' : 's'}
                  <br />
                  {p.photo_count} guest photo{p.photo_count === 1 ? '' : 's'}
                  <br />
                  {p.gallery_count} gallery image{p.gallery_count === 1 ? '' : 's'}
                  <br />
                  {p.song_count} song request{p.song_count === 1 ? '' : 's'}
                </td>
              </tr>
            ))}
            {!candidates.length && !error && (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={5}>
                  Nothing to clean up right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20 }}>
        <PurgeButton pageIds={candidates.map((p) => Number(p.id))} />
      </div>

      <h2 style={{ fontSize: 18, margin: '40px 0 6px' }}>Never-confirmed accounts</h2>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        Accounts that <strong>never confirmed their email</strong>, signed up <strong>more than {UNCONFIRMED_AFTER_DAYS} days
        ago</strong> and <strong>never published a page</strong>. Guests have never seen their drafts. Moving them to the
        trash frees their pages&apos; web addresses.
      </p>
      <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12, color: c.muted, lineHeight: 1.7 }}>
        <li>Skipped: anything paid or with a Stripe customer, and owners who opened their dashboard in the last {UNCONFIRMED_RECENT_DAYS} days.</li>
        <li>The list is re-checked when you confirm — an account that confirmed, published or came back since is skipped.</li>
        <li>Accounts go to the <strong>Trash</strong> tab with everything on them, so you can still restore one.</li>
        <li>At most {PURGE_BATCH_LIMIT} accounts per run; run it again for more.</li>
      </ul>

      {unconfirmed.error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>
          Couldn&apos;t load the list: {unconfirmed.error}. If this is a new environment, run the database update first.
        </div>
      )}

      <Total label={unconfirmed.total === 1 ? 'account qualifies' : 'accounts qualify'} count={unconfirmed.error ? null : unconfirmed.total} />
      {unconfirmed.total > unconfirmed.accounts.length && (
        <p style={{ margin: '-6px 0 12px', fontSize: 12, color: c.muted }}>
          Showing the {unconfirmed.accounts.length} oldest.
        </p>
      )}

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Account</th>
              <th style={th}>Signed up</th>
              <th style={th}>Last in dashboard</th>
              <th style={th}>Draft pages</th>
              <th style={th}>On the drafts</th>
            </tr>
          </thead>
          <tbody>
            {unconfirmed.accounts.map((a) => (
              <tr key={a.id}>
                <td style={td}>{a.email}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  {formatDate(a.signed_up)}
                  <div style={{ color: c.muted, fontSize: 11 }}>{monthsAgo(a.signed_up)}</div>
                </td>
                <td style={{ ...td, whiteSpace: 'nowrap', color: c.soft }}>
                  {a.last_dashboard_at ? formatDate(a.last_dashboard_at) : 'Not recorded'}
                </td>
                <td style={td}>
                  {a.pages.length ? (
                    a.pages.map((p) => (
                      <div key={p.slug}>
                        <span style={{ fontWeight: 600 }}>{p.heading || 'Untitled'}</span>{' '}
                        <span style={{ color: c.soft }}>/{p.slug}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ color: c.muted }}>No page</span>
                  )}
                </td>
                <td style={{ ...td, color: c.soft }}>
                  {a.guest_count} guest{a.guest_count === 1 ? '' : 's'}
                  <br />
                  {a.photo_count} gallery image{a.photo_count === 1 ? '' : 's'}
                </td>
              </tr>
            ))}
            {!unconfirmed.accounts.length && !unconfirmed.error && (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={5}>
                  No never-confirmed accounts to clean up right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20 }}>
        <UnconfirmedButton userIds={unconfirmed.accounts.map((a) => a.id)} />
      </div>
    </>
  );
}
