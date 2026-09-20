import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listOwnedPages } from '@/app/lib/data';
import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import { greatVibes } from '@/app/ui/fonts';

// The dashboard chrome (sidebar, top bar, deactivation notice).
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

  const deactivated = page?.status === 'inactive';

  return (
    <div className={`dash dash-shell ${greatVibes.variable}`}>
      <SideNav pageId={page ? Number(page.id) : undefined} isPaid={page?.plan_type === 'paid'} />
      <div className="dash-main">
        <TopNav page={page} />
        <div className="dash-content">
          {deactivated && (
            <div
              role="alert"
              style={{
                background: '#FFF8E7',
                border: '1px solid #E8D9A8',
                color: '#8A6800',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              <strong>Your page has been deactivated.</strong> Guests currently see a &ldquo;page
              unavailable&rdquo; message. Please{' '}
              <Link href="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>
                contact us
              </Link>{' '}
              to have it reactivated.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
