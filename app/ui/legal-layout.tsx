import Link from 'next/link';
import { greatVibes } from '@/app/ui/fonts';
import { auth } from '@/auth';
import '@/app/ui/marketing.css';

export default async function LegalLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className={`marketing-page ${greatVibes.variable}`}>
      <div className="topbar">
        <Link href="/" className="wordmark">My<span className="accent">Gala</span></Link>
        <div className="topbar-actions">
          {isLoggedIn ? (
            <Link href="/dashboard" className="topbar-signup">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="topbar-login">Log in</Link>
              <Link href="/register" className="topbar-signup">Sign up</Link>
            </>
          )}
        </div>
      </div>

      <div className="wrap">
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 0 96px' }}>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            <Link href="/" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>MyGala</Link>
            {' / '}{title}
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.15 }}>{title}</h1>
          <div style={{ height: 2, width: 48, background: 'var(--rose)', margin: '20px 0 40px', borderRadius: 2 }} />
          <div style={{
            color: 'var(--ink)',
            fontSize: 15,
            lineHeight: 1.8,
          }}>
            {children}
          </div>
        </div>
      </div>

      <div className="footer">
        <p className="footer-wordmark">My<span className="accent">Gala</span></p>
        <p style={{ marginTop: 6, fontSize: 13 }}>
          <Link href="/about" style={{ color: 'inherit', marginRight: 20 }}>About</Link>
          <Link href="/contact" style={{ color: 'inherit', marginRight: 20 }}>Contact</Link>
          <Link href="/privacy" style={{ color: 'inherit', marginRight: 20 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'inherit' }}>Terms of Service</Link>
        </p>
        <p style={{ marginTop: 6 }}>mygala.ca</p>
      </div>
    </div>
  );
}
