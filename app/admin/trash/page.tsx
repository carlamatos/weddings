import { fetchTrashedUsers } from '@/app/lib/admin-data';
import Pagination, { parseOffset } from '@/app/ui/admin/pagination';
import TrashActions from '@/app/ui/admin/trash-actions';
import { formatDateTime } from '@/app/ui/admin/format';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';

export default async function AdminTrashPage({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
  const offset = parseOffset((await searchParams).offset);
  const { rows, hasMore, error } = await fetchTrashedUsers(offset);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Trash</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        Deleted users wait here with all of their data (page, guest photos, RSVPs, songs). Their uploaded
        files are kept too, so <strong>Restore</strong> brings everything back exactly as it was.
        <strong> Delete permanently</strong> is the only step that can&apos;t be undone.
      </p>

      {error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>
          Couldn&apos;t load the trash: {error}. If this is a new environment, run the schema setup first
          (POST /api/db-setup while signed in as a super admin).
        </div>
      )}

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Page</th>
              <th style={th}>Contents</th>
              <th style={th}>Deleted</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{t.name ?? '—'}</div>
                  <div style={{ color: c.soft }}>{t.email}</div>
                </td>
                <td style={td}>{t.page_slug ? `/${t.page_slug}` : <span style={{ color: c.muted }}>No page</span>}</td>
                <td style={{ ...td, color: c.soft }}>
                  {t.photo_count} guest photo{t.photo_count === 1 ? '' : 's'}
                  <br />
                  {t.gallery_count} gallery image{t.gallery_count === 1 ? '' : 's'}
                  <br />
                  {t.guest_count} guest{t.guest_count === 1 ? '' : 's'} on the list
                </td>
                <td style={td}>
                  {formatDateTime(t.deleted_at)}
                  {t.deleted_by && <div style={{ color: c.muted, fontSize: 11 }}>by {t.deleted_by}</div>}
                </td>
                <td style={td}>
                  <TrashActions trashId={t.id} email={t.email} />
                </td>
              </tr>
            ))}
            {!rows.length && !error && (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={5}>
                  The trash is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination path="/admin/trash" params={{}} offset={offset} hasMore={hasMore} />
    </>
  );
}
