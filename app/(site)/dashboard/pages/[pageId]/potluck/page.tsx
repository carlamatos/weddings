import { fetchPageSettings, fetchPotluckEntries } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { arePotluckEntriesPublic, isPotluckOn } from '@/app/lib/potluck';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PotluckEntries } from '@/app/ui/dashboard/potluck-entries';
import { HelpLink } from '@/app/ui/dashboard/help-link';
import type { Metadata } from 'next';

import { getDashText } from '@/app/lib/dash-text/server';
export const metadata: Metadata = { title: 'Potluck' };

export default async function PotluckPage({ params }: { params: Promise<{ pageId: string }> }) {
  const d = await getDashText();
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const [settings, entries] = await Promise.all([fetchPageSettings(pageId), fetchPotluckEntries(pageId)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.potluck.potluck}</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
          {d.potluck.guestsTellYouWhatThey}
          {' '}<HelpLink guide="organize-a-potluck" />
        </p>
      </div>

      <SectionToggle pageId={pageId} settingName="show_potluck" initialOn={isPotluckOn(settings)} />
      <SectionToggle
        pageId={pageId}
        settingName="show_potluck_entries"
        initialOn={arePotluckEntriesPublic(settings)}
        label={d.potluck.showEveryoneSEntriesOn}
      />
      <p style={{ fontSize: 13, color: '#6B6470', margin: '-12px 0 24px', maxWidth: 640, lineHeight: 1.6 }}>
        {d.potluck.whenThisIsOffOnly}
      </p>

      <PotluckEntries pageId={pageId} initialEntries={entries} />
    </div>
  );
}
