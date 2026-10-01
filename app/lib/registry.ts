// Plus: the registry section — a link to the owner's gift registry, an
// optional button label, and a free-text message for anything else guests
// should know. Stored in the user_page.section_2_* columns. Shared by the
// server action and the dashboard form, so no server-only imports.

export const REGISTRY_LINK_MAX = 500;
export const REGISTRY_BUTTON_TEXT_MAX = 40;
export const REGISTRY_MESSAGE_MAX = 1000;

// Only absolute http(s) links: anything else (javascript:, data:, relative
// paths) would be unsafe or broken as a button on a public page.
export function isRegistryLink(value: string): boolean {
  if (value.length > REGISTRY_LINK_MAX) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname;
  } catch {
    return false;
  }
}

// Accepts "myregistry.com/abc" as well as full URLs.
export function normalizeRegistryLink(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
}
