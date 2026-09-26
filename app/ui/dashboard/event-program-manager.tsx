'use client';

import { useState } from 'react';
import type { EventProgramItem } from '@/app/lib/definitions';
import { addEventProgramItem, updateEventProgramItem, deleteEventProgramItem, type EventProgramItemInput } from '@/app/lib/actions';

function sortItems(items: EventProgramItem[]): EventProgramItem[] {
  return [...items].sort((a, b) => {
    if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
    const at = a.start_time ?? '';
    const bt = b.start_time ?? '';
    return at < bt ? -1 : at > bt ? 1 : 0;
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(time: string | null): string {
  if (!time) return '';
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatTimeRange(item: EventProgramItem): string {
  const start = formatTime(item.start_time);
  const end = formatTime(item.end_time);
  if (start && end) return `${start} – ${end}`;
  return start || end || '—';
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14,
  fontFamily: 'inherit', color: '#241F2B', outline: 'none', width: '100%', boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff',
  fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
};

const btnGhost: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 8, border: '1px solid #EDE8E3', background: '#fff', color: '#241F2B',
  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
};

const cell: React.CSSProperties = { padding: '12px 16px', fontSize: 14, color: '#241F2B', verticalAlign: 'middle' };
const hCell: React.CSSProperties = { ...cell, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', borderBottom: '2px solid #e8e4df', background: '#faf8f6' };

const emptyForm: EventProgramItemInput = { eventDate: '', name: '', startTime: '', endTime: '', location: '' };

const GENERIC_SAVE_ERROR = 'Something went wrong saving that. Please try again.';

export function EventProgramManager({ pageId, initialItems }: { pageId: number; initialItems: EventProgramItem[] }) {
  const [items, setItems] = useState<EventProgramItem[]>(sortItems(initialItems));
  const [form, setForm] = useState<EventProgramItemInput>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventProgramItemInput>(emptyForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.eventDate || !form.name.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await addEventProgramItem(pageId, form);
      if (created) {
        setItems((prev) => sortItems([...prev, created]));
        setForm(emptyForm);
      } else {
        setError(GENERIC_SAVE_ERROR);
      }
    } finally {
      setAdding(false);
    }
  }

  function startEdit(item: EventProgramItem) {
    setError(null);
    setEditingId(item.id);
    setEditForm({
      eventDate: item.event_date,
      name: item.name,
      startTime: item.start_time ?? '',
      endTime: item.end_time ?? '',
      location: item.location ?? '',
    });
  }

  async function saveEdit(id: string) {
    if (!editForm.eventDate || !editForm.name.trim()) return;
    setSavingEdit(true);
    setError(null);
    try {
      const updated = await updateEventProgramItem(Number(id), pageId, editForm);
      if (updated) {
        setItems((prev) => sortItems(prev.map((i) => (i.id === id ? updated : i))));
        setEditingId(null);
      } else {
        setError(GENERIC_SAVE_ERROR);
      }
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const previousItems = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const ok = await deleteEventProgramItem(Number(id), pageId);
    if (!ok) {
      setItems(previousItems);
      setError(GENERIC_SAVE_ERROR);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Add form */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', display: 'block', marginBottom: 4 }}>Date</label>
          <input type="date" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ flex: '2 1 200px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', display: 'block', marginBottom: 4 }}>Phase name</label>
          <input type="text" required placeholder="e.g. Rehearsal dinner" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', display: 'block', marginBottom: 4 }}>Start time</label>
          <input type="time" value={form.startTime ?? ''} onChange={(e) => setForm({ ...form, startTime: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 120px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', display: 'block', marginBottom: 4 }}>End time (optional)</label>
          <input type="time" value={form.endTime ?? ''} onChange={(e) => setForm({ ...form, endTime: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ flex: '2 1 200px' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6470', display: 'block', marginBottom: 4 }}>Location</label>
          <input type="text" placeholder="e.g. The Grand Hotel" value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} style={inputStyle} />
        </div>
        <button type="submit" disabled={adding} style={{ ...btnPrimary, opacity: adding ? 0.6 : 1 }}>
          {adding ? 'Adding…' : 'Add phase'}
        </button>
      </form>

      {error && (
        <p style={{ color: '#B6584A', fontSize: 13, fontWeight: 600, margin: '-16px 0 20px' }}>{error}</p>
      )}

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6B6470', fontSize: 15 }}>
          No phases yet. Add your first one above — e.g. Rehearsal dinner, Ceremony, Reception.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e8e4df' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={hCell}>Date</th>
                <th style={hCell}>Phase</th>
                <th style={hCell}>Time</th>
                <th style={hCell}>Location</th>
                <th style={{ ...hCell, width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const rowBg = i % 2 === 0 ? '#fff' : '#faf8f6';
                if (editingId === item.id) {
                  return (
                    <tr key={item.id} style={{ background: rowBg }}>
                      <td style={cell}><input type="date" value={editForm.eventDate} onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })} style={inputStyle} /></td>
                      <td style={cell}><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} /></td>
                      <td style={cell}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input type="time" value={editForm.startTime ?? ''} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} style={inputStyle} />
                          <input type="time" value={editForm.endTime ?? ''} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} style={inputStyle} />
                        </div>
                      </td>
                      <td style={cell}><input type="text" value={editForm.location ?? ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} style={inputStyle} /></td>
                      <td style={{ ...cell, whiteSpace: 'nowrap' }}>
                        <button onClick={() => saveEdit(item.id)} disabled={savingEdit} style={{ ...btnGhost, marginRight: 6, opacity: savingEdit ? 0.6 : 1 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={btnGhost}>Cancel</button>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={item.id} style={{ background: rowBg }}>
                    <td style={{ ...cell, whiteSpace: 'nowrap' }}>{formatDate(item.event_date)}</td>
                    <td style={{ ...cell, fontWeight: 500 }}>{item.name}</td>
                    <td style={{ ...cell, color: '#6B6470', whiteSpace: 'nowrap' }}>{formatTimeRange(item)}</td>
                    <td style={{ ...cell, color: '#6B6470' }}>{item.location || '—'}</td>
                    <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => startEdit(item)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6470', padding: 4, marginRight: 4 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(item.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B6584A', padding: 4 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
