import Link from 'next/link';
import LegalLayout from '@/app/ui/legal-layout';
import CompanyDetails from '@/app/ui/marketing/company-details';
import { COMPANY, copyrightLine } from '@/app/lib/company';
import { PLAN_ONE_TIME_PRICE_USD, PLAN_TERM_MONTHS } from '@/app/lib/plans';

export const metadata = {
  title: 'Company Information — MyGala',
  description: `mygala.ca is owned and operated by ${COMPANY.legalName} Company details, contact information and legal notices.`,
};

const UPDATED = 'October 4, 2026';

export default function CompanyPage() {
  return (
    <LegalLayout title="Company Information">
      <p style={meta}>Last updated: {UPDATED}</p>

      <p>
        The website <strong>{COMPANY.website}</strong> and the {COMPANY.tradeName} service are owned and operated by{' '}
        <strong>{COMPANY.legalName}</strong>
        {COMPANY.incorporatedUnder ? <>, a corporation incorporated under {COMPANY.incorporatedUnder}</> : <>, a Canadian corporation</>}.
        &ldquo;{COMPANY.tradeName}&rdquo; is the name under which {COMPANY.legalName} provides the service.
      </p>

      <h2 style={h2}>Contact</h2>
      <CompanyDetails />
      {COMPANY.corporationNumber && <p style={{ marginTop: 12 }}>Corporation number: {COMPANY.corporationNumber}</p>}

      <h2 style={h2}>Purchases</h2>
      <p>
        When you buy {COMPANY.tradeName} Plus, your contract is with {COMPANY.legalName} Plus is a one-time payment of
        US${PLAN_ONE_TIME_PRICE_USD} per event page, charged in US dollars, that unlocks that page&rsquo;s Plus features for{' '}
        {PLAN_TERM_MONTHS} months. It is not a subscription and does not renew. Payments are processed by Stripe, and a receipt is
        emailed to you. Refunds and cancellations are described in our <Link href="/terms#billing" style={link}>Terms of Service</Link>.
      </p>

      <h2 style={h2}>Privacy</h2>
      <p>
        {COMPANY.legalName} is responsible for the personal information collected through {COMPANY.website}. Our{' '}
        {COMPANY.privacyOfficer} can be reached at <a href={`mailto:${COMPANY.email}`} style={link}>{COMPANY.email}</a>. See
        our <Link href="/privacy" style={link}>Privacy Policy</Link>.
      </p>

      <h2 style={h2}>Intellectual property</h2>
      <p>
        The {COMPANY.tradeName} name and logo, themes, designs, software and written content on this website belong to{' '}
        {COMPANY.legalName}, except content that users upload to their own event pages and the open-source software listed on
        our <Link href="/open-source" style={link}>Open-Source Licences</Link> page.
      </p>
      <p>{copyrightLine()}</p>

      <h2 style={h2}>Legal documents</h2>
      <ul style={ul}>
        <li><Link href="/terms" style={link}>Terms of Service</Link></li>
        <li><Link href="/privacy" style={link}>Privacy Policy</Link></li>
        <li><Link href="/open-source" style={link}>Open-Source Licences</Link></li>
      </ul>
    </LegalLayout>
  );
}

const h2: React.CSSProperties = { fontSize: 19, fontWeight: 700, color: '#241F2B', margin: '40px 0 12px' };
const ul: React.CSSProperties = { paddingLeft: 22, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 };
const meta: React.CSSProperties = { fontSize: 13, color: '#6B6470', marginBottom: 24 };
const link: React.CSSProperties = { color: 'var(--rose)' };
