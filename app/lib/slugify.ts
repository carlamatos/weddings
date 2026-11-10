// Letters that don't split into a plain letter plus an accent.
const SPECIAL_LETTERS: Record<string, string> = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', ł: 'l', đ: 'd', ð: 'd', þ: 'th' };

// A page address from an event name ("Ana & Rui's Wedding" → "ana-and-ruis-wedding").
// Accented letters keep their base letter ("Primer año" → "primer-ano",
// "Quinceañera de Sofía" → "quinceanera-de-sofia").
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ßæœøłđðþ]/g, (c) => SPECIAL_LETTERS[c])
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
