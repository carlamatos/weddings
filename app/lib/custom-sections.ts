// Plus-only page content the owner writes themselves: three free-form
// "custom" sections (an optional title plus a stack of text and image blocks)
// and a sponsors list. Shared by the server actions, the dashboard managers
// and the themes, so it holds no server-only imports.

import type { CustomSection, CustomSectionBlock } from './definitions';

export const CUSTOM_SECTION_COUNT = 3;
export const CUSTOM_SECTION_TITLE_MAX = 120;
export const CUSTOM_SECTION_MAX_BLOCKS = 20;
export const CUSTOM_SECTION_TEXT_MAX = 4000;
export const IMAGE_ALT_MAX = 200;

export const SPONSOR_MAX_COUNT = 30;

// Sponsors (Plus) are off unless the host switches them on — unlike most
// sections, which are on by default. Pages that had sponsors before this
// default changed were switched on by POST /api/migrate.
export function areSponsorsOn(settings: Record<string, string>): boolean {
  return settings['show_sponsors'] === 'true';
}
export const SPONSOR_DESCRIPTION_MAX = 280;

// Only images uploaded through /api/upload: Vercel Blob in production, or
// /uploads/ on disk in local development. Anything else could be used to
// point a public page at arbitrary third-party content.
const UPLOADED_IMAGE_RE = /^(https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.blob\.vercel-storage\.com\/[^\s"'<>]+|\/uploads\/[\w.-]+)$/i;

export function isUploadedImageUrl(url: unknown): url is string {
  return typeof url === 'string' && url.length <= 1000 && UPLOADED_IMAGE_RE.test(url);
}

// A sponsor image's background: a plain '#RRGGBB' colour, nothing else.
export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

export function isValidSectionPosition(position: unknown): position is number {
  return typeof position === 'number' && Number.isInteger(position) && position >= 1 && position <= CUSTOM_SECTION_COUNT;
}

// Cleans blocks coming from a client (or the database): unknown shapes and
// empty text are dropped, text is trimmed and capped. Returns null when the
// input isn't a list at all or has too many blocks, so callers can reject it.
export function normalizeBlocks(raw: unknown): CustomSectionBlock[] | null {
  if (!Array.isArray(raw) || raw.length > CUSTOM_SECTION_MAX_BLOCKS) return null;
  const blocks: CustomSectionBlock[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const b = item as Record<string, unknown>;
    if (b.type === 'text' && typeof b.text === 'string') {
      const text = b.text.replace(/\r\n/g, '\n').trim().slice(0, CUSTOM_SECTION_TEXT_MAX);
      if (text) blocks.push({ type: 'text', text });
    } else if (b.type === 'image' && isUploadedImageUrl(b.url)) {
      const alt = typeof b.alt === 'string' ? b.alt.trim().slice(0, IMAGE_ALT_MAX) : '';
      blocks.push(alt ? { type: 'image', url: b.url, alt } : { type: 'image', url: b.url });
    } else {
      return null;
    }
  }
  return blocks;
}

export function emptyCustomSection(position: number): CustomSection {
  return { position, title: '', blocks: [] };
}

// A section is shown only once it has a title or some content.
export function hasCustomSectionContent(section: CustomSection): boolean {
  return !!section.title || section.blocks.length > 0;
}
