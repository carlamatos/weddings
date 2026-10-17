import { fetchGuests, fetchPageSettings } from '@/app/lib/data';
import { pagePath, requireOwnedPage } from '@/app/lib/dashboard';
import { publicPageUrl } from '@/app/lib/share';
import { isPagePaidAndLive } from '@/app/lib/plans';
import { isSeatingOn, parseSeatingTables, SEATING_SETTING, SEATING_TABLES_SETTING } from '@/app/lib/seating';
import { ensureSeatingColumn } from '@/app/lib/seating-data';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusSetupNote } from '@/app/ui/dashboard/plus-gate';
import { QrSignCard } from '@/app/ui/dashboard/photo-qr-card';
import { SeatingPlanner } from '@/app/ui/dashboard/seating-planner';

// On the day → Find Your Table (Plus): seat the guest list, then put the QR
// sign at the entrance. Guests type their name at <page>/table and see their
// table. The seating can be done on a free page; the lookup needs Plus.
export default async function SeatingPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);
  await ensureSeatingColumn().catch((error) => console.error('Failed to add the seating column:', error));
  const [guests, settings] = await Promise.all([fetchGuests(pageId), fetchPageSettings(pageId)]);
  const on = isSeatingOn(settings, isPagePaidAndLive(userPage));
  const lookupUrl = `${publicPageUrl(userPage)}/table`;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <PlusSetupNote section="/seating" />
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Find Your Table</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          No seating chart to print or fix at the last minute. Give each guest a table here, put the QR sign at the entrance, and
          guests scan it, type their name and see their table. Change a table any time — guests always see the latest.
          Set up your tables on the seating map and drag your guests onto them.
        </p>
      </div>

      <SectionToggle
        pageId={pageId}
        settingName={SEATING_SETTING}
        plusSection="/seating"
        initialOn={settings[SEATING_SETTING] === 'true'}
        label="Let guests look up their table"
      />
      <p style={{ fontSize: 13, color: '#6B6470', margin: '-12px 0 24px', maxWidth: 680, lineHeight: 1.6 }}>
        Guests find their table at{' '}
        <a href={lookupUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#8B3A2A', fontWeight: 600, overflowWrap: 'anywhere' }}>
          {lookupUrl.replace(/^https?:\/\//, '')}
        </a>
        . They only see their own table, by typing their name — never the whole seating plan.
      </p>

      <SeatingPlanner
        pageId={pageId}
        initialTables={parseSeatingTables(settings[SEATING_TABLES_SETTING])}
        guestListHref={pagePath(pageId, '/guest-list')}
        guests={guests.map((g) => ({ id: g.id, name: g.name, status: g.status, guests: g.guests, table: g.seating_table ?? '' }))}
      />

      <QrSignCard
        url={lookupUrl}
        heading={userPage.heading || ''}
        sectionOn={on}
        title="QR sign for the entrance"
        intro="Print this sign for the entrance, the welcome table or the bar. Guests scan it with their phone camera, type their name and see their table."
        offWarning="Guests can’t look up their table yet, so the code won’t show them anything. Switch it on above."
        defaultMessage="Find your table"
        how="Scan with your phone camera and type your name"
        fileName="find-your-table-qr-code.png"
        defaultLayout="one"
        idPrefix="seat-qr"
      />
    </div>
  );
}
