'use client';

import { useState } from 'react';
import type { MealSummary } from '@/app/lib/rsvp-meals';
import { btn, card } from './guest-ui';
import { csvCell } from '@/app/lib/csv';
import { csvBlob } from '@/app/lib/guest-import';

export type MealRow = { guest: string; person: string; meal: string; diet: string; table: string };

// RSVP screen: what to tell the caterer. A count per meal from the guests
// who are coming, everyone's allergies, and the list to copy or download.
export function MealSummaryCard({ summary, rows, heading }: { summary: MealSummary; rows: MealRow[]; heading: string }) {
  const [copied, setCopied] = useState(false);
  const chosen = summary.people - summary.notChosen;

  const text = [
    `Meals${heading ? ` for ${heading}` : ''}: ${summary.people} ${summary.people === 1 ? 'guest' : 'guests'} coming`,
    ...summary.counts.map((c) => `${c.meal}: ${c.count}`),
    ...(summary.notChosen ? [`No choice yet: ${summary.notChosen}`] : []),
    ...(summary.diets.length ? ['', 'Allergies and dietary needs:', ...summary.diets.map((d) => `- ${d.person}${d.table ? ` (${d.table})` : ''}: ${d.diet}`)] : []),
  ].join('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the download still works.
    }
  }

  function download() {
    const csv = [['Guest', 'Person', 'Meal', 'Allergies or dietary needs', 'Table'], ...rows.map((r) => [r.guest, r.person, r.meal, r.diet, r.table])]
      .map((row) => row.map(csvCell).join(','))
      .join('\n');
    const url = URL.createObjectURL(csvBlob(csv));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'meal-choices.csv' });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section style={{ ...card, padding: '18px 22px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 2px' }}>Meals for your caterer</h2>
          <p style={{ fontSize: 13, color: '#6B6470', margin: 0 }}>
            {summary.people === 0 ? 'Nobody has said they’re coming yet.' : `${chosen} of ${summary.people} ${summary.people === 1 ? 'guest' : 'guests'} coming have chosen a meal.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={copy} disabled={summary.people === 0}>{copied ? 'Copied!' : 'Copy for the caterer'}</button>
          <button type="button" style={btn} onClick={download} disabled={rows.length === 0}>Download CSV</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {summary.counts.map((c) => (
          <div key={c.meal} style={{ minWidth: 110, padding: '10px 14px', borderRadius: 10, background: '#FAF8F6', border: '1px solid #F0ECE8' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#241F2B', margin: 0, lineHeight: 1.1 }}>{c.count}</p>
            <p style={{ fontSize: 13, color: '#6B6470', margin: '2px 0 0' }}>{c.meal}</p>
          </div>
        ))}
        {summary.notChosen > 0 && (
          <div style={{ minWidth: 110, padding: '10px 14px', borderRadius: 10, border: '1px dashed #DDD5CE' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#9A8F8C', margin: 0, lineHeight: 1.1 }}>{summary.notChosen}</p>
            <p style={{ fontSize: 13, color: '#9A8F8C', margin: '2px 0 0' }}>No choice yet</p>
          </div>
        )}
      </div>
      {summary.diets.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', margin: '0 0 6px' }}>Allergies and dietary needs</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: '#241F2B', lineHeight: 1.7 }}>
            {summary.diets.map((d, i) => (
              <li key={i}><strong>{d.person}</strong>{d.table && <span style={{ color: '#9A8F8C' }}> · {d.table}</span>}: {d.diet}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
