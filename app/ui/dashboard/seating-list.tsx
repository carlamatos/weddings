'use client';

import { useMemo, useState } from 'react';
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { cleanTableName, parseSeatingPaste, sameName, nameMatches, sortTables, SEATING_TABLE_MAX } from '@/app/lib/seating';
import type { Guest } from '@/app/lib/definitions';
import { btn, primary, input, STATUS, statusPill } from './guest-ui';

export type SeatGuest = Pick<Guest, 'id' | 'name' | 'status' | 'guests'> & { table: string };
type Filter = 'all' | 'unseated' | { table: string };

const muted: React.CSSProperties = { fontSize: 13, color: '#6B6470', margin: 0, lineHeight: 1.6 };
const chip = (active: boolean): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
  border: `1px solid ${active ? '#B6584A' : '#E4DDD7'}`, background: active ? '#FBF0EE' : '#fff', color: active ? '#8B3A2A' : '#241F2B',
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
});

// Find Your Table → List: every guest with a table field — seat them one by
// one, several at once, or by pasting a seating chart. The seating map
// (seating-planner.tsx) owns the seats and saving; this is one view of them.
export function SeatingList({ guests, seats, tableNames, pending, save, onRename }: {
  guests: SeatGuest[];
  seats: Record<string, string>;
  tableNames: string[]; // the map's tables, offered while typing
  pending: boolean;
  save: (changes: { id: string; table: string }[], after?: () => void) => void;
  onRename: (from: string, to: string, after?: () => void) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [hideDeclined, setHideDeclined] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTable, setBulkTable] = useState('');
  const [rename, setRename] = useState('');

  const tables = useMemo(() => {
    const people = new Map<string, number>();
    for (const g of guests) {
      const t = seats[g.id];
      if (t) people.set(t, (people.get(t) ?? 0) + Math.max(1, g.guests || 1));
    }
    return sortTables(people.keys()).map((name) => ({ name, people: people.get(name)! }));
  }, [guests, seats]);

  const seated = guests.filter((g) => seats[g.id]).length;
  const activeTable = typeof filter === 'object' ? filter.table : null;

  const shown = guests
    .filter((g) => !hideDeclined || g.status !== 'not_attending' || seats[g.id])
    .filter((g) => (filter === 'unseated' ? !seats[g.id] : activeTable !== null ? seats[g.id] === activeTable : true))
    .filter((g) => !search.trim() || nameMatches(search, g.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  function commitRow(id: string) {
    if (!(id in drafts)) return;
    const table = cleanTableName(drafts[id]);
    setDrafts((d) => { const next = { ...d }; delete next[id]; return next; });
    if (table === (seats[id] ?? '')) return;
    save([{ id, table }], () => { setSavedId(id); setTimeout(() => setSavedId((v) => (v === id ? null : v)), 1600); });
  }

  function seatSelected(table: string) {
    save([...selected].map((id) => ({ id, table })), () => { setSelected(new Set()); setBulkTable(''); });
  }

  function renameTable() {
    const to = cleanTableName(rename);
    if (!activeTable || !to || to === activeTable) return;
    onRename(activeTable, to, () => {
      setFilter({ table: to });
      setRename('');
    });
  }

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allShownSelected = shown.length > 0 && shown.every((g) => selected.has(g.id));

  return (
    <div>
      <datalist id="seating-tables">{sortTables([...tableNames, ...tables.map((t) => t.name)]).map((name) => <option key={name} value={name} />)}</datalist>

      <p style={{ ...muted, marginBottom: 16, maxWidth: 640 }}>
        Type a table for each guest — a number or a name like &ldquo;Sunflower&rdquo;. Anyone in a guest&rsquo;s party sits with them.
        Changes save as you go. {seated} of {guests.length} guests are seated.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <button type="button" style={chip(filter === 'all')} onClick={() => setFilter('all')}>Everyone</button>
        <button type="button" style={chip(filter === 'unseated')} onClick={() => setFilter('unseated')}>
          Not seated yet <span style={{ fontWeight: 500 }}>{guests.length - seated}</span>
        </button>
        {tables.map((t) => (
          <button key={t.name} type="button" style={chip(activeTable === t.name)} onClick={() => { setFilter({ table: t.name }); setRename(''); }}
            title={`${t.people} ${t.people === 1 ? 'person' : 'people'} at ${t.name}`}>
            {t.name} <span style={{ fontWeight: 500 }}>{t.people}</span>
          </button>
        ))}
      </div>

      {activeTable && (
        <form
          onSubmit={(e) => { e.preventDefault(); renameTable(); }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FAF8F6', border: '1px solid #EDE8E3', borderRadius: 10, marginBottom: 14 }}
        >
          <label htmlFor="seating-rename" style={{ fontSize: 13, color: '#241F2B' }}>Rename &ldquo;{activeTable}&rdquo; to</label>
          <input id="seating-rename" style={{ ...input, flex: '1 1 160px' }} value={rename} maxLength={SEATING_TABLE_MAX} onChange={(e) => setRename(e.target.value)} />
          <button type="submit" style={btn} disabled={pending || !cleanTableName(rename)}>Rename table</button>
        </form>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 340 }}>
          <MagnifyingGlassIcon aria-hidden="true" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9A929F' }} />
          <input type="search" aria-label="Find a guest" placeholder="Find a guest" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...input, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }} />
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4A4350', cursor: 'pointer' }}>
          <input type="checkbox" checked={hideDeclined} onChange={(e) => setHideDeclined(e.target.checked)} />
          Hide guests who can&rsquo;t come
        </label>
      </div>

      {selected.size > 0 && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (cleanTableName(bulkTable)) seatSelected(bulkTable); }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#FBF0EE', border: '1px solid #EBCFC8', borderRadius: 10, marginBottom: 12 }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#241F2B' }}>{selected.size} selected — seat them at</span>
          <input aria-label="Table for the selected guests" list="seating-tables" style={{ ...input, flex: '1 1 140px', maxWidth: 220 }} value={bulkTable} maxLength={SEATING_TABLE_MAX} onChange={(e) => setBulkTable(e.target.value)} placeholder="Table" />
          <button type="submit" style={primary} disabled={pending || !cleanTableName(bulkTable)}>Seat them</button>
          <button type="button" style={btn} disabled={pending} onClick={() => seatSelected('')}>Clear their table</button>
          <button type="button" style={{ ...btn, border: 'none', background: 'none' }} onClick={() => setSelected(new Set())}>Cancel</button>
        </form>
      )}

      <div style={{ border: '1px solid #F0ECE8', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', background: '#FAF8F6', borderBottom: '1px solid #F0ECE8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}>
          <input
            type="checkbox"
            aria-label="Select all guests shown"
            checked={allShownSelected}
            onChange={() => setSelected((s) => { const n = new Set(s); for (const g of shown) { if (allShownSelected) n.delete(g.id); else n.add(g.id); } return n; })}
          />
          <span style={{ flex: '1 1 auto' }}>Guest</span>
          <span style={{ width: 170 }}>Table</span>
        </div>
        {shown.length === 0 && <p style={{ ...muted, padding: '16px 14px' }}>No guests here.</p>}
        {shown.map((g) => {
          const [statusLabel, statusStyle] = STATUS[g.status];
          const value = drafts[g.id] ?? seats[g.id] ?? '';
          return (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderBottom: '1px solid #F0ECE8', flexWrap: 'wrap' }}>
              <input type="checkbox" aria-label={`Select ${g.name}`} checked={selected.has(g.id)} onChange={() => toggle(g.id)} />
              <div style={{ flex: '1 1 160px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: '#241F2B', fontWeight: 500, overflowWrap: 'anywhere' }}>{g.name}</span>
                {g.guests > 1 && <span style={{ fontSize: 12, color: '#6B6470' }}>party of {g.guests}</span>}
                <span style={{ ...statusPill, ...statusStyle, fontSize: 11, padding: '2px 8px' }}>{statusLabel}</span>
              </div>
              <div style={{ width: 170, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  aria-label={`Table for ${g.name}`}
                  list="seating-tables"
                  placeholder="No table"
                  value={value}
                  maxLength={SEATING_TABLE_MAX}
                  onChange={(e) => setDrafts((d) => ({ ...d, [g.id]: e.target.value }))}
                  onBlur={() => commitRow(g.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitRow(g.id); } }}
                  style={{ ...input, width: '100%', boxSizing: 'border-box' }}
                />
                <CheckIcon aria-label={savedId === g.id ? 'Saved' : undefined} style={{ width: 16, height: 16, flexShrink: 0, color: '#3D6B46', opacity: savedId === g.id ? 1 : 0, transition: 'opacity .2s' }} />
              </div>
            </div>
          );
        })}
      </div>

      <PasteSeating guests={guests} pending={pending} onSave={(changes, done) => save(changes, done)} />
    </div>
  );
}

// "Paste your seating chart": two columns from a spreadsheet (name, table),
// matched to the guest list by name. Names that aren't on the list are
// listed so the host can add them there.
function PasteSeating({ guests, pending, onSave }: {
  guests: SeatGuest[];
  pending: boolean;
  onSave: (changes: { id: string; table: string }[], done: () => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ changes: { id: string; table: string }[]; missing: string[]; twice: string[] } | null>(null);
  const [done, setDone] = useState(0);

  function match() {
    const changes: { id: string; table: string }[] = [];
    const missing: string[] = [];
    const twice: string[] = [];
    for (const row of parseSeatingPaste(text)) {
      const found = guests.filter((g) => sameName(g.name, row.name));
      if (found.length === 1) changes.push({ id: found[0].id, table: row.table });
      else if (found.length > 1) twice.push(row.name);
      else missing.push(row.name);
    }
    setResult({ changes, missing, twice });
    setDone(0);
  }

  return (
    <div style={{ marginTop: 18, borderTop: '1px solid #F0ECE8', paddingTop: 14 }}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ ...btn, border: 'none', background: 'none', padding: 0, color: '#8B3A2A', whiteSpace: 'normal', textAlign: 'left' }}>
        {open ? '−' : '+'} Paste your seating chart from a spreadsheet
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          <p style={{ ...muted, marginBottom: 10 }}>
            Copy two columns — the guest&rsquo;s name and their table — and paste them here, one guest per line. Names must match your
            guest list.
          </p>
          <textarea
            aria-label="Seating chart"
            value={text}
            onChange={(e) => { setText(e.target.value); setResult(null); }}
            rows={6}
            placeholder={'Ana Martínez\tTable 1\nJames Lee, Table 4'}
            style={{ ...input, width: '100%', boxSizing: 'border-box', fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 10 }}>
            <button type="button" style={btn} onClick={match} disabled={!text.trim()}>Match names</button>
            {result && result.changes.length > 0 && !done && (
              <button type="button" style={primary} disabled={pending} onClick={() => onSave(result.changes, () => { setDone(result.changes.length); setText(''); })}>
                Seat {result.changes.length} {result.changes.length === 1 ? 'guest' : 'guests'}
              </button>
            )}
            {done > 0 && <span style={{ fontSize: 13, color: '#3D6B46', fontWeight: 600 }}>Seated {done} {done === 1 ? 'guest' : 'guests'}.</span>}
          </div>
          {result && (
            <div style={{ marginTop: 10, fontSize: 13, color: '#4A4350', lineHeight: 1.6 }}>
              {result.changes.length === 0 && <p style={{ margin: 0 }}>No names matched your guest list.</p>}
              {result.missing.length > 0 && (
                <p style={{ margin: '4px 0 0' }}>
                  <strong>Not on your guest list ({result.missing.length}):</strong> {result.missing.join(', ')}. Add them on the Guest List, then paste again.
                </p>
              )}
              {result.twice.length > 0 && (
                <p style={{ margin: '4px 0 0' }}>
                  <strong>On your list more than once:</strong> {result.twice.join(', ')}. Seat them one by one above.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
