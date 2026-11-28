import { sql } from '@vercel/postgres';

// Where guests come from, which country and on what device, added to
// MyGala's own visit counts (app/lib/page-views.ts): one row per page, day
// and value, counting each visitor once a day, like page_view_days.visitors.
// Cookie-free and banner-free: from the link a visit came through (the
// browser's referrer, reduced to a label such as "WhatsApp"; never the
// address itself), a utm_source in the page's link, the app's own browser
// (Facebook, Instagram…) and the device type from the user agent, and the
// country from Vercel's location header. No IP address, no full referrer, no
// identifier is stored. Server only.

export type BreakdownKind = 'source' | 'country' | 'device';

let tableReady: Promise<unknown> | null = null;
export function ensureBreakdownTable(): Promise<unknown> {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS page_view_breakdown (
      user_page_id INTEGER NOT NULL REFERENCES user_page(id) ON DELETE CASCADE,
      day DATE NOT NULL,
      kind TEXT NOT NULL,
      value TEXT NOT NULL,
      visitors INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_page_id, day, kind, value)
    )
  `.catch((error) => { tableReady = null; throw error; });
  return tableReady;
}

// ─── Source ──────────────────────────────────────────────

// Apps that open links in their own browser say so in the user agent.
const IN_APP: [RegExp, string][] = [
  [/FB_IAB\/MESSENGER|\bOrca\b|MessengerForiOS/i, 'Messenger'],
  [/FBAN|FBAV|FB_IAB/, 'Facebook'],
  [/Instagram/, 'Instagram'],
  [/WhatsApp/i, 'WhatsApp'],
  [/musical_ly|BytedanceWebview|TikTok/i, 'TikTok'],
  [/Snapchat/i, 'Snapchat'],
  [/\bLine\//, 'LINE'],
  [/MicroMessenger/i, 'WeChat'],
  [/Pinterest/i, 'Pinterest'],
  [/LinkedInApp/i, 'LinkedIn'],
  [/Telegram/i, 'Telegram'],
];

// Android apps send android-app://<package>/ as the referrer.
const ANDROID_APPS: Record<string, string> = {
  'com.whatsapp': 'WhatsApp', 'com.whatsapp.w4b': 'WhatsApp',
  'com.facebook.orca': 'Messenger', 'com.facebook.katana': 'Facebook', 'com.facebook.lite': 'Facebook',
  'com.instagram.android': 'Instagram', 'org.telegram.messenger': 'Telegram', 'com.linkedin.android': 'LinkedIn',
  'com.google.android.gm': 'Email', 'com.microsoft.office.outlook': 'Email', 'com.yahoo.mobile.client.android.mail': 'Email',
  'com.google.android.apps.messaging': 'Text message', 'com.android.mms': 'Text message', 'com.samsung.android.messaging': 'Text message',
  'com.zhiliaoapp.musically': 'TikTok', 'com.snapchat.android': 'Snapchat', 'com.pinterest': 'Pinterest',
  'com.google.android.googlequicksearchbox': 'Google search',
};

// Websites, by the end of their hostname.
const SITES: [RegExp, string][] = [
  [/(^|\.)messenger\.com$/, 'Messenger'],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$/, 'Facebook'],
  [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)whatsapp\.com$|^wa\.me$/, 'WhatsApp'],
  [/^t\.co$|(^|\.)x\.com$|(^|\.)twitter\.com$/, 'X'],
  [/^mail\.google\.com$|(^|\.)outlook\.(live|office|office365)\.com$|^mail\.yahoo\.com$|(^|\.)mail\.|^webmail\./, 'Email'],
  [/(^|\.)google\.[a-z.]+$/, 'Google search'],
  [/(^|\.)bing\.com$|(^|\.)duckduckgo\.com$|(^|\.)search\.yahoo\.com$|(^|\.)ecosia\.org$|(^|\.)yandex\.[a-z]+$/, 'Other search'],
  [/^bit\.ly$/, 'bit.ly link'],
  [/(^|\.)pinterest\.[a-z.]+$|^pin\.it$/, 'Pinterest'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'],
  [/^t\.me$|(^|\.)telegram\.org$/, 'Telegram'],
  [/(^|\.)tiktok\.com$/, 'TikTok'],
  [/(^|\.)reddit\.com$/, 'Reddit'],
];

// A utm_source written in the link (?utm_source=whatsapp), tidied.
const UTM: Record<string, string> = {
  whatsapp: 'WhatsApp', wa: 'WhatsApp', facebook: 'Facebook', fb: 'Facebook', messenger: 'Messenger', instagram: 'Instagram', ig: 'Instagram',
  email: 'Email', mail: 'Email', newsletter: 'Email', sms: 'Text message', text: 'Text message', qr: 'QR code', qrcode: 'QR code',
  tiktok: 'TikTok', pinterest: 'Pinterest', linkedin: 'LinkedIn', telegram: 'Telegram', google: 'Google search',
};

export const NO_REFERRER = 'Direct or messaging app';

// The visit's source, as a short label. ownHost: the page's own hostname
// (mygala.ca or the host's domain), so a visit from another MyGala page is
// told apart (e.g. from the guest's personal invitation, /i/…).
export function visitSource(referrer: unknown, utmSource: unknown, userAgent: string | null, ownHost: string): string {
  const utm = typeof utmSource === 'string' ? utmSource.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30) : '';
  if (utm) return UTM[utm] ?? `Link tagged "${utm}"`;
  const ua = userAgent ?? '';
  for (const [re, label] of IN_APP) if (re.test(ua)) return label;
  const ref = typeof referrer === 'string' ? referrer.trim().slice(0, 500) : '';
  if (!ref) return NO_REFERRER;
  const app = /^android-app:\/\/([a-z0-9._]+)/i.exec(ref);
  if (app) return ANDROID_APPS[app[1].toLowerCase()] ?? 'Other app';
  let url: URL;
  try { url = new URL(ref); } catch { return NO_REFERRER; }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const own = ownHost.toLowerCase().replace(/^www\./, '');
  if (host === own || /(^|\.)mygala\.ca$/.test(host)) return url.pathname.startsWith('/i/') ? 'Personal invitation' : 'MyGala';
  for (const [re, label] of SITES) if (re.test(host)) return label;
  return host.slice(0, 60);
}

// ─── Device and country ──────────────────────────────────

export function visitDevice(userAgent: string | null): string {
  const ua = userAgent ?? '';
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'Tablet';
  if (/Mobi|iPhone|iPod|Android|BlackBerry|Opera Mini|IEMobile/i.test(ua)) return 'Phone';
  return 'Computer';
}

// Vercel's two-letter country code; "??" where there's none (local development).
export function visitCountry(headers: Headers): string {
  const code = (headers.get('x-vercel-ip-country') ?? '').toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : '??';
}

// ─── Recording ───────────────────────────────────────────

// One visitor (first visit of the day) more for each of the three. Only
// published pages count, like recordPageView.
export async function recordBreakdown(pageId: number, source: string, country: string, device: string): Promise<void> {
  await ensureBreakdownTable();
  await sql`
    INSERT INTO page_view_breakdown (user_page_id, day, kind, value, visitors)
    SELECT p.id, (NOW() AT TIME ZONE 'America/Vancouver')::date, v.kind, v.value, 1
    FROM user_page p
    CROSS JOIN (VALUES ('source', ${source}::text), ('country', ${country}::text), ('device', ${device}::text)) AS v(kind, value)
    WHERE p.id = ${pageId} AND COALESCE(p.status, 'active') = 'active'
    ON CONFLICT (user_page_id, day, kind, value) DO UPDATE SET visitors = page_view_breakdown.visitors + 1
  `;
}
