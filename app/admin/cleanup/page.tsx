import { previewPurge } from '@/app/lib/purge';
import { OFFLINE_RETENTION_MONTHS, PURGE_BATCH_LIMIT } from '@/app/lib/retention';
import PurgeButton from '@/app/ui/admin/purge-button';
import Total from '@/app/ui/admin/total';
import { formatDate } from '@/app/ui/admin/format';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';

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
  const { candidates, total, error } = await previewPurge();

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
    </>
  );
}
