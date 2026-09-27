import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listOwnedPages } from '@/app/lib/data';
import { isPagePaidAndLive, hasExpiredPlan } from '@/app/lib/plans';
import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import ExtendButton from '@/app/ui/dashboard/extend-button';
import { greatVibes } from '@/app/ui/fonts';

// The dashboard chrome (sidebar, top bar, deactivation/lapsed-plan notices).
// pageId: undefined = no page in the URL (setup, page list); a number = that
// page (must belong to the signed-in user, else 404); null = malformed id (404).
export default async function DashboardShell({
  pageId,
  children,
}: {
  pageId?: number | null;
  children: React.ReactNode;
}) {
  if (pageId === null) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  if (pageId !== undefined && !userId) redirect('/login');
  const pages = userId && pageId !== undefined ? await listOwnedPages(userId) : [];
  const page = pageId !== undefined ? pages.find((p) => Number(p.id) === pageId) : undefined;
  if (pageId !== undefined && !page) notFound();

  // Always a deliberate choice now (owner or admin) — expireIfPast drops a
  // lapsed paid page to the free tier instead of deactivating it, so it
  // stays live at its URL.
  const deactivated = page?.status === 'inactive';
  const expired = !!page && hasExpiredPlan(page);

  return (
    <div className={`dash dash-shell ${greatVibes.variable}`}>
      <SideNav pageId={page ? Number(page.id) : undefined} isPaid={page ? isPagePaidAndLive(page) : false} />
      <div className="dash-main">
        <TopNav page={page} />
        <div className="dash-content">
          {deactivated && (
            <div
              role="alert"
              style={{
                background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800',
                borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20,
              }}
            >
              <strong>Your page has been deactivated.</strong> Guests currently see a &ldquo;page
              unavailable&rdquo; message. Reactivate it from the account menu, or{' '}
              <Link href="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>
                contact us
              </Link>{' '}
              with questions.
            </div>
          )}
          {expired && page && (
            <div
              role="alert"
              style={{
                background: '#FFF8E7', border: '1px solid #E8D9A8', color: '#8A6800',
                borderRadius: 10, padding: '12px 16px', fontSize: 14, lineHeight: 1.6, marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
              }}
            >
              <span>
                <strong>Your Plus term has ended.</strong> Your page is still live, but Domain, Guest Photos, and Song Requests are back on the free tier. Extend to restore them.
              </span>
              <ExtendButton pageId={Number(page.id)} />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
