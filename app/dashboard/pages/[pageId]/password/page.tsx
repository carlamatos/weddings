import { fetchPageSettings } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { PagePasswordForm } from '@/app/ui/dashboard/page-password-form';

export default async function PasswordPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);

  if (userPage.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={userPage}
        title="Password Protection"
        pitch="Password protection is a Plus feature. Upgrade to make your event page private — only guests with the password can open it."
      />
    );
  }

  const settings = await fetchPageSettings(pageId);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Password Protection</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
          Keep your event private. When protection is on, visitors see a password screen instead of your page, and only guests who
          know the password can open it, RSVP or share photos. When you&rsquo;re signed in, you always see your page at its mygala.ca address.
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
