import { fetchEventProgram, fetchPageSettings, isSectionOn } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { EventProgramManager } from '@/app/ui/dashboard/event-program-manager';
import Link from 'next/link';

export default async function EventProgramPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);
  const isPaid = userPage.plan_type === 'paid';

  if (!isPaid) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, padding: '60px 24px', textAlign: 'center', margin: '0 auto' }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', marginBottom: 10 }}>Event Program</p>
        <p style={{ fontSize: 14, color: '#6B6470', marginBottom: 24 }}>
          The Event Program is a Plus feature. Upgrade to publish a schedule of your event for guests to see.
        </p>
        <Link href={pagePath(userPage.id, '/domain')} style={{ display: 'inline-block', padding: '10px 24px', background: '#B6584A', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
          Upgrade to Plus
        </Link>
      </div>
    );
  }

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
