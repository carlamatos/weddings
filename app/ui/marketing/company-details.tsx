import { COMPANY } from '@/app/lib/company';

// The company's contact block, as used on the legal pages. Fields left empty
// in app/lib/company.ts are left out.
export default function CompanyDetails({ attention }: { attention?: string }) {
  return (
    <address style={{ fontStyle: 'normal', lineHeight: 1.7 }}>
      {attention && <>{attention}<br /></>}
      <strong>{COMPANY.legalName}</strong><br />
      {COMPANY.address.map((line) => <span key={line}>{line}<br /></span>)}
      {COMPANY.phone && <>Phone: <a href={`tel:${COMPANY.phone.replace(/[^\d+]/g, '')}`} style={{ color: 'var(--rose)' }}>{COMPANY.phone}</a><br /></>}
      Email: <a href={`mailto:${COMPANY.email}`} style={{ color: 'var(--rose)' }}>{COMPANY.email}</a><br />
      Website: {COMPANY.website}
    </address>
  );
}
