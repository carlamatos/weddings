import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/app/lib/admin';
import { needsTotpChallenge } from '@/app/lib/require-verified';
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
  if (!isSuperAdmin(email) || !session?.user?.verifiedEmail) notFound();
  if (needsTotpChallenge(session)) redirect('/verify-2fa');

  // 2FA is required for the admin area (getSuperAdmin enforces it for every
  // admin API route too). Admins without it are asked to turn it on first.
  if (!session.user?.totpEnabled || !session.user?.totpVerified) {
    return (
      <div style={{ minHeight: '100vh', background: c.paper, color: c.ink, fontFamily: 'system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 460, background: '#fff', border: `1px solid ${c.line}`, borderRadius: 12, padding: '28px 26px', textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 10px' }}>Turn on two-factor authentication</p>
          <p style={{ fontSize: 14, color: c.soft, lineHeight: 1.6, margin: '0 0 22px' }}>
            The admin area requires 2FA. Open your dashboard, choose your name in the top-right corner, and turn on two-factor
            authentication with an authenticator app. Then come back here.
          </p>
          <Link href="/dashboard" style={{ display: 'inline-block', padding: '10px 22px', background: '#B6584A', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
            Go to the dashboard
          </Link>
        </div>
      </div>
    );
  }

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
