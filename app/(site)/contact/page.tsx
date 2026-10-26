import Link from 'next/link';
import { greatVibes } from '@/app/ui/fonts';
import { auth } from '@/auth';
import SiteTopbar from '@/app/ui/site-topbar';
import SiteFooter from '@/app/ui/marketing/site-footer';
import '@/app/ui/marketing.css';
import ContactForm from './ContactForm';
import { COMPANY } from '@/app/lib/company';
import { pageMetadata } from '@/app/lib/marketing/seo';

export const metadata = pageMetadata('Contact Us', 'Contact MyGala by email or mail for help with your event page, billing or partnerships. We reply within one business day.', '/contact');

export default async function ContactPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className={`marketing-page ${greatVibes.variable}`}>
      <SiteTopbar isLoggedIn={isLoggedIn} />

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
            {COMPANY.address.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Mailing address</p>
                <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0, lineHeight: 1.6 }}>
                  {COMPANY.legalName}<br />
                  {COMPANY.address.map((line) => <span key={line}>{line}<br /></span>)}
                </p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Response time</p>
              <p style={{ fontSize: 14, color: 'var(--ink)', margin: 0 }}>Within 1 business day</p>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
