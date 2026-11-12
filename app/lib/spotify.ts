// Song search for requests (Live Party), from Spotify's catalogue, so guests
// pick real tracks. Only on when SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET
// are set (an app at developer.spotify.com); otherwise guests type the title
// and artist as before. Uses the client-credentials flow: no Spotify login.
let cached: { token: string; until: number } | null = null;

export function isSpotifyOn(): boolean {
  return !!process.env.SPOTIFY_CLIENT_ID && !!process.env.SPOTIFY_CLIENT_SECRET;
}

async function appToken(): Promise<string | null> {
  if (cached && cached.until > Date.now()) return cached.token;
  const id = process.env.SPOTIFY_CLIENT_ID, secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}` },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, until: Date.now() + (data.expires_in - 60) * 1000 };
  return cached.token;
}

export type SongHit = { title: string; artist: string; image: string | null };

export async function searchSongs(q: string, market = 'CA'): Promise<SongHit[]> {
  const token = await appToken();
  if (!token) return [];
  const url = `https://api.spotify.com/v1/search?type=track&limit=6&market=${market}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) return [];
  const data = (await res.json()) as { tracks?: { items: { name: string; artists: { name: string }[]; album?: { images?: { url: string; width: number }[] } }[] } };
  return (data.tracks?.items ?? []).map((t) => ({
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    image: t.album?.images?.slice(-1)[0]?.url ?? null,
  }));
}
