import { fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { PagePasswordForm } from '@/app/ui/dashboard/page-password-form';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Password' };

export default async function PasswordPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const settings = await fetchPageSettings(pageId);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/password" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.password.passwordProtection}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
          {d.password.keepYourEventPrivateWhen}
          {' '}<HelpLink guide="protect-your-page-with-a-password" />
        </p>
      </div>
      <PagePasswordForm
        pageId={pageId}
        initialEnabled={settings['password_protect'] === 'true'}
        hasPassword={!!settings['page_password_hash']}
      />
    </div>
  );
}
