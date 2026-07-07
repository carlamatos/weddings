import Link from 'next/link';
import { greatVibes } from '@/app/ui/fonts';
import { auth } from '@/auth';
import '@/app/ui/marketing.css';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Contact — MyGala',
  description: 'Get in touch with the MyGala team.',
};

export default async function ContactPage() {
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
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 0 96px' }}>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            <Link href="/" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>MyGala</Link>
            {' / '}Contact
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.15 }}>
            Contact Us
          </h1>
          <div style={{ height: 2, width: 48, background: 'var(--rose)', margin: '20px 0 16px', borderRadius: 2 }} />
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: '0 0 40px', lineHeight: 1.7 }}>
            Have a question, feedback, or need help? We&apos;re a small team and we read every message. We&apos;ll get back to you within one business day.
          </p>

          <ContactForm />

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Email us directly</p>
              <a href="mailto:info@mygala.ca" style={{ fontSize: 14, color: 'var(--rose)', textDecoration: 'none', fontWeight: 500 }}>info@mygala.ca</a>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Response time</p>
              <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0 }}>Within 1 business day</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p className="footer-wordmark">My<span className="accent">Gala</span></p>
        <p style={{ marginTop: 8, fontSize: 13 }}>
          <Link href="/about" style={{ color: 'inherit', marginRight: 20 }}>About</Link>
          <Link href="/contact" style={{ color: 'inherit', marginRight: 20 }}>Contact</Link>
          <Link href="/privacy" style={{ color: 'inherit', marginRight: 20 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'inherit' }}>Terms of Service</Link>
        </p>
        <p style={{ marginTop: '6px' }}>mygala.ca</p>
      </div>
    </div>
  );
}
