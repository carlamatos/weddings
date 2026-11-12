import { fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { RegistryForm } from '@/app/ui/dashboard/registry-form';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Registry' };

export default async function RegistryPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const settings = await fetchPageSettings(pageId);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.registry.registry}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          {d.registry.pointGuestsToYourGift}
          {' '}<HelpLink guide="add-a-registry" />
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
