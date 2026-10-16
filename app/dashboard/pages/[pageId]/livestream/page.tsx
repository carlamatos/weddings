import { fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { LIVESTREAM_SETTINGS } from '@/app/lib/livestream';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { LivestreamForm } from '@/app/ui/dashboard/livestream-form';

export default async function LivestreamPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);


  const settings = await fetchPageSettings(pageId);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/livestream" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Live Stream</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640 }}>
          Let guests who can&rsquo;t make it watch along. Paste the link to your stream, or the embed code your streaming
          service gives you. The section shows on your page once it has a link.
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName="show_livestream" plusSection="/livestream"
        initialOn={isSectionOn(settings, 'show_livestream')}
      />

      <LivestreamForm
        pageId={pageId}
        initial={{
          url: settings[LIVESTREAM_SETTINGS.url] ?? '',
          display: settings[LIVESTREAM_SETTINGS.display] === 'link' ? 'link' : 'embed',
          buttonText: settings[LIVESTREAM_SETTINGS.buttonText] ?? '',
          message: settings[LIVESTREAM_SETTINGS.message] ?? '',
        }}
      />
    </div>
  );
}
