import { requireOwnedPage } from '@/app/lib/dashboard';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import DomainForm from './DomainForm';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
import { rich } from '@/app/ui/dashboard/rich';
export const metadata: Metadata = { title: 'Domain' };

export default async function DomainPage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const query = await searchParams;

  const isPaid = userPage.plan_type === 'paid';
  const justUpgraded = query.success === '1';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640 }}>
      <PlusSetupNote section="/domain" />
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.domain.customDomain}</h1>
      <p style={{ fontSize: 14, color: '#6B6470', margin: '0 0 32px' }}>
        {d.domain.pointYourOwnDomainTo}
        {' '}<HelpLink guide="use-your-own-domain" />
      </p>

      {justUpgraded && (
        <div style={{ marginBottom: 24, padding: '14px 18px', background: '#EAF2EC', border: '1px solid #B2D4B8', borderRadius: 10, fontSize: 14, color: '#3D6B46', fontWeight: 500 }}>
          {d.domain.welcomeToPlusYouCan}
        </div>
      )}

      <DomainForm
        pageId={Number(userPage.id)}
        initialDomain={userPage.custom_domain ?? null}
        initialStatus={userPage.domain_status ?? 'pending'}
        isPaid={isPaid}
      />

      <div style={{ marginTop: 36, padding: '16px 20px', background: '#F5F3F0', borderRadius: 10, fontSize: 13, color: '#6B6470', lineHeight: 1.6 }}>
        {rich(d.domain.howItWorksAfterAdding, { t0: (s) => <strong style={{ color: '#241F2B' }}>{s}</strong> })}
      </div>
    </div>
  );
}
