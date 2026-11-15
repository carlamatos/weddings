// Song search for requests (Live Party), from Apple's iTunes Search API, so
// guests pick real tracks. Free, with no key or account; Apple allows roughly
// 20 calls a minute, so answers are cached for a while and, once Apple says
// "too many", searching pauses for a minute (guests type the song by hand
// meanwhile, as before).

export type SongHit = { title: string; artist: string; image: string | null };

const CACHE_MS = 30 * 60 * 1000;
const CACHE_MAX = 500;
const BACKOFF_MS = 60 * 1000;

const cache = new Map<string, { hits: SongHit[]; until: number }>();
let pausedUntil = 0;

type ItunesTrack = { trackName?: string; artistName?: string; artworkUrl100?: string; artworkUrl60?: string };

export async function searchSongs(q: string, country = 'CA'): Promise<SongHit[]> {
  const key = `${country}:${q.toLowerCase()}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.until > now) return cached.hits;
  if (pausedUntil > now) return [];

  const url = `https://itunes.apple.com/search?media=music&entity=song&limit=15&country=${country}&term=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
  if (res.status === 403 || res.status === 429) {
    pausedUntil = now + BACKOFF_MS;
    return [];
  }
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: ItunesTrack[] };
  // The same song often comes back once per album it's on: keep the first.
  const seen = new Set<string>();
  const hits: SongHit[] = [];
  for (const t of data.results ?? []) {
    if (!t.trackName || !t.artistName) continue;
    const id = `${t.trackName}|${t.artistName}`.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    hits.push({ title: t.trackName, artist: t.artistName, image: t.artworkUrl100 ?? t.artworkUrl60 ?? null });
    if (hits.length === 6) break;
  }

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
  cache.set(key, { hits, until: now + CACHE_MS });
  return hits;
}
