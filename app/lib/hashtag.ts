// Hashtags as owners type them ("#Sofia & James 2026", " sofiajames ")
// normalized to what social networks accept: letters, numbers and
// underscores, no leading '#'. Returns '' when nothing usable is left.
export const HASHTAG_MAX_LENGTH = 50;

export function normalizeHashtag(input: string | null | undefined): string {
  return (input ?? '')
    .replace(/^[#\s]+/, '')
    .replace(/[^\p{L}\p{N}_]/gu, '')
    .slice(0, HASHTAG_MAX_LENGTH);
}
