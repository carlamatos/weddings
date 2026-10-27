'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, PencilSquareIcon, PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { saveSeating, saveSeatingTables } from '@/app/lib/actions';
import {
  cleanTableName, nameMatches, nextTableName, tableKey, SEATING_DEFAULT_SEATS, SEATING_MAX_SEATS, SEATING_MAX_TABLES, SEATING_TABLE_MAX,
  type SeatingTable, type TableShape,
} from '@/app/lib/seating';
import { btn, primary, input, card } from './guest-ui';
import { SeatingList, type SeatGuest } from './seating-list';

type Change = { id: string; table: string };
type MapTable = SeatingTable & { guests: SeatGuest[]; people: number };

const UNSEATED = '';
const OFFLINE = { ok: false as const, error: 'Couldn’t save — check your connection and try again.' };
const ACCENT = '#B6584A';
const muted: React.CSSProperties = { fontSize: 13, color: '#6B6470', margin: 0, lineHeight: 1.6 };
const people = (g: SeatGuest) => Math.max(1, g.guests || 1);

// Find Your Table → the seating planner: a map of the tables to drag guests
// onto (or tap a guest, then a table), and a List view of the same seating.
// Owns the seats and the tables and saves both as the host goes.
export function SeatingPlanner({ pageId, guests, initialTables, guestListHref }: {
  pageId: number;
  guests: SeatGuest[];
  initialTables: SeatingTable[];
  guestListHref: string;
}) {
  const [seats, setSeats] = useState<Record<string, string>>(() => Object.fromEntries(guests.map((g) => [g.id, g.table])));
  const [tables, setTables] = useState<SeatingTable[]>(initialTables);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [error, setError] = useState('');
  const [undo, setUndo] = useState<{ text: string; changes: Change[] } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);

  // The saved tables, then any table guests sit at that isn't saved yet.
  const mapTables = useMemo<MapTable[]>(() => {
    const byKey = new Map<string, SeatGuest[]>();
    const firstName = new Map<string, string>();
    for (const g of guests) {
      const t = seats[g.id];
      if (!t) continue;
      const k = tableKey(t);
      byKey.set(k, [...(byKey.get(k) ?? []), g]);
      if (!firstName.has(k)) firstName.set(k, t);
    }
    const listed = new Set(tables.map((t) => tableKey(t.name)));
    const extra: SeatingTable[] = [...firstName.entries()]
      .filter(([k]) => !listed.has(k))
      .map(([, name]) => ({ name, seats: SEATING_DEFAULT_SEATS, shape: 'round' as const }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    return [...tables, ...extra].map((t) => {
      const at = (byKey.get(tableKey(t.name)) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
      return { ...t, guests: at, people: at.reduce((n, g) => n + people(g), 0) };
    });
  }, [guests, seats, tables]);

  function save(changes: Change[], after?: () => void) {
    if (!changes.length) return;
    setError('');
    const previous = Object.fromEntries(changes.map((c) => [c.id, seats[c.id] ?? '']));
    setSeats((s) => ({ ...s, ...Object.fromEntries(changes.map((c) => [c.id, cleanTableName(c.table)])) }));
    startTransition(async () => {
      const res = await saveSeating(pageId, changes).catch(() => OFFLINE);
      if (!res.ok) {
        setSeats((s) => ({ ...s, ...previous }));
        setError(res.error);
        return;
      }
      after?.();
    });
  }

  function saveTables(next: SeatingTable[], after?: () => void) {
    setError('');
    const previous = tables;
    setTables(next);
    startTransition(async () => {
      const res = await saveSeatingTables(pageId, next).catch(() => OFFLINE);
      if (!res.ok) {
        setTables(previous);
        setError(res.error);
        return;
      }
      after?.();
    });
  }

  // The map's tables as they should be saved (an unsaved one becomes saved
  // once the host changes it).
  const savedForm = (list: MapTable[]): SeatingTable[] => list.map(({ name, seats: n, shape }) => ({ name, seats: n, shape }));

  function moveGuest(id: string, table: string) {
    const from = seats[id] ?? '';
    if (tableKey(from) === tableKey(table) && from) return;
    if (!from && !table) return;
    const guest = guests.find((g) => g.id === id);
    save([{ id, table }]);
    setUndo({
      text: table ? `${guest?.name ?? 'Guest'} → ${table}` : `${guest?.name ?? 'Guest'} is no longer seated`,
      changes: [{ id, table: from }],
    });
  }

  function addTables(count: number, seatsEach: number, shape: TableShape = 'round') {
    const next = savedForm(mapTables);
    for (let i = 0; i < count && next.length < SEATING_MAX_TABLES; i++) {
      next.push({ name: nextTableName(next), seats: seatsEach, shape });
    }
    saveTables(next);
  }

  function editTable(oldName: string, changes: SeatingTable, after?: () => void) {
    const name = cleanTableName(changes.name) || oldName;
    const clash = mapTables.some((t) => tableKey(t.name) === tableKey(name) && tableKey(t.name) !== tableKey(oldName));
    if (clash) { setError(`There’s already a table called “${name}”.`); return; }
    const next = savedForm(mapTables).map((t) => (tableKey(t.name) === tableKey(oldName) ? { ...changes, name } : t));
    saveTables(next, after);
    if (name !== oldName) {
      save(guests.filter((g) => tableKey(seats[g.id] ?? '') === tableKey(oldName)).map((g) => ({ id: g.id, table: name })));
    }
  }

  function deleteTable(name: string) {
    saveTables(savedForm(mapTables).filter((t) => tableKey(t.name) !== tableKey(name)));
    const moved = guests.filter((g) => tableKey(seats[g.id] ?? '') === tableKey(name)).map((g) => ({ id: g.id, table: '' }));
    save(moved);
  }

  function renameFromList(from: string, to: string, after?: () => void) {
    const t = mapTables.find((m) => tableKey(m.name) === tableKey(from));
    editTable(from, { name: to, seats: t?.seats ?? SEATING_DEFAULT_SEATS, shape: t?.shape ?? 'round' }, after);
  }

  if (guests.length === 0) {
    return (
      <section style={{ ...card, maxWidth: 760, marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Seat your guests</h2>
        <p style={{ ...muted, marginBottom: 14 }}>
          Guests find their table by the name on your guest list. Add your guests first — import them from a spreadsheet or
          your phone&rsquo;s contacts — then come back to seat them.
        </p>
        <Link href={guestListHref} style={primary}>Go to Guest List</Link>
      </section>
    );
  }

  const seated = guests.filter((g) => seats[g.id]).length;
  const seatCount = mapTables.reduce((n, t) => n + t.seats, 0);

  return (
    <section style={{ ...card, marginBottom: 28, padding: '20px 20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 2px' }}>Seat your guests</h2>
          <p style={muted}>
            {seated} of {guests.length} guests seated · {mapTables.length} {mapTables.length === 1 ? 'table' : 'tables'}
            {seatCount > 0 && <> · {seatCount} seats</>}
          </p>
        </div>
        <div role="tablist" aria-label="View" style={{ display: 'inline-flex', padding: 3, background: '#F4F0EC', borderRadius: 999 }}>
          {(['map', 'list'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              style={{
                padding: '7px 16px', borderRadius: 999, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                background: view === v ? '#fff' : 'transparent', color: view === v ? '#241F2B' : '#6B6470',
                boxShadow: view === v ? '0 1px 3px rgba(36,31,43,0.15)' : 'none',
              }}
            >
              {v === 'map' ? 'Seating map' : 'List'}
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" style={{ fontSize: 13, color: '#8B3A2A', background: '#FBF0EE', borderRadius: 8, padding: '8px 12px', margin: '0 0 14px' }}>{error}</p>}

      {view === 'map' ? (
        <SeatingMap
          guests={guests}
          seats={seats}
          tables={mapTables}
          pending={pending}
          onMove={moveGuest}
          onAddTables={addTables}
          onEditTable={editTable}
          onDeleteTable={deleteTable}
        />
      ) : (
        <SeatingList guests={guests} seats={seats} tableNames={mapTables.map((t) => t.name)} pending={pending} save={save} onRename={renameFromList} />
      )}

      {undo && (
        <div role="status" style={{
          position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 60, display: 'flex', alignItems: 'center', gap: 14,
          background: '#241F2B', color: '#fff', borderRadius: 999, padding: '10px 12px 10px 18px', fontSize: 14, boxShadow: '0 10px 30px rgba(36,31,43,0.3)',
          maxWidth: 'calc(100vw - 32px)',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{undo.text}</span>
          <button type="button" onClick={() => { save(undo.changes); setUndo(null); }}
            style={{ border: 'none', background: '#fff', color: '#241F2B', borderRadius: 999, padding: '5px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Undo
          </button>
        </div>
      )}
    </section>
  );
}

// The element that scrolls the dashboard (.dash-content), for scrolling
// while a guest is dragged near its top or bottom edge.
function scrollerOf(el: HTMLElement | null): HTMLElement {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node;
  }
  return document.scrollingElement as HTMLElement;
}

// What's under the pointer: a table's name, UNSEATED, or null.
function dropTargetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y)?.closest('[data-seat-drop]');
  return el ? el.getAttribute('data-seat-drop') : null;
}

type Drag = { id: string; label: string; x: number; y: number; over: string | null };

function SeatingMap({ guests, seats, tables, pending, onMove, onAddTables, onEditTable, onDeleteTable }: {
  guests: SeatGuest[];
  seats: Record<string, string>;
  tables: MapTable[];
  pending: boolean;
  onMove: (id: string, table: string) => void;
  onAddTables: (count: number, seatsEach: number, shape?: TableShape) => void;
  onEditTable: (oldName: string, table: SeatingTable, after?: () => void) => void;
  onDeleteTable: (name: string) => void;
}) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [hideDeclined, setHideDeclined] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const skipClick = useRef(false);

  // While a guest is being dragged on a touch screen, the page mustn't scroll.
  useEffect(() => {
    const stop = (e: TouchEvent) => { if (dragging.current) e.preventDefault(); };
    document.addEventListener('touchmove', stop, { passive: false });
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPicked(null); };
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('touchmove', stop); document.removeEventListener('keydown', esc); };
  }, []);

  const unseated = guests
    .filter((g) => !seats[g.id])
    .filter((g) => !hideDeclined || g.status !== 'not_attending')
    .filter((g) => !search.trim() || nameMatches(search, g.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const unseatedTotal = guests.filter((g) => !seats[g.id] && (!hideDeclined || g.status !== 'not_attending')).length;
  const pickedGuest = picked ? guests.find((g) => g.id === picked) : undefined;

  // Mouse: drag once the pointer moves. Touch: press and hold, then drag
  // (a quick swipe still scrolls the page). A tap picks the guest instead.
  function startDrag(e: React.PointerEvent, g: SeatGuest) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const touch = e.pointerType !== 'mouse';
    const sx = e.clientX;
    const sy = e.clientY;
    let x = sx;
    let y = sy;
    let started = false;
    const scroller = scrollerOf(rootRef.current);

    const begin = () => {
      started = true;
      dragging.current = true;
      setPicked(null);
      setDrag({ id: g.id, label: g.name, x, y, over: dropTargetAt(x, y) });
    };
    const timer = touch ? window.setTimeout(() => { begin(); navigator.vibrate?.(12); }, 280) : 0;
    const finish = () => {
      clearTimeout(timer);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      dragging.current = false;
    };
    const move = (ev: PointerEvent) => {
      x = ev.clientX;
      y = ev.clientY;
      if (!started) {
        const d = Math.hypot(x - sx, y - sy);
        if (!touch && d > 4) begin();
        else if (touch && d > 10) finish();
        return;
      }
      const rect = scroller.getBoundingClientRect();
      const top = Math.max(rect.top, 0);
      const bottom = Math.min(rect.bottom, window.innerHeight);
      if (y < top + 60) scroller.scrollBy(0, -16);
      else if (y > bottom - 60) scroller.scrollBy(0, 16);
      setDrag((d) => d && { ...d, x, y, over: dropTargetAt(x, y) });
    };
    const up = () => {
      finish();
      if (!started) return;
      const over = dropTargetAt(x, y);
      setDrag(null);
      skipClick.current = true;
      setTimeout(() => { skipClick.current = false; }, 0);
      if (over !== null) onMove(g.id, over);
    };
    const cancel = () => { finish(); setDrag(null); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  }

  function chipClick(e: React.MouseEvent, g: SeatGuest) {
    e.stopPropagation();
    if (skipClick.current) return;
    setPicked((p) => (p === g.id ? null : g.id));
  }

  function placePicked(table: string) {
    if (!picked) return;
    onMove(picked, table);
    setPicked(null);
  }

  const chip = (g: SeatGuest, onTable: boolean) => {
    const isPicked = picked === g.id;
    const isDragged = drag?.id === g.id;
    const dot = g.status === 'attending' ? '#3D6B46' : g.status === 'not_attending' ? '#B6584A' : '#9AA0C8';
    return (
      <span key={g.id} style={{ display: 'inline-flex', alignItems: 'stretch', maxWidth: '100%', opacity: isDragged ? 0.35 : 1 }}>
        <button
          type="button"
          onPointerDown={(e) => startDrag(e, g)}
          onClick={(e) => chipClick(e, g)}
          onContextMenu={(e) => e.preventDefault()}
          aria-pressed={isPicked}
          title={`${g.name}${g.guests > 1 ? ` (party of ${g.guests})` : ''} — drag to a table, or tap and then tap a table`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0, maxWidth: '100%', padding: onTable ? '5px 8px 5px 10px' : '7px 12px',
            borderRadius: onTable ? '999px 0 0 999px' : 999, fontSize: 13, fontWeight: 500, fontFamily: 'inherit', color: '#241F2B',
            borderStyle: 'solid', borderColor: isPicked ? ACCENT : '#E4DDD7', borderWidth: onTable ? '1px 0 1px 1px' : 1,
            backgroundColor: isPicked ? '#FBF0EE' : '#fff', boxShadow: isPicked ? `0 0 0 2px ${ACCENT}33` : '0 1px 2px rgba(36,31,43,0.06)',
            cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'manipulation',
          }}
        >
          <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
          {g.guests > 1 && <span style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', background: '#F4F0EC', borderRadius: 999, padding: '1px 6px', flexShrink: 0 }}>+{g.guests - 1}</span>}
        </button>
        {onTable && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMove(g.id, UNSEATED); }}
            aria-label={`Take ${g.name} off this table`}
            title="Take off this table"
            style={{ display: 'inline-flex', alignItems: 'center', padding: '0 7px', border: '1px solid #E4DDD7', borderLeft: 'none', borderRadius: '0 999px 999px 0', background: '#fff', color: '#9A929F', cursor: 'pointer' }}
          >
            <XMarkIcon style={{ width: 14, height: 14 }} />
          </button>
        )}
      </span>
    );
  };

  const target = (key: string): React.CSSProperties => {
    const over = drag?.over === key;
    const ready = !!drag || !!picked;
    return {
      outline: over ? `2px solid ${ACCENT}` : ready ? `2px dashed ${ACCENT}55` : '2px solid transparent',
      outlineOffset: 2,
      ...(over ? { backgroundColor: '#FBF0EE' } : {}),
      transition: 'outline-color .15s, background .15s',
    };
  };

  return (
    <div ref={rootRef}>
      <p style={{ ...muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span><strong style={{ color: '#241F2B' }}>Drag guests onto a table</strong> — or tap a guest, then tap a table. On a phone, press and hold to drag.</span>
      </p>

      {pickedGuest && (
        <div role="status" style={{ position: 'sticky', top: 8, zIndex: 5, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: '#241F2B', color: '#fff', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 14 }}>
          <span style={{ flex: '1 1 auto' }}>Now tap the table for <strong>{pickedGuest.name}</strong>{seats[pickedGuest.id] ? ' — or tap “Not seated” to take them off their table' : ''}.</span>
          <button type="button" onClick={() => setPicked(null)} style={{ border: '1px solid #fff6', background: 'transparent', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <aside
          data-seat-drop={UNSEATED}
          onClick={() => { if (pickedGuest && seats[pickedGuest.id]) placePicked(UNSEATED); }}
          aria-label="Guests not seated yet"
          style={{
            flex: '1 1 240px', maxWidth: '100%', top: pickedGuest ? 64 : 8, alignSelf: 'flex-start',
            border: '1px solid #EDE8E3', borderRadius: 14, backgroundColor: '#FAF8F6', padding: 14, boxSizing: 'border-box',
            ...target(UNSEATED),
          }}
          className="seat-unseated"
        >
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6470', margin: '0 0 10px' }}>
            Not seated <span style={{ color: '#241F2B' }}>{unseatedTotal}</span>
          </p>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <MagnifyingGlassIcon aria-hidden="true" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9A929F' }} />
            <input type="search" aria-label="Find a guest" placeholder="Find a guest" value={search} onClick={(e) => e.stopPropagation()} onChange={(e) => setSearch(e.target.value)}
              style={{ ...input, width: '100%', boxSizing: 'border-box', paddingLeft: 30, fontSize: 13, background: '#fff' }} />
          </div>
          <label onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B6470', marginBottom: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={hideDeclined} onChange={(e) => setHideDeclined(e.target.checked)} />
            Hide guests who can&rsquo;t come
          </label>
          <div className="seat-unseated-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {unseated.map((g) => chip(g, false))}
            {unseated.length === 0 && (
              <p style={{ ...muted, fontSize: 12 }}>
                {unseatedTotal === 0 ? (pickedGuest ? 'Drop a guest here to take them off their table.' : 'Everyone has a seat. 🎉') : 'No guests match.'}
              </p>
            )}
          </div>
        </aside>

        <div style={{ flex: '999 1 420px', minWidth: 0 }}>
          {tables.length === 0 ? (
            <FirstTables pending={pending} onCreate={onAddTables} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              {tables.map((t) => (
                <TableCard
                  key={t.name}
                  table={t}
                  style={target(t.name)}
                  picking={!!pickedGuest}
                  onPick={() => placePicked(t.name)}
                  chip={chip}
                  onSave={(next, after) => onEditTable(t.name, next, after)}
                  onDelete={() => onDeleteTable(t.name)}
                />
              ))}
              <button
                type="button"
                onClick={() => onAddTables(1, tables[tables.length - 1]?.seats ?? SEATING_DEFAULT_SEATS, tables[tables.length - 1]?.shape)}
                disabled={pending || tables.length >= SEATING_MAX_TABLES}
                style={{
                  minHeight: 200, border: '2px dashed #DDD5CE', borderRadius: 16, background: 'transparent', color: '#6B6470', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                }}
              >
                <PlusIcon style={{ width: 26, height: 26 }} />
                Add a table
              </button>
            </div>
          )}
        </div>
      </div>

      {drag && (
        <div aria-hidden="true" style={{
          position: 'fixed', left: drag.x, top: drag.y, transform: 'translate(-50%, -130%) rotate(-2deg)', zIndex: 80, pointerEvents: 'none',
          background: '#fff', border: `1px solid ${ACCENT}`, color: '#241F2B', borderRadius: 999, padding: '8px 14px', fontSize: 14, fontWeight: 600,
          boxShadow: '0 12px 28px rgba(36,31,43,0.25)', whiteSpace: 'nowrap', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {drag.label}
        </div>
      )}
    </div>
  );
}

// No tables yet: make them all at once.
function FirstTables({ pending, onCreate }: { pending: boolean; onCreate: (count: number, seatsEach: number, shape?: TableShape) => void }) {
  const [count, setCount] = useState('10');
  const [each, setEach] = useState(String(SEATING_DEFAULT_SEATS));
  const n = Math.min(SEATING_MAX_TABLES, Math.max(1, Math.round(Number(count)) || 1));
  const s = Math.min(SEATING_MAX_SEATS, Math.max(1, Math.round(Number(each)) || SEATING_DEFAULT_SEATS));
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onCreate(n, s); }}
      style={{ border: '2px dashed #DDD5CE', borderRadius: 16, padding: '28px 22px', textAlign: 'center' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}><TableArt seats={8} filled={3} shape="round" size={120} /></div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: '#241F2B', margin: '12px 0 4px' }}>Set up your tables</h3>
      <p style={{ ...muted, marginBottom: 16 }}>You can rename them, change the seats and add more any time.</p>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', textAlign: 'left' }}>
          Tables
          <input type="number" min={1} max={SEATING_MAX_TABLES} value={count} onChange={(e) => setCount(e.target.value)} style={{ ...input, display: 'block', width: 90, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', textAlign: 'left' }}>
          Seats at each
          <input type="number" min={1} max={SEATING_MAX_SEATS} value={each} onChange={(e) => setEach(e.target.value)} style={{ ...input, display: 'block', width: 90, marginTop: 4 }} />
        </label>
        <button type="submit" style={primary} disabled={pending}>Create {n} {n === 1 ? 'table' : 'tables'}</button>
      </div>
    </form>
  );
}

function TableCard({ table, style, picking, onPick, chip, onSave, onDelete }: {
  table: MapTable;
  style: React.CSSProperties;
  picking: boolean;
  onPick: () => void;
  chip: (g: SeatGuest, onTable: boolean) => React.ReactNode;
  onSave: (table: SeatingTable, after?: () => void) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(table.name);
  const [seatsText, setSeatsText] = useState(String(table.seats));
  const [shape, setShape] = useState<TableShape>(table.shape);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const over = table.people > table.seats;
  const full = table.people === table.seats;

  function openEdit() {
    setName(table.name);
    setSeatsText(String(table.seats));
    setShape(table.shape);
    setConfirmDelete(false);
    setEditing(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const seats = Math.min(SEATING_MAX_SEATS, Math.max(1, Math.round(Number(seatsText)) || table.seats));
    onSave({ name: cleanTableName(name) || table.name, seats, shape }, () => setEditing(false));
  }

  return (
    <div
      data-seat-drop={table.name}
      onClick={() => { if (picking) onPick(); }}
      style={{
        border: '1px solid #EDE8E3', borderRadius: 16, backgroundColor: '#fff', padding: '12px 12px 14px', display: 'flex', flexDirection: 'column',
        cursor: picking ? 'pointer' : undefined, boxShadow: '0 1px 3px rgba(36,31,43,0.05)', ...style,
      }}
    >
      {editing ? (
        <form onSubmit={submit} onClick={(e) => e.stopPropagation()} style={{ display: 'grid', gap: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}>
            Table name
            <input autoFocus value={name} maxLength={SEATING_TABLE_MAX} onChange={(e) => setName(e.target.value)} style={{ ...input, display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 4, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }} />
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}>
              Seats
              <input type="number" min={1} max={SEATING_MAX_SEATS} value={seatsText} onChange={(e) => setSeatsText(e.target.value)} style={{ ...input, display: 'block', width: 70, marginTop: 4 }} />
            </label>
            <div role="radiogroup" aria-label="Shape" style={{ display: 'inline-flex', border: '1px solid #E4DDD7', borderRadius: 8, overflow: 'hidden' }}>
              {(['round', 'long'] as const).map((s) => (
                <button key={s} type="button" role="radio" aria-checked={shape === s} onClick={() => setShape(s)}
                  style={{ padding: '8px 10px', border: 'none', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', background: shape === s ? '#241F2B' : '#fff', color: shape === s ? '#fff' : '#241F2B' }}>
                  {s === 'round' ? 'Round' : 'Long'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" style={{ ...primary, padding: '7px 14px' }}>Save</button>
            <button type="button" style={{ ...btn, padding: '7px 12px' }} onClick={() => setEditing(false)}>Cancel</button>
          </div>
          {confirmDelete ? (
            <div style={{ background: '#FBF0EE', borderRadius: 10, padding: 10, fontSize: 13, color: '#8B3A2A' }}>
              Delete {table.name}?{table.guests.length > 0 && ` Its ${table.guests.length} ${table.guests.length === 1 ? 'guest goes' : 'guests go'} back to Not seated.`}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" onClick={onDelete} style={{ ...primary, padding: '6px 12px', background: '#8B3A2A' }}>Delete table</button>
                <button type="button" onClick={() => setConfirmDelete(false)} style={{ ...btn, padding: '6px 12px' }}>Keep it</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} style={{ ...btn, border: 'none', background: 'none', padding: 0, color: '#8B3A2A', fontSize: 13, justifySelf: 'start' }}>
              Delete this table
            </button>
          )}
        </form>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); if (picking) onPick(); else openEdit(); }} title={picking ? 'Seat here' : 'Rename, change seats or delete'}
              style={{ flex: '1 1 auto', minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', padding: '2px 0', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#241F2B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{table.name}</span>
              <PencilSquareIcon aria-label="Edit table" style={{ width: 15, height: 15, color: '#9A929F', flexShrink: 0 }} />
            </button>
            <span
              title={over ? 'More guests than seats' : full ? 'Every seat is taken' : `${table.seats - table.people} seats free`}
              style={{
                fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '2px 8px', flexShrink: 0,
                background: over ? '#FBE3DC' : full ? '#EAF2EC' : '#F4F0EC', color: over ? '#A1361F' : full ? '#3D6B46' : '#6B6470',
              }}
            >
              {table.people}/{table.seats}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 10px' }}>
            <TableArt seats={table.seats} filled={table.people} shape={table.shape} size={table.shape === 'long' ? 150 : 118} label={table.name} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 32, alignContent: 'flex-start' }}>
            {table.guests.map((g) => chip(g, true))}
            {table.guests.length === 0 && (
              <p style={{ ...muted, fontSize: 12, width: '100%', textAlign: 'center' }}>{picking ? 'Tap to seat here' : 'Drag guests here'}</p>
            )}
          </div>
          {picking && table.guests.length > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onPick(); }} style={{ ...btn, marginTop: 10, justifyContent: 'center', padding: '6px 10px', fontSize: 13, color: ACCENT, borderColor: `${ACCENT}66` }}>
              Seat here
            </button>
          )}
        </>
      )}
    </div>
  );
}

// A table seen from above: round, or long with seats down both sides. Taken
// seats are filled in.
function TableArt({ seats, filled, shape, size, label }: { seats: number; filled: number; shape: TableShape; size: number; label?: string }) {
  const dot = seats > 16 ? 7 : seats > 10 ? 9 : 11;
  const seatColor = (i: number) => (i < filled ? ACCENT : '#fff');
  const seatBorder = (i: number) => (i < filled ? ACCENT : '#D9CFC8');
  const over = filled > seats;

  if (shape === 'long') {
    const w = size;
    const h = 70;
    const perSide = Math.ceil(seats / 2);
    const tableW = w - 12;
    const dots = Array.from({ length: seats }, (_, i) => {
      const side = i % 2; // alternate top, bottom so seats fill evenly
      const idx = Math.floor(i / 2);
      const n = side === 0 ? perSide : seats - perSide;
      const x = 6 + (tableW / n) * (idx + 0.5);
      return { x, y: side === 0 ? dot / 2 + 1 : h - dot / 2 - 1, i };
    });
    return (
      <div aria-hidden="true" style={{ position: 'relative', width: w, height: h }}>
        <div style={{ position: 'absolute', left: 6, right: 6, top: dot + 5, bottom: dot + 5, borderRadius: 8, background: over ? '#FBE3DC' : '#F4EEE8', border: '1px solid #E4DBD2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', overflow: 'hidden' }}>
          {label && <span style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#6B6470', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
        </div>
        {dots.map((d) => (
          <span key={d.i} style={{ position: 'absolute', left: d.x - dot / 2, top: d.y - dot / 2, width: dot, height: dot, borderRadius: '50%', background: seatColor(d.i), border: `1.5px solid ${seatBorder(d.i)}`, boxSizing: 'border-box' }} />
        ))}
      </div>
    );
  }

  const r = size / 2 - dot / 2 - 1;
  const tableSize = size - dot * 2 - 14;
  return (
    <div aria-hidden="true" style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        position: 'absolute', left: (size - tableSize) / 2, top: (size - tableSize) / 2, width: tableSize, height: tableSize, borderRadius: '50%',
        background: over ? '#FBE3DC' : '#F4EEE8', border: '1px solid #E4DBD2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, boxSizing: 'border-box', overflow: 'hidden',
      }}>
        {label && <span style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#6B6470', textAlign: 'center', lineHeight: 1.2, overflowWrap: 'break-word', maxWidth: '100%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{label}</span>}
      </div>
      {Array.from({ length: seats }, (_, i) => {
        const a = (i / seats) * Math.PI * 2 - Math.PI / 2;
        return (
          <span key={i} style={{
            position: 'absolute', left: size / 2 + r * Math.cos(a) - dot / 2, top: size / 2 + r * Math.sin(a) - dot / 2, width: dot, height: dot,
            borderRadius: '50%', background: seatColor(i), border: `1.5px solid ${seatBorder(i)}`, boxSizing: 'border-box',
          }} />
        );
      })}
    </div>
  );
}
