import Link from 'next/link';
import { countDeletedPages, countTrashedUsers, fetchDeletedPages, fetchTrashedUsers } from '@/app/lib/admin-data';
import Pagination, { parseOffset } from '@/app/ui/admin/pagination';
import Total from '@/app/ui/admin/total';
import TrashActions from '@/app/ui/admin/trash-actions';
import PageTrashActions from '@/app/ui/admin/page-trash-actions';
import { formatDateTime } from '@/app/ui/admin/format';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';

// Live admin data: never run these queries at build time.
export const dynamic = 'force-dynamic';

type View = 'users' | 'pages';

const tab = (active: boolean): React.CSSProperties => ({
  padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: 'none',
  border: `1px solid ${active ? c.ink : c.line}`, background: active ? c.ink : '#fff', color: active ? '#fff' : c.ink,
});

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export default async function AdminTrashPage({ searchParams }: { searchParams: Promise<{ offset?: string; view?: string }> }) {
  const sp = await searchParams;
  const view: View = sp.view === 'pages' ? 'pages' : 'users';
  const offset = parseOffset(sp.offset);
  const [userTotal, pageTotal] = await Promise.all([countTrashedUsers(), countDeletedPages()]);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Trash</h1>
      <div style={{ display: 'flex', gap: 8, margin: '10px 0 18px' }}>
        <Link href="/admin/trash" style={tab(view === 'users')}>Users{userTotal ? ` (${userTotal})` : ''}</Link>
        <Link href="/admin/trash?view=pages" style={tab(view === 'pages')}>Pages{pageTotal ? ` (${pageTotal})` : ''}</Link>
      </div>
      {view === 'users' ? <UsersTrash offset={offset} total={userTotal} /> : <PagesTrash offset={offset} total={pageTotal} />}
    </>
  );
}

async function UsersTrash({ offset, total }: { offset: number; total: number | null }) {
  const { rows, hasMore, error } = await fetchTrashedUsers(offset);
  return (
    <>
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

      <Total label={total === 1 ? 'user in the trash' : 'users in the trash'} count={total} />

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
                  {plural(t.photo_count, 'guest photo')}
                  <br />
                  {plural(t.gallery_count, 'gallery image')}
                  <br />
                  {plural(t.guest_count, 'guest')} on the list
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
                  No users in the trash.
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

async function PagesTrash({ offset, total }: { offset: number; total: number | null }) {
  const { rows, hasMore, error } = await fetchDeletedPages(offset);
  return (
    <>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        Event pages their owners deleted. Each waits here for 30 days with everything on it (guests, RSVPs, photos,
        settings) and its uploaded files, so <strong>Restore</strong> puts it back live at the same address, exactly as it
        was. After 30 days it&apos;s removed automatically, files included.
      </p>

      {error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>
          Couldn&apos;t load deleted pages: {error}. If this is a new environment, run the schema setup first
          (POST /api/db-setup while signed in as a super admin).
        </div>
      )}

      <Total label={total === 1 ? 'page in the trash' : 'pages in the trash'} count={total} />

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Page</th>
              <th style={th}>Owner</th>
              <th style={th}>Contents</th>
              <th style={th}>Deleted</th>
              <th style={th}>Removed for good</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{p.heading || 'Untitled event'}</div>
                  <div style={{ color: c.soft }}>/{p.slug}</div>
                  {p.custom_domain && <div style={{ color: c.muted, fontSize: 11 }}>{p.custom_domain}</div>}
                  {p.plan_type === 'paid' && <div style={{ color: c.muted, fontSize: 11 }}>Plus</div>}
                </td>
                <td style={{ ...td, color: c.soft }}>{p.owner_email ?? '—'}</td>
                <td style={{ ...td, color: c.soft }}>
                  {plural(p.guest_count, 'guest')}
                  <br />
                  {plural(p.photo_count, 'guest photo')}
                  <br />
                  {plural(p.gallery_count, 'gallery image')}
                </td>
                <td style={td}>
                  {formatDateTime(p.deleted_at)}
                  {p.deleted_by && <div style={{ color: c.muted, fontSize: 11 }}>by {p.deleted_by}</div>}
                </td>
                <td style={td}>{formatDateTime(p.purge_after)}</td>
                <td style={td}>
                  <PageTrashActions trashId={p.id} slug={p.slug} />
                </td>
              </tr>
            ))}
            {!rows.length && !error && (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={6}>
                  No deleted pages.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination path="/admin/trash" params={{ view: 'pages' }} offset={offset} hasMore={hasMore} />
    </>
  );
}
