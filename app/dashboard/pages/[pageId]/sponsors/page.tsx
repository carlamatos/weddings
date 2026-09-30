import { fetchPageSettings, fetchSponsors, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { SponsorsManager } from '@/app/ui/dashboard/sponsors-manager';

export default async function SponsorsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);

  if (userPage.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={userPage}
        title="Sponsors"
        pitch="Sponsors is a Plus feature. Upgrade to thank the businesses and people supporting your event with their logo and a short description."
      />
    );
  }

  const [sponsors, settings] = await Promise.all([fetchSponsors(pageId), fetchPageSettings(pageId)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Sponsors</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          Thank the people and businesses supporting your event. Each sponsor gets an image (such as their logo) and a short description,
          shown after your gallery. You can rename the section&apos;s heading in the page editor.
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName="show_sponsors"
        initialOn={isSectionOn(settings, 'show_sponsors')}
      />

      <SponsorsManager pageId={pageId} initialSponsors={sponsors} />
    </div>
  );
}
