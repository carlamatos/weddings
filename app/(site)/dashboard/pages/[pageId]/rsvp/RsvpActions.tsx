'use client';

import { csvCell } from '@/app/lib/csv';
import type { Guest } from '@/app/lib/definitions';
import { csvBlob } from '@/app/lib/guest-import';

import { useDashText } from '@/app/ui/dashboard/dash-text';
const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  fontFamily: 'system-ui', cursor: 'pointer', border: '1px solid #EDE8E3',
  background: '#fff', color: '#241F2B', whiteSpace: 'nowrap',
};

export function RsvpActions({ guests }: { pageId: number; guests: Guest[] }) {
  const d = useDashText();
  function downloadCSV() {
    const headers = [d.rsvpRsvpActions.name, d.rsvpRsvpActions.email, d.rsvpRsvpActions.phone, d.rsvpRsvpActions.status, d.rsvpRsvpActions.guests, d.rsvpRsvpActions.updates, d.rsvpRsvpActions.note, d.rsvpRsvpActions.date];
    const rows = guests.map((g) => [
      g.name,
      g.email ?? '',
      g.phone ?? '',
      g.status === 'attending' ? d.rsvpRsvpActions.attending : g.status === 'not_attending' ? d.rsvpRsvpActions.declining : d.rsvpRsvpActions.invited,
      g.status === 'not_attending' ? '' : String(g.guests || 1),
      g.receive_updates ? d.rsvpRsvpActions.yes : d.rsvpRsvpActions.no,
      g.message ?? '',
      new Date(g.responded_at ?? g.created_at).toLocaleDateString(d.meta.locale, { month: 'short', day: 'numeric', year: 'numeric' }),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(csvBlob(csv));
    a.download = 'guests.csv';
    a.click();
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
      <button onClick={downloadCSV} style={btn} title={d.rsvpRsvpActions.downloadAllGuestsAsCsv}>
        {d.rsvpRsvpActions.exportCsv}
      </button>
    </div>
  );
}
