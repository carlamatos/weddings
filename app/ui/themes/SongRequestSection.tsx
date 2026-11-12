'use client';

import { useEffect, useRef, useState } from 'react';
import { getTranslations } from '@/app/lib/translations';
import { useLiveOptions } from './live-options';
import type { GuestSong } from '@/app/lib/definitions';

interface Labels {
  yourName: string;
  songTitle: string;
  artistLabel: string;
  addSong: string;
  songAdded: string;
  songAddError: string;
  noSongsYet: string;
  requestedBy: string;
  loadMore: string;
  sending: string;
}

// ─── Public-facing: submit form + song list ───────────────────────
interface SongRequestSectionProps {
  userPageId: string;
  initialSongs: GuestSong[];
  initialHasMore: boolean;
  labels: Labels;
  btnClassName?: string;
  inputStyle?: React.CSSProperties;
  disabled?: boolean;
}

export function SongRequestSection({
  userPageId,
  initialSongs,
  initialHasMore,
  labels,
  btnClassName = 'btn',
  inputStyle,
  disabled = false,
}: SongRequestSectionProps) {
  const [songs, setSongs] = useState<GuestSong[]>(initialSongs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const { language } = useLiveOptions();
  const t = getTranslations(language);
  // Votes: the songs this guest voted for, remembered on their phone so the
  // heart stays filled (the server also counts one vote per guest).
  const voteKey = `mygala:votes:${userPageId.slice(0, 24)}`;
  const [voted, setVoted] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage, read after mount
      setVoted(new Set(JSON.parse(localStorage.getItem(voteKey) ?? '[]') as string[]));
    } catch {
      // Storage blocked: hearts start empty.
    }
  }, [voteKey]);
  const vote = async (id: string) => {
    if (disabled || voted.has(id)) return;
    const next = new Set(voted).add(id);
    setVoted(next);
    try { localStorage.setItem(voteKey, JSON.stringify([...next])); } catch { /* storage blocked */ }
    setSongs((list) => list.map((s) => (s.id === id ? { ...s, votes: (s.votes ?? 0) + 1 } : s)));
    try {
      const res = await fetch('/api/song-requests/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: userPageId, songId: id }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.votes === 'number') setSongs((list) => list.map((s) => (s.id === id ? { ...s, votes: data.votes } : s)));
    } catch {
      // The optimistic count stays; the DJ's list has the real one.
    }
  };
  // Spotify suggestions while typing the title (when the keys are set).
  const [hits, setHits] = useState<{ title: string; artist: string; image: string | null }[]>([]);
  const searchOff = useRef(false);
  useEffect(() => {
    if (disabled || searchOff.current || title.trim().length < 2) { setHits([]); return; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/song-requests/search?t=${encodeURIComponent(userPageId)}&q=${encodeURIComponent(title.trim())}`, { signal: ctrl.signal });
        const data = await res.json();
        if (data.enabled === false) { searchOff.current = true; setHits([]); return; }
        setHits(Array.isArray(data.tracks) ? data.tracks : []);
      } catch {
        // Typed by hand, as before.
      }
    }, 300);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [title, userPageId, disabled]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Belt-and-suspenders: the fieldset below already disables every control
    // and blocks native submission, but a preview render should never POST.
    if (disabled) return;
    if (!name.trim() || !title.trim() || !artist.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/song-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPageId, requesterName: name, songTitle: title, artist }),
      });
      const data = await res.json();
      if (data.song) {
        setSongs((prev) => [data.song, ...prev]);
        setName('');
        setTitle('');
        setArtist('');
        showToast(labels.songAdded, true);
      } else {
        showToast(data.error ?? labels.songAddError, false);
      }
    } catch {
      showToast(labels.songAddError, false);
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/song-requests?userPageId=${userPageId}&offset=${songs.length}`);
      const data = await res.json();
      setSongs((prev) => [...prev, ...data.songs]);
      setHasMore(data.hasMore);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  const baseInput: React.CSSProperties = {
    flex: '1 1 140px', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'rgba(255,255,255,0.7)',
    outline: 'none', lineHeight: 'normal', boxSizing: 'border-box', ...inputStyle,
  };

  return (
    <>
      {/* Form */}
      {disabled && (
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6B6470', background: 'rgba(0,0,0,0.05)', border: '1px dashed rgba(0,0,0,0.2)', borderRadius: 6, padding: '10px 14px', margin: '0 0 14px' }}>
          Preview only — songs can be requested from your live page.
        </p>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: 28 }}>
        {/* A native fieldset disables every control inside it (including via
            keyboard) — more robust than disabling each input individually. */}
        <fieldset disabled={disabled} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', border: 0, margin: 0, padding: 0 }}>
          <input
            type="text"
            placeholder={labels.yourName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ ...baseInput, flex: '2 1 160px' }}
          />
          <div style={{ position: 'relative', flex: '2 1 160px', display: 'flex' }}>
            <input
              type="text"
              placeholder={labels.songTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="off"
              style={{ ...baseInput, flex: '1 1 auto' }}
            />
            {hits.length > 0 && (
              <ul role="listbox" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, margin: '4px 0 0', padding: 4, listStyle: 'none', background: '#fff', color: '#241F2B', borderRadius: 10, boxShadow: '0 12px 30px rgba(0,0,0,.18)', textAlign: 'left' }}>
                {hits.map((h, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => { setTitle(h.title); setArtist(h.artist); setHits([]); searchOff.current = false; }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '6px 8px', border: 0, background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 8, font: 'inherit', color: 'inherit' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {h.image ? <img src={h.image} alt="" width={36} height={36} style={{ borderRadius: 4, flexShrink: 0 }} /> : <span style={{ width: 36 }} />}
                      <span style={{ minWidth: 0 }}><strong style={{ display: 'block', fontSize: 14 }}>{h.title}</strong><span style={{ fontSize: 12, opacity: 0.7 }}>{h.artist}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="text"
            placeholder={labels.artistLabel}
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            style={{ ...baseInput, flex: '1 1 120px' }}
          />
          <button
            type="submit"
            className={btnClassName}
            disabled={submitting}
            style={{ flexShrink: 0 }}
          >
            {submitting ? labels.sending : labels.addSong}
          </button>
        </fieldset>
      </form>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? '#3D6B46' : '#B6584A', color: '#fff',
          padding: '10px 20px', borderRadius: 8, fontSize: 14, zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)', whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      {/* List */}
      {songs.length === 0 ? (
        <p style={{ opacity: 0.5, fontSize: 15 }}>{labels.noSongsYet}</p>
      ) : (
        <>
          <div className="song-list">
            {songs.map((s) => (
              <div key={s.id} className="song-row">
                <div style={{ minWidth: 0 }}>
                  <span className="title">{s.song_title}</span>
                  {s.artist && <>{' · '}<span className="artist">{s.artist}</span></>}
                  <div style={{ fontSize: 12, opacity: 0.6 }}>{labels.requestedBy} {s.requester_name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => vote(s.id)}
                  disabled={disabled || voted.has(s.id)}
                  aria-label={t.songVote}
                  title={t.songVote}
                  style={{ flexShrink: 0, marginLeft: 12, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, border: '1px solid currentColor', background: voted.has(s.id) ? 'rgba(182,88,74,.12)' : 'transparent', color: 'inherit', font: 'inherit', fontSize: 13, fontWeight: 600, cursor: disabled || voted.has(s.id) ? 'default' : 'pointer', opacity: 0.85 }}
                >
                  <span aria-hidden="true">{voted.has(s.id) ? '♥' : '♡'}</span>{s.votes ?? 0}
                </button>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                type="button"
                className={btnClassName}
                disabled={loadingMore}
                onClick={loadMore}
                style={{ opacity: loadingMore ? 0.6 : 1 }}
              >
                {loadingMore ? '…' : labels.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── Dashboard: view + delete ─────────────────────────────────────
interface DashboardSongRequestsProps {
  initialSongs: GuestSong[];
  initialHasMore: boolean;
  userPageId: string;
}

export function DashboardSongRequests({ initialSongs, initialHasMore, userPageId }: DashboardSongRequestsProps) {
  const [songs, setSongs] = useState<GuestSong[]>(initialSongs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const deleteSong = async (id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/song-requests?id=${id}`, { method: 'DELETE' });
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/song-requests?userPageId=${userPageId}&offset=${songs.length}`);
      const data = await res.json();
      setSongs((prev) => [...prev, ...data.songs]);
      setHasMore(data.hasMore);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  if (songs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6B6470', fontSize: 15 }}>
        No song requests yet. Once guests submit requests they will appear here.
      </div>
    );
  }

  const cell: React.CSSProperties = { padding: '12px 16px', fontSize: 14, color: '#241F2B', verticalAlign: 'middle' };
  const hCell: React.CSSProperties = { ...cell, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', borderBottom: '2px solid #e8e4df', background: '#faf8f6' };

  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e8e4df' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui, sans-serif' }}>
          <thead>
            <tr>
              <th style={hCell}>Guest Name</th>
              <th style={hCell}>Song</th>
              <th style={hCell}>Artist</th>
              <th style={hCell}>Date</th>
              <th style={hCell}>Time</th>
              <th style={hCell}>IP</th>
              <th style={{ ...hCell, width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((s, i) => {
              const dt = new Date(s.created_at);
              const rowBg = i % 2 === 0 ? '#fff' : '#faf8f6';
              return (
                <tr key={s.id} style={{ background: rowBg }}>
                  <td style={{ ...cell, fontWeight: 500 }}>{s.requester_name}</td>
                  <td style={cell}>{s.song_title}</td>
                  <td style={{ ...cell, color: '#6B6470', fontStyle: 'italic' }}>{s.artist}</td>
                  <td style={{ ...cell, color: '#6B6470', whiteSpace: 'nowrap' }}>
                    {dt.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ ...cell, color: '#6B6470', whiteSpace: 'nowrap' }}>
                    {dt.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ ...cell, color: '#6B6470', fontSize: 12 }}>{s.ip_address ?? '—'}</td>
                  <td style={{ ...cell, textAlign: 'center' }}>
                    <button
                      onClick={() => deleteSong(s.id)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B6584A', padding: 4, display: 'flex', alignItems: 'center' }}
                    >
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

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            type="button"
            disabled={loadingMore}
            onClick={loadMore}
            style={{ padding: '10px 28px', borderRadius: 8, border: '1.5px solid #ccc', background: '#fff', cursor: loadingMore ? 'default' : 'pointer', fontSize: 14, color: '#241F2B', opacity: loadingMore ? 0.6 : 1, fontFamily: 'system-ui, sans-serif' }}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
}
