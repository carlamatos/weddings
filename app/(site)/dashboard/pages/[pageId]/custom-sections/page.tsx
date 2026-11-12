import { fetchCustomSections, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { CustomSectionsManager } from '@/app/ui/dashboard/custom-sections-manager';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Custom Sections' };

export default async function CustomSectionsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const [sections, settings] = await Promise.all([fetchCustomSections(pageId), fetchPageSettings(pageId)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.customSections.customSections}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          {d.customSections.upToThreeSectionsOf}
          {' '}<HelpLink guide="add-custom-sections" />
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
