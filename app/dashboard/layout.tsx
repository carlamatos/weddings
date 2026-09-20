import Link from 'next/link';
import { auth } from '@/auth';
import { fetchUserPageById } from '@/app/lib/data';
import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import { greatVibes } from '@/app/ui/fonts';
import '@/app/ui/dashboard.css';

export default async function Layout({ children }: { children: React.ReactNode }) {
  // If an admin has deactivated this owner's page, say so on every dashboard
  // screen instead of leaving them wondering why guests can't see it.
  let deactivated = false;
  try {
    const session = await auth();
    if (session?.user?.id) {
      const page = await fetchUserPageById(session.user.id);
      deactivated = page?.status === 'inactive';
    }
  } catch {
    // The banner is informational — never break the dashboard over it.
  }

  return (
    <div className={`dash dash-shell ${greatVibes.variable}`}>
      <SideNav />
      <div className="dash-main">
        <TopNav />
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
              unavailable&rdquo; message. Please <Link href="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>contact us</Link> to
              have it reactivated.
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
