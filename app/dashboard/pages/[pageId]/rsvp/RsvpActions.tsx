'use client';

import type { Guest } from '@/app/lib/definitions';

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  fontFamily: 'system-ui', cursor: 'pointer', border: '1px solid #EDE8E3',
  background: '#fff', color: '#241F2B', whiteSpace: 'nowrap',
};

export function RsvpActions({ guests }: { pageId: number; guests: Guest[] }) {
  function downloadCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Guests', 'Updates', 'Note', 'Date'];
    const rows = guests.map((g) => [
      g.name,
      g.email ?? '',
      g.phone ?? '',
      g.status === 'attending' ? 'Attending' : g.status === 'not_attending' ? 'Declining' : 'Invited',
      g.status === 'not_attending' ? '' : String(g.guests || 1),
      g.receive_updates ? 'Yes' : 'No',
      g.message ?? '',
      new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'guests.csv';
    a.click();
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
      <button onClick={downloadCSV} style={btn} title="Download all guests as CSV">
        ↓ Export CSV
      </button>
    </div>
  );
}
