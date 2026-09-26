import { fetchEventProgram, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { EventProgramManager } from '@/app/ui/dashboard/event-program-manager';

export default async function EventProgramPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);

  const [items, settings] = await Promise.all([
    fetchEventProgram(pageId),
    fetchPageSettings(pageId),
  ]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Event Program</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>
          Build the schedule for your event — rehearsal dinner, ceremony, reception, and anything else your guests should know about.
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName="show_event_program"
        initialOn={isSectionOn(settings, 'show_event_program')}
      />

      <EventProgramManager pageId={pageId} initialItems={items} />
    </div>
  );
}
