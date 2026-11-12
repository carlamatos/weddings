'use client';

import { useCallback, useEffect, useState } from 'react';

type DjSong = { id: string; song_title: string; artist: string; requester_name: string; votes: number; played_at: string | null };

const POLL_MS = 15_000;

// The DJ's song queue: guests' requests sorted by votes, refreshed every few
// seconds. "Played" moves a song to the bottom; tap again to bring it back.
export default function DjBoard({ pageId, djKey, heading }: { pageId: number; djKey: string; heading: string }) {
  const [songs, setSongs] = useState<DjSong[] | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/song-requests/dj?p=${pageId}&k=${djKey}`, { cache: 'no-store' });
      if (res.ok) setSongs(((await res.json()) as { songs: DjSong[] }).songs);
    } catch {
      // Offline for a moment: keep the list we have.
    }
  }, [pageId, djKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the first load, then a refresh every few seconds
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const setPlayed = async (id: string, played: boolean) => {
    setSongs((list) => list && [...list.map((s) => (s.id === id ? { ...s, played_at: played ? new Date().toISOString() : null } : s))]
      .sort((a, b) => Number(!!a.played_at) - Number(!!b.played_at) || b.votes - a.votes));
    await fetch('/api/song-requests/dj', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p: pageId, k: djKey, songId: id, played }) }).catch(() => null);
  };

  const waiting = songs?.filter((s) => !s.played_at) ?? [];
  const played = songs?.filter((s) => s.played_at) ?? [];
  const row = (s: DjSong, i: number, done: boolean) => (
    <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: done ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.08)', opacity: done ? 0.5 : 1 }}>
      <span style={{ width: 34, textAlign: 'right', fontSize: 15, color: 'rgba(255,255,255,.5)', fontVariantNumeric: 'tabular-nums' }}>{done ? '✓' : i + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 19, fontWeight: 600, overflowWrap: 'anywhere', textDecoration: done ? 'line-through' : 'none' }}>{s.song_title}</p>
        <p style={{ margin: '2px 0 0', fontSize: 14, color: 'rgba(255,255,255,.65)' }}>{s.artist ? `${s.artist} · ` : ''}for {s.requester_name}</p>
      </div>
      <span style={{ fontSize: 17, fontWeight: 700, color: '#F3A6B5', minWidth: 48, textAlign: 'right' }} aria-label={`${s.votes} votes`}>♥ {s.votes}</span>
      <button type="button" onClick={() => setPlayed(s.id, !done)} style={{ padding: '10px 14px', borderRadius: 10, border: 0, background: done ? 'rgba(255,255,255,.15)' : '#B6584A', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', minWidth: 92 }}>
        {done ? 'Undo' : 'Played'}
      </button>
    </li>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#15111a', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F3A6B5' }}>Song requests · DJ</p>
        <h1 style={{ margin: '0 0 6px', fontSize: 28, fontFamily: 'Georgia, serif', fontWeight: 500 }}>{heading}</h1>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: 'rgba(255,255,255,.6)' }}>Most-voted first. Updates on its own every few seconds.</p>
        {songs === null ? <p style={{ color: 'rgba(255,255,255,.6)' }}>Loading…</p>
          : songs.length === 0 ? <p style={{ color: 'rgba(255,255,255,.6)' }}>No requests yet. Guests request songs from the event page.</p>
          : (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
              {waiting.map((s, i) => row(s, i, false))}
              {played.map((s, i) => row(s, i, true))}
            </ol>
          )}
      </div>
    </main>
  );
}
