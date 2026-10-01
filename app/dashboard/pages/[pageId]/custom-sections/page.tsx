import { fetchCustomSections, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { CustomSectionsManager } from '@/app/ui/dashboard/custom-sections-manager';

export default async function CustomSectionsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);

  if (userPage.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={userPage}
        title="Custom Sections"
        pitch="Custom Sections are a Plus feature. Upgrade to add up to three sections of your own — accommodation, dress code, a thank-you note — with text and photos."
      />
    );
  }

  const [sections, settings] = await Promise.all([fetchCustomSections(pageId), fetchPageSettings(pageId)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Custom Sections</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          Up to three sections of your own, shown after Date &amp; Location. Give each an optional title and add text and images.
          Empty sections stay hidden.
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName="show_custom_sections"
        initialOn={isSectionOn(settings, 'show_custom_sections')}
      />

      <CustomSectionsManager pageId={pageId} initialSections={sections} />
    </div>
  );
}
