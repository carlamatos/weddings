import { fetchPageSettings, fetchSponsors } from '@/app/lib/data';
import { areSponsorsOn } from '@/app/lib/custom-sections';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { SponsorsManager } from '@/app/ui/dashboard/sponsors-manager';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Sponsors' };

export default async function SponsorsPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const [sponsors, settings] = await Promise.all([fetchSponsors(pageId), fetchPageSettings(pageId)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/sponsors" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.sponsors.sponsors}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          {d.sponsors.thankThePeopleAndBusinesses}
          {' '}<HelpLink guide="add-sponsors" />
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
