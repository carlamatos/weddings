// Plus: the live stream section — a link to the owner's stream, shown on the
// page as an embedded player (YouTube, Vimeo, Twitch, Facebook) or as a
// "Watch live" button for anything else (Zoom, Meet, …). Stored in
// user_page_settings under the LIVESTREAM_SETTINGS names. Shared by the
// server action, the dashboard form and the themes, so no server-only imports.

export const LIVESTREAM_URL_MAX = 1000;
export const LIVESTREAM_BUTTON_TEXT_MAX = 40;
export const LIVESTREAM_MESSAGE_MAX = 500;

export const LIVESTREAM_SETTINGS = {
  url: 'livestream_url',
  display: 'livestream_display',
  buttonText: 'livestream_button_text',
  message: 'livestream_message',
} as const;

export type LivestreamDisplay = 'embed' | 'link';

// What a theme renders. embedUrl is set only when the owner chose the player
// and the link is from a service we know how to embed.
export type Livestream = {
  url: string;
  embedUrl?: string;
  buttonText?: string;
  message?: string;
};

// Only absolute http(s) links: anything else (javascript:, data:, relative
// paths) would be unsafe or broken on a public page.
export function isLivestreamLink(value: string): boolean {
  if (!value || value.length > LIVESTREAM_URL_MAX) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname;
  } catch {
    return false;
  }
}

// Accepts a plain link, a link without https://, or the <iframe> embed code
// that YouTube / Vimeo / Facebook hand out (we keep only its src).
export function normalizeLivestreamInput(raw: string): string {
  let value = raw.trim();
  if (!value) return '';
  const iframeSrc = value.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i);
  if (iframeSrc) value = iframeSrc[1].replace(/&amp;/g, '&').trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
}

const YT_ID = /^[A-Za-z0-9_-]{6,20}$/;

function hostIs(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

// The player URL for a link from a service that allows embedding, or null.
// Twitch also needs a `parent=<host>` parameter matching the page it is shown
// on; LivestreamPlayer adds that in the browser.
export function livestreamEmbedUrl(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') {
    return parts[0] && YT_ID.test(parts[0]) ? `https://www.youtube-nocookie.com/embed/${parts[0]}` : null;
  }
  if (hostIs(host, 'youtube.com') || hostIs(host, 'youtube-nocookie.com')) {
    const v = url.searchParams.get('v');
    if (parts[0] === 'watch' && v && YT_ID.test(v)) return `https://www.youtube-nocookie.com/embed/${v}`;
    if (['live', 'embed', 'shorts'].includes(parts[0]) && parts[1] && YT_ID.test(parts[1])) {
      return `https://www.youtube-nocookie.com/embed/${parts[1]}`;
    }
    // A channel's "current live stream" link: youtube.com/channel/UC…/live
    const channel = parts[0] === 'embed' && parts[1] === 'live_stream' ? url.searchParams.get('channel') : parts[0] === 'channel' ? parts[1] : null;
    if (channel && /^UC[A-Za-z0-9_-]{10,40}$/.test(channel)) {
      return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channel}`;
    }
    return null;
  }
  if (host === 'player.vimeo.com') {
    return parts[0] === 'video' && /^\d+$/.test(parts[1] ?? '') ? `https://player.vimeo.com/video/${parts[1]}${url.search}` : null;
  }
  if (hostIs(host, 'vimeo.com')) {
    if (parts[0] === 'event' && /^\d+$/.test(parts[1] ?? '')) return `https://vimeo.com/event/${parts[1]}/embed`;
    const id = parts.find((p) => /^\d+$/.test(p));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === 'player.twitch.tv') {
    const channel = url.searchParams.get('channel');
    const video = url.searchParams.get('video');
    if (channel && /^[A-Za-z0-9_]{2,30}$/.test(channel)) return `https://player.twitch.tv/?channel=${channel}`;
    if (video && /^v?\d+$/.test(video)) return `https://player.twitch.tv/?video=${video}`;
    return null;
  }
  if (hostIs(host, 'twitch.tv')) {
    if (parts[0] === 'videos' && /^\d+$/.test(parts[1] ?? '')) return `https://player.twitch.tv/?video=${parts[1]}`;
    if (parts.length === 1 && /^[A-Za-z0-9_]{2,30}$/.test(parts[0])) return `https://player.twitch.tv/?channel=${parts[0]}`;
    return null;
  }
  if (hostIs(host, 'facebook.com') || host === 'fb.watch') {
    if (parts[0] === 'plugins' && parts[1] === 'video.php') {
      const href = url.searchParams.get('href');
      return href && isLivestreamLink(href) ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false` : null;
    }
    // Only video links; a profile or page link can't be played.
    const isVideo = host === 'fb.watch' || parts.includes('videos') || ['watch', 'reel', 'live'].includes(parts[0] ?? '');
    if (!isVideo || !parts.length) return null;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.toString())}&show_text=false`;
  }
  return null;
}

// The section's theme props: nothing unless the page is paid, the section is
// switched on and a valid link is saved. Settings are re-checked here because
// any setting can be written through updatePageSetting.
export function livestreamFromSettings(settings: Record<string, string>, isPaid: boolean): Livestream | undefined {
  if (!isPaid || settings['show_livestream'] === 'false') return undefined;
  const url = settings[LIVESTREAM_SETTINGS.url] ?? '';
  if (!isLivestreamLink(url)) return undefined;
  const display: LivestreamDisplay = settings[LIVESTREAM_SETTINGS.display] === 'link' ? 'link' : 'embed';
  const embedUrl = display === 'embed' ? livestreamEmbedUrl(url) ?? undefined : undefined;
  return {
    url,
    embedUrl,
    buttonText: settings[LIVESTREAM_SETTINGS.buttonText]?.slice(0, LIVESTREAM_BUTTON_TEXT_MAX) || undefined,
    message: settings[LIVESTREAM_SETTINGS.message]?.slice(0, LIVESTREAM_MESSAGE_MAX) || undefined,
  };
}
