import { fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { RegistryForm } from '@/app/ui/dashboard/registry-form';

export default async function RegistryPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);

  if (userPage.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={userPage}
        title="Registry"
        pitch="The Registry section is a Plus feature. Upgrade to link guests to your gift registry and add a note about gifts."
      />
    );
  }

  const settings = await fetchPageSettings(pageId);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Registry</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          Point guests to your gift registry, and add a message for anything else they should know. The section shows on your page
          once it has a link or a message.
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName="show_registry"
        initialOn={isSectionOn(settings, 'show_registry')}
      />

      <RegistryForm
        pageId={pageId}
        initial={{
          link: userPage.section_2_button_link ?? '',
          buttonText: userPage.section_2_button_text ?? '',
          message: userPage.section_2_description ?? '',
        }}
      />
    </div>
  );
}
