import { fetchPageSettings, fetchSponsors } from '@/app/lib/data';
import { areSponsorsOn } from '@/app/lib/custom-sections';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { SponsorsManager } from '@/app/ui/dashboard/sponsors-manager';

export default async function SponsorsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const [sponsors, settings] = await Promise.all([fetchSponsors(pageId), fetchPageSettings(pageId)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/sponsors" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Sponsors</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          Thank the people and businesses supporting your event. Each sponsor gets an image (such as their logo) and a short description,
          shown after your gallery. You can rename the section&apos;s heading in the page editor.
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName="show_sponsors" plusSection="/sponsors"
        initialOn={areSponsorsOn(settings)}
      />

      <SponsorsManager pageId={pageId} initialSponsors={sponsors} />
    </div>
  );
}
