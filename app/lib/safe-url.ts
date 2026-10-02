// Links that hosts type in and guests click (e.g. the "join online" link of a
// virtual event). Only absolute http(s) URLs are kept: javascript:, data: and
// other schemes would be unsafe on a public page.
export function safeHttpUrl(raw: unknown, max = 1000): string {
  if (typeof raw !== 'string') return '';
  const value = raw.trim();
  if (!value || value.length > max) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname ? url.toString() : '';
  } catch {
    return '';
  }
}
