import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/app/lib/admin';
import AdminNav from '@/app/ui/admin/admin-nav';
import { c } from '@/app/ui/admin/styles';

export const metadata: Metadata = {
  title: 'Admin — MyGala',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Signed-out visitors go to the login page; anyone signed in who isn't a
  // super admin gets a 404. This check doesn't rely on proxy.ts.
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect('/login');
  if (!isSuperAdmin(email)) notFound();

  return (
    <div style={{ minHeight: '100vh', background: c.paper, color: c.ink, fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          padding: '14px 20px',
          background: '#fff',
          borderBottom: `1px solid ${c.line}`,
        }}
      >
        <strong style={{ fontSize: 15 }}>MyGala Admin</strong>
        <span style={{ fontSize: 12, color: c.soft }}>
          Signed in as {email} ·{' '}
          <Link href="/dashboard" style={{ color: c.soft }}>
            Back to dashboard
          </Link>
        </span>
      </header>
      <AdminNav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>{children}</main>
    </div>
  );
}
