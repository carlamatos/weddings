'use client';

import { csvCell } from '@/app/lib/csv';
import { useState } from 'react';
import { deletePotluckEntry } from '@/app/lib/actions';
import type { PotluckEntry } from '@/app/lib/potluck';
import { csvBlob } from '@/app/lib/guest-import';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
const cell: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #EDE8E3', fontSize: 14, color: '#241F2B', verticalAlign: 'top', textAlign: 'left' };
const btn: React.CSSProperties = { padding: '7px 14px', borderRadius: 8, border: '1px solid #DDD5CE', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#241F2B' };


export function PotluckEntries({ pageId, initialEntries }: { pageId: number; initialEntries: PotluckEntry[] }) {
  const d = useDashText();
  const [entries, setEntries] = useState(initialEntries);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function remove(entry: PotluckEntry) {
    if (!window.confirm(fill(d.potluckEntries.removeSEntry, { name: entry.name }))) return;
    setBusyId(entry.id);
    setError('');
    const result = await deletePotluckEntry(pageId, entry.id);
    setBusyId(null);
    if (!result.ok) setError(result.error);
    else setEntries((prev) => prev.filter((e) => e.id !== entry.id));
  }

  function exportCsv() {
    const rows = [[d.potluckEntries.name, d.potluckEntries.email, d.potluckEntries.bringing, d.potluckEntries.note, d.potluckEntries.updated], ...entries.map((e) => [e.name, e.email, e.items, e.note ?? '', new Date(e.updated_at).toISOString()])];
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(csvBlob(csv));
    a.download = 'potluck.csv';
    a.click();
  }

  return (
    <section style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 22, maxWidth: 880 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: 0 }}>
          {rich(fill(d.potluckEntries.entries, { length: entries.length }), { t0: (s) => <span style={{ color: '#6B6470', fontWeight: 400 }}>{s}</span> })}
        </h2>
        {entries.length > 0 && <button type="button" style={btn} onClick={exportCsv}>{d.potluckEntries.exportCsv}</button>}
      </div>
      {error && <p role="alert" style={{ color: '#B91C1C', fontSize: 13 }}>{error}</p>}
      {entries.length === 0 ? (
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0 }}>{d.potluckEntries.noOneHasSignedUp}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr>
                {[d.potluckEntries.guest, d.potluckEntries.bringing, d.potluckEntries.note, ''].map((h) => (
                  <th key={h} style={{ ...cell, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td style={cell}>
                    <div style={{ fontWeight: 600 }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: '#6B6470', overflowWrap: 'anywhere' }}>{e.email}</div>
                  </td>
                  <td style={{ ...cell, whiteSpace: 'pre-line' }}>{e.items}</td>
                  <td style={{ ...cell, whiteSpace: 'pre-line', color: '#6B6470' }}>{e.note || '—'}</td>
                  <td style={{ ...cell, textAlign: 'right' }}>
                    <button type="button" style={btn} disabled={busyId === e.id} onClick={() => remove(e)}>
                      {busyId === e.id ? d.potluckEntries.removing : d.potluckEntries.remove}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
