import type { Metadata } from 'next';
import { countNewsletterSubscribers, fetchNewsletterSubscribers } from '@/app/lib/admin-data';
import Pagination, { parseOffset } from '@/app/ui/admin/pagination';
import Total from '@/app/ui/admin/total';
import RemoveSubscriberButton from '@/app/ui/admin/remove-subscriber-button';
import { formatDateTime } from '@/app/ui/admin/format';
import { alertError, c, table, tableWrap, td, th } from '@/app/ui/admin/styles';
import { getSuperAdmin } from '@/app/lib/admin';

export const metadata: Metadata = { title: 'Newsletter' };

// Live admin data: never run these queries at build time.
export const dynamic = 'force-dynamic';

// Where they joined (subscribeToNewsletter's source).
const SOURCE: Record<string, string> = {
  signup: 'Sign-up form checkbox',
  'create-event': 'Create-event checkbox',
  footer: 'Website footer form',
};

const badge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, color, background: bg,
});

export default async function AdminNewsletterPage({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
  // Checked here as well as in the layout: a layout's check doesn't re-run
  // on every navigation (Next's partial rendering), and this page reads
  // private data. Without full admin access (2FA included) the layout shows
  // the login, 2FA or 404 instead, and this page renders nothing.
  if (!(await getSuperAdmin())) return null;
  const offset = parseOffset((await searchParams).offset);
  const [{ rows, hasMore, error }, total] = await Promise.all([fetchNewsletterSubscribers(offset), countNewsletterSubscribers()]);

  return (
    <>
      <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Newsletter</h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: c.soft, lineHeight: 1.6 }}>
        Everyone who joined the newsletter. <strong>Consent saved</strong> means we kept the exact wording they agreed to,
        which is our proof of consent under Canada&apos;s anti-spam law (CASL). People marked <strong>No consent record</strong>{' '}
        joined before the wording was saved. <strong>Remove</strong> takes someone off the list for good.
      </p>

      {error && (
        <div role="alert" style={{ ...alertError, marginBottom: 16 }}>
          Couldn&apos;t load subscribers: {error}
        </div>
      )}

      <Total label={total === 1 ? 'active subscriber' : 'active subscribers'} count={total} />

      <div style={tableWrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Subscriber</th>
              <th style={th}>Joined from</th>
              <th style={th}>Subscribed</th>
              <th style={th}>Consent (CASL)</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td style={td}>
                  {s.user_name && <div style={{ fontWeight: 600 }}>{s.user_name}</div>}
                  <div style={{ color: s.user_name ? c.soft : c.ink }}>{s.email}</div>
                  {s.unsubscribed_at && (
                    <div style={{ marginTop: 4 }}>
                      <span style={badge(c.grey, c.greyBg)}>Unsubscribed {formatDateTime(s.unsubscribed_at)}</span>
                    </div>
                  )}
                </td>
                <td style={{ ...td, color: c.soft }}>{(s.source && SOURCE[s.source]) ?? s.source ?? '—'}</td>
                <td style={td}>{formatDateTime(s.subscribed_at)}</td>
                <td style={{ ...td, maxWidth: 340 }}>
                  {s.consent_text ? (
                    <details>
                      <summary style={{ cursor: 'pointer' }}>
                        <span style={badge(c.green, c.greenBg)}>Consent saved</span>
                      </summary>
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: c.soft, lineHeight: 1.5 }}>{s.consent_text}</p>
                    </details>
                  ) : (
                    <span style={badge(c.amber, c.amberBg)}>No consent record</span>
                  )}
                </td>
                <td style={td}>
                  <RemoveSubscriberButton id={s.id} email={s.email} />
                </td>
              </tr>
            ))}
            {!rows.length && !error && (
              <tr>
                <td style={{ ...td, textAlign: 'center', color: c.muted }} colSpan={5}>
                  No one has subscribed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination path="/admin/newsletter" params={{}} offset={offset} hasMore={hasMore} />
    </>
  );
}
